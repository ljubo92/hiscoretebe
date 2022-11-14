import mongoose, { Document, Schema } from 'mongoose';

export interface IToken {
    token: string;
    createdAt: Date;
}

export interface ITokenModel extends IToken, Document {}

const TokenSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

export default mongoose.model<ITokenModel>('Token', TokenSchema);
