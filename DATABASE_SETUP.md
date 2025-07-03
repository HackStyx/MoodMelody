# Database Setup for MoodMelody

This guide will help you set up the required database tables in Supabase to fix the streak fetching error and ensure all features work properly.

## 🔧 **Quick Fix for Current Error**

The error you're seeing (`Error fetching streak: {}`) occurs because the `streaks` table doesn't exist in your Supabase database yet.

## 📋 **Step-by-Step Setup**

### 1. **Access Supabase SQL Editor**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### 2. **Run the Database Schema**
Copy the entire content from `database/schema.sql` and paste it into the SQL Editor, then click **"Run"**.

Or copy this complete schema:

```sql
-- MoodMelody Database Schema
-- Run these commands in your Supabase SQL Editor

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    place TEXT,
    about TEXT,
    gender TEXT,
    age_range TEXT,
    language TEXT,
    music_preferences TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Moods table
CREATE TABLE IF NOT EXISTS public.moods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Mood Journals table
CREATE TABLE IF NOT EXISTS public.mood_journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    tag TEXT,
    emotion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    streak_count INTEGER DEFAULT 1,
    last_active DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moods_user_id_created_at ON public.moods(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_journals_user_id_created_at ON public.mood_journals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Moods policies
CREATE POLICY "Users can view own moods" ON public.moods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON public.moods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods" ON public.moods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods" ON public.moods
    FOR DELETE USING (auth.uid() = user_id);

-- Mood journals policies
CREATE POLICY "Users can view own mood journals" ON public.mood_journals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood journals" ON public.mood_journals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood journals" ON public.mood_journals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood journals" ON public.mood_journals
    FOR DELETE USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON public.streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" ON public.streaks
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_streaks_updated_at
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### 3. **Verify Tables Creation**
After running the SQL:
1. Go to **"Table Editor"** in the left sidebar
2. You should see 4 new tables:
   - `profiles`
   - `moods` 
   - `mood_journals`
   - `streaks`

### 4. **Test the Application**
1. Refresh your development server
2. Go to the dashboard
3. The streak error should be resolved
4. Try selecting a mood - it should save and display properly
5. Test journal submissions with emotion detection

## 🎯 **What Each Table Does**

### **profiles**
- Stores user profile information (name, location, preferences)
- Used in profile page and greeting card

### **moods** 
- Stores daily mood selections (emoji + timestamp)
- Used in mood picker card

### **mood_journals**
- Stores journal entries with detected emotions
- Used in mood journal section and emotion analysis

### **streaks**
- Tracks user engagement streaks
- Used in streak card to show daily activity

## 🔒 **Security Features**

✅ **Row Level Security (RLS)**: Users can only access their own data  
✅ **Authentication Required**: All operations require valid user session  
✅ **Foreign Key Constraints**: Data integrity with user relationships  
✅ **Indexes**: Optimized queries for better performance  

## 🐛 **Troubleshooting**

### If you still see errors after setup:

1. **Check Authentication**: Make sure you're signed in
2. **Clear Browser Cache**: Refresh completely
3. **Check Console**: Look for any remaining errors
4. **Verify Tables**: Ensure all 4 tables exist in Supabase
5. **Check Policies**: Verify RLS policies are active

### Common Issues:

- **"relation does not exist"**: Table not created properly
- **"permission denied"**: RLS policy issue
- **"duplicate key value"**: User already has data (normal)

## ✅ **Success Indicators**

After setup, you should see:
- ✅ No "Error fetching streak" messages
- ✅ Mood selections save and display properly  
- ✅ Streak counter shows actual numbers
- ✅ Journal entries save with emotions
- ✅ Music recommendations appear after journal submission

The database is now ready for all MoodMelody features! 