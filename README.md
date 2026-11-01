# Suspicious Business (desktop)
## Get the .exe (no installs needed)
1. Create a free GitHub account and a new repository.
2. Upload every file in this folder (keep the .github folder).
3. Open the repo's Actions tab. The "Build Windows exe" run starts by itself (or press Run workflow).
4. When it turns green, open it and download the SuspiciousBusiness-Windows artifact. Inside is the setup .exe and a portable .exe.
## Or run it on your PC
Install Node.js, then run: npm install  then  npm start  (npm run dist builds the exe).
## Add the AI
Main menu > Settings. Paste a free Gemini key from aistudio.google.com, and set the exact Model ID your account lists. Keep the default base URL for Gemini. Any OpenAI-compatible service also works.
Your key is saved only on that PC, in the app data folder. Each friend should use their own key. Never put a key in the code.
## Sounds
Built-in sounds work out of the box. To use Pixabay sounds, put mp3 files in game/sfx (see README.txt there) and rebuild.
## Controls
WASD move, E talk, Up arrow phone, Esc close, F11 fullscreen. Voice input may not work in the desktop app; type instead.
