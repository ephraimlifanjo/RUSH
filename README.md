
---

# 1. Créer le dossier principal

Sur Desktop :

```txt id="r1"
RUSH/
```

---

# 2. Structure complète à créer

```txt id="r2"
RUSH/
│
├── assets/
│   ├── icons/
│   └── images/
│
├── services/
│   ├── organizer.py
│   └── watcher.py
│
├── ui/
│   └── main_window.py
│
├── utils/
│   └── helpers.py
│
├── main.py
│
├── requirements.txt
│
└── README.md
```

---

# 3. À quoi sert chaque fichier

| Fichier          | Rôle                   |
| ---------------- | ---------------------- |
| main.py          | démarre l’application  |
| organizer.py     | organise les fichiers  |
| watcher.py       | surveille les dossiers |
| main_window.py   | interface graphique    |
| helpers.py       | fonctions utilitaires  |
| requirements.txt | dépendances            |
| README.md        | documentation projet   |

---

# 4. Commandes Terminal

Dans VS Code terminal :

## Aller dans le projet

```bash id="r3"
cd Desktop
cd RUSH
```

---

# 5. Créer environnement virtuel

## Windows

```bash id="r4"
python -m venv venv
```

---

# 6. Activer environnement

## Windows CMD

```bash id="r5"
venv\Scripts\activate
```

## PowerShell

```bash id="r6"
.\venv\Scripts\Activate.ps1
```

Quand activé tu verras :

```txt id="r7"
(venv)
```

dans le terminal.

---

# 7. Installer dépendances

```bash id="r8"
pip install customtkinter watchdog pillow
```

---

# 8. Créer requirements.txt

```bash id="r9"
pip freeze > requirements.txt
```

---

# 9. Ouvrir VS Code

Depuis terminal :

```bash id="r10"
code .
```

---

# 10. Premier fichier : main.py

Créer :

```txt id="r11"
main.py
```

Ce fichier lancera l’application.

---

# 11. Créer organizer.py

Chemin :

```txt id="r12"
services/organizer.py
```

Contiendra :

* extensions,
* logique de déplacement,
* création dossiers.

---

# 12. Créer watcher.py

Chemin :

```txt id="r13"
services/watcher.py
```

Contiendra :

* watchdog,
* surveillance temps réel.

---

# 13. Créer interface

Chemin :

```txt id="r14"
ui/main_window.py
```

Contiendra :

* fenêtre,
* boutons,
* logs,
* browse folder,
* dark mode.

---

# 14. Télécharger icônes

Créer dans :

```txt id="r15"
assets/icons/
```

Icônes :

* folder.png
* start.png
* stop.png
* file.png
* settings.png

Télécharger depuis :

* [Flaticon](https://www.flaticon.com?utm_source=chatgpt.com)
* [Icons8](https://icons8.com/icons?utm_source=chatgpt.com)

---

# 15. Couleurs UI finales

| Élément    | Couleur |
| ---------- | ------- |
| Background | #121212 |
| Card       | #1E1E1E |
| Accent     | #00C853 |
| Text       | #FFFFFF |

---

# 16. Police recommandée

Télécharger :

## Poppins

ou

## Inter

Depuis :

[Google Fonts](https://fonts.google.com?utm_source=chatgpt.com)

---

# 17. Fonctionnement du projet

## Mode manuel

Bouton :

```txt id="r16"
ORGANIZE NOW
```

→ Trie immédiatement tous les fichiers.

---

## Mode automatique

Checkbox :

```txt id="r17"
☑ Auto Monitor
```

→ Lance surveillance automatique.

---

# 18. Flow complet

```txt id="r18"
User selects folder
        ↓
RUSH scans files
        ↓
Detect extension
        ↓
Create category folder
        ↓
Move file
        ↓
Display logs
```

---

# 19. Extensions à utiliser

## Documents

```python id="r19"
[".pdf", ".docx", ".txt", ".xlsx", ".pptx"]
```

## Images

```python id="r20"
[".jpg", ".jpeg", ".png", ".gif", ".webp"]
```

## Videos

```python id="r21"
[".mp4", ".mkv", ".mov", ".avi"]
```

## Audio

```python id="r22"
[".mp3", ".wav"]
```

## Archives

```python id="r23"
[".zip", ".rar", ".7z"]
```

---

# 20. Ce que tu fais MAINTENANT

## Étape immédiate

1. Crée dossier `RUSH`
2. Crée structure complète
3. Active venv
4. Installe packages
5. Ouvre VS Code

ET STOP.

Ne code pas encore tout.

---

# 21. Roadmap parfaite

## Phase 1

* structure
* UI simple
* bouton browse

## Phase 2

* organize now

## Phase 3

* auto monitor

## Phase 4

* logs

## Phase 5

* polish UI

## Phase 6

* build exe

---

# 22. Build Windows EXE plus tard

Installer :

```bash id="r24"
pip install pyinstaller
```

Puis :

```bash id="r25"
pyinstaller --onefile --windowed main.py
```

Le `.exe` sera dans :

```txt id="r26"
dist/
```

---

# 23. Résultat final


* une vraie app desktop,
* une belle UI,
* un projet portfolio propre,
* une app utile réelle,
* un projet fini rapidement.
