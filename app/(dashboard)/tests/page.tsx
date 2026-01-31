import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDecks } from "@/app/actions/deck-actions";
import { TestDashboard } from "@/components/test-dashboard";
import { BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function TestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const result = await getDecks();
  const decks = result.decks || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <p className="text-muted-foreground mt-1">
          Take timed exams to test your knowledge without immediate feedback.
        </p>
      </div>

      {decks.length === 0 ? (
        <Alert variant="default" className="bg-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No decks found</AlertTitle>
          <AlertDescription>
            You need to create some decks and add flashcards before you can take tests.
          </AlertDescription>
        </Alert>
      ) : (
        <TestDashboard decks={decks} />
      )}
    </div>
  );
}
