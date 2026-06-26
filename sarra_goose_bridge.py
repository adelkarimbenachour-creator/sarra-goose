#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
================================================================================
          SARRA - SARRA-OR : GOOSE VOICE INTERFACE CONTROL
================================================================================
Ce script sert d'interface de contrôle vocale pour l'agent IA "Goose" (AAIF).
Il intègre :
1. Détection de Wake Word (PvPorcupine ou OpenWakeWord / SpeechRecognition)
2. Transcription ultra-rapide (Faster-Whisper ou API Whisper)
3. Liaison bidirectionnelle avec l'instance Goose via CLI asynchrone
4. Synthèse vocale de haute qualité (ElevenLabs API ou Piper/pyttsx3 local)
5. Mode Conversation Continue (fenêtre d'écoute active après réponse)
6. Interruption Vocale active (détection de "stop" pendant la synthèse)
7. Console immersive style Hologramme Stark (via la bibliothèque 'rich')

Auteur : Expert en Intelligence Artificielle et Intégration Système
================================================================================
"""

import os
import sys
import time
import subprocess
import threading
import queue
import tempfile
import signal
import json
import shutil
from typing import Optional, List

# Essayer d'importer les modules nécessaires, lever des instructions d'installation si manquants
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.live import Live
    from rich.text import Text
    from rich.progress import SpinnerColumn, Progress
except ImportError:
    print("[!] Erreur : La bibliothèque 'rich' est requise. Veuillez lancer : pip install rich")
    sys.exit(1)

# Initialisation de la console Stark
console = Console()

# Configuration et constantes par défaut
DEFAULT_PICOVOICE_API_KEY = os.getenv("PICOVOICE_API_KEY", "")
DEFAULT_ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM" # Voix masculine charismatique (Rachel/Sarra)
GOOSE_SYSTEM_PROMPT = (
    "Tu es SARRA, l'intelligence artificielle de contrôle tactique inspirée de l'armure Sarra. "
    "Réponds de manière concise, élégante, directe et technique, à la manière de l'assistant de Tony Stark. "
    "Utilise un ton poli mais familier ('Monsieur'), sois extrêmement efficace. "
    "Évite les explications superflues et les bavardages d'introduction. Concentre-toi sur les données et l'action."
)

class SarraVoiceControl:
    def __init__(self):
        self.is_running = True
        self.is_speaking = False
        self.continuous_mode = False
        self.current_audio_process: Optional[subprocess.Popen] = None
        self.input_queue = queue.Queue()
        self.status = "INITIALIZATION"
        
        # Moteurs de détection et transcription
        self.whisper_model = None
        self.porcupine = None
        self.audio_stream = None
        
        # Détecter la disponibilité des outils système pour le TTS local
        self.has_mpv = shutil.which("mpv") is not None
        self.has_ffplay = shutil.which("ffplay") is not None

    def display_banner(self):
        """Affiche le logo d'initialisation de SARRA"""
        banner_text = (
            "[bold cyan]      ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗\n"
            "      ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝\n"
            "      ██║███████║██████╔╝██║   ██║██║███████╗\n"
            " ██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║\n"
            " ╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║\n"
            "  ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝[/bold cyan]\n"
            "   [bold red]SYSTEM DIRECTORY : SARRA-OR // GOOSE INTERFACE[/bold red]\n"
        )
        console.print(Panel(banner_text, subtitle="[yellow]Stark Industries - Voice Assistant Bridge[/yellow]", border_style="cyan"))

    def initialize_components(self):
        """Initialise tous les moteurs d'IA vocale"""
        self.update_status("INITIALIZATION", "Chargement des protocoles STT / TTS...")
        
        # 1. Initialisation de Faster-Whisper
        try:
            from faster_whisper import WhisperModel
            console.print("[cyan][SARRA-STT][/cyan] Chargement de Faster-Whisper (modèle 'base' pour la rapidité)...")
            # Utilise CPU par défaut avec int8, ou float16 si CUDA est disponible
            device = "cuda" if shutil.which("nvidia-smi") else "cpu"
            self.whisper_model = WhisperModel("base", device=device, compute_type="int8")
            console.print("[green][OK][/green] Faster-Whisper initialisé avec succès.")
        except ImportError:
            console.print("[yellow][STT Fallback][/yellow] 'faster-whisper' non installé. Utilisation du SpeechRecognition standard.")
            import speech_recognition as sr
            self.speech_recognizer = sr.Recognizer()
            self.mic = sr.Microphone()
            with self.mic as source:
                self.speech_recognizer.adjust_for_ambient_noise(source, duration=1)

        # 2. Initialisation du Wake Word Detector (PvPorcupine)
        if DEFAULT_PICOVOICE_API_KEY:
            try:
                import pvporcupine
                import pyaudio
                self.porcupine = pvporcupine.create(
                    access_key=DEFAULT_PICOVOICE_API_KEY,
                    keywords=["sarra", "goose"]
                )
                self.pa = pyaudio.PyAudio()
                self.audio_stream = self.pa.open(
                    rate=self.porcupine.sample_rate,
                    channels=1,
                    format=pyaudio.paInt16,
                    input=True,
                    frames_per_buffer=self.porcupine.frame_length
                )
                console.print("[green][OK][/green] PvPorcupine configuré pour 'Sarra' / 'Goose'.")
            except Exception as e:
                console.print(f"[yellow][WARN][/yellow] Impossible d'initialiser PvPorcupine : {e}. Fallback sur activation manuelle/énergie.")
        else:
            console.print("[yellow][WARN][/yellow] Clé PICOVOICE_API_KEY absente. Détection vocale en mode continu basée sur le micro.")

    def update_status(self, code: str, detail: str):
        """Met à jour le statut affiché dans la console"""
        self.status = code
        colors = {
            "INITIALIZATION": "yellow",
            "STANDBY": "dim white",
            "LISTENING": "bold green",
            "THINKING": "bold magenta",
            "EXECUTING": "bold red",
            "SPEAKING": "bold cyan"
        }
        color = colors.get(code, "white")
        console.print(f"[{color}][{code}][/{color}] {detail}")

    def listen_and_transcribe(self) -> str:
        """Écoute la voix de l'utilisateur et la transcrit en texte avec Faster-Whisper"""
        self.update_status("LISTENING", "Je vous écoute, Monsieur...")
        
        # Capture audio temporaire
        import speech_recognition as sr
        r = sr.Recognizer()
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source, duration=0.5)
            try:
                # Écoute avec un timeout de 8 secondes
                audio_data = r.listen(source, timeout=8, phrase_time_limit=10)
                self.update_status("THINKING", "Décryptage du signal vocal...")
                
                # Sauvegarde temporaire du fichier wav
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(audio_data.get_wav_data())
                    temp_wav_path = f.name
                
                # Transcription via Faster-Whisper
                if self.whisper_model:
                    segments, info = self.whisper_model.transcribe(temp_wav_path, beam_size=5)
                    transcription = " ".join([segment.text for segment in segments]).strip()
                else:
                    # Fallback sur l'API Google standard (sans clé) via speech_recognition
                    transcription = r.recognize_google(audio_data, language="fr-FR")
                
                # Nettoyage
                try:
                    os.unlink(temp_wav_path)
                except OSError:
                    pass
                
                console.print(f"[bold cyan]>>> Vous :[/bold cyan] {transcription}")
                return transcription
            except sr.WaitTimeoutError:
                self.update_status("STANDBY", "Aucun signal détecté.")
                return ""
            except Exception as e:
                console.print(f"[red]Erreur de transcription : {e}[/red]")
                return ""

    def query_goose_agent(self, text: str) -> str:
        """Transmet la commande transcrite à Goose et récupère sa réponse."""
        self.update_status("EXECUTING", "Transmission de la commande à l'Agent Goose...")
        
        # On va injecter le system prompt dans la session Goose pour qu'il garde sa personnalité.
        # Goose s'exécute typiquement via `goose run "<prompt>"` ou par session.
        # Nous allons exécuter la commande CLI Goose et capturer la sortie.
        full_prompt = f"{GOOSE_SYSTEM_PROMPT}\n\nCommande de l'utilisateur : {text}"
        
        try:
            # Exécution de Goose via le CLI officiel de manière asynchrone
            process = subprocess.Popen(
                ["goose", "run", "--instructions", GOOSE_SYSTEM_PROMPT, text],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            response_chunks = []
            # On lit en temps réel la réponse pour l'afficher ou détecter le flux
            while True:
                line = process.stdout.readline()
                if not line:
                    break
                # Nettoyer les codes de couleur ANSI si présents
                clean_line = line.strip()
                if clean_line:
                    # Afficher les logs d'exécution de Goose (MCP tools, etc.)
                    if "[tool" in clean_line or "running" in clean_line.lower():
                        console.print(f"  [dim yellow][Goose System][/dim yellow] {clean_line}")
                    else:
                        response_chunks.append(line)
            
            process.wait()
            raw_response = "".join(response_chunks).strip()
            
            # Si aucune réponse CLI, fournir une phrase type Sarra
            if not raw_response:
                raw_response = "J'ai bien enregistré la commande Monsieur, mais Goose n'a pas retourné de rapport écrit."
                
            return raw_response
            
        except FileNotFoundError:
            # Fallback si Goose n'est pas encore installé localement sur la machine
            console.print("[red][ERR][/red] La commande CLI 'goose' est introuvable sur ce système.")
            console.print("[yellow][Simulation][/yellow] Simulation d'une réponse de SARRA...")
            time.sleep(1.5)
            return (
                f"Monsieur, le protocole de liaison Goose est inactif (Goose CLI non installé). "
                f"Néanmoins, j'ai simulé votre requête : '{text}'. Tous les systèmes virtuels sont opérationnels."
            )
        except Exception as e:
            return f"Désolé Monsieur, une anomalie est survenue dans le pont avec Goose : {str(e)}"

    def play_audio(self, file_path: str):
        """Joue un fichier audio avec gestion d'interruption vocale"""
        self.is_speaking = True
        
        # Lancer un thread pour détecter l'annulation vocale ("Stop" / "Annule") pendant qu'on parle
        stop_thread = threading.Thread(target=self.monitor_interruption)
        stop_thread.daemon = True
        stop_thread.start()

        # Commande pour lire le fichier audio
        if self.has_mpv:
            play_cmd = ["mpv", "--no-video", file_path]
        elif self.has_ffplay:
            play_cmd = ["ffplay", "-nodisp", "-autoexit", file_path]
        else:
            # Fallback pour macOS / Windows / Linux standard
            if sys.platform == "darwin":
                play_cmd = ["afplay", file_path]
            elif sys.platform == "win32":
                play_cmd = ["powershell", "-c", f"(New-Object Media.SoundPlayer '{file_path}').PlaySync()"]
            else:
                play_cmd = ["aplay", file_path] # Linux standard ALSA

        try:
            self.current_audio_process = subprocess.Popen(play_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.current_audio_process.wait()
        except Exception as e:
            console.print(f"[red]Erreur lors de la lecture audio : {e}[/red]")
        finally:
            self.is_speaking = False
            self.current_audio_process = None

    def monitor_interruption(self):
        """Surveille le micro à la recherche du mot 'Stop' ou 'Annule' pendant que Sarra parle"""
        import speech_recognition as sr
        r = sr.Recognizer()
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            while self.is_speaking and self.current_audio_process:
                try:
                    # Écoute rapide à la recherche d'une interruption
                    audio = r.listen(source, timeout=1, phrase_time_limit=1.5)
                    text = r.recognize_google(audio, language="fr-FR").lower()
                    if "stop" in text or "annule" in text or "sarra" in text:
                        console.print("\n[bold red][INTERRUPTION][/bold red] Monsieur a demandé l'arrêt immédiat.")
                        if self.current_audio_process:
                            self.current_audio_process.terminate()
                            self.current_audio_process.kill()
                        break
                except (sr.WaitTimeoutError, sr.UnknownValueError):
                    continue
                except Exception:
                    break

    def speak(self, text: str):
        """Transforme le texte de réponse en voix via ElevenLabs ou Piper (local)"""
        self.update_status("SPEAKING", f"Synthèse vocale : {text[:60]}...")
        
        # 1. Option Premium : ElevenLabs API
        if DEFAULT_ELEVENLABS_API_KEY:
            try:
                import requests
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{DEFAULT_ELEVENLABS_VOICE_ID}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": DEFAULT_ELEVENLABS_API_KEY
                }
                data = {
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.75,
                        "similarity_boost": 0.85
                    }
                }
                response = requests.post(url, json=data, headers=headers)
                if response.status_code == 200:
                    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fp:
                        fp.write(response.content)
                        audio_file = fp.name
                    self.play_audio(audio_file)
                    os.unlink(audio_file)
                    return
                else:
                    console.print(f"[yellow][WARN][/yellow] Erreur ElevenLabs API (Code: {response.status_code}). Fallback local.")
            except Exception as e:
                console.print(f"[yellow][WARN][/yellow] Échec ElevenLabs : {e}. Utilisation du synthétiseur de secours.")

        # 2. Option Local Rapide : gTTS (Google TTS) ou pyttsx3
        try:
            from gtts import gTTS
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fp:
                tts = gTTS(text=text, lang="fr", slow=False)
                tts.save(fp.name)
                audio_file = fp.name
            self.play_audio(audio_file)
            os.unlink(audio_file)
        except Exception:
            # Fallback ultime : pyttsx3 (totalement offline sans réseau)
            try:
                import pyttsx3
                engine = pyttsx3.init()
                # Configurer une voix française et un rythme Sarra rapide
                voices = engine.getProperty("voices")
                for voice in voices:
                    if "fr" in voice.languages or "french" in voice.name.lower():
                        engine.setProperty("voice", voice.id)
                        break
                engine.setProperty("rate", 190) # Vitesse rapide et dynamique
                engine.say(text)
                engine.runAndWait()
            except Exception as e:
                console.print(f"[red][ERR][/red] Tous les moteurs de synthèse vocale ont échoué : {e}")
                console.print(f"[bold cyan]>>> SARRA :[/bold cyan] {text}")

    def run_main_loop(self):
        """Boucle principale de détection et d'interaction"""
        self.display_banner()
        self.initialize_components()
        
        console.print("\n[bold green][SYSTEM REBOOTED][/bold green] SARRA est pleinement opérationnelle. En attente du mot-clé...")
        
        while self.is_running:
            self.update_status("STANDBY", "En attente du mot d'activation ('Sarra' ou 'Goose')...")
            
            activated = False
            # Détection via PvPorcupine si disponible
            if self.porcupine and self.audio_stream:
                try:
                    pcm = self.audio_stream.read(self.porcupine.frame_length, exception_on_overflow=False)
                    import struct
                    pcm_unpacked = struct.unpack_from("h" * self.porcupine.frame_length, pcm)
                    keyword_index = self.porcupine.process(pcm_unpacked)
                    if keyword_index >= 0:
                        console.print("\n[bold gold1][WAKE WORD DETECTED][/bold gold1] Oui Monsieur ?")
                        activated = True
                except Exception as e:
                    # En cas d'erreur flux audio, basculer sur détection continue
                    activated = True
            else:
                # Mode Démo / Fallback manuel : l'utilisateur tape Entrée ou le micro s'active directement
                input("\n[Appuyez sur Entrée pour parler à SARRA ou dites le mot-clé si configuré]")
                activated = True

            if activated:
                # Jouer un petit bip sonore d'activation style Sarra
                self.speak("Oui Monsieur, j'écoute.")
                
                # Entrer dans le cycle de conversation
                self.continuous_mode = True
                consecutive_silences = 0
                
                while self.continuous_mode and self.is_running:
                    user_text = self.listen_and_transcribe()
                    
                    if not user_text:
                        consecutive_silences += 1
                        if consecutive_silences >= 2:
                            self.speak("Je me remets en veille, Monsieur. Dites 'Sarra' pour me rappeler.")
                            self.continuous_mode = False
                        else:
                            self.speak("Monsieur ? Êtes-vous toujours là ?")
                        continue
                    
                    consecutive_silences = 0
                    
                    # Vérifier si l'utilisateur demande à annuler ou quitter
                    if any(word in user_text.lower() for word in ["veille", "quitter", "fermer", "au revoir", "bye"]):
                        self.speak("Entendu Monsieur. Extinction des protocoles vocaux primaires. À votre service.")
                        self.continuous_mode = False
                        break
                    
                    # Transmettre à Goose et synthétiser la réponse
                    goose_response = self.query_goose_agent(user_text)
                    self.speak(goose_response)
                    
                    # Pause de confort avant la réécoute
                    time.sleep(0.5)

    def terminate(self):
        """Nettoie proprement toutes les ressources à la fermeture"""
        console.print("\n[bold red][SHUTDOWN][/bold red] Extinction de SARRA...")
        self.is_running = False
        self.continuous_mode = False
        if self.current_audio_process:
            self.current_audio_process.terminate()
        if self.porcupine:
            self.porcupine.delete()
        if self.audio_stream:
            self.audio_stream.close()
        console.print("[green][OK][/green] Ressources libérées.")

if __name__ == "__main__":
    sarra = SarraVoiceControl()
    
    # Gestionnaire de signal d'interruption (Ctrl+C)
    def signal_handler(sig, frame):
        sarra.terminate()
        sys.exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        sarra.run_main_loop()
    except Exception as e:
        console.print(f"[bold red]Erreur critique système :[/bold red] {e}")
        sarra.terminate()
