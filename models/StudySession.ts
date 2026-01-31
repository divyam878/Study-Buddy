import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudySession extends Document {
    userId: mongoose.Types.ObjectId;
    deckId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    duration: number; // in seconds
    cardsReviewed: number;
    mode: "standard" | "exam";
    score?: number; // Only for exams
    totalQuestions?: number; // Only for exams
    correctAnswers: number;
    incorrectAnswers: number;
    pomodoroCount: number;
    isActive: boolean;
    createdAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        deckId: {
            type: Schema.Types.ObjectId,
            ref: "Deck",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number,
            default: 0,
            min: 0,
        },
        cardsReviewed: {
            type: Number,
            default: 0,
            min: 0,
        },
        mode: {
            type: String,
            enum: ["standard", "exam"],
            default: "standard",
        },
        score: {
            type: Number,
        },
        totalQuestions: {
            type: Number,
        },
        correctAnswers: {
            type: Number,
            default: 0,
            min: 0,
        },
        incorrectAnswers: {
            type: Number,
            default: 0,
            min: 0,
        },
        pomodoroCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for querying user sessions
StudySessionSchema.index({ userId: 1, createdAt: -1 });

const StudySession: Model<IStudySession> =
    mongoose.models.StudySession ||
    mongoose.model<IStudySession>("StudySession", StudySessionSchema);

export default StudySession;
