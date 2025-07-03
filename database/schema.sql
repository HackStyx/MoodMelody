-- MoodMelody Database Schema
-- Run these commands in your Supabase SQL Editor

-- Enable Row Level Security (RLS) on auth.users table if not already enabled
-- This is usually enabled by default in Supabase

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
    music_prefs TEXT[],
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