import { NextRequest, NextResponse } from 'next/server';

// Gemini API keys - primary and fallback (from environment variables only)
const GEMINI_PRIMARY_KEY = process.env.GEMINI_API_KEY;
const GEMINI_FALLBACK_KEY = process.env.GEMINI_FALLBACK_API_KEY;

// Available Gemini models in priority order
const GEMINI_MODELS = [
  'gemini-2.5-flash',        // Default: Fast and efficient
  'gemini-2.5-pro',          // Fallback 1: More capable
  'gemini-flash-latest',      // Fallback 2: Always latest flash
  'gemini-pro-latest'         // Fallback 3: Always latest pro
];

// Gemini API for emotion detection
async function detectEmotionWithGemini(
  text: string, 
  apiKey: string, 
  model: string,
  keyLabel: string
): Promise<{
  emotion: string;
  confidence: number;
  reasoning: string;
}> {
  const prompt = `Analyze the emotional content of this text and classify it into one of these emotions: joy, sadness, anger, fear, love, surprise.

Text: "${text}"

Respond with ONLY a JSON object in this exact format:
{
  "emotion": "sadness",
  "confidence": 0.85,
  "reasoning": "The text expresses feeling sad, which clearly indicates sadness emotion"
}

Valid emotions: joy, sadness, anger, fear, love, surprise
Confidence should be between 0.0 and 1.0`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent results
          maxOutputTokens: 200,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${keyLabel}, ${model}): ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  if (!content) {
    throw new Error(`No response from Gemini API (${keyLabel}, ${model})`);
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the response
    const validEmotions = ['joy', 'sadness', 'anger', 'fear', 'love', 'surprise'];
    if (!validEmotions.includes(result.emotion)) {
      throw new Error('Invalid emotion returned');
    }
    
    return {
      emotion: result.emotion,
      confidence: Math.min(Math.max(result.confidence || 0.5, 0.0), 1.0),
      reasoning: result.reasoning || ''
    };
    
  } catch (parseError) {
    console.error(`Failed to parse Gemini response (${keyLabel}, ${model}):`, content);
    throw new Error('Failed to parse emotion detection response');
  }
}

// Try Gemini API with all models and keys as fallbacks
async function detectEmotionWithLLM(text: string): Promise<{
  emotion: string;
  confidence: number;
  reasoning: string;
  source: string;
}> {
  // Check if at least one key is available
  if (!GEMINI_PRIMARY_KEY && !GEMINI_FALLBACK_KEY) {
    throw new Error('No Gemini API keys configured');
  }

  // Try each model with primary key first, then fallback key
  for (const model of GEMINI_MODELS) {
    // Try primary key if available
    if (GEMINI_PRIMARY_KEY) {
      try {
        console.log(`Attempting Gemini API with model ${model} (primary key)...`);
        const result = await detectEmotionWithGemini(text, GEMINI_PRIMARY_KEY, model, 'primary');
        return { 
          ...result, 
          source: `gemini-primary-${model.replace('gemini-', '').replace(/-/g, '_')}` 
        };
      } catch (primaryError) {
        console.log(`Primary key failed with ${model}, trying fallback key...`);
      }
    }
    
    // Try fallback key with same model if available
    if (GEMINI_FALLBACK_KEY) {
      try {
        console.log(`Attempting Gemini API with model ${model} (fallback key)...`);
        const result = await detectEmotionWithGemini(text, GEMINI_FALLBACK_KEY, model, 'fallback');
        return { 
          ...result, 
          source: `gemini-fallback-${model.replace('gemini-', '').replace(/-/g, '_')}` 
        };
      } catch (fallbackError) {
        console.log(`Both keys failed with ${model}, trying next model...`);
        // Continue to next model
        continue;
      }
    }
  }
  
  // All models and keys failed
  throw new Error('All Gemini API models and keys failed');
}

// AI Analysis function using Gemini API with all models and keys as fallbacks
async function handleAIAnalysis(prompt: string): Promise<NextResponse> {
  // Check if at least one key is available
  if (!GEMINI_PRIMARY_KEY && !GEMINI_FALLBACK_KEY) {
    return NextResponse.json({
      analysis: 'AI analysis is currently unavailable. However, your consistent mood tracking shows great self-awareness and commitment to emotional well-being.'
    });
  }

  // Try each model with primary key first, then fallback key
  for (const model of GEMINI_MODELS) {
    // Try primary key if available
    if (GEMINI_PRIMARY_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_PRIMARY_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (analysis) {
          console.log(`AI Analysis successful with ${model} (primary key)`);
          return NextResponse.json({
            analysis: analysis
          });
        }
      } else {
        console.warn(`Gemini primary key failed with ${model}: ${response.status} ${response.statusText}`);
      }
      } catch (error) {
        console.warn(`Gemini primary key error with ${model}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Try fallback key with same model if available
    if (GEMINI_FALLBACK_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_FALLBACK_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        
        if (analysis) {
          console.log(`AI Analysis successful with ${model} (fallback key)`);
          return NextResponse.json({
            analysis: analysis
          });
        }
      } else {
        console.warn(`Gemini fallback key failed with ${model}: ${response.status} ${response.statusText}`);
      }
      } catch (error) {
        console.warn(`Gemini fallback key error with ${model}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // All models and keys failed, return fallback message
  console.warn('All Gemini models and keys failed for AI analysis, using fallback message');
  return NextResponse.json({
    analysis: 'Your mood tracking shows dedication to emotional growth. Keep journaling to discover patterns and insights about your emotional well-being.'
  });
}

export async function POST(request: NextRequest) {
  let text = '';
  
  try {
    const body = await request.json();
    text = body.text || '';
    const isAnalysis = body.isAnalysis || false;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
    }

    // Handle AI analysis requests
    if (isAnalysis) {
      return await handleAIAnalysis(text);
    }

    console.log(`Processing emotion detection for: "${text}"`);

    // Try Gemini API first (with automatic fallback between keys)
    try {
      console.log('Attempting Gemini API with automatic key fallback...');
      
      const llmResult = await detectEmotionWithLLM(text);
      
      console.log(`Gemini detected: ${llmResult.emotion} (${(llmResult.confidence * 100).toFixed(1)}%)`);
      console.log(`Reasoning: ${llmResult.reasoning}`);
      console.log(`Source: ${llmResult.source}`);

      return NextResponse.json({
        emotion: llmResult.emotion,
        confidence: llmResult.confidence,
        reasoning: llmResult.reasoning,
        source: llmResult.source
      });
      
    } catch (error) {
      console.log('Gemini API failed (both keys), using keyword fallback:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Use enhanced fallback detection
    console.log('Using enhanced keyword fallback...');
    const fallbackResult = getEnhancedFallbackEmotion(text);
    
    console.log(`Fallback detected: ${fallbackResult.emotion} (${(fallbackResult.confidence * 100).toFixed(1)}%)`);

    return NextResponse.json({
      emotion: fallbackResult.emotion,
      confidence: fallbackResult.confidence,
      source: 'enhanced-fallback',
      matchedKeywords: fallbackResult.matchedKeywords,
      scores: fallbackResult.scores
    });

  } catch (error) {
    console.error('Emotion detection failed completely:', error);
    
    return NextResponse.json({
      emotion: 'joy',
      confidence: 0.1,
      source: 'default-fallback',
      error: 'All emotion detection methods failed'
    }, { status: 200 }); // Still return 200 to not break the UI
  }
}

// Enhanced fallback emotion detection with better scoring
function getEnhancedFallbackEmotion(text: string): {
  emotion: string;
  confidence: number;
  matchedKeywords: string[];
  scores: Record<string, number>;
} {
  if (!text) {
    return {
      emotion: 'joy',
      confidence: 0.1,
      matchedKeywords: [],
      scores: {}
    };
  }
  
  const lowerText = text.toLowerCase().trim();
  
  // Enhanced emotion keywords with weights
  const emotionKeywords = {
    sadness: [
      // Direct expressions (high weight)
      { phrase: 'feeling sad', weight: 5 },
      { phrase: 'i am sad', weight: 5 },
      { phrase: 'feel sad', weight: 4 },
      { phrase: 'so sad', weight: 4 },
      
      // Strong indicators (medium-high weight)
      { phrase: 'depressed', weight: 4 },
      { phrase: 'heartbroken', weight: 4 },
      { phrase: 'devastated', weight: 4 },
      { phrase: 'crying', weight: 3 },
      { phrase: 'tears', weight: 3 },
      
      // Common words (medium weight)
      { phrase: 'sad', weight: 3 },
      { phrase: 'down', weight: 2 },
      { phrase: 'upset', weight: 2 },
      { phrase: 'hurt', weight: 2 },
      { phrase: 'pain', weight: 2 },
      { phrase: 'lost', weight: 2 },
      { phrase: 'lonely', weight: 2 },
      { phrase: 'empty', weight: 2 },
      { phrase: 'blue', weight: 1 },
      { phrase: 'low', weight: 1 }
    ],
    
    joy: [
      { phrase: 'feeling happy', weight: 5 },
      { phrase: 'so happy', weight: 4 },
      { phrase: 'excited', weight: 3 },
      { phrase: 'amazing', weight: 3 },
      { phrase: 'wonderful', weight: 3 },
      { phrase: 'fantastic', weight: 3 },
      { phrase: 'great', weight: 2 },
      { phrase: 'happy', weight: 3 },
      { phrase: 'joy', weight: 3 },
      { phrase: 'awesome', weight: 2 },
      { phrase: 'brilliant', weight: 2 },
      { phrase: 'good', weight: 1 }
    ],
    
    anger: [
      { phrase: 'so angry', weight: 5 },
      { phrase: 'feeling angry', weight: 5 },
      { phrase: 'pissed off', weight: 4 },
      { phrase: 'furious', weight: 4 },
      { phrase: 'rage', weight: 4 },
      { phrase: 'angry', weight: 3 },
      { phrase: 'mad', weight: 3 },
      { phrase: 'frustrated', weight: 2 },
      { phrase: 'annoyed', weight: 2 },
      { phrase: 'hate', weight: 2 }
    ],
    
    fear: [
      { phrase: 'feeling scared', weight: 5 },
      { phrase: 'so scared', weight: 4 },
      { phrase: 'terrified', weight: 4 },
      { phrase: 'anxious', weight: 3 },
      { phrase: 'worried', weight: 3 },
      { phrase: 'afraid', weight: 3 },
      { phrase: 'scared', weight: 3 },
      { phrase: 'nervous', weight: 2 },
      { phrase: 'panic', weight: 2 }
    ],
    
    love: [
      { phrase: 'in love', weight: 5 },
      { phrase: 'feeling loved', weight: 4 },
      { phrase: 'romantic', weight: 3 },
      { phrase: 'love', weight: 3 },
      { phrase: 'adore', weight: 3 },
      { phrase: 'heart', weight: 2 },
      { phrase: 'caring', weight: 2 }
    ],
    
    surprise: [
      { phrase: 'so surprised', weight: 4 },
      { phrase: 'unexpected', weight: 3 },
      { phrase: 'shocked', weight: 3 },
      { phrase: 'amazed', weight: 3 },
      { phrase: 'wow', weight: 2 },
      { phrase: 'surprised', weight: 3 }
    ]
  };
  
  // Calculate scores for each emotion
  const emotionScores: Record<string, number> = {};
  const matchedKeywords: string[] = [];
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let totalScore = 0;
    
    for (const { phrase, weight } of keywords) {
      if (lowerText.includes(phrase)) {
        totalScore += weight;
        matchedKeywords.push(phrase);
      }
    }
    
    emotionScores[emotion] = totalScore;
  }
  
  // Find the emotion with the highest score
  const sortedEmotions = Object.entries(emotionScores)
    .sort(([,a], [,b]) => b - a);
  
  const topEmotion = sortedEmotions[0];
  const topScore = topEmotion[1];
  
  // Calculate confidence based on score
  let confidence = 0.1; // minimum confidence
  if (topScore > 0) {
    confidence = Math.min(0.85, 0.3 + (topScore * 0.1)); // Cap at 85%
  }
  
  const detectedEmotion = topScore > 0 ? topEmotion[0] : 'joy';
  
  return {
    emotion: detectedEmotion,
    confidence,
    matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
    scores: emotionScores
  };
} 