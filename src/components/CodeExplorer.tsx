import React, { useState, useEffect } from "react";
import { codeFiles, CodeFile } from "../data/codeFiles";
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Info,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Activity,
  Server,
  Zap,
  Lock,
  Globe
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface CodeExplorerProps {
  files?: CodeFile[];
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ files }) => {
  const displayFiles = files || codeFiles;
  const [activeFile, setActiveFile] = useState<CodeFile>(displayFiles[0]);
  const [copied, setCopied] = useState<boolean>(false);

  // Mettre à jour le fichier actif si la liste des fichiers change (par exemple après auto-amélioration)
  useEffect(() => {
    const currentActiveIndex = displayFiles.findIndex(f => f.name === activeFile.name);
    if (currentActiveIndex !== -1) {
      setActiveFile(displayFiles[currentActiveIndex]);
    } else {
      setActiveFile(displayFiles[0]);
    }
  }, [files]);

  const handleCopy = () => {
    if (activeFile.language === "recharts") {
      navigator.clipboard.writeText(JSON.stringify({ radarData, pipelineData, dependencies }, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let contentToDownload = activeFile.content;
    let fileName = activeFile.name;
    
    if (activeFile.language === "recharts") {
      contentToDownload = JSON.stringify({ radarData, pipelineData, dependencies }, null, 2);
      fileName = "goose_sarra_relationship_report.json";
    }

    const blob = new Blob([contentToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLanguageHeader = (lang: string) => {
    switch (lang) {
      case "python":
        return "PYTHON SCRIPT";
      case "properties":
        return "REQUIREMENTS";
      case "text":
        return "SYSTEM INSTRUCTIONS";
      case "markdown":
        return "DOCUMENTATION";
      case "recharts":
        return "INTERACTIVE ANALYTICS";
      default:
        return "CODE FILE";
    }
  };

  // Données pour le graphique Radar de complémentarité
  const radarData = [
    { subject: "Audio (VAD)", Sarra: 95, Goose: 20, fullMark: 100 },
    { subject: "Contrôle OS", Sarra: 35, Goose: 98, fullMark: 100 },
    { subject: "Multilingue", Sarra: 90, Goose: 60, fullMark: 100 },
    { subject: "Dév Code", Sarra: 20, Goose: 95, fullMark: 100 },
    { subject: "Émotion", Sarra: 85, Goose: 10, fullMark: 100 },
    { subject: "Outils & MCP", Sarra: 15, Goose: 98, fullMark: 100 }
  ];

  // Données pour le pipeline de latence
  const pipelineData = [
    { name: "Capture VAD", "Traitement Local": 40, "Transit Réseau": 5 },
    { name: "Saisie (STT)", "Traitement Local": 150, "Transit Réseau": 100 },
    { name: "Inférence IA", "Traitement Local": 80, "Transit Réseau": 350 },
    { name: "Synthèse (TTS)", "Traitement Local": 110, "Transit Réseau": 70 }
  ];

  // Liste des dépendances analysées
  const dependencies = {
    frontend: [
      { name: "react", version: "^19.0.1", desc: "Bibliothèque UI principale" },
      { name: "@google/genai", version: "^2.4.0", desc: "SDK Google GenAI unifié (Inférence & Vision)" },
      { name: "motion", version: "^12.23.24", desc: "Moteur d'animation fluide et transitions" },
      { name: "recharts", version: "^2.15.0", desc: "Graphiques vectoriels de données" },
      { name: "lucide-react", version: "^0.546.0", desc: "Ensemble d'icônes professionnelles" }
    ],
    backend: [
      { name: "express", version: "^4.21.2", desc: "Serveur HTTP pour routage API sécurisé" },
      { name: "tsx", version: "^4.21.0", desc: "Exécuteur TypeScript asynchrone ultra-rapide" },
      { name: "esbuild", version: "^0.25.0", desc: "Compilateur de bundling de production" }
    ],
    bridge: [
      { name: "rich", version: "Standard", desc: "Affichage terminal holographique interactif" },
      { name: "google-genai", version: "SDK", desc: "Inférence multimodale locale" },
      { name: "sounddevice", version: "C-API", desc: "Capture d'échantillons audio" }
    ]
  };

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-[#1A1A1A] p-2.5 rounded-lg shadow-xl font-mono text-[10px]">
          <p className="text-slate-400 font-bold mb-1 uppercase">{payload[0]?.payload?.subject}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} className="flex items-center gap-2 mt-0.5" style={{ color: pld.color || pld.fill }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
              <span>{pld.name} : {pld.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-[#1A1A1A] p-2.5 rounded-lg shadow-xl font-mono text-[10px]">
          <p className="text-slate-400 font-bold mb-1 uppercase">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} className="flex items-center gap-2 mt-0.5" style={{ color: pld.color || pld.fill }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
              <span>{pld.name} : {pld.value} ms</span>
            </p>
          ))}
          <div className="border-t border-[#1A1A1A] mt-1.5 pt-1 text-[8px] text-[#00D1FF] flex justify-between">
            <span>TOTAL :</span>
            <span className="font-bold">
              {payload.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0)} ms
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="code-explorer" className="flex flex-col h-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl">
      {/* Onglets Fichiers */}
      <div className="flex border-b border-[#1A1A1A] bg-[#050505] overflow-x-auto scrollbar-thin">
        {displayFiles.map((file) => (
          <button
            key={file.name}
            onClick={() => setActiveFile(file)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-mono font-medium tracking-wide transition-all border-r border-[#1A1A1A] shrink-0 ${
              activeFile.name === file.name
                ? "bg-[#0A0A0A] text-[#00D1FF] border-b-2 border-b-[#00D1FF]"
                : "text-slate-400 hover:bg-[#0A0A0A]/60 hover:text-slate-200"
            }`}
          >
            <FileCode className={`w-4 h-4 ${activeFile.name === file.name ? "text-[#00D1FF]" : "text-slate-500"}`} />
            {file.name}
          </button>
        ))}
      </div>

      {/* Description du fichier */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[#0A0A0A] border-b border-[#1A1A1A]/5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-[#00D1FF]/70 shrink-0" />
        <span className="font-mono text-[11px] text-slate-300">
          <strong className="text-[#00D1FF]">{getLanguageHeader(activeFile.language)} :</strong> {activeFile.description}
        </span>
      </div>

      {/* Barre d'actions du Code */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <span className="text-[10px] font-mono tracking-wider text-slate-500">
          SARRA // FILE_SYSTEM // {activeFile.name.toUpperCase()}
        </span>
        <div className="flex gap-2">
          {/* Bouton Copier */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all border border-[#1A1A1A] bg-[#050505] hover:bg-[#1A1A1A] text-[#00D1FF] active:scale-95"
            title={activeFile.language === "recharts" ? "Copier le rapport JSON" : "Copier dans le presse-papiers"}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                <span className="text-green-400 text-[11px]">COPIÉ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">{activeFile.language === "recharts" ? "COPIER DATA" : "COPIER"}</span>
              </>
            )}
          </button>

          {/* Bouton Télécharger */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all border border-[#1A1A1A] bg-[#050505] hover:bg-[#1A1A1A] text-slate-200 active:scale-95"
            title={activeFile.language === "recharts" ? "Télécharger le rapport JSON" : "Télécharger le fichier"}
          >
            <Download className="w-3.5 h-3.5 text-[#00D1FF]" />
            <span className="text-[11px]">{activeFile.language === "recharts" ? "RAPPORT JSON" : "TÉLÉCHARGER"}</span>
          </button>
        </div>
      </div>

      {/* Contenu - Code standard ou Dashboard Recharts */}
      {activeFile.language === "recharts" ? (
        <div className="flex-1 overflow-y-auto p-5 bg-[#050505] space-y-6 select-text">
          {/* En-tête de Section */}
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00D1FF] animate-pulse" />
              <h3 className="font-mono text-sm font-bold text-[#00D1FF] tracking-wider uppercase">
                Résultat d'Analyse : Synergie Sarra & Goose
              </h3>
            </div>
            <span className="text-[9px] font-mono border border-green-500/20 bg-green-500/5 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
              Secure Local Environment Configured
            </span>
          </div>

          {/* Graphiques de Structure Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Radar de Complémentarité */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/80 pb-2 mb-4">
                <span className="text-[11px] font-mono font-bold text-[#00D1FF] tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00D1FF]" />
                  CARTOGRAPHIE DE COMPLÉMENTARITÉ
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Radar du Noyau (%)</span>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#1A1A1A" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: "#475569", fontSize: 8 }} 
                      stroke="#1A1A1A"
                    />
                    <Radar 
                      name="Sarra (Voix/VAD/Émotion)" 
                      dataKey="Sarra" 
                      stroke="#00D1FF" 
                      fill="#00D1FF" 
                      fillOpacity={0.15} 
                    />
                    <Radar 
                      name="Goose (Inférence/OS/MCP)" 
                      dataKey="Goose" 
                      stroke="#A855F7" 
                      fill="#A855F7" 
                      fillOpacity={0.15} 
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ 
                        fontSize: 9, 
                        fontFamily: "JetBrains Mono, monospace", 
                        paddingTop: 10 
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Pipeline de Latence */}
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/80 pb-2 mb-4">
                <span className="text-[11px] font-mono font-bold text-[#00D1FF] tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00D1FF]" />
                  LATENCE DU PIPELINE DE TRANSIT AUDIO
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Délais par étape (ms)</span>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111111" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }} 
                      stroke="#1A1A1A"
                    />
                    <YAxis 
                      tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }} 
                      stroke="#1A1A1A"
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ 
                        fontSize: 9, 
                        fontFamily: "JetBrains Mono, monospace", 
                        paddingTop: 10 
                      }} 
                    />
                    <Bar dataKey="Traitement Local" stackId="a" fill="#00D1FF" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Transit Réseau" stackId="a" fill="#A855F7" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Analyse Technique de l'Écosystème et des Dépendances */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 space-y-4">
            <h4 className="font-mono text-xs font-bold text-[#00D1FF] border-b border-[#1A1A1A] pb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00D1FF]" />
              ANALYSE ARCHITECTURALE & DÉPENDANCES DU PROJET
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sarra Web App (Frontend) */}
              <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold block border-b border-[#1A1A1A] pb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00D1FF]" />
                  SARRA FRONTEND
                </span>
                <div className="space-y-1.5">
                  {dependencies.frontend.map((dep) => (
                    <div key={dep.name} className="flex flex-col text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-200">{dep.name}</span>
                        <span className="text-[#00D1FF]/70 font-semibold">{dep.version}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-snug">{dep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sarra Backend (Express / tsx) */}
              <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold block border-b border-[#1A1A1A] pb-1.5 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  SARRA BACKEND
                </span>
                <div className="space-y-1.5">
                  {dependencies.backend.map((dep) => (
                    <div key={dep.name} className="flex flex-col text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-200">{dep.name}</span>
                        <span className="text-purple-400/70 font-semibold">{dep.version}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-snug">{dep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sarra-Goose Bridge (Python) */}
              <div className="bg-[#050505] border border-[#1A1A1A] rounded-xl p-3.5 space-y-2.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold block border-b border-[#1A1A1A] pb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-green-400" />
                  PONT PYTHON GOOSE
                </span>
                <div className="space-y-1.5">
                  {dependencies.bridge.map((dep) => (
                    <div key={dep.name} className="flex flex-col text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-200">{dep.name}</span>
                        <span className="text-green-400/70 font-semibold">{dep.version}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-snug">{dep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1A1A1A] space-y-2">
              <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Mécanisme de Synergie et de Synchronisation Inter-Processus :
              </h5>
              <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                Le système fonctionne selon un modèle asynchrone bidirectionnel. L'interface vocale <strong className="text-[#00D1FF]">SARRA</strong> capture le flux audio via une détection de bruit de fond (noise gate) et un modèle de voix active (VAD). Les ordres vocaux transcrits localement sont transmis au <strong className="text-purple-400">Pont de Liaison Goose</strong> qui orchestre l'agent développeur autonome Goose. Goose exécute ses tâches (manipulation de fichiers, commandes Git, appels d'outils système) de façon 100% sécurisée, tandis que Sarra fournit à Monsieur un streaming vocal minimaliste et des retours tactiques animés.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 bg-[#050505] selection:bg-[#00D1FF]/30 selection:text-white leading-relaxed">
          <pre className="flex">
            {/* Numéros de ligne */}
            <div className="text-right text-slate-600 pr-4 select-none border-r border-[#1A1A1A] mr-4 font-mono text-[11px] w-8">
              {activeFile.content.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code réel */}
            <code className="text-left whitespace-pre block overflow-x-auto font-mono text-[11px] text-slate-300">
              {activeFile.content}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

