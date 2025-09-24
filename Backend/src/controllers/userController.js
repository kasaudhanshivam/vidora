import bcrypt, {hash} from 'bcrypt';
import httpStatus from 'http-status';
import crypto from 'crypto';
import {User} from '../models/userModels.js';
import { Meeting } from '../models/meetingModel.js';


const login = async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({message: 'Username and password are required'});
    }

    try {
        const user = await User.findOne({username});
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: 'User not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Invalid password'});
        }
        let token = crypto.randomBytes(20).toString('hex');
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({message: 'Login successful', token: token , userId: user._id, name: user.name});
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal server error'});
    }
}

const register = async (req, res) => {
    const {name, username, password } = req.body;
    try {
        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(httpStatus.FOUND).json({message: 'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(httpStatus.CREATED).json({message: 'User registered successfully'});


    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(httpStatus.FOUND).json({message: 'Internal server error'});
    }
}


const getUserHistory = async (req, res) => {
    const {token} = req.query;

    try {
        const user = await User.findOne({token : token });
        const meetings = await Meeting.find({ user_id: user.username });

        return res.status(httpStatus.OK).json({ history: meetings });
    } catch (error) {
        console.error("Error fetching user history:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}
    
const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    console.log(token, meeting_code);

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meeting_code: meeting_code,
            date: Date.now()
        });
        await newMeeting.save();
        res.status(httpStatus.OK).json({ message: 'Meeting added to history' });
    } catch (error) {
        console.error("Error adding meeting to history:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};

export { login, register, getUserHistory, addToHistory };