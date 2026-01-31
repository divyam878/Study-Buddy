"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudySession from "@/models/StudySession";
import Deck from "@/models/Deck";
import Flashcard from "@/models/Flashcard";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function startMockTest(deckId: string, questionCount: number = 20) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        // Create exam session
        const studySession = await StudySession.create({
            userId: session.user.id,
            deckId,
            startTime: new Date(),
            mode: "exam",
            totalQuestions: questionCount,
        });

        // Fetch random questions for the test
        const rawQuestions = await Flashcard.aggregate([
            { $match: { deckId: new mongoose.Types.ObjectId(deckId), isDeleted: false } },
            { $sample: { size: questionCount } },
        ]);

        const questions = JSON.parse(JSON.stringify(rawQuestions));

        // Identify subjective questions that need options
        const subjectiveCards = questions.filter((q: any) => q.cardType !== "mcq");

        if (subjectiveCards.length > 0) {
            const { batchConvertToMcq } = await import("./ai-actions");
            const converted = await batchConvertToMcq(subjectiveCards);
            const convertedMap = new Map(converted.map((c: any) => [c._id, c]));

            for (let i = 0; i < questions.length; i++) {
                if (questions[i].cardType !== "mcq" && convertedMap.has(questions[i]._id)) {
                    questions[i] = convertedMap.get(questions[i]._id);
                }
            }
        }

        return {
            success: true,
            sessionId: studySession._id.toString(),
            questions: questions
        };
    } catch (error) {
        console.error("Start test error:", error);
        return { error: "Failed to start test" };
    }
}

export async function submitTestResult(sessionId: string, score: number, cardsReviewed: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await dbConnect();

        const endTime = new Date();

        const currentSession = await StudySession.findById(sessionId);
        if (!currentSession) return { error: "Session not found" };

        const duration = Math.floor((endTime.getTime() - new Date(currentSession.startTime).getTime()) / 1000);

        await StudySession.findByIdAndUpdate(sessionId, {
            endTime,
            duration,
            cardsReviewed,
            score,
            isActive: false
        });

        revalidatePath("/analytics");
        return { success: true };
    } catch (error) {
        console.error("Submit test error:", error);
        return { error: "Failed to submit test" };
    }
}
