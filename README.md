# Study Companion - AI-Powered Flashcard Learning Platform

A production-quality EdTech web application built with Next.js 16, MongoDB, and shadcn/ui. Features spaced repetition learning with the SM-2 algorithm, flashcard management, and progress analytics.

## 🎯 Key Features

- **Spaced Repetition Learning**: SM-2 algorithm for optimal review scheduling
- **Flashcard Management**: Create, organize, and study flashcard decks
- **Smart Review System**: Cards automatically scheduled based on performance
- **Progress Tracking**: Monitor your learning with detailed analytics
- **Dark/Light Theme**: Minimal black & white design with theme switching
- **Keyboard Shortcuts**: Efficient study flow with keyboard controls
- **Authentication**: Secure login with email/password and Google OAuth

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js Server Actions, NextAuth.js v4
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS with CSS variables for theming

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB installation)
- Google OAuth credentials (optional, for Google sign-in)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
cd house-of-ed-divyam-goyal-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study-companion?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**MongoDB Setup:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and replace `username` and `password`
4. Whitelist your IP address in Network Access

**Google OAuth Setup (Optional):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Creating Your First Deck

1. Sign up or log in
2. Click "New Deck" on the Decks page
3. Enter deck title, description, category, and tags
4. Click "Create Deck"

### Adding Flashcards

1. Open a deck
2. Click "Add Flashcard"
3. Enter question and answer
4. Click "Create Flashcard"

### Studying

1. Open a deck and click "Start Studying"
2. Read the question
3. Press **Space** or click to reveal the answer
4. Rate your recall quality (0-5):
   - **0-2**: Incorrect (card resets to day 1)
   - **3-5**: Correct (interval increases based on SM-2 algorithm)

### Keyboard Shortcuts

- **Space**: Flip card to reveal answer
- **0-5**: Rate card quality after revealing answer

## 🧠 SM-2 Spaced Repetition Algorithm

The app uses the SuperMemo 2 (SM-2) algorithm for optimal review scheduling:

- **First Review**: 1 day after creation
- **Second Review**: 6 days after first correct answer
- **Subsequent Reviews**: Interval multiplied by ease factor (2.5 default)
- **Incorrect Answers**: Reset interval to 0, review same day

Quality ratings affect the ease factor:
- Higher quality (4-5): Increases ease factor → longer intervals
- Lower quality (3): Maintains ease factor
- Incorrect (0-2): Decreases ease factor, resets interval

## 📁 Project Structure

```
house-of-ed-divyam-goyal-assignment/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── decks/           # Deck management
│   │   ├── study/           # Study sessions
│   │   └── analytics/       # Progress analytics
│   ├── actions/             # Server actions
│   ├── api/                 # API routes
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/                     # Utilities
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # MongoDB connection
│   ├── spaced-repetition.ts # SM-2 algorithm
│   └── utils.ts             # Helper functions
├── models/                  # Mongoose models
│   ├── User.ts
│   ├── Deck.ts
│   ├── Flashcard.ts
│   ├── StudySession.ts
│   └── ReviewHistory.ts
├── middleware.ts            # Route protection
└── tailwind.config.ts       # Tailwind configuration
```

## 🗄️ Database Schema

### Users
- Authentication and profile information
- Theme preferences and daily goals

### Decks
- Flashcard collections with tags and categories
- Soft delete support

### Flashcards
- Question/answer pairs
- SM-2 algorithm fields (easeFactor, interval, repetitions)
- Performance tracking (reviewCount, correctCount, incorrectCount)

### StudySessions
- Session tracking with duration and statistics
- Pomodoro cycle counting

### ReviewHistory
- Individual card review records
- Quality ratings and time spent

## 🎨 Design Philosophy

- **Minimal Black & White**: Clean, distraction-free interface
- **Accessibility**: Keyboard shortcuts and clear visual hierarchy
- **Responsive**: Works on desktop, tablet, and mobile
- **Performance**: Server-side rendering and optimized queries

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based session management
- Protected API routes
- Input validation with Zod
- MongoDB injection prevention

## 🚧 Future Enhancements

- [ ] Pomodoro timer integration
- [ ] Advanced analytics dashboard with charts
- [ ] AI flashcard generation from notes
- [ ] Deck sharing and collaboration
- [ ] Mobile app (React Native)
- [ ] Export/import decks

## 📝 License

This project is built for educational purposes as part of an interview assignment.

## 👤 Author

Divyam Goyal

---

**Note**: This is a production-ready MVP showcasing full-stack development skills, clean architecture, and interview-ready code quality.
