# 🔧 除錯指南

## 已修復的問題

### ✅ 1. 搜尋按鈕功能
- **問題**: 搜尋按鈕沒反應
- **原因**: `showLoading()` 函數已經存在，應該正常運作
- **測試步驟**:
  1. 開啟瀏覽器開發者工具（F12）
  2. 切換到 Console 標籤
  3. 選擇一個捷運站（例如：台北車站）
  4. 點擊「智能搜尋」按鈕
  5. 檢查 Console 是否有錯誤訊息

### ✅ 2. 價格滑軌初始顯示
- **問題**: 價格滑軌顯示為「高價」但預設值應為「平價」
- **原因**: 初始化時沒有同步顯示文字
- **已修復**: 現在會在頁面載入時正確顯示當前滑軌值

### ⚠️ 3. 價格滑軌無法拉到最底部
- **可能原因**: 這可能是瀏覽器渲染或CSS樣式問題
- **檢查項目**:
  - 滑軌 HTML: `<input type="range" min="1" max="4" value="2">`
  - 確認 min="1" 和 max="4" 設定正確

## 測試清單

### 搜尋功能測試
```
☐ 1. 重新整理頁面
☐ 2. 等待載入畫面消失
☐ 3. 開啟瀏覽器 Console（F12）
☐ 4. 點擊「台北車站」
☐ 5. 點擊「智能搜尋」按鈕
☐ 6. 觀察是否有以下訊息：
   - 🔍 開始智能搜尋: 台北車站
   - 📊 搜尋參數: {...}
   - ✅ 找到 X 個結果
```

### 價格滑軌測試
```
☐ 1. 重新整理頁面
☐ 2. 檢查「價格範圍」下方顯示是否為「平價 $$ (約100-600元)」
☐ 3. 將滑軌拉到最左邊（實惠）
☐ 4. 確認顯示變為「實惠 $ (約100-300元)」
☐ 5. 將滑軌拉到最右邊（高價）
☐ 6. 確認顯示變為「高價 $$$$ (約600元以上)」
```

## 如果搜尋按鈕仍無反應

### 檢查步驟：

1. **確認 API Key 已載入**
   - 開啟 Console
   - 輸入: `typeof google`
   - 應該顯示: `"object"`（而不是 `"undefined"`）

2. **確認函數存在**
   - 在 Console 輸入: `typeof performSmartSearch`
   - 應該顯示: `"function"`

3. **手動觸發搜尋**
   - 在 Console 輸入: `selectStation('台北車站')`
   - 然後輸入: `performSmartSearch()`
   - 觀察是否有錯誤訊息

4. **檢查事件綁定**
   - 在 Console 輸入: 
     ```javascript
     document.getElementById('searchBtn').onclick
     ```
   - 應該顯示函數內容

## 常見錯誤訊息

### "Google Maps API 未載入"
**解決方式**: 
- 檢查網路連線
- 確認 API Key 有效
- 重新整理頁面

### "請先選擇一個捷運站"
**解決方式**: 
- 點擊左側任一捷運站
- 確認上方顯示站名

### "API_NOT_AVAILABLE"
**解決方式**: 
- 系統會自動切換到模擬資料模式
- 仍可測試功能，但不會顯示真實地圖

## 手動測試腳本

在瀏覽器 Console 中執行以下腳本來完整測試：

```javascript
// 測試腳本
console.log('=== 開始測試 ===');

// 1. 檢查 Google Maps API
console.log('Google Maps API:', typeof google !== 'undefined' ? '✅ 已載入' : '❌ 未載入');

// 2. 檢查關鍵函數
console.log('performSmartSearch:', typeof performSmartSearch === 'function' ? '✅ 存在' : '❌ 不存在');
console.log('selectStation:', typeof selectStation === 'function' ? '✅ 存在' : '❌ 不存在');

// 3. 檢查 DOM 元素
console.log('搜尋按鈕:', document.getElementById('searchBtn') ? '✅ 存在' : '❌ 不存在');
console.log('價格滑軌:', document.getElementById('priceRange') ? '✅ 存在' : '❌ 不存在');

// 4. 測試選擇站點和搜尋
try {
    console.log('正在測試選擇站點...');
    selectStation('台北車站');
    console.log('✅ 選擇站點成功');
    
    setTimeout(() => {
        console.log('正在測試搜尋...');
        performSmartSearch();
    }, 1000);
} catch (error) {
    console.error('❌ 測試失敗:', error);
}
```

## 如需進一步協助

如果以上步驟都無法解決問題，請提供以下資訊：

1. Console 中的錯誤訊息截圖
2. Network 標籤中的 API 請求狀態
3. 瀏覽器名稱和版本
4. 是否有使用廣告攔截器或安全性擴充功能
