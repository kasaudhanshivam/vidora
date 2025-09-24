import express from 'express';
import {createServer} from 'node:http';

import mongoose from 'mongoose';
import cors from 'cors';
import { connectToSocket } from './controllers/socketManager.js';

import userRoutes from './routes/usersRoutes.js';
import dotenv from "dotenv";



// const corsOptions = {
//     origin: process.env.CLIENT_URL,
//     credentials: true
// };



dotenv.config();
console.log(process.env.PORT);

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.set('port', process.env.PORT);
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json({ limit: '40kb' }));
app.use(express.urlencoded({ limit: '40kb', extended: true }));

app.use('/api/v1/users', userRoutes);

const start = async () => {
    app.set('mongo_user');

    const dbConnection = await mongoose.connect(process.env.mongoURI);
    console.log(`Database connected to ${dbConnection.connection.host}`);
    server.listen(app.get('port'), () => {
        console.log(`Server is running on port ${app.get('port')}`);
    });
}

start();