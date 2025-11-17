# 🔐 API Key 安全設定指南

## ⚠️ 重要：保護您的 API Key

您的 Google Maps API Key 目前可能已經暴露在程式碼中。請立即執行以下步驟保護它。

---

## 📋 必做步驟

### 步驟 1: 設定 Google Cloud Console 限制 ✅

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 選擇您的專案
3. 找到您的 API Key → 點擊 ✏️ 編輯
4. **設定應用程式限制：**
   - 選擇「HTTP 參照網址 (網站)」
   - 點擊「新增項目」，輸入：
     ```
     https://lin830326.github.io/*
     http://localhost:*
     http://127.0.0.1:*
     ```

5. **設定 API 限制：**
   - 選擇「限制金鑰」
   - 只勾選以下 API：
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
   - 其他都不要勾選

6. 點擊「儲存」

### 步驟 2: 使用 config.template.js ✅

**本地開發時：**

1. 複製範本檔案：
   ```bash
   copy config.template.js config.js
   ```

2. 編輯 `config.js`，填入您的 API Key：
   ```javascript
   GOOGLE_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE'
   ```

3. **不要將 config.js 推送到 GitHub**（已加入 .gitignore）

### 步驟 3: GitHub 已有的 API Key 處理 🔴

如果您已經將包含 API Key 的 `config.js` 推送到 GitHub：

1. **立即更換 API Key**（在 Google Cloud Console 建立新的）
2. **刪除 Git 歷史記錄中的敏感資料：**
   ```bash
   # 警告：這會改寫 Git 歷史！
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.js" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 強制推送
   git push origin --force --all
   ```

3. **或更簡單的方式：** 使用 [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## 🚀 部署到 GitHub Pages

### 選項 A: 使用 GitHub Secrets (推薦) 🌟

1. 在 GitHub repo → Settings → Secrets and variables → Actions
2. 新增 Secret: `GOOGLE_MAPS_API_KEY`
3. 建立 GitHub Actions 工作流程：

**建立 `.github/workflows/deploy.yml`：**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create config.js
        run: |
          cp config.template.js config.js
          sed -i "s/YOUR_API_KEY_HERE/${{ secrets.GOOGLE_MAPS_API_KEY }}/g" config.js
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### 選項 B: 手動部署 (簡單但較不安全)

1. 確保 Google Cloud Console 已設定 HTTP Referer 限制
2. 在本地建立 `config.js` 包含 API Key
3. 手動推送到 `gh-pages` 分支

---

## ✅ 安全檢查清單

- [ ] Google Cloud Console 已設定 HTTP Referer 限制
- [ ] Google Cloud Console 已設定 API 限制
- [ ] config.js 已加入 .gitignore
- [ ] 已建立 config.template.js 作為範本
- [ ] 如果 API Key 已洩漏，已更換新的 Key
- [ ] 已清理 Git 歷史記錄中的敏感資料

---

## 🆘 需要協助？

如有問題，請參考：
- [Google Maps API 最佳實踐](https://developers.google.com/maps/api-security-best-practices)
- [GitHub Secrets 文件](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 📊 安全等級比較

| 方法 | 安全性 | 難度 | 適用情境 |
|------|--------|------|----------|
| HTTP Referer 限制 | ⭐⭐⭐ | 簡單 | 必做 |
| GitHub Secrets | ⭐⭐⭐⭐ | 中等 | 推薦 |
| 後端代理 | ⭐⭐⭐⭐⭐ | 困難 | 有後端時 |
