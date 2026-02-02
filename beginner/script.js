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

// 設定値
let allData = [];
const itemsPerPage = 6;
let currentPage = 1;
let currentLanguage = 'JP';

// スワイプ用変数
let touchStartX = 0;
let touchEndX = 0;

// --- 1. データ取得と初期化 ---
async function initApp() {
    try {
        // type=beginner を指定してパスワードなしで取得
        const response = await fetch(`${GAS_API_URL}?type=beginner`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        allData = data;
        renderButtons(); 
    } catch (error) {
        console.error('Error:', error);
        buttonGrid.innerHTML = '<p style="padding:20px; text-align:center;">データの読み込みに失敗しました。</p>';
    }
}

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
    const isJP = currentLanguage === 'JP';
    const langSuffix = isJP ? '_JP' : '_EN';
    
    // ▼▼▼ ラベル設定（変更済み） ▼▼▼
    document.getElementById('label-desc').textContent       = isJP ? '御由緒' : 'History';
    document.getElementById('label-prediction').textContent = isJP ? 'ささやき' : 'Whisper';
    document.getElementById('label-detail').textContent     = isJP ? '仕事・恋愛・金運' : 'Work, Love, Money';
    document.getElementById('label-work').textContent       = isJP ? '仕事' : 'Work';
    document.getElementById('label-love').textContent       = isJP ? '恋愛' : 'Love';
    document.getElementById('label-money').textContent      = isJP ? '金運' : 'Money';
    document.getElementById('label-advice').textContent     = isJP ? '示唆の言葉' : 'Advice';
    
    // 場所ラベル
    document.getElementById('label-location').textContent   = isJP ? '都道府県・御鎮守' : 'Prefecture & Shrine';
    document.getElementById('label-prefecture').textContent = isJP ? '都道府県：' : 'Prefecture:';
    document.getElementById('label-holysite').textContent   = isJP ? '御鎮守：' : 'Shrine:';

    // 属性ラベル
    document.getElementById('label-color').textContent     = isJP ? '色' : 'Color';
    document.getElementById('label-direction').textContent = isJP ? '方位' : 'Direction';
    document.getElementById('label-number').textContent    = isJP ? '数霊' : 'Number';

    // 基本情報
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;
    
    // キーワード生成
    const keywordsContainer = document.getElementById('modal-keywords');
    keywordsContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const key = `N_Keyword_${i}${langSuffix}`; 
        const val = item[key];
        if (val) {
            const span = document.createElement('span');
            span.className = 'keyword-tag';
            span.textContent = val;
            keywordsContainer.appendChild(span);
        }
    }
    
    // 属性データ
    document.getElementById('modal-color').textContent     = item.N_Colors || '-';
    document.getElementById('modal-direction').textContent = item.N_Direction || '-';
    document.getElementById('modal-number').textContent    = item.N_Numbers || '-';

    // テキスト
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;
    document.getElementById('modal-b-general').textContent = isJP ? item.B_General_JP : item.B_General_EN;
    
    document.getElementById('modal-work').textContent = isJP ? item.B_Interp_Work_JP : item.B_Interp_Work_EN;
    document.getElementById('modal-love').textContent = isJP ? item.B_Interp_Love_JP : item.B_Interp_Love_EN;
    document.getElementById('modal-money').textContent = isJP ? item.B_Interp_Money_JP : item.B_Interp_Money_EN;

    document.getElementById('modal-b-cdn').textContent = isJP ? item.B_CDN_JP : item.B_CDN_EN;

    // 場所・リンク
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

    // ★ブログボタンの制御
    const blogBtn = document.getElementById('modal-blog-btn');
    if (item.BlogUrl) {
        blogBtn.href = item.BlogUrl;
        blogBtn.style.display = 'inline-block';
    } else {
        blogBtn.style.display = 'none';
    }

    modal.classList.remove('hidden');
}

closeButton.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

function setLanguage(lang) {
    currentLanguage = lang;
    langJPButton.classList.toggle('active', lang === 'JP');
    langENButton.classList.toggle('active', lang === 'EN');
    renderButtons();
    if (!modal.classList.contains('hidden')) {
        // 必要なら再描画
    }
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

document.addEventListener('DOMContentLoaded', initApp);