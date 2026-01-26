let chain = [], input = "0", idx = -1, edit = false, resShown = false;
const MAX = 12;
const ui = { main: document.getElementById('cMain'), op: document.getElementById('cOp'), step: document.getElementById('cStep') };

function casio_num(n) {
    if(resShown) { chain = []; input = "0"; resShown = false; }
    if(input.length >= MAX) return;
    input = (input === "0" && n !== ".") ? n : input + n;
    render();
}

function casio_op(op) {
    if(resShown) { chain = [{v:chain[chain.length-1].v, o:op}]; resShown = false; input = chain[0].v; }
    else if(input !== "") { chain.push({v:input, o:op}); input = "0"; }
    render();
}

function casio_eq() {
    chain.push({v:input, o:'='});
    let res = eval(chain.reduce((a,c) => a + c.v + (c.o==='='?'':c.o.replace('x','*').replace('÷','/')), ""));
    chain.push({v:res, o:'ANS'});
    resShown = true; input = String(res);
    render();
}

function casio_AC() { chain = []; input = "0"; resShown = false; render(); }
function casio_del() { input = input.slice(0, -1) || "0"; render(); }

function render() {
    ui.main.innerText = input;
    ui.step.innerText = String(chain.length + (resShown?0:1)).padStart(2,'0');
    // More logic from previous code goes here if needed
}
// Note: Paste the full Casio Logic from previous response here
