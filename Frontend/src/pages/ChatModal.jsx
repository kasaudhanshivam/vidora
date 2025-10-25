import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

const ChatModal = React.memo(({ 
  messages, 
  onSendMessage, 
  onClose, 
  newMessages,
  cooldown,
  countdown,
  username
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="chatRoom">
      <div className="chatContainer">
        <h2>Messages</h2>
        <div className="chattingDisplay">
          {messages.length !== 0 ? (
            messages.map((item, index) => {
              const isSelf = item.sender === username;
              return (
                <div
                  key={index}
                  className={`messageBubble ${isSelf ? 'messageSelf' : 'messageOther'}`}
                >
                  {!isSelf && <p className="messageSender">{item.sender}</p>}
                  <p>{item.data}</p>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#777" }}>No Messages Yet</p>
          )}
        </div>
        <div className="chattingArea">
          <TextField 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            id="outlined-basic" 
            label="Type something..."
            variant="outlined" 
          />
          <Button
            variant='contained'
            onClick={handleSend}
            disabled={cooldown}
          >
            {cooldown ? (
              <>
                <AccessAlarmIcon style={{ marginRight: "5px" }} />
                {countdown}s
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});


export default ChatModal;