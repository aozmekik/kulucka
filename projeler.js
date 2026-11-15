/* projeler.js: the projects page. Search and filters over the cards. A project's window is pencere.js; the chain map lives on blokzincir.html.
   - search: the card's own words (name, field, sentence, tags), Turkish lower-casing; filters: stage buttons, field select.
   No dependency. */
const tr = s => (s || '').toLocaleLowerCase('tr').normalize('NFC');
const grid = document.querySelector('[data-pkler]');
if (grid) {
  const cards = [...grid.querySelectorAll('.pk')];
  const words = new Map(cards.map(c => [c, tr(c.textContent + ' ' + c.dataset.etiket + ' ' + c.dataset.alan)]));
  const q = document.getElementById('pa-ara'), field = document.getElementById('pa-alan');
  const stages = [...document.querySelectorAll('.suz[data-durum]')], count = document.querySelector('[data-pa-say]'), none = document.querySelector('[data-pa-bos]');
  let stage = '';
  const apply = () => {
    const terms = tr(q.value).split(/\s+/).filter(Boolean), f = field.value;
    let n = 0;
    for (const c of cards) {
      const ok = (!stage || c.dataset.durum === stage) && (!f || c.dataset.alan === f) && terms.every(t => words.get(c).includes(t));
      c.hidden = !ok;
      if (ok) n++;
    }
    count.textContent = n === cards.length ? `${n} proje` : `${cards.length} projeden ${n} tanesi`;
    none.hidden = n > 0;
  };
  q.addEventListener('input', apply);
  field.addEventListener('change', apply);
  for (const b of stages) b.addEventListener('click', () => {
    stage = b.dataset.durum;
    for (const o of stages) { const on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', String(on)); }
    apply();
  });
  const clear = document.querySelector('[data-pa-temizle]');
  if (clear) clear.addEventListener('click', () => { q.value = ''; field.value = ''; stages[0].click(); q.focus(); });

  if (location.hash === '#harita') location.replace('blokzincir.html');      // the chain map has a page of its own now
}
