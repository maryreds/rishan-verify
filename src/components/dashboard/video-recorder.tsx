"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Circle,
  Square,
  Upload,
  RotateCcw,
  Loader2,
  Play,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

type RecordingState =
  | "idle"
  | "recording"
  | "preview"
  | "uploading"
  | "transcribing"
  | "done";

interface VideoRecorderProps {
  user: User;
  profile: Profile | null;
}

export default function VideoRecorder({ user, profile }: VideoRecorderProps) {
  const router = useRouter();
  const supabase = createClient();

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<RecordingState>(
    profile?.video_intro_url ? "done" : "idle"
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState<string | null>(
    profile?.video_intro_transcript || null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(
    profile?.video_intro_url || null
  );

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Camera access denied", {
        description:
          "Please allow camera and microphone access in your browser settings.",
      });
    }
  }

  async function startRecording() {
    chunksRef.current = [];
    setSeconds(0);
    setRecordedBlob(null);
    setRecordedUrl(null);

    await startCamera();

    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setState("preview");
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setState("recording");

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }

  function reRecord() {
    cleanup();
    setRecordedBlob(null);
    setRecordedUrl(null);
    setSeconds(0);
    setState("idle");
  }

  async function handleUpload() {
    if (!recordedBlob) return;

    setState("uploading");

    try {
      const filePath = `${user.id}/${Date.now()}-intro.webm`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, recordedBlob, {
          contentType: "video/webm",
        });

      if (uploadError) {
        toast.error("Upload failed", { description: uploadError.message });
        setState("preview");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          video_intro_url: publicUrl,
          video_intro_duration: seconds,
        })
        .eq("id", user.id);

      if (updateError) {
        toast.error("Failed to update profile", {
          description: updateError.message,
        });
        setState("preview");
        return;
      }

      setVideoUrl(publicUrl);
      toast.success("Video uploaded successfully");

      // Transcribe
      setState("transcribing");

      try {
        const res = await fetch("/api/ai/transcribe-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: publicUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          setTranscript(data.transcript);
          toast.success("Transcript generated");
        } else {
          toast.error("Transcription failed");
        }
      } catch {
        toast.error("Transcription failed");
      }

      setState("done");
      router.refresh();
    } catch {
      toast.error("Upload failed");
      setState("preview");
    }
  }

  function formatTime(s: number): string {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Video Intro</h1>
        <p className="text-sm text-muted-foreground">
          Record a short video introduction to stand out to employers.
        </p>
      </div>

      {/* Existing video */}
      {state === "done" && videoUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Your Video Intro
                </CardTitle>
                <CardDescription>
                  {profile?.video_intro_duration
                    ? `Duration: ${formatTime(profile.video_intro_duration)}`
                    : seconds > 0
                      ? `Duration: ${formatTime(seconds)}`
                      : null}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={reRecord}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-record
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              >
                <track kind="captions" />
              </video>
            </div>

            {transcript && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Transcript</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {transcript}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Idle state - prompt to record */}
      {state === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Record Your Introduction
            </CardTitle>
            <CardDescription>
              Introduce yourself in 30-60 seconds. What makes you unique as a
              professional?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/50">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Your video intro helps employers get to know you beyond your
                resume. Keep it natural and authentic.
              </p>
              <Button onClick={startRecording}>
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Tips for a great video intro:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Find a quiet, well-lit space</li>
                <li>Look at the camera, not the screen</li>
                <li>Mention your name, role, and what you bring to a team</li>
                <li>Keep it between 30-60 seconds</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recording state */}
      {state === "recording" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              Recording...
              <Badge variant="destructive" className="ml-auto font-mono">
                {formatTime(seconds)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Introduce yourself in 30-60 seconds. What makes you unique as a
              professional?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              >
                <track kind="captions" />
              </video>
            </div>

            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                onClick={stopRecording}
                className="rounded-full px-8"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview state */}
      {state === "preview" && recordedUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Your Recording</CardTitle>
            <CardDescription>
              Review your video before uploading. Duration: {formatTime(seconds)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={videoPlaybackRef}
                src={recordedUrl}
                controls
                className="w-full h-full object-contain"
              >
                <track kind="captions" />
              </video>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reRecord}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-record
              </Button>
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading state */}
      {state === "uploading" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium">Uploading your video...</p>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a moment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transcribing state */}
      {state === "transcribing" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium">
              Generating transcript with AI...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Almost there
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
