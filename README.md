# 🤖 SARRA - Interface de Contrôle Vocale pour l'Agent IA Goose

Ce dossier contient le script d'intégration complet pour piloter l'agent de développement autonome **Goose** par la voix, avec un comportement de type **SARRA** (Tony Stark).

---

## 📋 Table des Matières
1. [Fonctionnalités](#-fonctionnalités)
2. [Prérequis](#-prérequis)
3. [Installation Étape par Étape](#-installation-étape-par-étape)
4. [Configuration de Goose](#-configuration-de-goose)
5. [Lancement](#-lancement)
6. [Commandes de Contrôle](#-commandes-de-contrôle)

---

## ⚡ Fonctionnalités
- **Wake Word Détection (Mains Libres)** : Détecte "Sarra" ou "Goose" via la technologie ultra-légère *PvPorcupine*.
- **STT Locale à Latence Minimale** : Utilise *Faster-Whisper* pour transcrire la voix instantanément sur CPU ou GPU.
- **Liaison Goose Intégrée** : Exécute vos requêtes en interfaçant directement la commande `goose run` et renvoie la réponse.
- **Synthèse Vocale (TTS)** : Gère l'API *ElevenLabs* (haute qualité de type Sarra) ou un moteur de secours 100% offline (*gTTS* ou *pyttsx3*).
- **Mode Conversation Continue** : Une fois réveillée, SARRA reste à l'écoute pendant 5 secondes après chaque réponse, vous évitant de répéter le mot-clé.
- **Interruption Vocale Active** : Dites "Stop" ou "Annule" à tout moment pour couper la parole à SARRA s'il parle trop ou s'il se trompe.
- **Console Holographique Rich** : Interface en ligne de commande soignée qui affiche l'état actuel (`STANDBY`, `LISTENING`, `THINKING`, `EXECUTING`, `SPEAKING`).

---

## 🛠️ Prérequis

### Matériel :
- Un microphone fonctionnel.
- Un haut-parleur ou des écouteurs.

### Logiciels requis :
- **Python 3.8+**
- **Goose** installé (via `npm install -g @aaif-goose/goose` ou en suivant le guide de [github.com/aaif-goose/goose](https://github.com/aaif-goose/goose)).
- **FFmpeg** installé sur votre système (nécessaire pour la manipulation et la lecture de fichiers audio).
  - *macOS* : `brew install ffmpeg mpv`
  - *Linux (Ubuntu/Debian)* : `sudo apt install ffmpeg mpv python3-pyaudio`
  - *Windows* : Installez ffmpeg via `winget install Gyan.FFmpeg` ou Chocolatey.

---

## 🚀 Installation Étape par Étape

1. **Cloner ou exporter ce script** dans votre dossier de projet.
2. **Créer un environnement virtuel Python** (recommandé) :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```
3. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```
4. **Configurer vos variables d'environnement (Facultatif mais recommandé)** :
   - Pour le wake-word PvPorcupine, créez un compte gratuit sur [Picovoice Console](https://console.picovoice.ai/) pour obtenir une clé d'accès.
   - Pour la synthèse de voix premium de Sarra, créez un compte sur [ElevenLabs](https://elevenlabs.io/) pour obtenir une clé API.
   - Créez un fichier `.env` ou exportez-les directement :
     ```bash
     export PICOVOICE_API_KEY="votre_cle_picovoice"
     export ELEVENLABS_API_KEY="votre_cle_elevenlabs"
     ```

---

## ⚙️ Configuration de Goose

Pour que Goose utilise sa personnalité SARRA par défaut, vous pouvez configurer ses instructions de session.
Créez ou modifiez le fichier de configuration de Goose (généralement situé dans `~/.config/goose/config.yaml` ou passez les instructions en ligne de commande).

Le contenu de `system_prompt.txt` est automatiquement injecté par le script `sarra_goose_bridge.py` à chaque exécution via l'option `--instructions` de Goose :
```bash
goose run --instructions "$(cat system_prompt.txt)" "Votre requête vocale"
```

---

## 💻 Lancement

Exécutez simplement le script pour démarrer la liaison vocale :
```bash
python sarra_goose_bridge.py
```

Vous devriez voir l'interface holographique s'initialiser dans votre console. Dites **"Sarra"** pour démarrer la conversation !

---

## 🗣️ Commandes de Contrôle
- **Réveiller l'IA** : Dites "Sarra" ou "Goose".
- **Couper la parole** : Pendant que Sarra parle, dites "Stop" ou "Annule".
- **Mettre en veille** : Dites "Mets-toi en veille", "Au revoir" ou "Quitter".
