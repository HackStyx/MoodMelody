-- Debug Streaks Table Issues
-- Run this in your Supabase SQL Editor to fix RLS issues

-- 1. Check if RLS is enabled on streaks table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'streaks';

-- 2. Check existing policies on streaks table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'streaks';

-- 3. Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON public.streaks;

-- 4. Recreate RLS policies for streaks table
CREATE POLICY "Users can view own streaks" ON public.streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" ON public.streaks
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Ensure RLS is enabled
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- 6. Test query - this should return your streak if you're logged in
-- (Replace 'your-user-id' with your actual user ID from auth.users)
SELECT 
    user_id,
    streak_count,
    last_active,
    created_at
FROM public.streaks 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 7. If you want to see all streaks regardless of user (temporary debug)
-- SELECT COUNT(*) as total_streaks FROM public.streaks;

-- 8. Check if your user exists in auth.users
-- SELECT id, email, created_at FROM auth.users WHERE id = auth.uid(); 