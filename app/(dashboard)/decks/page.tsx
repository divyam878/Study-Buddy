import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDecks } from "@/app/actions/deck-actions";
import { DeckList } from "@/components/deck-list";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DecksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const result = await getDecks(1);

  if (result.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Decks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your flashcard decks
          </p>
        </div>
        <CreateDeckDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </CreateDeckDialog>
      </div>

      <DeckList initialDecks={result.decks || []} initialPagination={result.pagination} />
    </div>
  );
}
