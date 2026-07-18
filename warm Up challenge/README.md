# Cooking Companion 🍳

Cooking Companion is a production-ready, AI-powered meal planner that generates personalized daily meal plans based on user schedules, budgets, and dietary preferences. It is powered by the Google Gemini API (via server-side requests) and persists cooking plans inside a SQLite database using Prisma ORM.

## Features

- **Personalized Planner**: Input day's schedule, number of people, dietary preference (Vegetarian, Non-Vegetarian, Vegan, No Restriction), and target budget.
- **AI-Generated Menu**: Dynamic recommendations for Breakfast, Lunch, and Dinner including cooking times and suitability notes.
- **Budget Check**: Validates and explains estimated menu costs against the target budget.
- **Grocery & Substitutions**: Handy checklists and ingredient substitution lists.
- **History Panel**: View past cooking plans, reload them instantly, or delete them from the database.
- **A11y & Contrast**: High-contrast states, form-input link tags, screen reader live-announcers, and full keyboard tab navigability.

---

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Axios + Lucide Icons
- **Backend**: Node.js + Express.js
- **Database**: SQLite via Prisma ORM
- **AI Integration**: Google Gemini 1.5 Flash API
- **Testing**: Jest (Backend) + Vitest / React Testing Library (Frontend)

---

## Installation & Setup

### 1. Clone & Initialize Directory
Ensure you are inside the `warm Up challenge` directory:
```bash
cd "warm Up challenge"
```

### 2. Install Dependencies
Install all package dependencies in the workspace root, client, and server:
```bash
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory. You can copy the template:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure your credentials:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_actual_gemini_api_key"
PORT=5001
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

> **Note**: To obtain a Google Gemini API Key, visit [Google AI Studio](https://aistudio.google.com/).

### 4. Database Setup & Sync
Initialize the local SQLite database and sync the Prisma schema:
```bash
npm run prisma db push --prefix server
```

This will create `server/prisma/dev.db` and generate the Prisma Client.

---

## Running Locally

To run both the backend server and Vite client concurrently in development mode:
```bash
npm run dev
```

The application will be accessible at:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## Testing

### Run All Tests
To run both frontend and backend tests:
```bash
npm run test
```

### Run Backend Tests (Jest)
To run backend unit and integration tests:
```bash
npm run test:server
```

### Run Frontend Tests (Vitest)
To run frontend components and validation tests:
```bash
npm run test:client
```

---

## Deployment Steps

### Frontend (e.g., Vercel)
1. Initialize Git and push your repository to GitHub.
2. Connect your repository to Vercel.
3. Configure the **Build Command** to:
   ```bash
   npm run build
   ```
4. Set the **Output Directory** to `client/dist`.
5. Add the environment variable `VITE_API_URL` pointing to your deployed backend API domain (e.g. `https://cooking-companion-api.onrender.com`).

### Backend (e.g., Render / Railway)
1. Connect your repository to Render or Railway.
2. Set the **Build Command** to run database migrations and install dependencies:
   ```bash
   npm install && npx prisma generate
   ```
3. Set the **Start Command** to:
   ```bash
   node app.js
   ```
4. Set environment variables on the hosting platform:
   - `DATABASE_URL`: `file:/opt/render/project/src/server/prisma/prod.db` (for a persistent disk path, or use PostgreSQL by changing `provider` in `schema.prisma`).
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `CORS_ORIGIN`: Your deployed Vercel frontend URL.
   - `PORT`: Deployed server port (usually injected by platform).
   - `NODE_ENV`: `production`.
