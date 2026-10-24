// גרפים פשוטים ב-SVG בצבעי אטלס: צירים, שנתות, עקומים או עמודות
const C_RICH = '#D7263D', C_POOR = '#2457C5', C_INK = '#13233A', C_MUT = '#5E6E82', C_LINE = '#DCE3EA';
function chart(o) {
  const W = 520, H = 320, L = 64, R = 20, T = 20, B = 58, pw = W - L - R, ph = H - T - B;
  const X = v => L + (v - o.x[0]) / (o.x[1] - o.x[0]) * pw, Y = v => T + ph - (v - o.y[0]) / (o.y[1] - o.y[0]) * ph;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.alt}" direction="ltr">`;
  (o.yt || []).forEach(v => { s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${C_LINE}"/><text x="${L - 8}" y="${Y(v) + 5}" text-anchor="end" font-size="14" fill="${C_MUT}">${o.yfmt ? o.yfmt(v) : v}</text>` });
  (o.xt || []).forEach(v => { s += `<text x="${X(v)}" y="${T + ph + 22}" text-anchor="middle" font-size="14" fill="${C_MUT}">${o.xfmt ? o.xfmt(v) : v}</text>` });
  if (o.zero !== undefined) s += `<line x1="${L}" x2="${W - R}" y1="${Y(o.zero)}" y2="${Y(o.zero)}" stroke="${C_INK}" stroke-width="1.5"/>`;
  s += `<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="${C_INK}" stroke-width="2"/><line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="${C_INK}" stroke-width="2"/>`;
  s += `<text x="${L + pw / 2}" y="${H - 10}" text-anchor="middle" font-size="15" font-weight="700" fill="${C_INK}" direction="rtl">${o.xl}</text>`;
  s += `<text transform="translate(16 ${T + ph / 2}) rotate(-90)" text-anchor="middle" font-size="15" font-weight="700" fill="${C_INK}" direction="rtl">${o.yl}</text>`;
  (o.bars || []).forEach(b => { const bw = 70; s += `<rect x="${X(b.x) - bw / 2}" y="${Y(b.v)}" width="${bw}" height="${Y(o.y[0]) - Y(b.v)}" rx="6" fill="${b.c}"/><text x="${X(b.x)}" y="${Y(b.v) - 8}" text-anchor="middle" font-size="16" font-weight="800" fill="${C_INK}">${b.v}</text>` });
  (o.lines || []).forEach(l => {
    s += `<polyline fill="none" stroke="${l.c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" ${l.dash ? 'stroke-dasharray="9 7"' : ''} points="${l.p.map(([a, b]) => X(a) + ',' + Y(b)).join(' ')}"/>`;
    if (l.dots) l.p.forEach(([a, b]) => { s += `<circle cx="${X(a)}" cy="${Y(b)}" r="5" fill="${l.c}"/>` });
    if (l.end) { const [a, b] = l.p[l.p.length - 1]; s += `<text x="${X(a)}" y="${Y(b) + 6}" text-anchor="middle" font-size="20" font-weight="800" fill="${l.c}">✕</text>` }
    if (l.lab) s += `<text x="${X(l.lab[0])}" y="${Y(l.lab[1])}" text-anchor="middle" font-size="16" font-weight="800" fill="${l.c}" direction="rtl">${l.t}</text>`;
  });
  return s + '</svg>';
}
