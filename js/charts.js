const Charts = {
  line(svg, points, { color = "var(--accent)" } = {}) {
    const w = 640;
    const h = 240;
    const pad = 28;
    if (!points.length) return;
    const max = Math.max(...points.map((p) => p.y), 1);
    const step = (w - pad * 2) / Math.max(points.length - 1, 1);
    const coords = points.map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - (p.y / max) * (h - pad * 2);
      return { x, y, label: p.x };
    });
    const d = coords.map((c, i) => `${i ? "L" : "M"}${c.x},${c.y}`).join(" ");
    const area = `${d} L${coords.at(-1).x},${h - pad} L${coords[0].x},${h - pad} Z`;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = `
      <defs>
        <linearGradient id="fillLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C8FF55" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#C8FF55" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${[0, 0.5, 1].map((t) => {
        const y = pad + t * (h - pad * 2);
        return `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.06)"/>`;
      }).join("")}
      <path d="${area}" fill="url(#fillLine)"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="2.2"/>
      ${coords
        .map(
          (c, i) =>
            `<circle cx="${c.x}" cy="${c.y}" r="3" fill="${color}"/>
             <text x="${c.x}" y="${h - 8}" text-anchor="middle" fill="#626973" font-size="10">${i % Math.ceil(points.length / 7) === 0 ? c.label : ""}</text>`
        )
        .join("")}
    `;
  },

  spark(values) {
    const w = 92;
    const h = 36;
    const max = Math.max(...values, 1);
    const step = w / Math.max(values.length - 1, 1);
    const d = values
      .map((v, i) => `${i ? "L" : "M"}${i * step},${h - (v / max) * (h - 4) - 2}`)
      .join(" ");
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="#C8FF55" stroke-width="1.6"/></svg>`;
  },

  bars(el, values) {
    const max = Math.max(...values.map((v) => v.y), 1);
    el.innerHTML = values
      .map(
        (v) =>
          `<div class="bar" style="height:${Math.max(8, (v.y / max) * 100)}%"><span>${v.x}</span></div>`
      )
      .join("");
  },
};
