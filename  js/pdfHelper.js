function loadPdfLib(callback) {
    if(typeof html2pdf !== 'undefined') { callback(); return; }
    let script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = callback;
    document.body.appendChild(script);
}

function generatePDF(title, contentHTML) {
    const btn = document.activeElement; 
    const oldText = btn.innerText; 
    btn.innerText = "WAIT...";
    
    loadPdfLib(() => {
        const date = new Date().toLocaleString();
        let finalHTML = `
            <div style="padding:20px; font-family:sans-serif; background:#fff; color:#000;">
                <h2 style="border-bottom:2px solid orange; text-align:center;">${title}</h2>
                <p style="text-align:center; color:#555; font-size:12px;">Generated: ${date}</p>
                <div style="margin-top:20px;">${contentHTML}</div>
            </div>
        `;
        html2pdf().from(finalHTML).save().then(() => { btn.innerText = oldText; });
    });
}
