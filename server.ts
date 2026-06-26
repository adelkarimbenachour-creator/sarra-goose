import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialiser le client Gemini en arrière-plan
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API client initialized successfully.");
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. Interactive AI features will use pre-baked local mock fallback.");
}

// Endpoint API pour simuler l'intelligence de Sarra & Goose
app.post("/api/sarra/chat", async (req, res) => {
  const { message, conversationHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message input is required" });
  }

  // Fallback si la clé API n'est pas configurée
  if (!ai) {
    return res.json({
      speech: `Monsieur, mes liaisons de neurones cérébraux ne sont pas encore alimentées. Veuillez configurer la clé API Gemini. Cependant, j'ai bien noté votre instruction : ${message}.`,
      full_response: `### 🔴 Système hors-ligne (Simulation local)\n\nPour activer l'intelligence en temps réel de Sarra dans ce simulateur, veuillez ajouter votre clé API **Gemini** via le panneau **Settings > Secrets** de AI Studio.\n\n**Requête reçue :** "${message}"`,
      status_steps: [
        { status: "THINKING", message: "Initialisation des cœurs secondaires..." },
        { status: "EXECUTING", message: "Simulation d'environnement local..." },
        { status: "SPEAKING", message: "Synthèse vocale active." }
      ],
      console_logs: [
        "[SYSTEM] GEMINI_API_KEY is missing from environment secrets",
        "[SYSTEM] Fallback to static response generator",
        `[SARRA] Command captured: "${message}"`,
        "[SARRA] Ready for integration."
      ]
    });
  }

  try {
    const systemPrompt = `
You are Sarra, the tactical intelligence and development command system, connected as a voice interface bridge to the Goose developer and automation agent (github.com/aaif-goose/goose).
Goose is a highly capable and advanced development agent designed to run autonomously, execute tools, perform edits, write code, and build systems. It is NOT an aviation, flight, or bird agent.
The user is "Monsieur" (Tony Stark). You are polite, highly technical, concise, slightly sarcastic, and extremely efficient.

Respond to the user's request. Your task is to act both as Sarra (explaining things verbally) and as the Goose agent (which executes tools, edits code, runs files, or checks repositories).
Simulate actual actions that Goose would do, like running terminal commands, creating python scripts, invoking git, or executing model context protocol (MCP) tools.

Return your response in JSON matching the exact schema specified.
- "speech": Text to be spoken aloud by Sarra in French. Should be conversational, natural, very concise (under 60 words), polite, call the user 'Monsieur'. No markdown or special chars here.
- "full_response": Full detailed response in French with markdown formatting. Write code blocks, describe file operations or system actions performed, file modifications, or details. This represents the screen terminal output of Goose.
- "status_steps": An array of steps simulating what Goose is doing. For example: [{"status": "THINKING", "message": "Analyse syntaxique de l'instruction..."}, {"status": "EXECUTING", "message": "Exécution du script build.py via shell_exec..."}].
- "console_logs": A series of 4-8 raw terminal logging strings (like '[MCP] Invoked tool run_command', '[GOOSE] File saved: /app/main.py'). These should look super realistic and show actual engineering process.

Conversation history for context:
${JSON.stringify(conversationHistory || [])}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speech: {
              type: Type.STRING,
              description: "Text to be spoken aloud by Sarra. Under 60 words, elegant French, terms like 'Monsieur', polite yet confident."
            },
            full_response: {
              type: Type.STRING,
              description: "Markdown detailed technical response in French, including code snippets, system summaries, tool outputs, etc."
            },
            status_steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, description: "One of: STANDBY, LISTENING, THINKING, EXECUTING, SPEAKING." },
                  message: { type: Type.STRING, description: "Brief description of the action." }
                },
                required: ["status", "message"]
              }
            },
            console_logs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 to 8 rows of raw developer logs simulating actual terminal output of Goose agent during tool executions."
            }
          },
          required: ["speech", "full_response", "status_steps", "console_logs"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const resultJson = JSON.parse(resultText);
    res.json(resultJson);

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    res.status(500).json({
      error: "Failed to communicate with Sarra Core AI",
      details: error.message
    });
  }
});

// Endpoint pour télécharger les fichiers livrables individuellement
app.get("/api/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const safePath = path.resolve(process.cwd(), filename);
  
  // S'assurer qu'on ne sort pas du workspace
  if (!safePath.startsWith(process.cwd())) {
    return res.status(403).send("Access denied.");
  }

  res.download(safePath, filename, (err) => {
    if (err) {
      res.status(404).send("File not found.");
    }
  });
});

async function startServer() {
  // Configurer Vite middleware en mode dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sarra full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
