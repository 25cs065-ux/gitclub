# Git Club BuildSpace

A professional community project portfolio that helps students discover Git Club projects, understand the problems they solve, explore their technology stacks, learn about their creators, and open GitHub repositories or live demos.

## 🚀 Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router
- **Icons:** Lucide React
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel (Recommended)

## 🛠️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gitclub-buildspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings. *Do not expose service-role keys in frontend code.*

## 🗄️ Database Setup & Migration

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `supabase/schema.sql` file from this repository.
4. Copy its contents and paste it into the SQL Editor, then click **Run** to create the tables, setup Row Level Security (RLS), and configure the storage bucket.
5. Create an Admin user via the **Authentication** tab in Supabase (Add User -> Send invite or create with email/password).

## 🌱 Seed Data

To populate your database with demonstration projects:
1. Open the `supabase/seed.sql` file.
2. Copy its contents and run it in the Supabase **SQL Editor**.
3. These seed records use clearly identified demonstration identities. Do not invent real Git Club member identities or achievements without authorization.

## 💻 Development

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 🚢 Deployment

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the configuration step, ensure the Framework Preset is set to **Vite**.
5. Add the following Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

---
*Built for the Git Club CHARUSAT Website Challenge - Problem Statement 3.*
