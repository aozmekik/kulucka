/* kulucka.js: the traces of the hero's incubator (index.html, .kk).
   The star and the project chips are laid out by CSS; this draws one trace from the star's three outward
   points (north-east, east, south-east) to each visible chip, at the frame's real size, and again when it
   changes. The light on the traces is CSS (site.css, kk-ak); the button holds it. The log line under the star
   names the project the light has just reached. No dependency. */
const NS = 'http://www.w3.org/2000/svg';
for (const kk of document.querySelectorAll('.kk')) {
  const svg = kk.querySelector('.kk__ag'), star = kk.querySelector('.kk__yildiz'), list = kk.querySelector('.kk__cikis');
  if (!svg || !star || !list) continue;
  const el = (tag, cls, at) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); for (const k in at) e.setAttribute(k, at[k]); return e; };
  const draw = () => {
    const o = kk.getBoundingClientRect(), s = star.getBoundingClientRect();
    if (!o.width || !s.width) return;
    const chips = [...list.children].filter(li => li.offsetParent !== null);
    const cx = s.left - o.left + s.width / 2, cy = s.top - o.top + s.height / 2, r = s.width * 0.46, d = r * Math.SQRT1_2;
    const from = [[cx + d, cy - d], [cx + r, cy], [cx + d, cy + d]];
    const n = chips.length, a = Math.round(n * 0.3), b = n - a;
    // the chips stand on a shallow arc round the star, the middle ones furthest out
    chips.forEach((li, i) => li.style.setProperty('--yay', (Math.sin(Math.PI * i / Math.max(1, n - 1)) * Math.min(26, o.width * 0.04)).toFixed(1)));
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${o.width} ${o.height}`);
    chips.forEach((li, i) => {
      const c = li.getBoundingClientRect(), [x0, y0] = from[i < a ? 0 : i < b ? 1 : 2];
      const x1 = c.left - o.left - 5, y1 = c.top - o.top + c.height / 2, k = (x1 - x0) * 0.55;
      const path = `M${x0.toFixed(1)} ${y0.toFixed(1)}C${(x0 + k).toFixed(1)} ${y0.toFixed(1)} ${(x1 - k).toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      svg.append(el('path', 'kk__hat', { d: path }));
      const light = el('path', 'kk__isik', { d: path, pathLength: 100 });
      light.style.setProperty('--n', i);
      li.style.setProperty('--n', i + 1.2);
      svg.append(light, el('circle', 'kk__pin', { cx: x1.toFixed(1), cy: y1.toFixed(1), r: 2.5 }));
    });
    kk.classList.add('is-hazir');
    lights = [...svg.querySelectorAll('.kk__isik')];
    names = chips.map(li => li.lastChild.textContent.trim());
  };
  // the log line: which project the light has just reached (read from the CSS animation's own clock, so the pause holds it too)
  let lights = [], names = [];
  const no = kk.querySelector('[data-kk-no]'), ad = kk.querySelector('[data-kk-ad]');
  if (no && ad) setInterval(() => {
    const a = lights[0] && lights[0].getAnimations ? lights[0].getAnimations()[0] : null;
    if (!a || a.currentTime == null || document.hidden) return;
    const n = lights.length, i = Math.floor((((a.currentTime - 1650) % 3600) + 3600) % 3600 / 300);
    if (i >= n) return;
    const txt = String(i + 1).padStart(2, '0') + '/' + String(n).padStart(2, '0');
    if (no.textContent !== txt) { no.textContent = txt; ad.textContent = names[i]; }
  }, 120);
  new ResizeObserver(draw).observe(kk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  const btn = kk.parentElement.querySelector('[data-kk-dur]');
  if (btn) btn.addEventListener('click', () => {
    const held = kk.classList.toggle('is-durdu');
    btn.setAttribute('aria-pressed', String(held));
    btn.setAttribute('aria-label', held ? 'Hareketi başlat' : 'Hareketi durdur');
  });
}
