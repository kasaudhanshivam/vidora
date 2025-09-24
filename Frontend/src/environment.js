let IS_PROD = true;
const serverURL = IS_PROD ?
    "https://vidora-server.onrender.com/api/v1/users" :

    "http://localhost:8000/api/v1/users"


const socketURL = IS_PROD ?
    "https://vidora-server.onrender.com" :
    "http://localhost:8000";

const iceServer = "stun:stun.l.google.com:19302";

export default { serverURL, socketURL, iceServer };