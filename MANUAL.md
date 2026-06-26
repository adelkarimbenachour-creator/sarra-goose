# 📖 Manuel d'Utilisation et d'Installation — SARRA (Pont Vocal Goose)

Ce manuel vous guidera à travers l'installation, la configuration et l'utilisation de **SARRA** (Stark Assistant Responsive & Real-time Agent), l'interface de contrôle vocal bidirectionnel pour l'agent de développement autonome **Goose**.

L'application se compose de deux parties complémentaires :
1. **Un Simulateur Web Interactif** (l'application React dans laquelle vous vous trouvez), qui vous permet de tester l'expérience SARRA directement dans le navigateur.
2. **Un Pont Python Réel (`sarra_goose_bridge.py`)**, exécutable localement sur votre machine, qui écoute votre microphone, traite l'audio en local ou via API, et pilote l'agent Goose installé sur votre système.

---

## 🚀 1. Le Simulateur Web Interactif (Navigateur)

Le simulateur vous permet de vous familiariser avec l'interface holographique de SARRA sans aucune installation technique préalable.

### 🎮 Fonctionnalités du Simulateur :
- **Hologramme Réactif** : Un cercle d'ondes holographiques bleues s'anime en temps réel selon l'état de SARRA (`STANDBY`, `LISTENING`, `THINKING`, `EXECUTING`, `SPEAKING`).
- **Mode Synthèse Vocale Web** : SARRA vous répond à voix haute grâce à l'API de synthèse vocale intégrée à votre navigateur.
- **Réglages Vocaux** : Ajustez le volume, la vitesse d'élocution et le timbre (pitch grave pour imiter l'effet de l'IA de l'armure).
- **Console Holographique de Logs** : Un terminal technique affiche les flux d'instructions, l'état du micro, les appels d'outils (MCP) et les rapports de diagnostic.
- **Explorateur de Code intégré** : Visualisez et copiez directement les fichiers sources réels du pont Python (`sarra_goose_bridge.py`, `system_prompt.txt`, `requirements.txt`).

### 🗣️ Comment l'utiliser :
1. **Activer le Micro** : Cliquez sur le bouton central **Microphone** (ou appuyez sur Entrée). Autorisez le site à accéder à votre micro si le navigateur le demande.
2. **Parler** : Énoncez votre commande (par exemple : *"SARRA, crée un script Python pour calculer la suite de Fibonacci"* ou *"Goose, fais-moi un rapport sur l'état du serveur"*).
3. **Saisie Textuelle** : Si vous ne disposez pas de microphone ou préférez le clavier, écrivez directement dans le champ d'input en bas de l'écran et appuyez sur la flèche pour envoyer.
4. **Réponse de SARRA** : L'IA simule l'analyse de votre demande par Goose, affiche les logs système en temps réel, puis SARRA formule sa réponse finale et vous la lit à voix haute.

---

## 🛠️ 2. Guide d'Installation de l'Application Locale

Pour piloter réellement votre ordinateur par la voix avec l'agent autonome Goose, vous devez exécuter le pont vocal localement.

### 📋 Prérequis Systèmes
- **Python 3.8** ou version ultérieure.
- **Goose CLI** installé globalement.
  *(Goose est l'agent de développement d'un nouveau genre développé par Block. [En savoir plus](https://github.com/aaif-goose/goose))*
  ```bash
  npm install -g @aaif-goose/goose
  ```
- **FFmpeg & MPV** (nécessaires pour enregistrer/lire de l'audio sans latence) :
  - **macOS** : `brew install ffmpeg mpv`
  - **Linux (Debian/Ubuntu)** : `sudo apt update && sudo apt install ffmpeg mpv python3-pyaudio`
  - **Windows** : `winget install Gyan.FFmpeg` et `winget install mpv`

---

### 📦 3. Guide d'Installation Pas à Pas

#### Étape 1 : Téléchargement des fichiers
Récupérez les fichiers requis depuis l'onglet **"Fichiers Sources"** du simulateur ou clonez le projet :
- `sarra_goose_bridge.py` (Script principal)
- `system_prompt.txt` (Règles de personnalité)
- `requirements.txt` (Dépendances Python)

Placez-les ensemble dans un répertoire de votre choix (ex: `~/sarra-bridge`).

#### Étape 2 : Création de l'environnement virtuel Python
Il est fortement recommandé d'isoler les dépendances :
```bash
cd ~/sarra-bridge
python -m venv venv

# Activer l'environnement virtuel :
# - Sur macOS / Linux :
source venv/bin/activate
# - Sur Windows (Command Prompt) :
venv\Scripts\activate.bat
# - Sur Windows (PowerShell) :
.\venv\Scripts\Activate.ps1
```

#### Étape 3 : Installation des dépendances Python
Installez les bibliothèques requises via `pip` :
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

*Note : Si l'installation de `pyaudio` échoue sur votre système, assurez-vous d'avoir installé les bibliothèques de développement audio de votre système d'exploitation (ex: `portaudio` via brew ou apt).*

#### Étape 4 : Configuration des clés API (Optionnel mais recommandé)
SARRA utilise deux services cloud optionnels pour maximiser l'expérience. Créez un fichier `.env` ou exportez les variables dans votre terminal :

```bash
# 1. Clé Picovoice (Gratuite) - Nécessaire pour le réveil mains libres ("Sarra" / "Goose")
export PICOVOICE_API_KEY="votre_cle_picovoice_ici"

# 2. Clé ElevenLabs (Premium) - Pour une voix naturelle de majordome de haute qualité
export ELEVENLABS_API_KEY="votre_cle_elevenlabs_ici"
```
*Si aucune clé ElevenLabs n'est configurée, SARRA basculera automatiquement sur un moteur de synthèse vocale local et 100% hors-ligne (gTTS ou pyttsx3).*

---

## 💻 4. Lancement et Utilisation Locale

Une fois l'environnement configuré, démarrez SARRA d'une simple commande :

```bash
python sarra_goose_bridge.py
```

### 🗣️ Commandes Vocales Principales
Le script démarre en **Mode Conversation Continue**. Une fois que vous l'avez réveillé, vous n'avez pas besoin de répéter le mot-clé à chaque phrase !

- **Réveiller l'IA (Wake Word)** : Prononcez distinctement **"Sarra"** ou **"Goose"**.
- **Couper la parole** : Si SARRA donne une réponse trop longue ou se trompe, dites simplement **"Stop"** ou **"Annule"** à haute voix. Le script coupera instantanément la synthèse audio et se remettra en écoute.
- **Mise en veille automatique** : Après 2 silences consécutifs (5 secondes d'inactivité après une réponse), SARRA repasse poliment en mode veille (`STANDBY`) pour ne pas surcharger votre CPU.
- **Mise en veille manuelle** : Dites *"Mets-toi en veille"*, *"Au revoir"* ou *"Quitter"* pour couper la liaison active.

---

## ⚙️ 5. Intégration de la Personnalité SARRA dans Goose CLI

Pour que votre agent Goose utilise naturellement sa personnalité SARRA même lors de requêtes en ligne de commande pure, vous pouvez utiliser le fichier `system_prompt.txt` fourni :

```bash
goose run --instructions "$(cat system_prompt.txt)" "Analyse le code dans ce dossier et propose une optimisation"
```

Les consignes de personnalité garantissent que :
1. Les réponses de l'agent soient **concises, ultra-techniques et pragmatiques**.
2. Il utilise le vouvoiement et s'adresse à vous par **"Monsieur"**.
3. Il évite tout préambule ou formule de politesse standard inutile pour aller droit au but tactique.
4. Il intègre des rapports de type "Armure" lors du chargement des outils (ex: *"Analyse sectorielle lancée..."*).

---

## ❌ 6. Résolution des Problèmes Courants

### 1. PyAudio refuse de s'installer :
- **Sur macOS** : Vous devez installer PortAudio en premier. Lancez `brew install portaudio` puis relancez `pip install pyaudio`.
- **Sur Ubuntu/Debian** : Lancez `sudo apt install portaudio19-dev python3-pyaudio` puis relancez `pip install pyaudio`.

### 2. Le Wake Word ("Sarra") ne réagit pas :
- Vérifiez que votre microphone par défaut est configuré correctement dans votre système.
- Assurez-vous d'avoir saisi une clé valide provenant de la console [Picovoice](https://console.picovoice.ai/). La console propose un plan gratuit suffisant pour un usage personnel.

### 3. Latence élevée entre la parole et la réponse :
- Par défaut, le pont utilise `Faster-Whisper` en mode local pour transcrire la parole. Si vous n'avez pas de carte graphique NVIDIA dédiée (CUDA), la transcription sur un CPU très ancien peut prendre quelques secondes. Vous pouvez modifier le modèle pour un modèle plus petit (`tiny` ou `small`) dans `sarra_goose_bridge.py` à la ligne `self.whisper_model = WhisperModel("tiny", ...)` pour une vitesse accrue.
