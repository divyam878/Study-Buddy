# Study Buddy

Study Buddy is a comprehensive flashcard learning platform that utilizes the SM-2 spaced repetition algorithm and AI-powered content generation. It is designed to demonstrate full-stack development capabilities using Next.js 16, server-side rendering, and a robust MongoDB backend.

## Features

### Core Learning
- **Spaced Repetition System (SRS)**: Implements the SuperMemo-2 algorithm to schedule card reviews efficiently.
- **Flashcard Management**: Create, edit, and organize flashcards into decks.
- **Study Modes**: 
  - **Standard Review**: Algorithm-driven daily practice.
  - **Mock Tests**: Timed exams with randomized questions.
- **Manual Navigation**: Browse cards freely inside a deck without affecting SRS stats.

### AI Integration
- **Content Generation**: Uses Groq (Llama 3 70B) to generate flashcards from topic prompts.
- **Dynamic Distractors**: Automatically converts subjective flashcards into Multiple Choice Questions (MCQs) for mock tests by generating plausible distractors on the fly.

### Productivity Tools
- **Pomodoro Timer**: Integrated focus timer with adjustable Work/Short Break/Long Break intervals.
- **Analytics**: basic tracking of correct vs. incorrect answers during sessions.

### User Interface
- **Responsive Design**: Mobile-friendly layout with a collapsible sidebar.
- **Dark Mode**: Fully supported dark theme with high-contrast text and subtle component shadings.
- **Accessibility**: Keyboard navigation support for reviewing cards (Space to flip, 0-5 to rate).

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: NextAuth.js (Credentials & Google OAuth)
- **AI Provider**: Groq SDK

## Installation

### Prerequisites
- Node.js 18+
- MongoDB Instance (Atlas or Local)

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd house-of-ed-divyam-goyal-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see Configuration section).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`.

## Configuration

Create a `.env.local` file in the root directory with the following keys:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI Integration
GROQ_API_KEY=gsk_...
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Project Structure

```
.
├── app/
│   ├── (auth)/          # Authentication routes (login, signup)
│   ├── (dashboard)/     # Main application routes (decks, study, analytics)
│   ├── actions/         # Server Actions for DB operations
│   ├── api/             # API routes for NextAuth
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
├── lib/                 # Utility functions (DB connection, auth options)
├── models/              # Mongoose data models
└── public/              # Static assets
```

## Deployment

This application is optimized for deployment on Vercel.

1. Push code to a Git repository.
2. Import the project into Vercel.
3. Add the environment variables in the Vercel dashboard.
   - Note: Set `NEXTAUTH_URL` to your production domain (e.g., `https://your-app.vercel.app`).
4. Deploy.

## Author

Divyam Goyal
