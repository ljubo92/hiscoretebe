import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Player from '../models/Player';
import Token from '../models/Token';

const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs'); // import bcrypt to hash passwords
const jwt = require('jsonwebtoken'); // import jwt to sign tokens
const { SECRET = 'secret' } = process.env;

const passwordResetLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await Player.findOne({ email: req.body.email });

        if (!user) return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });

        if (!token) {
            token = await new Token({
                userId: user._id,
                token: await jwt.sign({ username: user.username }, SECRET)
            }).save();
        }

        const link = `https://hiscoretefe.web.app/password-reset?id=${user._id}&token=${token.token}&user=${user.username}`;
        await sendEmail(user.email, 'Password reset', link);

        res.send('password reset link sent to your email account');
    } catch (error) {
        res.send('An error occured');
        console.log(error);
    }
};
const passwordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await Player.findById(req.params.userId);
        if (!user) return res.status(400).send('invalid link or expired');

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        });
        if (!token) return res.status(400).send('Invalid link or expired');

        user.password = await bcrypt.hash(req.body.password, 10);
        await user.save();
        await token.delete();

        res.send('password reset sucessfully.');
    } catch (error) {
        res.send('An error occured');
    }
};

const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, firstname, surname, email, elo } = req.body;

    const player = new Player({
        username,
        _id: new mongoose.Types.ObjectId(),
        password: (password && (await bcrypt.hash(req.body.password, 10))) || '',
        email,
        elo: 1000,
        eloRecord: []
    });

    return player
        .save()
        .then((player) => res.status(201).json({ player }))
        .catch((error) => res.status(500).json({ error }));
};

const readPlayer = (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username;

    return Player.find({ username: username }, { password: 0, email: 0 })
        .then((player) => (player ? res.status(200).json({ player: player.length > 0 ? player[0] : {} }) : res.status(404).json({ message: 'NotFound' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Player.find({}, { password: 0, email: 0 })
        .then((players) => res.status(200).json({ players }))
        .catch((error) => res.status(500).json({ error }));
};

const updatePlayer = (req: Request, res: Response, next: NextFunction) => {
    const playerId = req.params.playerId;

    return Player.findById(playerId).then((player) => {
        if (player) {
            player.set(req.body);

            return player
                .save()
                .then((player) => res.status(201).json({ player }))
                .catch((error) => res.status(500).json({ error }));
        } else {
            return res.status(404).json({ message: 'NotFound' });
        }
    });
};

const updatePlayerElo = (req: Request, res: Response, next: NextFunction) => {
    const playerId = req.params.playerId;
    const eloChange = req.body.elochange;

    return Player.findById(playerId).then((player) => {
        if (player) {
            player.set({
                elo: player.elo + eloChange,
                eloRecord: [...player.eloRecord, eloChange]
            });
            return player
                .save()
                .then((player) => res.status(201).json({ player }))
                .catch((error) => res.status(500).json({ error }));
        } else {
            return res.status(404).json({ message: 'NotFound' });
        }
    });
};

const deletePlayer = (req: Request, res: Response, next: NextFunction) => {
    const playerId = req.params.playerId;

    return Player.findByIdAndDelete(playerId).then((player) => (player ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })));
};
const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // check if the user exists
        const user = await Player.findOne({ username: req.body.username });
        if (user) {
            //check if password matches
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
                // sign token and send it in response
                const token = await jwt.sign({ username: user.username }, SECRET);
                res.json({
                    token,
                    username: user.username,
                    elo: user.elo,
                    _id: user._id,
                    rank: user.rank
                });
            } else {
                res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
};

export default { createPlayer, readPlayer, readAll, updatePlayer, updatePlayerElo, deletePlayer, signIn, passwordReset, passwordResetLink };
