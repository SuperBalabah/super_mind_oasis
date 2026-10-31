# 🌿 Super Mind Oasis (心靈島 · 課題之森)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20PWA-brightgreen)](https://superbalabah.github.io/super_mind_oasis/?lang=en)
[![Stack: Three.js](https://img.shields.io/badge/Stack-Three.js%20%7C%20Vite-orange)](https://github.com/SuperBalabah/super_mind_oasis)

> **A client-side 3D mindfulness & emotional inquiry PWA engineered with procedural Three.js shaders, algorithmic Web Audio synthesis, and a zero-server privacy architecture.**  
> 專為行動裝置 (iOS PWA) 與桌面打造的 3D 沉浸式心靈養成遊戲，將深層焦慮轉化為自然生長之樹與一生收藏的年輪之書。

---

## 🌐 Live Demos & Language Editions (線上體驗與雙語入口)

| Language / 語言版本 | Live Demo URL / 線上網址 | Notes / 說明 |
| :--- | :--- | :--- |
| **🇺🇸 English Edition** | **[https://superbalabah.github.io/super_mind_oasis/?lang=en](https://superbalabah.github.io/super_mind_oasis/?lang=en)** | Boots directly into English for reviewers and international users. |
| **🇹🇼 繁體中文 原生版** | **[https://superbalabah.github.io/super_mind_oasis/](https://superbalabah.github.io/super_mind_oasis/)** | 預設以原生繁體中文載入，適合日常寧靜沉浸與習慣記錄。 |

> [!NOTE]
> **Data Coexistence & Seamless Switching**: Both language URLs share the exact same local database and optional GitHub Gist cloud synchronization. Switching language never affects your saved trees, reflections, or habit companions. You can also toggle between `[中 / EN]` anytime via the button at the top-left corner.

---

## 🇺🇸 English Project Overview

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

## 🇹🇼 繁體中文 專案介紹

### 🌟 核心特色

1. **頂級質感 3D 懸浮心靈綠洲 (Three.js)**
   - 360° 觸控軌道旋轉與雙指縮放，自帶物理減速阻尼手感。
   - 柔和的體積光、晨曦、暖陽黃昏、靜謐星夜與綿綿細雨四種氛圍切換。
   - 隨微風輕晃的枝葉、動態水波倒影、空中漂浮的光斑微塵與夜間螢火蟲。
2. **課題之樹生命週期 (Mind Garden System)**
   - **播種**：寫下當下的焦慮或課題，挑選專屬象徵樹種（勇氣之橡、通透之杏、沈思白樺、釋懷藍花楹）。
   - **靜默生長**：絕無「不登入就枯萎」的懲罰，隨現實時間推移自然生長。
   - **心境記錄**：隨時記錄進展與感悟，如同在樹幹刻下思緒年輪。
   - **頓悟收穫**：問題解決時寫下覆盤心得，大樹開花結果，凝結為永久收藏的年輪徽章。
3. **100% 離線純合成 Web Audio 療癒音效**
   - 免下載任何外部音效包，純算法合成 288Hz 空靈頌缽、清脆水滴、柔和微風與雨夜白噪音。
4. **全螢幕 iOS PWA 沉浸支援**
   - 支援加入 iPhone 主畫面，自動隱藏 Safari 網址列與工具列，適配瀏海與動態島安全區域。
   - 離線 Service Worker 快取，飛航模式照樣秒開。
5. **免費跨設備 GitHub Gist 雲端同步系統**
   - 支援無伺服器 (Serverless) 純靜態跨設備同步，使用私有 Secret Gist 保存資料，保護個人隱私。
   - 雙向自動背景同步：開啟 App 自動比對雲端最新進度，操作時 1.5 秒背景防抖靜默上傳。
   - 支援手動上傳與拉取覆蓋，並即時顯示上次同步時間。

---

### 📱 iPhone 遊玩方式

#### 方式 A：GitHub Pages 雲端隨開即玩（最推薦，免同一 Wi-Fi）
1. 在 iPhone 的 Safari 網址列直接打開：  
   **[https://superbalabah.github.io/super_mind_oasis/](https://superbalabah.github.io/super_mind_oasis/)**
2. 點擊 Safari 底部的「**分享**」按鈕（向上箭頭）。
3. 選擇「**加入主畫面 (Add to Home Screen)**」。
4. 點擊「新增」後，iPhone 桌面即生成專屬全螢幕 App！

#### 方式 B：本地 Wi-Fi 即時熱更新（局域網連線）
1. 確保 iPhone 與電腦連線至同一個 Wi-Fi 網絡。
2. 在 iPhone Safari 輸入本地開發伺服器 IP（如：`http://192.168.x.x:5173/`）。
3. 享受即時熱更新的開發與遊玩體驗。
