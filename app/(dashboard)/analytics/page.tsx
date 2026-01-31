import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Clock, Brain, CheckCircle2 } from "lucide-react";
import dbConnect from "@/lib/db";
import StudySession from "@/models/StudySession";
import ReviewHistory from "@/models/ReviewHistory";

async function getAnalytics(userId: string) {
  await dbConnect();

  const totalSessions = await StudySession.countDocuments({ 
    userId, 
    isActive: false 
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = await StudySession.find({
    userId,
    endTime: { $gte: today }
  });

  const totalReviews = await ReviewHistory.countDocuments({ userId });
  
  const correctReviews = await ReviewHistory.countDocuments({ 
    userId, 
    wasCorrect: true 
  });

  const accuracy = totalReviews > 0 
    ? Math.round((correctReviews / totalReviews) * 100) 
    : 0;

  const totalDuration = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0);
  const minutesStudied = Math.floor(totalDuration / 60);

  return {
    totalSessions,
    minutesStudied,
    totalReviews,
    accuracy
  };
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const stats = await getAnalytics(session.user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime study sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Study Time Today
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.minutesStudied}m</div>
            <p className="text-xs text-muted-foreground">
              Minutes spent learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cards Reviewed
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Total cards reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Accuracy Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Overall success rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
