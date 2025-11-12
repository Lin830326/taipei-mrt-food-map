# 🔍 逆向工程診斷報告

## 問題分析

您報告的問題:**網站功能一直處於搜尋中**

## 已修正的問題

### 1. ✅ Config.js 屬性不一致
**問題**: `SCORING_WEIGHTS` 使用大寫屬性名 (RATING, DISTANCE),但 app.js 使用小寫
**修正**: 已將 config.js 改為小寫 (rating, distance, reviews, price)

### 2. ✅ API_SETTINGS.TAIPEI_CENTER 未定義
**問題**: app.js 引用 `CONFIG.API_SETTINGS.TAIPEI_CENTER` 但該屬性不存在
**修正**: 已在 config.js 中添加 API_SETTINGS 物件

### 3. ✅ Places API 請求參數錯誤
**問題**: `openNow: false` 會導致 API 錯誤,應該完全省略該屬性
**修正**: 只在 `openNow === true` 時才加入該屬性到請求中

### 4. ✅ 缺少詳細的錯誤日誌
**問題**: 無法診斷 API 呼叫失敗的原因
**修正**: 添加了完整的 console.log 追蹤每個步驟

### 5. ✅ 錯誤處理不完善
**問題**: 某些錯誤會卡住不繼續
**修正**: 改進 try-catch 邏輯,任何錯誤都會切換到模擬資料

## 診斷工具

已創建 `diagnostic.html` - 完整的自動化診斷工具

### 使用方法:

1. **啟動本地伺服器**:
   ```bash
   python -m http.server 8000
   ```

2. **開啟診斷頁面**:
   ```
   http://localhost:8000/diagnostic.html
   ```

3. **執行測試**:
   - 點擊「開始診斷」按鈕
   - 查看各項測試結果
   - 點擊「測試真實搜尋」驗證 API

## 可能的問題根源

### A. API Key 問題
- ✅ API Key 已設定: `AIzaSyCAIfX-FY50WPtoT5IxxpDllQIWv2-qEzc`
- ⚠️ 需要驗證:
  1. API Key 是否已啟用所需的 API
  2. API Key 是否有使用限制
  3. 是否超過配額

### B. Google Maps API 載入問題
**可能原因**:
1. API 腳本載入超時
2. callback 函數未正確執行
3. 網路連線問題

**診斷方法**:
- 開啟瀏覽器開發者工具 (F12)
- 查看 Console 標籤的錯誤訊息
- 查看 Network 標籤的 API 請求

### C. Places API 回應問題
**可能原因**:
1. `ZERO_RESULTS` - 該區域沒有符合條件的結果
2. `OVER_QUERY_LIMIT` - 超過 API 配額
3. `REQUEST_DENIED` - API Key 權限不足
4. `INVALID_REQUEST` - 請求參數錯誤

**已修正**:
- 添加了 ZERO_RESULTS 的處理
- 改進了請求參數格式
- 添加了詳細的狀態日誌

## 測試步驟

### 步驟 1: 基本測試
1. 開啟主頁面: `http://localhost:8000/index.html`
2. 開啟開發者工具 (F12)
3. 選擇一個捷運站 (例如: 台北車站)
4. 觀察 Console 輸出

### 步驟 2: 查看日誌
搜尋應該顯示以下日誌:
```
🔍 開始智能搜尋: 台北車站
📊 搜尋參數: {...}
✅ Google Maps API 已載入
🔧 解析後參數: {...}
🗺️ Geocoding 結果: OK [...]
📍 站點座標: 25.xxx, 121.xxx
🔍 搜尋請求: {...}
📊 Places API 回應: OK [...]
✅ 找到 X 個結果
🔽 篩選後剩餘 X 個結果
📋 最終返回 X 個結果
✅ 搜尋完成,結果數量: X
🏁 搜尋流程結束
```

### 步驟 3: 常見錯誤訊息

#### ❌ "Google Maps API 未載入"
**解決方法**:
1. 確認 config.js 已正確載入
2. 檢查 API Key 是否有效
3. 查看 Network 標籤是否有 403/400 錯誤

#### ❌ "無法找到站點位置"
**解決方法**:
1. Geocoding API 可能未啟用
2. API Key 權限不足
3. 站點名稱格式問題

#### ❌ "Places API 錯誤: OVER_QUERY_LIMIT"
**解決方法**:
1. 已超過免費配額
2. 需要啟用計費帳戶
3. 或等待配額重置

#### ❌ "Places API 錯誤: REQUEST_DENIED"
**解決方法**:
1. API Key 未啟用 Places API
2. API Key 有 HTTP 參照位址限制
3. 需要在 Google Cloud Console 設定

## 建議的修正流程

### 立即執行:

1. **開啟診斷頁面**:
   ```
   http://localhost:8000/diagnostic.html
   ```
   點擊「開始診斷」查看所有測試結果

2. **測試真實搜尋**:
   點擊「測試真實搜尋」按鈕,查看完整的搜尋流程

3. **檢查 API 配額**:
   前往 [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → Dashboard
   - 查看今日使用量

### 如果仍然失敗:

1. **開啟主頁面並開啟 F12**:
   ```
   http://localhost:8000/index.html
   ```

2. **選擇站點並搜尋**:
   - 選擇「台北車站」
   - 觀察 Console 的錯誤訊息

3. **截圖以下資訊**:
   - Console 的所有錯誤訊息
   - Network 標籤中的 API 請求 (特別是紅色的)
   - 診斷頁面的測試結果

4. **檢查 API Key 設定**:
   前往 Google Cloud Console:
   - APIs & Services → Credentials
   - 點擊您的 API Key
   - 檢查「API restrictions」
   - 確認已啟用:
     - Maps JavaScript API ✓
     - Places API ✓
     - Geocoding API ✓

## 程式碼改進摘要

### config.js
```javascript
// 修正前
SCORING_WEIGHTS: {
    RATING: 0.4,
    DISTANCE: 0.3,
    REVIEWS: 0.2,
    PRICE: 0.1
}

// 修正後
SCORING_WEIGHTS: {
    rating: 0.4,
    distance: 0.3,
    reviews: 0.2,
    price: 0.1
}

// 新增
API_SETTINGS: {
    TAIPEI_CENTER: { lat: 25.0330, lng: 121.5654 },
    // ...
}
```

### app.js - searchNearbyFood()
```javascript
// 修正前
const request = {
    location: location,
    radius: options.radius || 800,
    type: options.type || 'restaurant',
    openNow: options.openNow || false  // ❌ 錯誤!
};

// 修正後
const request = {
    location: location,
    radius: options.radius || 800
};

if (options.type && options.type !== '') {
    request.type = options.type;
} else {
    request.type = 'restaurant';
}

// 只在需要時加入
if (options.openNow === true) {
    request.openNow = true;  // ✅ 正確!
}
```

### 新增詳細日誌
```javascript
console.log('🗺️ Geocoding 結果:', status, results);
console.log('📍 站點座標:', location.lat(), location.lng());
console.log('🔍 搜尋請求:', request);
console.log('📊 Places API 回應:', status, results);
console.log('✅ 找到 X 個結果');
```

## 預期結果

修正後,您應該能看到:

1. ✅ 選擇站點後自動開始搜尋
2. ✅ Console 顯示詳細的搜尋流程
3. ✅ 1-3 秒內完成搜尋
4. ✅ 顯示餐廳列表
5. ✅ 地圖上顯示標記

## 下一步

1. 先執行診斷工具: `diagnostic.html`
2. 再測試主頁面: `index.html`
3. 如果仍有問題,請提供 Console 的錯誤訊息

---

**診斷工具位置**: `d:\聯成電腦\MRT_projet\diagnostic.html`
**主程式位置**: `d:\聯成電腦\MRT_projet\index.html`
**修正日期**: 2025年1月7日
