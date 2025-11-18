// favorites.js
// 專門處理「我的最愛」資料的模組，不改動 app.js 內部邏輯

console.log('✅ favorites.js 檔案已載入（檔案頂端）');

// 存在 localStorage 裡的 key 名稱
const FAVORITES_STORAGE_KEY = 'mrt_food_favorites';

// 記憶體中的我的最愛列表（Array）
let favoritesList = [];

// 方便查詢是否已收藏：用 placeId 當 key 的 Map
let favoritesMap = new Map();

/**
 * 從 localStorage 載入我的最愛清單
 * - 如果沒有資料，就用空陣列
 * - 如果資料壞掉（JSON 解析錯誤），也會重置成空陣列
 */
function loadFavoritesFromStorage() {
    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!raw) {
            favoritesList = [];
            favoritesMap = new Map();
            return;
        }

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            favoritesList = parsed;
        } else {
            favoritesList = [];
        }
    } catch (err) {
        console.error('載入我的最愛資料失敗，將重置為空清單：', err);
        favoritesList = [];
    }

    rebuildFavoritesMap();
}

/**
 * 根據 favoritesList 重建 Map，加速查詢
 */
function rebuildFavoritesMap() {
    favoritesMap = new Map();
    favoritesList.forEach((item) => {
        if (item && item.placeId) {
            favoritesMap.set(item.placeId, item);
        }
    });
}

/**
 * 將目前 favoritesList 寫回 localStorage
 */
function saveFavoritesToStorage() {
    try {
        const json = JSON.stringify(favoritesList);
        localStorage.setItem(FAVORITES_STORAGE_KEY, json);
    } catch (err) {
        console.error('儲存我的最愛資料失敗：', err);
    }
}

/**
 * 檢查某個 placeId 是否已在我的最愛裡
 */
function isPlaceFavorited(placeId) {
    if (!placeId) return false;
    return favoritesMap.has(placeId);
}

/**
 * 新增一筆我的最愛
 */
function addFavorite(placeData) {
    if (!placeData || !placeData.placeId) {
        console.warn('addFavorite：缺少 placeId，略過', placeData);
        return;
    }

    // 已存在就不重複加入
    if (favoritesMap.has(placeData.placeId)) {
        return;
    }

    favoritesList.push(placeData);
    rebuildFavoritesMap();
    saveFavoritesToStorage();
}

/**
 * 移除一筆我的最愛
 */
function removeFavorite(placeId) {
    if (!placeId) return;

    favoritesList = favoritesList.filter((item) => item.placeId !== placeId);
    rebuildFavoritesMap();
    saveFavoritesToStorage();
}

/**
 * 從 food-card 的 DOM 元素推回 placeId
 * 優先使用 data-place-id；沒有則從 onclick 解析 showPlaceDetails('xxx')
 */
function getPlaceIdFromCard(card) {
    if (!card) return null;

    // 優先使用 data-place-id
    const existing = card.getAttribute('data-place-id');
    if (existing) return existing;

    // 從 onclick="showPlaceDetails('PLACE_ID')" 解析
    const onclick = card.getAttribute('onclick');
    if (!onclick) return null;

    const match = onclick.match(/showPlaceDetails\('(.+?)'\)/);
    if (match && match[1]) {
        const placeId = match[1];
        card.setAttribute('data-place-id', placeId);
        return placeId;
    }

    return null;
}

/**
 * 替單一 food-card 插入「我的最愛」愛心按鈕
 */
function decorateFoodCard(card) {
    if (!card) return;

    // 已經有 favorite-btn 就不重複插入
    if (card.querySelector('.favorite-btn')) {
        return;
    }

    const placeId = getPlaceIdFromCard(card);
    if (!placeId) return;

    // 確保卡片本身是定位容器，讓絕對定位的愛心能貼著卡片角落
    if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
    }

    // 建立按鈕
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'favorite-btn';
    btn.setAttribute('data-place-id', placeId);

    // 根據目前資料決定愛心是否亮起
    if (isPlaceFavorited(placeId)) {
        btn.classList.add('active');
    }

    // 建立 icon（Font Awesome）
    const icon = document.createElement('i');
    icon.className = 'fas fa-heart';
    btn.appendChild(icon);

    // 插入到卡片最前面，視覺上在圖片上方
    card.insertBefore(btn, card.firstChild);
}

/**
 * 掃描 foodGrid 底下所有 food-card
 */
function decorateFoodCards() {
    const foodGrid = document.getElementById('foodGrid');
    if (!foodGrid) return;

    const cards = foodGrid.querySelectorAll('.food-card');
    cards.forEach((card) => decorateFoodCard(card));
}

/**
 * 從 food-card DOM 抽出要存到我的最愛的資料
 * @param {HTMLElement} card
 * @param {string} placeId
 * @returns {object}
 */
function buildPlaceDataFromCard(card, placeId) {
    const titleEl = card.querySelector('.food-card-title');
    const name = titleEl ? titleEl.textContent.trim() : '';

    // 評分與評論數，例如 "4.3 (120)"
    let rating = null;
    let userRatingsTotal = null;
    const ratingItem = card.querySelector('.food-card-meta .meta-item');
    if (ratingItem) {
        const spans = ratingItem.querySelectorAll('span');
        // spans[2] 大概會是 "4.3 (120)" 這種
        if (spans[2]) {
            const text = spans[2].textContent.trim();
            const m = text.match(/([\d.]+)\s*\((\d+)\)/);
            if (m) {
                rating = parseFloat(m[1]);
                userRatingsTotal = parseInt(m[2]);
            }
        }
    }

    // 地址：第二個 meta-item 的最後一個 span
    let vicinity = '';
    const metaItems = card.querySelectorAll('.food-card-meta .meta-item');
    if (metaItems[1]) {
        const addrSpan = metaItems[1].querySelector('span:last-child');
        if (addrSpan) {
            vicinity = addrSpan.textContent.trim();
        }
    }

    // 圖片 URL
    let photoUrl = '';
    const img = card.querySelector('.food-card-image');
    if (img && img.src) {
        photoUrl = img.src;
    }

    // 目前捷運站名稱（來自 app.js 全域變數）
    const station = typeof currentStation === 'string' ? currentStation : null;

    return {
        placeId,
        name,
        station,
        rating,
        userRatingsTotal,
        priceLevel: null, // 目前從 DOM 抓不到，就先保留欄位
        vicinity,
        photoUrl,
    };
}

/**
 * 按下愛心按鈕時，切換我的最愛狀態
 * @param {HTMLButtonElement} btn
 */
function toggleFavoriteFromButton(btn) {
    if (!btn) return;

    const placeId = btn.getAttribute('data-place-id');
    if (!placeId) return;

    const card = btn.closest('.food-card');
    if (!card) return;

    if (isPlaceFavorited(placeId)) {
        // 已收藏 → 移除
        removeFavorite(placeId);
        btn.classList.remove('active');

        if (typeof showNotification === 'function') {
            showNotification('已從我的最愛移除', 'info');
        }
    } else {
        // 未收藏 → 新增
        const placeData = buildPlaceDataFromCard(card, placeId);
        addFavorite(placeData);
        btn.classList.add('active');

        if (typeof showNotification === 'function') {
            showNotification('已加入我的最愛', 'success');
        }
    }

    console.log('💾 目前我的最愛數量：', favoritesList.length);
}



/**
 * 根據 favoritesList 渲染「我的最愛列表」到 foodGrid
 */
function renderFavoritesList() {
    const foodGrid = document.getElementById('foodGrid');
    if (!foodGrid) return;

    if (!favoritesList || favoritesList.length === 0) {
        // 還沒有收藏時的提示畫面
        foodGrid.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-icon"><i class="fas fa-heart-broken"></i></div>
                <h3>還沒有加入任何我的最愛</h3>
                <p>在搜尋結果中點擊餐廳卡片右上角的愛心，就可以收藏囉！</p>
            </div>
        `;
        return;
    }

    // 把每一筆 favorite 轉成「類似 Google Place 的物件」，丟給 createFoodCard 使用
    const cardsHtml = favoritesList.map((fav) => {
        const placeLike = {
            place_id: fav.placeId,
            name: fav.name,
            rating: fav.rating ?? 0,
            user_ratings_total: fav.userRatingsTotal ?? 0,
            vicinity: fav.vicinity || '',
            price_level: fav.priceLevel || 1,
            photos: [{
                getUrl: () =>
                    fav.photoUrl ||
                    'https://via.placeholder.com/400x200?text=No+Image',
            }],
            opening_hours: {},   // 沒有營業資訊就給空物件
            smartScore: 0,
            types: [],
        };

        // createFoodCard 是 app.js 裡的函式（全域可用）
        return createFoodCard(placeLike);
    }).join('');

    foodGrid.innerHTML = cardsHtml;

    // 再給這些卡片補上愛心按鈕＆狀態
    decorateFoodCards();
}








// 監控 foodGrid 的 MutationObserver 實例
let foodGridObserver = null;

/**
 * 設定監聽，只要 foodGrid 有新卡片就自動裝飾
 */
function setupFoodCardObserver() {
    const foodGrid = document.getElementById('foodGrid');
    if (!foodGrid) {
        console.warn('找不到 #foodGrid，暫時無法啟用我的最愛卡片裝飾');
        return;
    }

    // 先處理目前已存在的卡片
    decorateFoodCards();

    if (typeof MutationObserver === 'undefined') {
        console.warn('瀏覽器不支援 MutationObserver');
        return;
    }

    foodGridObserver = new MutationObserver((mutations) => {
        let needDecorate = false;

        for (const m of mutations) {
            if (m.type === 'childList' && m.addedNodes.length > 0) {
                needDecorate = true;
                break;
            }
        }

        if (needDecorate) {
            decorateFoodCards();
        }
    });

    foodGridObserver.observe(foodGrid, {
        childList: true,
        subtree: true,
    });
}


/**
 * 綁定「我的最愛」按鈕，點擊時顯示收藏清單
 */
function setupFavoritesListButton() {
    const btn = document.getElementById('favoritesListBtn');
    if (!btn) {
        console.warn('找不到 #favoritesListBtn 按鈕，無法啟用我的最愛列表');
        return;
    }

    btn.addEventListener('click', () => {
        console.log('📂 顯示我的最愛列表');
        renderFavoritesList();
    });
}



/**
 * 設定全域點擊監聽，處理所有 .favorite-btn 的點擊
 */
function setupFavoriteClickHandler() {
    document.addEventListener('click', (event) => {
        const target = event.target;

        // 找最近的 .favorite-btn（點在 <i> 上也算）
        const btn = target.closest ? target.closest('.favorite-btn') : null;
        if (!btn) return;

        // 避免觸發 card 的 onclick="showPlaceDetails(...)"
        event.stopPropagation();
        event.preventDefault();

        toggleFavoriteFromButton(btn);
    });
}

/**
 * 初始化整個我的最愛功能
 */
function initFavorites() {
    console.log('🚀 initFavorites() 被呼叫了');

    loadFavoritesFromStorage();
    console.log('⭐ 我的最愛初始化完成，目前筆數：', favoritesList.length);

    setupFoodCardObserver();      // 搜尋結果出現時，自動插入愛心
    setupFavoriteClickHandler();  // 點愛心：加入 / 取消 收藏
    setupFavoritesListButton();   // 點「我的最愛」：顯示收藏清單
}

window.addEventListener('load', () => {
    console.log('🌐 window load 事件觸發，準備呼叫 initFavorites()');
    initFavorites();
});

console.log('✅ favorites.js 檔案解析完畢（檔案底部）');
