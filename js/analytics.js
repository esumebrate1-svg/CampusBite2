const Analytics = {
  range: "week",

  render() {
    const m = this.metrics();
    return `
      <div class="page-head">
        <div><div class="crumb">Insight</div><h1>Analytics</h1><p>How the restaurant is performing.</p></div>
        <div class="seg" id="an-range">
          <button data-r="today" class="${this.range === "today" ? "active" : ""}">Today</button>
          <button data-r="week" class="${this.range === "week" ? "active" : ""}">This Week</button>
          <button data-r="month" class="${this.range === "month" ? "active" : ""}">This Month</button>
          <button data-r="custom" class="${this.range === "custom" ? "active" : ""}">Custom</button>
        </div>
      </div>
      ${
        this.range === "custom"
          ? `<div class="toolbar"><input class="input" type="date" id="from"><input class="input" type="date" id="to"><button class="btn btn-ghost" id="apply-custom">Apply</button></div>`
          : ""
      }
      <div class="kpi-grid">
        ${this.kpi("Total revenue", money(m.revenue))}
        ${this.kpi("Total orders", m.count)}
        ${this.kpi("Average order", money(m.aov))}
        ${this.kpi("Completion rate", `${m.rate}%`)}
      </div>
      <div class="grid-2">
        <section class="panel"><div class="panel-h"><h2>Revenue trend</h2></div><div class="panel-b chart-wrap"><svg id="an-line"></svg></div></section>
        <section class="panel"><div class="panel-h"><h2>Sales by category</h2></div><div class="panel-b"><div class="bars" id="an-bars"></div></div></section>
      </div>
      <div class="grid-2" style="margin-top:14px">
        <section class="panel"><div class="panel-h"><h2>Most popular</h2></div>
          <div class="panel-b">${m.popular.map((p) => `<div class="low-row"><span>${p.name}</span><strong>${p.qty} sold</strong></div>`).join("")}</div>
        </section>
        <section class="panel"><div class="panel-h"><h2>Peak ordering hours</h2></div>
          <div class="panel-b"><div class="bars" id="an-hours"></div></div>
        </section>
      </div>`;
  },

  kpi(label, value) {
    return `<article class="kpi"><div class="label">${label}</div><div class="value">${value}</div></article>`;
  },

  inRange(iso) {
    const d = new Date(iso);
    const now = new Date();
    if (this.range === "today") return d.toDateString() === now.toDateString();
    if (this.range === "week") return now - d < 7 * 86400000;
    if (this.range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (this.from && this.to) return d >= new Date(this.from) && d <= new Date(this.to + "T23:59:59");
    return true;
  },

  metrics() {
    const orders = Store.get().orders.filter((o) => this.inRange(o.createdAt));
    const valid = orders.filter((o) => o.status !== "Cancelled");
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const completed = orders.filter((o) => o.status === "Completed").length;
    const map = {};
    valid.forEach((o) => o.items.forEach((i) => (map[i.name] = (map[i.name] || 0) + i.qty)));
    const popular = Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
    return {
      revenue,
      count: orders.length,
      aov: valid.length ? Math.round(revenue / valid.length) : 0,
      rate: orders.length ? Math.round((completed / orders.length) * 100) : 0,
      popular,
      orders: valid,
    };
  },

  bind() {
    document.getElementById("an-range")?.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      this.range = b.dataset.r;
      App.show("analytics");
    });
    document.getElementById("apply-custom")?.addEventListener("click", () => {
      this.from = document.getElementById("from").value;
      this.to = document.getElementById("to").value;
      App.show("analytics");
    });
    const m = this.metrics();
    const points = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = Store.get()
        .orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString() && o.status !== "Cancelled")
        .reduce((s, o) => s + o.total, 40 + i * 30);
      points.push({ x: `${d.getDate()}`, y });
    }
    Charts.line(document.getElementById("an-line"), points);
    const cats = {};
    Store.get().menu.forEach((item) => {
      cats[item.category] = (cats[item.category] || 0) + item.popularity;
    });
    Charts.bars(
      document.getElementById("an-bars"),
      Object.entries(cats).map(([x, y]) => ({ x: x.slice(0, 3), y }))
    );
    Charts.bars(
      document.getElementById("an-hours"),
      Array.from({ length: 10 }, (_, i) => ({
        x: String(i + 9),
        y: Store.get().orders.filter((o) => new Date(o.createdAt).getHours() === i + 9).length + 1 + (i % 3),
      }))
    );
  },
};
