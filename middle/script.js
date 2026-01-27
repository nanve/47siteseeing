// ==========================================
// ★ここにGASのウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz1_u_9EHlQxqVgwEDffCiwqdbFWbNaubS5PgzYGVJr2wdXF817MiHxxra8jYAahFd3_g/exec'; 
// ==========================================

// 要素の取得
const buttonGrid = document.querySelector('.button-grid');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const langJPButton = document.getElementById('lang-jp');
const langENButton = document.getElementById('lang-en');

// モーダル要素
const modal = document.getElementById('detail-modal');
const closeButton = document.querySelector('.close-button');

// 中級用設定値
let allData = [];
const itemsPerPage = 6;
let currentPage = 1;
let currentLanguage = 'JP';
let currentSpirit = 'N'; // 'N'=和魂, 'A'=荒魂 (初期値は和魂)
let currentItem = null;  // 現在開いているアイテム

// スワイプ用変数
let touchStartX = 0;
let touchEndX = 0;

// --- 1. データ取得と初期化 ---
async function initApp() {
    try {
        const response = await fetch(GAS_API_URL);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        allData = data;
        renderButtons(); 
    } catch (error) {
        console.error('Error:', error);
        buttonGrid.innerHTML = '<p style="padding:20px; text-align:center;">データの読み込みに失敗しました。</p>';
    }
}

// --- 2. ボタン一覧の描画 (共通) ---
function renderButtons() {
    buttonGrid.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToDisplay = allData.slice(start, end);

    itemsToDisplay.forEach(item => {
        const title = currentLanguage === 'JP' ? item.Name_JP : item.Name_EN;
        const imageUrl = item.ImageUrl; 

        if (item.No) {
            const btn = document.createElement('div');
            btn.className = 'app-button';
            btn.innerHTML = `
                <img src="${imageUrl}" loading="lazy">
                <p>${title}</p>
            `;
            // クリックで詳細を開く
            btn.onclick = () => openModal(item);
            buttonGrid.appendChild(btn);
        }
    });

    updatePagination();
}

// --- 3. ページネーション制御 ---
function updatePagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

prevButton.onclick = () => {
    if (currentPage > 1) { currentPage--; renderButtons(); window.scrollTo(0,0); }
};
nextButton.onclick = () => {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; renderButtons(); window.scrollTo(0,0); }
};

// --- 4. 詳細モーダル表示 ---
function openModal(item) {
    currentItem = item;
    // モーダルを開くたびに和魂(N)にリセット
    currentSpirit = 'N'; 
    updateSpiritSwitcherUI();
    renderModalContent();
    
    modal.classList.remove('hidden');
}

// モーダル内のコンテンツを描画（言語・和魂/荒魂の状態に応じて更新）
function renderModalContent() {
    if (!currentItem) return;
    
    const item = currentItem;
    const isJP = currentLanguage === 'JP';
    const spirit = currentSpirit; // 'N' or 'A'
    
    // ▼▼▼ ラベル設定 ▼▼▼
    document.getElementById('label-desc').textContent       = isJP ? 'どんな方' : 'Profile';
    document.getElementById('label-prediction').textContent = isJP ? 'ささやき' : 'Whisper';
    document.getElementById('label-detail').textContent     = isJP ? '運勢詳細' : 'Fortune Details';
    document.getElementById('label-work').textContent       = isJP ? '仕事' : 'Work';
    document.getElementById('label-love').textContent       = isJP ? '恋愛' : 'Love';
    document.getElementById('label-money').textContent      = isJP ? '金運' : 'Money';
    document.getElementById('label-health').textContent     = isJP ? '健康' : 'Health'; // 中級追加
    document.getElementById('label-advice').textContent     = isJP ? '示唆の言葉' : 'Advice';
    
    // 聖地関連
    document.getElementById('label-location').textContent   = isJP ? '聖地・所在地' : 'Holy Site & Location';
    document.getElementById('label-prefecture').textContent = isJP ? '都道府県：' : 'Prefecture:';
    document.getElementById('label-holysite').textContent   = isJP ? '聖地：' : 'Holy Site:';

    // 和魂/荒魂の説明文更新
    const spiritDesc = document.getElementById('spirit-desc-text');
    if (spirit === 'N') {
        spiritDesc.textContent = isJP ? '和魂（にぎみたま）：穏やかな働き・調和・平和' : 'Nigi-mitama: Gentle, harmonious spirit.';
    } else {
        spiritDesc.textContent = isJP ? '荒魂（あらみたま）：活発な働き・勇気・変革' : 'Ara-mitama: Active, brave, transformative spirit.';
    }

    // 基本情報
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;
    document.getElementById('modal-no').textContent = `No.${item.No}`;
    
    // 属性 (共通)
    document.getElementById('modal-element').textContent = item.Elements || '-';
    document.getElementById('modal-direction').textContent = item.Direction || '-';

    // 1. どんな方 (共通: DeityDesc)
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;
    
    // ★★★ 中級のキモ：M_N_ と M_A_ の分岐 ★★★
    // 2. ささやき (M_N_General / M_A_General)
    const keyGeneral = `M_${spirit}_General_${currentLanguage}`;
    document.getElementById('modal-m-general').textContent = item[keyGeneral] || '-';
    
    // 3. 詳細 (Work, Love, Money, Health)
    // カラム例: M_N_Interp_Work_JP
    const keyWork   = `M_${spirit}_Interp_Work_${currentLanguage}`;
    const keyLove   = `M_${spirit}_Interp_Love_${currentLanguage}`;
    const keyMoney  = `M_${spirit}_Interp_Money_${currentLanguage}`;
    const keyHealth = `M_${spirit}_Interp_Health_${currentLanguage}`; // 中級追加

    document.getElementById('modal-work').textContent   = item[keyWork] || '-';
    document.getElementById('modal-love').textContent   = item[keyLove] || '-';
    document.getElementById('modal-money').textContent  = item[keyMoney] || '-';
    document.getElementById('modal-health').textContent = item[keyHealth] || '-';

    // 4. 示唆の言葉 (S: Short/Summary) -> M_N_S / M_A_S
    const keyS = `M_${spirit}_S_${currentLanguage}`;
    document.getElementById('modal-m-s').textContent = item[keyS] || '-';

    // 聖地情報 (共通)
    const prefectureEl = document.getElementById('modal-prefecture');
    const holySiteLink = document.getElementById('modal-holysite-link');

    prefectureEl.textContent = (isJP ? item.Prefecture_JP : item.Prefecture_EN) || '-';
    const holySiteName = (isJP ? item.Holysite_JP : item.Holysite_EN) || '-';
    holySiteLink.textContent = holySiteName;

    if (item.BlogUrl) {
        holySiteLink.href = item.BlogUrl;
        holySiteLink.classList.remove('no-link'); 
    } else {
        holySiteLink.href = 'javascript:void(0)';
        holySiteLink.classList.add('no-link');
    }
}

// 和魂/荒魂の切り替え
window.switchSpirit = (type) => {
    if (currentSpirit === type) return;
    currentSpirit = type;
    updateSpiritSwitcherUI();
    renderModalContent(); // 内容更新
};

function updateSpiritSwitcherUI() {
    const btnN = document.getElementById('spirit-n');
    const btnA = document.getElementById('spirit-a');
    
    if (currentSpirit === 'N') {
        btnN.classList.add('active');
        btnA.classList.remove('active');
        // 背景色などを穏やかに戻す演出を入れても良い
    } else {
        btnN.classList.remove('active');
        btnA.classList.add('active');
    }
}

// モーダルを閉じる
closeButton.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

// --- 5. 言語切替 ---
function setLanguage(lang) {
    currentLanguage = lang;
    langJPButton.classList.toggle('active', lang === 'JP');
    langENButton.classList.toggle('active', lang === 'EN');
    renderButtons(); // 一覧再描画 (タイトル言語変更のため)
    if (!modal.classList.contains('hidden')) {
        renderModalContent(); // モーダルが開いていれば中身も更新
    }
}
langJPButton.onclick = () => setLanguage('JP');
langENButton.onclick = () => setLanguage('EN');

// --- 6. スワイプ操作 ---
document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50;
    // モーダルが開いていない時のみページ送り
    if (modal.classList.contains('hidden')) {
        if (touchEndX < touchStartX - threshold) nextButton.click(); 
        if (touchEndX > touchStartX + threshold) prevButton.click();
    }
}

// アプリ開始
document.addEventListener('DOMContentLoaded', initApp);