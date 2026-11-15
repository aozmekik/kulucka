/* siber.js: the site's second layer, the digital one. Every page loads it; nothing here touches the line drawings.
   - ink: an SVG filter that roughens the edge of stuck-on things (stickers, blocks, the tape), so they read as cut and
     printed by hand beside the exact lines. CSS uses it only once <html class="siber"> says it exists.
   - decode: the mono tags ([01] ..., step labels) run through signs for an instant when first seen, then stand.
   - codes: a project's code (P-01) does the same when the pointer enters its card.
   - the hero panel reads the pointer's place like an instrument (x, y in px of the frame).
   - the footer's measure: requests, weight, third-party requests and cookies, counted in the visitor's own browser.
   Reduced motion: nothing decodes; the measure still works. No dependency. */
const html = document.documentElement;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---- ink */
{
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML =
    '<filter id="murekkep" x="-4%" y="-20%" width="108%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".045 .09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<filter id="murekkep-ince" x="-3%" y="-12%" width="106%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".16 .2" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<filter id="murekkep-2" x="-4%" y="-20%" width="108%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03 .12" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.4" xChannelSelector="G" yChannelSelector="R"/></filter>';
  document.body.append(svg);
  html.classList.add('siber');
}

/* ---- decode */
const SIGNS = '01/\\<>#_+=:.';
const sign = () => SIGNS[Math.floor(Math.random() * SIGNS.length)];
const running = new WeakSet();
function decode(node, ms = 520) {
  if (still || running.has(node)) return;
  const text = node.nodeValue;
  if (!text || !text.trim()) return;
  running.add(node);
  const chars = [...text], n = chars.length, t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / ms), done = Math.floor(k * n);
    node.nodeValue = chars.map((c, i) => (i < done || c === ' ' || c === ' ') ? c : sign()).join('');
    if (k < 1) setTimeout(() => requestAnimationFrame(tick), 34);
    else { node.nodeValue = text; running.delete(node); }
  };
  requestAnimationFrame(tick);
}
const lastText = el => {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let last = null;
  for (let t = w.nextNode(); t; t = w.nextNode()) if (t.nodeValue.trim()) last = t;
  return last;
};
if (!still && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(list => {
    for (const e of list) if (e.isIntersecting) {
      io.unobserve(e.target);
      const t = lastText(e.target);
      if (t) decode(t, Math.min(700, 260 + t.nodeValue.length * 14));
    }
  }, { threshold: 0.9 });
  document.querySelectorAll('.kunye, .adim__ne').forEach(el => io.observe(el));
}
if (fine) document.querySelectorAll('.proje').forEach(card => {
  const kod = card.querySelector('.proje__kod');
  if (kod && kod.firstChild) card.addEventListener('pointerenter', () => decode(kod.firstChild, 280));
});

/* ---- the hero panel reads the pointer */
for (const panel of document.querySelectorAll('.sema')) {
  const xy = panel.querySelector('[data-kk-xy]');
  if (!xy || !fine) continue;
  const rest = xy.textContent, pad = v => String(Math.max(0, Math.round(v))).padStart(4, '0');
  let raf = 0;
  panel.addEventListener('pointermove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = panel.getBoundingClientRect();
      xy.textContent = `x:${pad(e.clientX - r.left)} y:${pad(e.clientY - r.top)}`;
    });
  });
  panel.addEventListener('pointerleave', () => { xy.textContent = rest; });
}

/* ---- the measure: counted here, in this browser, each time the footer comes into view */
for (const box of document.querySelectorAll('[data-olcu]')) {
  const put = (k, v) => { const el = box.querySelector(`[data-olcu-${k}]`); if (el) el.textContent = String(v); };
  const measure = () => {
    if (!performance.getEntriesByType) return;
    const res = performance.getEntriesByType('resource'), nav = performance.getEntriesByType('navigation')[0];
    let third = 0, bytes = nav ? nav.encodedBodySize || 0 : 0;
    for (const r of res) {
      try { if (new URL(r.name, location.href).origin !== location.origin) third++; } catch { /* a data: or blob: entry is the page's own */ }
      bytes += r.encodedBodySize || 0;
    }
    put('istek', res.length + 1);
    put('uc', third);
    put('cerez', document.cookie ? document.cookie.split(';').filter(c => c.trim()).length : 0);
    const kb = box.querySelector('[data-olcu-kb]');
    if (kb) { if (bytes > 0) kb.textContent = String(Math.round(bytes / 1024)); else kb.parentElement.hidden = true; }
    box.hidden = false;
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(list => { if (list.some(e => e.isIntersecting)) { measure(); setTimeout(measure, 1500); } }).observe(box.parentElement);
  else addEventListener('load', measure);
}
