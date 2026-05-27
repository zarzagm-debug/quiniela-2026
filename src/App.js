import { useState, useEffect, useCallback } from "react";

const API = "https://script.google.com/macros/s/AKfycbwatt79SXecAZZUwW72ximmM4dpKRRThwY_ya9ZVcaPZZ4I0zticzpEBIogXuBBXqgBfg/exec";

async function dbGet() {
  try {
    const r = await fetch(`${API}?action=get`);
    const text = await r.text();
    return JSON.parse(text || "{}");
  } catch { return {}; }
}

async function dbSet(data) {
  try {
    await fetch(`${API}?action=set&data=${encodeURIComponent(JSON.stringify(data))}`);
    return true;
  } catch { return false; }
}

const GRUPOS = {
  A: ["Mexico","Sudafrica","Rep. Corea","Chequia"],
  B: ["Canada","Bosnia y Herz.","Catar","Suiza"],
  C: ["Brasil","Marruecos","Escocia","Haiti"],
  D: ["EE.UU.","Uruguay","Egipto","Nueva Zelanda"],
  E: ["Alemania","Costa de Marfil","Ecuador","Curazao"],
  F: ["Paises Bajos","Japon","Tunez","Suecia"],
  G: ["Belgica","Australia","Iran","Turquia"],
  H: ["Espana","Arabia Saudita","Uruguay","Cabo Verde"],
  I: ["Francia","Senegal","Noruega","Iraq"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","Colombia","RD del Congo","Uzbekistan"],
  L: ["Inglaterra","Croacia","Ghana","Panama"],
};

const FLAGS = {
  "Mexico":"MX","Sudafrica":"ZA","Rep. Corea":"KR","Chequia":"CZ",
  "Canada":"CA","Bosnia y Herz.":"BA","Catar":"QA","Suiza":"CH",
  "Brasil":"BR","Marruecos":"MA","Escocia":"GB","Haiti":"HT",
  "EE.UU.":"US","Uruguay":"UY","Egipto":"EG","Nueva Zelanda":"NZ",
  "Alemania":"DE","Costa de Marfil":"CI","Ecuador":"EC","Curazao":"CW",
  "Paises Bajos":"NL","Japon":"JP","Tunez":"TN","Suecia":"SE",
  "Belgica":"BE","Australia":"AU","Iran":"IR","Turquia":"TR",
  "Espana":"ES","Arabia Saudita":"SA","Cabo Verde":"CV",
  "Francia":"FR","Senegal":"SN","Noruega":"NO","Iraq":"IQ",
  "Argentina":"AR","Argelia":"DZ","Austria":"AT","Jordania":"JO",
  "Portugal":"PT","Colombia":"CO","RD del Congo":"CD","Uzbekistan":"UZ",
  "Inglaterra":"GB","Croacia":"HR","Ghana":"GH","Panama":"PA",
};

function getFlag(team) {
  const code = FLAGS[team];
  if (!code) return "";
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}

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

function calcPoints(pred, real, mexMatch) {
  if (!pred || !real) return null;
  if (mexMatch) {
    const [pL, pV] = Array.isArray(pred) ? pred : [null, null];
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
.locked-banner{display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(90deg,#3d0a0a,#5c1212,#3d0a0a);border-top:1px solid #7a1a1a;padding:8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#ff8080;margin-top:10px;}
.tabs{display:flex;gap:4px;padding:12px 0 4px;overflow-x:auto;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{flex-shrink:0;padding:8px 18px;border-radius:22px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .2s;font-family:'Outfit',sans-serif;}
.tab.on{background:var(--gold);color:#000;border-color:var(--gold);font-weight:700;}
.tab.adm.on{background:var(--red);color:#fff;border-color:var(--red);}
.sync-bar{display:flex;align-items:center;justify-content:flex-end;gap:6px;font-size:10px;color:var(--muted);padding:4px 0 8px;}
.sync-dot{width:6px;height:6px;border-radius:50%;background:var(--green);}
.sync-dot.spin{background:var(--gold);animation:pulse .8s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
.pbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:var(--g3);border:1px solid var(--border);border-radius:10px;padding:10px 16px;margin:10px 0 12px;}
.pbar-lbl{font-size:10px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;}
.pbar-name{font-weight:700;font-size:15px;margin-top:2px;}
.psel{display:flex;gap:5px;flex-wrap:wrap;}
.pbtn{padding:5px 12px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'Outfit',sans-serif;}
.pbtn.on{background:var(--gold);color:#000;border-color:var(--gold);}
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
.teams-row{display:grid;grid-template-columns:1fr 28px 1fr;align-items:center;gap:8px;margin-bottom:10px;}
.team{display:flex;align-items:center;gap:7px;}
.team.r{flex-direction:row-reverse;text-align:right;}
.team img{width:24px;height:18px;border-radius:2px;}
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
.pbadge{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:18px;flex-shrink:0;}
.pb-6{background:#0a2a0a;color:#2ecc71;border:2px solid #2ecc71;}
.pb-3{background:#0a2a0a;color:#27ae60;border:2px solid #27ae60;}
.pb-0{background:#2a0a0a;color:var(--red);border:2px solid var(--red);}
.pb-q{background:var(--g2);color:var(--muted);border:2px solid var(--border);}
.sb{background:var(--g1);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.sb-head{display:grid;grid-template-columns:44px 1fr 60px 60px 60px;padding:10px 16px;background:var(--g3);font-size:10px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;}
.sb-row{display:grid;grid-template-columns:44px 1fr 60px 60px 60px;padding:12px 16px;border-top:1px solid #0a1a0e;align-items:center;}
.sb-row.p1{background:#0e2014;}
.rnk{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--muted);}
.rnk.g{color:var(--gold);}
.rnk.s{color:#c0c0c0;}
.rnk.b{color:#cd7f32;}
.pname{font-weight:600;font-size:14px;}
.pcol{text-align:center;font-family:'Bebas Neue',sans-serif;}
.pcol.tot{font-size:26px;color:var(--gold);}
.pcol.sub{font-size:18px;color:var(--muted);}
.pcol.mxc{font-size:18px;color:var(--green);}
.admin-panel{background:var(--g2);border:1px solid #3d1515;border-radius:12px;padding:20px;margin-bottom:16px;}
.admin-panel h2{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:var(--red);margin-bottom:16px;}
.a-sec{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border);}
.a-sec:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.a-sec h3{font-size:12px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:12px;}
.a-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.lock-status{display:flex;align-items:center;gap:8px;font-size:13px;}
.ldot{width:10px;height:10px;border-radius:50%;}
.ldot.open{background:var(--green);}
.ldot.closed{background:var(--red);}
.btn{padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:'Outfit',sans-serif;}
.btn-gold{background:var(--gold);color:#000;}
.btn-red{background:var(--red);color:#fff;}
.btn-green{background:#1e8449;color:#fff;}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border);}
.btn-sm{padding:6px 12px;font-size:12px;}
.inp{flex:1;background:var(--g1);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--txt);font-family:'Outfit',sans-serif;font-size:14px;outline:none;}
.inp:focus{border-color:var(--gold);}
.inp.red:focus{border-color:var(--red);}
.add-row{display:flex;gap:8px;}
.pmgmt{display:flex;flex-direction:column;gap:6px;}
.pmgmt-row{display:flex;align-items:center;justify-content:space-between;background:var(--g1);border:1px solid var(--border);border-radius:8px;padding:8px 14px;}
.pmgmt-name{font-weight:600;font-size:14px;}
.pmgmt-pts{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold);}
.pmgmt-r{display:flex;align-items:center;gap:12px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);}
.login-box{background:var(--g2);border:1px solid #3d1515;border-radius:16px;padding:32px;width:min(320px,90vw);text-align:center;}
.login-box h2{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:3px;color:var(--red);margin-bottom:6px;}
.login-box p{color:var(--muted);font-size:13px;margin-bottom:20px;}
.login-box .inp{width:100%;margin-bottom:12px;text-align:center;font-size:16px;}
.login-err{color:var(--red);font-size:12px;margin-top:8px;}
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
  .sb-head,.sb-row{grid-template-columns:36px 1fr 50px 50px 50px;}
  .sinp{width:38px;height:38px;font-size:18px;}
  .tn{font-size:12px;}
}
`;

export default function App() {
  const [tab, setTab] = useState("pronosticos");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [players, setPlayers] = useState([]);
  const [preds, setPreds] = useState({});
  const [results, setResults] = useState({});
  const [locked, setLocked] = useState(false);
  const [active, setActive] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [toast, setToast] = useState({ msg:"", type:"save", show:false });
  const [lastSync, setLastSync] = useState(null);

  const showToast = (msg, type="save") => {
    setToast({ msg, type, show:true });
    setTimeout(() => setToast(t => ({...t, show:false})), 2000);
  };

  const loadData = useCallback(async (silent=false) => {
    if (!silent) setLoading(true); else setSyncing(true);
    const data = await dbGet();
    if (data.players) { setPlayers(data.players); if (!active && data.players[0]) setActive(data.players[0]); }
    if (data.preds) setPreds(data.preds);
    if (data.results) setResults(data.results);
    if (data.locked !== undefined) setLocked(data.locked);
    setLastSync(new Date());
    if (!silent) setLoading(false); else setSyncing(false);
  }, [active]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { const iv = setInterval(() => loadData(true), 15000); return () => clearInterval(iv); }, [loadData]);

  const saveAll = async (patch) => {
    setSyncing(true);
    const next = { players, preds, results, locked, ...patch };
    const ok = await dbSet(next);
    if (ok) { showToast("Guardado"); setLastSync(new Date()); }
    else showToast("Error al guardar", "warn");
    setSyncing(false);
    return next;
  };

  const addPlayer = async () => {
    const n = newName.trim();
    if (!n || players.includes(n)) return;
    const np = [...players, n];
    setPlayers(np); setActive(n); setNewName("");
    await saveAll({ players: np });
  };

  const removePlayer = async (name) => {
    const np = players.filter(x => x !== name);
    const nd = {...preds}; delete nd[name];
    setPlayers(np); setPreds(nd);
    if (active === name) setActive(np[0] || "");
    await saveAll({ players: np, preds: nd });
    showToast(name + " eliminado", "warn");
  };

  const setPred = async (player, matchId, val) => {
    if (locked) { showToast("Pronosticos cerrados", "warn"); return; }
    const np = { ...preds, [player]: { ...(preds[player]||{}), [matchId]: val } };
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

  const toggleLock = async () => {
    const next = !locked; setLocked(next);
    await saveAll({ locked: next });
    showToast(next ? "Pronosticos cerrados" : "Pronosticos abiertos", next ? "warn" : "save");
  };

  const playerStats = (player) => {
    let tot=0, mexPts=0, correct=0, exact=0;
    for (const m of ALL_MATCHES) {
      const pred = (preds[player]||{})[m.id];
      const real = results[m.id];
      const p = calcPoints(pred, real, isMex(m));
      if (p !== null) { tot+=p; if(p>0) correct++; if(isMex(m)) mexPts+=p; if(p===6) exact++; }
    }
    return { tot, mexPts, correct, exact };
  };

  const myStats = active ? playerStats(active) : { tot:0, mexPts:0, correct:0, exact:0 };
  const mexFilled = ALL_MATCHES.filter(isMex).filter(m => {
    const pr = (preds[active]||{})[m.id];
    return Array.isArray(pr) && pr[0]!=="" && pr[1]!=="";
  }).length;
  const scoreboard = [...players].map(p=>({name:p,...playerStats(p)})).sort((a,b)=>b.tot-a.tot);

  const tryLogin = () => {
    if (loginPass === ADMIN_PASS) {
      setIsAdmin(true); setShowLogin(false); setLoginPass(""); setLoginErr("");
      setTab("admin"); showToast("Modo admin activado");
    } else { setLoginErr("Contrasena incorrecta"); setLoginPass(""); }
  };

  const Badge = ({ pts }) => {
    if (pts===null) return <div className="pbadge pb-q">?</div>;
    if (pts===6) return <div className="pbadge pb-6">6</div>;
    if (pts===3) return <div className="pbadge pb-3">3</div>;
    return <div className="pbadge pb-0">0</div>;
  };

  const TeamName = ({ team }) => (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <img src={getFlag(team)} alt={team} style={{width:24,height:18,borderRadius:2}} onError={e=>e.target.style.display='none'} />
      <span className={`tn ${team==="Mexico"?"mx":""}`}>{team}</span>
    </div>
  );

  const MatchCard = ({ m }) => {
    const mexico = isMex(m);
    const pred = (preds[active]||{})[m.id];
    const real = results[m.id] || null;
    const pts = calcPoints(pred, real, mexico);
    return (
      <div className={`mcard ${mexico?"mx":""}`}>
        {mexico && <div className="mx-banner">PARTIDO MEXICO - MARCADOR EXACTO - PUNTOS DOBLES</div>}
        <div className="minner">
          <div className="teams-row">
            <TeamName team={m.local} />
            <span className="vs-lbl">VS</span>
            <div style={{display:"flex",alignItems:"center",gap:6,flexDirection:"row-reverse"}}>
              <img src={getFlag(m.visit)} alt={m.visit} style={{width:24,height:18,borderRadius:2}} onError={e=>e.target.style.display='none'} />
              <span className={`tn ${m.visit==="Mexico"?"mx":""}`}>{m.visit}</span>
            </div>
          </div>
          {real && real[0]!==""&&real[1]!==""&&(
            <div className="result-score">{real[0]} - {real[1]}</div>
          )}
          <div className="controls">
            {mexico ? (
              <div>
                <div className="ctrl-lbl">Tu pronostico (marcador exacto)</div>
                <div className="score-inputs">
                  <input className="sinp" type="number" min="0" max="99" placeholder="0" disabled={locked}
                    value={Array.isArray(pred)?pred[0]:""}
                    onChange={e=>{const c=Array.isArray(pred)?pred:["",""]; setPred(active,m.id,[e.target.value,c[1]]);}}/>
                  <span className="sdash">-</span>
                  <input className="sinp" type="number" min="0" max="99" placeholder="0" disabled={locked}
                    value={Array.isArray(pred)?pred[1]:""}
                    onChange={e=>{const c=Array.isArray(pred)?pred:["",""]; setPred(active,m.id,[c[0],e.target.value]);}}/>
                </div>
                {locked ? <div className="hint lk">Pronosticos cerrados</div>
                        : <div className="hint mx">Exacto = 6 pts | Solo resultado = 3 pts</div>}
              </div>
            ) : (
              <div>
                <div className="ctrl-lbl">Tu pronostico</div>
                <div className="lev-btns">
                  {[{val:"L",label:"Local"},{val:"E",label:"Empate"},{val:"V",label:"Visit."}].map(o=>(
                    <button key={o.val} disabled={locked}
                      className={`lev-btn ${pred===o.val?"sel-"+o.val:""}`}
                      onClick={()=>setPred(active,m.id,o.val)}>{o.label}</button>
                  ))}
                </div>
                {locked ? <div className="hint lk">Pronosticos cerrados</div>
                        : <div className="hint">Acierto = 3 pts</div>}
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div className="ctrl-lbl">Pts</div>
              <Badge pts={pts}/>
            </div>
          </div>
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
            <span className="pill">Datos en la nube</span>
          </div>
          {locked && <div className="locked-banner">PRONOSTICOS CERRADOS</div>}
        </div>

        <div className="tabs">
          {[{id:"pronosticos",label:"Pronosticos"},{id:"tabla",label:"Tabla"},{id:"jugadores",label:"Jugadores"}].map(t=>(
            <button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
          {isAdmin
            ? <button className={`tab adm ${tab==="admin"?"on":""}`} onClick={()=>setTab("admin")}>Admin</button>
            : <button className="tab" onClick={()=>setShowLogin(true)}>Admin</button>}
        </div>

        <div className="sync-bar">
          <div className={`sync-dot ${syncing?"spin":""}`}/>
          <span>{syncing?"Sincronizando...":lastSync?`Sync ${lastSync.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}`:""}</span>
        </div>

        {tab==="pronosticos" && (
          players.length===0
            ? <div className="empty"><div style={{fontSize:52,marginBottom:12}}>👥</div><div>El admin aun no ha agregado participantes</div></div>
            : <>
                <div className="pbar">
                  <div>
                    <div className="pbar-lbl">Capturando pronosticos de</div>
                    <div className="pbar-name">{active}</div>
                  </div>
                  <div className="psel">
                    {players.map(p=><button key={p} className={`pbtn ${active===p?"on":""}`} onClick={()=>setActive(p)}>{p}</button>)}
                  </div>
                </div>
                <div className="sbar">
                  <div className="stat"><div className="stat-val" style={{color:"var(--gold)"}}>{myStats.tot}</div><div className="stat-lbl">Puntos</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"var(--green)"}}>{myStats.correct}</div><div className="stat-lbl">Acertados</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"#2ecc71"}}>{myStats.exact}</div><div className="stat-lbl">Exactos Mx</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"var(--green)"}}>{mexFilled}/3</div><div className="stat-lbl">Mx capturados</div></div>
                  <div className="stat"><div className="stat-val" style={{color:"var(--green)"}}>{myStats.mexPts}</div><div className="stat-lbl">Pts Mexico</div></div>
                </div>
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
                  <div className="sb-head"><div>POS</div><div>JUGADOR</div><div style={{textAlign:"center"}}>PTS</div><div style={{textAlign:"center"}}>ACIERTOS</div><div style={{textAlign:"center"}}>PTS MX</div></div>
                  {scoreboard.map((p,i)=>(
                    <div key={p.name} className={`sb-row ${i===0?"p1":""}`}>
                      <div className={`rnk ${i===0?"g":i===1?"s":i===2?"b":""}`}>{i===0?"1":i===1?"2":i===2?"3":i+1}</div>
                      <div className="pname">{p.name}</div>
                      <div className="pcol tot">{p.tot}</div>
                      <div className="pcol sub">{p.correct}</div>
                      <div className="pcol mxc">{p.mexPts}</div>
                    </div>
                  ))}
                </div>
            }
          </>
        )}

        {tab==="jugadores" && (
          <>
            <div className="stitle">PARTICIPANTES</div>
            <div className="rules-box">
              <h3>Reglas de puntuacion</h3>
              <div className="rule-row"><span>✅</span><div><strong>Todos los partidos:</strong> elegir bien Local / Empate / Visitante = <strong>3 pts</strong></div></div>
              <div className="rule-row"><span>🇲🇽</span><div><strong>Mexico resultado correcto:</strong> acertar quien gana o empate = <strong>3 pts</strong></div></div>
              <div className="rule-row"><span>⚡</span><div><strong>Mexico marcador exacto:</strong> acertar goles de ambos = <strong>6 pts</strong></div></div>
              <div className="rule-row"><span>❌</span><div><strong>Fallo:</strong> 0 pts</div></div>
              <div className="rule-row"><span>🔒</span><div>El admin cierra pronosticos antes de que empiecen los partidos.</div></div>
              <div className="rule-row"><span>🌐</span><div>Datos en la nube. Todos ven lo mismo en tiempo real.</div></div>
            </div>
            {scoreboard.length>0 && (
              <div className="sb">
                <div className="sb-head"><div>POS</div><div>JUGADOR</div><div style={{textAlign:"center"}}>PTS</div><div style={{textAlign:"center"}}>ACIERTOS</div><div style={{textAlign:"center"}}>PTS MX</div></div>
                {scoreboard.map((p,i)=>(
                  <div key={p.name} className={`sb-row ${i===0?"p1":""}`}>
                    <div className={`rnk ${i===0?"g":i===1?"s":i===2?"b":""}`}>{i===0?"1":i===1?"2":i===2?"3":i+1}</div>
                    <div className="pname">{p.name}</div>
                    <div className="pcol tot">{p.tot}</div>
                    <div className="pcol sub">{p.correct}</div>
                    <div className="pcol mxc">{p.mexPts}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab==="admin" && isAdmin && (
          <div className="admin-panel">
            <h2>PANEL DE ADMIN</h2>
            <div className="a-sec">
              <h3>Control de pronosticos</h3>
              <div className="a-row">
                <div className="lock-status">
                  <div className={`ldot ${locked?"closed":"open"}`}/>
                  <span>{locked ? "Pronosticos CERRADOS" : "Pronosticos ABIERTOS"}</span>
                </div>
                <button className={`btn ${locked?"btn-green":"btn-red"}`} onClick={toggleLock}>
                  {locked ? "Abrir pronosticos" : "Cerrar pronosticos"}
                </button>
              </div>
            </div>
            <div className="a-sec">
              <h3>Agregar participante</h3>
              <div className="add-row">
                <input className="inp" placeholder="Nombre del participante..."
                  value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
                <button className="btn btn-gold" onClick={addPlayer}>+ Agregar</button>
              </div>
            </div>
            <div className="a-sec">
              <h3>Gestionar participantes</h3>
              {players.length===0
                ? <div style={{color:"var(--muted)",fontSize:13}}>No hay participantes aun</div>
                : <div className="pmgmt">
                    {scoreboard.map((p,i)=>(
                      <div key={p.name} className="pmgmt-row">
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{color:"var(--muted)",fontSize:12,minWidth:20}}>{i+1}.</span>
                          <span className="pmgmt-name">{p.name}</span>
                        </div>
                        <div className="pmgmt-r">
                          <span className="pmgmt-pts">{p.tot} pts</span>
                          <button className="btn btn-ghost btn-sm"
                            onClick={()=>{ if(window.confirm("Eliminar a "+p.name+"?")) removePlayer(p.name); }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
            <div className="a-sec">
              <h3>Ingresar resultados reales</h3>
              {Object.entries(GRUPOS).map(([grp])=>(
                <div key={grp} className="grp-block" style={{marginBottom:16}}>
                  <div className="grp-hdr"><span className="grp-badge">GRUPO {grp}</span></div>
                  {ALL_MATCHES.filter(m=>m.grp===grp).map(m=>{
                    const real=results[m.id]||["",""];
                    const mexico=isMex(m);
                    return (
                      <div key={m.id} className={`mcard ${mexico?"mx":""}`} style={{marginBottom:6}}>
                        {mexico&&<div className="mx-banner">PARTIDO MEXICO</div>}
                        <div className="minner">
                          <div className="teams-row">
                            <TeamName team={m.local}/>
                            <span className="vs-lbl">VS</span>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexDirection:"row-reverse"}}>
                              <img src={getFlag(m.visit)} alt={m.visit} style={{width:24,height:18,borderRadius:2}} onError={e=>e.target.style.display='none'}/>
                              <span className={`tn ${m.visit==="Mexico"?"mx":""}`}>{m.visit}</span>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:12}}>
                            <div>
                              <div className="ctrl-lbl">Resultado real</div>
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

      {showLogin && (
        <div className="overlay" onClick={()=>{setShowLogin(false);setLoginErr("");setLoginPass("");}}>
          <div className="login-box" onClick={e=>e.stopPropagation()}>
            <h2>ADMIN</h2>
            <p>Ingresa la contrasena de administrador</p>
            <input className="inp red" type="password" placeholder="Contrasena..."
              value={loginPass} onChange={e=>setLoginPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&tryLogin()} autoFocus/>
            {loginErr && <div className="login-err">{loginErr}</div>}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>{setShowLogin(false);setLoginErr("");setLoginPass("");}}>Cancelar</button>
              <button className="btn btn-red" style={{flex:1}} onClick={tryLogin}>Entrar</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast.type} ${toast.show?"show":""}`}>{toast.msg}</div>
    </>
  );
}
