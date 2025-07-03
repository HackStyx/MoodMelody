import { NextRequest, NextResponse } from 'next/server';

// Emotion to Spotify audio features mapping
const emotionToAudioFeatures: Record<string, any> = {
  joy: {
    valence: 0.8,        // High positivity
    energy: 0.7,         // High energy
    danceability: 0.7,   // Danceable
    tempo: 120,          // Moderate to fast tempo
    genre_seeds: ['pop', 'dance', 'happy']
  },
  love: {
    valence: 0.7,
    energy: 0.5,
    danceability: 0.6,
    tempo: 100,
    genre_seeds: ['romance', 'r-n-b', 'soul']
  },
  sadness: {
    valence: 0.2,        // Low positivity
    energy: 0.3,         // Low energy
    danceability: 0.3,   // Not very danceable
    tempo: 80,           // Slow tempo
    genre_seeds: ['indie', 'blues', 'sad']
  },
  anger: {
    valence: 0.3,
    energy: 0.9,         // Very high energy
    danceability: 0.5,
    tempo: 140,          // Fast tempo
    genre_seeds: ['metal', 'punk', 'rock']
  },
  fear: {
    valence: 0.2,
    energy: 0.4,
    danceability: 0.3,
    tempo: 90,
    genre_seeds: ['ambient', 'dark-ambient', 'chill']
  },
  surprise: {
    valence: 0.6,
    energy: 0.6,
    danceability: 0.6,
    tempo: 110,
    genre_seeds: ['electronic', 'indie-pop', 'alternative']
  }
};

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { emotion, limit = 10 } = await request.json();

    if (!emotion) {
      return NextResponse.json({ error: 'Emotion is required' }, { status: 400 });
    }

    const audioFeatures = emotionToAudioFeatures[emotion.toLowerCase()] || emotionToAudioFeatures.joy;
    const token = await getSpotifyToken();

    // Use Search API instead of Recommendations (no longer available for new apps)
    const emotionQueries: Record<string, string[]> = {
      joy: ["happy music", "upbeat songs", "cheerful"],
      love: ["romantic music", "love songs", "sweet"],
      sadness: ["sad music", "melancholy", "emotional"],
      anger: ["rock music", "aggressive", "intense"],
      fear: ["calm music", "ambient", "peaceful"],
      surprise: ["electronic music", "experimental", "unique"]
    };

    const queries = emotionQueries[emotion.toLowerCase()] || emotionQueries.joy;
    const allTracks: any[] = [];

    // Perform searches for variety
    for (const query of queries.slice(0, 2)) {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${Math.ceil(limit / 2)}&market=US`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.tracks?.items) {
          allTracks.push(...searchData.tracks.items);
        }
      }
    }

    // Remove duplicates and shuffle
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );
    
    const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
    const data = { tracks: shuffled.slice(0, limit) };
    
    // Format the response
    const recommendations = data.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      image: track.album.images[0]?.url || '',
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      duration_ms: track.duration_ms
    }));

    return NextResponse.json({
      emotion,
      audioFeatures,
      recommendations
    });
  } catch (error) {
    console.error('Spotify recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get music recommendations' }, 
      { status: 500 }
    );
  }
} 