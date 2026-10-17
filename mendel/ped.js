// ציור שושלות (אילנות יוחסין) ב-SVG מתיאור פשוט.
// <svg class="ped" data-ped='{"w":360,"rows":[["I",[{"id":"1","s":"m","x":120},{"id":"2","s":"f","x":220}]],...],"m":[["1","2"]],"k":[[["1","2"],["3","4"]]]}'></svg>
// s: m = זכר (ריבוע), f = נקבה (עיגול) · a:1 = חולה (מלא) · c:1 = נשא ידוע (נקודה) · g = טקסט מתחת (למשל גנוטיפ)
function drawPed(svg, P) {
  const R = 14, GAP = 92, TOP = 26, ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1F4D3A';
  const pos = {}; let h = TOP;
  P.rows.forEach(([lbl, inds], r) => { const y = TOP + r * GAP + R; inds.forEach(d => pos[d.id] = { ...d, y }); h = y + R + 44 });
  const W = P.w || 360, o = [];
  const line = (x1, y1, x2, y2) => o.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="2"/>`);
  (P.m || []).forEach(([a, b]) => line(pos[a].x, pos[a].y, pos[b].x, pos[b].y));
  (P.k || []).forEach(([[a, b], kids]) => {
    const mx = (pos[a].x + pos[b].x) / 2, my = pos[a].y, ky = pos[kids[0]].y - R - 16;
    line(mx, my, mx, ky);
    const xs = kids.map(k => pos[k].x); line(Math.min(mx, ...xs), ky, Math.max(mx, ...xs), ky);
    kids.forEach(k => line(pos[k].x, ky, pos[k].x, pos[k].y - R));
  });
  Object.values(pos).forEach(d => {
    const fill = d.a ? ink : '#fff';
    o.push(d.s === 'm' ? `<rect x="${d.x - R}" y="${d.y - R}" width="${2 * R}" height="${2 * R}" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`
      : `<circle cx="${d.x}" cy="${d.y}" r="${R}" fill="${fill}" stroke="${ink}" stroke-width="2.4"/>`);
    if (d.c) o.push(`<circle cx="${d.x}" cy="${d.y}" r="4.5" fill="${ink}"/>`);
    o.push(`<text x="${d.x}" y="${d.y + R + 16}" direction="ltr" text-anchor="middle" font-size="14" font-family="Rubik,Arial" fill="${ink}">${d.id}</text>`);
    if (d.g) o.push(`<text x="${d.x}" y="${d.y + R + 33}" text-anchor="middle" font-size="15" font-style="italic" font-weight="700" font-family="Georgia,serif" fill="#B8423A">${d.g}</text>`);
  });
  P.rows.forEach(([lbl], r) => o.push(`<text x="8" y="${TOP + r * GAP + R + 5}" direction="ltr" text-anchor="start" font-size="16" font-family="Georgia,serif" fill="#5C6F66">${lbl}</text>`));
  svg.setAttribute('viewBox', `0 0 ${W} ${h}`); svg.setAttribute('role', 'img');
  if (!svg.getAttribute('aria-label')) svg.setAttribute('aria-label', 'שושלת משפחה');
  svg.innerHTML = o.join('');
}
document.querySelectorAll('svg.ped[data-ped]').forEach(s => drawPed(s, JSON.parse(s.dataset.ped)));
