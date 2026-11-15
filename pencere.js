/* pencere.js: a project's window, on every page that carries one (home, the projects list, the chain).
   - whatever carries data-pk-ac="pk-ID" opens the <dialog id="pk-ID"> in place; nothing leaves the page.
   - the address takes the project's id (#kanon), so a link opens the same window on that page;
   - Escape, the close buttons and a click outside close it; the link button copies the address. No dependency. */
const idOf = d => d.id.replace(/^pk-/, '');
const open = (d, push = true) => {
  if (!d || d.open || typeof d.showModal !== 'function') return;
  d.showModal();
  document.documentElement.classList.add('pd-acik');
  if (push) history.replaceState(null, '', '#' + idOf(d));
};
for (const b of document.querySelectorAll('[data-pk-ac]')) b.addEventListener('click', () => open(document.getElementById(b.dataset.pkAc)));
for (const d of document.querySelectorAll('dialog.pd')) {
  d.addEventListener('close', () => {
    document.documentElement.classList.remove('pd-acik');
    if (location.hash === '#' + idOf(d)) history.replaceState(null, '', location.pathname + location.search);
  });
  d.addEventListener('click', e => { if (e.target === d) d.close(); });                      // the backdrop
  for (const b of d.querySelectorAll('[data-pd-kapat]')) b.addEventListener('click', () => d.close());
  const copy = d.querySelector('[data-pd-kopya]');
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.origin + location.pathname + '#' + idOf(d)); copy.classList.add('is-ok'); setTimeout(() => copy.classList.remove('is-ok'), 1600); } catch { /* no clipboard: the address bar already holds it */ }
  });
}
const fromHash = () => {
  const d = location.hash.length > 1 && document.getElementById('pk-' + decodeURIComponent(location.hash.slice(1)));
  if (d) open(d, false);
};
addEventListener('hashchange', fromHash);
fromHash();
