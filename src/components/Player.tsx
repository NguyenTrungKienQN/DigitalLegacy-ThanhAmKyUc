"use client";

import {
  ChevronLeft,
  Settings,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CassetteTape,
  Image as ImageIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import EmbossButton from "@/components/EmbossButton";
import { msToClock } from "@/lib/recording";
import { useObjectUrl } from "@/lib/useObjectUrl";

type Props = {
  blob: Blob;
  mime: string;
  /** Optional duration captured at record-time (ms). Used when browser reports Infinity/NaN for MediaRecorder blobs. */
  knownDurationMs?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function Player({ blob, mime, knownDurationMs }: Props) {
  const src = useObjectUrl(blob);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const triedInfinityFixRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [posMs, setPosMs] = useState(0);
  const [durMs, setDurMs] = useState<number>(() =>
    Number.isFinite(knownDurationMs ?? 0) ? (knownDurationMs ?? 0) : 0
  );

  // If a new blob is shown, reset UI state.
  useEffect(() => {
    setPlaying(false);
    setPosMs(0);
    // Keep durMs as knownDurationMs (if provided) until metadata loads.
    setDurMs(Number.isFinite(knownDurationMs ?? 0) ? (knownDurationMs ?? 0) : 0);
    triedInfinityFixRef.current = false;
  }, [src, knownDurationMs]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    // When `src` changes (new blob), ensure the media element reloads and emits metadata/events.
    // Without including `src` in deps, this effect would only run once (often before `src` exists),
    // causing time/slider to never update.
    try {
      a.load();
    } catch {}

    const updatePos = () => setPosMs((a.currentTime || 0) * 1000);

    const updateDur = () => {
      const d = a.duration;
      if (Number.isFinite(d) && d > 0) {
        setDurMs(d * 1000);
        return;
      }
      if (Number.isFinite(knownDurationMs ?? 0) && (knownDurationMs ?? 0) > 0) {
        setDurMs(knownDurationMs!);
      } else {
        setDurMs(0);
      }
    };

    // Some MediaRecorder webm/opus blobs report duration as Infinity/NaN/0 until near the end.
    // Force the browser to compute duration early by seeking far forward once.
    const onLoadedMetadata = () => {
      const d = a.duration;
      if (Number.isFinite(d) && d > 0) {
        updateDur();
        return;
      }
      if (!triedInfinityFixRef.current) {
        triedInfinityFixRef.current = true;
        const prior = a.currentTime || 0;
        const onTimeUpdate = () => {
          a.removeEventListener("timeupdate", onTimeUpdate);
          // Restore position and re-read duration
          try {
            a.currentTime = prior;
          } catch {}
          updateDur();
          updatePos();
        };
        a.addEventListener("timeupdate", onTimeUpdate);
        try {
          // Very large seek triggers duration calculation for some containers
          a.currentTime = 1e101;
        } catch {
          // If seek fails, just fall back to knownDurationMs (if any)
          a.removeEventListener("timeupdate", onTimeUpdate);
          updateDur();
        }
        return;
      }
      updateDur();
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    a.addEventListener("timeupdate", updatePos);
    a.addEventListener("loadedmetadata", onLoadedMetadata);
    a.addEventListener("durationchange", updateDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    // In case metadata is already available
    updateDur();
    updatePos();

    return () => {
      a.removeEventListener("timeupdate", updatePos);
      a.removeEventListener("loadedmetadata", onLoadedMetadata);
      a.removeEventListener("durationchange", updateDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [src, knownDurationMs]);

  const maxMs = useMemo(() => {
    // For slider max: prefer known/metadata duration; fall back to current position so slider doesn't break.
    if (Number.isFinite(durMs) && durMs > 0) return durMs;
    if (Number.isFinite(posMs) && posMs > 0) return posMs;
    return 1;
  }, [durMs, posMs]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const seekBy = (deltaMs: number) => {
    const a = audioRef.current;
    if (!a) return;
    const target = clamp(a.currentTime * 1000 + deltaMs, 0, maxMs);
    a.currentTime = target / 1000;
  };

  const scrubTo = (valueMs: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = clamp(valueMs, 0, maxMs) / 1000;
  };

  if (!src) return null;

  return (
    <div className="w-full">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between text-xs text-stone-600">
        <span>{msToClock(posMs)}</span>
        <span>{msToClock(durMs)}</span>
      </div>

      <input
        className="w-full mt-2 accent-sky-600"
        type="range"
        min={0}
        max={maxMs}
        value={clamp(posMs, 0, maxMs)}
        onChange={(e) => scrubTo(Number(e.target.value))}
      />

      <div className="flex items-center justify-between gap-3 mt-3">
        <EmbossButton onClick={() => seekBy(-10_000)} className="min-w-[86px]">
          <span className="inline-flex items-center gap-2 justify-center">
            <RotateCcw className="h-4 w-4" strokeWidth={2.3} />
            10s
          </span>
        </EmbossButton>

        <EmbossButton onClick={toggle} className="flex-1">
          <span className="inline-flex items-center gap-2 justify-center">
            {playing ? (
              <>
                <Pause className="h-4 w-4" strokeWidth={2.3} />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="h-4 w-4" strokeWidth={2.3} />
                Phát
              </>
            )}
          </span>
        </EmbossButton>

        <EmbossButton onClick={() => seekBy(10_000)} className="min-w-[86px]">
          <span className="inline-flex items-center gap-2 justify-center">
            10s
            <RotateCw className="h-4 w-4" strokeWidth={2.3} />
          </span>
        </EmbossButton>
      </div>

      <div className="mt-2 text-[11px] text-stone-500">mime: {mime}</div>
    </div>
  );
}
