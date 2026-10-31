# 🌿 Super Mind Oasis

<p align="left">
  <b>English</b> | <a href="README_zh-TW.md">繁體中文</a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20PWA-brightgreen)](https://superbalabah.github.io/super_mind_oasis/?lang=en)
[![Stack: Three.js](https://img.shields.io/badge/Stack-Three.js%20%7C%20Vite-orange)](https://github.com/SuperBalabah/super_mind_oasis)

> **A client-side 3D mindfulness & emotional inquiry PWA engineered with procedural Three.js shaders, algorithmic Web Audio synthesis, and a zero-server privacy architecture.**

---

## 🌐 Live Demos & Language Editions

| Language Edition | Live Demo URL | Description |
| :--- | :--- | :--- |
| **🇺🇸 English Edition** | **[https://superbalabah.github.io/super_mind_oasis/?lang=en](https://superbalabah.github.io/super_mind_oasis/?lang=en)** | Boots directly into English for international users and reviewers. |
| **🇹🇼 Traditional Chinese** | **[https://superbalabah.github.io/super_mind_oasis/](https://superbalabah.github.io/super_mind_oasis/)** | Native Traditional Chinese edition for daily mindful immersion. |

> [!NOTE]
> **Data Coexistence & Seamless Switching**: Both language URLs share the exact same local database and optional GitHub Gist cloud synchronization. Switching language never affects your saved trees, reflections, or habit companions. You can also toggle between `[中 / EN]` anytime via the button at the top-left corner.

---

## 📖 Project Overview

### 1. Philosophy & Clinical Motivation
Conventional mental wellness apps frequently suffer from commercial subscription paywalls, server-side data extraction of intimate emotional logs, and anxiety-inducing gamification (e.g. punishing users with "withered plants" if they skip logging).

**Super Mind Oasis** was engineered from a preventive mental health perspective:
- **Zero Server Surveillance**: Emotional inquiries and reflective journals remain 100% on the client device.
- **Silent, Non-Punitive Growth**: Trees develop gradually alongside real-time passage without streak pressure.
- **Cognitive Inquiry & Reframing**: Anxieties are externalized as symbolic saplings. When breakthroughs are reached, users harvest lessons into a permanent *Chronicles of Growth* timeline.

---

### 2. Deep Tech Architecture & Key Innovations

#### 🎨 3D Procedural Graphics & Custom Shaders (Three.js)
- **Procedural Floating Island**: Rendered with custom lighting, atmospheric aerial dust, fireflies, dynamic water reflection shaders, and wind-responsive foliage.
- **4 Lighting & Weather Atmospheres**: Instant real-time transitions across Dawn, Warm Sunset, Starry Night, and Gentle Rain.
- **Inertial Orbit Controls**: 360° touch rotation and pinch-to-zoom with realistic physical damping, maintaining a locked **60 FPS** on mobile Safari and Chrome.

#### 🔊 100% Procedural Algorithmic Audio (Web Audio API)
- **Zero External Audio Assets (0KB Payload)**: No pre-recorded MP3/WAV downloads required.
- **Pure Synthesis DSP**: Soundscapes are synthesized in real-time using biquad filters, sine oscillators, and white noise buffers:
  - *288Hz Resonant Singing Bowl* (Tibetan meditation chime)
  - *Dynamic Water Droplets* with randomized pitch modulation
  - *Procedural Rain Noise & Gentle Wind*

#### 🔒 Zero-Server Local-First Privacy (IndexedDB / LocalStorage & Gist)
- **Zero-Backend Dependency**: Full gameplay, trees, growth rings, and habit companions run client-side.
- **Serverless GitHub Gist Sync**: Users can optionally sync progress between iPhone and PC by entering a private GitHub Personal Access Token (PAT). Syncing performs automatic 1.5-second background debounced uploads and launch-time auto-pulls.

#### 📱 Mobile-First iOS PWA Experience
- Configured with `manifest.json` and standalone display mode to automatically hide Safari URL bars.
- Service Worker offline asset caching ensures instant launch even in airplane mode.

---

### 3. Quick Start & Local Development

```bash
# Clone the repository
git clone https://github.com/SuperBalabah/super_mind_oasis.git
cd super_mind_oasis

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
