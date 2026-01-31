import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewHistory extends Document {
    userId: mongoose.Types.ObjectId;
    cardId: mongoose.Types.ObjectId;
    deckId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    rating: number;
    wasCorrect: boolean;
    timeSpent: number;
    reviewedAt: Date;
}

const ReviewHistorySchema = new Schema<IReviewHistory>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        cardId: {
            type: Schema.Types.ObjectId,
            ref: "Flashcard",
            required: true,
            index: true,
        },
        deckId: {
            type: Schema.Types.ObjectId,
            ref: "Deck",
            required: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: "StudySession",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        wasCorrect: {
            type: Boolean,
            required: true,
        },
        timeSpent: {
            type: Number,
            required: true,
            min: 0,
        },
        reviewedAt: {
            type: Date,
            required: true,
            default: () => new Date(),
            index: true,
        },
    },
    {
        timestamps: false,
    }
);

// Compound indexes for analytics queries
ReviewHistorySchema.index({ userId: 1, reviewedAt: -1 });
ReviewHistorySchema.index({ cardId: 1, reviewedAt: -1 });

const ReviewHistory: Model<IReviewHistory> =
    mongoose.models.ReviewHistory ||
    mongoose.model<IReviewHistory>("ReviewHistory", ReviewHistorySchema);

export default ReviewHistory;
