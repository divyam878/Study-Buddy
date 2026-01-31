"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import Deck from "@/models/Deck";
import { revalidatePath } from "next/cache";

export async function createFlashcard(
    deckId: string,
    data: {
        question: string;
        answer: string;
        cardType?: "flashcard" | "mcq";
        options?: string[];
        correctAnswerIndex?: number;
    }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        // Verify deck ownership
        const deck = await Deck.findOne({
            _id: deckId,
            userId: session.user.id,
            isDeleted: false,
        });

        if (!deck) {
            return { error: "Deck not found" };
        }

        const flashcard = await Flashcard.create({
            deckId,
            userId: session.user.id,
            question: data.question,
            answer: data.answer,
            cardType: data.cardType || "flashcard",
            options: data.options || [],
            correctAnswerIndex: data.correctAnswerIndex,
            // Initial SM-2 values
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: new Date(),
        });

        // Update deck card count
        await Deck.findByIdAndUpdate(deckId, {
            $inc: { cardCount: 1 },
        });

        revalidatePath(`/decks/${deckId}`);
        return { success: true, flashcard: JSON.parse(JSON.stringify(flashcard)) };
    } catch (error) {
        console.error("Create flashcard error:", error);
        return { error: "Failed to create flashcard" };
    }
}

export async function updateFlashcard(
    flashcardId: string,
    data: {
        question?: string;
        answer?: string;
    }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const flashcard = await Flashcard.findOneAndUpdate(
            { _id: flashcardId, userId: session.user.id, isDeleted: false },
            data,
            { new: true }
        );

        if (!flashcard) {
            return { error: "Flashcard not found" };
        }

        revalidatePath(`/decks/${flashcard.deckId}`);
        return { success: true, flashcard: JSON.parse(JSON.stringify(flashcard)) };
    } catch (error) {
        console.error("Update flashcard error:", error);
        return { error: "Failed to update flashcard" };
    }
}

export async function deleteFlashcard(flashcardId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const flashcard = await Flashcard.findOneAndUpdate(
            { _id: flashcardId, userId: session.user.id },
            { isDeleted: true },
            { new: true }
        );

        if (!flashcard) {
            return { error: "Flashcard not found" };
        }

        // Update deck card count
        await Deck.findByIdAndUpdate(flashcard.deckId, {
            $inc: { cardCount: -1 },
        });

        revalidatePath(`/decks/${flashcard.deckId}`);
        return { success: true };
    } catch (error) {
        console.error("Delete flashcard error:", error);
        return { error: "Failed to delete flashcard" };
    }
}

export async function getFlashcards(deckId: string, page = 1) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        // Verify deck ownership
        const deck = await Deck.findOne({
            _id: deckId,
            userId: session.user.id,
            isDeleted: false,
        });

        if (!deck) {
            return { error: "Deck not found" };
        }

        const limit = 50;
        const skip = (page - 1) * limit;

        const [flashcards, total] = await Promise.all([
            Flashcard.find({ deckId, isDeleted: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Flashcard.countDocuments({ deckId, isDeleted: false }),
        ]);

        return {
            success: true,
            flashcards: JSON.parse(JSON.stringify(flashcards)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Get flashcards error:", error);
        return { error: "Failed to fetch flashcards" };
    }
}
