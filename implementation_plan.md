# Implementation Plan - Super Mind Oasis (心靈綠洲：課題之森)

建立一個專為手機 (iPhone PWA) 與桌面打造的高質感 3D 治癒系休閒養成遊戲，結合個人成長、情緒外化與心理韌性年輪記錄。

## 系統架構

1. **核心技術棧**：
   - 前端架構：Vite + Vanilla JavaScript + Vanilla CSS（極速熱更新、完美手機 PWA 支援）
   - 3D 渲染引擎：Three.js（3D 懸浮心靈綠洲、程序化低多邊形島嶼、動態生長樹木、水波紋與粒子微風）
   - 離線聲音引擎：Web Audio API（純代碼程序化合成空靈頌缽、林間微風、細雨與水滴聲，免載入外部大檔、100% 離線即開）
   - PWA 規格：完整支援 iOS Safari「加入主畫面」、獨立全螢幕運行、無邊框沉浸、`manifest.json` 與 Service Worker 快取
   - 數據持久化：LocalStorage（離線保存種植進度、思緒筆記、年輪檔案，永不丟失）

2. **核心模組劃分**：
   - `index.html`: PWA 標籤、iOS 沉浸式 meta、響應式畫布容器與磨砂玻璃 UI
   - `src/scene3d.js`: Three.js 場景管線（懸浮小島、地貌、自訂 Procedural Tree 樹木生長動畫、微波水池、環境光/日夜切換、落葉/微光粒子）
   - `src/audio.js`: Web Audio API 聲景合成器（頌缽、清脆水滴、微風、細雨白噪音）
   - `src/storage.js`: 課題之樹與年輪檔案的資料庫封裝
   - `src/app.js`: 遊戲主流程、UI 交互、播種/筆記/收穫模態窗控制、相機軌道與手勢適配
   - `manifest.json` & `sw.js`: PWA 離線與全螢幕配置

## 任務清單

- [ ] 專案初始化與結構設定 (Vite + Three.js)
- [ ] PWA 離線配置與 iOS Safari 沉浸設定 (Manifest, Service Worker, Icons)
- [ ] 3D 懸島與環境光影渲染 (Three.js 核心場景、軌道控制器、微光粒子、水池)
- [ ] 程序化「課題之樹」模型生成與生長動畫 (種子 -> 嫩芽 -> 小樹 -> 繁盛大樹 -> 碩果金光)
- [ ] Web Audio API 療癒音效引擎 (頌缽、流水、微風、金光頓悟 chime)
- [ ] 課題與年輪系統 (播種課題、時間流逝沉澱、心境記錄、收穫覆盤、年輪展館)
- [ ] 沉浸式玻璃擬態 UI 與手機單手操作優化
- [ ] 自動化測試驗證 (Node.js 語法與無頭斷言)
- [ ] 本地 Wi-Fi 啟動指南與 iPhone 加入主畫面教學
- [x] 跨設備免費 GitHub Gist 雲端同步系統 (自動背景同步 + 雙向手動推送/拉取 + 頂部極簡雲朵呼吸燈)

