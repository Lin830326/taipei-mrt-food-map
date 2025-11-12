# ⚡ 快速設定指南

只需 3 個步驟即可開始使用台北捷運智能美食地圖!

## 📋 步驟 1: 取得 API Key

### 1.1 前往 Google Cloud Console
訪問: https://console.cloud.google.com/

### 1.2 創建專案 (如果還沒有)
1. 點擊頂部的專案選單
2. 點擊「新增專案」
3. 輸入專案名稱,例如 "MRT Food Map"
4. 點擊「建立」

### 1.3 啟用必要的 API
在左側選單中:
1. 點擊「API 和服務」→「程式庫」
2. 搜尋並啟用以下 API:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**
   - ✅ **Geocoding API**

### 1.4 建立 API 金鑰
1. 點擊「API 和服務」→「憑證」
2. 點擊「建立憑證」→「API 金鑰」
3. 複製顯示的 API 金鑰 (類似: `AIzaSyAbc123...`)
4. (建議) 點擊「限制金鑰」設定安全限制

### 1.5 設定 API 金鑰限制 (建議)
**應用程式限制**:
- 選擇「HTTP 參照位址」
- 新增網址模式: `http://localhost:*/*`

**API 限制**:
- 選擇「限制金鑰」
- 選取以下 API:
  - Maps JavaScript API
  - Places API
  - Geocoding API

---

## 🔑 步驟 2: 設定 API Key

### 2.1 開啟 config.js
在專案根目錄找到 `config.js` 檔案

### 2.2 貼上 API Key
找到第 5 行:
```javascript
GOOGLE_API_KEY: 'YOUR_API_KEY_HERE', // 請替換為您的實際 API Key
```

替換成您的 API Key:
```javascript
GOOGLE_API_KEY: 'AIzaSyAbc123...', // 👈 貼上您的 API Key
```

### 2.3 儲存檔案
按 `Ctrl + S` (Windows) 或 `Cmd + S` (Mac) 儲存

---

## 🚀 步驟 3: 執行應用程式

### 選項 A: 使用 VS Code Live Server (最簡單)
1. 安裝 VS Code 擴充套件: **Live Server**
2. 右鍵點擊 `index.html`
3. 選擇「Open with Live Server」
4. 自動開啟瀏覽器 🎉

### 選項 B: 使用 Python
```bash
# 在專案目錄開啟終端機
cd "d:\聯成電腦\MRT_projet"

# 執行 HTTP 伺服器
python -m http.server 8000

# 開啟瀏覽器訪問
http://localhost:8000
```

### 選項 C: 使用 Node.js
```bash
# 安裝 http-server (僅需一次)
npm install -g http-server

# 在專案目錄執行
cd "d:\聯成電腦\MRT_projet"
http-server -p 8000

# 開啟瀏覽器訪問
http://localhost:8000
```

### 選項 D: 使用 PHP
```bash
# 在專案目錄執行
cd "d:\聯成電腦\MRT_projet"
php -S localhost:8000

# 開啟瀏覽器訪問
http://localhost:8000
```

---

## ✅ 驗證設定

### 檢查清單
1. ✅ 頁面正常載入,沒有顯示 API 錯誤橫幅
2. ✅ 點擊捷運站可以在地圖上顯示位置
3. ✅ 點擊「智能搜尋」按鈕可以搜尋到餐廳
4. ✅ 餐廳卡片顯示評分、距離等資訊
5. ✅ 地圖上顯示餐廳標記

### 如果出現問題
參考 [README.md](README.md#-疑難排解) 的疑難排解章節

---

## 🎯 開始使用

### 第一次搜尋
1. 在左側捷運路線中選擇一個站點 (例如: 台北車站)
2. 系統自動開始搜尋
3. 在右側查看推薦的美食列表
4. 在地圖上查看餐廳位置

### 進階設定
- **搜尋半徑**: 選擇 500m、800m 或 1200m
- **價格範圍**: 拖動滑桿調整價格上限
- **排序方式**: 選擇智能推薦、評分優先或距離優先
- **營業狀態**: 勾選「只顯示營業中」
- **美食類型**: 點擊快速篩選器按鈕

---

## 💡 實用技巧

### 省錢技巧
- 🎯 **精準搜尋**: 使用較小的搜尋半徑可減少 API 呼叫
- 💾 **利用快取**: 重複搜尋相同站點不會產生額外費用
- 📊 **監控用量**: 在 Google Cloud Console 查看 API 使用量

### 最佳體驗
- 📱 **手機使用**: 完整支援手機瀏覽器
- 🗺️ **地圖互動**: 點擊標記查看餐廳資訊
- 💾 **自動記憶**: 系統會記住您的搜尋偏好
- 🔍 **快速切換**: 使用熱門站點快速搜尋

---

## 🆘 需要幫助?

### 常見問題
1. **API Key 無效**
   - 確認已啟用所有必要的 API
   - 檢查 API 金鑰限制設定
   - 確認 API Key 已正確貼到 config.js

2. **地圖不顯示**
   - 確認使用本地伺服器執行 (不要直接開啟 HTML)
   - 開啟瀏覽器開發者工具查看錯誤
   - 檢查網路連線

3. **搜尋沒有結果**
   - 增加搜尋半徑
   - 調整價格範圍
   - 取消「只顯示營業中」篩選

### 取得支援
- 📖 查看 [完整文檔](README.md)
- 🐛 [回報問題](https://github.com/yourusername/mrt-food-map/issues)
- 💬 查看 [疑難排解指南](README.md#-疑難排解)

---

## 🎉 完成!

現在您可以開始探索台北捷運周邊的美食了!

祝您使用愉快! 🚇🍽️
