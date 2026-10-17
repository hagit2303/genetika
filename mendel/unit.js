// יחידת גנטיקה מנדלית — ניווט בין השלבים, מצב מורה ועזרים משותפים
const STAGES = [
  ['presentation.html', 'פתיחה ומושגים', 'מצגת: היומן של מנדל'],
  ['micro-macro.html', 'מיקרו ← מאקרו', 'מהאלל לחלבון ולתכונה'],
  ['mechanism.html', 'המנגנון', 'מיוזה והפריה'],
  ['practice.html', 'מעבדת תרגול', 'הכלאות ושאלות בגרות'],
  ['concepts.html', 'סיכום', 'מפת מושגים']
];
(function () {
  const cur = +document.body.dataset.stage || 0;
  const box = document.getElementById('stages');
  if (box) {
    box.className = 'stages';
    box.setAttribute('aria-label', 'שלבי היחידה');
    box.innerHTML = `<ol>${STAGES.map(([href, t, d], i) =>
      `<li><a href="${href}"${i + 1 === cur ? ' aria-current="page"' : ''}><b>שלב ${i + 1}</b>${t}<span>${d}</span></a></li>`).join('')}</ol>
      <div class="bar" role="progressbar" aria-label="התקדמות ביחידה" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${cur}"><i style="width:${cur * 20}%"></i></div>`;
  }
  const tm = document.getElementById('tmode');
  if (tm) {
    let on = false;
    try { on = localStorage.getItem('genetika-teacher') === '1' } catch (e) {}
    const set = v => { document.body.classList.toggle('teacher', v); tm.querySelector('input').checked = v };
    set(on);
    tm.querySelector('input').addEventListener('change', e => {
      set(e.target.checked);
      try { localStorage.setItem('genetika-teacher', e.target.checked ? '1' : '0') } catch (er) {}
    });
  }
})();
const $ = id => document.getElementById(id);
const L = s => `<span class="L">${s}</span>`;
// סדר אללים בגנוטיפ: אות גדולה לפני קטנה
const geno = (x, y) => (x === x.toUpperCase() ? x + y : y + x);
