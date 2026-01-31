"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import StudySession from "@/models/StudySession";
import ReviewHistory from "@/models/ReviewHistory";
import Deck from "@/models/Deck";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { revalidatePath } from "next/cache";

export async function startStudySession(deckId: string) {
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

        const studySession = await StudySession.create({
            userId: session.user.id,
            deckId,
            startTime: new Date(),
            isActive: true,
        });

        return { success: true, sessionId: studySession._id.toString() };
    } catch (error) {
        console.error("Start study session error:", error);
        return { error: "Failed to start study session" };
    }
}

export async function submitCardReview(
    cardId: string,
    sessionId: string,
    quality: number,
    timeSpent: number
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const flashcard = await Flashcard.findOne({
            _id: cardId,
            userId: session.user.id,
            isDeleted: false,
        });

        if (!flashcard) {
            return { error: "Flashcard not found" };
        }

        // Calculate next review using SM-2 algorithm
        const reviewResult = calculateNextReview(flashcard, quality);
        const wasCorrect = quality >= 3;

        // Update flashcard with new spaced repetition values
        await Flashcard.findByIdAndUpdate(cardId, {
            easeFactor: reviewResult.easeFactor,
            interval: reviewResult.interval,
            repetitions: reviewResult.repetitions,
            nextReview: reviewResult.nextReview,
            lastReviewed: new Date(),
            $inc: {
                reviewCount: 1,
                correctCount: wasCorrect ? 1 : 0,
                incorrectCount: wasCorrect ? 0 : 1,
            },
        });

        // Create review history record
        await ReviewHistory.create({
            userId: session.user.id,
            cardId,
            deckId: flashcard.deckId,
            sessionId,
            rating: quality,
            wasCorrect,
            timeSpent,
            reviewedAt: new Date(),
        });

        // Update study session stats
        await StudySession.findByIdAndUpdate(sessionId, {
            $inc: {
                cardsReviewed: 1,
                correctAnswers: wasCorrect ? 1 : 0,
                incorrectAnswers: wasCorrect ? 0 : 1,
            },
        });

        return { success: true, nextReview: reviewResult.nextReview };
    } catch (error) {
        console.error("Submit card review error:", error);
        return { error: "Failed to submit review" };
    }
}

export async function endStudySession(sessionId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const studySession = await StudySession.findOne({
            _id: sessionId,
            userId: session.user.id,
        });

        if (!studySession) {
            return { error: "Study session not found" };
        }

        const endTime = new Date();
        const duration = Math.floor(
            (endTime.getTime() - studySession.startTime.getTime()) / 1000
        );

        await StudySession.findByIdAndUpdate(sessionId, {
            endTime,
            duration,
            isActive: false,
        });

        revalidatePath("/analytics");
        return { success: true, duration };
    } catch (error) {
        console.error("End study session error:", error);
        return { error: "Failed to end study session" };
    }
}

export async function getDueCards(deckId?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const now = new Date();
        const query: Record<string, unknown> = {
            userId: session.user.id,
            isDeleted: false,
            nextReview: { $lte: now },
        };

        if (deckId) {
            query.deckId = deckId;
        }

        const dueCards = await Flashcard.find(query)
            .sort({ nextReview: 1 })
            .limit(50)
            .lean();

        return {
            success: true,
            cards: JSON.parse(JSON.stringify(dueCards)),
            count: dueCards.length,
        };
    } catch (error) {
        console.error("Get due cards error:", error);
        return { error: "Failed to fetch due cards" };
    }
}
