"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface MusicRecommendation {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  preview_url: string;
  external_url: string;
  duration_ms?: number;
}

interface MusicRecommendationsProps {
  recommendations: MusicRecommendation[];
  emotion?: string;
  onGetPersonalizedRecommendations?: () => void;
  isLoadingPersonalized?: boolean;
}

const emotionEmojis: Record<string, string> = {
  joy: "😄",
  love: "❤️",
  sadness: "😢",
  anger: "😡",
  fear: "😨",
  surprise: "😮"
};

const emotionColors: Record<string, string> = {
  joy: "from-yellow-400 to-orange-400",
  love: "from-pink-400 to-red-400",
  sadness: "from-blue-400 to-indigo-400",
  anger: "from-red-500 to-red-700",
  fear: "from-purple-400 to-indigo-400",
  surprise: "from-green-400 to-blue-400"
};

export function MusicRecommendations({ 
  recommendations, 
  emotion = "joy", 
  onGetPersonalizedRecommendations,
  isLoadingPersonalized = false 
}: MusicRecommendationsProps) {
  const [active, setActive] = useState<MusicRecommendation | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }
    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handlePlay = (trackId: string, previewUrl: string) => {
    if (playing === trackId) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlaying(null);
    } else {
      // Stop any currently playing track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Play new track
      if (previewUrl) {
        audioRef.current = new Audio(previewUrl);
        audioRef.current.play();
        audioRef.current.onended = () => setPlaying(null);
        setPlaying(trackId);
      }
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const colorClass = emotionColors[emotion.toLowerCase()] || emotionColors.joy;

  if (recommendations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto w-full p-8 text-center">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No music recommendations yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get personalized music recommendations based on your profile preferences and latest journal emotions!
        </p>
        {onGetPersonalizedRecommendations && (
          <button
            onClick={onGetPersonalizedRecommendations}
            disabled={isLoadingPersonalized}
            className={`px-6 py-3 rounded-full font-bold text-white transition-all ${
              isLoadingPersonalized 
                ? 'bg-gray-400 cursor-not-allowed' 
                : `bg-gradient-to-r ${colorClass} hover:opacity-90 hover:scale-105`
            }`}
          >
            {isLoadingPersonalized ? (
              <>
                <span className="inline-block animate-spin mr-2">🎵</span>
                Getting Recommendations...
              </>
            ) : (
              <>
                🎯 Get Personalized Recommendations
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.id}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={active.image || '/placeholder-album.png'}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover"
                />
              </motion.div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-xl text-neutral-700 dark:text-neutral-200 mb-1"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`artist-${active.id}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-lg"
                    >
                      {active.artist}
                    </motion.p>
                    <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-1">
                      {active.album}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {active.preview_url && (
                    <button
                      onClick={() => handlePlay(active.id, active.preview_url)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white transition-all ${
                        playing === active.id 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : `bg-gradient-to-r ${colorClass} hover:opacity-90`
                      }`}
                    >
                      {playing === active.id ? '⏸️' : '▶️'}
                      {playing === active.id ? 'Pause' : 'Preview'}
                    </button>
                  )}
                  <a
                    href={active.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-green-500 text-white hover:bg-green-600 transition-all"
                  >
                    🎵 Open in Spotify
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Music for your {emotion} {emotionEmojis[emotion.toLowerCase()] || '🎵'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Curated tracks based on your emotional state
          </p>
          {onGetPersonalizedRecommendations && (
            <button
              onClick={onGetPersonalizedRecommendations}
              disabled={isLoadingPersonalized}
              className={`px-4 py-2 rounded-full font-semibold text-white transition-all text-sm ${
                isLoadingPersonalized 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : `bg-gradient-to-r ${colorClass} hover:opacity-90 hover:scale-105`
              }`}
            >
              {isLoadingPersonalized ? (
                <>
                  <span className="inline-block animate-spin mr-2">🎵</span>
                  Getting Personalized...
                </>
              ) : (
                <>
                  🎯 Get Personalized Recommendations
                </>
              )}
            </button>
          )}
        </div>
        
        <ul className="space-y-3">
          {recommendations.map((track, index) => (
            <motion.div
              layoutId={`card-${track.id}-${id}`}
              key={`card-${track.id}-${id}`}
              onClick={() => setActive(track)}
              className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border border-gray-100 dark:border-gray-700 transition-all"
            >
              <div className="flex gap-4 items-center flex-1">
                <motion.div layoutId={`image-${track.id}-${id}`}>
                  <img
                    width={60}
                    height={60}
                    src={track.image || '/placeholder-album.png'}
                    alt={track.name}
                    className="h-15 w-15 rounded-lg object-cover"
                  />
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    layoutId={`title-${track.id}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    {track.name}
                  </motion.h3>
                  <motion.p
                    layoutId={`artist-${track.id}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-sm"
                  >
                    {track.artist}
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {track.duration_ms && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDuration(track.duration_ms)}
                  </span>
                )}
                {track.preview_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(track.id, track.preview_url);
                    }}
                    className={`p-2 rounded-full transition-all ${
                      playing === track.id 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {playing === track.id ? '⏸️' : '▶️'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </ul>
      </div>
    </>
  );
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </svg>
); 