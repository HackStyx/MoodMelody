import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Language-specific search terms and markets
const languageConfig: Record<string, {
  market: string;
  searchTerms: string[];
  popularArtists?: string[];
}> = {
  "Spanish": {
    market: "ES",
    searchTerms: ["música", "canción", "latino", "hispano"],
    popularArtists: ["Bad Bunny", "Rosalía", "Jesse & Joy"]
  },
  "French": {
    market: "FR", 
    searchTerms: ["musique", "chanson", "français"],
    popularArtists: ["Stromae", "Indila", "Angèle"]
  },
  "German": {
    market: "DE",
    searchTerms: ["musik", "deutsche", "german"],
    popularArtists: ["Rammstein", "Tokio Hotel", "Cro"]
  },
  "Hindi": {
    market: "IN",
    searchTerms: ["bollywood", "hindi", "indian", "desi"],
    popularArtists: ["Arijit Singh", "Shreya Ghoshal", "A.R. Rahman"]
  },
  "Chinese": {
    market: "TW",
    searchTerms: ["chinese", "mandarin", "c-pop", "taiwan"],
    popularArtists: ["Jay Chou", "Teresa Teng", "Jolin Tsai"]
  },
  "Japanese": {
    market: "JP",
    searchTerms: ["japanese", "j-pop", "jpop", "anime"],
    popularArtists: ["Hikaru Utada", "ONE OK ROCK", "Yoasobi"]
  },
  "English": {
    market: "US",
    searchTerms: ["english", "pop", "american", "british"],
    popularArtists: []
  }
};

// Simplified emotion to search strategy mapping
const emotionSearchStrategy: Record<string, {
  primary: string[];
  genres: string[];
  attributes: string[];
}> = {
  joy: {
    primary: ["happy", "upbeat", "cheerful", "feel good"],
    genres: ["pop", "dance", "funk"],
    attributes: ["energetic", "positive", "fun"]
  },
  love: {
    primary: ["love", "romantic", "sweet", "tender"],
    genres: ["r&b", "pop", "soul"],
    attributes: ["romantic", "smooth", "beautiful"]
  },
  sadness: {
    primary: ["sad", "melancholy", "heartbreak", "emotional"],
    genres: ["indie", "blues", "acoustic"],
    attributes: ["slow", "deep", "emotional"]
  },
  anger: {
    primary: ["angry", "aggressive", "intense", "powerful"],
    genres: ["rock", "metal", "punk"],
    attributes: ["loud", "intense", "raw"]
  },
  fear: {
    primary: ["calm", "peaceful", "ambient", "soothing"],
    genres: ["ambient", "classical", "chill"],
    attributes: ["relaxing", "gentle", "quiet"]
  },
  surprise: {
    primary: ["unique", "experimental", "discovery", "new"],
    genres: ["electronic", "indie", "alternative"],
    attributes: ["unusual", "creative", "fresh"]
  }
};

// Clean genre mapping - only use valid Spotify genres
const validSpotifyGenres: Record<string, string> = {
  "Pop": "pop",
  "Rock": "rock", 
  "Hip-Hop": "hip-hop",
  "Jazz": "jazz",
  "Classical": "classical",
  "Electronic": "electronic",
  "R&B": "r-n-b",
  "Country": "country",
  "Indie": "indie",
  "Alternative": "alternative",
  "Blues": "blues",
  "Folk": "folk",
  "Reggae": "reggae",
  "Funk": "funk",
  "Soul": "soul",
  "Acoustic": "acoustic"
};

export async function POST(request: Request) {
  try {
    const { userId, limit = 6 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get user profile for music preferences and language
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("music_prefs, language")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // Get latest journal entry for emotion
    const { data: latestJournal, error: journalError } = await supabase
      .from("mood_journals")
      .select("emotion")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (journalError) {
      console.error("Journal fetch error:", journalError);
    }

    // Use detected emotion or default to joy
    const emotion = latestJournal?.emotion || "joy";
    const userLanguage = profile?.language || "English";
    
    console.log(`🎯 Generating recommendations for emotion: ${emotion}`);
    console.log(`🌍 User language preference: ${userLanguage}`);

    // Get language configuration
    const langConfig = languageConfig[userLanguage] || languageConfig["English"];
    const market = langConfig.market;

    // Get Spotify access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const { access_token } = await tokenResponse.json();

    // Get emotion-based search strategy
    const strategy = emotionSearchStrategy[emotion.toLowerCase()] || emotionSearchStrategy.joy;
    
    // Build focused search queries
    const searchQueries: string[] = [];
    
    // 1. Primary emotion-based searches (2 queries)
    searchQueries.push(
      `${strategy.primary[0]} music`, // e.g., "happy music"
      `${strategy.primary[1]} songs`  // e.g., "upbeat songs"
    );
    
    // 2. Add language-specific search if not English (1 query)
    if (userLanguage !== "English" && langConfig.searchTerms.length > 0) {
      const langTerm = langConfig.searchTerms[0]; // Take first language-specific term
      searchQueries.push(`${strategy.primary[0]} ${langTerm}`); // e.g., "happy música"
      console.log(`🗣️ Adding language-specific search: ${langTerm}`);
    }
    
    // 3. Add ONE user music preference if available (1 query)
    if (profile?.music_prefs && profile.music_prefs.length > 0) {
      const userGenre = profile.music_prefs[0]; // Take only the FIRST preference
      const spotifyGenre = validSpotifyGenres[userGenre];
      
      if (spotifyGenre) {
        // Combine user preference with emotion
        searchQueries.push(`${strategy.primary[0]} ${spotifyGenre}`); // e.g., "happy pop"
        console.log(`🎵 Including user preference: ${userGenre} (${spotifyGenre})`);
      }
    }

    console.log(`🔍 Search queries: ${searchQueries.join(", ")}`);
    console.log(`🌎 Using market: ${market}`);

    // Perform searches
    const allTracks: any[] = [];
    const tracksPerSearch = Math.ceil(limit / searchQueries.length);
    
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${tracksPerSearch}&market=${market}`;
      
      try {
        const searchResponse = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.tracks?.items) {
            console.log(`✅ Query "${query}" returned ${searchData.tracks.items.length} tracks`);
            allTracks.push(...searchData.tracks.items);
          }
        } else {
          console.error(`❌ Search failed for "${query}":`, searchResponse.statusText);
        }
      } catch (searchError) {
        console.error(`❌ Search error for "${query}":`, searchError);
      }
    }

    // Remove duplicates by track ID
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );
    
    // Shuffle for variety and take requested amount
    const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
    const selectedTracks = shuffled.slice(0, limit);
    
    console.log(`🎶 Final selection: ${selectedTracks.length} unique tracks`);
    
    // Format recommendations
    const recommendations = selectedTracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || "Unknown Artist",
      album: track.album?.name || "Unknown Album",
      image: track.album?.images?.[0]?.url || "",
      preview_url: track.preview_url,
      external_url: track.external_urls?.spotify || "",
      duration_ms: track.duration_ms
    }));

    return NextResponse.json({ 
      recommendations,
      emotion,
      basedOn: {
        emotion: emotion,
        language: userLanguage,
        market: market,
        primaryMusicPreference: profile?.music_prefs?.[0] || null,
        searchStrategy: strategy.primary.slice(0, 2),
        totalTracks: recommendations.length
      }
    });

  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get personalized recommendations" },
      { status: 500 }
    );
  }
} 