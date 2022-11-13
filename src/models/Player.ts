import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer {
    username: string;
    password: string;
    elo: number;
    eloRecord: Array<number>;
    rank: number;
}

export interface IPlayerModel extends IPlayer, Document {}

const PlayerSchema: Schema = new Schema(
    {
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        elo: { type: Number, required: false },
        email: { type: String, required: false },
        eloRecord: { type: Array, required: false },
        rank: { type: Number, required: false }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<IPlayerModel>('Player', PlayerSchema);
