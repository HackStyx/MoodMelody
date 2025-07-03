# MoodMelody Setup Guide

This guide will help you set up the required API keys for emotion detection and music recommendations.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

## Required API Keys

### 1. Emotion Detection API (Choose One)

#### Option A: OpenRouter API (Recommended - More Reliable)

**Steps:**
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Create a free account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy the key and add it to your `.env.local` file:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

**Benefits:**
- ✅ Uses Mistral Small 24B model (free)
- ✅ More accurate than keyword detection
- ✅ Provides reasoning for emotions
- ✅ Better reliability and uptime
- ✅ Free tier available

#### Option B: Hugging Face API (Alternative)

**Steps:**
1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account or sign in
3. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "MoodMelody")
6. Select "Read" permission
7. Copy the token and add it to your `.env.local` file:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

**Note:** Hugging Face API has been experiencing reliability issues. OpenRouter is recommended.

#### Option C: No API Key (Fallback)

If you don't set up either API key, the system will use an enhanced keyword-based emotion detection system that works well for basic emotion recognition.

### 2. Spotify Web API Credentials

The music recommendation feature uses Spotify's Web API to find tracks based on emotional audio features.

**Steps:**
1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the details:
   - **App name**: MoodMelody
   - **App description**: Emotion-based music recommendations
   - **Redirect URI**: `http://localhost:3000` (for development)
   - **APIs used**: Web API
5. Click "Save"
6. Copy your Client ID and Client Secret
7. Add them to your `.env.local` file:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

## Features

### Emotion Detection
- **Primary**: Mistral Small 24B via OpenRouter (recommended)
- **Alternative**: DistilBERT via Hugging Face
- **Fallback**: Enhanced keyword-based detection
- Detects: joy, love, sadness, anger, fear, surprise
- Provides confidence scores and reasoning

### Music Recommendations
- Maps emotions to Spotify audio features:
  - **Joy**: High valence, danceable, upbeat tempo
  - **Love**: Romantic, moderate energy, R&B/soul genres
  - **Sadness**: Low valence, slow tempo, indie/blues
  - **Anger**: High energy, fast tempo, rock/metal
  - **Fear**: Low energy, ambient/chill genres
  - **Surprise**: Balanced features, electronic/alternative

### Audio Features Mapping
- **Valence**: Musical positivity (0.0 = negative, 1.0 = positive)
- **Energy**: Perceptual measure of intensity (0.0 = low, 1.0 = high)
- **Danceability**: How suitable for dancing (0.0 = least, 1.0 = most)
- **Tempo**: BPM (beats per minute)

### Language Preferences

The app now supports **language-aware music recommendations** that adapt based on your profile language setting:

#### Supported Languages:
- **English** (US Market) - Default
- **Spanish** (ES Market) - Uses terms like "música", "latino", "hispano"
- **French** (FR Market) - Uses terms like "musique", "chanson", "français"  
- **German** (DE Market) - Uses terms like "musik", "deutsche"
- **Hindi** (IN Market) - Uses terms like "bollywood", "hindi", "desi"
- **Chinese** (TW Market) - Uses terms like "chinese", "mandarin", "c-pop"
- **Japanese** (JP Market) - Uses terms like "japanese", "j-pop", "anime"

#### How It Works:
1. **Set Language**: Go to Profile → Select your preferred language
2. **Get Recommendations**: Click "Get Personalized Recommendations" 
3. **Language Integration**: System adds language-specific search terms to your mood-based queries

#### Example:
```
For Spanish + Sadness emotion:
🔍 Search queries: sad music, melancholy songs, sad música
🌎 Using market: ES (Spain)
🎯 Result: Spanish sad songs mixed with international content
```

#### Testing Language Preferences:
```bash
# Set your language in Profile page, then test:
curl -X POST http://localhost:3000/api/spotify/personalized \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "limit": 6}'
```

## Testing

After setting up your API keys:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard
3. Submit a journal entry with emotional content
4. The system will:
   - Detect the emotion using Hugging Face
   - Generate music recommendations from Spotify
   - Display personalized tracks with preview capability

## Troubleshooting

### Hugging Face Issues
- Ensure your API key has "Read" permissions
- Check if you've exceeded the free tier limits
- Verify the token is correctly formatted in `.env.local`

### Spotify Issues
- Make sure both Client ID and Client Secret are set
- Verify your Spotify app is properly configured
- Check that you're using the correct app credentials

### General Issues
- Restart the development server after adding environment variables
- Check browser console for detailed error messages
- Ensure `.env.local` is in the project root directory 