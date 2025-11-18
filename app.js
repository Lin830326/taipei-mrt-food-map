// 全域變數
let map = null;
let currentStation = null;
let markers = [];
let selectedFoodType = '';
let searchResults = [];

// 初始化函數
function initApp() {
    console.log('🚀 應用初始化開始...');
    
    // 檢查 API Key
    checkApiKey();
    
    // 初始化事件監聽器
    initEventListeners();
    
    // 載入使用者偏好設定
    loadUserPreferences();
    
    // 初始化第一個捷運路線展開
    const firstLine = document.querySelector('.line-header');
    if (firstLine) {
        toggleLine(firstLine.dataset.line || 'red');
    }
    
    console.log('✅ 應用初始化完成');
}

// 檢查 API Key
function checkApiKey() {
    const banner = document.getElementById('apiBanner');
    const message = document.getElementById('bannerMessage');
    
    if (typeof CONFIG === 'undefined' || !CONFIG.GOOGLE_API_KEY) {
        message.textContent = '⚠️ 找不到設定檔,請確認 config.js 已載入';
        banner.classList.remove('hidden');
        return;
    }
    
    if (!CONFIG.isApiKeyConfigured()) {
        message.textContent = '⚠️ API Key 尚未設定,請點擊右側按鈕進行設定';
        banner.classList.remove('hidden');
        initBasicMap();
    } else {
        message.textContent = '⏳ 正在載入 Google Maps API...';
        banner.classList.remove('hidden');
        // API 載入由 HTML 中的 script 標籤處理,完成後會呼叫 window.initMap
    }
}

// 載入 Google Maps Script (已移除,改用 HTML 直接載入)
function loadGoogleMapsScript() {
    if (typeof google !== 'undefined' && google.maps) {
        console.log('✅ Google Maps API 已載入');
        return;
    }
    
    console.log('⏳ 等待 Google Maps API 載入...');
}

// 初始化 Google Maps (內部使用,由 window.initMap 呼叫)
function initGoogleMap() {
    const mapContainer = document.getElementById('map');
    
    try {
        if (typeof google === 'undefined' || !google.maps) {
            throw new Error('Google Maps API 未載入');
        }
        
        map = new google.maps.Map(mapContainer, {
            center: { lat: CONFIG.API_SETTINGS.TAIPEI_CENTER.lat, lng: CONFIG.API_SETTINGS.TAIPEI_CENTER.lng },
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        console.log('✅ Google Maps 初始化成功');
    } catch (error) {
        console.error('❌ Google Maps 初始化失敗:', error);
        initBasicMap();
    }
}

// 初始化基本地圖（備用方案）
function initBasicMap() {
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #f5f7fa; color: #7f8c8d;">
            <i class="fas fa-map-marked-alt" style="font-size: 4rem; margin-bottom: 20px; color: #3498db;"></i>
            <h3 style="margin-bottom: 10px;">地圖模式</h3>
            <p>請設定 Google Maps API Key 以啟用完整地圖功能</p>
            <button onclick="showApiSetup()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 20px; cursor: pointer;">設定 API</button>
        </div>
    `;
}

// 初始化事件監聽器
function initEventListeners() {
    // 搜尋半徑改變
    const radiusSelect = document.getElementById('radiusSelect');
    if (radiusSelect) {
        radiusSelect.addEventListener('change', (e) => {
            saveUserPreference('radius', e.target.value);
            if (currentStation) {
                performSmartSearch();
            }
        });
    }
    
    // 價格範圍改變
  const priceRange = document.getElementById('priceRange');
const priceDisplay = document.getElementById('priceDisplay');

function updatePriceDisplay(value) {
    const labels = {
        1: '只看平價 ($)',
        2: '只看中價 ($$)',
        3: '中價~中高價 ($$~$$$)',
        4: '中高~高價 ($$$~$$$$)',
    };
    priceDisplay.textContent = labels[value] || '價格不限';
}

if (priceRange && priceDisplay) {
    // 先用目前 slider 的值初始化一次文字
    updatePriceDisplay(parseInt(priceRange.value || '3', 10));

    priceRange.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        updatePriceDisplay(value);

        // 儲存的仍然是「第幾格」，後面再依這個值算出 min/max
        saveUserPreference('maxPrice', value);
    });
}

    
    // 排序方式改變
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            saveUserPreference('sortBy', e.target.value);
            if (searchResults.length > 0) {
                displayResults(searchResults);
            }
        });
    }
    
    // 只顯示營業中
    const openNowCheck = document.getElementById('openNowCheck');
    if (openNowCheck) {
        openNowCheck.addEventListener('change', (e) => {
            saveUserPreference('openNow', e.target.checked);
            if (searchResults.length > 0) {
                displayResults(searchResults);
            }
        });
    }
    
    // 快速篩選器
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            filterChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            selectedFoodType = e.target.dataset.type || '';
            saveUserPreference('foodType', selectedFoodType);
            
            if (currentStation) {
                performSmartSearch();
            }
        });
    });
}

// 切換捷運路線顯示
function toggleLine(lineId) {
    const header = document.querySelector(`.line-header[onclick*="${lineId}"]`);
    const stations = document.getElementById(`${lineId}-stations`);
    
    if (!header || !stations) return;
    
    const isShow = stations.classList.contains('show');
    
    // 關閉所有其他路線
    document.querySelectorAll('.stations').forEach(s => s.classList.remove('show'));
    document.querySelectorAll('.line-header').forEach(h => h.classList.remove('active'));
    
    if (!isShow) {
        stations.classList.add('show');
        header.classList.add('active');
    }
}

// 選擇捷運站
function selectStation(stationName) {
    console.log('🚉 選擇站點:', stationName);
    
    currentStation = stationName;
    
    // 更新 UI
    document.getElementById('currentStation').textContent = stationName;
    
    // 更新選中狀態
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('selected');
        if (item.textContent === stationName) {
            item.classList.add('selected');
        }
    });
    
    // 儲存到使用者歷史
    saveToHistory(stationName);
    
    // 執行搜尋
    performSmartSearch();
}

// 執行智能搜尋
async function performSmartSearch() {
    if (!currentStation) {
        alert('請先選擇一個捷運站');
        return;
    }
    
    console.log('🔍 開始智能搜尋:', currentStation);
    console.log('📊 搜尋參數:', {
        station: currentStation,
        type: selectedFoodType,
        radius: document.getElementById('radiusSelect')?.value,
        maxPrice: document.getElementById('priceRange')?.value,
        openNow: document.getElementById('openNowCheck')?.checked
    });
    
    // 顯示載入狀態
    showLoading(true);
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 搜尋中...';
    }
    
    try {
        // 檢查是否有 Google Maps API
        if (typeof google === 'undefined' || !google.maps) {
            console.error('❌ Google Maps API 未載入');
            throw new Error('API_NOT_AVAILABLE');
        }
        
        console.log('✅ Google Maps API 已載入');
        
        // 獲取搜尋參數
      // 獲取搜尋參數
const radius = parseInt(document.getElementById('radiusSelect')?.value || '800');

// 使用者在滑桿上選到第幾格（1~4）
const priceValue = parseInt(document.getElementById('priceRange')?.value || '3', 10);

// 將 1~4 映射成實際的價格區間
const pricePresets = {
    1: { minPrice: 1, maxPrice: 1 }, // 只看平價
    2: { minPrice: 2, maxPrice: 2 }, // 只看中價
    3: { minPrice: 2, maxPrice: 3 }, // 中價 + 中高價
    4: { minPrice: 3, maxPrice: 4 }, // 中高~高價
};

// 如果出現例外值，就當作「價格不限」
const priceFilter = pricePresets[priceValue] || { minPrice: 1, maxPrice: 4 };

const openNow = document.getElementById('openNowCheck')?.checked || false;

console.log('🔧 解析後參數:', { radius, priceFilter, openNow, type: selectedFoodType });

// 執行搜尋
const results = await searchNearbyFood(currentStation, {
    radius,
    priceFilter,  // 👈 改成傳一個 {minPrice, maxPrice}
    openNow,
    type: selectedFoodType
});

        
        console.log('✅ 搜尋完成,結果數量:', results.length);
        
        searchResults = results;
        displayResults(results);
        
        // 更新地圖
        updateMap(currentStation, results);
        
    } catch (error) {
        console.error('❌ 搜尋失敗:', error);
        console.error('錯誤堆疊:', error.stack);
        
        if (error.message === 'API_NOT_AVAILABLE') {
            // 使用模擬資料
            console.log('⚠️ 切換到模擬資料模式');
            const mockResults = generateMockData(currentStation);
            searchResults = mockResults;
            displayResults(mockResults);
            
            showNotification('目前使用模擬資料，請設定 API Key 以取得真實資料', 'warning');
        } else {
            showNotification('搜尋失敗: ' + error.message, 'error');
            
            // 即使失敗也嘗試使用模擬資料
            console.log('⚠️ 錯誤後切換到模擬資料模式');
            const mockResults = generateMockData(currentStation);
            searchResults = mockResults;
            displayResults(mockResults);
        }
    } finally {
        console.log('🏁 搜尋流程結束');
        showLoading(false);
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-magic"></i> 智能搜尋';
        }
    }
}

// 搜尋附近美食(使用 Google Places API)
async function searchNearbyFood(stationName, options = {}) {
    return new Promise((resolve, reject) => {
        // 檢查 Google Maps API
        if (typeof google === 'undefined' || !google.maps) {
            reject(new Error('API_NOT_AVAILABLE'));
            return;
        }
        
        const geocoder = new google.maps.Geocoder();
        
        // 先取得站點座標
        geocoder.geocode({ address: `台北${stationName}捷運站` }, (results, status) => {
            console.log('🗺️ Geocoding 結果:', status, results);
            
            if (status !== 'OK' || !results[0]) {
                reject(new Error(`無法找到站點位置: ${status}`));
                return;
            }
            
            const location = results[0].geometry.location;
            console.log('📍 站點座標:', location.lat(), location.lng());
            
            // 檢查地圖是否已初始化
            if (!map) {
                console.log('⚠️ 地圖未初始化,嘗試初始化...');
                initMap();
                if (!map) {
                    reject(new Error('地圖初始化失敗'));
                    return;
                }
            }
            
            // 搜尋附近美食
            const service = new google.maps.places.PlacesService(map);
            
            // 建立搜尋請求
            const request = {
                location: location,
                radius: options.radius || 800
            };
            
            // 只在有指定類型時加入 type
            if (options.type && options.type !== '') {
                request.type = options.type;
            } else {
                request.type = 'restaurant';
            }
            
            // 只在需要時加入 openNow
            if (options.openNow === true) {
                request.openNow = true;
            }
            
            console.log('🔍 搜尋請求:', request);
            
            service.nearbySearch(request, (results, status) => {
                console.log('📊 Places API 回應:', status, results);
                
                if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    console.log('⚠️ 未找到結果,返回空陣列');
                    resolve([]);
                    return;
                }
                
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    reject(new Error(`Places API 錯誤: ${status}`));
                    return;
                }
                
                console.log(`✅ 找到 ${results.length} 個結果`);
                
                // 過濾和排序結果
               // 過濾和排序結果（使用價格區間）
               let filtered = results.filter(place => {
    const rawPrice = place.price_level;

    // 將 price_level 轉成 number，避免字串型別
    const priceLevel = typeof rawPrice === 'number'
        ? rawPrice
        : (rawPrice != null ? parseInt(rawPrice, 10) : null);

    // 支援新的 priceFilter，也順便相容舊的 maxPrice 用法
    const priceFilter = options.priceFilter || (
        options.maxPrice
            ? { minPrice: 1, maxPrice: options.maxPrice }
            : null
    );

    // 沒有設定價格篩選，或這家店沒價格資訊 → 不用價格把它排除
    if (!priceFilter || priceLevel == null) {
        return true;
    }

    if (priceLevel < priceFilter.minPrice) return false;
    if (priceLevel > priceFilter.maxPrice) return false;

    return true;
});

                
                console.log(`🔽 篩選後剩餘 ${filtered.length} 個結果`);
                
                // 計算智能評分
                filtered = filtered.map(place => {
                    const score = calculateSmartScore(place, location);
                    return { ...place, smartScore: score };
                });
                
                // 排序
                const sortBy = document.getElementById('sortSelect')?.value || 'smart';
                filtered.sort((a, b) => {
                    if (sortBy === 'smart') return b.smartScore - a.smartScore;
                    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
                    if (sortBy === 'distance') {
                        const distA = google.maps.geometry.spherical.computeDistanceBetween(location, a.geometry.location);
                        const distB = google.maps.geometry.spherical.computeDistanceBetween(location, b.geometry.location);
                        return distA - distB;
                    }
                    return 0;
                });
                
                const finalResults = filtered.slice(0, CONFIG.API_SETTINGS.MAX_RESULTS);
                console.log(`📋 最終返回 ${finalResults.length} 個結果`);
                
                resolve(finalResults);
            });
        });
    });
}

// 計算智能評分
function calculateSmartScore(place, stationLocation) {
    const weights = CONFIG.SCORING_WEIGHTS;
    
    // 評分 (0-100)
    const ratingScore = (place.rating || 0) * 20;
    
    // 距離評分 (0-100, 越近分數越高)
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        stationLocation, 
        place.geometry.location
    );
    const distanceScore = Math.max(0, 100 - (distance / 10));
    
    // 評論數評分 (0-100)
    const reviewScore = Math.min(100, (place.user_ratings_total || 0) / 10);
    
    // 價格評分 (0-100, 較低價格分數較高)
    const priceScore = place.price_level ? (5 - place.price_level) * 25 : 50;
    
    // 加權總分
    const totalScore = (
        ratingScore * weights.rating +
        distanceScore * weights.distance +
        reviewScore * weights.reviews +
        priceScore * weights.price
    );
    
    return Math.round(totalScore);
}

// 顯示搜尋結果
function displayResults(results) {
    const foodGrid = document.getElementById('foodGrid');
    
    if (!results || results.length === 0) {
        foodGrid.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-icon"><i class="fas fa-search"></i></div>
                <h3>找不到符合條件的美食</h3>
                <p>請嘗試調整搜尋條件或選擇其他捷運站</p>
            </div>
        `;
        updateSearchStats(0);
        return;
    }
    
    // 應用篩選
    const openNow = document.getElementById('openNowCheck')?.checked;
    let filtered = results;
    if (openNow) {
        filtered = results.filter(place => place.opening_hours?.open_now);
    }
    
    foodGrid.innerHTML = filtered.map(place => createFoodCard(place)).join('');
    updateSearchStats(filtered.length, results.length);
}

// 建立美食卡片
function createFoodCard(place) {
    const photoUrl = place.photos && place.photos[0] 
        ? place.photos[0].getUrl({ maxWidth: 400 })
        : 'https://via.placeholder.com/400x200?text=No+Image';
    
    // 確保 rating 是數字類型
    const rating = typeof place.rating === 'number' ? place.rating : parseFloat(place.rating) || 0;
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    const priceLevel = '💰'.repeat(place.price_level || 1);
    
    const isOpen = place.opening_hours?.open_now;
    const openStatus = isOpen === undefined ? '' : 
        `<span class="food-tag ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '已打烊'}</span>`;
    
    // 只挑出你定義過的 type 標籤 (避免未知 type 顯示英文)
    const typeLabels = (place.types || [])
        .map(t => CONFIG.FOOD_TYPES && CONFIG.FOOD_TYPES[t])
        .filter(Boolean)
        .slice(0, 2)
        .map(label => `<span class="food-tag">${label}</span>`)
        .join('');
    
    return `
        <div class="food-card" onclick="showPlaceDetails('${place.place_id}')">
            <img src="${photoUrl}" alt="${place.name}" class="food-card-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
            <div class="food-card-content">
                <div class="food-card-header">
                    <div>
                        <h3 class="food-card-title">${place.name}</h3>
                    </div>
                    <div class="smart-score">
                        <i class="fas fa-star"></i>
                        <span>${place.smartScore || 0}</span>
                    </div>
                </div>
                <div class="food-card-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span class="rating-stars">${stars}</span>
                        <span>${rating.toFixed(1)} (${place.user_ratings_total || 0})</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${place.vicinity || '地址未提供'}</span>
                    </div>
                </div>
                <div class="food-card-tags">
                    <span class="food-tag price">${priceLevel}</span>
                    ${openStatus}
                    ${typeLabels}
                </div>
            </div>
        </div>
    `;
}

// 更新地圖標記
function updateMap(stationName, places) {
    if (!map) return;
    
    // 清除舊標記
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // 取得站點位置
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `台北${stationName}捷運站` }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            
            // 設定地圖中心
            map.setCenter(location);
            map.setZoom(15);
            
            // 添加站點標記
            const stationMarker = new google.maps.Marker({
                position: location,
                map: map,
                title: stationName,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
            });
            markers.push(stationMarker);
            
            // 添加美食標記
            places.forEach((place, index) => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    label: {
                        text: (index + 1).toString(),
                        color: 'white'
                    }
                });
                
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px;">
                            <h3 style="margin: 0 0 5px 0;">${place.name}</h3>
                            <p style="margin: 0; color: #666;">${place.vicinity}</p>
                            <p style="margin: 5px 0 0 0;">評分: ${place.rating || 'N/A'} ⭐</p>
                        </div>
                    `
                });
                
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
                
                markers.push(marker);
            });
        }
    });
}

// 顯示地點詳情
function showPlaceDetails(placeId) {
    if (!map) {
        alert('請先設定 Google Maps API Key');
        return;
    }
    
    const service = new google.maps.places.PlacesService(map);
    service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // 可以在這裡顯示詳細資訊模態框
            console.log('地點詳情:', place);
            
            // 簡單的 alert 示範
            alert(`${place.name}\n\n${place.formatted_address}\n\n電話: ${place.formatted_phone_number || '未提供'}\n\n評分: ${place.rating || 'N/A'} ⭐`);
        }
    });
}

// 產生模擬資料
function generateMockData(stationName) {
    const mockRestaurants = [
        '小籠包專賣店', '日式拉麵館', '泰式料理', '義式餐廳', '韓式燒肉',
        '台式熱炒', '港式茶餐廳', '越南河粉', '美式漢堡', '法式甜點店',
        '中式快餐', '印度咖哩', '墨西哥餐廳', '素食餐廳', '海鮮餐廳'
    ];
    
    return mockRestaurants.slice(0, 12).map((name, index) => ({
        name: `${name} (${stationName}店)`,
        vicinity: `台北市 ${stationName} 附近`,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        user_ratings_total: Math.floor(Math.random() * 500) + 50,
        price_level: Math.floor(Math.random() * 4) + 1,
        smartScore: Math.floor(Math.random() * 30) + 70,
        opening_hours: { open_now: Math.random() > 0.3 },
        types: ['restaurant', 'food'],
        place_id: `mock_${index}`,
        photos: null,
        geometry: { location: null }
    }));
}

// 工具函數
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.classList.toggle('show', show);
    }
}

function updateSearchStats(count, total) {
    const stats = document.getElementById('searchStats');
    if (stats) {
        if (total && total !== count) {
            stats.textContent = `顯示 ${count} / ${total} 筆結果`;
        } else {
            stats.textContent = `找到 ${count} 筆結果`;
        }
    }
}

function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`mrt_food_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('儲存偏好設定失敗:', e);
    }
}

function loadUserPreferences() {
    try {
        const radius = localStorage.getItem('mrt_food_radius');
        const maxPrice = localStorage.getItem('mrt_food_maxPrice');
        const sortBy = localStorage.getItem('mrt_food_sortBy');
        const openNow = localStorage.getItem('mrt_food_openNow');
        const foodType = localStorage.getItem('mrt_food_foodType');
        
        if (radius) document.getElementById('radiusSelect').value = JSON.parse(radius);
        if (maxPrice) document.getElementById('priceRange').value = JSON.parse(maxPrice);
        if (sortBy) document.getElementById('sortSelect').value = JSON.parse(sortBy);
        if (openNow) document.getElementById('openNowCheck').checked = JSON.parse(openNow);
        if (foodType) selectedFoodType = JSON.parse(foodType);
    } catch (e) {
        console.error('載入偏好設定失敗:', e);
    }
}

function saveToHistory(stationName) {
    try {
        let history = JSON.parse(localStorage.getItem('mrt_food_history') || '[]');
        history = [stationName, ...history.filter(s => s !== stationName)].slice(0, 10);
        localStorage.setItem('mrt_food_history', JSON.stringify(history));
    } catch (e) {
        console.error('儲存歷史失敗:', e);
    }
}

function showNotification(message, type = 'info') {
    const banner = document.getElementById('apiBanner');
    const messageEl = document.getElementById('bannerMessage');
    
    if (banner && messageEl) {
        messageEl.textContent = message;
        banner.className = 'api-banner';
        if (type === 'success') banner.classList.add('success');
        banner.classList.remove('hidden');
        
        setTimeout(() => banner.classList.add('hidden'), 5000);
    }
}

function showApiSetup() {
    const modal = document.getElementById('apiModal');
    if (modal) {
        modal.classList.add('show');
        
        const statusText = document.getElementById('apiStatusText');
        if (statusText) {
            statusText.textContent = CONFIG && CONFIG.isApiKeyConfigured() 
                ? '✅ 已設定' 
                : '❌ 未設定';
        }
    }
}

function closeApiModal() {
    const modal = document.getElementById('apiModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Google Maps API 回呼 - 必須在全域定義以便 API callback 使用
window.initMap = function() {
    console.log('🗺️ Google Maps API callback 被呼叫');
    
    const mapContainer = document.getElementById('map');
    
    try {
        if (typeof google === 'undefined' || !google.maps) {
            throw new Error('Google Maps API 未載入');
        }
        
        map = new google.maps.Map(mapContainer, {
            center: { 
                lat: CONFIG.API_SETTINGS.TAIPEI_CENTER.lat, 
                lng: CONFIG.API_SETTINGS.TAIPEI_CENTER.lng 
            },
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        console.log('✅ Google Maps 初始化成功');
        
        // 隱藏 API 提示橫幅
        const banner = document.getElementById('apiBanner');
        const message = document.getElementById('bannerMessage');
        if (banner && message) {
            message.textContent = '✅ Google Maps API 已載入成功！';
            banner.classList.add('success');
            setTimeout(() => banner.classList.add('hidden'), 3000);
        }
        
    } catch (error) {
        console.error('❌ Google Maps 初始化失敗:', error);
        initBasicMap();
    }
};

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
