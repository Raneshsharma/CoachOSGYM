import { useEffect, useRef, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --lp-green:   #008767;
  --lp-green-d: #065f46;
  --lp-navy:    #1a1a2e;
  --lp-navy2:   #252542;
  --lp-accent:  #f97316;
  --lp-bg:      #F8F9F8;
  --lp-white:   #ffffff;
  --lp-muted:   #6d7a73;
  --lp-border:  #e0e7e4;
}

.lp { font-family: 'Inter', sans-serif; background: var(--lp-bg); color: #181c1c; overflow-x: hidden; }

/* ── NAV ── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 2rem;
  height: 68px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;
}
.lp-nav.scrolled {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.07);
}
.lp-nav-logo {
  display: flex; align-items: center; gap: 0.6rem;
  font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.25rem;
  color: var(--lp-navy); text-decoration: none;
}
.lp-nav-logo-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--lp-green);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 1rem; font-family: 'Manrope', sans-serif;
}
.lp-nav-links { display: flex; align-items: center; gap: 2rem; }
.lp-nav-links a {
  font-size: 0.875rem; font-weight: 500; color: #3d4a43;
  text-decoration: none; transition: color 0.2s;
}
.lp-nav-links a:hover { color: var(--lp-green); }
.lp-nav-actions { display: flex; align-items: center; gap: 0.75rem; }
.lp-btn-ghost {
  font-size: 0.875rem; font-weight: 600; color: var(--lp-navy);
  background: none; border: none; cursor: pointer; padding: 0.5rem 1rem;
  border-radius: 8px; transition: background 0.15s;
  font-family: 'Inter', sans-serif;
}
.lp-btn-ghost:hover { background: rgba(0,135,103,0.07); color: var(--lp-green); }
.lp-btn-primary {
  font-size: 0.875rem; font-weight: 700; color: #fff;
  background: var(--lp-green); border: none; cursor: pointer;
  padding: 0.55rem 1.25rem; border-radius: 10px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 8px rgba(0,135,103,0.3);
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
}
.lp-btn-primary:hover {
  background: var(--lp-green-d);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,135,103,0.35);
}

/* ── HERO ── */
.lp-hero {
  min-height: 100vh;
  padding: 120px 2rem 80px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; position: relative; overflow: hidden;
  background: linear-gradient(160deg, #f0fdf9 0%, var(--lp-bg) 50%, #fef3f0 100%);
}
.lp-hero-blob {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4;
  pointer-events: none; animation: blobFloat 8s ease-in-out infinite;
}
.lp-hero-blob:nth-child(1) {
  width: 500px; height: 500px; top: -100px; left: -100px;
  background: radial-gradient(circle, #bbf7d0, #6ee7b7);
  animation-delay: 0s;
}
.lp-hero-blob:nth-child(2) {
  width: 400px; height: 400px; bottom: -60px; right: -60px;
  background: radial-gradient(circle, #fed7aa, #fdba74);
  animation-delay: 3s;
}
.lp-hero-blob:nth-child(3) {
  width: 300px; height: 300px; top: 30%; left: 60%;
  background: radial-gradient(circle, #c7d2fe, #a5b4fc);
  animation-delay: 5s; opacity: 0.25;
}
@keyframes blobFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.05); }
  66% { transform: translate(-20px,30px) scale(0.95); }
}

.lp-hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(0,135,103,0.1); border: 1px solid rgba(0,135,103,0.2);
  color: var(--lp-green); font-size: 0.78rem; font-weight: 700;
  padding: 0.35rem 0.9rem; border-radius: 999px; margin-bottom: 1.75rem;
  animation: fadeInDown 0.7s ease both;
  letter-spacing: 0.02em; text-transform: uppercase;
}
.lp-hero-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--lp-green); animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

.lp-hero-h1 {
  font-family: 'Manrope', sans-serif; font-weight: 900;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.08; letter-spacing: -0.03em;
  color: var(--lp-navy); max-width: 800px; margin: 0 auto 1.5rem;
  animation: fadeInUp 0.7s 0.1s ease both;
}
.lp-hero-h1 .grad {
  background: linear-gradient(135deg, var(--lp-green) 0%, #059669 40%, var(--lp-accent) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp-hero-sub {
  font-size: clamp(1rem, 2vw, 1.2rem); color: var(--lp-muted);
  max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.7;
  animation: fadeInUp 0.7s 0.2s ease both;
}
.lp-hero-actions {
  display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;
  margin-bottom: 3.5rem; animation: fadeInUp 0.7s 0.3s ease both;
}
.lp-hero-cta {
  font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700;
  padding: 0.875rem 2rem; border-radius: 14px; cursor: pointer;
  border: none; transition: all 0.2s;
}
.lp-hero-cta.primary {
  background: var(--lp-green); color: #fff;
  box-shadow: 0 4px 20px rgba(0,135,103,0.35);
}
.lp-hero-cta.primary:hover {
  background: var(--lp-green-d); transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,135,103,0.4);
}
.lp-hero-cta.secondary {
  background: rgba(255,255,255,0.8); color: var(--lp-navy);
  border: 1px solid var(--lp-border);
  backdrop-filter: blur(8px);
}
.lp-hero-cta.secondary:hover {
  background: #fff; transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.lp-hero-trust {
  display: flex; align-items: center; gap: 1rem; justify-content: center; flex-wrap: wrap;
  animation: fadeInUp 0.7s 0.4s ease both;
}
.lp-hero-trust-text { font-size: 0.8rem; color: var(--lp-muted); font-weight: 500; }
.lp-hero-trust-avatars { display: flex; }
.lp-hero-trust-avatar {
  width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff;
  margin-left: -8px; display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, var(--lp-green), var(--lp-green-d));
}
.lp-hero-trust-avatar:nth-child(2) { background: linear-gradient(135deg, #6366f1, #4338ca); }
.lp-hero-trust-avatar:nth-child(3) { background: linear-gradient(135deg, #ec4899, #be185d); }
.lp-hero-trust-avatar:nth-child(4) { background: linear-gradient(135deg, #f97316, #c2410c); }
.lp-hero-trust-avatar:first-child { margin-left: 0; }

/* ── DASHBOARD PREVIEW ── */
.lp-preview-wrap {
  width: min(900px, 92%);
  margin: 3rem auto 0;
  animation: fadeInUp 0.8s 0.5s ease both;
}
.lp-preview {
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
  background: var(--lp-navy);
  position: relative;
}
.lp-preview-bar {
  height: 36px; background: #111827; display: flex; align-items: center;
  padding: 0 1rem; gap: 0.5rem;
}
.lp-preview-dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.lp-preview-dot:nth-child(1) { background: #ef4444; }
.lp-preview-dot:nth-child(2) { background: #f59e0b; }
.lp-preview-dot:nth-child(3) { background: #10b981; }
.lp-preview-url {
  flex: 1; height: 20px; background: #1f2937; border-radius: 4px;
  margin-left: 0.75rem; display: flex; align-items: center; padding: 0 0.5rem;
  font-size: 0.65rem; color: #6b7280;
}
.lp-preview-screen {
  display: flex; height: 380px;
}
.lp-preview-sidebar {
  width: 200px; background: #1a1a2e; flex-shrink: 0;
  padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.4rem;
}
.lp-preview-sidebar-logo {
  font-family: 'Manrope', sans-serif; font-weight: 800; color: #fff;
  font-size: 1rem; padding: 0.5rem 0.5rem 1rem;
}
.lp-preview-nav-item {
  height: 34px; border-radius: 8px; display: flex; align-items: center;
  padding: 0 0.75rem; font-size: 0.75rem; color: rgba(255,255,255,0.5);
  gap: 0.5rem; cursor: default;
}
.lp-preview-nav-item.active {
  background: rgba(0,135,103,0.25); color: #6ee7b7;
}
.lp-preview-nav-dot { width: 8px; height: 8px; border-radius: 2px; background: currentColor; flex-shrink: 0; }
.lp-preview-content {
  flex: 1; background: #f8f9f8; padding: 1.25rem; overflow: hidden;
  display: flex; flex-direction: column; gap: 0.75rem;
}
.lp-preview-header {
  display: flex; align-items: center; justify-content: space-between;
}
.lp-preview-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.9rem; color: #111; }
.lp-preview-btn {
  height: 26px; padding: 0 0.75rem; background: #008767; border-radius: 6px;
  font-size: 0.65rem; color: #fff; font-weight: 600; display: flex; align-items: center;
}
.lp-preview-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.lp-preview-stat {
  background: #fff; border-radius: 10px; padding: 0.6rem 0.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  animation: statPop 0.4s ease both;
}
.lp-preview-stat:nth-child(1) { animation-delay: 0.8s; }
.lp-preview-stat:nth-child(2) { animation-delay: 0.9s; }
.lp-preview-stat:nth-child(3) { animation-delay: 1.0s; }
.lp-preview-stat:nth-child(4) { animation-delay: 1.1s; }
@keyframes statPop {
  from { opacity: 0; transform: scale(0.9) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.lp-preview-stat-label { font-size: 0.6rem; color: #6d7a73; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.lp-preview-stat-value { font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 800; color: #111; margin-top: 2px; }
.lp-preview-stat-trend { font-size: 0.6rem; color: #008767; font-weight: 600; }
.lp-preview-clients { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
.lp-preview-client-row {
  background: #fff; border-radius: 8px; padding: 0.5rem 0.75rem;
  display: flex; align-items: center; gap: 0.6rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  animation: rowSlide 0.4s ease both;
}
.lp-preview-client-row:nth-child(1) { animation-delay: 1.2s; }
.lp-preview-client-row:nth-child(2) { animation-delay: 1.3s; }
.lp-preview-client-row:nth-child(3) { animation-delay: 1.4s; }
@keyframes rowSlide {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.lp-preview-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.55rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.lp-preview-client-name { font-size: 0.72rem; font-weight: 600; color: #111; flex: 1; }
.lp-preview-pill {
  font-size: 0.58rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;
}
.lp-preview-pill.green { background: #d1fae5; color: #065f46; }
.lp-preview-pill.amber { background: #fef3c7; color: #92400e; }
.lp-preview-pill.red   { background: #ffdad6; color: #93000a; }

/* ── STATS BAR ── */
.lp-stats {
  background: var(--lp-navy); padding: 3.5rem 2rem;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem; text-align: center;
}
.lp-stat-num {
  font-family: 'Manrope', sans-serif; font-weight: 900;
  font-size: 2.5rem; color: #fff; letter-spacing: -0.03em;
  line-height: 1;
}
.lp-stat-num span { color: var(--lp-green); }
.lp-stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 0.4rem; font-weight: 500; }

/* ── SECTION SHARED ── */
.lp-section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
.lp-section-tag {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  color: var(--lp-green); text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 1rem;
}
.lp-section-h2 {
  font-family: 'Manrope', sans-serif; font-weight: 800;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  color: var(--lp-navy); letter-spacing: -0.025em; line-height: 1.15;
  margin-bottom: 1rem;
}
.lp-section-sub {
  font-size: 1.05rem; color: var(--lp-muted); line-height: 1.7;
  max-width: 540px; margin-bottom: 3.5rem;
}

/* ── FEATURES ── */
.lp-features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}
.lp-feature-card {
  background: #fff; border-radius: 20px; padding: 2rem;
  border: 1px solid var(--lp-border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.25s, box-shadow 0.25s;
  opacity: 0; transform: translateY(30px);
}
.lp-feature-card.visible {
  animation: revealUp 0.55s ease forwards;
}
.lp-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}
.lp-feature-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 1.25rem;
}
.lp-feature-h3 {
  font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.1rem;
  color: var(--lp-navy); margin-bottom: 0.5rem;
}
.lp-feature-p { font-size: 0.9rem; color: var(--lp-muted); line-height: 1.65; }

/* ── HOW IT WORKS ── */
.lp-how { background: linear-gradient(135deg, #f0fdf9 0%, #fff 100%); }
.lp-how-inner { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
.lp-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; margin-top: 3.5rem; }
.lp-step {
  text-align: center; padding: 2rem 1.5rem;
  opacity: 0; transform: translateY(30px);
}
.lp-step.visible { animation: revealUp 0.55s ease forwards; }
.lp-step-num {
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--lp-green); color: #fff;
  font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 20px rgba(0,135,103,0.35);
}
.lp-step-h3 {
  font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 1.15rem;
  color: var(--lp-navy); margin-bottom: 0.6rem;
}
.lp-step-p { font-size: 0.9rem; color: var(--lp-muted); line-height: 1.65; }

/* ── TESTIMONIALS ── */
.lp-testimonials-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}
.lp-testimonial {
  background: #fff; border-radius: 20px; padding: 1.75rem;
  border: 1px solid var(--lp-border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  opacity: 0; transform: translateY(30px);
}
.lp-testimonial.visible { animation: revealUp 0.55s ease forwards; }
.lp-testimonial-stars { color: #f59e0b; font-size: 0.85rem; margin-bottom: 1rem; }
.lp-testimonial-quote {
  font-size: 0.95rem; color: #3d4a43; line-height: 1.7;
  margin-bottom: 1.25rem; font-style: italic;
}
.lp-testimonial-author { display: flex; align-items: center; gap: 0.75rem; }
.lp-testimonial-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.lp-testimonial-name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--lp-navy); }
.lp-testimonial-role { font-size: 0.78rem; color: var(--lp-muted); }

/* ── PRICING ── */
.lp-pricing-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem; align-items: start;
}
.lp-pricing-card {
  background: #fff; border-radius: 24px; padding: 2.25rem 2rem;
  border: 2px solid var(--lp-border);
  opacity: 0; transform: translateY(30px);
  transition: transform 0.25s, box-shadow 0.25s;
}
.lp-pricing-card.visible { animation: revealUp 0.55s ease forwards; }
.lp-pricing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); }
.lp-pricing-card.featured {
  border-color: var(--lp-green);
  box-shadow: 0 8px 40px rgba(0,135,103,0.18);
  position: relative;
}
.lp-pricing-card.featured:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,135,103,0.22); }
.lp-pricing-badge {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  background: var(--lp-green); color: #fff; font-size: 0.7rem; font-weight: 700;
  padding: 0.3rem 1rem; border-radius: 999px; white-space: nowrap;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.lp-pricing-tier { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--lp-navy); margin-bottom: 0.35rem; }
.lp-pricing-desc { font-size: 0.85rem; color: var(--lp-muted); margin-bottom: 1.5rem; }
.lp-pricing-price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 2rem; }
.lp-pricing-currency { font-size: 1.5rem; font-weight: 700; color: var(--lp-navy); }
.lp-pricing-amount {
  font-family: 'Manrope', sans-serif; font-size: 3.5rem; font-weight: 900;
  color: var(--lp-navy); letter-spacing: -0.04em; line-height: 1;
}
.lp-pricing-period { font-size: 0.85rem; color: var(--lp-muted); }
.lp-pricing-features { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
.lp-pricing-feature {
  display: flex; align-items: center; gap: 0.6rem;
  font-size: 0.875rem; color: #3d4a43;
}
.lp-pricing-feature-check {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--lp-green); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; flex-shrink: 0;
}
.lp-pricing-cta {
  width: 100%; padding: 0.875rem; border-radius: 12px;
  font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s;
}
.lp-pricing-cta.outline {
  background: transparent; color: var(--lp-green);
  border: 2px solid var(--lp-green);
}
.lp-pricing-cta.outline:hover { background: rgba(0,135,103,0.06); }
.lp-pricing-cta.solid {
  background: var(--lp-green); color: #fff;
  box-shadow: 0 4px 16px rgba(0,135,103,0.3);
}
.lp-pricing-cta.solid:hover {
  background: var(--lp-green-d); transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0,135,103,0.35);
}

/* ── FINAL CTA ── */
.lp-cta-section {
  margin: 0 2rem 6rem;
  border-radius: 28px;
  background: linear-gradient(135deg, var(--lp-navy) 0%, #1e3a5f 50%, var(--lp-green-d) 100%);
  padding: 5rem 3rem; text-align: center; overflow: hidden; position: relative;
}
.lp-cta-glow {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,135,103,0.3), transparent 70%);
  pointer-events: none;
}
.lp-cta-glow:nth-child(1) { top: -100px; right: -100px; }
.lp-cta-glow:nth-child(2) { bottom: -100px; left: -100px; }
.lp-cta-h2 {
  font-family: 'Manrope', sans-serif; font-weight: 900;
  font-size: clamp(1.75rem, 4vw, 2.75rem); color: #fff;
  letter-spacing: -0.025em; margin-bottom: 1rem; position: relative;
}
.lp-cta-sub { font-size: 1.05rem; color: rgba(255,255,255,0.65); margin-bottom: 2.5rem; position: relative; }
.lp-cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; }
.lp-cta-btn {
  padding: 0.9rem 2rem; border-radius: 14px; font-family: 'Inter', sans-serif;
  font-size: 1rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s;
}
.lp-cta-btn.white {
  background: #fff; color: var(--lp-navy);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.lp-cta-btn.white:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.lp-cta-btn.bordered { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.4); }
.lp-cta-btn.bordered:hover { border-color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }

/* ── FOOTER ── */
.lp-footer {
  background: var(--lp-navy); color: rgba(255,255,255,0.6);
  padding: 3rem 2rem 2rem;
}
.lp-footer-inner { max-width: 1100px; margin: 0 auto; }
.lp-footer-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 2rem; padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.lp-footer-brand { max-width: 280px; }
.lp-footer-brand-name {
  display: flex; align-items: center; gap: 0.6rem;
  font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 1.1rem;
  color: #fff; margin-bottom: 0.75rem;
}
.lp-footer-brand-p { font-size: 0.85rem; line-height: 1.65; }
.lp-footer-cols { display: flex; gap: 4rem; flex-wrap: wrap; }
.lp-footer-col-h { font-family: 'Manrope', sans-serif; font-weight: 700; color: #fff; font-size: 0.85rem; margin-bottom: 1rem; }
.lp-footer-col-links { display: flex; flex-direction: column; gap: 0.6rem; }
.lp-footer-col-links a {
  font-size: 0.83rem; color: rgba(255,255,255,0.5); text-decoration: none;
  transition: color 0.2s;
}
.lp-footer-col-links a:hover { color: rgba(255,255,255,0.9); }
.lp-footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem; padding-top: 1.75rem;
}
.lp-footer-copy { font-size: 0.8rem; }
.lp-footer-legal { display: flex; gap: 1.5rem; }
.lp-footer-legal a { font-size: 0.8rem; color: rgba(255,255,255,0.4); text-decoration: none; }
.lp-footer-legal a:hover { color: rgba(255,255,255,0.8); }

/* ── ANIMATIONS ── */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes revealUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  .lp-nav-links { display: none; }
  .lp-preview-sidebar { display: none; }
  .lp-preview-screen { height: 280px; }
  .lp-stats { grid-template-columns: 1fr 1fr; }
  .lp-footer-cols { gap: 2rem; }
  .lp-pricing-card.featured { margin-top: 0; }
}
`;

type Props = {
  onSignIn: () => void;
  onGetStarted: () => void;
};

const features = [
  {
    icon: "👥",
    color: "#d1fae5",
    title: "Client Management",
    desc: "Keep every client's goals, nutrition targets, and training history in one clean dashboard. No more juggling spreadsheets.",
  },
  {
    icon: "📋",
    color: "#dbeafe",
    title: "AI-Generated Plans",
    desc: "Generate personalised workout and nutrition plans in seconds. Review, edit, and approve before sending to clients.",
  },
  {
    icon: "📊",
    color: "#fce7f3",
    title: "Progress Tracking",
    desc: "Body metrics, adherence scores, and weekly check-ins give you a live view of every client's momentum.",
  },
  {
    icon: "💬",
    color: "#fef3c7",
    title: "Messaging & Check-ins",
    desc: "Structured weekly check-ins and direct messaging keep communication professional and consistent.",
  },
  {
    icon: "💰",
    color: "#ede9fe",
    title: "Billing & Renewals",
    desc: "Track subscriptions, flag overdue payments, and get renewal alerts before revenue slips through the cracks.",
  },
  {
    icon: "📈",
    color: "#ffedd5",
    title: "Analytics Dashboard",
    desc: "Morning briefings, revenue snapshots, and at-risk client alerts so you start every day with clarity.",
  },
];

const steps = [
  { n: "1", title: "Create your workspace", desc: "Set up your brand, add your coaching niche, and invite yourself in under 5 minutes." },
  { n: "2", title: "Add your clients", desc: "Import from CSV or add manually. Set goals, nutrition targets, and subscription pricing." },
  { n: "3", title: "Deliver at scale", desc: "AI-generated plans, automated check-ins, and a morning dashboard keep you on top of everything." },
];

const testimonials = [
  {
    quote: "CoachOS cut my admin time in half. I went from drowning in DMs to running 40+ clients without missing a beat.",
    name: "Sarah K.", role: "Online Fitness Coach, 43 clients",
    initials: "SK", color: "linear-gradient(135deg, #008767, #065f46)",
  },
  {
    quote: "The AI plan generator is scary good. I tweak 10% of what it produces — my clients think I'm a genius.",
    name: "Marcus T.", role: "Strength & Conditioning Coach",
    initials: "MT", color: "linear-gradient(135deg, #6366f1, #4338ca)",
  },
  {
    quote: "Finally a platform built for coaches, not gym chains. The morning dashboard alone is worth the subscription.",
    name: "Priya N.", role: "Nutrition & Lifestyle Coach",
    initials: "PN", color: "linear-gradient(135deg, #ec4899, #be185d)",
  },
];

const plans = [
  {
    tier: "Starter", desc: "For coaches just getting started",
    price: "29", features: ["Up to 10 clients", "AI plan generation", "Check-in forms", "Basic analytics", "Email support"],
    cta: "Start free trial", variant: "outline" as const, featured: false,
  },
  {
    tier: "Pro", desc: "For established coaches scaling up",
    price: "79", features: ["Unlimited clients", "Priority AI generation", "Group programs", "Revenue tracking", "Habit tracking", "Priority support"],
    cta: "Get started free", variant: "solid" as const, featured: true,
  },
  {
    tier: "Agency", desc: "For multi-coach businesses",
    price: "199", features: ["Multiple coach seats", "White-label branding", "Custom integrations", "Advanced analytics", "Dedicated account manager"],
    cta: "Talk to sales", variant: "outline" as const, featured: false,
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    const dur = 1800;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target]);
  return <div ref={ref} className="lp-stat-num">{val.toLocaleString()}<span>{suffix}</span></div>;
}

export function LandingPage({ onSignIn, onGetStarted }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "lp-styles";
    if (!document.getElementById("lp-styles")) document.head.appendChild(style);
    style.textContent = CSS;
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const feat1 = useReveal(); const feat2 = useReveal(); const feat3 = useReveal();
  const feat4 = useReveal(); const feat5 = useReveal(); const feat6 = useReveal();
  const featRefs = [feat1, feat2, feat3, feat4, feat5, feat6];

  const step1 = useReveal(); const step2 = useReveal(); const step3 = useReveal();
  const stepRefs = [step1, step2, step3];

  const t1 = useReveal(); const t2 = useReveal(); const t3 = useReveal();
  const tRefs = [t1, t2, t3];

  const p1 = useReveal(); const p2 = useReveal(); const p3 = useReveal();
  const pRefs = [p1, p2, p3];

  return (
    <div className="lp">
      {/* NAV */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <a className="lp-nav-logo" href="#">
          <div className="lp-nav-logo-mark">C</div>
          CoachOS
        </a>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={onSignIn}>Sign In</button>
          <button className="lp-btn-primary" onClick={onGetStarted}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-blob" />
        <div className="lp-hero-blob" />
        <div className="lp-hero-blob" />

        <div className="lp-hero-badge">
          <div className="lp-hero-badge-dot" />
          Now with AI Plan Generation
        </div>

        <h1 className="lp-hero-h1">
          The operating system for<br />
          <span className="grad">serious fitness coaches</span>
        </h1>

        <p className="lp-hero-sub">
          Manage clients, generate AI-powered programmes, track progress, and grow your revenue — all from one beautifully simple platform.
        </p>

        <div className="lp-hero-actions">
          <button className="lp-hero-cta primary" onClick={onGetStarted}>
            Start free — no card needed
          </button>
          <button className="lp-hero-cta secondary" onClick={onSignIn}>
            Sign in to your account
          </button>
        </div>

        <div className="lp-hero-trust">
          <div className="lp-hero-trust-avatars">
            {["JK","MT","SR","PN"].map(i => (
              <div key={i} className="lp-hero-trust-avatar">{i}</div>
            ))}
          </div>
          <p className="lp-hero-trust-text">Trusted by 2,000+ coaches worldwide</p>
        </div>

        {/* Dashboard preview */}
        <div className="lp-preview-wrap">
          <div className="lp-preview">
            <div className="lp-preview-bar">
              <div className="lp-preview-dot" /><div className="lp-preview-dot" /><div className="lp-preview-dot" />
              <div className="lp-preview-url">app.coachos.io/dashboard</div>
            </div>
            <div className="lp-preview-screen">
              <div className="lp-preview-sidebar">
                <div className="lp-preview-sidebar-logo">CoachOS</div>
                {[["Dashboard","active"],["Clients",""],["Plans",""],["Portal",""],["Billing",""]].map(([label, cls]) => (
                  <div key={label} className={`lp-preview-nav-item${cls ? " "+cls : ""}`}>
                    <div className="lp-preview-nav-dot" />{label}
                  </div>
                ))}
              </div>
              <div className="lp-preview-content">
                <div className="lp-preview-header">
                  <div className="lp-preview-title">Morning Dashboard</div>
                  <div className="lp-preview-btn">+ Add Client</div>
                </div>
                <div className="lp-preview-stats">
                  {[["Active Clients","24","↑ 3 this week"],["Revenue","£4,120","↑ £340"],["Check-ins","18","Today"],["At Risk","2","Needs attention"]].map(([label, val, trend]) => (
                    <div key={label} className="lp-preview-stat">
                      <div className="lp-preview-stat-label">{label}</div>
                      <div className="lp-preview-stat-value">{val}</div>
                      <div className="lp-preview-stat-trend">{trend}</div>
                    </div>
                  ))}
                </div>
                <div className="lp-preview-clients">
                  {[
                    ["JK","Jessica K.", "Active", "green", "#008767"],
                    ["MT","Marcus T.", "Check-in due", "amber", "#f59e0b"],
                    ["SR","Sarah R.", "At Risk", "red", "#ba1a1a"],
                  ].map(([init, name, status, pill, bg]) => (
                    <div key={name} className="lp-preview-client-row">
                      <div className="lp-preview-avatar" style={{ background: bg }}>{init}</div>
                      <div className="lp-preview-client-name">{name}</div>
                      <div className={`lp-preview-pill ${pill}`}>{status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        {[
          { target: 2000, suffix: "+", label: "Coaches using CoachOS" },
          { target: 48000, suffix: "+", label: "Client check-ins processed" },
          { target: 97, suffix: "%", label: "Coach retention rate" },
          { target: 4, suffix: "hrs", label: "Saved per week on average" },
        ].map(s => (
          <div key={s.label}>
            <AnimatedNumber target={s.target} suffix={s.suffix} />
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="lp-section" id="features">
        <div className="lp-section-tag">Features</div>
        <h2 className="lp-section-h2">Everything you need to run a world-class coaching business</h2>
        <p className="lp-section-sub">Built by coaches, for coaches. Every feature solves a real problem you face every day.</p>
        <div className="lp-features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              ref={featRefs[i].ref}
              className={`lp-feature-card${featRefs[i].visible ? " visible" : ""}`}
              style={{ animationDelay: `${(i % 3) * 0.1}s` }}
            >
              <div className="lp-feature-icon" style={{ background: f.color }}>{f.icon}</div>
              <div className="lp-feature-h3">{f.title}</div>
              <p className="lp-feature-p">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="lp-how" id="how">
        <div className="lp-how-inner">
          <div className="lp-section-tag">How It Works</div>
          <h2 className="lp-section-h2">Up and running in minutes, not weeks</h2>
          <p className="lp-section-sub">No onboarding calls, no IT team, no 47-step setup wizard.</p>
          <div className="lp-steps">
            {steps.map((s, i) => (
              <div
                key={s.n}
                ref={stepRefs[i].ref}
                className={`lp-step${stepRefs[i].visible ? " visible" : ""}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-h3">{s.title}</div>
                <p className="lp-step-p">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="lp-section">
        <div className="lp-section-tag">Testimonials</div>
        <h2 className="lp-section-h2">Coaches love CoachOS</h2>
        <p className="lp-section-sub">Real coaches. Real results. No stock photos.</p>
        <div className="lp-testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              ref={tRefs[i].ref}
              className={`lp-testimonial${tRefs[i].visible ? " visible" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="lp-testimonial-stars">★★★★★</div>
              <p className="lp-testimonial-quote">"{t.quote}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section" id="pricing">
        <div className="lp-section-tag">Pricing</div>
        <h2 className="lp-section-h2">Simple pricing, no surprises</h2>
        <p className="lp-section-sub">All plans include a 14-day free trial. No credit card required to start.</p>
        <div className="lp-pricing-grid">
          {plans.map((plan, i) => (
            <div
              key={plan.tier}
              ref={pRefs[i].ref}
              className={`lp-pricing-card${plan.featured ? " featured" : ""}${pRefs[i].visible ? " visible" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {plan.featured && <div className="lp-pricing-badge">Most Popular</div>}
              <div className="lp-pricing-tier">{plan.tier}</div>
              <div className="lp-pricing-desc">{plan.desc}</div>
              <div className="lp-pricing-price">
                <div className="lp-pricing-currency">£</div>
                <div className="lp-pricing-amount">{plan.price}</div>
                <div className="lp-pricing-period">/mo</div>
              </div>
              <ul className="lp-pricing-features">
                {plan.features.map(f => (
                  <li key={f} className="lp-pricing-feature">
                    <div className="lp-pricing-feature-check">✓</div>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`lp-pricing-cta ${plan.variant}`}
                onClick={onGetStarted}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-cta-glow" />
        <h2 className="lp-cta-h2">Ready to scale your coaching business?</h2>
        <p className="lp-cta-sub">Join 2,000+ coaches who've replaced spreadsheets and DMs with CoachOS.</p>
        <div className="lp-cta-actions">
          <button className="lp-cta-btn white" onClick={onGetStarted}>Start your free trial</button>
          <button className="lp-cta-btn bordered" onClick={onSignIn}>Sign in →</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-footer-brand-name">
                <div className="lp-nav-logo-mark">C</div>
                CoachOS
              </div>
              <p className="lp-footer-brand-p">The all-in-one platform for online fitness coaches who want to deliver better results, to more clients, with less admin.</p>
            </div>
            <div className="lp-footer-cols">
              <div>
                <div className="lp-footer-col-h">Product</div>
                <div className="lp-footer-col-links">
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#how">How it works</a>
                </div>
              </div>
              <div>
                <div className="lp-footer-col-h">Company</div>
                <div className="lp-footer-col-links">
                  <a href="#">About</a>
                  <a href="#">Blog</a>
                  <a href="#">Careers</a>
                </div>
              </div>
              <div>
                <div className="lp-footer-col-h">Support</div>
                <div className="lp-footer-col-links">
                  <a href="#">Help Centre</a>
                  <a href="#">Contact</a>
                  <a href="#" onClick={e => { e.preventDefault(); onSignIn(); }}>Sign In</a>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span className="lp-footer-copy">© 2026 CoachOS. All rights reserved.</span>
            <div className="lp-footer-legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
