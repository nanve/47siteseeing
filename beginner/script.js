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
        //const response = await fetch(GAS_API_URL);
        const response = await fetch(`${GAS_API_URL}?type=beginner`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        allData = data;
        renderButtons(); // ボタン描画
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
        // 言語に応じたタイトル
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

function openModal(item) {
    const isJP = currentLanguage === 'JP';
    
    // ▼▼▼ ラベル設定（色・数・五行を追加） ▼▼▼
    document.getElementById('label-desc').textContent       = isJP ? 'どんな方' : 'Profile';
    document.getElementById('label-prediction').textContent = isJP ? 'ささやき' : 'Whisper';
    document.getElementById('label-detail').textContent     = isJP ? '仕事・恋愛・金運' : 'Work, Love, Money';
    document.getElementById('label-work').textContent       = isJP ? '仕事' : 'Work';
    document.getElementById('label-love').textContent       = isJP ? '恋愛' : 'Love';
    document.getElementById('label-money').textContent      = isJP ? '金運' : 'Money';
    document.getElementById('label-advice').textContent     = isJP ? '示唆の言葉' : 'Advice';
    document.getElementById('label-location').textContent   = isJP ? '聖地・所在地' : 'Holy Site & Location';
    document.getElementById('label-prefecture').textContent = isJP ? '都道府県：' : 'Prefecture:';
    document.getElementById('label-holysite').textContent   = isJP ? '聖地：' : 'Holy Site:';

    // ★追加属性ラベル
    document.getElementById('label-no').textContent        = 'No.';
    document.getElementById('label-element').textContent   = isJP ? '五行' : 'Element';
    document.getElementById('label-color').textContent     = isJP ? '色' : 'Color';
    document.getElementById('label-direction').textContent = isJP ? '方位' : 'Direction';
    document.getElementById('label-number').textContent    = isJP ? '数霊' : 'Number';

    // 基本情報
    document.getElementById('modal-title').textContent = isJP ? item.Name_JP : item.Name_EN;
    document.getElementById('modal-image').src = item.ImageUrl;
    document.getElementById('modal-no').textContent = item.No; // Noだけシンプルに表示
    
    // ★属性データの取得 (初級は N_ 固定)
    // データがない場合はハイフン
    document.getElementById('modal-element').textContent   = item.N_Elements || '-';
    document.getElementById('modal-color').textContent     = item.N_Colors || '-';
    document.getElementById('modal-direction').textContent = item.N_Direction || '-';
    document.getElementById('modal-number').textContent    = item.N_Numbers || '-';

    // 1. どんな方
    document.getElementById('modal-desc').textContent = isJP ? item.DeityDesc_JP : item.DeityDesc_EN;
    
    // 2. ささやき
    document.getElementById('modal-b-general').textContent = isJP ? item.B_General_JP : item.B_General_EN;
    
    // 3. 詳細
    document.getElementById('modal-work').textContent = isJP ? item.B_Interp_Work_JP : item.B_Interp_Work_EN;
    document.getElementById('modal-love').textContent = isJP ? item.B_Interp_Love_JP : item.B_Interp_Love_EN;
    document.getElementById('modal-money').textContent = isJP ? item.B_Interp_Money_JP : item.B_Interp_Money_EN;

    // 4. 示唆
    document.getElementById('modal-b-cdn').textContent = isJP ? item.B_CDN_JP : item.B_CDN_EN;

    // 聖地
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

    modal.classList.remove('hidden');
}

// モーダルを閉じる
closeButton.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

// --- 5. 言語切替 ---
function setLanguage(lang) {
    currentLanguage = lang;
    langJPButton.classList.toggle('active', lang === 'JP');
    langENButton.classList.toggle('active', lang === 'EN');
    renderButtons(); // 一覧再描画
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
    if (touchEndX < touchStartX - threshold) nextButton.click(); // 左スワイプで次へ
    if (touchEndX > touchStartX + threshold) prevButton.click(); // 右スワイプで前へ
}

// アプリ開始
document.addEventListener('DOMContentLoaded', initApp);
