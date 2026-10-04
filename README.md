*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **StudyBuddy** — a focused, aesthetic, all-in-one study companion designed for my friend Maya, who is preparing for intense software engineering certification exams while juggling a full-time job. 

### The Problem
Maya was constantly struggling with **cognitive fragmentation**:
- She used one app for a Pomodoro timer (filled with intrusive ads and subscription banners).
- Another app for flashcards (which charged monthly fees just to generate quizzes from decks).
- A messy notebook to track her daily study streaks.
- Constant switching between three different browser tabs broke her flow state and triggered study fatigue.

### The Solution: StudyBuddy
StudyBuddy solves this by integrating the entire study loop into a single, distraction-free, privacy-preserving offline web app:
1. **⏱️ Pomodoro Focus Timer**: Customizable work/break cycles, circular glowing SVG progress ring, and an integrated study task tracker.
2. **🌧️ Lo-Fi Rain Ambience & Chimes**: Built with the **Web Audio API** — synthesizes ambient pink noise rain and 528Hz clarity singing bowl chimes entirely in code, requiring zero external MP3 downloads or internet connection.
3. **🗂️ 3D Perspective Flashcards**: Smooth 3D card flips with keyboard shortcuts (<kbd>Space</kbd>, <kbd>1</kbd>/<kbd>2</kbd>), spaced review rating ("Mastered" vs "Need Review"), and deck organization.
4. **🎯 Auto-Quiz Generator**: With one click, it intelligently converts any flashcard deck into a 4-choice interactive quiz with smart distractors, real-time feedback, and celebration confetti.
5. **🔥 Streak & Progress Analytics**: Daily consecutive study streak counter with a burning flame badge, 7-day weekly activity heat dots, daily goal progress bars, and full JSON backup/restore.

---

## Demo

- **Live Local Setup**: Instant 1-command launch with zero npm dependencies:
  ```bash
  python -m http.server 8080 --directory d:\antigravity
  ```
  Then open `http://localhost:8080/index.html` in any browser!
- **Key Visual Highlights**:
  - Deep midnight violet glassmorphism theme (`#0a0d18`) with toggleable light mode.
  - Interactive 3D flip card animations with hardware-accelerated CSS perspective.
  - Pure HTML5 Canvas confetti bursts for quiz completions and streak milestones.

---

## Code

The project is built entirely with vanilla web standards for peak speed, portability, and zero build tool complexity:

- [`index.html`](file:///d:/antigravity/index.html): Semantic, accessible HTML5 structure with tabbed navigation and interactive modals.
- [`styles.css`](file:///d:/antigravity/styles.css): Tailored glassmorphism design system using modern CSS variables, responsive grids, and micro-animations.
- [`app.js`](file:///d:/antigravity/app.js): Application logic handling Pomodoro intervals, flashcard state machines, quiz question generation algorithms, and streak verification.
- [`audio.js`](file:///d:/antigravity/audio.js): Self-contained Web Audio API synthesizer for chimes and pink noise rain generator.
- [`data.js`](file:///d:/antigravity/data.js): Curated starter decks across Computer Science, World Geography, and General Science.

{% github https://github.com/bsky124816-cyber/studyTracker %}

🔗 **GitHub Repository**: [bsky124816-cyber/studyTracker](https://github.com/bsky124816-cyber/studyTracker/tree/main)

---

## How I Built It

I developed StudyBuddy using an autonomous AI pair-programming workflow:
1. **Agentic Architectural Planning**: Modeled a local-first study loop eliminating external API and audio asset dependencies.
2. **Synthesizing Audio via Web Audio API**: Rather than relying on external audio assets that can break or fail offline, we synthesized harmonic frequencies (C5–C6 chords for correct answers, low-frequency buzzers for mistakes, 528Hz Solfeggio harmonics for timer completion, and filtered pink noise for rain ambience).
3. **Smart Distractor Generation**: Implemented a randomized distractor selection algorithm that parses term definitions from related flashcards to construct meaningful multiple-choice challenges on the fly.
4. **Resilient Streak Calculation**: Designed an edge-case safe daily streak engine that compares ISO date stamps across timezones to ensure fair streak preservation without penalizing study schedule variances.

---

## Why Does Open Innovation Matter?

Open innovation and open-weight models democratize access to learning tools. Many students and self-learners around the world cannot afford monthly SaaS subscriptions for basic flashcard repetition or timer apps. 

By building on open web standards and transparent tools:
- **Zero Lock-In**: Students own 100% of their study data and decks via open JSON export.
- **Offline First**: Works anywhere in the world, even in areas with unstable internet connectivity.
- **Full Privacy**: Study sessions, notes, and habits never leave the user's local machine.

---

## My Agent Session

- Developed with the **Antigravity** agentic AI assistant.
- Used autonomous code generation, multi-file architecture, and live local server verification to craft a production-ready application in minutes.

---

## Prize Categories

- **Build for a Friend**
- **Open-Source AI / Local-First Innovation**
