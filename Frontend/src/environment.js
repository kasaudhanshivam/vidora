let IS_PROD = false;
const serverURL = IS_PROD ?
    "https://apnacollegebackend.onrender.com" :

    "http://localhost:8000/api/v1/users"


const socketURL = IS_PROD ?
    "https://apnacollegebackend.onrender.com" :
    "http://localhost:8000";

const iceServer = "stun:stun.l.google.com:19302";

export default { serverURL, socketURL, iceServer };