import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing Spotify API credentials...");
    console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID);
    console.log("Client Secret:", process.env.SPOTIFY_CLIENT_SECRET ? "Present" : "Missing");
    
    // Test Spotify access token
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

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token error:", errorText);
      return NextResponse.json({ 
        error: "Failed to get Spotify token", 
        details: errorText,
        status: tokenResponse.status 
      }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();
    console.log("Access token obtained successfully");

    // First, try to get user's market/country info (this should work)
    const marketsResponse = await fetch(
      "https://api.spotify.com/v1/markets",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("Markets response status:", marketsResponse.status);

    if (marketsResponse.ok) {
      const marketsData = await marketsResponse.json();
      console.log("Available markets:", marketsData.markets?.slice(0, 10));
    } else {
      console.log("Markets endpoint failed");
    }

    // Test the Search API instead (Recommendations no longer available for new apps)
    const testSearchResponse = await fetch(
      "https://api.spotify.com/v1/search?q=happy&type=track&limit=1&market=US",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("Search response status:", testSearchResponse.status);

    if (!testSearchResponse.ok) {
      const errorText = await testSearchResponse.text();
      console.error("Search API error:", errorText);
      
      return NextResponse.json({ 
        error: "Search API failed", 
        searchError: `${testSearchResponse.status} - ${errorText}`,
        status: testSearchResponse.status 
      }, { status: 500 });
    }

    const testData = await testSearchResponse.json();
    console.log("Test search successful:", testData.tracks?.items?.[0]?.name || "No track");

    return NextResponse.json({ 
      success: true, 
      message: "Spotify API working perfectly with Search!",
      testTrack: testData.tracks?.items?.[0]?.name || "No track found",
      totalTracks: testData.tracks?.items?.length || 0,
      note: "Using Search API instead of Recommendations (new apps restriction)"
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 