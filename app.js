// 全域變數
let map = null;
let currentStation = null;
let markers = [];
let selectedFoodType = '';
let searchResults = [];
let directionsService = null;
let directionsRenderer = null;
let userLocation = null;

// 通用的 Place Types（從 CONFIG 讀取或使用預設值）
const GENERIC_PLACE_TYPES = new Set(
    (CONFIG && CONFIG.GENERIC_PLACE_TYPES && Array.isArray(CONFIG.GENERIC_PLACE_TYPES))
        ? CONFIG.GENERIC_PLACE_TYPES
        : ['point_of_interest', 'establishment', 'food', 'restaurant', 'store', 'shopping_mall', 'health']
);

function formatPlaceTypeLabel(type) {
    if (!type) return '';
    if (CONFIG && CONFIG.FOOD_TYPES && CONFIG.FOOD_TYPES[type]) {
        return CONFIG.FOOD_TYPES[type];
    }
    return type.replace(/_/g, ' ');
}

function getPriceFilter(level) {
    if (!CONFIG || !CONFIG.PRICE_FILTERS) return null;
    return CONFIG.PRICE_FILTERS[level] || null;
}

// 初始化函數
function initApp() {
    console.log('🚀 應用初始化開始...');

    // 顯示載入畫面
    showLoadingScreen();

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

    // 如果沒有API Key，則在檢查完後隱藏載入畫面
    if (!CONFIG.isApiKeyConfigured()) {
        setTimeout(() => {
            hideLoadingScreen();
            console.log('✅ 應用初始化完成（無API模式）');
        }, 1500);
    }
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

    // 隱藏載入畫面（備用地圖模式）
    hideLoadingScreen();
    console.log('✅ 備用地圖初始化完成');
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
    if (priceRange && priceDisplay) {
        // 初始化顯示當前值
        const initialValue = parseInt(priceRange.value);
        const labels = [
            '實惠 $ (約100-300元)',
            '平價 $$ (約100-600元)', 
            '中等 $$$ (約300-1200元)',
            '高價 $$$$ (約600元以上)'
        ];
        priceDisplay.textContent = labels[initialValue - 1] || '平價 $$';
        
        priceRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            priceDisplay.textContent = labels[value - 1] || '平價 $$';
            saveUserPreference('maxPrice', value);
            if (currentStation) {
                performSmartSearch();
            }
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
        const radius = parseInt(document.getElementById('radiusSelect')?.value || '800');
        const maxPrice = parseInt(document.getElementById('priceRange')?.value || '3');
        const openNow = document.getElementById('openNowCheck')?.checked || false;
        
        console.log('🔧 解析後參數:', { radius, maxPrice, openNow, type: selectedFoodType });
        
        // 執行搜尋
        const results = await searchNearbyFood(currentStation, {
            radius,
            maxPrice,
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
            
            // 加入價格範圍參數
            if (options.maxPrice && CONFIG.PRICE_RANGES[options.maxPrice]) {
                const priceRange = CONFIG.PRICE_RANGES[options.maxPrice];
                if (priceRange.min > 0) {
                    request.minprice = priceRange.min;
                }
                if (priceRange.max < 4) {
                    request.maxprice = priceRange.max;
                }
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
                let filtered = results.filter(place => {
                    // 1. 排除永久歇業的店家
                    if (CONFIG.SEARCH_FILTERS.excludeClosedPermanently) {
                        if (place.business_status === 'CLOSED_PERMANENTLY') {
                            console.log(`🚫 排除永久歇業: ${place.name}`);
                            return false;
                        }
                    }
                    
                    // 2. 排除暫時關閉的店家（可選）
                    if (CONFIG.SEARCH_FILTERS.excludeTemporarilyClosed) {
                        if (place.business_status === 'CLOSED_TEMPORARILY') {
                            console.log(`⏸️ 排除暫時關閉: ${place.name}`);
                            return false;
                        }
                    }
                    
                    // 3. 價格範圍驗證（API 已做初步篩選，這裡再次確認）
                    // 注意：有些餐廳可能沒有 price_level 資料，我們會保留它們
                    if (options.maxPrice && CONFIG.PRICE_RANGES[options.maxPrice]) {
                        const priceRange = CONFIG.PRICE_RANGES[options.maxPrice];
                        if (place.price_level) {
                            // 只有當餐廳有價格資訊時才進行範圍檢查
                            if (place.price_level < priceRange.min || place.price_level > priceRange.max) {
                                console.log(`💰 排除價格範圍外: ${place.name} (price_level: ${place.price_level})`);
                                return false;
                            }
                        }
                        // 沒有 price_level 的餐廳會被保留，但在評分時會有較低的價格分數
                    }
                    
                    // 4. 最低評分過濾
                    if (CONFIG.SEARCH_FILTERS.minRating > 0) {
                        if (!place.rating || place.rating < CONFIG.SEARCH_FILTERS.minRating) {
                            return false;
                        }
                    }
                    
                    // 5. 最低評論數過濾
                    if (CONFIG.SEARCH_FILTERS.minReviews > 0) {
                        if (!place.user_ratings_total || place.user_ratings_total < CONFIG.SEARCH_FILTERS.minReviews) {
                            return false;
                        }
                    }
                    
                    return true;
                });
                
                const closedCount = results.length - filtered.length;
                if (closedCount > 0) {
                    console.log(`🔽 篩選掉 ${closedCount} 個不符合條件的結果（包含歇業店家）`);
                }
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
                
                // 限制為前10名
                const finalResults = filtered.slice(0, 10);
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
    
    // 將 place 物件序列化並存儲，避免 JSON.stringify 在 HTML 中的問題
    const placeId = place.place_id;
    
    return `
        <div class="food-card" data-place-id="${placeId}">
            <div class="food-card-clickable" onclick="showPlaceDetails('${placeId}')">
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
                        ${(place.types || [])
                            .filter(type => !GENERIC_PLACE_TYPES.has(type))
                            .slice(0, 2)
                            .map(type => `<span class="food-tag">${formatPlaceTypeLabel(type)}</span>`)
                            .join('')}
                    </div>
                </div>
            </div>
            <div class="food-card-actions">
                ${CONFIG.FEATURE_FLAGS.enableNavigation ? `
                    <button class="btn-navigate" onclick="event.stopPropagation(); handleNavigate('${placeId}')" title="顯示路線">
                        <i class="fas fa-directions"></i> 導航
                    </button>
                ` : ''}
                ${CONFIG.FEATURE_FLAGS.enableGoogleMaps ? `
                    <button class="btn-google-maps" onclick="event.stopPropagation(); handleGoogleMaps('${placeId}')" title="在 Google Maps 開啟">
                        <i class="fab fa-google"></i> Google Maps
                    </button>
                ` : ''}
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
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hide');
        loadingScreen.classList.remove('fade-out');
        console.log('📺 顯示載入畫面');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        // 動畫完成後完全隱藏
        setTimeout(() => {
            loadingScreen.classList.add('hide');
            console.log('📺 隱藏載入畫面');
        }, 800);
    }
}

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
        if (maxPrice) {
            const priceValue = JSON.parse(maxPrice);
            document.getElementById('priceRange').value = priceValue;
            // 更新價格顯示文字
            const labels = [
                '實惠 $ (約100-300元)',
                '平價 $$ (約100-600元)', 
                '中等 $$$ (約300-1200元)',
                '高價 $$$$ (約600元以上)'
            ];
            const priceDisplay = document.getElementById('priceDisplay');
            if (priceDisplay) {
                priceDisplay.textContent = labels[priceValue - 1] || '平價 $$';
            }
        }
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

        // 初始化導航服務
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#0066CC',
                strokeWeight: 5,
                strokeOpacity: 0.8
            }
        });

        // 隱藏 API 提示橫幅
        const banner = document.getElementById('apiBanner');
        const message = document.getElementById('bannerMessage');
        if (banner && message) {
            message.textContent = '✅ Google Maps API 已載入成功！';
            banner.classList.add('success');
            setTimeout(() => banner.classList.add('hidden'), 3000);
        }

        // 隱藏載入畫面
        hideLoadingScreen();
        console.log('✅ 應用初始化完成（API模式）');

    } catch (error) {
        console.error('❌ Google Maps 初始化失敗:', error);
        initBasicMap();

        // 即使API載入失敗也要隱藏載入畫面
        hideLoadingScreen();
        console.log('✅ 應用初始化完成（備用模式）');
    }
};

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ==========================================
// 導航功能
// ==========================================

/**
 * 獲取使用者當前位置
 * @returns {Promise<{lat: number, lng: number}>}
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('您的瀏覽器不支援定位功能'));
            return;
        }
        
        console.log('📍 正在獲取使用者位置...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                userLocation = location;
                console.log('✅ 獲取位置成功:', location);
                resolve(location);
            },
            (error) => {
                console.error('❌ 獲取位置失敗:', error);
                let errorMessage = '無法獲取您的位置';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '請允許瀏覽器存取您的位置';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '位置資訊暫時無法使用';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '獲取位置超時，請稍後再試';
                        break;
                }
                
                reject(new Error(errorMessage));
            },
            CONFIG.GEOLOCATION_OPTIONS
        );
    });
}

/**
 * 顯示從使用者位置到餐廳的路線
 * @param {Object} origin - 起點座標 {lat, lng}
 * @param {Object} destination - 終點座標 {lat, lng}
 * @param {string} placeName - 餐廳名稱
 */
async function showDirections(origin, destination, placeName) {
    if (!directionsService || !directionsRenderer) {
        showNotification('地圖尚未初始化', 'error');
        return;
    }
    
    console.log('🗺️ 計算路線:', { origin, destination });
    
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[CONFIG.NAVIGATION_SETTINGS.travelMode],
        unitSystem: google.maps.UnitSystem.METRIC
    };
    
    try {
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                // 清除舊的路線
                directionsRenderer.setDirections(result);
                
                // 獲取路線資訊
                const route = result.routes[0];
                const leg = route.legs[0];
                
                console.log('✅ 路線計算成功');
                console.log('距離:', leg.distance.text);
                console.log('時間:', leg.duration.text);
                
                // 顯示路線資訊
                showRouteInfo({
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    placeName: placeName,
                    steps: leg.steps
                });
                
                showNotification(`已為您規劃前往 ${placeName} 的路線`, 'success');
            } else {
                console.error('❌ 路線計算失敗:', status);
                showNotification('路線規劃失敗: ' + status, 'error');
            }
        });
    } catch (error) {
        console.error('❌ 導航錯誤:', error);
        showNotification('導航功能發生錯誤', 'error');
    }
}

/**
 * 顯示路線資訊面板
 * @param {Object} routeInfo - 路線資訊
 */
function showRouteInfo(routeInfo) {
    // 檢查是否已有路線資訊面板
    let panel = document.getElementById('routeInfoPanel');
    
    if (!panel) {
        // 創建路線資訊面板
        panel = document.createElement('div');
        panel.id = 'routeInfoPanel';
        panel.className = 'route-info-panel';
        document.querySelector('.map-section').appendChild(panel);
    }
    
    panel.innerHTML = `
        <div class="route-info-header">
            <h3><i class="fas fa-route"></i> 前往 ${routeInfo.placeName}</h3>
            <button onclick="closeRouteInfo()" class="close-route-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="route-info-body">
            <div class="route-stat">
                <i class="fas fa-walking"></i>
                <div>
                    <span class="route-label">步行距離</span>
                    <span class="route-value">${routeInfo.distance}</span>
                </div>
            </div>
            <div class="route-stat">
                <i class="fas fa-clock"></i>
                <div>
                    <span class="route-label">預估時間</span>
                    <span class="route-value">${routeInfo.duration}</span>
                </div>
            </div>
        </div>
        <div class="route-actions">
            <button onclick="clearRoute()" class="btn-route-action">
                <i class="fas fa-eraser"></i> 清除路線
            </button>
        </div>
    `;
    
    panel.classList.add('show');
}

/**
 * 關閉路線資訊面板
 */
function closeRouteInfo() {
    const panel = document.getElementById('routeInfoPanel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 300);
    }
}

/**
 * 清除地圖上的路線
 */
function clearRoute() {
    if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
    }
    closeRouteInfo();
    showNotification('已清除路線', 'info');
}

/**
 * 導航到餐廳（主要功能）
 * @param {Object} place - 餐廳資訊
 */
async function navigateToRestaurant(place) {
    try {
        // 檢查功能是否啟用
        if (!CONFIG.FEATURE_FLAGS.enableNavigation) {
            showNotification('導航功能未啟用，請使用 Google Maps 跳轉', 'warning');
            return;
        }
        
        showNotification(`正在規劃前往 ${place.name} 的路線...`, 'info');
        
        // 獲取使用者位置
        const userPos = await getUserLocation();
        
        if (!userPos) {
            showNotification('無法取得您的位置，請開啟定位權限', 'error');
            return;
        }
        
        // 顯示路線
        await showDirections(
            userPos,
            { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            place.name
        );
        
        showNotification(`已規劃前往 ${place.name} 的路線`, 'success');
        
    } catch (error) {
        console.error('❌ 導航錯誤:', error);
        showNotification('導航失敗：' + error.message, 'error');
    }
}

/**
 * 在 Google Maps App 中開啟
 * @param {Object} place - 餐廳資訊
 */
function openInGoogleMaps(place) {
    if (!place || !place.geometry || !place.geometry.location) {
        showNotification('找不到地點座標', 'error');
        return;
    }

    const latSource = place.geometry.location.lat;
    const lngSource = place.geometry.location.lng;
    const lat = typeof latSource === 'function' ? latSource() : latSource;
    const lng = typeof lngSource === 'function' ? lngSource() : lngSource;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
        showNotification('地點座標無效', 'error');
        return;
    }

    const placeName = encodeURIComponent(place.name || 'favorite');
    const placeId = place.place_id || '';

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${placeId}&travelmode=walking`;

    console.log('🗺️ 在 Google Maps 中開啟:', placeName);
    window.open(url, '_blank');
}


function resolvePlaceById(placeId) {
    if (!placeId) return null;

    if (Array.isArray(searchResults)) {
        const hit = searchResults.find(p => p.place_id === placeId);
        if (hit) {
            return hit;
        }
    }

    if (typeof getFavoritePlaceById === 'function') {
        return getFavoritePlaceById(placeId);
    }

    return null;
}



/**
 * 處理導航按鈕點擊（通過 place_id 查找）
 * @param {string} placeId - 餐廳的 place_id
 */
function handleNavigate(placeId) {
    console.log('🔍 查找餐廳:', placeId);
    const place = resolvePlaceById(placeId);
    
    if (place) {
        navigateToRestaurant(place);
    } else {
        showNotification('找不到餐廳資訊', 'error');
    }
}


/**
 * 處理 Google Maps 按鈕點擊（通過 place_id 查找）
 * @param {string} placeId - 餐廳的 place_id
 */
function handleGoogleMaps(placeId) {
    console.log('🔍 查找餐廳:', placeId);
    const place = resolvePlaceById(placeId);
    
    if (place) {
        openInGoogleMaps(place);
    } else {
        showNotification('找不到餐廳資訊', 'error');
    }
}

