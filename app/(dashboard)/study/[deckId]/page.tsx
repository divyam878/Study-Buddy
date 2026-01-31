import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeck } from "@/app/actions/deck-actions";
import { getDueCards } from "@/app/actions/study-actions";
import { StudyInterface } from "@/components/study-interface";

export default async function StudyDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { deckId } = await params;

  if (!session) {
    redirect("/login");
  }

  const [deckResult, cardsResult] = await Promise.all([
    getDeck(deckId),
    getDueCards(deckId),
  ]);

  if (deckResult.error || cardsResult.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">
          {deckResult.error || cardsResult.error}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <StudyInterface
        deck={deckResult.deck}
        initialCards={cardsResult.cards || []}
      />
    </div>
  );
}
