import { useState, useEffect, useCallback } from "react";

const API = "https://script.google.com/macros/s/AKfycbwatt79SXecAZZUwW72ximmM4dpKRRThwY_ya9ZVcaPZZ4I0zticzpEBIogXuBBXqgBfg/exec";

async function dbGet() {
  try { const r = await fetch(`${API}?action=get`); return JSON.parse(await r.text() || "{}"); }
  catch { return {}; }
}
async function dbSet(data) {
  try { await fetch(`${API}?action=set&data=${encodeURIComponent(JSON.stringify(data))}`); return true; }
  catch { return false; }
}

// ── FECHA LÍMITE ──────────────────────────────────────────────────────────────
// 10 junio 2026 23:59 hora CDMX = 11 junio 05:00 UTC
const DEADLINE = new Date("2026-06-11T05:00:00Z");
const isPastDeadline = () => new Date() >= DEADLINE;
const canSeeOthers   = () => new Date() >= DEADLINE;

// ── GRUPOS ────────────────────────────────────────────────────────────────────
const GRUPOS = {
  A: ["Mexico","Sudafrica","Corea del Sur","Chequia"],
  B: ["Canada","Bosnia y Herz.","Catar","Suiza"],
  C: ["Brasil","Marruecos","Escocia","Haiti"],
  D: ["EE.UU.","Paraguay","Australia","Turquia"],
  E: ["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F: ["Paises Bajos","Japon","Suecia","Tunez"],
  G: ["Belgica","Egipto","Iran","Nueva Zelanda"],
  H: ["Espana","Cabo Verde","Arabia Saudita","Uruguay"],
  I: ["Francia","Senegal","Iraq","Noruega"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","RD del Congo","Uzbekistan","Colombia"],
  L: ["Inglaterra","Croacia","Ghana","Panama"],
};

// Fechas reales oficiales FIFA — hora CDMX (ET-1h)
const MATCH_INFO = {
  // GRUPO A
  1: { date:"11 Jun", time:"14:00", venue:"Azteca, CDMX" },
  2: { date:"11 Jun", time:"21:00", venue:"Akron, Guadalajara" },
  3: { date:"18 Jun", time:"20:00", venue:"Akron, Guadalajara" },
  4: { date:"18 Jun", time:"11:00", venue:"Atlanta" },
  5: { date:"24 Jun", time:"20:00", venue:"Azteca, CDMX" },
  6: { date:"24 Jun", time:"20:00", venue:"BBVA, Monterrey" },
  // GRUPO B
  7: { date:"12 Jun", time:"14:00", venue:"Toronto" },
  8: { date:"13 Jun", time:"14:00", venue:"Santa Clara" },
  9: { date:"18 Jun", time:"14:00", venue:"Los Angeles" },
  10:{ date:"18 Jun", time:"17:00", venue:"Vancouver" },
  11:{ date:"24 Jun", time:"14:00", venue:"Vancouver" },
  12:{ date:"24 Jun", time:"14:00", venue:"Seattle" },
  // GRUPO C
  13:{ date:"13 Jun", time:"17:00", venue:"MetLife, Nueva Jersey" },
  14:{ date:"13 Jun", time:"20:00", venue:"Boston" },
  15:{ date:"19 Jun", time:"17:00", venue:"Boston" },
  16:{ date:"19 Jun", time:"20:00", venue:"Philadelphia" },
  17:{ date:"24 Jun", time:"17:00", venue:"Miami" },
  18:{ date:"24 Jun", time:"17:00", venue:"Atlanta" },
  // GRUPO D
  19:{ date:"12 Jun", time:"20:00", venue:"SoFi, Los Angeles" },
  20:{ date:"13 Jun", time:"23:00", venue:"Vancouver" },
  21:{ date:"19 Jun", time:"14:00", venue:"Seattle" },
  22:{ date:"19 Jun", time:"23:00", venue:"Santa Clara" },
  23:{ date:"25 Jun", time:"21:00", venue:"SoFi, Los Angeles" },
  24:{ date:"25 Jun", time:"21:00", venue:"Santa Clara" },
  // GRUPO E
  25:{ date:"14 Jun", time:"12:00", venue:"Houston" },
  26:{ date:"14 Jun", time:"18:00", venue:"Philadelphia" },
  27:{ date:"20 Jun", time:"15:00", venue:"Toronto" },
  28:{ date:"20 Jun", time:"19:00", venue:"Kansas City" },
  29:{ date:"25 Jun", time:"15:00", venue:"MetLife, Nueva Jersey" },
  30:{ date:"25 Jun", time:"15:00", venue:"Philadelphia" },
  // GRUPO F
  31:{ date:"14 Jun", time:"15:00", venue:"Dallas" },
  32:{ date:"14 Jun", time:"21:00", venue:"BBVA, Monterrey" },
  33:{ date:"20 Jun", time:"12:00", venue:"Houston" },
  34:{ date:"20 Jun", time:"23:00", venue:"BBVA, Monterrey" },
  35:{ date:"25 Jun", time:"18:00", venue:"Dallas" },
  36:{ date:"25 Jun", time:"18:00", venue:"Kansas City" },
  // GRUPO G
  37:{ date:"15 Jun", time:"14:00", venue:"Seattle" },
  38:{ date:"15 Jun", time:"20:00", venue:"SoFi, Los Angeles" },
  39:{ date:"21 Jun", time:"14:00", venue:"SoFi, Los Angeles" },
  40:{ date:"21 Jun", time:"20:00", venue:"Vancouver" },
  41:{ date:"26 Jun", time:"22:00", venue:"Seattle" },
  42:{ date:"26 Jun", time:"22:00", venue:"Vancouver" },
  // GRUPO H
  43:{ date:"15 Jun", time:"11:00", venue:"Atlanta" },
  44:{ date:"15 Jun", time:"17:00", venue:"Miami" },
  45:{ date:"21 Jun", time:"11:00", venue:"Atlanta" },
  46:{ date:"21 Jun", time:"17:00", venue:"Miami" },
  47:{ date:"26 Jun", time:"19:00", venue:"Houston" },
  48:{ date:"26 Jun", time:"19:00", venue:"Akron, Guadalajara" },
  // GRUPO I
  49:{ date:"16 Jun", time:"14:00", venue:"MetLife, Nueva Jersey" },
  50:{ date:"16 Jun", time:"17:00", venue:"Boston" },
  51:{ date:"22 Jun", time:"16:00", venue:"Philadelphia" },
  52:{ date:"22 Jun", time:"19:00", venue:"MetLife, Nueva Jersey" },
  53:{ date:"26 Jun", time:"14:00", venue:"Boston" },
  54:{ date:"26 Jun", time:"14:00", venue:"Toronto" },
  // GRUPO J
  55:{ date:"16 Jun", time:"20:00", venue:"Kansas City" },
  56:{ date:"16 Jun", time:"23:00", venue:"Santa Clara" },
  57:{ date:"22 Jun", time:"12:00", venue:"Dallas" },
  58:{ date:"22 Jun", time:"22:00", venue:"Santa Clara" },
  59:{ date:"27 Jun", time:"21:00", venue:"Kansas City" },
  60:{ date:"27 Jun", time:"21:00", venue:"Dallas" },
  // GRUPO K
  61:{ date:"17 Jun", time:"12:00", venue:"Houston" },
  62:{ date:"17 Jun", time:"21:00", venue:"Azteca, CDMX" },
  63:{ date:"23 Jun", time:"12:00", venue:"Houston" },
  64:{ date:"23 Jun", time:"21:00", venue:"Akron, Guadalajara" },
  65:{ date:"27 Jun", time:"18:30", venue:"Miami" },
  66:{ date:"27 Jun", time:"18:30", venue:"Atlanta" },
  // GRUPO L
  67:{ date:"17 Jun", time:"15:00", venue:"Philadelphia" },
  68:{ date:"17 Jun", time:"18:00", venue:"Toronto" },
  69:{ date:"23 Jun", time:"15:00", venue:"Boston" },
  70:{ date:"23 Jun", time:"18:00", venue:"Toronto" },
  71:{ date:"27 Jun", time:"16:00", venue:"MetLife, Nueva Jersey" },
  72:{ date:"27 Jun", time:"16:00", venue:"Philadelphia" },
};

const FLAGS = {
  "Mexico":"mx","Sudafrica":"za","Corea del Sur":"kr","Chequia":"cz",
  "Canada":"ca","Bosnia y Herz.":"ba","Catar":"qa","Suiza":"ch",
  "Brasil":"br","Marruecos":"ma","Escocia":"gb-sct","Haiti":"ht",
  "EE.UU.":"us","Paraguay":"py","Australia":"au","Turquia":"tr",
  "Alemania":"de","Curazao":"cw","Costa de Marfil":"ci","Ecuador":"ec",
  "Paises Bajos":"nl","Japon":"jp","Suecia":"se","Tunez":"tn",
  "Belgica":"be","Egipto":"eg","Iran":"ir","Nueva Zelanda":"nz",
  "Espana":"es","Cabo Verde":"cv","Arabia Saudita":"sa","Uruguay":"uy",
  "Francia":"fr","Senegal":"sn","Iraq":"iq","Noruega":"no",
  "Argentina":"ar","Argelia":"dz","Austria":"at","Jordania":"jo",
  "Portugal":"pt","RD del Congo":"cd","Uzbekistan":"uz","Colombia":"co",
  "Inglaterra":"gb-eng","Croacia":"hr","Ghana":"gh","Panama":"pa",
};

const ADMIN_PASS = "mexico2026";

function buildMatches() {
  let id = 1; const list = [];
  for (const [grp, teams] of Object.entries(GRUPOS)) {
    const pairs = [
      [teams[0],teams[1]],[teams[2],teams[3]],
      [teams[0],teams[2]],[teams[1],teams[3]],
      [teams[0],teams[3]],[teams[1],teams[2]],
    ];
    for (const [local, visit] of pairs) list.push({ id: id++, grp, local, visit });
  }
  return list;
}
const ALL_MATCHES = buildMatches();
const isMex = (m) => m.local === "Mexico" || m.visit === "Mexico";
const TOTAL_MATCHES = ALL_MATCHES.length; // 72

function calcPoints(pred, real, mexMatch) {
  if (!pred || !real) return null;
  if (mexMatch) {
    const [pL, pV] = Array.isArray(pred) ? pred : [null,null];
    const [rL, rV] = real;
    if (pL===""||pV===""||rL===""||rV===""||pL==null) return null;
    const pLn=parseInt(pL),pVn=parseInt(pV),rLn=parseInt(rL),rVn=parseInt(rV);
    if (isNaN(pLn)||isNaN(pVn)||isNaN(rLn)||isNaN(rVn)) return null;
    if (pLn===rLn && pVn===rVn) return 6;
    const pw=pLn>pVn?"L":pLn<pVn?"V":"E";
    const rw=rLn>rVn?"L":rLn<rVn?"V":"E";
    return pw===rw ? 3 : 0;
  } else {
    if (!pred||pred==="") return null;
    const [rL,rV] = real;
    if (rL===""||rV==="") return null;
    const rLn=parseInt(rL),rVn=parseInt(rV);
    if (isNaN(rLn)||isNaN(rVn)) return null;
    const rw=rLn>rVn?"L":rLn<rVn?"V":"E";
    return pred===rw ? 3 : 0;
  }
}

function hashPin(pin) {
  let h = 0;
  for (let i = 0; i < pin.length; i++) { h = ((h << 5) - h) + pin.charCodeAt(i); h |= 0; }
  return String(h);
}

function countCaptured(playerPreds) {
  if (!playerPreds) return 0;
  let count = 0;
  for (const m of ALL_MATCHES) {
    const pred = playerPreds[m.id];
    if (isMex(m)) {
      if (Array.isArray(pred) && pred[0]!=="" && pred[1]!=="") count++;
    } else {
      if (pred && pred !== "") count++;
    }
  }
  return count;
}

function generateComprobante(playerName, playerPreds, results, lockedAt) {
  const lines = [];
  lines.push("QUINIELA MUNDIAL 2026");
  lines.push("=".repeat(52));
  lines.push("Jugador : " + playerName);
  lines.push("Cerrado : " + lockedAt);
  lines.push("Partidos: " + countCaptured(playerPreds) + "/72 capturados");
  lines.push("=".repeat(52));
  let totalPts = 0;
  for (const [grp] of Object.entries(GRUPOS)) {
    lines.push("");
    lines.push("--- GRUPO " + grp + " ---");
    for (const m of ALL_MATCHES.filter(x=>x.grp===grp)) {
      const pred = playerPreds ? playerPreds[m.id] : null;
      const real = results[m.id];
      const mexico = isMex(m);
      const pts = calcPoints(pred, real, mexico);
      if (pts !== null) totalPts += pts;
      let predStr = "(sin pronostico)";
      if (mexico && Array.isArray(pred) && pred[0]!==""&&pred[1]!=="") predStr = pred[0]+"-"+pred[1];
      else if (!mexico && pred) predStr = pred==="L"?"Gana "+m.local:pred==="V"?"Gana "+m.visit:"Empate";
      const realStr = real&&real[0]!==""&&real[1]!==""?(real[0]+"-"+real[1]):"Pendiente";
      const ptsStr  = pts!==null?" | "+pts+" pts":"";
      const mxTag   = mexico?" [MX⚡]":"";
      lines.push("  "+m.local+" vs "+m.visit+mxTag);
      lines.push("    Pronostico: "+predStr+"  |  Resultado: "+realStr+ptsStr);
    }
  }
  lines.push("");
  lines.push("=".repeat(52));
  lines.push("PUNTOS ACUMULADOS: " + totalPts);
  lines.push("=".repeat(52));
  lines.push("");
  lines.push("Comprobante oficial generado automaticamente.");
  lines.push("Quiniela Mundial 2026 - " + lockedAt);
  const blob = new Blob([lines.join("\n")], { type:"text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pronosticos_"+playerName.replace(/ /g,"_")+".txt";
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --g0:#030a05;--g1:#07110a;--g2:#0c1c0f;--g3:#122a17;--g4:#1a3d22;
  --gold:#e8b923;--gold2:#f5d472;--gold3:#a07810;
  --green:#2ecc71;--red:#e74c3c;--blue:#3b9de8;
  --txt:#dff0e2;--muted:#557a60;--border:#152c1c;
}
html,body{background:var(--g0);color:var(--txt);font-family:'Outfit',sans-serif;min-height:100vh;}
.app{max-width:860px;margin:0 auto;padding:0 14px 80px;}
.hdr{padding:28px 0 20px;text-align:center;background:radial-gradient(ellipse 90% 140px at 50% 0,#1a3d22 0,transparent 100%);border-bottom:1px solid var(--border);}
.hdr-eye{display:inline-block;background:var(--gold3);color:#000;font-size:10px;font-weight:700;letter-spacing:3px;padding:4px 14px;border-radius:2px;margin-bottom:10px;}
.hdr h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(42px,9vw,78px);letter-spacing:6px;line-height:1;background:linear-gradient(145deg,#fff 0%,var(--gold) 55%,#c07a00 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.hdr-sub{color:var(--muted);font-size:11px;letter-spacing:2px;margin-top:6px;}
.hdr-pills{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;}
.pill{display:flex;align-items:center;gap:5px;background:var(--g2);border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:11px;color:var(--muted);}
.pill b{color:var(--txt);}
.deadline-banner{display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#2a1500,#4a2a00,#2a1500);border-top:1px solid #7a4a00;padding:8px;font-size:12px;font-weight:700;letter-spacing:1px;color:#ffb347;margin-top:10px;}
.locked-banner{display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#3d0a0a,#5c1212,#3d0a0a);border-top:1px solid #7a1a1a;padding:8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#ff8080;margin-top:10px;}
.tabs{display:flex;gap:4px;padding:12px 0 4px;overflow-x:auto;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{flex-shrink:0;padding:8px 18px;border-radius:22px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'Outfit',sans-serif;transition:all .2s;}
.tab.on{background:var(--gold);color:#000;border-color:var(--gold);font-weight:700;}
.tab.adm.on{background:var(--red);color:#fff;border-color:var(--red);}
.sync-bar{display:flex;align-items:center;justify-content:flex-end;gap:6px;font-size:10px;color:var(--muted);padding:4px 0 8px;}
.sync-dot{width:6px;height:6px;border-radius:50%;background:var(--green);}
.sync-dot.spin{background:var(--gold);animation:pulse .8s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
.session-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:var(--g3);border:1px solid var(--border);border-radius:10px;padding:10px 16px;margin:10px 0 12px;}
.session-info .lbl{font-size:10px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;}
.session-info .name{font-weight:700;font-size:15px;margin-top:2px;}
.session-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.chip{font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:1px;}
.chip-red{background:#3d0a0a;border:1px solid var(--red);color:#ff8080;}
.chip-green{background:#0a2a0a;border:1px solid var(--green);color:var(--green);}
.chip-orange{background:#3d2000;border:1px solid #ffb347;color:#ffb347;}
.prog-wrap{margin:12px 0;background:var(--g2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;}
.prog-top{display:flex;justify-content:space-between;font-size:10px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:8px;}
.prog-top span:last-child{color:var(--txt);font-weight:700;}
.prog-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--green),var(--gold));border-radius:3px;transition:width .3s;}
.prog-fill.full{background:linear-gradient(90deg,var(--gold),#2ecc71);}
.sbar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
.stat{flex:1;min-width:68px;background:var(--g2);border:1px solid var(--border);border-radius:8px;padding:10px 8px;text-align:center;}
.stat-val{font-family:'Bebas Neue',sans-serif;font-size:26px;line-height:1;}
.stat-lbl{font-size:9px;letter-spacing:1.5px;color:var(--muted);margin-top:2px;text-transform:uppercase;}
.grp-block{margin-bottom:22px;}
.grp-hdr{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.grp-badge{font-family:'Bebas Neue',sans-serif;background:var(--g3);color:var(--gold);padding:4px 12px;border-radius:4px;font-size:17px;letter-spacing:2px;border:1px solid var(--border);}
.mcard{background:var(--g1);border:1px solid var(--border);border-radius:10px;margin-bottom:7px;overflow:hidden;}
.mcard.mx{border-color:#2d5c14;background:#080f05;}
.mx-banner{background:linear-gradient(90deg,#162e06,#2d5c14,#162e06);padding:4px 16px;font-size:10px;font-weight:700;letter-spacing:3px;color:var(--gold);text-align:center;text-transform:uppercase;}
.minner{padding:12px 14px;}
.match-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.match-date{font-size:10px;color:var(--muted);letter-spacing:1px;}
.match-venue{font-size:10px;color:var(--muted);text-align:right;}
.teams-row{display:grid;grid-template-columns:1fr 28px 1fr;align-items:center;gap:8px;margin-bottom:10px;}
.team-left{display:flex;align-items:center;gap:7px;}
.team-right{display:flex;align-items:center;gap:7px;flex-direction:row-reverse;text-align:right;}
.team-flag{width:24px;height:18px;border-radius:2px;object-fit:cover;}
.tn{font-size:13px;font-weight:500;}
.tn.mx{color:var(--gold);font-weight:700;}
.vs-lbl{font-family:'Bebas Neue',sans-serif;color:var(--muted);font-size:14px;text-align:center;}
.result-score{text-align:center;margin-bottom:8px;font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold);letter-spacing:3px;}
.controls{display:grid;grid-template-columns:1fr 46px;gap:10px;align-items:end;}
.ctrl-lbl{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:5px;}
.lev-btns{display:flex;gap:5px;}
.lev-btn{flex:1;padding:9px 4px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--g2);color:var(--muted);font-family:'Outfit',sans-serif;text-align:center;}
.lev-btn:disabled{opacity:.4;cursor:not-allowed;}
.lev-btn.sel-L{background:#0d2035;border-color:var(--blue);color:var(--blue);}
.lev-btn.sel-E{background:#2e2000;border-color:var(--gold);color:var(--gold);}
.lev-btn.sel-V{background:#2e0808;border-color:var(--red);color:var(--red);}
.score-inputs{display:flex;align-items:center;gap:6px;}
.sinp{width:44px;height:42px;background:var(--g2);border:1px solid var(--border);border-radius:8px;color:var(--txt);text-align:center;font-size:20px;font-weight:700;font-family:'Bebas Neue',sans-serif;outline:none;-moz-appearance:textfield;}
.sinp::-webkit-inner-spin-button,.sinp::-webkit-outer-spin-button{-webkit-appearance:none;}
.sinp:focus{border-color:var(--gold);background:#142010;}
.sinp:disabled{opacity:.4;cursor:not-allowed;}
.sinp.real{border-color:#1a3d22;background:#060e07;color:var(--gold);}
.sdash{color:var(--muted);font-weight:700;font-size:16px;}
.hint{font-size:9px;color:var(--muted);letter-spacing:1px;margin-top:4px;}
.hint.mx{color:#5aab3a;}
.hint.lk{color:#a05050;}
.other-preds{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);}
.other-preds-title{font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:6px;}
.other-pred-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px;}
.other-pred-name{color:var(--muted);}
.other-pred-val{font-weight:600;}
.other-pred-pts{font-family:'Bebas Neue',sans-serif;font-size:14px;margin-left:8px;}
.pbadge{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:18px;flex-shrink:0;}
.pb-6{background:#0a2a0a;color:#2ecc71;border:2px solid #2ecc71;}
.pb-3{background:#0a2a0a;color:#27ae60;border:2px solid #27ae60;}
.pb-0{background:#2a0a0a;color:var(--red);border:2px solid var(--red);}
.pb-q{background:var(--g2);color:var(--muted);border:2px solid var(--border);}
.sb{background:var(--g1);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.sb-head{display:grid;grid-template-columns:44px 1fr 55px 55px 55px 55px;padding:10px 16px;background:var(--g3);font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;}
.sb-row{display:grid;grid-template-columns:44px 1fr 55px 55px 55px 55px;padding:12px 16px;border-top:1px solid #0a1a0e;align-items:center;}
.sb-row.p1{background:#0e2014;}
.rnk{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--muted);}
.rnk.g{color:var(--gold);}
.rnk.s{color:#c0c0c0;}
.rnk.b{color:#cd7f32;}
.pname{font-weight:600;font-size:14px;}
.pname-sub{font-size:10px;margin-top:2px;}
.pname-sub.lk{color:var(--red);}
.pname-sub.ok{color:var(--muted);}
.pcol{text-align:center;font-family:'Bebas Neue',sans-serif;}
.pcol.tot{font-size:24px;color:var(--gold);}
.pcol.sub{font-size:16px;color:var(--muted);}
.pcol.mxc{font-size:16px;color:var(--green);}
.pcol.prg{font-size:14px;color:var(--muted);}
.admin-panel{background:var(--g2);border:1px solid #3d1515;border-radius:12px;padding:20px;margin-bottom:16px;}
.admin-panel h2{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:var(--red);margin-bottom:16px;}
.a-sec{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border);}
.a-sec:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.a-sec h3{font-size:12px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:12px;}
.a-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.ldot{width:10px;height:10px;border-radius:50%;}
.ldot.open{background:var(--green);}
.ldot.closed{background:var(--red);}
.btn{padding:11px 18px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:'Outfit',sans-serif;transition:all .2s;}
.btn-gold{background:var(--gold);color:#000;}
.btn-gold:hover{background:var(--gold2);}
.btn-red{background:var(--red);color:#fff;}
.btn-green{background:#1e8449;color:#fff;}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border);}
.btn-blue{background:var(--blue);color:#fff;}
.btn-sm{padding:6px 12px;font-size:12px;}
.inp-group{margin-bottom:12px;text-align:left;}
.inp-group label{font-size:10px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;display:block;margin-bottom:5px;}
.inp{width:100%;background:var(--g1);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--txt);font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--gold);}
.inp.red:focus{border-color:var(--red);}
.pmgmt{display:flex;flex-direction:column;gap:6px;}
.pmgmt-row{display:flex;align-items:center;justify-content:space-between;background:var(--g1);border:1px solid var(--border);border-radius:8px;padding:8px 14px;flex-wrap:wrap;gap:8px;}
.pmgmt-left{display:flex;align-items:center;gap:10px;}
.pmgmt-name{font-weight:600;font-size:14px;}
.pmgmt-status{font-size:10px;letter-spacing:1px;margin-top:2px;}
.pmgmt-status.lk{color:var(--red);}
.pmgmt-status.ok{color:var(--green);}
.pmgmt-pts{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--gold);}
.pmgmt-r{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);}
.modal{background:var(--g2);border:1px solid #3d1515;border-radius:16px;padding:28px;width:min(360px,94vw);text-align:center;}
.modal h2{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:var(--red);margin-bottom:6px;}
.modal p{color:var(--muted);font-size:13px;margin-bottom:20px;line-height:1.5;}
.modal-err{color:var(--red);font-size:12px;margin-top:8px;}
.btn-row{display:flex;gap:8px;margin-top:16px;}
.rules-box{background:var(--g2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px;}
.rules-box h3{color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;}
.rule-row{display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;line-height:1.5;}
.rule-row:last-child{border-bottom:none;}
.toast{position:fixed;bottom:20px;right:20px;padding:9px 18px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;opacity:0;transition:opacity .3s;pointer-events:none;z-index:200;}
.toast.show{opacity:1;}
.toast.save{background:var(--g4);border:1px solid var(--green);color:var(--green);}
.toast.warn{background:#3d1515;border:1px solid var(--red);color:#ff9090;}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:16px;color:var(--muted);}
.spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty{text-align:center;padding:50px 20px;color:var(--muted);}
.stitle{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:4px;color:var(--gold);margin:20px 0 10px;padding-left:10px;border-left:3px solid var(--gold);}
@media(max-width:480px){
  .sb-head,.sb-row{grid-template-columns:36px 1fr 46px 46px 46px 46px;}
  .sinp{width:38px;height:38px;font-size:18px;}
  .tn{font-size:12px;}
}
`;

function Flag({ team }) {
  const code = FLAGS[team];
  if (!code) return null;
  return <img className="team-flag" src={`https://flagcdn.com/24x18/${code}.png`} alt={team} onError={e=>e.target.style.display='none'}/>;
}

export default function App() {
  const [tab, setTab]           = useState("pronosticos");
  const [loading, setLoading]   = useState(true);
  const [syncing, setSyncing]   = useState(false);
  const [players, setPlayers]   = useState([]);
  const [preds, setPreds]       = useState({});
  const [results, setResults]   = useState({});
  const [globalLocked, setGlobalLocked] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [session, setSession]   = useState(null);
  const [toast, setToast]       = useState({ msg:"", type:"save", show:false });
  const [isAdmin, setIsAdmin]   = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr]   = useState("");
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [pName, setPName]   = useState("");
  const [pPin, setPPin]     = useState("");
  const [pPin2, setPPin2]   = useState("");
  const [pErr, setPErr]     = useState("");
  const [deadlinePassed, setDeadlinePassed] = useState(isPastDeadline());

  useEffect(() => {
    const iv = setInterval(() => setDeadlinePassed(isPastDeadline()), 60000);
    return () => clearInterval(iv);
  }, []);

  const showToast = (msg, type="save") => {
    setToast({ msg, type, show:true });
    setTimeout(() => setToast(t => ({...t, show:false})), 2200);
  };

  const loadData = useCallback(async (silent=false) => {
    if (!silent) setLoading(true); else setSyncing(true);
    const data = await dbGet();
    if (data.players) setPlayers(data.players);
    if (data.preds) setPreds(data.preds);
    if (data.results) setResults(data.results);
    if (data.globalLocked !== undefined) setGlobalLocked(data.globalLocked);
    setLastSync(new Date());
    if (!silent) setLoading(false); else setSyncing(false);
  }, []);

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const iv = setInterval(() => loadData(true), 15000);
    return () => clearInterval(iv);
  }, [loadData]);

  const saveAll = async (patch) => {
    setSyncing(true);
    const next = { players, preds, results, globalLocked, ...patch };
    const ok = await dbSet(next);
    if (ok) { showToast("Guardado"); setLastSync(new Date()); }
    else showToast("Error al guardar", "warn");
    setSyncing(false);
    return next;
  };

  // ── Registro ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (deadlinePassed) { setPErr("Ya no es posible registrarse, el torneo ya inicio"); return; }
    const name = pName.trim();
    if (!name) { setPErr("Escribe tu nombre"); return; }
    if (pPin.length < 4) { setPErr("El PIN debe tener al menos 4 digitos"); return; }
    if (pPin !== pPin2) { setPErr("Los PINs no coinciden"); return; }
    if (players.find(p => p.name === name)) { setPErr("Ese nombre ya existe"); return; }
    const np = [...players, { name, pinHash: hashPin(pPin), locked: false, lockedAt: null }];
    setPlayers(np);
    await saveAll({ players: np });
    setSession({ name });
    setShowPlayerModal(false);
    setPName(""); setPPin(""); setPPin2(""); setPErr("");
    showToast("Bienvenido " + name + "!");
  };

  const handleLogin = () => {
    const name = pName.trim();
    const player = players.find(p => p.name === name);
    if (!player) { setPErr("Jugador no encontrado"); return; }
    if (player.pinHash !== hashPin(pPin)) { setPErr("PIN incorrecto"); setPPin(""); return; }
    setSession({ name });
    setShowPlayerModal(false);
    setPName(""); setPPin(""); setPErr("");
    showToast("Bienvenido " + name + "!");
  };

  // ── Cerrar pronósticos — requiere 100% ─────────────────────────────────────
  const lockMyPreds = async () => {
    const captured = countCaptured(preds[session.name]);
    if (captured < TOTAL_MATCHES) {
      showToast("Debes capturar los " + TOTAL_MATCHES + " partidos antes de cerrar. Te faltan " + (TOTAL_MATCHES - captured) + ".", "warn");
      return;
    }
    if (!window.confirm("Cerrar tus pronosticos? Ya capturaste los 72 partidos.\n\nSe generara un comprobante automaticamente.\nSolo el admin podra reabrirlos si te equivocaste.")) return;
    const lockedAt = new Date().toLocaleString('es-MX');
    const np = players.map(p => p.name === session.name ? {...p, locked: true, lockedAt} : p);
    setPlayers(np);
    await saveAll({ players: np });
    generateComprobante(session.name, preds[session.name]||{}, results, lockedAt);
    showToast("Pronosticos cerrados. Comprobante descargado.", "save");
  };

  const myPlayer = session ? players.find(p => p.name === session.name) : null;
  const myLocked = deadlinePassed || globalLocked || (myPlayer ? myPlayer.locked : true);
  const myCaptured = session ? countCaptured(preds[session.name]) : 0;

  const setPred = async (matchId, val) => {
    if (myLocked) { showToast("Pronosticos cerrados", "warn"); return; }
    const np = { ...preds, [session.name]: { ...(preds[session.name]||{}), [matchId]: val } };
    setPreds(np);
    await saveAll({ preds: np });
  };

  const setResultSide = async (matchId, side, raw) => {
    const v = raw === "" ? "" : Math.max(0, parseInt(raw)||0);
    const cur = results[matchId] || ["",""];
    const nr = { ...results, [matchId]: side===0 ? [v,cur[1]] : [cur[0],v] };
    setResults(nr);
    await saveAll({ results: nr });
  };

  const toggleGlobalLock = async () => {
    const next = !globalLocked; setGlobalLocked(next);
    await saveAll({ globalLocked: next });
    showToast(next ? "Pronosticos cerrados globalmente" : "Pronosticos abiertos", next ? "warn" : "save");
  };

  const unlockPlayer = async (name) => {
    if (deadlinePassed) { showToast("No se puede reabrir, el torneo ya inicio", "warn"); return; }
    const np = players.map(p => p.name === name ? {...p, locked: false, lockedAt: null} : p);
    setPlayers(np);
    await saveAll({ players: np });
    showToast("Pronosticos de " + name + " reabiertos");
  };

  const removePlayer = async (name) => {
    if (!window.confirm("Eliminar a " + name + "? Se borran todos sus pronosticos.")) return;
    const np = players.filter(p => p.name !== name);
    const nd = {...preds}; delete nd[name];
    setPlayers(np); setPreds(nd);
    await saveAll({ players: np, preds: nd });
    showToast(name + " eliminado", "warn");
  };

  const playerStats = (name) => {
    let tot=0, mexPts=0, correct=0, exact=0;
    const captured = countCaptured(preds[name]);
    for (const m of ALL_MATCHES) {
      const pred = (preds[name]||{})[m.id];
      const real = results[m.id];
      const p = calcPoints(pred, real, isMex(m));
      if (p !== null) { tot+=p; if(p>0) correct++; if(isMex(m)) mexPts+=p; if(p===6) exact++; }
    }
    return { tot, mexPts, correct, exact, captured };
  };

  const myStats    = session ? playerStats(session.name) : { tot:0, mexPts:0, correct:0, exact:0, captured:0 };
  const scoreboard = [...players].map(p=>({...p,...playerStats(p.name)})).sort((a,b)=>b.tot-a.tot);
  const showOthers = deadlinePassed;

  const tryAdminLogin = () => {
    if (adminPass === ADMIN_PASS) {
      setIsAdmin(true); setShowAdminLogin(false); setAdminPass(""); setAdminErr("");
      setTab("admin"); showToast("Modo admin activado");
    } else { setAdminErr("Contrasena incorrecta"); setAdminPass(""); }
  };

  const Badge = ({ pts }) => {
    if (pts===null) return <div className="pbadge pb-q">?</div>;
    if (pts===6)   return <div className="pbadge pb-6">6</div>;
    if (pts===3)   return <div className="pbadge pb-3">3</div>;
    return               <div className="pbadge pb-0">0</div>;
  };

  const predLabel = (pred, m) => {
    if (!pred) return null;
    if (isMex(m)) return Array.isArray(pred)&&pred[0]!==""&&pred[1]!==""?pred[0]+"-"+pred[1]:null;
    return pred==="L"?"Gana "+m.local:pred==="V"?"Gana "+m.visit:"Empate";
  };

  const MatchCard = ({ m }) => {
    const mexico = isMex(m);
    const pred   = session ? (preds[session.name]||{})[m.id] : null;
    const real   = results[m.id] || null;
    const pts    = session ? calcPoints(pred, real, mexico) : null;
    const info   = MATCH_INFO[m.id] || {};
    const hasResult = real && real[0]!==""&&real[1]!=="";

    return (
      <div className={`mcard ${mexico?"mx":""}`}>
        {mexico && <div className="mx-banner">PARTIDO MEXICO - MARCADOR EXACTO - PUNTOS DOBLES</div>}
        <div className="minner">
          <div className="match-meta">
            <span className="match-date">{info.date} {info.time && "· "+info.time+" CDMX"}</span>
            <span className="match-venue">{info.venue}</span>
          </div>
          <div className="teams-row">
            <div className="team-left"><Flag team={m.local}/><span className={`tn ${m.local==="Mexico"?"mx":""}`}>{m.local}</span></div>
            <span className="vs-lbl">VS</span>
            <div className="team-right"><Flag team={m.visit}/><span className={`tn ${m.visit==="Mexico"?"mx":""}`}>{m.visit}</span></div>
          </div>
          {hasResult && <div className="result-score">{real[0]} - {real[1]}</div>}
          {session ? (
            <div className="controls">
              {mexico ? (
                <div>
                  <div className="ctrl-lbl">Tu pronostico (marcador exacto)</div>
                  <div className="score-inputs">
                    <input className="sinp" type="number" min="0" max="99" placeholder="0" disabled={myLocked}
                      value={Array.isArray(pred)?pred[0]:""}
                      onChange={e=>{const c=Array.isArray(pred)?pred:["",""]; setPred(m.id,[e.target.value,c[1]]);}}/>
                    <span className="sdash">-</span>
                    <input className="sinp" type="number" min="0" max="99" placeholder="0" disabled={myLocked}
                      value={Array.isArray(pred)?pred[1]:""}
                      onChange={e=>{const c=Array.isArray(pred)?pred:["",""]; setPred(m.id,[c[0],e.target.value]);}}/>
                  </div>
                  {myLocked?<div className="hint lk">Pronosticos cerrados</div>
                           :<div className="hint mx">Exacto = 6 pts | Solo resultado = 3 pts</div>}
                </div>
              ) : (
                <div>
                  <div className="ctrl-lbl">Tu pronostico</div>
                  <div className="lev-btns">
                    {[{val:"L",label:"Local"},{val:"E",label:"Empate"},{val:"V",label:"Visit."}].map(o=>(
                      <button key={o.val} disabled={myLocked}
                        className={`lev-btn ${pred===o.val?"sel-"+o.val:""}`}
                        onClick={()=>setPred(m.id,o.val)}>{o.label}</button>
                    ))}
                  </div>
                  {myLocked?<div className="hint lk">Pronosticos cerrados</div>
                           :<div className="hint">Acierto = 3 pts</div>}
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div className="ctrl-lbl">Pts</div>
                <Badge pts={pts}/>
              </div>
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"10px 0",fontSize:12,color:"var(--muted)"}}>
              {deadlinePassed?"El torneo ya inicio":"Inicia sesion para capturar tu pronostico"}
            </div>
          )}
          {showOthers && players.length > 0 && (
            <div className="other-preds">
              <div className="other-preds-title">Pronosticos del grupo</div>
              {players.map(p => {
                const opred = (preds[p.name]||{})[m.id];
                const label = predLabel(opred, m);
                if (!label) return <div key={p.name} className="other-pred-row"><span className="other-pred-name">{p.name}</span><span style={{color:"var(--muted)",fontSize:11}}>sin pronostico</span></div>;
                const opts = calcPoints(opred, real, mexico);
                return (
                  <div key={p.name} className="other-pred-row">
                    <span className="other-pred-name">{p.name}</span>
                    <span>
                      <span className="other-pred-val">{label}</span>
                      {opts!==null && <span className="other-pred-pts" style={{color:opts>0?"var(--green)":"var(--red)"}}>{opts}pts</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading"><div className="spinner"/><div>Cargando quiniela...</div></div>
    </>
  );

  const daysLeft = Math.max(0, Math.ceil((DEADLINE - new Date()) / (1000*60*60*24)));

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-eye">FIFA WORLD CUP 2026</div>
          <h1>QUINIELA 2026</h1>
          <div className="hdr-sub">FASE DE GRUPOS - 12 GRUPOS - 72 PARTIDOS</div>
          <div className="hdr-pills">
            <span className="pill">Acierto <b>3 pts</b></span>
            <span className="pill">Mexico exacto <b>6 pts</b></span>
            <span className="pill">Mexico resultado <b>3 pts</b></span>
            {!deadlinePassed && <span className="pill">Cierra <b>10 Jun 2026</b></span>}
          </div>
          {!deadlinePassed && daysLeft <= 7 && daysLeft > 0 && (
            <div className="deadline-banner">Quedan {daysLeft} dias para capturar — cierre automatico el 10 de junio</div>
          )}
          {deadlinePassed && <div className="locked-banner">PRONOSTICOS CERRADOS — El torneo ya inicio</div>}
          {!deadlinePassed && globalLocked && <div className="locked-banner">PRONOSTICOS CERRADOS POR EL ADMIN</div>}
        </div>

        <div className="tabs">
          {[{id:"pronosticos",label:"Pronosticos"},{id:"tabla",label:"Tabla"},{id:"info",label:"Reglas"}].map(t=>(
            <button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
          {isAdmin
            ? <button className={`tab adm ${tab==="admin"?"on":""}`} onClick={()=>setTab("admin")}>Admin</button>
            : <button className="tab" onClick={()=>setShowAdminLogin(true)}>Admin</button>}
        </div>

        <div className="sync-bar">
          <div className={`sync-dot ${syncing?"spin":""}`}/>
          <span>{syncing?"Sincronizando...":lastSync?`Sync ${lastSync.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}`:""}</span>
        </div>

        {tab==="pronosticos" && (
          <>
            <div className="session-bar">
              {session ? (
                <>
                  <div className="session-info">
                    <div className="lbl">Sesion activa</div>
                    <div className="name">{session.name}</div>
                  </div>
                  <div className="session-right">
                    {myLocked ? <span className="chip chip-red">Cerrado</span>
                               : <span className="chip chip-green">Abierto</span>}
                    {!myLocked && (
                      <button className="btn btn-red btn-sm" onClick={lockMyPreds}>
                        {myCaptured < TOTAL_MATCHES
                          ? `Cerrar (${myCaptured}/${TOTAL_MATCHES})`
                          : "Cerrar y descargar PDF"}
                      </button>
                    )}
                    {myLocked && myPlayer && (
                      <button className="btn btn-blue btn-sm"
                        onClick={()=>generateComprobante(session.name,preds[session.name]||{},results,myPlayer.lockedAt||"")}>
                        Descargar PDF
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={()=>setSession(null)}>Salir</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="session-info">
                    <div className="lbl">Sin sesion</div>
                    <div className="name" style={{fontSize:13,color:"var(--muted)"}}>
                      {deadlinePassed ? "El torneo ya inicio" : "Inicia sesion para capturar"}
                    </div>
                  </div>
                  <div className="session-right">
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setModalMode("login");setPName("");setPPin("");setPErr("");setShowPlayerModal(true);}}>
                      {deadlinePassed ? "Ver mis pronosticos" : "Iniciar sesion"}
                    </button>
                    {!deadlinePassed && (
                      <button className="btn btn-gold btn-sm" onClick={()=>{setModalMode("register");setPName("");setPPin("");setPPin2("");setPErr("");setShowPlayerModal(true);}}>Registrarse</button>
                    )}
                  </div>
                </>
              )}
            </div>

            {session && (
              <>
                <div className="prog-wrap">
                  <div className="prog-top">
                    <span>Progreso de captura</span>
                    <span>{myCaptured}/{TOTAL_MATCHES} partidos {myCaptured===TOTAL_MATCHES?"✅ Completo":""}</span>
                  </div>
                  <div className="prog-bar">
                    <div className={`prog-fill ${myCaptured===TOTAL_MATCHES?"full":""}`} style={{width:`${(myCaptured/TOTAL_MATCHES)*100}%`}}/>
                  </div>
                  {myCaptured < TOTAL_MATCHES && !myLocked && (
                    <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>
                      Necesitas capturar los {TOTAL_MATCHES} partidos para poder cerrar tus pronosticos.
                    </div>
                  )}
                </div>
                <div className="sbar">
                  <div className="stat"><div className="stat-val" style={{color:"var(--gold)"}}>{myStats.tot}</div><div className="stat-lbl">Puntos</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"var(--green)"}}>{myStats.correct}</div><div className="stat-lbl">Acertados</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"#2ecc71"}}>{myStats.exact}</div><div className="stat-lbl">Exactos Mx</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"var(--green)"}}>{myStats.mexPts}</div><div className="stat-lbl">Pts Mexico</div></div>
                </div>
              </>
            )}

            {Object.entries(GRUPOS).map(([grp])=>(
              <div key={grp} className="grp-block">
                <div className="grp-hdr"><span className="grp-badge">GRUPO {grp}</span></div>
                {ALL_MATCHES.filter(m=>m.grp===grp).map(m=><MatchCard key={m.id} m={m}/>)}
              </div>
            ))}
          </>
        )}

        {tab==="tabla" && (
          <>
            <div className="stitle">CLASIFICACION EN TIEMPO REAL</div>
            {players.length===0
              ? <div className="empty"><div style={{fontSize:52,marginBottom:12}}>🏆</div><div>Sin participantes aun</div></div>
              : <div className="sb">
                  <div className="sb-head">
                    <div>POS</div><div>JUGADOR</div>
                    <div style={{textAlign:"center"}}>PTS</div>
                    <div style={{textAlign:"center"}}>ACIERTOS</div>
                    <div style={{textAlign:"center"}}>PTS MX</div>
                    <div style={{textAlign:"center"}}>PROG</div>
                  </div>
                  {scoreboard.map((p,i)=>(
                    <div key={p.name} className={`sb-row ${i===0?"p1":""}`}>
                      <div className={`rnk ${i===0?"g":i===1?"s":i===2?"b":""}`}>{i===0?"1":i===1?"2":i===2?"3":i+1}</div>
                      <div>
                        <div className="pname">{p.name}</div>
                        <div className={`pname-sub ${p.locked?"lk":"ok"}`}>
                          {p.locked ? "Cerrado" : p.captured+"/"+TOTAL_MATCHES}
                        </div>
                      </div>
                      <div className="pcol tot">{p.tot}</div>
                      <div className="pcol sub">{p.correct}</div>
                      <div className="pcol mxc">{p.mexPts}</div>
                      <div className="pcol prg">{Math.round((p.captured/TOTAL_MATCHES)*100)}%</div>
                    </div>
                  ))}
                </div>
            }
          </>
        )}

        {tab==="info" && (
          <>
            <div className="stitle">COMO JUGAR</div>
            <div className="rules-box">
              <h3>Pasos</h3>
              <div className="rule-row"><span>1️⃣</span><div>Toca <strong>Registrarse</strong>, elige tu nombre y crea un PIN de 4+ digitos. Guardalo bien, lo necesitaras para volver a entrar.</div></div>
              <div className="rule-row"><span>2️⃣</span><div>Captura tus pronosticos en <strong>los 72 partidos</strong> antes del <strong>10 de junio</strong>. Es obligatorio llenarlos todos para poder cerrar.</div></div>
              <div className="rule-row"><span>3️⃣</span><div>Cuando tengas los 72 partidos capturados toca <strong>Cerrar y descargar PDF</strong>. Se guarda un comprobante con tus pronosticos.</div></div>
              <div className="rule-row"><span>4️⃣</span><div>A partir del 11 de junio puedes ver los pronosticos de todos en cada partido.</div></div>
              <div className="rule-row"><span>5️⃣</span><div>Si te equivocaste, pide al admin que reabra tus pronosticos (solo antes del 10 de junio).</div></div>
            </div>
            <div className="rules-box">
              <h3>Puntuacion</h3>
              <div className="rule-row"><span>✅</span><div><strong>Todos los partidos:</strong> elegir bien Local / Empate / Visitante = <strong>3 pts</strong></div></div>
              <div className="rule-row"><span>🇲🇽</span><div><strong>Mexico resultado correcto:</strong> acertar quien gana o empate = <strong>3 pts</strong></div></div>
              <div className="rule-row"><span>⚡</span><div><strong>Mexico marcador exacto:</strong> acertar goles de ambos = <strong>6 pts</strong></div></div>
              <div className="rule-row"><span>❌</span><div>Fallo = 0 pts</div></div>
            </div>
          </>
        )}

        {tab==="admin" && isAdmin && (
          <div className="admin-panel">
            <h2>PANEL DE ADMIN</h2>
            <div className="a-sec">
              <h3>Estado general</h3>
              <div className="a-row">
                <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                  <div className={`ldot ${(globalLocked||deadlinePassed)?"closed":"open"}`}/>
                  <span>{deadlinePassed?"Torneo iniciado — cierre automatico activo":globalLocked?"Cerrado por admin":"Abierto — jugadores pueden capturar"}</span>
                </div>
                {!deadlinePassed && (
                  <button className={`btn btn-sm ${globalLocked?"btn-green":"btn-red"}`} onClick={toggleGlobalLock}>
                    {globalLocked?"Abrir todo":"Cerrar todo"}
                  </button>
                )}
              </div>
            </div>

            <div className="a-sec">
              <h3>Participantes ({players.length}) — {players.filter(p=>p.locked).length} cerrados</h3>
              {players.length===0
                ? <div style={{color:"var(--muted)",fontSize:13}}>Los jugadores se registran solos desde la app.</div>
                : <div className="pmgmt">
                    {scoreboard.map((p,i)=>(
                      <div key={p.name} className="pmgmt-row">
                        <div className="pmgmt-left">
                          <span style={{color:"var(--muted)",fontSize:12,minWidth:20}}>{i+1}.</span>
                          <div>
                            <div className="pmgmt-name">{p.name}</div>
                            <div className={`pmgmt-status ${p.locked?"lk":"ok"}`}>
                              {p.locked
                                ? "Cerrado"+(p.lockedAt?" — "+p.lockedAt:"")
                                : "Abierto — "+p.captured+"/"+TOTAL_MATCHES+" capturados"}
                            </div>
                          </div>
                        </div>
                        <div className="pmgmt-r">
                          <span className="pmgmt-pts">{p.tot}pts</span>
                          {p.locked && !deadlinePassed && (
                            <button className="btn btn-green btn-sm" onClick={()=>unlockPlayer(p.name)}>Reabrir</button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={()=>removePlayer(p.name)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div className="a-sec">
              <h3>Resultados reales</h3>
              {Object.entries(GRUPOS).map(([grp])=>(
                <div key={grp} style={{marginBottom:16}}>
                  <div className="grp-hdr"><span className="grp-badge">GRUPO {grp}</span></div>
                  {ALL_MATCHES.filter(m=>m.grp===grp).map(m=>{
                    const real=results[m.id]||["",""];
                    const mexico=isMex(m);
                    const info=MATCH_INFO[m.id]||{};
                    return (
                      <div key={m.id} className={`mcard ${mexico?"mx":""}`} style={{marginBottom:6}}>
                        {mexico&&<div className="mx-banner">PARTIDO MEXICO</div>}
                        <div className="minner">
                          <div className="match-meta">
                            <span className="match-date">{info.date} {info.time && "· "+info.time}</span>
                            <span className="match-venue">{info.venue}</span>
                          </div>
                          <div className="teams-row">
                            <div className="team-left"><Flag team={m.local}/><span className={`tn ${m.local==="Mexico"?"mx":""}`}>{m.local}</span></div>
                            <span className="vs-lbl">VS</span>
                            <div className="team-right"><Flag team={m.visit}/><span className={`tn ${m.visit==="Mexico"?"mx":""}`}>{m.visit}</span></div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <div>
                              <div className="ctrl-lbl">Resultado</div>
                              <div className="score-inputs">
                                <input className="sinp real" type="number" min="0" max="99" placeholder="0"
                                  value={real[0]} onChange={e=>setResultSide(m.id,0,e.target.value)}/>
                                <span className="sdash">-</span>
                                <input className="sinp real" type="number" min="0" max="99" placeholder="0"
                                  value={real[1]} onChange={e=>setResultSide(m.id,1,e.target.value)}/>
                              </div>
                            </div>
                            {real[0]!==""&&real[1]!==""&&(
                              <div style={{fontSize:12,color:"var(--muted)",marginTop:14}}>
                                {parseInt(real[0])>parseInt(real[1])?"Gana "+m.local:parseInt(real[0])<parseInt(real[1])?"Gana "+m.visit:"Empate"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{textAlign:"right"}}>
              <button className="btn btn-ghost" onClick={()=>{setIsAdmin(false);setTab("pronosticos");}}>Salir de admin</button>
            </div>
          </div>
        )}
      </div>

      {showPlayerModal && (
        <div className="overlay" onClick={()=>{setShowPlayerModal(false);setPErr("");}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>{modalMode==="register"?"REGISTRO":"INICIAR SESION"}</h2>
            <p>{modalMode==="register"?"Crea tu cuenta para capturar tus pronosticos":"Ingresa tu nombre y PIN para continuar"}</p>
            <div className="inp-group"><label>Nombre</label>
              <input className="inp" placeholder="Tu nombre..." value={pName} onChange={e=>setPName(e.target.value)} autoFocus/>
            </div>
            <div className="inp-group"><label>PIN (minimo 4 digitos)</label>
              <input className="inp" type="password" inputMode="numeric" placeholder="****" value={pPin}
                onChange={e=>setPPin(e.target.value.replace(/\D/g,"").slice(0,8))}/>
            </div>
            {modalMode==="register" && (
              <div className="inp-group"><label>Confirmar PIN</label>
                <input className="inp" type="password" inputMode="numeric" placeholder="****" value={pPin2}
                  onChange={e=>setPPin2(e.target.value.replace(/\D/g,"").slice(0,8))}
                  onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>
              </div>
            )}
            {pErr && <div className="modal-err">{pErr}</div>}
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={()=>{setShowPlayerModal(false);setPErr("");}}>Cancelar</button>
              <button className="btn btn-gold" onClick={modalMode==="register"?handleRegister:handleLogin}>
                {modalMode==="register"?"Registrarse":"Entrar"}
              </button>
            </div>
            <div style={{marginTop:12,fontSize:12,color:"var(--muted)"}}>
              {modalMode==="register"
                ? <span>Ya tienes cuenta? <button style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontSize:12}} onClick={()=>{setModalMode("login");setPErr("");}}>Inicia sesion</button></span>
                : <span>No tienes cuenta? <button style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontSize:12}} onClick={()=>{setModalMode("register");setPErr("");}}>Registrate</button></span>}
            </div>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="overlay" onClick={()=>{setShowAdminLogin(false);setAdminErr("");setAdminPass("");}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>ADMIN</h2>
            <p>Ingresa la contrasena de administrador</p>
            <input className="inp red" type="password" placeholder="Contrasena..." value={adminPass}
              onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryAdminLogin()} autoFocus/>
            {adminErr && <div className="modal-err">{adminErr}</div>}
            <div className="btn-row" style={{marginTop:14}}>
              <button className="btn btn-ghost" onClick={()=>{setShowAdminLogin(false);setAdminErr("");setAdminPass("");}}>Cancelar</button>
              <button className="btn btn-red" onClick={tryAdminLogin}>Entrar</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast.type} ${toast.show?"show":""}`}>{toast.msg}</div>
    </>
  );
}
