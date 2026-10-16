# Callbreak.com - Digital Scorecard (v8)

A lightweight, offline-first, single-file digital scorecard web application for the trick-taking card game **Callbreak**. Built entirely with vanilla HTML, CSS, and JavaScript, it runs directly in any modern browser without external libraries, servers, ads, or tracking.

---

## ✨ Features

* **Flexible Player Support (2–5 Players):** Automatically adjusts trick limits per round based on player count (26 tricks for 2 players, 17 for 3, 13 for 4, and 10 for 5).
* **Game Modes:**
  * **Normal:** Standard Callbreak scoring.
  * **Queen Minus:** Applies a `-13` point penalty to the player who takes the Queen of the trump suit in a given round (includes a "Nobody" option for 3- or 5-player games where cards are set aside).
* **Custom Rules & Configurations:**
  * Choose between **3, 5, 7, or 10 rounds**.
  * Configure **Minimum Bid Rules**: At least 1, At least 2, or Free Choice (customizable minimum bid from `0` to `max` per individual player).
* **Smart Round & Trick Management:**
  * **Dealer & Cutter Rotation:** Automatically tracks and rotates the current dealer and card cutter based on seating order.
  * **Trump Suit Tracking:** Mark the active trump suit (`♠`, `♥`, `♦`, `♣`) before locking bids each round.
  * **Trick Cap & Auto-Fill:** Prevents total tricks entered from exceeding the round limit and offers a one-tap **Auto fill** button for the last player.
  * **Multi-Step Undo:** Step backward from results to edit bids, or reopen completed rounds to adjust previous scores, trumps, or Queen penalties.
* **Timer & Auto-Save Persistence:**
  * Built-in game timer with **Pause/Resume** functionality that locks the board while paused.
  * Automatically saves game state to `localStorage` so unfinished games can be resumed even after closing the browser tab.
* **19 Visual Themes:**
  * **14 Classic Themes:** Dark, Light, Gemini Gradient, Light Blue Gradient, Midnight, Ocean, Sunset, Forest, Royal Purple, Rose, AMOLED Black, Sand, Cyber Neon, and Aurora.
  * **5 Animated / Special FX Themes:** Orbital Ripple, Glowing Fluid, Nebula Noir, MiGlassZ (glassmorphism), and ELITEBOOK.
* **End-of-Game Celebrations & Export:**
  * Animated winner overlay with confetti and synthesized Web Audio API victory fanfare.
  * Generates a high-resolution (`1080px` wide) themed **JPG scorecard summary** for direct download or native mobile sharing via the Web Share API.
* **Mobile-First & Device Enhancements:**
  * Uses the **Screen Wake Lock API** to keep the screen awake during active games.
  * Haptic feedback (`navigator.vibrate`) on button presses for supported mobile devices.

---

## 🧮 Scoring Rules

| Outcome | Points Awarded |
| :--- | :--- |
| **Exact Bid** (Tricks = Bid) | `Bid × 10` |
| **1 Extra Trick** (Tricks = Bid + 1) | `(Bid × 10) + 1` |
| **2 Extra Tricks** (Tricks = Bid + 2) | `(Bid × 10) + 2` |
| **3+ Extra Tricks** (Tricks ≥ Bid + 3) | `-(Bid × 10)` |
| **Under Bid** (Tricks < Bid) | `-(Bid × 10)` |
| **Bid of 0** *(Free Choice mode)* | `0` pts (`+1` or `+2` for 1 or 2 tricks won; `0` for 3+ tricks) |
| **Queen Minus Penalty** *(Optional)* | `-13` pts added to the round score of the player who won the Queen of trump |

---

## 🚀 Getting Started

Because the entire application is self-contained in a single file, no build tools or installations are required.

1. Download `Callbreak_Scorecard_v8.html`.
2. Open the file directly in any modern desktop or mobile web browser (Chrome, Safari, Firefox, Edge).
3. *(Optional)* On mobile devices, use **"Add to Home Screen"** from your browser menu for a full-screen, app-like offline experience.

---

## 🛠️ Technical Stack

* **Architecture:** Single-file SPA (`Callbreak_Scorecard_v8.html`) with zero external dependencies.
* **Markup & Styling:** Semantic HTML5, CSS Custom Properties (CSS Variables), CSS Grid/Flexbox, keyframe animations, and `prefers-reduced-motion` accessibility support.
* **JavaScript & Web APIs:**
  * `localStorage` (state persistence under key `callbreak_com_v6`)
  * HTML5 `<canvas>` API (dynamic JPG result card rendering)
  * `AudioContext` / Web Audio API (synthesized victory sound effects)
  * `navigator.wakeLock` (prevents screen dimming)
  * `navigator.share` & `navigator.canShare` (native image sharing)
  * `navigator.vibrate` (tactile UI feedback)
    
