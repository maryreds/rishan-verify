import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Missing videoUrl" },
        { status: 400 }
      );
    }

    // For now, store a placeholder transcript.
    // A production implementation would download the video, extract the audio
    // track, and send it to OpenAI Whisper for transcription.
    const transcript =
      "Video intro recorded. Transcript will be available after processing.";

    const { error } = await supabase
      .from("profiles")
      .update({
        video_intro_transcript: transcript,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to update transcript:", error);
      return NextResponse.json(
        { error: "Failed to save transcript" },
        { status: 500 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcribe video error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe video" },
      { status: 500 }
    );
  }
}
