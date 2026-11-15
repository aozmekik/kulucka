/* blokzincir.js: the chain's own page. The map is a fixed plane (its size and the box to fit come from the stage's data attributes) inside a stage; this moves and scales it.
   - the page is only the map: drag pans, two fingers pinch.
   - the bar: left, right, smaller, larger, fit. Keys on the stage: arrows, + and -, 0 or Home fits.
   - wheel: scales at the pointer (a trackpad pinch too); a sideways scroll pans.
   - a block lights its trace to the incubator; its project's window is opened by pencere.js.
   Reduced motion: the bar's moves are instant. No dependency. */
const stage = document.querySelector('[data-bz]');
if (stage) {
  const plane = stage.querySelector('[data-bz-duzlem]'), out = stage.querySelector('[data-bz-oran]');
  const [W, H] = (stage.dataset.bzBoy || '2000,1200').split(',').map(Number);
  const [bx, by, bw, bh] = (stage.dataset.bzKutu || `0,0,${W},${H}`).split(',').map(Number);
  const [sx, sy, sw0, sh0] = (stage.dataset.bzBas || stage.dataset.bzKutu).split(',').map(Number);
  const B = { x: bx, y: by, w: bw, h: bh }, S = { x: sx, y: sy, w: sw0, h: sh0 }, PAD = { x: 16, top: 70, foot: 84 }, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  plane.style.width = W + 'px'; plane.style.height = H + 'px';
  let s = 1, x = 0, y = 0, fit = 1, floor = 1, view = 'tum';      // view: which named view holds ('bas' the chain's head, 'tum' all of it), or null once the visitor moved
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const put = () => {
    const sw = stage.clientWidth, sh = stage.clientHeight, pw = W * s, ph = H * s, mx = Math.min(sw * .4, 220), my = Math.min(sh * .4, 150);
    x = clamp(x, Math.min((sw - pw) / 2, sw - pw - mx), Math.max((sw - pw) / 2, mx));
    y = clamp(y, Math.min((sh - ph) / 2, sh - ph - my), Math.max((sh - ph) / 2, my));
    plane.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
    if (out) out.textContent = Math.round(s * 100) + '%';
  };
  const smooth = on => { if (!still) plane.classList.toggle('is-akici', on); };
  const measure = () => {
    const sw = stage.clientWidth, sh = stage.clientHeight, contain = Math.min((sw - 2 * PAD.x) / B.w, (sh - PAD.top - PAD.foot) / B.h);
    fit = sw < 760 ? Math.min(1, (sh - PAD.top - PAD.foot) / B.h * .92) : contain;   // 'tum': the whole chain between the bars; a narrow screen keeps it legible and is read by moving
    floor = Math.min(fit, Math.min(sw / W, sh / H)) * .7;
  };
  const midY = box => PAD.top + (stage.clientHeight - PAD.top - PAD.foot) / 2 - (box.y + box.h / 2) * s;
  const fitView = () => { measure(); s = fit; x = stage.clientWidth / 2 - (B.x + B.w / 2) * s; y = midY(B); view = 'tum'; put(); };
  /* the head of the chain: as tall as the screen allows, the genesis block at the left edge; the rest is read by moving right */
  const headView = () => { measure(); s = Math.min(stage.clientWidth < 760 ? .68 : 1.3, (stage.clientHeight - PAD.top - PAD.foot) / S.h); x = PAD.x + 20 - S.x * s; y = midY(S); view = 'bas'; put(); };
  const endView = () => { x = stage.clientWidth - PAD.x - 20 - (B.x + B.w) * s; view = null; };
  const zoomAt = (f, cx, cy) => {
    const ns = clamp(s * f, floor, Math.max(fit * 4, 2.4)), k = ns / s;
    x = cx - (cx - x) * k; y = cy - (cy - y) * k; s = ns; view = null; put();
  };
  const centre = () => [stage.clientWidth / 2, stage.clientHeight / 2];
  const acts = {
    sol: () => { x += stage.clientWidth * .36; }, sag: () => { x -= stage.clientWidth * .36; },
    yukari: () => { y += stage.clientHeight * .3; }, asagi: () => { y -= stage.clientHeight * .3; },
    yakin: () => zoomAt(1.3, ...centre()), uzak: () => zoomAt(1 / 1.3, ...centre()), sigdir: fitView, bas: headView, son: endView,
  };
  const run = name => { smooth(true); if (name !== 'sigdir' && name !== 'bas') view = null; acts[name](); put(); clearTimeout(run.t); run.t = setTimeout(() => smooth(false), 360); };
  for (const b of stage.querySelectorAll('[data-bz-is]')) b.addEventListener('click', () => run(b.dataset.bzIs));
  stage.addEventListener('keydown', e => {
    if (e.target !== stage && e.target.closest('.bz-arac')) return;
    const k = { ArrowLeft: 'sol', ArrowRight: 'sag', ArrowUp: 'yukari', ArrowDown: 'asagi', '+': 'yakin', '=': 'yakin', '-': 'uzak', '0': 'sigdir', Home: 'sigdir' }[e.key];
    if (k) { e.preventDefault(); run(k); }
  });
  stage.addEventListener('wheel', e => {
    const r = stage.getBoundingClientRect();
    e.preventDefault();                                             // the page is the map: the wheel scales it at the pointer, a sideways scroll pans
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { x -= e.deltaX; view = null; put(); return; }
    zoomAt(Math.exp(-e.deltaY * (e.ctrlKey || e.metaKey ? .0052 : .0018)), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  /* pointers: one drags, two pinch. A drag that moved does not count as a click on the block under it. */
  const pts = new Map();
  let moved = false, pinch = null;
  const span = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.bz-arac') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, touch: e.pointerType === 'touch' });
    if (pts.size === 1) moved = false;
    if (pts.size === 2) pinch = span();
  });
  addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 2 && pinch) {
      const now = span(), r = stage.getBoundingClientRect();
      x += now.mx - pinch.mx; y += now.my - pinch.my;
      zoomAt(now.d / pinch.d, now.mx - r.left, now.my - r.top);
      pinch = now; moved = true;
      return;
    }
    if (!moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 5) return;
    moved = true; view = null; stage.classList.add('is-tutuk');
    x += dx; y += dy;
    put();
  });
  const lift = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) stage.classList.remove('is-tutuk'); };
  addEventListener('pointerup', lift); addEventListener('pointercancel', lift);
  stage.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  stage.addEventListener('dragstart', e => e.preventDefault());
  new ResizeObserver(() => { if (view === 'bas') headView(); else if (view === 'tum') fitView(); else { measure(); s = Math.max(s, floor); put(); } }).observe(stage);
  (stage.dataset.bzBas ? headView : fitView)();

  /* a block under the pointer (or the keyboard) lights its line of birth: ring to group, group to block, a pulse each way */
  for (const b of stage.querySelectorAll('[data-blok]')) {
    const izler = [b.dataset.blok, b.dataset.grup].map(k => stage.querySelector(`.z-iz[data-iz="${k}"]`)).filter(Boolean);
    const grup = stage.querySelector(`.zg[data-grup="${b.dataset.grup}"]`);
    const set = v => { for (const i of izler) i.classList.toggle('is-on', v); if (grup) grup.classList.toggle('is-on', v); };
    const on = () => set(true), off = () => set(false);
    b.addEventListener('pointerenter', on); b.addEventListener('pointerleave', off);
    b.addEventListener('focusin', on); b.addEventListener('focusout', off);
  }
}
