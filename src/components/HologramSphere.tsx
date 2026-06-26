import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface HologramSphereProps {
  status: "STANDBY" | "LISTENING" | "THINKING" | "EXECUTING" | "SPEAKING";
}

export const HologramSphere: React.FC<HologramSphereProps> = ({ status }) => {
  // Configurer les valeurs de transition selon le statut
  const getMotionConfig = () => {
    switch (status) {
      case "LISTENING":
        return {
          scale: 1.05,
          borderColor: "rgba(0, 209, 255, 0.85)",
          backgroundColor: "rgba(0, 209, 255, 0.12)",
          boxShadow: "0 0 35px rgba(0, 209, 255, 0.45)",
          outerRingScale: 1.0,
          outerRingDuration: 4,
          midRingDuration: 8,
          coreGlow: "0 0 20px #00D1FF",
          glowColor: "#00D1FF",
          textColor: "text-[#00D1FF]",
          statusLabel: "LISTENING",
        };
      case "THINKING":
        return {
          scale: 1.02,
          borderColor: "rgba(0, 209, 255, 0.65)",
          backgroundColor: "rgba(0, 209, 255, 0.08)",
          boxShadow: "0 0 25px rgba(0, 209, 255, 0.3)",
          outerRingScale: 0.98,
          outerRingDuration: 1.2,
          midRingDuration: 2.4,
          coreGlow: "0 0 20px #00D1FF",
          glowColor: "#00D1FF",
          textColor: "text-[#00D1FF]",
          statusLabel: "THINKING",
        };
      case "EXECUTING":
        return {
          scale: 1.08,
          borderColor: "rgba(239, 68, 68, 0.85)",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          boxShadow: "0 0 35px rgba(239, 68, 68, 0.4)",
          outerRingScale: 1.02,
          outerRingDuration: -6, // sign indicates direction
          midRingDuration: -10,
          coreGlow: "0 0 20px #ef4444",
          glowColor: "#ef4444",
          textColor: "text-red-400",
          statusLabel: "EXECUTING",
        };
      case "SPEAKING":
        return {
          scale: 1.1,
          borderColor: "rgba(0, 209, 255, 0.95)",
          backgroundColor: "rgba(0, 209, 255, 0.18)",
          boxShadow: "0 0 45px rgba(0, 209, 255, 0.55)",
          outerRingScale: 1.04,
          outerRingDuration: 2,
          midRingDuration: 5,
          coreGlow: "0 0 25px #00D1FF",
          glowColor: "#00D1FF",
          textColor: "text-[#00D1FF]",
          statusLabel: "SPEAKING",
        };
      case "STANDBY":
      default:
        return {
          scale: 0.95,
          borderColor: "rgba(40, 40, 40, 0.6)",
          backgroundColor: "rgba(26, 26, 26, 0.4)",
          boxShadow: "0 0 15px rgba(0, 209, 255, 0.05)",
          outerRingScale: 0.95,
          outerRingDuration: 15,
          midRingDuration: 25,
          coreGlow: "0 0 8px rgba(0, 209, 255, 0.1)",
          glowColor: "rgba(0, 209, 255, 0.2)",
          textColor: "text-gray-500",
          statusLabel: "STANDBY",
        };
    }
  };

  const config = getMotionConfig();

  // Pour gérer la rotation infinie contrôlée en durée par motion
  const outerRotateDir = config.outerRingDuration < 0 ? -360 : 360;
  const outerDuration = Math.abs(config.outerRingDuration);

  const midRotateDir = config.midRingDuration < 0 ? -360 : 360;
  const midDuration = Math.abs(config.midRingDuration);

  return (
    <div id="hologram-container" className="relative flex items-center justify-center w-64 h-64 mx-auto select-none">
      {/* Ondes de propagation pour le mode SPEAKING */}
      <AnimatePresence>
        {status === "SPEAKING" && (
          <>
            <motion.div
              key="ping1"
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 border border-[#00D1FF]/40 rounded-full pointer-events-none"
            />
            <motion.div
              key="ping2"
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
              className="absolute inset-0 border border-[#00D1FF]/20 rounded-full pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Anneau Extérieur Rotatif */}
      <motion.div
        id="hologram-outer-ring"
        animate={{
          rotate: outerRotateDir,
          scale: config.outerRingScale,
          borderColor: config.borderColor,
        }}
        transition={{
          rotate: { repeat: Infinity, ease: "linear", duration: outerDuration },
          scale: { duration: 0.6, ease: "easeInOut" },
          borderColor: { duration: 0.6, ease: "easeInOut" },
        }}
        className="absolute inset-0 border-2 rounded-full border-t-transparent border-b-transparent pointer-events-none"
      />

      {/* Anneau Médian */}
      <motion.div
        id="hologram-mid-ring"
        animate={{
          rotate: -midRotateDir,
          scale: config.outerRingScale * 0.9,
          borderColor: config.borderColor,
        }}
        transition={{
          rotate: { repeat: Infinity, ease: "linear", duration: midDuration },
          scale: { duration: 0.6, ease: "easeInOut" },
          borderColor: { duration: 0.6, ease: "easeInOut" },
        }}
        className="absolute inset-4 border border-dashed rounded-full border-r-transparent border-l-transparent opacity-70 pointer-events-none"
      />

      {/* Cœur Centrale (Arc Reactor) */}
      <motion.div
        id="hologram-core"
        animate={{
          scale: config.scale,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          boxShadow: config.boxShadow,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
        className="absolute inset-10 rounded-full flex flex-col items-center justify-center border-2 backdrop-blur-sm pointer-events-none z-10"
      >
        {/* Pulsation interne additionnelle selon le mode */}
        <motion.div
          animate={
            status === "STANDBY"
              ? { scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }
              : status === "LISTENING"
              ? { scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }
              : status === "THINKING"
              ? { scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }
              : status === "EXECUTING"
              ? { scale: [1, 1.03, 1], opacity: [0.4, 0.8, 0.4] }
              : { scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] } // SPEAKING
          }
          transition={{
            repeat: Infinity,
            duration: status === "THINKING" ? 0.8 : status === "LISTENING" ? 1.2 : status === "EXECUTING" ? 0.5 : 2,
            ease: "easeInOut",
          }}
          className="absolute inset-1 border border-[#00D1FF]/20 rounded-full"
        />

        {/* Lignes technologiques intérieures */}
        <div className="absolute inset-2 border border-[#00D1FF]/10 rounded-full opacity-30" />
        <div className="absolute w-full h-[1px] bg-[#00D1FF]/5 rotate-45" />
        <div className="absolute w-full h-[1px] bg-[#00D1FF]/5 -rotate-45" />

        {/* Cœur Brillant */}
        <motion.div
          animate={{
            boxShadow: config.coreGlow,
            borderColor: config.borderColor,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center z-20"
        >
          <motion.div
            animate={{
              borderColor: config.glowColor,
            }}
            transition={{ duration: 0.6 }}
            className="w-5 h-5 rounded-full bg-[#050505] border-2"
          />
        </motion.div>

        {/* Petit libellé de protocole */}
        <div className="absolute bottom-4 text-[9px] font-mono tracking-widest text-center opacity-70">
          <span className={config.textColor}>SR-01</span>
        </div>
      </motion.div>

      {/* Effets de grille et points décoratifs */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_60%,rgba(5,5,5,0.85))] pointer-events-none" />
    </div>
  );
};
