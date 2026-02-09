"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DashboardDock from "@/components/dashboard-dock";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  MapPin,
  User,
  Mail,
  Sparkles,
  Music2,
  Flame,
  Pencil,
  Calendar,
  Globe,
  Heart,
} from "lucide-react";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "R&B", "Country", "Indie", "Chill", "Happy", "Sad", "Energetic", "Calm"
];
const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Chinese", "Japanese", "Other"];
const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const StreakCalendar = ({ streak, lastActive, user }: { streak: number; lastActive: string; user: any }) => {
  const [activityData, setActivityData] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      try {
        const { data: moodData } = await supabase
          .from("moods")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });
        const { data: journalData } = await supabase
          .from("mood_journals")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });
        const activityMap: { [key: string]: boolean } = {};
        moodData?.forEach((entry) => {
          activityMap[entry.created_at.split("T")[0]] = true;
        });
        journalData?.forEach((entry) => {
          activityMap[entry.created_at.split("T")[0]] = true;
        });
        setActivityData(activityMap);
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };
    fetchActivityData();
  }, [user, streak]);

  const weekDays = (() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        day: ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
        date: dateStr,
        hasActivity: activityData[dateStr] || false,
        isToday: i === 0,
      });
    }
    return days;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "var(--font-poppins)" }}>
                {streak} day{streak === 1 ? "" : "s"} strong
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                Last active: {lastActive ? new Date(lastActive).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                    d.hasActivity
                      ? d.isToday
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-amber-400/90 dark:bg-amber-500/80 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                  title={d.hasActivity ? `Active on ${new Date(d.date).toLocaleDateString()}` : `No activity on ${new Date(d.date).toLocaleDateString()}`}
                >
                  {d.hasActivity ? <Flame className="w-4 h-4 sm:w-5 sm:h-5" /> : "—"}
                </div>
              ))}
            </div>
          </div>
        </div>
        {streak > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-4 text-center" style={{ fontFamily: "var(--font-inter)" }}>
            Keep it up! 🎯
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [language, setLanguage] = useState("");
  const [musicPrefs, setMusicPrefs] = useState<string[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastActive, setLastActive] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (showEdit) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = orig; };
    }
  }, [showEdit]);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/signin");
        return;
      }
      setUser(userData.user);
      const { data, err } = await supabase
        .from("profiles")
        .select("name, place, about, gender, age_range, language, music_prefs")
        .eq("id", userData.user.id)
        .single();
      if (err && err.code !== "PGRST116") {
        setError("Failed to load profile");
      } else if (data) {
        setName(data.name || "");
        setPlace(data.place || "");
        setAbout(data.about || "");
        setGender(data.gender || "");
        setAgeRange(data.age_range || "");
        setLanguage(data.language || "");
        setMusicPrefs(data.music_prefs || []);
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const fetchStreak = async () => {
      try {
        const { data, error: streakError } = await supabase
          .from("streaks")
          .select("streak_count, last_active")
          .eq("user_id", user.id)
          .maybeSingle();
        if (streakError && streakError.code !== "PGRST116") {
          setStreak(0);
          setLastActive("");
          return;
        }
        setStreak(data?.streak_count ?? 0);
        setLastActive(data?.last_active ?? "");
      } catch {
        setStreak(0);
        setLastActive("");
      }
    };
    fetchStreak();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!user) return;
    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      place,
      about,
      gender,
      age_range: ageRange,
      language,
      music_prefs: musicPrefs,
    });
    if (err) setError("Failed to save profile");
    else setShowEdit(false);
    setLoading(false);
  }

  function handleGenreToggle(genre: string) {
    setMusicPrefs((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  if (loading && !user) {
    return (
      <>
        <DashboardDock onSignOut={handleSignOut} />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 pb-32">
          <div className="w-10 h-10 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 dark:text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>Loading profile...</p>
        </div>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <DashboardDock onSignOut={handleSignOut} />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-32 bg-slate-50 dark:bg-slate-950">
          <p className="text-red-500 font-medium" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>
        </div>
      </>
    );
  }

  const displayName = name || user?.user_metadata?.name || user?.email || "User";

  return (
    <>
      <DashboardDock onSignOut={handleSignOut} />
      <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-y-auto">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 dark:hidden" style={{ backgroundImage: "linear-gradient(to right, rgb(15 23 42 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.08) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 hidden dark:block" style={{ backgroundImage: "linear-gradient(to right, rgb(203 213 225 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgb(203 213 225 / 0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 via-transparent to-slate-200/30 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/60" />
          <div className="absolute inset-0 hidden dark:block pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
        </div>

        <div ref={scrollRef} className="relative z-10 w-full flex flex-col items-center min-h-full overflow-y-auto pb-32">
          {/* Header */}
          <div className={`sticky top-0 z-50 w-full transition-all duration-300 px-4 sm:px-6 lg:px-8 ${isScrolled ? "py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" : "py-10 bg-transparent"}`}>
            <div className="w-full max-w-6xl mx-auto text-center">
              <h1 className={`font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-all duration-300 ${isScrolled ? "text-2xl" : "text-4xl sm:text-5xl"}`} style={{ fontFamily: "var(--font-poppins)" }}>
                Profile
              </h1>
              <p className={`text-slate-600 dark:text-slate-400 font-medium transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0 mt-0 text-[0px]" : "opacity-100 mt-3 text-lg"}`} style={{ fontFamily: "var(--font-inter)" }}>
                Your account and preferences
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8 mt-4">
            {/* Hero card: full width, uses horizontal space */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden">
                <CardContent className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-10">
                    <div className="flex justify-center sm:justify-start shrink-0">
                      <Avatar
                        src={user?.user_metadata?.avatar_url}
                        alt="Profile"
                        size="xl"
                        fallbackText={displayName}
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "var(--font-poppins)" }}>
                        {displayName}
                      </h2>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate" style={{ fontFamily: "var(--font-inter)" }}>{user?.email}</span>
                      </div>
                      <Button
                        onClick={() => setShowEdit(true)}
                        className="mt-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-medium shadow-sm"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Two-column grid: About you (left) + Music preferences (right) on large screens */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Details card: Place, About, Gender, Age, Language */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="min-w-0">
                <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden h-full flex flex-col">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "var(--font-poppins)" }}>
                    <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    About you
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-4">
                  {place && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)" }}>Location</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: "var(--font-inter)" }}>{place}</p>
                      </div>
                    </div>
                  )}
                  {about && (
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)" }}>About</p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{about}</p>
                      </div>
                    </div>
                  )}
                  {(gender || ageRange || language) && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      {gender && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase" style={{ fontFamily: "var(--font-inter)" }}>Gender</span>
                          <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: "var(--font-inter)" }}>{gender}</span>
                        </div>
                      )}
                      {ageRange && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: "var(--font-inter)" }}>{ageRange}</span>
                        </div>
                      )}
                      {language && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: "var(--font-inter)" }}>{language}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {!place && !about && !gender && !ageRange && !language && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4" style={{ fontFamily: "var(--font-inter)" }}>
                      Add details in Edit profile to personalize your experience.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

              {/* Music preferences */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="min-w-0">
                <Card className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden h-full flex flex-col">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "var(--font-poppins)" }}>
                      <Music2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      Music & mood preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 flex-1">
                    {musicPrefs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {musicPrefs.map((g) => (
                          <span key={g} className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium border border-purple-200/50 dark:border-purple-800/50" style={{ fontFamily: "var(--font-inter)" }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>
                        No preferences set. Edit profile to add genres and moods you love.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Streak: full width */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
              <StreakCalendar streak={streak} lastActive={lastActive} user={user} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "var(--font-poppins)" }}>
                  Personalize your experience
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                  Update your profile and preferences for better recommendations.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Place</label>
                <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City or region" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Gender</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Age range</label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                    {AGE_RANGES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Preferred language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>About</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="A few words about you..." rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none" style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" style={{ fontFamily: "var(--font-inter)" }}>Music & mood preferences</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${musicPrefs.includes(genre) ? "bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)} className="flex-1 rounded-xl border-slate-200 dark:border-slate-700" style={{ fontFamily: "var(--font-inter)" }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" style={{ fontFamily: "var(--font-inter)" }}>
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
