const Customers = {
  q: "",

  render() {
    const list = Store.get().customers.filter((c) =>
      `${c.name} ${c.studentId} ${c.email}`.toLowerCase().includes(this.q.toLowerCase())
    );
    return `
      <div class="page-head">
        <div><div class="crumb">People</div><h1>Customers</h1><p>Students who keep the kitchen moving.</p></div>
      </div>
      <div class="toolbar"><input class="input" id="cus-q" placeholder="Search students" value="${this.q}"></div>
      <section class="panel"><div class="panel-b" style="padding:0;overflow:auto">
        <table class="data-table">
          <thead><tr><th>Student</th><th>ID</th><th>Orders</th><th>Spent</th><th>Last seen</th><th></th></tr></thead>
          <tbody>
            ${list
              .map(
                (c) => `<tr>
                  <td>${c.name}<div style="color:var(--text-3);font-size:12px">${c.email}</div></td>
                  <td>${c.studentId}</td>
                  <td>${c.orders}</td>
                  <td>${money(c.spent)}</td>
                  <td>${timeAgo(c.last)}</td>
                  <td><button class="btn btn-ghost btn-sm" data-open="${c.id}">Profile</button></td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div></section>`;
  },

  bind() {
    document.getElementById("cus-q").oninput = (e) => {
      this.q = e.target.value;
      App.show("customers");
      const el = document.getElementById("cus-q");
      el.focus();
      el.setSelectionRange(this.q.length, this.q.length);
    };
    document.querySelector("[data-view-root]").onclick = (e) => {
      const open = e.target.closest("[data-open]");
      if (open) this.profile(open.dataset.open);
    };
  },

  profile(id) {
    const data = Store.get();
    const c = data.customers.find((x) => x.id === id);
    const hist = data.orders.filter((o) => o.customerId === id || o.studentId === c.studentId);
    UI.openDrawer(`
      <div class="actions" style="justify-content:space-between"><h2 style="margin:0">${c.name}</h2>
      <button class="icon-btn" id="close-d"><i data-lucide="x"></i></button></div>
      <p style="color:var(--text-2)">${c.studentId}<br>${c.email}</p>
      <div class="kpi-grid" style="grid-template-columns:1fr 1fr">
        <div class="kpi"><div class="label">Orders</div><div class="value">${c.orders}</div></div>
        <div class="kpi"><div class="label">Spent</div><div class="value">${money(c.spent)}</div></div>
      </div>
      <h3>Order history</h3>
      ${hist.map((o) => `<div class="low-row"><span>${o.id} · ${o.status}</span><strong>${money(o.total)}</strong></div>`).join("") || "<p class='empty'>No orders yet.</p>"}
    `);
    document.getElementById("close-d").onclick = () => UI.closeAll();
  },
};
