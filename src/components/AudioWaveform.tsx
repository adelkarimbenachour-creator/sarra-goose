import React, { useEffect, useState } from "react";

interface AudioWaveformProps {
  status: "STANDBY" | "LISTENING" | "THINKING" | "EXECUTING" | "SPEAKING";
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ status }) => {
  const [bars, setBars] = useState<number[]>(new Array(24).fill(4));

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setBars((prev) =>
        prev.map(() => {
          let min = 2;
          let max = 6;

          if (status === "LISTENING") {
            min = 6;
            max = 32;
          } else if (status === "SPEAKING") {
            min = 4;
            max = 24;
          } else if (status === "THINKING") {
            min = 8;
            max = 14;
          } else if (status === "EXECUTING") {
            min = 3;
            max = 10;
          } else {
            // STANDBY - idle hum
            min = 2;
            max = 5;
          }

          const target = Math.floor(Math.random() * (max - min + 1)) + min;
          // Lissage simple
          return Math.max(2, Math.floor(target));
        })
      );

      // Ralentir la vitesse de rafraîchissement visuelle pour le confort
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(animate);
      }, 70);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]);

  const getColorClass = () => {
    switch (status) {
      case "LISTENING":
        return "bg-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.6)]";
      case "THINKING":
        return "bg-[#00D1FF]/70 shadow-[0_0_8px_rgba(0,209,255,0.4)]";
      case "EXECUTING":
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
      case "SPEAKING":
        return "bg-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.8)]";
      case "STANDBY":
      default:
        return "bg-zinc-700/60 shadow-[0_0_3px_rgba(0,209,255,0.1)]";
    }
  };

  return (
    <div id="audio-waveform-container" className="flex items-end justify-center gap-[3px] h-12 px-4 py-2 bg-[#050505] rounded-xl border border-[#1A1A1A] backdrop-blur-sm select-none">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-[4px] rounded-full ${getColorClass()}`}
          style={{ 
            height: `${height * 3}px`,
            transition: "height 75ms ease-out, background-color 600ms ease-in-out, box-shadow 600ms ease-in-out"
          }}
        />
      ))}
    </div>
  );
};
