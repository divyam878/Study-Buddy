"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Deck from "@/models/Deck";
import Flashcard from "@/models/Flashcard";
import { revalidatePath } from "next/cache";

export async function createDeck(data: {
    title: string;
    description?: string;
    tags?: string[];
    category?: string;
    visibility?: "private" | "public";
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const deck = await Deck.create({
            userId: session.user.id,
            title: data.title,
            description: data.description,
            tags: data.tags || [],
            category: data.category,
            visibility: data.visibility || "private",
            authorName: session.user.name || "Unknown",
        });

        revalidatePath("/decks");
        return { success: true, deck: JSON.parse(JSON.stringify(deck)) };
    } catch (error) {
        console.error("Create deck error:", error);
        return { error: "Failed to create deck" };
    }
}

export async function updateDeck(
    deckId: string,
    data: {
        title?: string;
        description?: string;
        tags?: string[];
        category?: string;
    }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const deck = await Deck.findOneAndUpdate(
            { _id: deckId, userId: session.user.id, isDeleted: false },
            data,
            { new: true }
        );

        if (!deck) {
            return { error: "Deck not found" };
        }

        revalidatePath("/decks");
        revalidatePath(`/decks/${deckId}`);
        return { success: true, deck: JSON.parse(JSON.stringify(deck)) };
    } catch (error) {
        console.error("Update deck error:", error);
        return { error: "Failed to update deck" };
    }
}

export async function deleteDeck(deckId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const deck = await Deck.findOneAndUpdate(
            { _id: deckId, userId: session.user.id },
            { isDeleted: true },
            { new: true }
        );

        if (!deck) {
            return { error: "Deck not found" };
        }

        // Soft delete all flashcards in this deck
        await Flashcard.updateMany(
            { deckId: deckId },
            { isDeleted: true }
        );

        revalidatePath("/decks");
        return { success: true };
    } catch (error) {
        console.error("Delete deck error:", error);
        return { error: "Failed to delete deck" };
    }
}

export async function getDecks(page = 1, filters?: {
    search?: string;
    tags?: string[];
    category?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const limit = 20;
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {
            userId: session.user.id,
            isDeleted: false,
        };

        if (filters?.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: "i" } },
                { description: { $regex: filters.search, $options: "i" } },
            ];
        }

        if (filters?.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }

        if (filters?.category) {
            query.category = filters.category;
        }

        const [decks, total] = await Promise.all([
            Deck.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Deck.countDocuments(query),
        ]);

        return {
            success: true,
            decks: JSON.parse(JSON.stringify(decks)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Get decks error:", error);
        return { error: "Failed to fetch decks" };
    }
}

export async function getDeck(deckId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const deck = await Deck.findOne({
            _id: deckId,
            userId: session.user.id,
            isDeleted: false,
        }).lean();

        if (!deck) {
            return { error: "Deck not found" };
        }

        return { success: true, deck: JSON.parse(JSON.stringify(deck)) };
    } catch (error) {
        console.error("Get deck error:", error);
        return { error: "Failed to fetch deck" };
    }
}
