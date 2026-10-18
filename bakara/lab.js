// מנוע המעבדות של הפרק: גרירה (עכבר, מגע, ובחירה בלחיצה), שלבים, שאלות, התאמת מושגים ודוח להורדה
const $ = id => document.getElementById(id);
const L = s => `<span class="L">${s}</span>`;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
// טקסט רגיל לדוח: כתב עילי נשמר (Iᴬ, Iᴮ, A¹, A²)
const SUPC = { A: 'ᴬ', B: 'ᴮ', '1': '¹', '2': '²' };
const plain = h => String(h).replace(/<sup>(.*?)<\/sup>/g, (m, x) => [...x].map(c => SUPC[c] || c).join('')).replace(/<[^>]+>/g, '');
const fb = (el, ok, html) => { el.className = 'fb ' + (ok ? 'ok' : 'no'); el.innerHTML = html };

const Lab = {
  log: {},          // כותרת ← {ok, d, tries}
  rec(t, ok, d) {
    const r = this.log[t] || (this.log[t] = { ok: false, d: '', tries: 0 });
    r.tries++; if (ok && !r.ok) { r.ok = true; r.d = d || '' } else if (!r.ok) r.d = d || '';
  },
  // שלבים: פותחים את השלב הבא אחרי פתרון
  solve(n) {
    const s = document.querySelector(`.step[data-n="${n}"]`); if (s) s.classList.add('done');
    const nx = document.querySelector(`.step[data-n="${n + 1}"]`);
    if (nx && nx.hidden) { nx.hidden = false; nx.dispatchEvent(new Event('open')); setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120) }
  },
  reset(from) { document.querySelectorAll('.step').forEach(s => { if (+s.dataset.n > from) { s.hidden = true; s.classList.remove('done') } }) }
};

/* ---------- גרירה ---------- */
(function () {
  let sel = null, st = null;
  const isSrc = el => el && (el.matches('.chip:not(.ghost)') || el.matches('.chrom[data-drag]:not(.ghost)'));
  const clearSel = () => { if (sel) sel.classList.remove('sel'); sel = null; document.querySelectorAll('.slot.on,.drop.on').forEach(e => e.classList.remove('on')) };
  function target(src, x, y) {
    const el = document.elementFromPoint(x, y); if (!el) return null;
    return src.matches('.chrom') ? el.closest('.drop') : el.closest('.slot:not(.lock)');
  }
  function put(src, tg) {
    if (!tg) return;
    if (src.matches('.chrom')) { if (src.closest('.drop') === tg) return; tg.appendChild(src) }
    else { tg.dataset.v = src.dataset.v; tg.innerHTML = src.innerHTML; tg.classList.remove('ok', 'no') }
    tg.dispatchEvent(new CustomEvent('lab:drop', { bubbles: true, detail: { src } }));
  }
  document.addEventListener('pointerdown', e => {
    const src = e.target.closest('.chip,.chrom[data-drag]');
    if (!isSrc(src) || src.closest('.slot')) return;
    st = { src, x: e.clientX, y: e.clientY, ghost: null }; e.preventDefault();
  });
  document.addEventListener('pointermove', e => {
    if (!st) return;
    if (!st.ghost && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 6) {
      st.ghost = st.src.cloneNode(true); st.ghost.classList.add('ghost'); st.ghost.classList.remove('sel'); document.body.appendChild(st.ghost);
    }
    if (st.ghost) {
      st.ghost.style.left = e.clientX - 20 + 'px'; st.ghost.style.top = e.clientY - 20 + 'px';
      document.querySelectorAll('.slot.on,.drop.on').forEach(x => x.classList.remove('on'));
      st.ghost.hidden = true; const t = target(st.src, e.clientX, e.clientY); st.ghost.hidden = false; if (t) t.classList.add('on');
    }
  });
  document.addEventListener('pointerup', e => {
    if (!st) return; const s = st; st = null;
    if (s.ghost) { s.ghost.remove(); put(s.src, target(s.src, e.clientX, e.clientY)); clearSel(); return }
    // לחיצה: בחירה, ואחר כך לחיצה על היעד
    const was = sel === s.src; clearSel();
    if (!was) { sel = s.src; sel.classList.add('sel') }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.chip,.chrom[data-drag]')) return; // לחיצה על פריט לגרירה = בחירה בלבד
    const tg = e.target.closest('.slot:not(.lock),.drop');
    if (!tg) return;
    if (sel && ((sel.matches('.chrom') && tg.matches('.drop')) || (sel.matches('.chip') && tg.matches('.slot')))) { put(sel, tg); clearSel(); return }
    if (tg.matches('.slot') && tg.dataset.v && !sel) { delete tg.dataset.v; tg.innerHTML = ''; tg.classList.remove('ok', 'no'); tg.dispatchEvent(new CustomEvent('lab:drop', { bubbles: true })) }
  });
  // מקלדת: Enter על צ'יפ בוחר, Enter על חריץ מניח
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = document.activeElement;
    if (isSrc(el)) { e.preventDefault(); clearSel(); sel = el; el.classList.add('sel') }
    else if (el && el.matches('.slot,.drop')) { e.preventDefault(); el.click() }
  });
})();
const chip = (v, html, cls = '') => `<span class="chip ${cls}" tabindex="0" role="button" data-v="${v}" aria-label="${v}">${html || v}</span>`;
const slot = (id, cls = '') => `<span class="slot ${cls}" tabindex="0" role="button" ${id ? `id="${id}"` : ''} aria-label="מקום ריק"></span>`;
const slotVals = sel => [...document.querySelectorAll(sel)].map(s => s.dataset.v || '');
const sameSet = (a, b) => [...a].sort().join('|') === [...b].sort().join('|');

/* ---------- שאלות עם משוב ---------- */
function renderQuestions(box, Q, tag) {
  box.innerHTML = Q.map((q, i) => `<section class="card" id="${tag}${i}"><span class="qn">שאלה ${i + 1}</span><p>${q.stem}</p>
   ${q.type === 'frac' ? `<div class="row"><input class="t" id="${tag}in${i}" inputmode="decimal" placeholder="1/4" aria-label="תשובה" style="width:7em;direction:ltr;text-align:center"><button data-i="${i}" class="fchk">בדיקה</button></div>`
   : `<div class="opts" role="radiogroup">${shuffle(q.opts.map((o, k) => [o, k])).map(([o, k]) => `<label><input type="radio" name="${tag}r${i}" value="${k}"> <span>${o}</span></label>`).join('')}</div>`}
   <div class="fb" id="${tag}fb${i}" role="status"></div><p class="src">מקור: ${q.src}</p>${q.t ? `<p class="tnote">${q.t}</p>` : ''}</section>`).join('');
  const title = i => `שאלה ${i + 1} (${Q[i].src})`;
  box.addEventListener('change', e => {
    if (e.target.type !== 'radio') return;
    const i = +e.target.name.slice(tag.length + 1), k = +e.target.value, q = Q[i];
    fb($(tag + 'fb' + i), k === q.ans, k === q.ans ? q.ok : q.no[k]); Lab.rec(title(i), k === q.ans, plain(q.opts[k]));
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('.fchk'); if (!b) return;
    const i = +b.dataset.i, q = Q[i], raw = $(tag + 'in' + i).value, v = parseFrac(raw), ok = Math.abs(v - q.ans) < .005;
    fb($(tag + 'fb' + i), ok, ok ? q.ok : 'עדיין לא. ' + q.hint); Lab.rec(title(i), ok, raw);
  });
}
function parseFrac(s) { s = (s || '').replace(',', '.').replace(/\s/g, ''); if (!s) return NaN; if (s.endsWith('%')) return parseFloat(s) / 100; if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN } return Number(s) }

/* ---------- התאמת מושגים ---------- */
function renderMatch(box, pairs, btn, out) {
  const terms = shuffle(pairs.map(p => p[0]).slice());
  box.innerHTML = shuffle(pairs.map((p, i) => [p, i])).map(([p, i]) => `<span>${p[1]}</span><select data-i="${i}" aria-label="המושג המתאים"><option value="">בחרו מושג</option>${terms.map(t => `<option>${t}</option>`).join('')}</select>`).join('');
  btn.onclick = () => {
    let ok = 0; box.querySelectorAll('select').forEach(s => { const g = s.value === pairs[+s.dataset.i][0]; s.className = g ? 'm-ok' : 'm-no'; if (g) ok++ });
    fb(out, ok === pairs.length, ok === pairs.length ? `מצוין! כל ${ok} המושגים במקום.` : `${ok} מתוך ${pairs.length} נכונים. המושגים המסומנים באדום — נסו שוב.`);
    Lab.rec('התאמת מושגים', ok === pairs.length, `${ok}/${pairs.length}`);
  };
}

/* ---------- דוח והורדה ---------- */
function buildReport(title) {
  const st = window.STUDENT || {}, rows = Object.entries(Lab.log);
  const ok = rows.filter(([, r]) => r.ok).length;
  $('report').innerHTML = `<h1>${title}</h1><p>שם: <b>${st.name || ''}</b> · כיתה: <b>${st.cls || ''}</b> · תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
   <p style="font-size:18px;margin:8px 0">הושלמו: <b>${ok}</b> מתוך <b>${rows.length}</b> משימות שנוסו</p>
   ${rows.map(([t, r]) => `<div class="rr"><b>${t}</b><span class="${r.ok ? 'y' : 'n'}">${r.ok ? '✔' : '✘'}</span><span>${r.d}</span><span style="color:#5C6F66">(${r.tries} ${r.tries === 1 ? 'ניסיון' : 'ניסיונות'})</span></div>`).join('')}
   <p style="margin-top:12px;color:#5C6F66;font-size:13px">גנטיקה · ביולוגיה י״ב · מעבדה ותרגול</p>`;
}
async function labPdf(title, file) {
  const b = $('dl'), old = b.textContent; b.disabled = true; b.textContent = 'מכין קובץ…';
  try {
    buildReport(title); const r = $('report'); r.style.visibility = 'visible';
    const nm = ((window.STUDENT || {}).name || 'תלמיד').replace(/[\\/:*?"<>|]/g, '');
    await downloadPdf(r, `${file}-${nm}.pdf`); $('dlmsg').textContent = 'הקובץ ירד. העלו אותו למשימה ב-Classroom.';
  } catch (e) { $('dlmsg').textContent = 'ההורדה לא הצליחה. נסו שוב, או הדפיסו את הדף (Ctrl+P) ושמרו כ-PDF.' }
  $('report').style.visibility = 'hidden'; b.disabled = false; b.textContent = old;
}

/* ---------- שאלות בסגנון בגרות: תשובה כתובה + מחוון לבדיקה עצמית ---------- */
// B = [{src, title, stem, parts:[{n:'א(1)', task, pts, rubric:[[טקסט, אחוז]], model}]}]
function renderBagrut(box, B, tag) {
  box.innerHTML = B.map((q, i) => `<section class="card bq"><span class="qn">שאלה בסגנון בגרות ${i + 1}</span><h3>${q.title}</h3><div>${q.stem}</div>
   ${q.parts.map((p, j) => `<div class="bpart" id="${tag}${i}_${j}"><p><b>${p.n}</b> ${p.task} <span class="hint">(${p.pts} נקודות)</span></p>
    <textarea rows="4" aria-label="תשובה לסעיף ${p.n}" placeholder="כתבו את התשובה כמו בבחינה: קביעה, ואחריה נימוק או הסבר."></textarea>
    <button class="ghost rv" data-i="${i}" data-j="${j}">סיימתי — הצגת המחוון</button>
    <div class="rub" hidden><p><b>מחוון:</b> סמנו מה כלול בתשובה שלכם.</p>${p.rubric.map(([t, w], k) => `<label><input type="checkbox" data-w="${w}"> ${t} <span class="hint">(${w}%)</span></label>`).join('')}
     <button class="sc" data-i="${i}" data-j="${j}">חישוב הציון לסעיף</button><div class="fb" role="status"></div>
     <details><summary>תשובה לדוגמה</summary><p>${p.model}</p></details></div></div>`).join('')}
   <p class="src">מקור: ${q.src}</p></section>`).join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('.rv,.sc'); if (!b) return;
    const part = $(`${tag}${b.dataset.i}_${b.dataset.j}`), P = B[+b.dataset.i].parts[+b.dataset.j], ta = part.querySelector('textarea');
    if (b.matches('.rv')) { if (ta.value.trim().length < 5) { ta.focus(); ta.placeholder = 'כתבו תשובה לפני שפותחים את המחוון.'; return } part.querySelector('.rub').hidden = false; ta.readOnly = true; b.hidden = true; return }
    const boxes = [...part.querySelectorAll('.rub input')], got = boxes.filter(c => c.checked).reduce((s, c) => s + +c.dataset.w, 0);
    const out = part.querySelector('.rub .fb'); fb(out, got === 100, `${got}% מהניקוד בסעיף (${Math.round(got / 100 * P.pts * 10) / 10} מתוך ${P.pts} נקודות).` + (got < 100 ? ' השוו לתשובה לדוגמה ושימו לב מה חסר.' : ''));
    Lab.rec(`בגרות ${+b.dataset.i + 1}, סעיף ${P.n}`, got === 100, `"${ta.value.trim().slice(0, 140)}${ta.value.trim().length > 140 ? '…' : ''}" — מחוון ${got}%`);
  });
}
