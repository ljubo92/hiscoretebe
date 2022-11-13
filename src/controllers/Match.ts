import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Match from '../models/Match';
import Player from '../models/Player';

const createMatch = async (req: Request, res: Response, next: NextFunction) => {
    const { sockserver } = require('../server');

    const { player1, player2, winner, challengerId, challengerName, confirmedBy, confirmed1, confirmed2, username1, username2, elo1, elo2 } = req.body;

    console.log(challengerId);

    const match = new Match({
        _id: new mongoose.Types.ObjectId(),
        player1,
        player2,
        username1,
        username2,
        elo1,
        elo2,
        elochange1: 0,
        elochange2: 0,
        winner: winner || undefined,
        confirmed1: confirmed1 || false,
        confirmed2: confirmed2 || false,
        eloDistributed: false,
        challengerId,
        confirmedBy,
        challengerName: challengerName
    });

    const newMatch = await match
        .save()
        .then((match) => res.status(201).json({ match }))
        .catch((error) => res.status(500).json({ error }));

    //Skicka meddelande till Frontend att en uppdatering har skett
    await sockserver.clients.forEach((client) => {
        const data = JSON.stringify('MATCHES HAVE UPDATED');
        console.log('hej');

        client.send(data);
    });

    return newMatch;
};

const readAllMyMatches = (req: Request, res: Response, next: NextFunction) => {
    const userid = req.params.userid;

    return Match.find({ $or: [{ player1: userid }, { player2: userid }] })
        .then((match) => (match ? res.status(200).json({ match }) : res.status(404).json({ message: 'NotFound' })))
        .catch((error) => res.status(500).json({ error }));
};

const readMatch = (req: Request, res: Response, next: NextFunction) => {
    const matchId = req.params.matchId;

    return Match.findById(matchId)
        .then((match) => (match ? res.status(200).json({ match }) : res.status(404).json({ message: 'NotFound' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Match.find()
        .then((matchs) => res.status(200).json({ matchs }))
        .catch((error) => res.status(500).json({ error }));
};

const updateMatch = async (req: Request, res: Response, next: NextFunction) => {
    const matchId = req.params.matchId;
    const { sockserver } = require('../server');
    let result = {};

    await Match.findById(matchId)
        .then(async (match) => {
            if (match) {
                match.set(req.body).save();
            } else {
                return res.status(404).json({ message: 'NotFound' });
            }
        })
        .then((rest) => {
            const allPlayers = Player.find().then(async (players) => {
                const match = await Match.findById(matchId);
                if (match) {
                    const { highestEloPlayer, lowestEloPlayer, highestElo, lowestElo } =
                        match.elo1 > match.elo2
                            ? {
                                  highestEloPlayer: match.player1,
                                  lowestEloPlayer: match.player2,
                                  highestElo: match.elo1 + match.elochange1,
                                  lowestElo: match.elo2 + match.elochange2
                              }
                            : {
                                  highestEloPlayer: match.player2,
                                  lowestEloPlayer: match.player1,
                                  highestElo: match.elo2 + match.elochange2,
                                  lowestElo: match.elo1 + match.elochange1
                              };

                    const updatedRankHighestEloPlayer = players.filter((x) => x.elo >= highestElo).length;

                    Player.findById(highestEloPlayer).then((player) => {
                        if (player) {
                            player
                                .set({
                                    rank: updatedRankHighestEloPlayer,
                                    elo: highestElo
                                })
                                .save();
                        }
                    });

                    const updatedRankLowestEloPlayer = players.filter((x) => x.elo >= lowestElo).length;

                    Player.findById(lowestEloPlayer).then((player) => {
                        if (player) {
                            player
                                .set({
                                    rank: updatedRankLowestEloPlayer + 1,
                                    elo: lowestElo
                                })
                                .save();
                        }
                    });

                    await match
                        .set({
                            elo1: highestEloPlayer === match.player1 ? highestElo : lowestElo,
                            elo2: highestEloPlayer !== match.player1 ? highestElo : lowestElo
                        })
                        .save()
                        .then(async (match) => {
                            return res.status(201).json({ match });
                        })
                        .catch((error) => res.status(500).json({ error }));

                    console.log(result);
                    sockserver.clients.forEach((client) => {
                        const data = JSON.stringify('MATCHES HAVE UPDATED');
                        console.log('test');

                        client.send(data);
                    });
                }
            });
        });
};

const deleteMatch = (req: Request, res: Response, next: NextFunction) => {
    const matchId = req.params.matchId;

    return Match.findByIdAndDelete(matchId).then((match) => (match ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })));
};

export default { createMatch, readMatch, readAllMyMatches, readAll, updateMatch, deleteMatch };
