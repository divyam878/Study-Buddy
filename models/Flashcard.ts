import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFlashcard extends Document {
    deckId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    cardType: "flashcard" | "mcq";
    options?: string[]; // For MCQs
    correctAnswerIndex?: number; // For MCQs

    // Spaced Repetition Fields (SM-2 Algorithm)
    easeFactor: number;
    interval: number;
    repetitions: number;
    lastReviewed?: Date;
    nextReview: Date;

    // Performance Tracking
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;

    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>(
    {
        deckId: {
            type: Schema.Types.ObjectId,
            ref: "Deck",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        question: {
            type: String,
            required: [true, "Question is required"],
            trim: true,
        },
        answer: {
            type: String,
            required: [true, "Answer is required"],
            trim: true,
        },
        cardType: {
            type: String,
            enum: ["flashcard", "mcq"],
            default: "flashcard",
        },
        options: {
            type: [String],
            default: [],
        },
        correctAnswerIndex: {
            type: Number,
        },

        // SM-2 Algorithm Fields
        easeFactor: {
            type: Number,
            default: 2.5,
            min: 1.3,
        },
        interval: {
            type: Number,
            default: 0,
            min: 0,
        },
        repetitions: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastReviewed: {
            type: Date,
        },
        nextReview: {
            type: Date,
            default: () => new Date(),
            index: true,
        },

        // Performance Metrics
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        correctCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        incorrectCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
FlashcardSchema.index({ deckId: 1, isDeleted: 1 });
FlashcardSchema.index({ userId: 1, nextReview: 1, isDeleted: 1 });

const Flashcard: Model<IFlashcard> =
    mongoose.models.Flashcard ||
    mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);

export default Flashcard;
