import { Server, Socket } from 'socket.io';
import stringSimilarity from "string-similarity";
import axios from "axios";
import { Filter } from "bad-words";
import dotenv from "dotenv";


dotenv.config();



const SIMILARITY_THRESHOLD = 0.85; // 85% similar messages considered spam




const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_URL = process.env.PERSPECTIVE_URL;

const analyzeMessage = async (message) => {
    try {
        const response = await axios.post(
            `${PERSPECTIVE_URL}?key=${PERSPECTIVE_API_KEY}`,
            {
                comment: { text: message },
                languages: ["en", "hi"],
                requestedAttributes: {
                    TOXICITY: {},
                    SPAM: {},
                    INSULT: {},
                    THREAT: {},
                },
            }
        );

        return response.data.attributeScores;
    } catch (error) {
        console.error("Perspective API Error:", error.response?.data || error.message);
        return null;
    }
};





const filter = new Filter();
// we can add custom banned words
filter.addWords("bsdk", "mc", "bc", "chutiya", "madarchod", "randi", "lund", "gandu");



let connections = {};
let messages = {};
let timeOnLine = {};
let roomModes = {};  // (normal or restricted)


// --- NEW: Spam tracking
const messageTracker = {};
const MAX_MESSAGES = 3;           // Max allowed messages in time window
const TIME_WINDOW = 10 * 1000;    // 10 seconds
const BLOCK_DURATION = 15 * 1000; // Block for 15 seconds after spam



export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on('connection', (Socket) => {

        // console.log("Someone connected to socket");
        // Initialize spam tracker for this socket
        // messageTracker[Socket.id] = { timestamps: [], blockedUntil: null };
        messageTracker[Socket.id] = {
            timestamps: [],
            blockedUntil: null,
            lastMessage: "",
            lastMessageTime: 0
        };

        // Host creates a room and decides chat mode
        Socket.on("create-room", ({ roomId, chatMode, hostId }) => {
            // chatMode = 'normal' or 'restricted'
            roomModes[roomId] = {
                mode: chatMode,
                hostId
            };
            console.log(`Room ${roomId} created with mode: ${chatMode}`);
        });



        // Socket.on('join-call', (path) => {

        //     if (connections[path] === undefined) {
        //         connections[path] = [];
        //     }
        //     connections[path].push(Socket.id);

        //     timeOnLine[Socket.id] = new Date();

        //     // Notify existing users
        //     for (let a = 0; a < connections[path].length; a++) {
        //         io.to(connections[path][a]).emit('user-joined', Socket.id, connections[path]);
        //     }

        //     // Send previous chat history to new user
        //     if (messages[path] !== undefined) {
        //         for (let b = 0; b < messages[path].length; b++) {
        //             io.to(Socket.id).emit('chat-message', messages[path][b]['data'], messages[path][b]['sender'], messages[path][b]['Socket-id-sender']);
        //         }
        //     }

        // })


        Socket.on('join-call', (path) => {
            // Extract just the room ID from the path
            const roomId = path.split('/').pop();

            if (connections[roomId] === undefined) {
                connections[roomId] = [];
            }
            connections[roomId].push(Socket.id);

            timeOnLine[Socket.id] = new Date();

            // Notify existing users - use roomId instead of path
            for (let a = 0; a < connections[roomId].length; a++) {
                io.to(connections[roomId][a]).emit('user-joined', Socket.id, connections[roomId]);
            }

            // Send previous chat history to new user - use roomId instead of path
            if (messages[roomId] !== undefined) {
                for (let b = 0; b < messages[roomId].length; b++) {
                    io.to(Socket.id).emit('chat-message', messages[roomId][b]['data'], messages[roomId][b]['sender'], messages[roomId][b]['Socket-id-sender']);
                }
            }
        })

        Socket.on('signal', (toId, message) => {
            io.to(toId).emit('signal', Socket.id, message);
        })

        // No Restrictions 
        // Socket.on('chat-message', (data, sender) => {
        //     const [matchingRoom, found] = Object.entries(connections)
        //         .reduce(([room, isFound], [rooKey, roomValue]) => {
        //             if (!isFound && roomValue.includes(Socket.id)) {
        //                 return [rooKey, true];
        //             }
        //             return [room, isFound];
        //         }, ['', false]);

        //     if (found === true) {
        //         if (messages[matchingRoom] === undefined) {
        //             messages[matchingRoom] = [];
        //         }
        //         messages[matchingRoom].push({ 'data': data, 'sender': sender, 'Socket-id-sender': Socket.id });

        //         console.log('messages:', messages, sender, data);

        //         connections[matchingRoom].forEach((elem) => {
        //             io.to(elem).emit('chat-message', data, sender, Socket.id);
        //         })
        //     }

        // })


        // With Spam Restrictions 
        Socket.on("chat-message", async (data, sender) => {
            const now = Date.now();
            const userData = messageTracker[Socket.id];
            const cleanMessage = data.trim().toLowerCase();


            // --- Detect which room this socket belongs to ---
            // const [matchingRoom, found] = Object.entries(connections).reduce(
            //     ([room, isFound], [roomKey, roomValue]) => {

            //         if (!isFound && roomValue.includes(Socket.id)) {
            //             return [roomKey, true];
            //         }
            //         return [room, isFound];
            //     },
            //     ["", false]
            // );


            let [matchingRoom, found] = Object.entries(connections).reduce(
                ([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(Socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                },
                ["", false]
            );

            // Clean the room key
            // if (matchingRoom.includes("/")) {
            //     matchingRoom = matchingRoom.split("/").pop();
            // }









            console.log("Connections object:", connections);
            console.log("Socket.id:", Socket.id);
            console.log("Detected room for this socket:", matchingRoom);

            if (!found) return;

            // --- Check if room is in restricted mode ---
            console.log("roomModes object:", roomModes);
            const isRestricted = roomModes[matchingRoom]?.mode === "restricted";
            console.log("Room:", matchingRoom, "Restricted:", isRestricted);


            if (isRestricted) {



                // Check if user is blocked
                if (userData.blockedUntil && now < userData.blockedUntil) {
                    Socket.emit("chat-error", "You are temporarily blocked for spamming. Wait a few seconds.");
                    return;
                }



                // --- Content-based spam check (duplicate detection) ---
                if (
                    cleanMessage === userData.lastMessage &&
                    now - userData.lastMessageTime < TIME_WINDOW
                ) {
                    Socket.emit("chat-spam", "Please don't send the same message repeatedly!");
                    return;
                }

                // --- Fuzzy matching to detect near-duplicate messages ---   
                // Similarity check 
                if (
                    userData.lastMessage &&
                    stringSimilarity.compareTwoStrings(cleanMessage, userData.lastMessage) > SIMILARITY_THRESHOLD
                    && now - userData.lastMessageTime < TIME_WINDOW
                ) {
                    Socket.emit("chat-spam", "Your message is too similar to the previous one!");
                    return;
                }

                // --- Profanity filter check ---
                if (filter.isProfane(data)) {
                    Socket.emit("chat-toxic", "Your message contains inappropriate language.");
                    return;
                }


                // AI Moderation Check
                const scores = await analyzeMessage(cleanMessage);
                if (scores) {
                    const toxicity = scores.TOXICITY.summaryScore.value;
                    const spam = scores.SPAM.summaryScore.value;
                    const insult = scores.INSULT.summaryScore.value;
                    const threat = scores.THREAT.summaryScore.value;

                    console.log("AI Moderation Scores:", { toxicity, spam, insult, threat });

                    // Customize thresholds
                    if (toxicity > 0.8) {
                        Socket.emit("chat-error", "Your message is too toxic to be sent!");
                        return;
                    }
                    if (spam > 0.7) {
                        Socket.emit("chat-error", "Your message looks like spam.");
                        return;
                    }
                    if (insult > 0.8) {
                        Socket.emit("chat-error", "Your message contains insults.");
                        return;
                    }
                    if (threat > 0.6) {
                        Socket.emit("chat-error", "Threatening messages are not allowed!");
                        return;
                    }
                }





                // Filter out old timestamps
                userData.timestamps = userData.timestamps.filter((ts) => now - ts < TIME_WINDOW);

                // If limit exceeded, block user
                if (userData.timestamps.length >= MAX_MESSAGES) {
                    userData.blockedUntil = now + BLOCK_DURATION;
                    userData.lastMessage = ""; // Reset duplicate tracker after block
                    Socket.emit("chat-error", "Too many messages! Please don't spam. Wait a few seconds.");
                    return;
                }

                // Only push timestamp if message is NOT duplicate
                userData.timestamps.push(now);

                // Track this message for duplicate detection
                userData.lastMessage = cleanMessage;
                userData.lastMessageTime = now;


            }






            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    data: data,
                    sender: sender,
                    "Socket-id-sender": Socket.id,
                });

                console.log("messages:", messages, sender, data);

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, Socket.id);
                });
            }
        });









        Socket.on('disconnect', () => {
            var diffTime = Math.abs(new Date() - timeOnLine[Socket.id]);

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (var i = 0; i < v.length; i++) {
                    if (v[i] === Socket.id) {
                        key = k;

                        for (var j = 0; j < connections[key].length; j++) {
                            io.to(connections[key][j]).emit('user-left', Socket.id);
                        }

                        var index = connections[key].indexOf(Socket.id);

                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                            delete messages[key];
                            delete roomModes[key]; // Clean up room mode when empty
                        }
                    }
                }
            }

            // Cleanup spam tracker
            delete messageTracker[Socket.id];

        });

    })

    return io;
}