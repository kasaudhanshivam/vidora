import { useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import '../styles/home.css'
import home from '../assets/meetHome.svg';
import { IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { InputAdornment } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import io from "socket.io-client";
import env from '../environment';

function Home() {

    const navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");
    const { addToHistory } = useContext(AuthContext);
    const [mode, setMode] = useState("join"); // "join" or "host"
    const [disabled, setDisabled] = useState(false);
    const [msg, setMsg] = useState("");
    const [url, setUrl] = useState("");
    const [chatCategory, setChatCategory] = useState("normal"); // "normal" or "restricted"


    // const handleJoinVideoCall = async () => {
    //     await addToHistory(meetingCode);
    //     navigate(`/${meetingCode}`)
    // }



    const socket = io(env.socketURL);
    const server_url = env.server;

    const handleJoinVideoCall = async () => {
        if (mode === "join") {
            await addToHistory(meetingCode);
            navigate(`/${meetingCode}`);
        } else {
            const newMeetingCode = Math.random().toString(36).substring(2, 8); // generate random code
            await addToHistory(newMeetingCode);


            // Save room info in backend (via API or socket)
            socket.emit("create-room", {
                roomId: newMeetingCode,
                chatMode: chatCategory, // "normal" or "restricted"
                hostId: localStorage.getItem("token")
            });

            console.log("chatCategory:", chatCategory);



            setMeetingCode(newMeetingCode);
            setDisabled(true);
            setMsg("Share the meeting ID or url with others to join.");
            setMode("join");
        }
    }







    return (
        <div className='homeContainer'>
            <div className='nav'>
                <h2 onClick={() => {
                    window.location.href = "/"
                }}>Vidora!</h2>
                {/* <div className='side'>
                    <p role='button' onClick={() => navigate('/history')}><span><IconButton><RestoreIcon /></IconButton></span>History</p>
                    <p role='button' onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/auth');
                    }}>Logout</p>
                </div> */}
                <div className='side'>
                    <button
                        className="nav-simple-btn"
                        onClick={() => navigate('/history')}
                    >
                        <RestoreIcon className="nav-icon" />
                        History
                    </button>

                    <button
                        className="nav-simple-btn logout-btn"
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/auth');
                        }}
                    >
                        Logout
                    </button>
                </div>


            </div>
            <div className='mainContainer'>
                <div className='leftPanel'>
                    <p className='title'>Providing Quality Video Call Just Like Quality Education !</p>

                    <div className='leftPanelButtons'>
                        <div className='modeToggle'>
                            <Button
                                variant={mode === "join" ? "contained" : "outlined"}
                                onClick={() => {
                                    setMode("join")
                                    setMsg("")
                                    setUrl("")
                                    setDisabled(false)
                                    setMeetingCode("")
                                }}
                            >
                                Join
                            </Button>
                            <Button
                                variant={mode === "host" ? "contained" : "outlined"}
                                onClick={() => {
                                    setMode("host")
                                    setMsg("")
                                    setUrl("")
                                    setDisabled(false)
                                    setMeetingCode("")
                                }}
                            >
                                Host
                            </Button>
                        </div>

                        <div className="meetingIDContainer">
                            {mode === "join" && (
                                <TextField
                                    id="filled-basic"
                                    label="Meeting ID"
                                    variant="filled"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    disabled={disabled} // optional
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton id='copy-icon-button'
                                                    onClick={() => {
                                                        if (!meetingCode) return;
                                                        const meetingLink = `${window.location.origin}/${meetingCode}`;
                                                        navigator.clipboard.writeText(meetingLink);
                                                        alert("Meeting link copied!");
                                                    }}
                                                    edge="end"
                                                >
                                                    <ContentCopyIcon id="content-copy-icon" style={{ fontSize: '20px', color: 'black' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}

                            {mode === "host" && (
                                <TextField
                                    select mode
                                    label=""
                                    value={chatCategory}
                                    onChange={(e) => setChatCategory(e.target.value)}
                                    SelectProps={{ native: true }}
                                    variant="outlined"
                                    style={{ backgroundColor: 'white', borderRadius: '4px', color: 'red' }}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="restricted">Spam Restricted</option>
                                </TextField>
                            )}

                            <Button variant="contained" onClick={handleJoinVideoCall}>
                                {mode === "join" ? "Join" : "Host the meeting"}
                            </Button>

                            {msg && (
                                <div className="infoMessage">
                                    <p style={{ color: 'yellow' }}>{msg}</p>
                                    {url && (
                                        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                <div className='rightPanel'>
                    <img src={home} alt="meethome" />
                </div>
            </div>
        </div>
    )
}


export default withAuth(Home)