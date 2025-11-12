# 🚇 台北捷運智能美食地圖

> 使用 Google Maps API 打造的智能美食推薦系統

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://YOUR_USERNAME.github.io/taipei-mrt-food-map/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 功能特色

- 🗺️ **完整捷運路線** - 支援台北捷運所有路線
- 🍽️ **智能推薦** - AI 評分系統結合距離、評價、價格
- 🔍 **進階篩選** - 距離、價格、類型、營業狀態
- 📱 **響應式設計** - 支援手機、平板、桌面裝置
- 💾 **記憶偏好** - 自動儲存使用者搜尋偏好

## 🚀 快速開始

### 線上使用
直接訪問：https://YOUR_USERNAME.github.io/taipei-mrt-food-map/

### 本地開發

1. **Clone 專案**
```bash
git clone https://github.com/YOUR_USERNAME/taipei-mrt-food-map.git
cd taipei-mrt-food-map
```

2. **設定 Google Maps API Key**

   a. 前往 [Google Cloud Console](https://console.cloud.google.com/)
   
   b. 啟用以下 API：
      - Maps JavaScript API
      - Places API  
      - Geocoding API
   
   c. 創建 API Key 並設定限制
   
   d. 編輯 `config.js`：
   ```javascript
   GOOGLE_API_KEY: 'YOUR_API_KEY_HERE'
   ```

3. **啟動本地伺服器**
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 VS Code Live Server 擴充套件
```

4. **開啟瀏覽器**
```
http://localhost:8000
```

## 🔐 API Key 安全設定

**重要！** 請務必在 Google Cloud Console 設定 API 限制：

1. **應用程式限制** → HTTP 參照網址
2. **新增允許的網址：**
   - `https://YOUR_USERNAME.github.io/*`
   - `http://localhost:*`

3. **API 限制** → 只啟用需要的 API

## 📦 專案結構

```
taipei-mrt-food-map/
├── index.html          # 主頁面
├── app.js             # 核心應用邏輯
├── config.js          # 配置檔案
├── styles.css         # 樣式表
├── docs/              # 文件
│   ├── SETUP.md
│   └── DIAGNOSTIC_REPORT.md
└── README.md          # 本檔案
```

## 🛠️ 技術棧

- **前端框架：** 純 JavaScript (Vanilla JS)
- **地圖服務：** Google Maps JavaScript API
- **美食資料：** Google Places API
- **地理編碼：** Google Geocoding API
- **樣式：** CSS3 + Flexbox/Grid
- **圖示：** Font Awesome 6

## 📊 功能說明

### 智能評分系統
```javascript
評分 = 評價(40%) + 距離(30%) + 評論數(20%) + 價格(10%)
```

### 搜尋選項
- **半徑：** 500m - 2000m
- **價格：** $ - $$$$
- **類型：** 餐廳、咖啡廳、烘焙店等
- **狀態：** 營業中/全部

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 👨‍💻 作者

您的名字 - [@your_handle](https://twitter.com/your_handle)

專案連結：[https://github.com/YOUR_USERNAME/taipei-mrt-food-map](https://github.com/YOUR_USERNAME/taipei-mrt-food-map)

## 🙏 致謝

- Google Maps Platform
- Font Awesome
- 所有貢獻者

## ⚠️ 注意事項

- Google Maps API 有免費額度限制（每月 $200 美元）
- 建議設定每日配額避免超額費用
- 請勿將未限制的 API Key 公開於程式碼中

## 📞 聯絡方式

如有問題或建議，歡迎透過以下方式聯絡：
- 📧 Email: your.email@example.com
- 💬 GitHub Issues: [提交問題](https://github.com/YOUR_USERNAME/taipei-mrt-food-map/issues)
