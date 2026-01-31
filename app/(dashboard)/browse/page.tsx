import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicDecks } from "@/app/actions/marketplace-actions";
import { PublicDeckList } from "@/components/public-deck-list";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default async function BrowseDecksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { q } = await searchParams;

  if (!session) {
    redirect("/login");
  }

  const result = await getPublicDecks(1, 20, q);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Public Decks</h1>
          <p className="text-muted-foreground mt-1">
            Discover decks created by instructors and other students
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <form action="/browse">
            <Input
              name="q"
              placeholder="Search decks..."
              className="pl-9"
              defaultValue={q}
            />
          </form>
        </div>
      </div>

      {result.error ? (
        <div className="text-center text-destructive py-8">{result.error}</div>
      ) : (
        <PublicDeckList initialDecks={result.decks || []} />
      )}
    </div>
  );
}
