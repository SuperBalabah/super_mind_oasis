# 🌿 Super Mind Oasis (心靈島 · 課題之森)

<p align="left">
  <a href="README.md">English</a> | <b>繁體中文</b>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20PWA-brightgreen)](https://superbalabah.github.io/super_mind_oasis/)
[![Stack: Three.js](https://img.shields.io/badge/Stack-Three.js%20%7C%20Vite-orange)](https://github.com/SuperBalabah/super_mind_oasis)

> **專為行動裝置 (iOS PWA) 與桌面打造的 3D 沉浸式心靈養成遊戲，將深層焦慮轉化為自然生長之樹與一生收藏的年輪之書。**

---

## 🌐 線上體驗與雙語入口 (Live Demos)

| 語言版本 | 線上體驗網址 | 說明 |
| :--- | :--- | :--- |
| **🇹🇼 繁體中文 原生版** | **[https://superbalabah.github.io/super_mind_oasis/](https://superbalabah.github.io/super_mind_oasis/)** | 預設以原生繁體中文載入，適合日常寧靜沉浸與習慣記錄。 |
| **🇺🇸 English Edition** | **[https://superbalabah.github.io/super_mind_oasis/?lang=en](https://superbalabah.github.io/super_mind_oasis/?lang=en)** | 專屬全英文展示版，適合國際評審與英語用戶體驗。 |

> [!NOTE]
> **資料完全共用與無縫切換**：無論使用哪一個網址進入，本地存檔與 GitHub Gist 雲端同步資料皆 100% 互通。在 App 內亦可隨時點擊左上角的 `[中 / EN]` 自由切換語言。

---

## 🌟 核心特色

### 1. 頂級質感 3D 懸浮心靈綠洲 (Three.js)
- 360° 觸控軌道旋轉與雙指縮放，自帶物理減速阻尼手感。
- 柔和的體積光、晨曦、暖陽黃昏、靜謐星夜與綿綿細雨四種氛圍即時切換。
- 隨微風輕晃的枝葉、動態水波倒影、空中漂浮的光斑微塵與夜間螢火蟲。
- 移動端 Safari 與 Chrome 鎖定流暢 60 FPS 渲染。

### 2. 課題之樹生命週期 (Mind Garden System)
- **播種**：寫下當下的焦慮或課題，挑選專屬象徵樹種（勇氣之橡、通透之杏、沈思白樺、釋懷藍花楹）。
- **靜默生長**：絕無「不登入就枯萎」的負面焦慮懲罰，隨現實時間推移自然生長。
- **心境記錄**：隨時記錄進展與感悟，如同在樹幹刻下思緒年輪。
- **頓悟收穫**：問題解決時寫下覆盤心得，大樹開花結果，凝結為永久收藏的年輪徽章。

### 3. 100% 離線純合成 Web Audio 療癒音效
- **零外部音效檔案下載 (0KB 負擔)**：不依賴任何 MP3 或 WAV 外部音檔。
- **純演算法 DSP 合成**：即時透過雙二階濾波器、正弦振盪器與白噪音緩衝區合成聲音：
  - 288Hz 空靈頌缽（西藏冥想銅缽音韻）
  - 隨機音高調製的清脆水滴聲
  - 逼真的綿綿雨聲與柔和微風白噪音

### 4. 零伺服器極致隱私架構 (Zero-Server Local-First)
- **零後端依賴**：所有情緒私密日記、樹木成長歷程與習慣數據均只保存在使用者本地端。
- **無伺服器 GitHub Gist 雲端同步**：支援跨設備使用個人私有 Secret Gist 同步，具備 1.5 秒防抖自動背景上傳與啟動自動同步。

### 5. 全螢幕 iOS PWA 沉浸支援
- 支援加入 iPhone 主畫面，自動隱藏 Safari 網址列與工具列，適配瀏海與動態島安全區域。
- 離線 Service Worker 快取，飛航模式照樣秒開。

---

## 📱 iPhone 遊玩方式

### 方式 A：GitHub Pages 雲端隨開即玩（最推薦）
1. 在 iPhone 的 Safari 網址列打開：  
   **[https://superbalabah.github.io/super_mind_oasis/](https://superbalabah.github.io/super_mind_oasis/)**
2. 點擊 Safari 底部的「**分享**」按鈕（向上箭頭）。
3. 選擇「**加入主畫面 (Add to Home Screen)**」。
4. 點擊「新增」後，iPhone 桌面即生成專屬全螢幕 App！

### 方式 B：本地 Wi-Fi 即時熱更新（局域網連線）
1. 確保 iPhone 與電腦連線至同一個 Wi-Fi 網絡。
2. 在 iPhone Safari 輸入本地開發伺服器 IP（如：`http://192.168.x.x:5173/`）。
3. 享受即時熱更新的開發與遊玩體驗。

---

## 💻 本地開發指南

```bash
# 複製專案庫
git clone https://github.com/SuperBalabah/super_mind_oasis.git
cd super_mind_oasis

# 安裝依賴套件
npm install

# 啟動本地開發伺服器
npm run dev

# 建置正式發布版本
npm run build
```

---

## 📄 開源授權

本專案採用 [MIT License](LICENSE) 開源授權條款。
