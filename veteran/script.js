// ==========================================
// ★GASのURL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz1_u_9EHlQxqVgwEDffCiwqdbFWbNaubS5PgzYGVJr2wdXF817MiHxxra8jYAahFd3_g/exec'; 
// ==========================================

// ★上級用設定
const AUTH_TYPE = 'veteran';

const buttonGrid = document.querySelector('.button-grid');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const langJPButton = document.getElementById('lang-jp');
const langENButton = document.getElementById('lang-en');
const modal = document.getElementById('detail-modal');
const closeButton = document.querySelector('.close-button');

// 設定値
let allData = [];
const itemsPerPage = 6;
let currentPage = 1;
let currentLanguage = 'JP';
let currentSpirit = 'N'; 
let currentItem = null;

let touchStartX = 0;
let touchEndX = 0;

// ▼▼▼ 1. 認証機能 ▼▼▼
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem(`site_auth_${AUTH_TYPE}`);
    if (savedKey) {
        document.getElementById('auth-password').value = savedKey;
        authenticateUser(); 
    }
});

async function authenticateUser() {
    const inputKey = document.getElementById('auth-password').value;
    const errorMsg = document.getElementById('auth-error');
    const overlay = document.getElementById('auth-overlay');

    if (!inputKey) {
        errorMsg.textContent = "パスワードを入力してください";
        return;
    }

    errorMsg.textContent = "認証中...";
    
    try {
        const url = `${GAS_API_URL}?type=${AUTH_TYPE}&key=${encodeURIComponent(inputKey)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error === "AuthFailed") {
            errorMsg.textContent = "パスワードが違います。";
            localStorage.removeItem(`site_auth_${AUTH_TYPE}`); 
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            localStorage.setItem(`site_auth_${AUTH_TYPE}`, inputKey);
            overlay.style.display = 'none'; 
            allData = data;
            renderButtons(); 
        }
    } catch (e) {
        console.error(e);
        errorMsg.textContent = "通信エラーが発生しました。";
    }
}

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
            btn.onclick = () => openModal(item);
            buttonGrid.appendChild(btn);
        }
    });
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

prevButton.onclick = () => { if (currentPage > 1) { currentPage--; renderButtons(); window.scrollTo(0,0); } };
nextButton.onclick = () => { const totalPages = Math.ceil(allData.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; renderButtons(); window.scrollTo(0,0); } };

function openModal(item) {
    currentItem = item;
    currentSpirit = 'N'; 
    updateSpiritSwitcherUI();
    renderModalContent();
    modal.classList.remove('hidden');
}

function renderModalContent() {
    if (!currentItem) return;
    
    const item = currentItem;
    const isJP = currentLanguage === 'JP';
    const spirit = currentSpirit; 
    const langSuffix = isJP ? '_JP' : '_EN';

    // ラベル設定
    document.getElementById('label-desc').textContent       = isJP ? '御由緒' : 'History';
    document.getElementById('label-attributes').textContent = isJP ? '神性属性データ' : 'Divine Attributes';
    document.getElementById('label-prediction').textContent = isJP ? '神託（General）' : 'Oracle (General)';
    document.getElementById('label-detail').textContent     = isJP ? '詳細解釈' : 'Detailed Interpretation';
    document.getElementById('label-core-message').textContent = isJP ? '御神勅 (Core Message)' : 'Core Message';
    
    document.getElementById('label-work').textContent   = isJP ? '仕事' : 'Work';
    document.getElementById('label-love').textContent   = isJP ? '恋愛' : 'Love';
    document.getElementById('label-money').textContent  = isJP ? '金運' : 'Money';
    document.getElementById('label-health').textContent = isJP ? '健康' : 'Health';

    document.getElementById('label-color').textContent     = isJP ? '色' : 'Color';
    document.getElementById('label-element').textContent   = isJP ? '五行' : 'Element';
    document.getElementById('label-season').textContent    = isJP ? '季節' : 'Season';
    document.getElementById('label-time').textContent      = isJP ? '時間' : 'Time';
    document.getElementById('label-direction').textContent = isJP ? '方位' : 'Direction';
    document.getElementById('label-number').textContent    = isJP ? '数霊' : 'Number';

    document.getElementById('label-location').textContent   = isJP ? '都道府県・御鎮守' : 'Prefecture & Shrine';
    document.getElementById('label-prefecture').textContent = isJP ? '都道府県：' : 'Prefecture:';
    document.getElementById('label-holysite').textContent   = isJP ? '御鎮守：' : 'Shrine:';

    // スピリット説明
    const spiritDesc = document.getElementById('spirit-desc-text');
    if (spirit === 'N') {
        spiritDesc.textContent = isJP ? '和魂（にぎみたま）：調和・平穏・継続' : 'Nigi-mitama: Harmony, Peace, Continuity';
    } else {
        spiritDesc.textContent = isJP ? '荒魂（あらみたま）：変革・勇気・突破' : 'Ara-mitama: Change, Courage, Breakthrough';
    }

    // 基本ヘッダー
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;

    // キーワード生成
    const keywordsContainer = document.getElementById('modal-keywords');
    keywordsContainer.innerHTML = ''; 
    keywordsContainer.classList.toggle('ara-mode', spirit === 'A');

    for (let i = 1; i <= 5; i++) {
        const key = `${spirit}_Keyword_${i}${langSuffix}`;
        const val = item[key];
        if (val) {
            const span = document.createElement('span');
            span.className = 'keyword-tag';
            span.textContent = val;
            keywordsContainer.appendChild(span);
        }
    }

    // メタデータ
    function getMeta(baseKey) {
        if (item[baseKey]) return item[baseKey];
        return '-';
    }
    document.getElementById('modal-meta-color').textContent     = getMeta(`${spirit}_Colors`);
    document.getElementById('modal-meta-element').textContent   = getMeta(`${spirit}_Elements`);
    document.getElementById('modal-meta-season').textContent    = getMeta(`${spirit}_Seasons`);
    document.getElementById('modal-meta-time').textContent      = getMeta(`${spirit}_Time`);
    document.getElementById('modal-meta-direction').textContent = getMeta(`${spirit}_Direction`);
    document.getElementById('modal-meta-number').textContent    = getMeta(`${spirit}_Numbers`);

    // ★御由緒の表示 (ここが不足していました)
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;

    // 詳細解釈
    const keyGen    = `V_${spirit}_General${langSuffix}`;
    const keyWork   = `V_${spirit}_Interp_Work${langSuffix}`;
    const keyLove   = `V_${spirit}_Interp_Love${langSuffix}`;
    const keyMoney  = `V_${spirit}_Interp_Money${langSuffix}`;
    const keyHealth = `V_${spirit}_Interp_Health${langSuffix}`;
    const keyCore   = `V_${spirit}_5${langSuffix}`; 

    document.getElementById('modal-v-general').textContent = item[keyGen] || '-';
    document.getElementById('modal-work').textContent      = item[keyWork] || '-';
    document.getElementById('modal-love').textContent      = item[keyLove] || '-';
    document.getElementById('modal-money').textContent     = item[keyMoney] || '-';
    document.getElementById('modal-health').textContent    = item[keyHealth] || '-';
    document.getElementById('modal-v-5').textContent       = item[keyCore] || '-';

    // 場所（御鎮守）
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

window.switchSpirit = (type) => {
    if (currentSpirit === type) return;
    currentSpirit = type;
    updateSpiritSwitcherUI();
    renderModalContent();
};

function updateSpiritSwitcherUI() {
    const btnN = document.getElementById('spirit-n');
    const btnA = document.getElementById('spirit-a');
    if (currentSpirit === 'N') {
        btnN.classList.add('active');
        btnA.classList.remove('active');
    } else {
        btnN.classList.remove('active');
        btnA.classList.add('active');
    }
}

closeButton.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

function setLanguage(lang) {
    currentLanguage = lang;
    langJPButton.classList.toggle('active', lang === 'JP');
    langENButton.classList.toggle('active', lang === 'EN');
    renderButtons();
    if (!modal.classList.contains('hidden')) renderModalContent();
}
langJPButton.onclick = () => setLanguage('JP');
langENButton.onclick = () => setLanguage('EN');

document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (modal.classList.contains('hidden')) {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) nextButton.click(); 
        if (touchEndX > touchStartX + threshold) prevButton.click();
    }
});