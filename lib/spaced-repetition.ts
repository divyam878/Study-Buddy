import { IFlashcard } from "@/models/Flashcard";

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * 
 * Quality ratings (0-5):
 * 0 - Complete blackout
 * 1 - Incorrect response, but correct answer seemed familiar
 * 2 - Incorrect response, but correct answer was easy to recall
 * 3 - Correct response, but required significant effort
 * 4 - Correct response, after some hesitation
 * 5 - Perfect response
 * 
 * Algorithm:
 * - If quality >= 3: Correct answer, increase interval
 * - If quality < 3: Incorrect answer, reset interval to 0
 */

export interface ReviewResult {
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReview: Date;
}

/**
 * Calculate next review date based on SM-2 algorithm
 * @param card - The flashcard being reviewed
 * @param quality - Quality rating (0-5)
 * @returns Updated spaced repetition values
 */
export function calculateNextReview(
    card: Partial<IFlashcard>,
    quality: number
): ReviewResult {
    // Validate quality rating
    if (quality < 0 || quality > 5) {
        throw new Error("Quality must be between 0 and 5");
    }

    let easeFactor = card.easeFactor || 2.5;
    let interval = card.interval || 0;
    let repetitions = card.repetitions || 0;

    // If quality < 3, reset the card (incorrect answer)
    if (quality < 3) {
        repetitions = 0;
        interval = 0;
    } else {
        // Correct answer - update ease factor
        easeFactor = Math.max(
            1.3,
            easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        // Calculate new interval
        if (repetitions === 0) {
            interval = 1; // First correct answer: review tomorrow
        } else if (repetitions === 1) {
            interval = 6; // Second correct answer: review in 6 days
        } else {
            interval = Math.round(interval * easeFactor);
        }

        repetitions += 1;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    // Set to start of day for consistent scheduling
    nextReview.setHours(0, 0, 0, 0);

    return {
        easeFactor,
        interval,
        repetitions,
        nextReview,
    };
}

/**
 * Check if a card is due for review
 * @param card - The flashcard to check
 * @returns true if the card should be reviewed today
 */
export function isCardDue(card: Partial<IFlashcard>): boolean {
    if (!card.nextReview) return true;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const nextReview = new Date(card.nextReview);
    nextReview.setHours(0, 0, 0, 0);

    return nextReview <= now;
}

/**
 * Get the number of days until next review
 * @param card - The flashcard to check
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilReview(card: Partial<IFlashcard>): number {
    if (!card.nextReview) return 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const nextReview = new Date(card.nextReview);
    nextReview.setHours(0, 0, 0, 0);

    const diffTime = nextReview.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calculate accuracy percentage for a card
 * @param card - The flashcard to calculate accuracy for
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(card: Partial<IFlashcard>): number {
    const total = (card.correctCount || 0) + (card.incorrectCount || 0);
    if (total === 0) return 0;

    return Math.round(((card.correctCount || 0) / total) * 100);
}
