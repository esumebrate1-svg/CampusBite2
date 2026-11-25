const Orders = {
  q: "",
  status: "all",
  date: "all",

  render() {
    const list = this.filtered();
    return `
      <div class="page-head">
        <div><div class="crumb">Operations</div><h1>Orders</h1><p>Track, update, and fulfill every ticket.</p></div>
        <div class="actions"><button class="btn btn-primary" id="new-order"><i data-lucide="plus"></i> New order</button></div>
      </div>
      <div class="toolbar">
        <input class="input" id="order-q" placeholder="Search ID, student, item…" value="${this.q}">
        <select class="select" id="order-status">
          ${["all", "Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"]
            .map((s) => `<option ${this.status === s ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
        <select class="select" id="order-date">
          <option value="all" ${this.date === "all" ? "selected" : ""}>All dates</option>
          <option value="today" ${this.date === "today" ? "selected" : ""}>Today</option>
          <option value="week" ${this.date === "week" ? "selected" : ""}>This week</option>
        </select>
      </div>
      <section class="panel">
        <div class="panel-b" style="padding:0;overflow:auto">
          ${
            list.length
              ? `<table class="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${list
                .map(
                  (o) => `<tr>
                    <td>${o.id}</td>
                    <td>${o.customerName}<div style="color:var(--text-3);font-size:12px">${o.studentId}</div></td>
                    <td>${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                    <td>${money(o.total)}</td>
                    <td>${o.payment}</td>
                    <td>${formatDate(o.createdAt)}</td>
                    <td><span class="badge ${badgeClass(o.status)}">${o.status}</span></td>
                    <td class="row-actions">
                      <button class="icon-btn" data-open="${o.id}" title="Details"><i data-lucide="panel-right"></i></button>
                      <button class="icon-btn" data-del="${o.id}" title="Delete"><i data-lucide="trash-2"></i></button>
                    </td>
                  </tr>`
                )
                .join("")}
            </tbody></table>`
              : `<div class="empty">No orders match those filters.</div>`
          }
        </div>
      </section>`;
  },

  filtered() {
    const { orders } = Store.get();
    const now = new Date();
    return orders
      .filter((o) => {
        const q = this.q.toLowerCase();
        const hay = `${o.id} ${o.customerName} ${o.studentId} ${o.items.map((i) => i.name).join(" ")}`.toLowerCase();
        if (q && !hay.includes(q)) return false;
        if (this.status !== "all" && o.status !== this.status) return false;
        const d = new Date(o.createdAt);
        if (this.date === "today" && d.toDateString() !== now.toDateString()) return false;
        if (this.date === "week" && now - d > 7 * 86400000) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  bind() {
    document.getElementById("order-q").oninput = (e) => {
      this.q = e.target.value;
      App.show("orders");
      document.getElementById("order-q").focus();
      document.getElementById("order-q").setSelectionRange(this.q.length, this.q.length);
    };
    document.getElementById("order-status").onchange = (e) => {
      this.status = e.target.value;
      App.show("orders");
    };
    document.getElementById("order-date").onchange = (e) => {
      this.date = e.target.value;
      App.show("orders");
    };
    document.getElementById("new-order").onclick = () => this.create();
    document.querySelector("[data-view-root]").onclick = async (e) => {
      const open = e.target.closest("[data-open]");
      const del = e.target.closest("[data-del]");
      if (open) this.details(open.dataset.open);
      if (del) {
        const ok = await UI.confirm({ title: "Delete order", body: "This cannot be undone.", danger: true });
        if (!ok) return;
        Store.patch((d) => {
          d.orders = d.orders.filter((o) => o.id !== del.dataset.del);
        });
        UI.toast("Order deleted");
        App.show("orders");
      }
    };
  },

  details(id) {
    const o = Store.get().orders.find((x) => x.id === id);
    if (!o) return;
    const statuses = ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];
    UI.openDrawer(`
      <div class="actions" style="justify-content:space-between">
        <h2 style="margin:0">${o.id}</h2>
        <button class="icon-btn" id="close-d"><i data-lucide="x"></i></button>
      </div>
      <p style="color:var(--text-2)">${o.customerName} · ${o.studentId}<br>${o.pickup} · ${formatDate(o.createdAt)}</p>
      ${o.items
        .map(
          (i) =>
            `<div class="low-row"><span>${i.qty}× ${i.name}</span><strong>${money(i.price * i.qty)}</strong></div>`
        )
        .join("")}
      <div class="low-row"><span>Subtotal</span><strong>${money(o.total)}</strong></div>
      <div class="low-row"><span>Payment</span><strong>${o.payment}</strong></div>
      <label style="display:grid;gap:6px;margin:16px 0;color:var(--text-2);font-size:13px">Status
        <select class="select" id="st">${statuses.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select>
      </label>
      <h3>History</h3>
      <ul class="activity">${o.history.map((h) => `<li>${h.status} · ${formatDate(h.at)}</li>`).join("")}</ul>
      <div class="actions">
        <button class="btn btn-ghost" id="cancel-o">Cancel order</button>
        <button class="btn btn-primary" id="save-st">Update</button>
      </div>
    `);
    document.getElementById("close-d").onclick = () => UI.closeAll();
    document.getElementById("save-st").onclick = () => {
      const status = document.getElementById("st").value;
      this.setStatus(id, status);
    };
    document.getElementById("cancel-o").onclick = () => this.setStatus(id, "Cancelled");
  },

  setStatus(id, status) {
    Store.patch((d) => {
      const o = d.orders.find((x) => x.id === id);
      if (!o) return;
      o.status = status;
      o.history.push({ status, at: new Date().toISOString() });
      d.activity.unshift({ id: uid("a"), text: `Order ${id} → ${status}`, at: new Date().toISOString() });
    });
    UI.closeAll();
    UI.toast(`Order ${id} updated`);
    App.show("orders");
  },

  create() {
    const data = Store.get();
    UI.openModal(`
      <h2 style="margin-top:0">Manual order</h2>
      <form class="form-grid" id="order-form">
        <label>Customer
          <select class="select" name="customer">${data.customers.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select>
        </label>
        <label>Item
          <select class="select" name="item">${data.menu.map((m) => `<option value="${m.id}">${m.name} — ${money(m.price)}</option>`).join("")}</select>
        </label>
        <label>Quantity <input class="input" name="qty" type="number" min="1" value="1"></label>
        <label>Pickup
          <select class="select" name="pickup">
            <option>Main Cafeteria</option><option>Student Center</option><option>Library Café</option><option>Block A Food Court</option>
          </select>
        </label>
        <div class="actions" style="justify-content:flex-end">
          <button type="button" class="btn btn-ghost" id="cancel">Close</button>
          <button class="btn btn-primary">Create</button>
        </div>
      </form>`);
    document.getElementById("cancel").onclick = () => UI.closeAll();
    document.getElementById("order-form").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const customer = data.customers.find((c) => c.id === f.customer.value);
      const food = data.menu.find((m) => m.id === f.item.value);
      const qty = Math.max(1, Number(f.qty.value));
      const createdAt = new Date().toISOString();
      const rec = {
        id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: customer.id,
        customerName: customer.name,
        studentId: customer.studentId,
        items: [{ id: food.id, name: food.name, price: food.price, qty, image: food.image }],
        total: food.price * qty,
        status: "Pending",
        createdAt,
        pickup: f.pickup.value,
        payment: "unpaid",
        notes: "",
        history: [{ status: "Pending", at: createdAt }],
      };
      Store.patch((d) => {
        d.orders.unshift(rec);
        d.activity.unshift({ id: uid("a"), text: `New order ${rec.id} received`, at: createdAt });
        const c = d.customers.find((x) => x.id === customer.id);
        if (c) {
          c.orders += 1;
          c.spent += rec.total;
          c.last = createdAt;
        }
      });
      UI.closeAll();
      UI.toast("Order created");
      App.show("orders");
    };
  },
};
