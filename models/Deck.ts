import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeck extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    tags: string[];
    category?: string;
    visibility: "private" | "public";
    price?: number;
    authorName: string;
    isDeleted: boolean;
    cardCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const DeckSchema = new Schema<IDeck>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, "Deck title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (tags: string[]) {
                    return tags.length <= 10;
                },
                message: "Cannot have more than 10 tags",
            },
        },
        category: {
            type: String,
            trim: true,
        },
        visibility: {
            type: String,
            enum: ["private", "public"],
            default: "private",
        },
        price: {
            type: Number,
            default: 0,
        },
        authorName: {
            type: String,
            default: "Unknown",
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        cardCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
DeckSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const Deck: Model<IDeck> =
    mongoose.models.Deck || mongoose.model<IDeck>("Deck", DeckSchema);

export default Deck;
