import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

:root{
  --g:#00a67d;--gd:#065f46;--gl:#34d399;
  --navy:#0d0d1a;--navy2:#13131f;--navy3:#1c1c30;
  --white:#ffffff;--off:#f7f8f7;--muted:#8a9590;
  --border:rgba(255,255,255,0.07);
  --ease:cubic-bezier(0.16,1,0.3,1);
  --ease2:cubic-bezier(0.34,1.56,0.64,1);
}

.lp{font-family:'Inter',sans-serif;background:var(--off);color:#111;overflow-x:hidden}

/* ── NAV ── */
.lp-nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:0 clamp(1.5rem,4vw,3rem);
  transition:background .4s var(--ease),border-color .4s;
  border-bottom:1px solid transparent;
}
.lp-nav.solid{
  background:rgba(13,13,26,0.85);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border-color:var(--border);
}
.lp-logo{display:flex;align-items:center;gap:.55rem;text-decoration:none}
.lp-logo-mark{
  width:34px;height:34px;border-radius:9px;background:var(--g);
  display:flex;align-items:center;justify-content:center;
  font-family:'Manrope',sans-serif;font-weight:900;font-size:.95rem;color:#fff;
  box-shadow:0 0 20px rgba(0,166,125,0.4);
}
.lp-logo-text{font-family:'Manrope',sans-serif;font-weight:800;font-size:1.15rem;color:#fff;letter-spacing:-.02em}
.lp-nav-links{display:flex;gap:2rem}
.lp-nav-links a{font-size:.85rem;font-weight:500;color:rgba(255,255,255,.5);text-decoration:none;transition:color .2s}
.lp-nav-links a:hover{color:#fff}
.lp-nav-ctas{display:flex;gap:.75rem;align-items:center}
.lp-nav-ghost{
  font-size:.85rem;font-weight:600;color:rgba(255,255,255,.65);
  background:none;border:none;cursor:pointer;padding:.4rem .9rem;
  border-radius:8px;font-family:'Inter',sans-serif;transition:color .2s;
}
.lp-nav-ghost:hover{color:#fff}
.lp-nav-cta{
  font-size:.85rem;font-weight:700;color:#fff;
  background:var(--g);border:none;cursor:pointer;
  padding:.45rem 1.1rem;border-radius:9px;
  font-family:'Inter',sans-serif;
  box-shadow:0 0 0 0 rgba(0,166,125,0);
  transition:background .2s, box-shadow .3s, transform .2s var(--ease2);
}
.lp-nav-cta:hover{background:var(--gd);transform:scale(1.04);box-shadow:0 0 28px rgba(0,166,125,0.45)}

/* ── HERO ── */
.lp-hero{
  min-height:100vh;position:relative;overflow:hidden;
  background:var(--navy);
  display:grid;grid-template-columns:1fr 1fr;align-items:center;
  padding:120px clamp(1.5rem,5vw,5rem) 80px;
  gap:4rem;
}
@media(max-width:900px){.lp-hero{grid-template-columns:1fr;padding-top:110px}}
.lp-hero-mesh{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 60% 60% at var(--mx,30%) var(--my,40%), rgba(0,166,125,.18) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 80% 10%, rgba(99,102,241,.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 10% 80%, rgba(249,115,22,.08) 0%, transparent 60%);
  transition:background .1s linear;
}
.lp-hero-grid-lines{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%);
}
.lp-hero-left{position:relative;z-index:1}
.lp-hero-badge{
  display:inline-flex;align-items:center;gap:.5rem;
  background:rgba(0,166,125,.1);border:1px solid rgba(0,166,125,.25);
  color:#34d399;font-size:.72rem;font-weight:700;
  padding:.3rem .85rem;border-radius:999px;letter-spacing:.06em;text-transform:uppercase;
  margin-bottom:1.75rem;
  opacity:0;transform:translateY(12px);
  transition:opacity .6s var(--ease), transform .6s var(--ease);
}
.lp-hero-badge.in{opacity:1;transform:translateY(0)}
.lp-badge-pulse{
  width:6px;height:6px;border-radius:50%;background:#34d399;
  animation:badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}

.lp-hero-h1{
  font-family:'Manrope',sans-serif;font-weight:900;
  font-size:clamp(2.6rem,5.5vw,4.2rem);
  line-height:1.06;letter-spacing:-.04em;color:#fff;
  margin-bottom:1.5rem;
}
.lp-word{
  display:inline-block;overflow:hidden;vertical-align:bottom;
  padding-right:.18em;
}
.lp-word-inner{
  display:inline-block;
  transform:translateY(110%) rotate(3deg);opacity:0;
  transition:transform .7s var(--ease), opacity .5s ease;
}
.lp-word-inner.in{transform:translateY(0) rotate(0deg);opacity:1}
.lp-word-green .lp-word-inner{color:var(--gl)}

.lp-hero-sub{
  font-size:1.05rem;color:rgba(255,255,255,.5);line-height:1.75;
  max-width:480px;margin-bottom:2.5rem;
  opacity:0;transform:translateY(16px);
  transition:opacity .7s .5s var(--ease),transform .7s .5s var(--ease);
}
.lp-hero-sub.in{opacity:1;transform:translateY(0)}

.lp-hero-actions{
  display:flex;gap:1rem;flex-wrap:wrap;
  opacity:0;transform:translateY(16px);
  transition:opacity .7s .65s var(--ease),transform .7s .65s var(--ease);
}
.lp-hero-actions.in{opacity:1;transform:translateY(0)}

.lp-magbtn{
  position:relative;overflow:hidden;cursor:pointer;border:none;
  font-family:'Inter',sans-serif;font-weight:700;border-radius:12px;
  transition:transform .3s var(--ease2),box-shadow .3s;
}
.lp-magbtn-primary{
  background:var(--g);color:#fff;
  padding:.85rem 2rem;font-size:1rem;
  box-shadow:0 4px 32px rgba(0,166,125,.35);
}
.lp-magbtn-primary:hover{box-shadow:0 8px 48px rgba(0,166,125,.5)}
.lp-magbtn-primary::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at var(--bx,50%) var(--by,50%), rgba(255,255,255,.25) 0%, transparent 60%);
  opacity:0;transition:opacity .3s;
}
.lp-magbtn-primary:hover::after{opacity:1}
.lp-magbtn-ghost{
  background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);
  padding:.85rem 2rem;font-size:1rem;
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(8px);
}
.lp-magbtn-ghost:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.25)}

.lp-hero-trust{
  display:flex;align-items:center;gap:1rem;margin-top:2rem;
  opacity:0;transition:opacity .7s .8s;
}
.lp-hero-trust.in{opacity:1}
.lp-trust-avatars{display:flex}
.lp-trust-av{
  width:28px;height:28px;border-radius:50%;border:2px solid var(--navy);
  margin-left:-7px;display:flex;align-items:center;justify-content:center;
  font-size:.55rem;font-weight:800;color:#fff;
}
.lp-trust-av:first-child{margin-left:0}
.lp-trust-text{font-size:.78rem;color:rgba(255,255,255,.4);font-weight:500}
.lp-trust-stars{color:#f59e0b;font-size:.72rem;letter-spacing:.05em}

/* ── HERO RIGHT — INTERACTIVE DASHBOARD ── */
.lp-hero-right{
  position:relative;z-index:1;
  opacity:0;transform:translateX(40px) scale(.97);
  transition:opacity .9s .3s var(--ease),transform .9s .3s var(--ease);
}
@media(max-width:900px){.lp-hero-right{display:none}}
.lp-hero-right.in{opacity:1;transform:translateX(0) scale(1)}

.lp-dash{
  border-radius:16px;overflow:hidden;
  background:#111827;
  box-shadow:0 40px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06);
  transform:perspective(1200px) rotateY(var(--ry,-6deg)) rotateX(var(--rx,3deg));
  transition:transform .15s linear;
}
.lp-dash-bar{
  height:32px;background:#0d1117;display:flex;align-items:center;padding:0 .75rem;gap:.4rem;
}
.lp-dash-dot{width:9px;height:9px;border-radius:50%}
.lp-dash-dot:nth-child(1){background:#ef4444}
.lp-dash-dot:nth-child(2){background:#f59e0b}
.lp-dash-dot:nth-child(3){background:#22c55e}
.lp-dash-addr{
  flex:1;height:17px;background:#1f2937;border-radius:4px;margin-left:.5rem;
  display:flex;align-items:center;padding:0 .5rem;
  font-size:.58rem;color:#4b5563;font-family:'Inter',sans-serif;
}
.lp-dash-body{display:flex;height:340px}
.lp-dash-sidebar{
  width:160px;background:#0d1117;flex-shrink:0;
  display:flex;flex-direction:column;padding:.75rem .5rem;gap:.2rem;
  border-right:1px solid rgba(255,255,255,.05);
}
.lp-dash-brand{
  font-family:'Manrope',sans-serif;font-weight:800;font-size:.85rem;color:#fff;
  padding:.3rem .5rem .75rem;letter-spacing:-.02em;
}
.lp-dash-nav{
  height:30px;border-radius:7px;display:flex;align-items:center;
  padding:0 .6rem;gap:.4rem;font-size:.68rem;cursor:pointer;
  color:rgba(255,255,255,.4);transition:background .15s,color .15s;
  font-family:'Inter',sans-serif;font-weight:500;
  border:none;background:none;width:100%;text-align:left;
}
.lp-dash-nav:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.7)}
.lp-dash-nav.active{background:rgba(0,166,125,.2);color:#34d399}
.lp-dash-nav-dot{width:6px;height:6px;border-radius:2px;background:currentColor;flex-shrink:0}
.lp-dash-content{flex:1;background:#f8f9f8;overflow:hidden;position:relative}

/* Dashboard view */
.lp-dv{position:absolute;inset:0;padding:.9rem;display:flex;flex-direction:column;gap:.6rem;transition:opacity .3s,transform .3s var(--ease)}
.lp-dv.out{opacity:0;transform:translateX(-12px);pointer-events:none}
.lp-dv.in-from-right{opacity:0;transform:translateX(12px);pointer-events:none}
.lp-dv.show{opacity:1;transform:translateX(0)}

.lp-dv-title{font-family:'Manrope',sans-serif;font-weight:700;font-size:.78rem;color:#111;letter-spacing:-.01em}
.lp-dv-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}
.lp-dv-stat{
  background:#fff;border-radius:8px;padding:.5rem .6rem;
  box-shadow:0 1px 4px rgba(0,0,0,.06);
}
.lp-dv-stat-l{font-size:.55rem;color:#6d7a73;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.lp-dv-stat-v{font-family:'Manrope',sans-serif;font-size:.95rem;font-weight:800;color:#111;margin-top:1px}
.lp-dv-stat-t{font-size:.55rem;font-weight:700;color:#008767;margin-top:1px}
.lp-dv-list{display:flex;flex-direction:column;gap:.3rem;flex:1}
.lp-dv-row{
  background:#fff;border-radius:7px;padding:.4rem .6rem;
  display:flex;align-items:center;gap:.5rem;
  box-shadow:0 1px 3px rgba(0,0,0,.04);
  animation:rowIn .35s var(--ease) both;
}
@keyframes rowIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
.lp-dv-av{
  width:22px;height:22px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:.5rem;font-weight:800;color:#fff;
}
.lp-dv-name{font-size:.65rem;font-weight:600;color:#111;flex:1}
.lp-dv-pill{font-size:.52rem;font-weight:700;padding:2px 5px;border-radius:4px}
.lp-dv-pill.g{background:#d1fae5;color:#065f46}
.lp-dv-pill.a{background:#fef3c7;color:#92400e}
.lp-dv-pill.r{background:#ffdad6;color:#93000a}
.lp-dv-pill.b{background:#dbeafe;color:#1e40af}

/* Clients view */
.lp-cv-search{
  height:26px;background:#fff;border-radius:7px;border:1px solid #e0e0e0;
  display:flex;align-items:center;padding:0 .6rem;gap:.4rem;margin-bottom:.5rem;
}
.lp-cv-search-icon{font-size:.65rem;color:#aaa}
.lp-cv-search-text{font-size:.62rem;color:#aaa;font-family:'Inter',sans-serif}
.lp-cv-card{
  background:#fff;border-radius:8px;padding:.55rem .7rem;
  display:flex;align-items:center;gap:.55rem;
  box-shadow:0 1px 4px rgba(0,0,0,.05);
  animation:rowIn .4s var(--ease) both;
}
.lp-cv-info{flex:1}
.lp-cv-name{font-size:.67rem;font-weight:700;color:#111}
.lp-cv-sub{font-size:.57rem;color:#aaa;margin-top:1px}
.lp-cv-bar-track{height:3px;background:#f0f0f0;border-radius:2px;width:60px;margin-top:4px}
.lp-cv-bar-fill{height:3px;border-radius:2px;background:#008767;transition:width .8s var(--ease)}

/* AI Plan view */
.lp-ai-header{
  background:linear-gradient(135deg,#0d1117,#1c1c30);
  border-radius:8px;padding:.6rem .75rem;margin-bottom:.5rem;
  display:flex;align-items:center;justify-content:space-between;
}
.lp-ai-label{font-size:.62rem;color:#34d399;font-weight:700;font-family:'Inter',sans-serif}
.lp-ai-status{font-size:.55rem;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:.3rem}
.lp-ai-dot{width:5px;height:5px;border-radius:50%;background:#34d399;animation:aiPulse 1s ease-in-out infinite}
@keyframes aiPulse{0%,100%{opacity:1}50%{opacity:.2}}
.lp-ai-stream{
  background:#fff;border-radius:8px;padding:.65rem .75rem;flex:1;
  font-size:.63rem;color:#3d4a43;font-family:'Inter',sans-serif;line-height:1.75;
  min-height:120px;position:relative;overflow:hidden;
}
.lp-ai-cursor{
  display:inline-block;width:2px;height:.75em;background:#008767;
  vertical-align:middle;animation:blink .7s ease-in-out infinite;margin-left:1px;
}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.lp-ai-tag{
  display:inline-block;background:#d1fae5;color:#065f46;
  font-size:.52rem;font-weight:700;padding:2px 6px;border-radius:4px;margin:2px;
}

/* Analytics view */
.lp-an-bars{display:flex;align-items:flex-end;gap:.4rem;height:100px;padding:0 .2rem}
.lp-an-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:.25rem}
.lp-an-bar{
  width:100%;border-radius:4px 4px 0 0;background:var(--g);
  transform-origin:bottom;animation:barGrow .8s var(--ease) both;
}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.lp-an-label{font-size:.52rem;color:#aaa;text-align:center}

/* ── MARQUEE ── */
.lp-marquee-wrap{
  background:var(--navy);border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  overflow:hidden;height:44px;display:flex;align-items:center;
}
.lp-marquee-track{
  display:flex;gap:0;white-space:nowrap;
  animation:marquee 28s linear infinite;
}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.lp-marquee-item{
  display:inline-flex;align-items:center;gap:.6rem;padding:0 2rem;
  font-size:.8rem;font-weight:600;color:rgba(255,255,255,.3);
  letter-spacing:.01em;white-space:nowrap;
}
.lp-marquee-sep{color:var(--g);font-size:.6rem}

/* ── SECTIONS ── */
.lp-section{padding:clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem);max-width:1200px;margin:0 auto}
.lp-tag{
  display:inline-flex;align-items:center;gap:.4rem;
  font-size:.7rem;font-weight:700;color:var(--g);letter-spacing:.08em;
  text-transform:uppercase;margin-bottom:1.1rem;
}
.lp-tag-line{width:20px;height:2px;background:var(--g);border-radius:1px}
.lp-h2{
  font-family:'Manrope',sans-serif;font-weight:900;
  font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em;line-height:1.1;
  color:#0d0d1a;margin-bottom:1rem;
}
.lp-sub{font-size:1rem;color:#6d7a73;line-height:1.8;max-width:520px;margin-bottom:3.5rem}

/* ── BENTO FEATURES ── */
.lp-bento{
  display:grid;
  grid-template-columns:repeat(12,1fr);
  grid-template-rows:auto auto;
  gap:1rem;
}
.lp-bento-card{
  background:#fff;border-radius:20px;padding:2rem;
  border:1px solid #eaeaea;position:relative;overflow:hidden;
  transform:translateY(30px);opacity:0;
  transition:transform .6s var(--ease),opacity .6s,box-shadow .3s;
}
.lp-bento-card.visible{transform:translateY(0);opacity:1}
.lp-bento-card:hover{box-shadow:0 16px 48px rgba(0,0,0,.09)}
.lp-bento-card::before{
  content:'';position:absolute;inset:0;opacity:0;
  background:radial-gradient(circle at var(--cx,50%) var(--cy,50%), rgba(0,166,125,.06) 0%, transparent 60%);
  transition:opacity .4s;pointer-events:none;
}
.lp-bento-card:hover::before{opacity:1}
.lp-b1{grid-column:span 7}
.lp-b2{grid-column:span 5}
.lp-b3{grid-column:span 4}
.lp-b4{grid-column:span 4}
.lp-b5{grid-column:span 4}
@media(max-width:800px){
  .lp-b1,.lp-b2,.lp-b3,.lp-b4,.lp-b5{grid-column:span 12}
}
.lp-bento-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:1.3rem;margin-bottom:1.25rem;
}
.lp-bento-h{font-family:'Manrope',sans-serif;font-weight:800;font-size:1.1rem;color:#0d0d1a;margin-bottom:.5rem}
.lp-bento-p{font-size:.88rem;color:#6d7a73;line-height:1.7}
.lp-bento-accent{position:absolute;bottom:0;right:0;width:120px;height:120px;opacity:.06;pointer-events:none}

/* large card extra */
.lp-bento-mini-preview{
  margin-top:1.5rem;background:#f8f9f8;border-radius:12px;padding:1rem;
  border:1px solid #eaeaea;
}
.lp-mini-stat-row{display:flex;gap:.6rem;margin-bottom:.5rem}
.lp-mini-stat{
  flex:1;background:#fff;border-radius:8px;padding:.5rem .6rem;
  box-shadow:0 1px 3px rgba(0,0,0,.05);
}
.lp-mini-stat-l{font-size:.55rem;color:#aaa;font-weight:600;text-transform:uppercase}
.lp-mini-stat-v{font-family:'Manrope',sans-serif;font-size:.88rem;font-weight:800;color:#111}
.lp-mini-bar{height:4px;background:#f0f0f0;border-radius:2px;margin-top:.4rem}
.lp-mini-bar-fill{height:4px;border-radius:2px;background:linear-gradient(90deg,var(--g),var(--gl))}

/* ── DARK STATS ── */
.lp-stats-dark{
  background:var(--navy);padding:5rem clamp(1.5rem,5vw,5rem);
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:3rem;text-align:center;position:relative;overflow:hidden;
}
.lp-stats-dark::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 50% 60% at 30% 50%, rgba(0,166,125,.1) 0%, transparent 70%),
    radial-gradient(ellipse 40% 50% at 80% 50%, rgba(99,102,241,.08) 0%, transparent 70%);
  pointer-events:none;
}
.lp-stat-num{
  font-family:'Manrope',sans-serif;font-weight:900;
  font-size:clamp(2.5rem,5vw,3.5rem);color:#fff;letter-spacing:-.04em;
  line-height:1;margin-bottom:.4rem;
}
.lp-stat-num em{color:var(--gl);font-style:normal}
.lp-stat-l{font-size:.85rem;color:rgba(255,255,255,.4);font-weight:500}

/* ── TESTIMONIALS CAROUSEL ── */
.lp-testi-wrap{overflow:hidden}
.lp-testi-track{
  display:flex;gap:1.25rem;
  transition:transform .6s var(--ease);
}
.lp-testi-card{
  flex:0 0 calc(33.333% - .85rem);background:#fff;border-radius:20px;
  padding:2rem;border:1px solid #eaeaea;
  transform:translateY(30px);opacity:0;
  transition:transform .6s var(--ease),opacity .6s,box-shadow .3s;
}
@media(max-width:900px){.lp-testi-card{flex:0 0 calc(85% - .5rem)}}
.lp-testi-card.visible{transform:translateY(0);opacity:1}
.lp-testi-card:hover{box-shadow:0 12px 40px rgba(0,0,0,.08)}
.lp-testi-stars{color:#f59e0b;font-size:.8rem;margin-bottom:1rem;letter-spacing:.1em}
.lp-testi-q{
  font-size:.95rem;color:#3d4a43;line-height:1.75;
  margin-bottom:1.5rem;font-style:italic;
}
.lp-testi-author{display:flex;align-items:center;gap:.75rem}
.lp-testi-av{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:.75rem;font-weight:800;color:#fff;
}
.lp-testi-name{font-family:'Manrope',sans-serif;font-weight:700;font-size:.88rem;color:#0d0d1a}
.lp-testi-role{font-size:.75rem;color:#aaa;margin-top:1px}
.lp-testi-controls{display:flex;gap:.75rem;margin-top:2rem;align-items:center}
.lp-testi-dot{
  width:8px;height:8px;border-radius:50%;background:#e0e0e0;cursor:pointer;
  transition:background .3s,transform .3s;border:none;
}
.lp-testi-dot.active{background:var(--g);transform:scale(1.3)}

/* ── PRICING ── */
.lp-pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;align-items:stretch}
.lp-price-card{
  background:#fff;border-radius:24px;padding:2.25rem;
  border:2px solid #eaeaea;position:relative;
  transform:translateY(30px);opacity:0;
  transition:transform .6s var(--ease),opacity .6s,box-shadow .25s,border-color .25s;
}
.lp-price-card.visible{transform:translateY(0);opacity:1}
.lp-price-card:hover{box-shadow:0 16px 48px rgba(0,0,0,.09);border-color:#d0d0d0}
.lp-price-card.featured{border-color:transparent;padding:2px}
.lp-price-card.featured:hover{box-shadow:0 20px 60px rgba(0,166,125,.2)}
.lp-price-card-inner{
  border-radius:22px;background:#fff;padding:2.25rem;height:100%;
  display:flex;flex-direction:column;
}
.lp-price-card.featured .lp-price-card-inner{
  background:linear-gradient(160deg,#fff 0%,#f0fdf9 100%);
}
.lp-price-animated-border{
  position:absolute;inset:0;border-radius:24px;
  background:conic-gradient(from var(--angle,0deg), var(--g) 0%, var(--gl) 25%, #6ee7b7 50%, var(--g) 100%);
  z-index:-1;
  animation:rotateBorder 3s linear infinite;
}
@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes rotateBorder{to{--angle:360deg}}
.lp-price-badge{
  display:inline-block;background:linear-gradient(135deg,var(--g),var(--gl));
  color:#fff;font-size:.68rem;font-weight:700;
  padding:.25rem .8rem;border-radius:999px;margin-bottom:1rem;
  letter-spacing:.04em;text-transform:uppercase;
}
.lp-price-tier{font-family:'Manrope',sans-serif;font-weight:800;font-size:1.1rem;color:#0d0d1a;margin-bottom:.3rem}
.lp-price-desc{font-size:.83rem;color:#aaa;margin-bottom:1.5rem}
.lp-price-num{display:flex;align-items:baseline;gap:.2rem;margin-bottom:2rem}
.lp-price-cur{font-size:1.4rem;font-weight:700;color:#0d0d1a}
.lp-price-val{font-family:'Manrope',sans-serif;font-size:3.2rem;font-weight:900;color:#0d0d1a;letter-spacing:-.05em;line-height:1}
.lp-price-period{font-size:.83rem;color:#aaa}
.lp-price-features{list-style:none;display:flex;flex-direction:column;gap:.7rem;flex:1;margin-bottom:1.75rem}
.lp-price-feat{display:flex;align-items:center;gap:.55rem;font-size:.875rem;color:#3d4a43}
.lp-price-check{
  width:18px;height:18px;border-radius:50%;background:var(--g);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:.6rem;flex-shrink:0;
}
.lp-price-cta{
  width:100%;padding:.85rem;border-radius:12px;
  font-family:'Inter',sans-serif;font-size:.9rem;font-weight:700;
  cursor:pointer;border:none;transition:all .2s;
}
.lp-price-cta.outline{background:transparent;color:var(--g);border:2px solid var(--g)}
.lp-price-cta.outline:hover{background:rgba(0,166,125,.06)}
.lp-price-cta.solid{background:var(--g);color:#fff;box-shadow:0 4px 20px rgba(0,166,125,.3)}
.lp-price-cta.solid:hover{background:var(--gd);transform:translateY(-1px);box-shadow:0 6px 28px rgba(0,166,125,.4)}

/* ── FINAL CTA ── */
.lp-final-cta{
  margin:0 clamp(1rem,3vw,3rem) clamp(3rem,6vw,6rem);
  border-radius:28px;
  background:var(--navy);
  padding:clamp(3rem,6vw,6rem) clamp(2rem,5vw,4rem);
  text-align:center;position:relative;overflow:hidden;
}
.lp-final-glow{
  position:absolute;width:500px;height:500px;border-radius:50%;pointer-events:none;
  filter:blur(80px);
}
.lp-final-glow:nth-child(1){background:rgba(0,166,125,.2);top:-150px;left:-100px;animation:glowDrift 8s ease-in-out infinite}
.lp-final-glow:nth-child(2){background:rgba(99,102,241,.15);bottom:-150px;right:-100px;animation:glowDrift 10s 2s ease-in-out infinite reverse}
@keyframes glowDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}}
.lp-final-h{
  font-family:'Manrope',sans-serif;font-weight:900;
  font-size:clamp(2rem,5vw,3.5rem);color:#fff;
  letter-spacing:-.04em;line-height:1.1;margin-bottom:1rem;position:relative;z-index:1;
}
.lp-final-sub{font-size:1.05rem;color:rgba(255,255,255,.5);margin-bottom:2.5rem;position:relative;z-index:1}
.lp-final-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
.lp-final-btn{
  padding:.9rem 2.25rem;border-radius:14px;
  font-family:'Inter',sans-serif;font-size:.95rem;font-weight:700;
  cursor:pointer;border:none;transition:all .25s var(--ease2);
}
.lp-final-btn.white{background:#fff;color:#0d0d1a;box-shadow:0 4px 24px rgba(0,0,0,.2)}
.lp-final-btn.white:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 8px 40px rgba(0,0,0,.3)}
.lp-final-btn.ghost2{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.15)}
.lp-final-btn.ghost2:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.3)}

/* ── FOOTER ── */
.lp-footer{background:var(--navy2);border-top:1px solid var(--border);padding:4rem clamp(1.5rem,5vw,5rem) 2.5rem}
.lp-footer-inner{max-width:1200px;margin:0 auto}
.lp-footer-top{display:flex;justify-content:space-between;flex-wrap:wrap;gap:3rem;padding-bottom:3rem;border-bottom:1px solid var(--border)}
.lp-footer-brand{max-width:280px}
.lp-footer-brand-row{display:flex;align-items:center;gap:.55rem;margin-bottom:.85rem}
.lp-footer-brand-name{font-family:'Manrope',sans-serif;font-weight:800;font-size:1.1rem;color:#fff}
.lp-footer-brand-p{font-size:.83rem;color:rgba(255,255,255,.35);line-height:1.7}
.lp-footer-cols{display:flex;gap:4rem;flex-wrap:wrap}
.lp-footer-col-h{font-family:'Manrope',sans-serif;font-weight:700;font-size:.83rem;color:#fff;margin-bottom:1rem}
.lp-footer-col-links{display:flex;flex-direction:column;gap:.55rem}
.lp-footer-col-links a{font-size:.81rem;color:rgba(255,255,255,.35);text-decoration:none;transition:color .2s}
.lp-footer-col-links a:hover{color:rgba(255,255,255,.8)}
.lp-footer-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-top:2rem}
.lp-footer-copy{font-size:.78rem;color:rgba(255,255,255,.25)}
.lp-footer-legal{display:flex;gap:2rem}
.lp-footer-legal a{font-size:.78rem;color:rgba(255,255,255,.25);text-decoration:none;transition:color .2s}
.lp-footer-legal a:hover{color:rgba(255,255,255,.6)}

/* ── UTIL ANIMATIONS ── */
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`;

/* ─────────────────────────────────────────────────────────────────
   TYPES & DATA
───────────────────────────────────────────────────────────────── */
type Props = { onSignIn: () => void; onGetStarted: () => void };
type DashView = "dashboard" | "clients" | "ai" | "analytics";

const DASH_NAVS: { id: DashView; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "clients",   label: "Clients" },
  { id: "ai",        label: "AI Plans" },
  { id: "analytics", label: "Analytics" },
];

const CLIENTS = [
  { name: "Jessica K.", goal: "Fat Loss",    status: "g", adh: 92, color: "#008767" },
  { name: "Marcus T.",  goal: "Strength",    status: "a", adh: 67, color: "#6366f1" },
  { name: "Sarah R.",   goal: "Endurance",   status: "r", adh: 41, color: "#ec4899" },
  { name: "Dan W.",     goal: "Hypertrophy", status: "b", adh: 88, color: "#f97316" },
];

const AI_TEXT = `Week 1 — Foundation Phase

Monday: Upper Body Strength
• Bench Press  4×6  @75% 1RM
• Pull-ups     4×8  bodyweight
• DB Shoulder  3×12

Nutrition: 2,400 kcal | 185g protein
Pre-workout: 30g oats + 25g whey`;

const ANALYTICS_BARS = [
  { label: "Mon", h: 65 }, { label: "Tue", h: 82 }, { label: "Wed", h: 48 },
  { label: "Thu", h: 91 }, { label: "Fri", h: 75 }, { label: "Sat", h: 88 },
  { label: "Sun", h: 54 },
];

const TESTIMONIALS = [
  {
    q: "Went from spending 15 hours a week on admin to under 3. My clients get faster responses, better programmes, and I actually enjoy coaching again.",
    name: "Sarah K.", role: "Body Composition Coach · 47 clients",
    av: "SK", c: "linear-gradient(135deg,#008767,#065f46)",
  },
  {
    q: "The AI plan generator understands periodisation. I've tried 6 other platforms — nothing comes close to the depth CoachOS gives you out of the box.",
    name: "Marcus T.", role: "Strength & Conditioning Coach",
    av: "MT", c: "linear-gradient(135deg,#6366f1,#4338ca)",
  },
  {
    q: "I used to dread Monday mornings. Now I open CoachOS, see exactly who needs attention, and my whole week is planned in 10 minutes. Game-changer.",
    name: "Priya N.", role: "Online Nutrition Coach · 32 clients",
    av: "PN", c: "linear-gradient(135deg,#ec4899,#be185d)",
  },
  {
    q: "Revenue up 34% in 4 months. When you stop losing clients to disorganisation, the compound effect is incredible.",
    name: "Jake O.", role: "Performance Coach",
    av: "JO", c: "linear-gradient(135deg,#f97316,#c2410c)",
  },
];

const MARQUEE_ITEMS = [
  "Client Management","AI Plan Generation","Progress Tracking",
  "Check-in Forms","Revenue Analytics","Habit Coaching",
  "Group Programmes","Exercise Library","Nutrition Planning",
  "Billing Automation","Morning Briefings","Proof Cards",
];

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useSpringCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────── */
function MagBtn({ children, onClick, cls }: { children: React.ReactNode; onClick?: () => void; cls: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    ref.current!.style.setProperty("--bx", `${x}%`);
    ref.current!.style.setProperty("--by", `${y}%`);
  };
  return (
    <button ref={ref} className={`lp-magbtn ${cls}`} onClick={onClick} onMouseMove={onMove}>
      {children}
    </button>
  );
}

function BentoCard({ children, cls, delay = 0 }: { children: React.ReactNode; cls: string; delay?: number }) {
  const { ref, visible } = useInView(0.1);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--cx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--cy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div
      ref={ref}
      className={`lp-bento-card ${cls}${visible ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
      onMouseMove={onMove}
    >
      {children}
    </div>
  );
}

function StatNum({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, visible } = useInView(0.3);
  const val = useSpringCounter(target, visible);
  return (
    <div ref={ref} style={{ position: "relative", zIndex: 1 }}>
      <div className="lp-stat-num">{val.toLocaleString()}<em>{suffix}</em></div>
      <div className="lp-stat-l">{label}</div>
    </div>
  );
}

/* Interactive Dashboard */
function LiveDashboard() {
  const [view, setView] = useState<DashView>("dashboard");
  const [prev, setPrev] = useState<DashView | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);
  const [statVals, setStatVals] = useState({ clients: 24, revenue: 4120, checkins: 18 });
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const switchView = useCallback((v: DashView) => {
    setPrev(view);
    setView(v);
    if (v === "ai") { setAiText(""); setAiDone(false); }
  }, [view]);

  // Auto-cycle views
  useEffect(() => {
    const order: DashView[] = ["dashboard", "clients", "ai", "analytics"];
    let i = 0;
    timerRef.current = setInterval(() => {
      i = (i + 1) % order.length;
      switchView(order[i]);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [switchView]);

  // Typewriter for AI view
  useEffect(() => {
    if (view !== "ai") return;
    let idx = 0;
    const t = setInterval(() => {
      setAiText(AI_TEXT.slice(0, idx));
      idx++;
      if (idx > AI_TEXT.length) { setAiDone(true); clearInterval(t); }
    }, 28);
    return () => clearInterval(t);
  }, [view]);

  // Subtle stat flicker on dashboard
  useEffect(() => {
    if (view !== "dashboard") return;
    const t = setTimeout(() => {
      setStatVals(v => ({ ...v, checkins: v.checkins === 18 ? 19 : 18 }));
    }, 2000);
    return () => clearTimeout(t);
  }, [view, statVals]);

  const cls = (id: DashView) => view === id ? "show" : prev === id ? "out" : "in-from-right";

  return (
    <div className="lp-dash">
      <div className="lp-dash-bar">
        <div className="lp-dash-dot" /><div className="lp-dash-dot" /><div className="lp-dash-dot" />
        <div className="lp-dash-addr">app.coachos.io/dashboard</div>
      </div>
      <div className="lp-dash-body">
        <div className="lp-dash-sidebar">
          <div className="lp-dash-brand">CoachOS</div>
          {DASH_NAVS.map(n => (
            <button key={n.id} className={`lp-dash-nav${view === n.id ? " active" : ""}`}
              onClick={() => { clearInterval(timerRef.current); switchView(n.id); }}>
              <div className="lp-dash-nav-dot" />{n.label}
            </button>
          ))}
        </div>
        <div className="lp-dash-content">
          {/* Dashboard */}
          <div className={`lp-dv ${cls("dashboard")}`}>
            <div className="lp-dv-title">☀ Morning Dashboard</div>
            <div className="lp-dv-stats">
              {[
                { l: "Active Clients", v: statVals.clients, t: "↑ 3 this week" },
                { l: "Revenue",        v: `£${statVals.revenue.toLocaleString()}`, t: "↑ 8% MoM" },
                { l: "Check-ins",      v: statVals.checkins, t: "Today" },
              ].map(s => (
                <div key={s.l} className="lp-dv-stat">
                  <div className="lp-dv-stat-l">{s.l}</div>
                  <div className="lp-dv-stat-v">{s.v}</div>
                  <div className="lp-dv-stat-t">{s.t}</div>
                </div>
              ))}
            </div>
            <div className="lp-dv-list">
              {CLIENTS.slice(0, 3).map((c, i) => (
                <div key={c.name} className="lp-dv-row" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="lp-dv-av" style={{ background: c.color }}>{c.name.split(" ").map(p => p[0]).join("")}</div>
                  <div className="lp-dv-name">{c.name}</div>
                  <div className={`lp-dv-pill ${c.status}`}>
                    {c.status === "g" ? "On track" : c.status === "a" ? "Due soon" : c.status === "r" ? "At risk" : "Trial"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clients */}
          <div className={`lp-dv ${cls("clients")}`}>
            <div className="lp-cv-search">
              <span className="lp-cv-search-icon">🔍</span>
              <span className="lp-cv-search-text">Search 24 clients…</span>
            </div>
            {CLIENTS.map((c, i) => (
              <div key={c.name} className="lp-cv-card" style={{ animationDelay: `${i * 0.07}s`, marginBottom: ".3rem" }}>
                <div className="lp-dv-av" style={{ background: c.color, width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".52rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>{c.name.split(" ").map(p => p[0]).join("")}</div>
                <div className="lp-cv-info">
                  <div className="lp-cv-name">{c.name}</div>
                  <div className="lp-cv-sub">{c.goal}</div>
                  <div className="lp-cv-bar-track"><div className="lp-cv-bar-fill" style={{ width: `${c.adh}%` }} /></div>
                </div>
                <div className={`lp-dv-pill ${c.status}`}>{c.adh}%</div>
              </div>
            ))}
          </div>

          {/* AI Plans */}
          <div className={`lp-dv ${cls("ai")}`}>
            <div className="lp-ai-header">
              <div className="lp-ai-label">AI Plan Generator</div>
              <div className="lp-ai-status"><div className="lp-ai-dot" />{aiDone ? "Done" : "Generating…"}</div>
            </div>
            <div className="lp-ai-stream">
              <span style={{ whiteSpace: "pre-wrap" }}>{aiText}</span>
              {!aiDone && <span className="lp-ai-cursor" />}
              {aiDone && (
                <div style={{ marginTop: ".5rem" }}>
                  {["Periodised","Progressive Overload","High Protein"].map(t => (
                    <span key={t} className="lp-ai-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className={`lp-dv ${cls("analytics")}`}>
            <div className="lp-dv-title">📈 Weekly Check-in Adherence</div>
            <div className="lp-an-bars">
              {ANALYTICS_BARS.map((b, i) => (
                <div key={b.label} className="lp-an-bar-wrap">
                  <div className="lp-an-bar" style={{ height: `${b.h}%`, animationDelay: `${i * 0.07}s` }} />
                  <div className="lp-an-label">{b.label}</div>
                </div>
              ))}
            </div>
            <div className="lp-dv-stats" style={{ marginTop: ".5rem" }}>
              {[{ l: "Avg Adherence", v: "74%", t: "↑ 6% vs last wk" }, { l: "At Risk", v: "3", t: "Needs nudge" }, { l: "Perfect Week", v: "9", t: "Clients" }].map(s => (
                <div key={s.l} className="lp-dv-stat">
                  <div className="lp-dv-stat-l">{s.l}</div>
                  <div className="lp-dv-stat-v">{s.v}</div>
                  <div className="lp-dv-stat-t">{s.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Step Card — extracts hook from map */
function StepCard({ n, t, d, delay }: { n: string; t: string; d: string; delay: number }) {
  const { ref, visible } = useInView(0.15);
  return (
    <div ref={ref} style={{
      background: "#fff", borderRadius: "20px", padding: "2rem",
      border: "1px solid #eaeaea",
      transform: visible ? "translateY(0)" : "translateY(30px)",
      opacity: visible ? 1 : 0,
      transition: `transform .6s ${delay}s cubic-bezier(0.16,1,0.3,1), opacity .6s ${delay}s`,
    }}>
      <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "#f0f0f0", lineHeight: 1, marginBottom: "1.25rem" }}>{n}</div>
      <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#0d0d1a", marginBottom: ".5rem" }}>{t}</div>
      <div style={{ fontSize: ".875rem", color: "#6d7a73", lineHeight: 1.7 }}>{d}</div>
    </div>
  );
}

/* Price Card — extracts hook from map */
function PriceCard({ tier, desc, price, features, cta, variant, featured, delay, onGetStarted }: {
  tier: string; desc: string; price: string; features: string[];
  cta: string; variant: "outline" | "solid"; featured: boolean; delay: number;
  onGetStarted: () => void;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div ref={ref}
      className={`lp-price-card${featured ? " featured" : ""}${visible ? " visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}>
      {featured && <div className="lp-price-animated-border" />}
      <div className={featured ? "lp-price-card-inner" : ""} style={featured ? {} : { display: "flex", flexDirection: "column", height: "100%" }}>
        {featured && <div className="lp-price-badge">Most Popular</div>}
        <div className="lp-price-tier">{tier}</div>
        <div className="lp-price-desc">{desc}</div>
        <div className="lp-price-num">
          <div className="lp-price-cur">£</div>
          <div className="lp-price-val">{price}</div>
          <div className="lp-price-period">/mo</div>
        </div>
        <ul className="lp-price-features">
          {features.map(f => (
            <li key={f} className="lp-price-feat">
              <div className="lp-price-check">✓</div>{f}
            </li>
          ))}
        </ul>
        <button className={`lp-price-cta ${variant}`} onClick={onGetStarted}>{cta}</button>
      </div>
    </div>
  );
}

/* Testimonials Carousel */
function Testimonials({ onGetStarted }: { onGetStarted: () => void }) {
  const [idx, setIdx] = useState(0);
  const { ref: wrapRef, visible } = useInView(0.1);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const perPage = typeof window !== "undefined" && window.innerWidth < 900 ? 1 : 3;
  const offset = Math.min(idx, TESTIMONIALS.length - perPage);

  return (
    <div ref={wrapRef}>
      <div className="lp-testi-wrap">
        <div className="lp-testi-track" style={{ transform: `translateX(calc(-${offset * (100 / 3 + .42)}%))` }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`lp-testi-card${visible ? " visible" : ""}`}
              style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="lp-testi-stars">★★★★★</div>
              <p className="lp-testi-q">"{t.q}"</p>
              <div className="lp-testi-author">
                <div className="lp-testi-av" style={{ background: t.c }}>{t.av}</div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-testi-controls">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} className={`lp-testi-dot${i === idx ? " active" : ""}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export function LandingPage({ onSignIn, onGetStarted }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [wordIn, setWordIn] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  // Inject styles
  useEffect(() => {
    let el = document.getElementById("lp-css") as HTMLStyleElement | null;
    if (!el) { el = document.createElement("style"); el.id = "lp-css"; document.head.appendChild(el); }
    el.textContent = CSS;
    return () => { el?.remove(); };
  }, []);

  // Scroll handler
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Hero entrance
  useEffect(() => {
    const t1 = setTimeout(() => setHeroIn(true), 120);
    const t2 = setTimeout(() => setWordIn(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Mouse-reactive hero mesh
  useEffect(() => {
    const hero = heroRef.current; if (!hero) return;
    const fn = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.querySelector<HTMLElement>(".lp-hero-mesh")?.style.setProperty("--mx", `${x}%`);
      hero.querySelector<HTMLElement>(".lp-hero-mesh")?.style.setProperty("--my", `${y}%`);
    };
    hero.addEventListener("mousemove", fn);
    return () => hero.removeEventListener("mousemove", fn);
  }, []);

  // Dashboard 3D tilt on hero mouse move
  useEffect(() => {
    const hero = heroRef.current; if (!hero) return;
    const fn = (e: MouseEvent) => {
      const dash = dashRef.current; if (!dash) return;
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      dash.style.setProperty("--ry", `${-6 + nx * 8}deg`);
      dash.style.setProperty("--rx", `${3 - ny * 6}deg`);
    };
    hero.addEventListener("mousemove", fn);
    return () => hero.removeEventListener("mousemove", fn);
  }, []);

  const words = ["The operating", "system for", "serious", "fitness coaches."];

  return (
    <div className="lp">
      {/* NAV */}
      <nav className={`lp-nav${scrolled ? " solid" : ""}`}>
        <a className="lp-logo" href="#">
          <div className="lp-logo-mark">C</div>
          <span className="lp-logo-text">CoachOS</span>
        </a>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="lp-nav-ctas">
          <button className="lp-nav-ghost" onClick={onSignIn}>Sign In</button>
          <button className="lp-nav-cta" onClick={onGetStarted}>Get Started →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-mesh" />
        <div className="lp-hero-grid-lines" />

        <div className="lp-hero-left">
          <div className={`lp-hero-badge${heroIn ? " in" : ""}`}>
            <div className="lp-badge-pulse" />
            Now with AI Plan Generation
          </div>

          <h1 className="lp-hero-h1">
            {words.map((line, li) => (
              <span key={li} style={{ display: "block" }}>
                {line.split(" ").map((w, wi) => {
                  const isGreen = w === "serious" || w === "fitness" || w === "coaches.";
                  const delay = (li * 2 + wi) * 0.09;
                  return (
                    <span key={wi} className={`lp-word${isGreen ? " lp-word-green" : ""}`}>
                      <span className={`lp-word-inner${wordIn ? " in" : ""}`}
                        style={{ transitionDelay: `${delay}s` }}>
                        {w}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p className={`lp-hero-sub${heroIn ? " in" : ""}`}>
            Manage clients, generate AI-powered programmes, and grow your revenue — all from one platform that actually understands how coaching works.
          </p>

          <div className={`lp-hero-actions${heroIn ? " in" : ""}`}>
            <MagBtn cls="lp-magbtn-primary" onClick={onGetStarted}>
              Start free — no card needed
            </MagBtn>
            <MagBtn cls="lp-magbtn-ghost" onClick={onSignIn}>
              Sign in →
            </MagBtn>
          </div>

          <div className={`lp-hero-trust${heroIn ? " in" : ""}`}>
            <div className="lp-trust-avatars">
              {[
                ["JK","#008767"],["MT","#6366f1"],["SR","#ec4899"],["DN","#f97316"],
              ].map(([i, c]) => (
                <div key={i} className="lp-trust-av" style={{ background: c }}>{i}</div>
              ))}
            </div>
            <div>
              <div className="lp-trust-stars">★★★★★</div>
              <div className="lp-trust-text">Trusted by 2,000+ coaches worldwide</div>
            </div>
          </div>
        </div>

        {/* Interactive dashboard */}
        <div className={`lp-hero-right${heroIn ? " in" : ""}`} ref={dashRef}>
          <LiveDashboard />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="lp-marquee-item">
              {item}
              <span className="lp-marquee-sep">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section className="lp-section" id="features">
        <div className="lp-tag"><div className="lp-tag-line" />Features</div>
        <h2 className="lp-h2">Everything a serious coaching business needs</h2>
        <p className="lp-sub">Built from the ground up for online coaches. Every feature solves a real problem.</p>
        <div className="lp-bento">
          <BentoCard cls="lp-b1" delay={0}>
            <div className="lp-bento-icon" style={{ background: "#d1fae5" }}>👥</div>
            <div className="lp-bento-h">Client Management that scales</div>
            <p className="lp-bento-p">Every client's goals, nutrition targets, training history, and billing status in one clean view. Handle 5 or 50 without losing your mind.</p>
            <div className="lp-bento-mini-preview">
              <div className="lp-mini-stat-row">
                {[{ l: "Active", v: "24" }, { l: "At Risk", v: "3" }, { l: "Revenue", v: "£4.1k" }].map(s => (
                  <div key={s.l} className="lp-mini-stat">
                    <div className="lp-mini-stat-l">{s.l}</div>
                    <div className="lp-mini-stat-v">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="lp-mini-bar"><div className="lp-mini-bar-fill" style={{ width: "78%" }} /></div>
            </div>
          </BentoCard>

          <BentoCard cls="lp-b2" delay={0.07}>
            <div className="lp-bento-icon" style={{ background: "#dbeafe" }}>🤖</div>
            <div className="lp-bento-h">AI that understands periodisation</div>
            <p className="lp-bento-p">Generate complete, scientifically-structured training and nutrition plans in seconds. Not templates. Real plans.</p>
          </BentoCard>

          <BentoCard cls="lp-b3" delay={0.1}>
            <div className="lp-bento-icon" style={{ background: "#fce7f3" }}>📊</div>
            <div className="lp-bento-h">Progress at a glance</div>
            <p className="lp-bento-p">Body metrics, adherence scores, and week-over-week deltas tell you exactly who's winning and who needs a nudge.</p>
          </BentoCard>

          <BentoCard cls="lp-b4" delay={0.14}>
            <div className="lp-bento-icon" style={{ background: "#fef3c7" }}>💬</div>
            <div className="lp-bento-h">Structured check-ins</div>
            <p className="lp-bento-p">Consistent weekly check-in forms so you're never chasing clients across WhatsApp, email, and DMs again.</p>
          </BentoCard>

          <BentoCard cls="lp-b5" delay={0.18}>
            <div className="lp-bento-icon" style={{ background: "#ede9fe" }}>💰</div>
            <div className="lp-bento-h">Revenue tracking</div>
            <p className="lp-bento-p">Renewal alerts, overdue flags, and a morning snapshot of your monthly revenue so nothing slips through.</p>
          </BentoCard>
        </div>
      </section>

      {/* ── DARK STATS ── */}
      <div className="lp-stats-dark">
        <StatNum target={2000}  suffix="+"  label="Coaches using CoachOS" />
        <StatNum target={48000} suffix="+"  label="Client check-ins processed" />
        <StatNum target={97}    suffix="%"  label="Coach retention rate" />
        <StatNum target={4}     suffix="hrs" label="Saved per week on average" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how">
        <div className="lp-tag"><div className="lp-tag-line" />How It Works</div>
        <h2 className="lp-h2">Running in minutes, not months</h2>
        <p className="lp-sub">No onboarding call. No enterprise contract. No 47-step setup wizard.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          <StepCard n="01" t="Set up your workspace" d="Add your brand, coaching niche, and pricing. Done in under 5 minutes." delay={0} />
          <StepCard n="02" t="Import your clients"   d="Upload from CSV or add manually. Set goals, targets, and billing in one flow." delay={0.12} />
          <StepCard n="03" t="Deliver at scale"      d="AI plans, check-ins, and a morning dashboard keep you on top of everything." delay={0.24} />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem)", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="lp-tag"><div className="lp-tag-line" />Social Proof</div>
        <h2 className="lp-h2">Coaches who made the switch</h2>
        <p className="lp-sub" style={{ marginBottom: "2.5rem" }}>Real results. No stock photos. No made-up numbers.</p>
        <Testimonials onGetStarted={onGetStarted} />
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section" id="pricing">
        <div className="lp-tag"><div className="lp-tag-line" />Pricing</div>
        <h2 className="lp-h2">Simple. Honest. No surprises.</h2>
        <p className="lp-sub">14-day free trial on all plans. No credit card required.</p>
        <div className="lp-pricing-grid">
          <PriceCard tier="Starter" desc="For coaches getting started" price="29"
            features={["Up to 10 clients","AI plan generation","Check-in forms","Basic analytics","Email support"]}
            cta="Start free trial" variant="outline" featured={false} delay={0} onGetStarted={onGetStarted} />
          <PriceCard tier="Pro" desc="For coaches scaling fast" price="79"
            features={["Unlimited clients","Priority AI generation","Group programmes","Revenue tracking","Habit coaching","Priority support"]}
            cta="Start free trial" variant="solid" featured={true} delay={0.1} onGetStarted={onGetStarted} />
          <PriceCard tier="Agency" desc="For multi-coach businesses" price="199"
            features={["Multiple coach seats","White-label branding","Custom integrations","Advanced analytics","Dedicated manager"]}
            cta="Talk to sales" variant="outline" featured={false} delay={0.2} onGetStarted={onGetStarted} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <div className="lp-final-cta">
        <div className="lp-final-glow" />
        <div className="lp-final-glow" />
        <h2 className="lp-final-h">Stop managing chaos.<br />Start running a business.</h2>
        <p className="lp-final-sub">Join 2,000+ coaches who replaced spreadsheets and DMs with CoachOS.</p>
        <div className="lp-final-actions">
          <button className="lp-final-btn white" onClick={onGetStarted}>Start your free trial</button>
          <button className="lp-final-btn ghost2" onClick={onSignIn}>Sign in to your account →</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-footer-brand-row">
                <div className="lp-logo-mark">C</div>
                <div className="lp-footer-brand-name">CoachOS</div>
              </div>
              <p className="lp-footer-brand-p">The all-in-one platform for online fitness coaches who want to deliver better results, to more clients, with less admin.</p>
            </div>
            <div className="lp-footer-cols">
              {[
                { h: "Product",  links: [["Features","#features"],["Pricing","#pricing"],["How it works","#how"]] },
                { h: "Company",  links: [["About","#"],["Blog","#"],["Careers","#"]] },
                { h: "Support",  links: [["Help Centre","#"],["Contact","#"],["Sign In","#"]] },
              ].map(col => (
                <div key={col.h}>
                  <div className="lp-footer-col-h">{col.h}</div>
                  <div className="lp-footer-col-links">
                    {col.links.map(([label, href]) => (
                      <a key={label} href={href}
                        onClick={label === "Sign In" ? (e => { e.preventDefault(); onSignIn(); }) : undefined}>
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span className="lp-footer-copy">© 2026 CoachOS. All rights reserved.</span>
            <div className="lp-footer-legal">
              <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
