# OpenRouter API Setup for MoodMelody

## Quick Setup (2 minutes)

### 1. Get Your Free OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Click "Sign Up" (free account)
3. Go to [API Keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy your API key

### 2. Add to Environment Variables

Add this to your `.env.local` file:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### 3. Test the Emotion Detection

The system now uses **Mistral Small 24B (free model)** for emotion detection:

- **More accurate** than keyword matching
- **Faster** than Hugging Face
- **Free tier** - no costs
- **Reliable** - proper API with good uptime

### 4. What You Get

```json
{
  "emotion": "sadness",
  "confidence": 0.85,
  "reasoning": "The text expresses feeling sad, which clearly indicates sadness emotion",
  "source": "openrouter-mistral"
}
```

### Features:
- ✅ **Smart AI analysis** - Understands context and nuance
- ✅ **Confidence scoring** - Know how sure the AI is
- ✅ **Reasoning** - See why it chose that emotion
- ✅ **Fallback system** - Uses keyword detection if API fails
- ✅ **Free to use** - No API costs for basic usage

### Models Used:
- **Primary**: `mistralai/mistral-small-3.2-24b-instruct:free`
- **Fallback**: Enhanced keyword detection system

That's it! Your emotion detection will now be much more accurate and reliable. 