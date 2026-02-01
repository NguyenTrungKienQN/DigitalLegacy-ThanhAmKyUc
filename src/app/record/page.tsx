"use client";

import CassetteDeck from "@/components/CassetteDeck";
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
import PaperCard from "@/components/PaperCard";
import Header from "@/components/Header";
import EmbossButton from "@/components/EmbossButton";
import { pickAudioMime, requestMicStream, msToClock } from "@/lib/recording";
import { useDraftStore } from "@/lib/draftStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type RecState = "IDLE" | "PREP" | "RECORDING" | "PAUSED" | "STOPPED" | "FAILED";

export default function RecordPage() {
  const r = useRouter();
  const { draft, setRecording } = useDraftStore();

  const [st, setSt] = useState<RecState>("IDLE");
  const [err, setErr] = useState<string>("");
  const [elapsedMs, setElapsedMs] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const t0Ref = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  // Timing refs so MediaRecorder callbacks always see the latest duration.
  // We track *active recording time* (pause doesn't add).
  const elapsedRef = useRef<number>(0);
  const accumRef = useRef<number>(0);

  // waveform
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const canRecord = useMemo(() => typeof window !== "undefined" && !!navigator.mediaDevices && typeof MediaRecorder !== "undefined", []);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const startWaveform = (stream: MediaStream) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      const c = canvasRef.current;
      const a = analyserRef.current;
      if (!c || !a) return;
      const g = c.getContext("2d");
      if (!g) return;

      a.getByteTimeDomainData(data);
      g.clearRect(0, 0, c.width, c.height);

      // paper-ish line
      g.globalAlpha = 0.9;
      g.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * c.width;
        const v = data[i] / 128.0;
        const y = (v * c.height) / 2;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokeStyle = "rgba(42,33,24,0.55)";
      g.lineWidth = 2;
      g.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  };

  const start = async () => {
    setErr("");
    if (!canRecord) {
      setSt("FAILED");
      setErr("Trình duyệt này không hỗ trợ ghi âm (MediaRecorder).");
      return;
    }

    setSt("PREP");
    try {
      const mime = pickAudioMime();
      const stream = await requestMicStream();
      streamRef.current = stream;

      startWaveform(stream);

      chunksRef.current = [];
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mrRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const mimeType = mr.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // IMPORTANT: don't use `elapsedMs` state here (can be stale in this callback).
        // `elapsedRef` is updated by our interval + pause/stop handlers.
        const durationMs = Math.max(0, Math.floor(elapsedRef.current));

        setRecording({ audioBlob: blob, audioMime: mimeType, durationMs });
        setSt("STOPPED");
        r.push("/review");
      };

      mr.start(200);

      // Reset timing for this take
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      accumRef.current = 0;
      elapsedRef.current = 0;
      t0Ref.current = performance.now();
      setElapsedMs(0);
      tickRef.current = window.setInterval(() => {
        const mrNow = mrRef.current;
        const now = performance.now();
        let ms = accumRef.current;
        if (mrNow?.state === "recording") {
          ms = accumRef.current + (now - t0Ref.current);
        }
        ms = Math.max(0, Math.floor(ms));
        elapsedRef.current = ms;
        setElapsedMs(ms);
      }, 200);

      // SFX: cassette “tách” nhẹ (beep cực ngắn)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 850;
        g.gain.value = 0.03;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        setTimeout(() => { o.stop(); ctx.close().catch(() => {}); }, 60);
      } catch {}

      setSt("RECORDING");
    } catch (e: any) {
      setSt("FAILED");
      setErr(e?.message || "Không thể xin quyền micro.");
    }
  };

  const pause = () => {
    const mr = mrRef.current;
    if (!mr) return;
    if (mr.state === "recording") {
      // Add active recording time (exclude paused time)
      const now = performance.now();
      accumRef.current += Math.max(0, now - t0Ref.current);
      const ms = Math.max(0, Math.floor(accumRef.current));
      elapsedRef.current = ms;
      setElapsedMs(ms);
      mr.pause();
      setSt("PAUSED");
    }
  };

  const resume = () => {
    const mr = mrRef.current;
    if (!mr) return;
    if (mr.state === "paused") {
      // Reset resume timestamp
      t0Ref.current = performance.now();
      mr.resume();
      setSt("RECORDING");
    }
  };

  const stop = () => {
    const mr = mrRef.current;
    if (!mr) return;

    // Finalize duration before stopping
    if (mr.state === "recording") {
      const now = performance.now();
      accumRef.current += Math.max(0, now - t0Ref.current);
      const ms = Math.max(0, Math.floor(accumRef.current));
      elapsedRef.current = ms;
      setElapsedMs(ms);
    }

    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;

    try { mr.stop(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

return (
  <div className="min-h-full pb-24">
    <Header title="Đang ghi" />

    <div className="px-4 py-4 space-y-3">
      <PaperCard label="Trang ghi âm">
        <div className="text-sm text-[var(--muted)]">
          Viết vào sổ — nhưng bằng giọng nói.
        </div>
      </PaperCard>

      <CassetteDeck
        title={draft.title || "Ký ức chưa đặt tên"}
        subtitle={draft.narrator ? `Người kể: ${draft.narrator}` : undefined}
        time={msToClock(elapsedMs)}
        spinning={st === "RECORDING"}
      >
        <div className="grid grid-cols-3 gap-2">
          {(st === "IDLE" || st === "FAILED") ? (
            <button
              onClick={start}
              className="col-span-3 key rounded-2xl py-4 font-semibold text-white bg-[var(--accent)]"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ● REC
            </button>
          ) : (
            <>
              <button
                onClick={st === "PAUSED" ? resume : pause}
                className="key rounded-2xl py-3 font-semibold text-white/90 bg-white/10 border border-white/15"
                style={{ background: "rgba(255,255,255,.10)", color: "rgba(255,255,255,.92)", borderColor: "rgba(255,255,255,.15)" }}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  {st === "PAUSED" ? (
                    <>
                      <Play className="h-4 w-4" strokeWidth={2.3} />
                      Tiếp tục
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" strokeWidth={2.3} />
                      Tạm dừng
                    </>
                  )}
                </span>
              </button>
              <button
                onClick={stop}
                className="col-span-2 key rounded-2xl py-3 font-semibold text-white bg-[var(--accent2)]"
                style={{ background: "var(--accent2)", color: "#fff" }}
              >
                ■ Kết thúc & nghe thử
              </button>
            </>
          )}
        </div>

        {err ? <div className="mt-3 text-xs text-red-200">{err}</div> : null}
      </CassetteDeck>
    </div>
  </div>
);
}
