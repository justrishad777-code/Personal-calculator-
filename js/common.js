// Load Theme on Startup
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
});

function toggleMenu() {
    const m = document.getElementById('menuPopup');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function loadTheme() {
    if(localStorage.getItem('gold_theme')) {
        const t = JSON.parse(localStorage.getItem('gold_theme'));
        updateCssVar('primary', t.primary);
        updateCssVar('secondary', t.secondary);
        updateCssVar('bg', t.bg);
        updateCssVar('card', t.card);
        updateCssVar('text', t.text);
    }
}

function updateCssVar(key, val) {
    let prop = key === 'bg' ? '--bg-color' : (key === 'card' ? '--card-bg' : (key === 'text' ? '--text-main' : '--'+key));
    document.documentElement.style.setProperty(prop, val);
}
