import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.MONGO_USERNAME);

const MONGO_URL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.paxr48v.mongodb.net`;

const SERVER_PORT = process.env.PORT || 1337;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    }
};
