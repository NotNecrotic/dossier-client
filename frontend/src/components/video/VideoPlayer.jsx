import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  FileText,
  Sparkles,
} from "lucide-react";
import { videoApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatDuration, cx } from "@/lib/format";

const VideoPlayer = ({ videoId, onClose }) => {
  const { seekTarget } = useStore();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeCue, setActiveCue] = useState(null);

  const { data: video } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoApi.get(videoId),
  });
  const { data: subs } = useQuery({
    queryKey: ["subs", videoId],
    queryFn: () => videoApi.subtitles(videoId),
    enabled: !!videoId,
  });

  // AI jump markers — derived from cue positions matching "upgrade" or every ~25%
  const markers = useMemo(() => {
    if (!video || !subs?.cues) return [];
    const keyCues = subs.cues.filter((c) => /upgrad|pc|excited|difference|talk about/i.test(c.text));
    return keyCues.slice(0, 5).map((c) => ({ t: c.start, label: c.text }));
  }, [video, subs]);

  // Apply seek target
  useEffect(() => {
    if (!seekTarget || !videoRef.current) return;
    if (seekTarget.videoId !== videoId) return;
    const el = videoRef.current;
    const seekWhenReady = () => {
      el.currentTime = seekTarget.timestamp || 0;
      el.play().catch(() => {});
    };
    if (el.readyState >= 1) seekWhenReady();
    else el.addEventListener("loadedmetadata", seekWhenReady, { once: true });
  }, [seekTarget, videoId]);

  // Track active cue
  useEffect(() => {
    if (!subs?.cues) return;
    const c = subs.cues.find((x) => current >= x.start && current < x.end);
    setActiveCue(c || null);
  }, [current, subs]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  };

  const seek = (t) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(duration || 0, t));
  };

  if (!video) {
    return (
      <div className="flex h-full items-center justify-center bg-app">
        <span className="font-mono text-xs text-muted">Loading video…</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-app" data-testid="video-player">
      {/* Player toolbar */}
      <div className="flex h-9 items-center justify-between border-b border-app bg-panel px-3">
        <button
          type="button"
          onClick={onClose}
          data-testid="player-back-btn"
          className="flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs text-2nd transition-fast hover:bg-surface-hover hover:text-app"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to library</span>
        </button>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span>{video.filename}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          data-testid="player-transcript-toggle"
          className={cx(
            "flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs transition-fast",
            showTranscript ? "accent-bg-soft accent-text" : "text-2nd hover:bg-surface-hover hover:text-app"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Transcript
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-1 flex-col bg-black">
          <div className="relative flex-1">
            <video
              ref={videoRef}
              src={video.stream_url}
              className="h-full w-full object-contain"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || video.duration)}
              onClick={togglePlay}
              data-testid="player-video-element"
            />
            {/* Subtitle overlay */}
            {activeCue && (
              <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-6">
                <div className="max-w-3xl rounded-[4px] bg-black/70 px-3 py-1.5 text-center text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                  {activeCue.text}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border-t border-app bg-panel px-4 py-3">
            {/* Timeline */}
            <div className="relative mb-3 h-4">
              <input
                type="range"
                min={0}
                max={duration || video.duration}
                step="0.01"
                value={current}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="dossier-range w-full"
                data-testid="player-timeline"
              />
              {/* AI markers */}
              <div className="pointer-events-none absolute inset-x-0 top-1.5 h-1">
                {markers.map((m, i) => (
                  <div
                    key={i}
                    className="absolute h-3 w-0.5 -translate-x-1/2 accent-bg"
                    style={{ left: `${((m.t / (duration || video.duration)) * 100).toFixed(2)}%` }}
                    title={m.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => seek(current - 10)}
                  data-testid="player-skip-back"
                  className="rounded-[4px] p-1.5 text-2nd transition-fast hover:bg-surface-hover hover:text-app"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  data-testid="player-play-btn"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] accent-bg text-black transition-fast hover:opacity-90"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => seek(current + 10)}
                  data-testid="player-skip-fwd"
                  className="rounded-[4px] p-1.5 text-2nd transition-fast hover:bg-surface-hover hover:text-app"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <div className="ml-2 font-mono text-[11px] text-2nd">
                  <span className="text-app">{formatDuration(current)}</span>
                  <span className="mx-1 text-muted">/</span>
                  <span>{formatDuration(duration || video.duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  data-testid="player-mute-btn"
                  className="rounded-[4px] p-1.5 text-2nd transition-fast hover:bg-surface-hover hover:text-app"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setMuted(v === 0);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="dossier-range w-24"
                  data-testid="player-volume"
                />
                <button
                  type="button"
                  onClick={() => videoRef.current?.requestFullscreen?.()}
                  data-testid="player-fullscreen-btn"
                  className="rounded-[4px] p-1.5 text-2nd transition-fast hover:bg-surface-hover hover:text-app"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript sidebar */}
        {showTranscript && (
          <aside
            className="flex w-80 flex-col border-l border-app bg-panel"
            data-testid="player-transcript"
          >
            <div className="flex h-9 items-center justify-between border-b border-app px-3">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-widest text-2nd">
                Transcript
              </span>
              <span className="font-mono text-[10px] text-muted">
                {subs?.cues?.length || 0} cues
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {subs?.cues?.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => seek(c.start)}
                  className={cx(
                    "flex w-full items-start gap-2 rounded-[4px] p-2 text-left text-xs transition-fast",
                    activeCue === c
                      ? "accent-bg-soft text-app"
                      : "hover:bg-surface-hover text-2nd"
                  )}
                >
                  <span className="font-mono text-[10px] text-muted min-w-[42px]">
                    {formatDuration(c.start)}
                  </span>
                  <span>{c.text}</span>
                </button>
              ))}
            </div>
            {markers.length > 0 && (
              <div className="border-t border-app p-3">
                <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                  <Sparkles className="h-3 w-3 accent-text" />
                  AI Jumps
                </div>
                <div className="space-y-1">
                  {markers.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => seek(m.t)}
                      className="flex w-full items-center gap-2 rounded-[3px] px-2 py-1 text-left text-xs text-2nd transition-fast hover:bg-surface-hover hover:text-app"
                    >
                      <span className="font-mono text-[10px] accent-text">
                        {formatDuration(m.t)}
                      </span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
