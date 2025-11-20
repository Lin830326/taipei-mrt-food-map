// Google Maps API Configuration
// 請在這裡設定您的 API Key
const CONFIG = {
    // ⚠️ 公開部署前請到 Google Cloud Console 設定以下限制
    GOOGLE_API_KEY: 'AIzaSyCAIfX-FY50WPtoT5IxxpDllQIWv2-qEzc', // 請替換為您的實際 API Key
    
    // API Libraries
    GOOGLE_LIBRARIES: ['places', 'geometry'],
    
    // 預設搜尋設定
    DEFAULT_SEARCH_RADIUS: 800, // 公尺
    MAX_RESULTS: 12,
    
    // API 設定
    API_SETTINGS: {
        DEFAULT_SEARCH_RADIUS: 800,
        MAX_RESULTS: 12,
        TAIPEI_CENTER: {
            lat: 25.0330,
            lng: 121.5654
        },
        WALKING_SPEED: 75,
        CACHE_DURATION: 30 * 60 * 1000 // 30分鐘
    },
    
    // 台北市中心座標 (向後相容)
    TAIPEI_CENTER: {
        lat: 25.0330,
        lng: 121.5654
    },
    
    // 步行速度 (公尺/分鐘)
    WALKING_SPEED: 75,
    
    // 快取時間 (毫秒)
    CACHE_DURATION: 30 * 60 * 1000, // 30分鐘
    
    // 支援的美食類型
    FOOD_TYPES: {
        'restaurant': '餐廳',
        'cafe': '咖啡廳',
        'bakery': '烘焙店',
        'meal_takeaway': '外帶美食',
        'food': '食物店'
    },
    
    // 通用的 Place Types（需要過濾掉，因為沒有意義）
    GENERIC_PLACE_TYPES: [
        'point_of_interest',
        'establishment',
        'food',
        'restaurant',
        'store',
        'shopping_mall',
        'health'
    ],
    
    // 業務狀態定義
    BUSINESS_STATUS: {
        'OPERATIONAL': '營業中',
        'CLOSED_TEMPORARILY': '暫停營業',
        'CLOSED_PERMANENTLY': '永久歇業'
    },
    
    // 搜尋過濾選項
    SEARCH_FILTERS: {
        excludeClosedPermanently: true,   // 排除永久歇業的店家
        excludeTemporarilyClosed: false,  // 不排除暫時關閉的店家
        minRating: 0,                     // 最低評分要求 (0 = 不限制)
        minReviews: 0                     // 最低評論數要求 (0 = 不限制)
    },
    
    // 價格等級對應
    PRICE_LEVELS: {
        0: '免費',
        1: '實惠 $',
        2: '平價 $$',
        3: '中等 $$$',
        4: '高價 $$$$'
    },
    
    // 價格範圍定義（用於 API 查詢）
    // 注意：Google Places API 的 price_level 是相對等級，非具體金額
    // 在台北，大致對應：
    // 1 = 100-300元，2 = 300-600元，3 = 600-1200元，4 = 1200元以上
    PRICE_RANGES: {
        1: { min: 0, max: 1, label: '實惠（約100-300元）' },      // 只要 price_level = 1
        2: { min: 0, max: 2, label: '平價（約100-600元）' },      // price_level <= 2
        3: { min: 2, max: 3, label: '中等（約300-1200元）' },     // price_level 2-3
        4: { min: 3, max: 4, label: '高價（約600元以上）' }        // price_level >= 3
    },
    
    // 智能評分權重
    SCORING_WEIGHTS: {
        rating: 0.4,      // 評分權重
        distance: 0.3,    // 距離權重
        reviews: 0.2,     // 評論數權重
        price: 0.1        // 價格權重
    },
    
    // 地理定位設定
    GEOLOCATION_OPTIONS: {
        enableHighAccuracy: true,  // 使用高精度定位
        timeout: 10000,            // 10秒超時
        maximumAge: 0              // 不使用快取位置
    },
    
    // 導航設定
    NAVIGATION_SETTINGS: {
        travelMode: 'WALKING',     // 預設步行模式 (WALKING, DRIVING, BICYCLING, TRANSIT)
        unitSystem: 'METRIC',      // 公制單位
        avoidHighways: false,      // 避開高速公路
        avoidTolls: true          // 避開收費道路
    },
    
    // 功能開關
    FEATURE_FLAGS: {
        enableNavigation: true,    // ✅ 導航功能（開啟）
        enableGoogleMaps: true     // Google Maps 跳轉（免費，開啟）
    }
};

// 檢查 API Key 是否已設定
CONFIG.isApiKeyConfigured = function() {
    return this.GOOGLE_API_KEY && 
           this.GOOGLE_API_KEY !== 'AIzaSyCAIfX-FY50WPtoT5IxxpDllQIWv2-qEzc' && 
           this.GOOGLE_API_KEY.length > 20;
};

// 取得 Google Maps API 載入 URL
CONFIG.getGoogleMapsUrl = function() {
    if (!this.isApiKeyConfigured()) {
        console.warn('⚠️ Google API Key 尚未設定');
        return null;
    }
    
    const libraries = this.GOOGLE_LIBRARIES.join(',');
    return `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_API_KEY}&libraries=${libraries}&language=zh-TW&callback=initMap`;
};

// 匯出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

