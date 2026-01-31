"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Deck from "@/models/Deck";

export async function getPublicDecks(
    page: number = 1,
    limit: number = 20,
    search?: string
) {
    try {
        await dbConnect();

        const query: Record<string, unknown> = {
            isDeleted: false,
            visibility: "public",
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const decks = await Deck.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Deck.countDocuments(query);

        return {
            success: true,
            decks: JSON.parse(JSON.stringify(decks)),
            pagination: {
                page,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Get public decks error:", error);
        return { error: "Failed to fetch public decks" };
    }
}

export async function cloneDeck(deckId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        // Find the original deck
        const originalDeck = await Deck.findById(deckId);
        if (!originalDeck) {
            return { error: "Deck not found" };
        }

        // Clone the deck
        const newDeck = await Deck.create({
            userId: session.user.id,
            title: `${originalDeck.title} (Clone)`,
            description: originalDeck.description,
            tags: originalDeck.tags,
            category: originalDeck.category,
            visibility: "private", // Cloned decks are private by default
            authorName: session.user.name || "Unknown",
        });

        return { success: true, deckId: newDeck._id.toString() };
    } catch (error) {
        console.error("Clone deck error:", error);
        return { error: "Failed to clone deck" };
    }
}
