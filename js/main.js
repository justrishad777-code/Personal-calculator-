let activeInput = null, backTimer;

// Init
function appInit() {
    loadTheme();
    if(document.getElementById('bBoth')) setTab('both');
    setupBackspace();
}

// Menu
function toggleMenu() {
    const m = document.getElementById('menuPopup');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

// Theme
function updateVar(key, val) {
    let p = key==='bg'?'--bg-color':(key==='card'?'--card-bg':(key==='text'?'--text-main':'--'+key));
    document.documentElement.style.setProperty(p, val);
    saveTheme();
}
function saveTheme() {
    const t = {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
        // Save current values logic handled in settings page explicitly
    };
    // Simplified save for settings page calls
    const settings = {
        primary: document.getElementById('clr-primary')?.value,
        secondary: document.getElementById('clr-secondary')?.value,
        bg: document.getElementById('clr-bg')?.value,
        card: document.getElementById('clr-card')?.value,
        text: document.getElementById('clr-text')?.value
    };
    if(settings.primary) localStorage.setItem('gold_theme', JSON.stringify(settings));
}
function loadTheme() {
    if(localStorage.getItem('gold_theme')) {
        const t = JSON.parse(localStorage.getItem('gold_theme'));
        let root = document.documentElement;
        if(t.primary) root.style.setProperty('--primary', t.primary);
        if(t.secondary) root.style.setProperty('--secondary', t.secondary);
        if(t.bg) root.style.setProperty('--bg-color', t.bg);
        if(t.card) root.style.setProperty('--card-bg', t.card);
        if(t.text) root.style.setProperty('--text-main', t.text);
    }
}

// Keypad & Input
function focusField(el) {
    if(activeInput) activeInput.classList.remove('active-field');
    activeInput = el; activeInput.classList.add('active-field');
    document.getElementById('customKeypad').classList.add('show');
    let page = document.querySelector('.scrollable-page');
    if(page) page.style.paddingBottom = "400px";
    document.getElementById('menuPopup').style.display = 'none';
}
function closeKeypad() {
    document.getElementById('customKeypad').classList.remove('show');
    if(activeInput) activeInput.classList.remove('active-field');
    let page = document.querySelector('.scrollable-page');
    if(page) page.style.paddingBottom = "20px";
}
function press(key) {
    if(!activeInput) return;
    if(key === 'back') activeInput.value = activeInput.value.slice(0, -1);
    else { if(key === '.' && activeInput.value.includes('.')) return; activeInput.value += key; }
    
    if(typeof calc === 'function' && document.getElementById('screenRate')) calc();
    if(typeof gToV === 'function' && activeInput.id === 'cv_g') gToV();
    if(typeof vToG === 'function' && activeInput.id !== 'cv_g') vToG();
}
function setupBackspace() {
    const btn = document.getElementById('btn-back');
    if(!btn) return;
    const start = () => { press('back'); backTimer = setInterval(() => press('back'), 150); };
    const stop = () => clearInterval(backTimer);
    btn.addEventListener('mousedown', start); btn.addEventListener('touchstart', start, {passive:true});
    window.addEventListener('mouseup', stop); window.addEventListener('touchend', stop);
}

// PDF
function downloadPDF(type) {
    const btn = document.activeElement; 
    const oldText = btn.innerText; btn.innerText = "WAIT...";
    
    // Check if lib exists, if not dynamic load
    if(typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => runPdfGen(type, btn, oldText);
        document.body.appendChild(script);
    } else {
        runPdfGen(type, btn, oldText);
    }
}

function runPdfGen(type, btn, oldText) {
    const date = new Date().toLocaleString();
    let s = `style="padding:20px; font-family:sans-serif; background:#fff; color:#000;"`;
    let content = '';
    if(type === 'converter') {
        content = `<div ${s}><h2 style="border-bottom:2px solid orange;">WEIGHT REPORT</h2><p>${date}</p><h3>Grams: ${document.getElementById('cv_g').value}</h3><p>Vori: ${document.getElementById('res_v').value} | Ana: ${document.getElementById('res_a').value}</p></div>`;
    } else {
        content = `<div ${s}><h2 style="border-bottom:2px solid orange;">INVOICE</h2><p>Date: ${date}</p><p>Customer: ${document.getElementById('cName').value}</p><h3>Total: ${document.getElementById('grandTotal').innerText}</h3><p>Auth By: ${document.getElementById('authName').value}</p></div>`;
    }
    html2pdf().from(content).save().then(() => btn.innerText = oldText);
}
