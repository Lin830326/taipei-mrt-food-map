# 🚇 台北捷運智能美食地圖

> 使用 Google Maps API 打造的智能美食推薦系統，輕鬆探索捷運站周邊美食！

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-API-red)](https://developers.google.com/maps)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript)

## ✨ 功能特色

- 🗺️ **完整捷運路線** - 支援台北捷運所有路線（文湖線、淡水信義線、松山新店線等）
- 🍽️ **智能評分系統** - AI 加權評分結合評價、距離、評論數、價格
- 🔍 **進階篩選** - 可調整搜尋半徑（500m-2000m）、價格範圍、營業狀態
- 📊 **即時資訊** - 顯示評分、評論數、營業狀態、價格等級
- 🏷️ **智能標籤** - 自動過濾無效標籤，顯示餐廳類型（中文）
- 🗺️ **地圖整合** - 直接在地圖上標記餐廳位置
- 📱 **響應式設計** - 完美支援手機、平板、桌面裝置
- 💾 **記憶偏好** - 自動儲存使用者搜尋歷史與偏好設定
- 🔗 **Google Maps 跳轉** - 一鍵開啟 Google Maps 導航

## 🚀 快速開始

### 方法一：線上使用
```
https://YOUR_GITHUB_USERNAME.github.io/taipei-mrt-food-map/
```

### 方法二：本地開發

#### 1. Clone 專案
```bash
git clone https://github.com/YOUR_USERNAME/taipei-mrt-food-map.git
cd taipei-mrt-food-map
```

#### 2. 設定 Google Maps API Key

##### 📌 取得 API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - ✅ **Maps JavaScript API** (地圖顯示)
   - ✅ **Places API** (美食搜尋)
   - ✅ **Geocoding API** (地址轉座標)

4. 建立憑證 → API 金鑰

##### 🔐 設定 API 限制（重要！）

**應用程式限制：**
```
HTTP 參照網址（網站）
https://YOUR_USERNAME.github.io/*
http://localhost:*
http://127.0.0.1:*
```

**API 限制：**
- 限制金鑰只能使用上述三個 API

##### 📝 設定 API Key

編輯 `config.js` 檔案：

```javascript
const CONFIG = {
    GOOGLE_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE',  // ⚠️ 替換成您的 API Key
    // ... 其他設定
};
```

#### 3. 啟動本地伺服器

```bash
# 方法 1: Python (推薦)
python -m http.server 8000

# 方法 2: Node.js
npx http-server -p 8000

# 方法 3: VS Code Live Server
# 安裝 Live Server 擴充套件後，右鍵點擊 index.html → Open with Live Server
```

#### 4. 開啟瀏覽器
```
http://localhost:8000
```

## 📦 專案結構

```
taipei-mrt-food-map/
├── index.html              # 主頁面 - HTML 結構
├── app.js                  # 核心邏輯 - 地圖、搜尋、評分系統
├── config.js               # 配置檔案 - API Key、篩選器、權重設定
├── styles.css              # 樣式表 - RWD 響應式設計
├── docs/                   # 文件目錄
│   ├── SETUP.md           # 詳細安裝指南
│   └── DIAGNOSTIC_REPORT.md  # 診斷報告
├── README.md              # 本檔案
└── LICENSE                # MIT 授權
```

## 🛠️ 技術棧

### 前端技術
- **JavaScript** - 純 Vanilla JS（無框架）
- **HTML5** - 語意化標籤
- **CSS3** - Flexbox + Grid 佈局

### Google APIs
- **Maps JavaScript API** - 地圖顯示與標記
- **Places API** - 餐廳資料搜尋
- **Geocoding API** - 地址轉經緯度

### UI/UX
- **Font Awesome 6** - 圖示庫
- **響應式設計** - 支援各種螢幕尺寸
- **漸變動畫** - 流暢的使用者體驗

## 📊 核心功能詳解

### 1️⃣ 智能評分系統

```javascript
總分 = 評價(40%) + 距離(30%) + 評論數(20%) + 價格(10%)
```

**評分計算方式：**
- **評價分數** (0-100)：Google 星級評分 × 20
- **距離分數** (0-100)：越近分數越高，每 10 公尺扣 1 分
- **評論分數** (0-100)：評論數 ÷ 10（上限 100）
- **價格分數** (0-100)：價格越低分數越高

### 2️⃣ 搜尋流程

```
1. 使用者選擇捷運站 → "台北車站"
2. Geocoding API → 轉換為座標 {lat: 25.0478, lng: 121.5170}
3. Places API → 搜尋半徑內餐廳
4. 智能評分 → 計算每間餐廳分數
5. 排序顯示 → 由高到低排列
```

### 3️⃣ 篩選選項

| 選項 | 範圍 | 預設值 |
|------|------|--------|
| 搜尋半徑 | 500m - 2000m | 800m |
| 價格範圍 | $ - $$$$ | $$$ |
| 餐廳類型 | 餐廳/咖啡廳/烘焙店 | 全部 |
| 營業狀態 | 營業中/全部 | 全部 |

### 4️⃣ 標籤過濾系統

自動過濾無意義的通用標籤：
```javascript
❌ 過濾掉：point_of_interest, establishment, food
✅ 顯示：日式料理、咖啡廳、烘焙店
```

## 🎨 使用說明

### 步驟 1：選擇捷運站
點擊左側面板選擇您想探索的捷運站

### 步驟 2：調整篩選條件（可選）
- 🎚️ 搜尋半徑：拖動滑桿調整距離
- 💰 價格範圍：設定預算上限
- 🔍 餐廳類型：選擇特定類型
- ⏰ 只顯示營業中：開啟/關閉

### 步驟 3：查看推薦
系統會自動顯示智能推薦的餐廳列表

### 步驟 4：查看詳情
- 📍 點擊卡片查看詳細資訊
- 🗺️ 點擊「Google Maps」跳轉導航
- 📸 查看餐廳照片、評價、營業時間

## 🔧 配置說明

### config.js 主要設定

```javascript
const CONFIG = {
    // API Key
    GOOGLE_API_KEY: 'YOUR_API_KEY',
    
    // 預設搜尋半徑
    DEFAULT_SEARCH_RADIUS: 800,
    
    // 最大結果數
    MAX_RESULTS: 12,
    
    // 智能評分權重
    SCORING_WEIGHTS: {
        rating: 0.4,      // 評價 40%
        distance: 0.3,    // 距離 30%
        reviews: 0.2,     // 評論數 20%
        price: 0.1        // 價格 10%
    },
    
    // 功能開關
    FEATURE_FLAGS: {
        enableNavigation: false,   // 導航功能（需付費）
        enableGoogleMaps: true     // Google Maps 跳轉（免費）
    }
};
```

## 💰 API 費用說明

### 免費額度（每月）
- **Maps JavaScript API**: $200 美元額度
- **Places API**: $200 美元額度
- **Geocoding API**: $200 美元額度

### 實際使用成本（預估）
- **每次搜尋**：約 $0.02 - 0.03 美元
- **每月 1000 次搜尋**：約 $20 - 30 美元
- ✅ **在免費額度內完全免費**

### 省錢技巧
1. ✅ 啟用快取機制（已實作）
2. ✅ 設定 API Key 限制
3. ✅ 設定每日配額上限
4. ✅ 只搜尋必要資料

## ⚠️ 注意事項

### 安全性
- ⚠️ **請勿** 將未限制的 API Key 公開於 GitHub
- ✅ 務必設定 HTTP 參照網址限制
- ✅ 定期檢查 API 使用量

### 效能
- 搜尋結果會快取 30 分鐘
- 建議搜尋半徑不超過 2000m
- 最大結果數設為 12 筆

### 瀏覽器支援
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 貢獻流程
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 開發規範
- 使用 ES6+ 語法
- 保持程式碼可讀性
- 添加適當的註解
- 遵循現有的命名規範

## 📝 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 👨‍💻 作者

**LAI JIUN-LIN**

- 📧 Email: jimlai19940326@gmail.com
- 💼 GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🔗 相關連結

- 📖 [詳細安裝指南](docs/SETUP.md)
- 🐛 [回報問題](https://github.com/YOUR_USERNAME/taipei-mrt-food-map/issues)
- 💡 [功能建議](https://github.com/YOUR_USERNAME/taipei-mrt-food-map/issues/new)
- 📚 [Google Maps API 文件](https://developers.google.com/maps/documentation)

## 🙏 致謝

- [Google Maps Platform](https://developers.google.com/maps) - 提供地圖與美食資料
- [Font Awesome](https://fontawesome.com/) - 圖示庫
- [台北捷運公司](https://www.metro.taipei/) - 捷運路線資料
- 所有貢獻者與使用者

## 📞 聯絡方式

如有問題或建議，歡迎透過以下方式聯絡：

- 📧 **Email**: jimlai19940326@gmail.com
- 💬 **GitHub Issues**: [提交問題](https://github.com/YOUR_USERNAME/taipei-mrt-food-map/issues)
- 🌟 **給個星星**: 如果這個專案對您有幫助，請給個 Star！

---

**Made with ❤️ in Taipei**
