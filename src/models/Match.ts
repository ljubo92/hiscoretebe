import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch {
    player1: string;
    player2: string;
    username1: string;
    username2: string;
    elo1: number;
    elo2: number;
    elochange1: number;
    elochange2: number;
    confirmed1: boolean;
    confirmed2: boolean;
    winner: number;
    userid: string;
    eloDistributed: boolean;
    challengerId: string;
    confirmedBy: string;
    challengerName: string;
}

export interface IMatchModel extends IMatch, Document {}

const MatchSchema: Schema = new Schema(
    {
        player1: { type: String, required: true },
        player2: { type: String, required: true },
        username1: { type: String, required: true },
        username2: { type: String, required: true },
        elo1: { type: Number, required: true },
        elo2: { type: Number, required: true },
        elochange1: { type: Number, required: false },
        elochange2: { type: Number, required: false },
        winner: { type: Number, required: false },
        confirmed1: { type: Boolean, required: false },
        confirmed2: { type: Boolean, required: false },
        eloDistributed: { type: Boolean, required: false },
        challengerId: { type: String, required: false },
        confirmedBy: { type: String, required: false },
        challengerName: { type: String, required: false }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export default mongoose.model<IMatchModel>('Match', MatchSchema);
