const Dashboard = {
  range: "7",

  render() {
    const data = Store.get();
    const orders = data.orders;
    const today = new Date().toDateString();
    const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
    const active = orders.filter((o) => ["Pending", "Confirmed", "Preparing", "Ready"].includes(o.status)).length;
    const tablesFree = data.tables.filter((t) => t.status === "Available").length;
    const greeting = greet();
    const hourCounts = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8;
      const y = orders.filter((o) => new Date(o.createdAt).getHours() === hour).length + ((i * 3) % 5);
      return { x: `${hour}`, y };
    });

    return `
      <div class="dash-hero">
        <div>
          <div class="crumb">Overview</div>
          <h1>${greeting}, ${data.staff[0]?.name.split(" ")[0] || "Admin"}</h1>
          <p>Here's what's happening at your campus restaurant today.</p>
        </div>
        <div class="status-pill ${data.settings.isOpen ? "" : "closed"}">
          <span class="live"></span>
          Kitchen ${data.settings.isOpen ? "OPEN" : "CLOSED"} · ${data.settings.openHour}–${data.settings.closeHour}
        </div>
      </div>
      <div class="kpi-grid">
        ${kpi("Total Revenue", money(revenue), "+12.4% vs last week", Charts.spark([12, 18, 14, 22, 28, 24, 31]))}
        ${kpi("Total Orders", orders.length, "+8.1%", Charts.spark([4, 6, 5, 9, 8, 11, 10]))}
        ${kpi("Active Orders", active, "live kitchen", Charts.spark([2, 3, 4, 3, 5, 4, active]))}
        ${kpi("Available Tables", `${tablesFree}/${data.tables.length}`, "floor status", Charts.spark([3, 4, 5, 4, 6, 5, tablesFree]))}
      </div>
      <div class="grid-3">
        <section class="panel">
          <div class="panel-h">
            <h2>Revenue</h2>
            <div class="seg" id="rev-range">
              <button data-r="7" class="${this.range === "7" ? "active" : ""}">7 Days</button>
              <button data-r="30" class="${this.range === "30" ? "active" : ""}">30 Days</button>
              <button data-r="365" class="${this.range === "365" ? "active" : ""}">This Year</button>
            </div>
          </div>
          <div class="panel-b chart-wrap"><svg id="rev-chart"></svg></div>
        </section>
        <section class="panel">
          <div class="panel-h"><h2>Recent orders</h2></div>
          <div class="panel-b" style="padding:0">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Student</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                ${orders
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 6)
                  .map(
                    (o) => `<tr>
                      <td>${o.id}</td>
                      <td>${o.customerName}<div style="color:var(--text-3);font-size:12px">${o.items.map((i) => i.name).join(", ")}</div></td>
                      <td>${money(o.total)}</td>
                      <td><span class="badge ${badgeClass(o.status)}">${o.status}</span></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
        <section class="panel">
          <div class="panel-h"><h2>Activity</h2></div>
          <div class="panel-b"><ul class="activity">${data.activity
            .map((a) => `<li><div><strong style="color:var(--text)">${a.text}</strong><div>${timeAgo(a.at)}</div></div></li>`)
            .join("")}</ul></div>
        </section>
      </div>
      <div class="grid-2" style="margin-top:14px">
        <section class="panel">
          <div class="panel-h"><h2>Popular meals</h2></div>
          <div class="panel-b popular-row">
            ${data.menu
              .slice()
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 6)
              .map(
                (m) => `<div class="popular-item"><img src="${m.image}" alt=""><div><strong>${m.name}</strong><div class="price">${money(m.price)}</div><div style="color:var(--text-3);font-size:12px">${m.popularity} sold score</div></div></div>`
              )
              .join("")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-h"><h2>Peak hours</h2></div>
          <div class="panel-b"><div class="bars" id="peak-bars"></div></div>
        </section>
      </div>
    `;

    function kpi(label, value, delta, spark) {
      return `<article class="kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="delta">${delta}</div>${spark}</article>`;
    }
    function greet() {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    }
  },

  bind() {
    const svg = document.getElementById("rev-chart");
    this.draw(svg);
    Charts.bars(document.getElementById("peak-bars"), this.hours());
    document.getElementById("rev-range")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      this.range = btn.dataset.r;
      App.show("overview");
    });
  },

  hours() {
    const orders = Store.get().orders;
    return Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8;
      const y = orders.filter((o) => new Date(o.createdAt).getHours() === hour).length + ((i * 3) % 4) + 2;
      return { x: String(hour), y };
    });
  },

  draw(svg) {
    if (!svg) return;
    const days = Number(this.range);
    const points = [];
    for (let i = days === 365 ? 11 : days - 1; i >= 0; i--) {
      const d = new Date();
      if (days === 365) d.setMonth(d.getMonth() - i);
      else d.setDate(d.getDate() - i);
      const key = days === 365 ? d.getMonth() : d.toDateString();
      const y = Store.get()
        .orders.filter((o) => {
          const od = new Date(o.createdAt);
          const match = days === 365 ? od.getMonth() === d.getMonth() : od.toDateString() === d.toDateString();
          return match && o.status !== "Cancelled";
        })
        .reduce((s, o) => s + o.total, 80 + ((i * 47) % 220));
      points.push({
        x: days === 365 ? d.toLocaleString(undefined, { month: "short" }) : `${d.getDate()}/${d.getMonth() + 1}`,
        y,
      });
    }
    Charts.line(svg, points);
  },
};
