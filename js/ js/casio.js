let casio_tape = [], casio_chain = [], casio_input = "0";
let casio_idx = -1, casio_edit = false, casio_resShown = false, casio_interim = false;
const C_MAX = 12;
const c_ui = { main: document.getElementById('cMain'), op: document.getElementById('cOp'), step: document.getElementById('cStep'), mode: document.getElementById('cMode'), list: document.getElementById('casioListBody') };

function casio_init() {
    if(localStorage.getItem('gold_casio')) {
        try { let d = JSON.parse(localStorage.getItem('gold_casio')); casio_tape = d.tape || []; } catch(e) { localStorage.removeItem('gold_casio'); }
    }
    casio_chain = []; casio_input = "0"; casio_idx = -1; casio_edit = false; casio_resShown = false; casio_interim = false;
    if(c_ui.main) casio_render(); 
    if(c_ui.list) casio_list();
}

function casio_num(n) {
    if(casio_edit) { if(casio_input.replace('.','').length >= C_MAX) return; if(casio_input === "0" && n !== '.') casio_input = n; else if(n === '.' && casio_input.includes('.')) return; else casio_input += n; casio_render(); return; }
    if(casio_idx !== -1) casio_AC();
    if(casio_resShown || casio_interim) { if(casio_resShown) casio_chain = []; casio_input = "0"; casio_resShown = false; casio_interim = false; }
    if(casio_input.replace('.','').length >= C_MAX) return;
    if(casio_input === "0" && n !== '.') casio_input = n; else if(n === '.' && casio_input.includes('.')) return; else casio_input += n;
    casio_render();
}

function casio_op(op) {
    if(casio_edit) return; if(casio_idx !== -1) casio_AC();
    if(casio_interim && !casio_resShown) { if(casio_chain.length > 0) { casio_chain[casio_chain.length-1].o = op; casio_render(); return; } }
    if(casio_resShown) { let lv = casio_chain[casio_chain.length-1].v; casio_chain = [{v:lv, o:op}]; casio_resShown = false; casio_input = lv; } else { if(casio_input !== "") casio_chain.push({v:casio_input, o:op}); }
    if(casio_chain.length >= 1) { let rt = casio_calc(casio_chain); if(rt !== "Error") { casio_input = String(rt); casio_interim = true; } } else { casio_interim = true; }
    casio_render();
}

function casio_eq() {
    if(casio_edit) { casio_finishCorr(); return; } if(casio_idx !== -1) return;
    if(!casio_interim) casio_chain.push({v:casio_input, o:'='}); else if(casio_chain.length>0) casio_chain[casio_chain.length-1].o='=';
    let res = casio_calc(casio_chain); casio_chain.push({v:String(res), o:'ANS'});
    casio_tape.push([...casio_chain]); casio_save();
    casio_resShown = true; casio_interim = false; casio_input = String(res);
    casio_render(); casio_list();
}

function casio_AC() { casio_chain = []; casio_input = "0"; casio_idx = -1; casio_edit = false; casio_resShown = false; casio_interim = false; casio_render(); }
function casio_del() { if(!casio_edit && casio_idx !== -1) return; if(casio_interim || casio_resShown) return; casio_input = casio_input.toString().slice(0, -1); if(casio_input === "") casio_input = "0"; casio_render(); }

function casio_calc(chain) {
    let e = ""; for(let s of chain) { if(s.o === 'ANS') continue; e += s.v; let o = s.o; if(o === '=') continue; if(o === 'x' || o === 'X') o = '*'; if(o === '÷') o = '/'; if(o === '%') o = '/100*'; e += o; }
    if("+-*/".includes(e.slice(-1))) e = e.slice(0,-1);
    try { return parseFloat(eval(e).toPrecision(12)); } catch(err) { return "Error"; }
}

function casio_prev() { if(casio_chain.length === 0) { if(casio_tape.length>0) { casio_chain = casio_tape[casio_tape.length-1]; casio_idx = casio_chain.length-1; } else return; } else { if(casio_idx === -1) casio_idx = casio_chain.length-1; else if(casio_idx > 0) casio_idx--; } casio_edit = false; casio_render(); }
function casio_next() { if(casio_chain.length === 0 || casio_idx === -1) return; if(casio_idx < casio_chain.length-1) casio_idx++; casio_edit = false; casio_render(); }
function casio_toggleDrawer() { document.getElementById('casioDrawer').classList.toggle('open'); }
function casio_correct() { if(casio_idx === -1) return; if(casio_chain[casio_idx].o === 'ANS') return; casio_edit = true; casio_input = casio_chain[casio_idx].v; casio_render(); }
function casio_finishCorr() { casio_chain[casio_idx].v = casio_input; let rc = casio_chain.filter(s => s.o !== 'ANS'); let nr = casio_calc(rc); rc.push({v:String(nr), o:'ANS'}); casio_chain = rc; casio_save(); casio_edit = false; casio_input = "0"; casio_render(); }

function casio_render() {
    let dv = "0", dop = "", sn = 0, dm = "none", clr = "#fff";
    if(casio_edit) { dv = casio_input; dop = "EDIT"; sn = casio_idx+1; dm = "block"; c_ui.mode.innerText = "CRT"; c_ui.mode.style.color = "#ff9f43"; clr = "#ff9f43"; }
    else if(casio_idx !== -1) { let s = casio_chain[casio_idx]; dv = s.v; if(s.o === 'ANS') dop = "="; else { dop = s.o.replace('*','×').replace('/','÷'); if(dop === '=') dop = ""; } sn = casio_idx+1; dm = "block"; c_ui.mode.innerText = "REP"; c_ui.mode.style.color = "#0abde3"; } 
    else { dv = casio_input; if(casio_chain.length > 0) { if(casio_interim || casio_input === "0") dop = casio_chain[casio_chain.length-1].o.replace('*','×').replace('/','÷'); } sn = casio_chain.length; if(!casio_interim && !casio_resShown) sn++; }
    c_ui.main.innerText = c_fmt(dv); c_ui.main.style.color = clr; c_ui.op.innerText = dop; c_ui.step.innerText = String(sn).padStart(2, '0'); c_ui.mode.style.display = dm;
    c_resize();
}
function c_fmt(n) { if(n==="Error") return n; let s=String(n), p=s.split('.'), i=p[0].replace(/,/g,''); if(!isNaN(i)) { let l3=i.slice(-3), o=i.slice(0,-3); if(o) l3=','+l3; i=o.replace(/\B(?=(\d{2})+(?!\d))/g, ",")+l3; } return i + (p[1]?'.'+p[1]:''); }
function c_resize() { let b = document.querySelector('.casio-main-box'), t = c_ui.main, s = 80; t.style.fontSize = s+'px'; while(t.scrollWidth > b.clientWidth && s > 30) { s-=5; t.style.fontSize = s+'px'; } }
function casio_save() { localStorage.setItem('gold_casio', JSON.stringify({tape:casio_tape, active:casio_chain})); }
function casio_list() { let h=""; casio_tape.slice().reverse().forEach(c => { let e="", r="0"; c.forEach(s => { if(s.o === 'ANS') r=s.v; else e+=s.v+(s.o==='='?'':s.o); }); h+=`<div class="casio-d-row"><span>${e}=</span><b>${c_fmt(r)}</b></div>`; }); c_ui.list.innerHTML = h||"<div style='text-align:center;color:#555;margin-top:20px;'>Empty Tape</div>"; }
      
