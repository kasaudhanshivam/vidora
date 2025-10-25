import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import "../styles/videoMeet.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import env from '../environment';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import ChatModal from '../pages/ChatModal.jsx';

const server_url = env.socketURL;

var connections = {};



const peerConfigConnections = {
    "iceServers": [
        { "urls": env.iceServer }
    ]
}

export default function VideoMeet2() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    const navigate = useNavigate();

    let [videos, setVideos] = useState([])


    const [cooldown, setCooldown] = useState(false); // To disable button temporarily
    const [countdown, setCountdown] = useState(0);   // For optional visual timer
    const [messageCount, setMessageCount] = useState(0);
    const [lastMessage, setLastMessage] = useState("");


    // TODO
    // if(isChrome() === false) {
    //     alert("Screen Sharing is only supported in Google Chrome. Please use Google Chrome to share your screen.");
    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)


            // Rate Limiting and Spam Prevention Feedback from Server
            socketRef.current.on('chat-error', (errorMsg) => {
                toast.warn(`${errorMsg}!`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                // alert(errorMsg);



                setCooldown(true);
                setCountdown(15); // For showing countdown on the button

                let timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setCooldown(false); // Re-enable button
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            });

            socketRef.current.on('chat-spam', (errorMsg) => {
                toast.warn(`${errorMsg}!`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                // alert(errorMsg);
            });

            socketRef.current.on('chat-toxic', (errorMsg) => {
                toast.warn(`${errorMsg}!`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                // alert(errorMsg);
            });



            // socketRef.current.on('user-left', (id) => {
            //     setVideos((videos) => videos.filter((video) => video.socketId !== id))
            // })

            socketRef.current.on('user-left', (id) => {
                console.log("User left, removing video for:", id);

                // Close the peer connection properly
                if (connections[id]) {
                    try {
                        connections[id].close();
                    } catch (e) {
                        console.log("Error closing connection:", e);
                    }
                    delete connections[id];
                }

                // Remove from videos state - force complete removal
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => {
                        const shouldRemove = video.socketId !== id;
                        if (!shouldRemove) {
                            console.log("Removing video for socket:", id);
                        }
                        return shouldRemove;
                    });

                    // Update the ref to match
                    videoRef.current = updatedVideos;
                    console.log("Videos after removal:", updatedVideos.map(v => v.socketId));
                    return updatedVideos;
                });
            });

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)



                    // Add connection state monitoring
                    connections[socketListId].onconnectionstatechange = function (event) {
                        console.log(`Connection state for ${socketListId}:`, connections[socketListId].connectionState);
                        if (connections[socketListId].connectionState === 'failed') {
                            console.log("Connection failed for:", socketListId);
                            // Remove failed connection
                            setTimeout(() => {
                                setVideos(videos => videos.filter(video => video.socketId !== socketListId));
                            }, 1000);
                        }
                    };

                    connections[socketListId].oniceconnectionstatechange = function (event) {
                        console.log(`ICE connection state for ${socketListId}:`, connections[socketListId].iceConnectionState);
                    };


                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("Stream received for:", socketListId, event.stream);

                        // Check if stream is valid
                        if (!event.stream || event.stream.getTracks().length === 0) {
                            console.log("Empty stream received for:", socketListId);
                            return;
                        }

                        setVideos(videos => {
                            // Check if video already exists
                            const existingIndex = videos.findIndex(v => v.socketId === socketListId);

                            if (existingIndex >= 0) {
                                // Update existing video
                                const updatedVideos = [...videos];
                                updatedVideos[existingIndex] = {
                                    ...updatedVideos[existingIndex],
                                    stream: event.stream,
                                    timestamp: Date.now() // Force re-render
                                };
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            } else {
                                // Add new video
                                const newVideo = {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    autoplay: true,
                                    playsinline: true,
                                    timestamp: Date.now()
                                };
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        // window.location.href = "/home"
        navigate("/home");
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };


    //  no restriction on message sending
    // let sendMessage = () => {
    //     console.log(socketRef.current);
    //     if (!message.trim()) return;
    //     socketRef.current.emit('chat-message', message, username);
    //     setMessage("");
    // };

    let sendMessage = (messageText) => {
        console.log(socketRef.current);
        if (!messageText.trim()) return;
        socketRef.current.emit('chat-message', messageText, username);
    };




    // with 5 seconds restriction on message sending

    // with 3 messages in 10 seconds restriction on message sending

    //  (content-based spam check)

    // Reset lastMessage after 15 seconds to allow re-sending old messages






    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    useEffect(() => {
        const chatDisplay = document.querySelector('.chattingDisplay');
        if (chatDisplay) {
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
        }
    }, [messages]);


    // Add this with your other useEffects
    useEffect(() => {
        console.log("🔄 Videos state updated - Count:", videos.length, "IDs:", videos.map(v => v.socketId));
    }, [videos]);


    // Add this with your other useEffects
    useEffect(() => {
        return () => {
            // Cleanup when component unmounts
            console.log("🧹 Cleaning up all connections on unmount");
            Object.keys(connections).forEach(id => {
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });

            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Clear videos state
            setVideos([]);
        };
    }, []);



    return (
        <div className='videoMeetPage'>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            {askForUsername === true ?

                <div className='localVideoContainer'>

                    <div className="navLocal">
                        <h2 onClick={() => {
                            window.location.href = "/"
                        }}>Vidora!</h2>
                    </div>

                    <h2 className='enter'>Enter to the Lobby</h2>
                    <div className='localButtons'>
                        <TextField id="filled-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="filled" />
                        <Button variant="contained" onClick={connect}>Connect</Button>
                    </div>


                    <div className='localVideoDisplay'>
                        <video className='localVideo' ref={localVideoref} autoPlay muted></video>
                    </div>

                </div> :


                <div className="meetVideoContainer">

                    {showModal && (
                        <ChatModal
                            messages={messages}
                            onSendMessage={sendMessage}
                            onClose={() => setModal(false)}
                            newMessages={newMessages}
                            cooldown={cooldown}
                            countdown={countdown}
                            username={username}
                        />
                    )}


                    <div className="buttonContainers">
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        <IconButton id='hang' onClick={handleEndCall}>
                            <CallEndIcon />
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                {showModal ? <ChatIcon /> : <SpeakerNotesOffIcon />}
                            </IconButton>
                        </Badge>

                    </div>


                    <video className="meetUserVideo" ref={localVideoref} autoPlay muted></video>

                    <div className="conferenceView">
                        {videos.map((video) => (
                            <div className='view' key={`video-${video.socketId}`}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref) {
                                            if (video.stream) {
                                                ref.srcObject = video.stream;
                                            } else {
                                                // Clear the video if no stream
                                                ref.srcObject = null;
                                            }
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted={video.socketId === socketIdRef.current}
                                />
                            </div>
                        ))}
                    </div>

                </div>

            }

        </div>
    )
}