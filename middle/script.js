// ==========================================
// ★ここにGASのウェブアプリURLを貼り付けてください
// (上級と同じ最新のURLであることを確認してください)
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz1_u_9EHlQxqVgwEDffCiwqdbFWbNaubS5PgzYGVJr2wdXF817MiHxxra8jYAahFd3_g/exec'; 
// ==========================================

// ★中級用の設定（ここが 'middle' になっている必要があります）
const AUTH_TYPE = 'middle';

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
let currentSpirit = 'N'; // 'N'=和魂, 'A'=荒魂
let currentItem = null;

let touchStartX = 0;
let touchEndX = 0;

// ▼▼▼ 1. 認証機能 ▼▼▼
document.addEventListener('DOMContentLoaded', () => {
    // 以前ログイン済みかチェック
    const savedKey = localStorage.getItem(`site_auth_${AUTH_TYPE}`);
    if (savedKey) {
        document.getElementById('auth-password').value = savedKey;
        authenticateUser(); // 自動ログイン試行
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
        // GASにパスワードを送る (type=middle)
        const url = `${GAS_API_URL}?type=${AUTH_TYPE}&key=${encodeURIComponent(inputKey)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error === "AuthFailed") {
            errorMsg.textContent = "パスワードが違います。";
            localStorage.removeItem(`site_auth_${AUTH_TYPE}`); 
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            // 成功
            localStorage.setItem(`site_auth_${AUTH_TYPE}`, inputKey);
            overlay.style.display = 'none'; // ロック画面を消す
            allData = data;
            renderButtons(); 
        }
    } catch (e) {
        console.error(e);
        errorMsg.textContent = "通信エラーが発生しました。";
    }
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// --- 2. ボタン一覧の描画 ---
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

// --- 3. ページネーション制御 ---
function updatePagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

prevButton.onclick = () => { if (currentPage > 1) { currentPage--; renderButtons(); window.scrollTo(0,0); } };
nextButton.onclick = () => { const totalPages = Math.ceil(allData.length / itemsPerPage); if (currentPage < totalPages) { currentPage++; renderButtons(); window.scrollTo(0,0); } };

// --- 4. 詳細モーダル表示 ---
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
    const spirit = currentSpirit; // 'N' or 'A'
    const langSuffix = isJP ? '_JP' : '_EN';

    // ラベル設定
    document.getElementById('label-desc').textContent       = isJP ? '御由緒' : 'History';
    document.getElementById('label-prediction').textContent = isJP ? 'ささやき' : 'Whisper';
    document.getElementById('label-detail').textContent     = isJP ? '運勢詳細' : 'Fortune Details';
    document.getElementById('label-work').textContent       = isJP ? '仕事' : 'Work';
    document.getElementById('label-love').textContent       = isJP ? '恋愛' : 'Love';
    document.getElementById('label-money').textContent      = isJP ? '金運' : 'Money';
    document.getElementById('label-health').textContent     = isJP ? '健康' : 'Health'; 
    document.getElementById('label-advice').textContent     = isJP ? '示唆の言葉' : 'Advice';
    document.getElementById('label-location').textContent   = isJP ? '都道府県・御鎮守' : 'Prefecture & Shrine';
    document.getElementById('label-prefecture').textContent = isJP ? '都道府県：' : 'Prefecture:';
    document.getElementById('label-holysite').textContent   = isJP ? '御鎮守：' : 'Shrine:';

    // 属性ラベル
    document.getElementById('label-no').textContent        = 'No.';
    document.getElementById('label-element').textContent   = isJP ? '五行' : 'Element';
    document.getElementById('label-color').textContent     = isJP ? '色' : 'Color';
    document.getElementById('label-direction').textContent = isJP ? '方位' : 'Direction';
    document.getElementById('label-number').textContent    = isJP ? '数霊' : 'Number';

    // スピリット説明
    const spiritDesc = document.getElementById('spirit-desc-text');
    if (spirit === 'N') {
        spiritDesc.textContent = isJP ? '和魂（にぎみたま）：穏やかな働き・調和・平和' : 'Nigi-mitama: Gentle, harmonious spirit.';
    } else {
        spiritDesc.textContent = isJP ? '荒魂（あらみたま）：活発な働き・勇気・変革' : 'Ara-mitama: Active, brave, transformative spirit.';
    }

    // 基本情報
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;
    document.getElementById('modal-no').textContent = item.No;

    // ★キーワード生成
    const keywordsContainer = document.getElementById('modal-keywords');
    keywordsContainer.innerHTML = '';
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

    // ★属性データ取得
    function getAttr(keySuffix) {
        return item[`${spirit}_${keySuffix}`] || '-';
    }
    document.getElementById('modal-element').textContent   = getAttr('Elements');
    document.getElementById('modal-color').textContent     = getAttr('Colors');
    document.getElementById('modal-direction').textContent = getAttr('Direction');
    document.getElementById('modal-number').textContent    = getAttr('Numbers');

    // テキスト情報
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;
    const keyGeneral = `M_${spirit}_General_${currentLanguage}`;
    document.getElementById('modal-m-general').textContent = item[keyGeneral] || '-';
    
    // 詳細
    document.getElementById('modal-work').textContent   = item[`M_${spirit}_Interp_Work_${currentLanguage}`] || '-';
    document.getElementById('modal-love').textContent   = item[`M_${spirit}_Interp_Love_${currentLanguage}`] || '-';
    document.getElementById('modal-money').textContent  = item[`M_${spirit}_Interp_Money_${currentLanguage}`] || '-';
    document.getElementById('modal-health').textContent = item[`M_${spirit}_Interp_Health_${currentLanguage}`] || '-';

    // 示唆
    const keyS = `M_${spirit}_S_${currentLanguage}`;
    document.getElementById('modal-m-s').textContent = item[keyS] || '-';

    // 場所
    document.getElementById('modal-prefecture').textContent = (isJP ? item.Prefecture_JP : item.Prefecture_EN) || '-';
    const holySiteName = (isJP ? item.Holysite_JP : item.Holysite_EN) || '-';
    const holySiteLink = document.getElementById('modal-holysite-link');
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