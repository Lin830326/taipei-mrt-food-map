# 🚀 快速入門指南 - 台北捷運智能美食地圖

## 📦 您現在擁有的檔案

```
MRT_projet/
├── index.html              # 原始基礎版本
├── index_smart.html        # 智能版本（需要 API Key）
├── index_fixed.html        # ✨ 修復版本（推薦使用）
├── diagnostic-test.html    # 診斷測試工具
├── DIAGNOSTIC_REPORT.md    # 完整診斷報告
├── QUICKSTART.md          # 本文件
├── js/
│   ├── food-search-engine.js  # 智能搜尋引擎
│   └── config.js              # 配置檔案
└── README.md              # 專案說明

```

---

## ⚡ 5分鐘快速開始

### 方法 1：立即體驗（推薦）✨

**適合：** 想立即看到效果、還沒有 API Key

1. **開啟修復版本**
   ```
   雙擊打開: index_fixed.html
   ```

2. **開始使用**
   - 點擊左側任意捷運站
   - 查看地圖更新
   - 自動顯示模擬美食推薦
   - 試試不同的篩選條件

3. **完成！** 🎉
   - 所有功能都可以使用
   - 使用模擬資料展示
   - 無需任何設定

---

### 方法 2：系統診斷（開發者）

**適合：** 想了解系統狀態、排查問題

1. **執行診斷工具**
   ```
   雙擊打開: diagnostic-test.html
   ```

2. **查看測試結果**
   - 自動執行 10 項測試
   - 即時顯示結果
   - 獲取修復建議

3. **閱讀完整報告**
   ```
   查看: DIAGNOSTIC_REPORT.md
   ```

---

### 方法 3：啟用真實 API（進階）

**適合：** 需要真實美食資料

#### 步驟 1：取得 API Key

1. **前往 Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **創建專案**
   - 點擊「選取專案」
   - 點擊「新增專案」
   - 輸入專案名稱：「MRT Food Map」
   - 點擊「建立」

3. **啟用 API**
   - 搜尋「Places API」並啟用
   - 搜尋「Geocoding API」並啟用
   - 搜尋「Maps JavaScript API」並啟用

4. **創建 API Key**
   - 左側選單 → 「憑證」
   - 點擊「建立憑證」→「API 金鑰」
   - 複製生成的 API Key
   - ⚠️ **重要：** 設定 API 金鑰限制！

5. **設定限制（推薦）**
   - 點擊剛創建的 API Key
   - 應用程式限制 → 選擇「HTTP 參照網址」
   - 添加您的網域（例如：`localhost:*` 或 `yourdomain.com/*`）
   - API 限制 → 選擇「限制金鑰」
   - 選取啟用的 3 個 API
   - 儲存

#### 步驟 2：設定 API Key

1. **編輯檔案**
   ```
   使用文字編輯器開啟: index_fixed.html
   ```

2. **找到這一行（約第 11 行）**
   ```html
   <!-- 目前使用模擬資料模式，若要啟用真實 API，請取消註解並設定 API Key -->
   <!--
   <script async defer 
           src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&language=zh-TW&callback=initGoogleMaps">
   </script>
   -->
   ```

3. **替換並啟用**
   ```html
   <!-- 取消註解並替換 YOUR_API_KEY -->
   <script async defer 
           src="https://maps.googleapis.com/maps/api/js?key=AIzaSy...您的實際Key&libraries=places&language=zh-TW&callback=initGoogleMaps">
   </script>
   ```

4. **更新模式標記**
   找到這一行（約第 900 行）：
   ```javascript
   let useMockDataMode = true; // 預設使用模擬資料
   ```
   
   改為：
   ```javascript
   let useMockDataMode = false; // 使用真實 API
   ```

5. **儲存並測試**
   - 重新開啟 index_fixed.html
   - 選擇捷運站
   - 應該會看到真實的美食資料！

---

## 🎯 功能說明

### 基礎功能

#### 1. 選擇捷運站
- 點擊左側路線標題展開站點列表
- 點擊任意站點
- 地圖自動更新到該站點
- 自動搜尋附近美食

#### 2. 調整搜尋條件
- **搜尋半徑：** 500m / 800m / 1200m
- **價格範圍：** 拖動滑桿選擇
- **排序方式：** 智能推薦 / 評分優先 / 距離優先
- **營業狀態：** 勾選「只顯示營業中」

#### 3. 篩選美食類型
- 點擊頂部的篩選按鈕
- 全部美食 / 餐廳 / 咖啡廳 / 烘焙店 / 外帶美食

#### 4. 查看美食資訊
- 點擊任意美食卡片
- 顯示詳細資訊（需要 API）
- 包含評分、距離、價格、地址等

### 進階功能

#### 智能評分系統
- 綜合考慮評分、距離、評論數、價格
- 自動計算每家店的智能分數
- 優先推薦高分店家

#### 搜尋歷史
- 自動記錄最近搜尋的站點
- 顯示在「熱門搜尋站點」區域
- 快速返回之前搜尋的站點

#### 用戶偏好
- 自動記憶您的搜尋設定
- 下次開啟時自動套用
- 包含半徑、價格、排序方式

---

## 🔧 常見問題排除

### 問題 1：地圖顯示空白
**原因：** 網路連接問題或 Google Maps 載入失敗  
**解決：**
1. 檢查網路連接
2. 重新整理頁面 (F5)
3. 清除瀏覽器快取

### 問題 2：沒有美食資料
**原因：** API Key 未設定或配額用盡  
**解決：**
1. 檢查是否已設定 API Key
2. 查看瀏覽器控制台 (F12) 的錯誤訊息
3. 確認 Google Cloud 專案的配額

### 問題 3：搜尋很慢
**原因：** API 請求延遲或網路速度  
**解決：**
1. 等待載入完成
2. 減少搜尋半徑
3. 使用快取的結果

### 問題 4：手機上顯示異常
**原因：** 瀏覽器相容性問題  
**解決：**
1. 使用現代瀏覽器 (Chrome, Safari, Edge)
2. 更新瀏覽器到最新版本
3. 清除瀏覽器快取和 Cookie

---

## 📱 使用建議

### 最佳實踐

1. **首次使用**
   - 從熱門站點開始（台北車站、西門、信義安和）
   - 試試不同的搜尋條件
   - 熟悉各項功能

2. **日常使用**
   - 根據目的地選擇捷運站
   - 使用智能推薦模式
   - 查看店家評分和距離

3. **進階使用**
   - 調整價格範圍找到適合的店家
   - 使用距離優先快速找到最近的店
   - 只看營業中的店避免撲空

### 性能優化

1. **快速搜尋**
   - 使用快取的結果（30分鐘內）
   - 避免頻繁切換站點
   - 選擇較小的搜尋半徑

2. **節省流量**
   - 使用 WiFi 連接
   - 利用搜尋歷史
   - 減少重複搜尋

---

## 🚦 開發模式說明

### 模擬資料模式（預設）
```javascript
let useMockDataMode = true;
```
- ✅ 無需 API Key
- ✅ 立即可用
- ✅ 展示所有功能
- ⚠️ 使用虛構資料
- ⚠️ 無真實店家資訊

### 真實 API 模式
```javascript
let useMockDataMode = false;
```
- ✅ 真實美食資料
- ✅ 即時更新
- ✅ 完整店家資訊
- ⚠️ 需要 API Key
- ⚠️ 有使用配額限制

---

## 📊 系統需求

### 瀏覽器支援
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 不支援

### 裝置需求
- **桌面：** 1280x720 以上解析度
- **平板：** 768x1024 以上
- **手機：** 375x667 以上
- **網路：** 建議 4G 或 WiFi

### 效能要求
- **RAM：** 2GB 以上
- **處理器：** 雙核心以上
- **JavaScript：** 必須啟用
- **LocalStorage：** 建議啟用

---

## 🎓 學習資源

### 教學文件
- `README.md` - 專案說明
- `DIAGNOSTIC_REPORT.md` - 診斷報告
- 程式碼內註釋 - 詳細說明

### 外部資源
- [Google Places API 文件](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Web 響應式設計](https://web.dev/responsive-web-design-basics/)

---

## 💬 獲取幫助

### 診斷工具
```bash
# 執行完整診斷
開啟: diagnostic-test.html

# 查看診斷報告
閱讀: DIAGNOSTIC_REPORT.md
```

### 查看日誌
```javascript
// 在瀏覽器中按 F12 開啟開發者工具
// 切換到 Console 標籤
// 查看系統日誌和錯誤訊息
```

### 問題回報
1. 開啟診斷測試工具
2. 執行完整測試
3. 下載診斷報告
4. 截圖錯誤訊息
5. 查看瀏覽器控制台日誌

---

## ✅ 下一步

### 立即行動
1. ✅ 開啟 `index_fixed.html`
2. ✅ 選擇捷運站試用
3. ✅ 體驗各項功能

### 可選行動
1. ⭐ 設定 Google Places API Key
2. ⭐ 執行診斷測試工具
3. ⭐ 閱讀完整診斷報告
4. ⭐ 根據需求調整設定

---

## 🎉 總結

恭喜！您現在已經：
- ✅ 了解了系統的三個版本
- ✅ 知道如何立即開始使用
- ✅ 掌握了基礎和進階功能
- ✅ 學會了如何設定 API Key
- ✅ 熟悉了常見問題的解決方法

**立即開始體驗台北捷運智能美食地圖！** 🍽️🚇

---

**文件版本：** 1.0  
**最後更新：** 2025-11-07  
**維護者：** AI Assistant
