import express, { application } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import playerRoutes from './routes/Player';
import matchRoutes from './routes/Match';
const morgan = require('morgan');
const { log } = require('mercedlogger');
const cors = require('cors');
require('dotenv').config(); // load .env variables

const router = express();
/**Connect to mongoose */

mongoose
    .connect(config.mongo.url, {
        retryWrites: true,
        w: 'majority',
        autoIndex: true
    })
    .then(() => {
        Logging.info('Connected to mongoDB');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect: ');
        Logging.error(error);
    });

/** Only start the server if Mongo Connects */

const StartServer = () => {
    // const server = router.use((req, res, next) => {
    //     /**Log the Request */
    //     Logging.info(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    //     res.on('finish', () => {
    //         Logging.info(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
    //     });
    //     next();
    // });

    // const { Server } = require('ws');
    // const sockserver = new Server({ port: process.env.PORT || 443 });
    // sockserver.on('connection', (ws) => {
    //     console.log('New client connected!');
    //     ws.on('close', () => console.log('Client has disconnected!'));
    // });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /**Rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Autorization');

        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    /**Routes */

    router.use('/players', playerRoutes);
    router.use('/match', matchRoutes);
    router.get('/', (req, res) => res.status(200).json({ message: 'tja' }));
    /**Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /**Error Handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);
        return res.status(404).json({ message: error.message });
    });

    const server = http.createServer(router).listen(config.server.port, () => Logging.info(`server is running on port' ${config.server.port}.`));

    const { Server } = require('ws');
    const sockserver = new Server({ server }).on('connection', (ws) => {
        console.log('New client connected!');
        ws.on('close', () => console.log('Client has disconnected!'));
    });

    module.exports.sockserver = sockserver;
};
