# AI 服務開發指導原則

> **建立日期**: 2025年11月7日  
> **目的**: 根據實際逆向工程診斷經驗,整理出通用的功能性服務開發注意事項,確保 AI 能產出高品質、可維護的程式碼

---

## 📋 目錄

1. [配置管理原則](#1-配置管理原則)
2. [API 整合規範](#2-api-整合規範)
3. [錯誤處理機制](#3-錯誤處理機制)
4. [日誌與診斷](#4-日誌與診斷)
5. [程式碼一致性](#5-程式碼一致性)
6. [測試與驗證](#6-測試與驗證)
7. [AI 開發提示詞範本](#7-ai-開發提示詞範本)

---

## 1. 配置管理原則

### ✅ 要求 AI 必須做到

**命名一致性**
```markdown
要求: 所有配置屬性必須在整個專案中保持一致的命名規範
- 如果使用小駝峰命名 (camelCase),所有地方都要用小駝峰
- 如果使用大駝峰命名 (PascalCase),所有地方都要用大駝峰
- 禁止混用 UPPER_CASE 和 lower_case
```

**集中化配置**
```markdown
要求: 建立單一配置檔案 (config.js) 包含所有設定
必須包含:
- API_KEY: API 金鑰
- API_SETTINGS: API 相關設定 (端點、參數、預設值)
- SEARCH_SETTINGS: 搜尋相關設定
- UI_SETTINGS: 使用者介面設定
- 所有魔術數字 (magic numbers) 都要定義為常數
```

**配置驗證**
```markdown
要求: 在應用程式啟動時驗證所有必要配置
檢查項目:
- API Key 是否已設定
- 必要的物件和屬性是否存在
- 數值範圍是否合理
- 如果缺少配置,必須顯示清楚的錯誤訊息
```

### 🎯 引導 AI 的提示詞範例

```
請建立一個 config.js 檔案,包含以下要求:
1. 使用 camelCase 命名所有屬性 (不要用 UPPER_CASE)
2. 建立以下配置區塊:
   - API_KEY: Google Maps API 金鑰
   - API_SETTINGS: 包含 TAIPEI_CENTER (座標), MAX_RESULTS, SEARCH_RADIUS
   - SCORING_WEIGHTS: 包含 rating, distance, reviews, price (小寫)
3. 在檔案開頭加入配置驗證函式 validateConfig()
4. 如果缺少必要配置,在 console 顯示錯誤訊息
```

---

## 2. API 整合規範

### ✅ 要求 AI 必須做到

**參數正確性**
```markdown
要求: 嚴格遵守第三方 API 文件的參數格式
- 布林參數: 如果預設是 false,不要明確傳遞 false,應該省略該參數
- 可選參數: 只在需要時才加入,不要傳遞空值或預設值
- 參數格式: 確認 API 要求的是 camelCase 還是 snake_case
```

**請求建構**
```markdown
要求: 動態建構 API 請求物件,而非靜態模板
範例:
const request = {
  location: center,
  radius: radius,
  type: 'restaurant'
};
// 只在需要時加入 openNow
if (options.openNow === true) {
  request.openNow = true;
}
```

**錯誤狀態處理**
```markdown
要求: 處理所有可能的 API 回應狀態
必須處理:
- OK: 成功
- ZERO_RESULTS: 無結果
- REQUEST_DENIED: 權限被拒
- OVER_QUERY_LIMIT: 超過配額
- INVALID_REQUEST: 無效請求
- UNKNOWN_ERROR: 未知錯誤
每種狀態都要有對應的處理邏輯
```

### 🎯 引導 AI 的提示詞範例

```
請建立 searchNearbyFood() 函式,要求:
1. 使用 Google Places API 的 nearbySearch
2. 動態建構請求物件:
   - 必要參數: location, radius, type
   - 可選參數: openNow (只在為 true 時加入)
3. 處理所有可能的 status 回應:
   - OK: 回傳結果
   - ZERO_RESULTS: 回傳空陣列並記錄 log
   - REQUEST_DENIED: 顯示權限錯誤並檢查 API Key
   - 其他錯誤: 記錄完整錯誤訊息
4. 加入詳細的 console.log 追蹤每個步驟
```

---

## 3. 錯誤處理機制

### ✅ 要求 AI 必須做到

**多層次錯誤處理**
```markdown
要求: 實作完整的錯誤處理金字塔
第一層: try-catch 包裹所有非同步操作
第二層: 檢查回應狀態和資料完整性
第三層: 提供降級方案 (fallback)
第四層: 使用者友善的錯誤訊息
```

**保證函式完成**
```markdown
要求: 所有非同步函式必須保證完成,不能卡住
實作方式:
- 在 try-catch 的 finally 區塊隱藏載入動畫
- 在 catch 區塊提供降級資料或友善錯誤訊息
- 設定 API 請求逾時時間
- 絕不讓使用者看到無盡的載入狀態
```

**錯誤訊息分級**
```markdown
要求: 根據錯誤嚴重性分級處理
- CRITICAL: 應用程式無法運作 (顯示全頁錯誤訊息)
- ERROR: 功能失敗但應用程式可用 (顯示通知訊息)
- WARNING: 部分功能降級 (在 console 記錄)
- INFO: 正常的替代流程 (靜默處理)
```

### 🎯 引導 AI 的提示詞範例

```
請改進 performSmartSearch() 函式的錯誤處理:
1. 用 try-catch 包裹整個函式
2. 在 try 區塊:
   - 檢查 Google Maps API 是否已載入
   - 驗證輸入參數
   - 執行搜尋並檢查結果
3. 在 catch 區塊:
   - 記錄完整錯誤到 console.error
   - 顯示使用者友善的錯誤訊息
   - 載入 mock 資料作為降級方案
4. 在 finally 區塊:
   - 隱藏載入動畫
   - 確保 UI 回到可用狀態
5. 保證函式在任何情況下都會完成,不會卡住
```

---

## 4. 日誌與診斷

### ✅ 要求 AI 必須做到

**結構化日誌**
```markdown
要求: 使用清晰的日誌格式追蹤程式流程
格式範例:
console.log('🔍 [搜尋] 開始搜尋:', {station, foodType, options});
console.log('✅ [搜尋] 找到結果:', {count: places.length});
console.log('❌ [搜尋] 發生錯誤:', error.message);
console.log('⚠️  [搜尋] 警告:', warning);

使用 emoji 前綴提升可讀性:
- 🔍 搜尋/查詢
- ✅ 成功
- ❌ 錯誤
- ⚠️  警告
- 📊 資料處理
- 🗺️ 地圖操作
- 🌐 API 呼叫
```

**關鍵路徑追蹤**
```markdown
要求: 在所有關鍵步驟加入日誌
必須記錄的時機:
- 函式開始執行 (記錄輸入參數)
- API 請求前 (記錄請求內容)
- API 回應後 (記錄回應狀態和資料筆數)
- 資料處理前後 (記錄處理結果)
- 函式結束前 (記錄最終結果)
- 錯誤發生時 (記錄完整錯誤堆疊)
```

**診斷工具**
```markdown
要求: 提供診斷頁面或函式協助除錯
必須包含:
- 配置驗證: 檢查所有設定是否正確
- API 測試: 測試 API 連線和權限
- 功能測試: 測試核心功能是否正常
- 環境檢查: 檢查瀏覽器和相依套件
```

### 🎯 引導 AI 的提示詞範例

```
請在所有主要函式加入結構化日誌:
1. 使用 emoji 前綴 (🔍 查詢, ✅ 成功, ❌ 錯誤)
2. 在以下時機點加入 console.log:
   - 函式開始: 記錄函式名稱和輸入參數
   - API 請求前: 記錄請求 URL 和參數
   - API 回應後: 記錄 status 和資料筆數
   - 資料過濾後: 記錄過濾前後的筆數
   - 函式結束: 記錄最終結果
3. 錯誤時使用 console.error 並包含完整 stack trace
4. 建立 diagnostic.html 測試頁面,包含:
   - 配置檢查
   - API 連線測試
   - 搜尋功能測試
```

---

## 5. 程式碼一致性

### ✅ 要求 AI 必須做到

**屬性存取一致性**
```markdown
要求: 在整個專案中使用相同的屬性存取模式
如果配置定義為:
CONFIG.SCORING_WEIGHTS.rating

則所有地方都要用:
CONFIG.SCORING_WEIGHTS.rating

不要混用:
- CONFIG.SCORING_WEIGHTS.RATING (大寫)
- scoringWeights.rating (變數名稱不一致)
- config['SCORING_WEIGHTS']['rating'] (存取方式不一致)
```

**函式簽名一致性**
```markdown
要求: 相同功能的函式使用一致的參數順序和命名
範例:
searchNearbyFood(location, radius, options)
searchByStation(station, type, options)

options 物件內容要一致:
{
  openNow: boolean,
  priceLevel: number,
  minRating: number
}
```

**回傳格式一致性**
```markdown
要求: 相同類型的函式回傳一致的資料結構
範例: 所有搜尋函式都回傳
{
  success: boolean,
  data: Array,
  error: string | null,
  metadata: {
    count: number,
    source: string
  }
}
```

### 🎯 引導 AI 的提示詞範例

```
請確保程式碼一致性:
1. 檢查所有使用 CONFIG.SCORING_WEIGHTS 的地方
2. 確認屬性名稱都是小寫 (rating, distance, reviews, price)
3. 所有搜尋函式都回傳相同格式:
   {
     success: boolean,
     data: Array,
     error: string | null,
     metadata: object
   }
4. 檢查 options 參數在不同函式中是否有相同的屬性名稱
5. 列出所有不一致的地方並修正
```

---

## 6. 測試與驗證

### ✅ 要求 AI 必須做到

**單元測試思維**
```markdown
要求: 設計可測試的函式
原則:
- 單一職責: 每個函式只做一件事
- 純函式優先: 避免副作用
- 依賴注入: 將外部依賴作為參數傳入
- 可模擬: API 呼叫要可以被 mock 取代
```

**邊界條件測試**
```markdown
要求: 考慮並處理所有邊界情況
必須測試:
- 空值輸入 (null, undefined, empty string)
- 無效輸入 (負數、超出範圍的值)
- API 失敗情況 (網路錯誤、逾時、權限問題)
- 空結果情況 (API 回傳空陣列)
- 大量資料情況 (超過預期的資料量)
```

**整合測試**
```markdown
要求: 提供端對端測試腳本或頁面
包含:
- 完整流程測試: 從使用者輸入到結果顯示
- API 整合測試: 實際呼叫外部 API
- 錯誤情境模擬: 刻意觸發錯誤檢查處理機制
- 效能測試: 檢查載入時間和回應速度
```

### 🎯 引導 AI 的提示詞範例

```
請建立測試套件:
1. 建立 test-suite.html 包含自動化測試
2. 測試項目:
   - 配置檢查: 驗證 config.js 所有屬性存在
   - 函式檢查: 驗證所有主要函式可呼叫
   - API 測試: 測試 Google Maps API 連線
   - 搜尋測試: 測試真實搜尋流程
   - 錯誤測試: 故意傳入無效參數,檢查錯誤處理
3. 每個測試顯示 PASS/FAIL 狀態
4. 失敗時顯示詳細錯誤訊息
5. 提供匯出測試報告功能
```

---

## 7. AI 開發提示詞範本

### 📝 完整功能開發範本

```markdown
【任務】開發 [功能名稱]

【需求說明】
- 功能描述: [詳細說明功能要做什麼]
- 輸入: [參數說明]
- 輸出: [回傳值說明]
- 使用情境: [何時會被呼叫]

【技術要求】
1. 配置管理:
   - 所有可調整參數都要定義在 config.js
   - 使用 camelCase 命名 (不要用 UPPER_CASE)
   - 在函式開頭驗證必要配置

2. API 整合 (如適用):
   - 遵守 [API 名稱] 官方文件的參數格式
   - 動態建構請求物件,不要寫死參數
   - 只在需要時加入可選參數
   - 處理所有可能的 status 回應

3. 錯誤處理:
   - 用 try-catch 包裹所有非同步操作
   - catch 區塊要有降級方案 (fallback)
   - finally 區塊確保 UI 回到可用狀態
   - 保證函式一定會完成,不會卡住

4. 日誌追蹤:
   - 在以下時機加入 console.log:
     * 函式開始 (記錄輸入)
     * API 請求前 (記錄請求內容)
     * API 回應後 (記錄狀態和資料)
     * 函式結束 (記錄結果)
   - 使用 emoji 前綴 (🔍 查詢, ✅ 成功, ❌ 錯誤)
   - 錯誤時用 console.error 記錄完整堆疊

5. 程式碼品質:
   - 屬性命名要與現有程式碼一致
   - 函式回傳格式要統一
   - 加入 JSDoc 註解說明參數和回傳值
   - 遵循專案現有的編碼風格

6. 測試考量:
   - 處理空值輸入 (null, undefined, '')
   - 處理無效輸入 (負數、超出範圍)
   - 處理 API 失敗情況
   - 處理空結果情況

【範例程式碼結構】
請參考以下結構開發:

```javascript
/**
 * [函式說明]
 * @param {type} param1 - 參數說明
 * @param {type} param2 - 參數說明
 * @returns {Object} {success, data, error, metadata}
 */
async function functionName(param1, param2) {
    console.log('🔍 [功能名稱] 開始執行:', {param1, param2});
    
    try {
        // 1. 驗證輸入
        if (!param1) {
            throw new Error('缺少必要參數 param1');
        }
        
        // 2. 檢查配置
        if (!CONFIG.REQUIRED_SETTING) {
            console.error('❌ 缺少必要配置: REQUIRED_SETTING');
            return {success: false, error: '配置錯誤', data: []};
        }
        
        // 3. 執行主要邏輯
        console.log('📊 [功能名稱] 處理資料...');
        const result = await processData(param1, param2);
        
        // 4. 驗證結果
        if (!result || result.length === 0) {
            console.log('⚠️  [功能名稱] 無結果');
            return {success: true, data: [], metadata: {count: 0}};
        }
        
        // 5. 回傳成功
        console.log('✅ [功能名稱] 完成:', {count: result.length});
        return {
            success: true,
            data: result,
            error: null,
            metadata: {count: result.length}
        };
        
    } catch (error) {
        console.error('❌ [功能名稱] 錯誤:', error);
        
        // 降級方案
        return {
            success: false,
            data: [],
            error: error.message,
            metadata: {fallback: true}
        };
        
    } finally {
        // 確保 UI 狀態
        console.log('🏁 [功能名稱] 結束');
    }
}
```

【驗收標準】
完成後請提供:
1. 完整的函式程式碼 (含註解)
2. 在 config.js 需要新增的配置
3. 簡單的使用範例
4. 可能的錯誤情況和處理方式
5. 測試方法 (如何驗證功能正常)
```

### 📝 快速除錯範本

```markdown
【問題】[描述問題,例如: 搜尋功能一直卡在載入中]

【除錯要求】
請用逆向工程方式診斷問題:

1. 檢查配置:
   - 驗證 config.js 所有必要屬性是否存在
   - 檢查屬性命名是否一致 (大小寫)
   - 確認沒有 undefined 或 null 值

2. 檢查函式呼叫鏈:
   - 追蹤從 UI 觸發到實際執行的完整流程
   - 檢查每個函式的輸入輸出
   - 找出在哪一步中斷

3. 檢查 API 整合:
   - 驗證 API Key 是否正確設定
   - 檢查 API 請求參數格式
   - 確認錯誤狀態有被處理

4. 檢查錯誤處理:
   - 確認有 try-catch 包裹
   - 檢查是否有無限等待的情況
   - 驗證 finally 區塊有清理 UI

5. 加入診斷日誌:
   - 在可疑的地方加入 console.log
   - 記錄每個步驟的狀態和資料
   - 找出確切失敗的位置

6. 提供修正方案:
   - 列出所有發現的問題
   - 提供修正後的程式碼
   - 說明為什麼會發生問題
   - 建議預防措施

【期望輸出】
1. 問題診斷報告 (markdown 格式)
2. 修正後的程式碼
3. 測試方法
4. 預防類似問題的建議
```

### 📝 程式碼審查範本

```markdown
【任務】審查 [檔案名稱] 的程式碼品質

【審查項目】
請檢查以下方面:

1. 配置管理 ⚙️
   - [ ] 所有魔術數字都定義為常數
   - [ ] 屬性命名一致 (camelCase 或 UPPER_CASE)
   - [ ] 配置集中在 config.js

2. API 整合 🌐
   - [ ] 參數格式符合官方文件
   - [ ] 動態建構請求物件
   - [ ] 處理所有回應狀態
   - [ ] 有錯誤重試機制

3. 錯誤處理 🛡️
   - [ ] 所有非同步函式有 try-catch
   - [ ] 有降級方案 (fallback)
   - [ ] finally 確保 UI 清理
   - [ ] 錯誤訊息對使用者友善

4. 日誌追蹤 📝
   - [ ] 關鍵步驟有 console.log
   - [ ] 使用結構化日誌格式
   - [ ] 錯誤有完整堆疊資訊
   - [ ] 使用 emoji 提升可讀性

5. 程式碼品質 ✨
   - [ ] 函式單一職責
   - [ ] 變數命名清楚
   - [ ] 有 JSDoc 註解
   - [ ] 無重複程式碼

6. 測試考量 🧪
   - [ ] 處理邊界條件
   - [ ] 處理空值輸入
   - [ ] 處理 API 失敗
   - [ ] 可以被測試

【輸出格式】
針對每個項目:
- ✅ 通過: [說明做得好的地方]
- ⚠️  警告: [需要改進的地方]
- ❌ 失敗: [必須修正的問題]

最後提供:
- 整體評分 (1-10)
- 重大問題清單
- 改進建議
- 修正後的程式碼 (如果有問題)
```

---

## 📊 檢查清單

在請求 AI 開發功能前,先填寫此檢查清單:

### 需求確認
- [ ] 功能需求已清楚定義
- [ ] 輸入輸出格式已確定
- [ ] 使用情境已說明
- [ ] 邊界條件已考慮

### 技術規格
- [ ] API 文件已提供 (如適用)
- [ ] 配置需求已說明
- [ ] 錯誤處理要求已定義
- [ ] 日誌格式已指定

### 品質要求
- [ ] 命名規範已確認
- [ ] 程式碼風格已指定
- [ ] 測試要求已說明
- [ ] 文件要求已定義

### 驗收標準
- [ ] 成功標準已定義
- [ ] 測試方法已規劃
- [ ] 錯誤情境已列出
- [ ] 效能要求已說明

---

## 🎓 實戰案例: Google Places API 整合

### 問題情境
網站搜尋功能一直卡在載入中,無法顯示結果

### 逆向工程診斷流程

**步驟 1: 檢查配置**
```javascript
// 發現問題: SCORING_WEIGHTS 使用大寫屬性
CONFIG.SCORING_WEIGHTS = {
    RATING: 0.4,      // ❌ 錯誤: 應該用小寫
    DISTANCE: 0.3,    // ❌ 錯誤: 應該用小寫
    REVIEWS: 0.2,     // ❌ 錯誤: 應該用小寫
    PRICE: 0.1        // ❌ 錯誤: 應該用小寫
};

// 但程式碼使用小寫存取
const score = 
    place.rating * CONFIG.SCORING_WEIGHTS.rating +  // undefined!
    distance * CONFIG.SCORING_WEIGHTS.distance;     // undefined!
```

**步驟 2: 檢查 API 請求**
```javascript
// 發現問題: openNow 參數錯誤
const request = {
    location: center,
    radius: 1000,
    type: 'restaurant',
    openNow: false  // ❌ 錯誤: Google API 不接受 false,應該省略
};

// 正確做法
const request = {
    location: center,
    radius: 1000,
    type: 'restaurant'
};
if (needOpenNow) {
    request.openNow = true;  // ✅ 只在需要時加入
}
```

**步驟 3: 檢查錯誤處理**
```javascript
// 發現問題: 沒有處理錯誤狀態
placesService.nearbySearch(request, (results, status) => {
    if (status === 'OK') {
        displayResults(results);
    }
    // ❌ 問題: 其他狀態沒有處理,UI 一直卡住
});

// 正確做法
placesService.nearbySearch(request, (results, status) => {
    console.log('📊 Places API 回應:', status);
    
    if (status === 'OK') {
        displayResults(results);
    } else if (status === 'ZERO_RESULTS') {
        console.log('⚠️  無搜尋結果');
        displayResults([]);
    } else {
        console.error('❌ API 錯誤:', status);
        showError(`搜尋失敗: ${status}`);
        loadMockData();  // 降級方案
    }
    hideLoading();  // ✅ 確保一定會隱藏載入動畫
});
```

**步驟 4: 加入診斷日誌**
```javascript
async function performSmartSearch(station, foodType, options) {
    console.log('🔍 [搜尋] 開始:', {station, foodType, options});
    
    try {
        // 1. 地理編碼
        console.log('📍 [搜尋] 取得座標...');
        const location = await geocodeStation(station);
        console.log('✅ [搜尋] 座標:', location);
        
        // 2. Places API
        console.log('🌐 [搜尋] 呼叫 Places API...');
        const places = await searchNearby(location, foodType, options);
        console.log('📊 [搜尋] 取得結果:', places.length);
        
        // 3. 過濾排序
        console.log('🔧 [搜尋] 處理結果...');
        const filtered = filterAndSort(places);
        console.log('✅ [搜尋] 完成:', filtered.length);
        
        return filtered;
        
    } catch (error) {
        console.error('❌ [搜尋] 錯誤:', error);
        return getMockData();  // 降級方案
        
    } finally {
        console.log('🏁 [搜尋] 結束');
        hideLoading();
    }
}
```

### 修正後的完整範例

```javascript
// ===== config.js =====
const CONFIG = {
    API_KEY: 'your-api-key-here',
    
    API_SETTINGS: {
        TAIPEI_CENTER: { lat: 25.0330, lng: 121.5654 },
        MAX_RESULTS: 20,
        SEARCH_RADIUS: 1000
    },
    
    SCORING_WEIGHTS: {
        rating: 0.4,      // ✅ 使用小寫
        distance: 0.3,    // ✅ 使用小寫
        reviews: 0.2,     // ✅ 使用小寫
        price: 0.1        // ✅ 使用小寫
    }
};

// 配置驗證
function validateConfig() {
    const required = [
        'API_KEY',
        'API_SETTINGS.TAIPEI_CENTER',
        'SCORING_WEIGHTS.rating'
    ];
    
    for (const key of required) {
        const value = key.split('.').reduce((obj, k) => obj?.[k], CONFIG);
        if (value === undefined) {
            console.error(`❌ 缺少必要配置: ${key}`);
            return false;
        }
    }
    return true;
}

// ===== app.js =====
async function searchNearbyFood(location, foodType, options = {}) {
    console.log('🔍 [搜尋] 搜尋附近美食:', {location, foodType, options});
    
    return new Promise((resolve, reject) => {
        // 動態建構請求
        const request = {
            location: location,
            radius: CONFIG.API_SETTINGS.SEARCH_RADIUS,
            type: 'restaurant'
        };
        
        // 只在需要時加入 openNow
        if (options.openNow === true) {
            request.openNow = true;
        }
        
        console.log('🌐 [搜尋] Places API 請求:', request);
        
        const service = new google.maps.places.PlacesService(
            document.createElement('div')
        );
        
        service.nearbySearch(request, (results, status) => {
            console.log('📊 [搜尋] Places API 回應:', {status, count: results?.length});
            
            // 處理所有狀態
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('✅ [搜尋] 成功取得結果');
                resolve(results);
                
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log('⚠️  [搜尋] 無搜尋結果');
                resolve([]);
                
            } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                console.error('❌ [搜尋] 請求被拒: 請檢查 API Key');
                reject(new Error('API 權限錯誤'));
                
            } else {
                console.error('❌ [搜尋] API 錯誤:', status);
                reject(new Error(`搜尋失敗: ${status}`));
            }
        });
    });
}

async function performSmartSearch(station, foodType, options = {}) {
    console.log('🔍 [智慧搜尋] 開始:', {station, foodType, options});
    
    try {
        // 1. 驗證配置
        if (!validateConfig()) {
            throw new Error('配置驗證失敗');
        }
        
        // 2. 檢查 API
        if (!window.google?.maps) {
            throw new Error('Google Maps API 未載入');
        }
        
        // 3. 地理編碼
        console.log('📍 [智慧搜尋] 取得車站座標...');
        const location = await geocodeStation(station);
        console.log('✅ [智慧搜尋] 座標:', location);
        
        // 4. 搜尋
        const places = await searchNearbyFood(location, foodType, options);
        console.log('📊 [智慧搜尋] 找到:', places.length);
        
        // 5. 過濾排序
        const filtered = filterAndRank(places);
        console.log('✅ [智慧搜尋] 完成:', filtered.length);
        
        return {
            success: true,
            data: filtered,
            error: null,
            metadata: {
                station: station,
                count: filtered.length
            }
        };
        
    } catch (error) {
        console.error('❌ [智慧搜尋] 錯誤:', error);
        
        // 降級方案: 使用 mock 資料
        console.log('🔄 [智慧搜尋] 使用模擬資料');
        return {
            success: false,
            data: getMockData(),
            error: error.message,
            metadata: {
                fallback: true
            }
        };
        
    } finally {
        // 確保 UI 清理
        hideLoadingIndicator();
        console.log('🏁 [智慧搜尋] 結束');
    }
}

function filterAndRank(places) {
    console.log('🔧 [排序] 開始過濾排序:', places.length);
    
    const scored = places.map(place => {
        const score = 
            (place.rating || 0) * CONFIG.SCORING_WEIGHTS.rating +
            (place.user_ratings_total || 0) / 1000 * CONFIG.SCORING_WEIGHTS.reviews;
        
        return {...place, smartScore: score};
    });
    
    const sorted = scored.sort((a, b) => b.smartScore - a.smartScore);
    console.log('✅ [排序] 完成排序');
    
    return sorted;
}
```

---

## 🔧 故障排除指南

### 常見問題 1: 屬性存取 undefined

**症狀**: `Cannot read property 'xxx' of undefined`

**診斷步驟**:
```javascript
// 1. 檢查配置是否存在
console.log('CONFIG:', CONFIG);
console.log('CONFIG.SCORING_WEIGHTS:', CONFIG.SCORING_WEIGHTS);
console.log('CONFIG.SCORING_WEIGHTS.rating:', CONFIG.SCORING_WEIGHTS.rating);

// 2. 檢查大小寫
console.log('RATING (大寫):', CONFIG.SCORING_WEIGHTS.RATING);
console.log('rating (小寫):', CONFIG.SCORING_WEIGHTS.rating);

// 3. 使用安全存取
const weight = CONFIG?.SCORING_WEIGHTS?.rating ?? 0.4;
```

### 常見問題 2: API 請求卡住

**症狀**: 載入動畫一直轉,沒有結果也沒有錯誤

**診斷步驟**:
```javascript
// 1. 加入日誌追蹤
service.nearbySearch(request, (results, status) => {
    console.log('API 回應 status:', status);
    console.log('API 回應 results:', results);
    
    // 2. 檢查所有分支
    if (status === 'OK') {
        console.log('✅ 成功');
    } else {
        console.log('❌ 失敗:', status);
        // 確保這裡有處理!
    }
});

// 3. 加入逾時保護
const timeout = setTimeout(() => {
    console.error('⏱️ API 請求逾時');
    hideLoading();
}, 10000);
```

### 常見問題 3: 錯誤未被捕捉

**症狀**: 程式中斷執行,console 出現 Uncaught Error

**診斷步驟**:
```javascript
// 1. 確認有 try-catch
try {
    await riskyOperation();
} catch (error) {
    console.error('捕捉到錯誤:', error);
}

// 2. 檢查 Promise 有 catch
apiCall()
    .then(result => process(result))
    .catch(error => console.error('Promise 錯誤:', error));

// 3. 全域錯誤處理
window.addEventListener('unhandledrejection', event => {
    console.error('未處理的 Promise 錯誤:', event.reason);
});
```

---

## 📚 延伸閱讀

- [Google Maps Platform 最佳實踐](https://developers.google.com/maps/documentation/javascript/best-practices)
- [JavaScript 錯誤處理指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [API 整合最佳實踐](https://restfulapi.net/)
- [程式碼品質檢查清單](https://github.com/ryanmcdermott/clean-code-javascript)

---

## ✅ 使用本指南的效益

1. **減少返工**: 一次就做對,避免反覆修改
2. **提升品質**: 程式碼更穩定、更易維護
3. **加速除錯**: 完整日誌讓問題一目了然
4. **促進協作**: 清楚的規範讓團隊溝通更順暢
5. **知識傳承**: 新人可以快速理解專案規範

---

**版本**: 1.0  
**最後更新**: 2025年11月7日  
**維護者**: [您的名稱/團隊]  
**授權**: MIT License
