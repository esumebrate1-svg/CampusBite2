const Tables = {
  render() {
    const { tables } = Store.get();
    return `
      <div class="page-head">
        <div><div class="crumb">Floor</div><h1>Tables</h1><p>A live reading of the dining room.</p></div>
        <button class="btn btn-primary" id="add-table">Add table</button>
      </div>
      <div class="table-map">
        ${tables
          .map(
            (t) => `<article class="table-tile ${t.status.toLowerCase()}" data-table="${t.id}">
              <div>
                <div style="color:var(--text-3);font-size:12px;letter-spacing:.12em">TABLE</div>
                <h3>${String(t.number).padStart(2, "0")}</h3>
              </div>
              <div>
                <div>${t.capacity} seats</div>
                <span class="badge ${badgeClass(t.status)}">${t.status}</span>
                ${t.orderId ? `<div style="margin-top:6px;font-size:12px;color:var(--text-2)">${t.orderId}</div>` : ""}
              </div>
            </article>`
          )
          .join("")}
      </div>`;
  },

  bind() {
    document.getElementById("add-table").onclick = () => {
      Store.patch((d) => {
        const number = Math.max(0, ...d.tables.map((t) => t.number)) + 1;
        d.tables.push({ id: uid("t"), number, capacity: 4, status: "Available", orderId: null });
      });
      App.show("tables");
    };
    document.querySelector("[data-view-root]").onclick = (e) => {
      const tile = e.target.closest("[data-table]");
      if (tile) this.details(tile.dataset.table);
    };
  },

  details(id) {
    const data = Store.get();
    const t = data.tables.find((x) => x.id === id);
    const activeOrders = data.orders.filter((o) => ["Pending", "Confirmed", "Preparing", "Ready"].includes(o.status));
    UI.openDrawer(`
      <div class="actions" style="justify-content:space-between"><h2 style="margin:0">Table ${t.number}</h2>
      <button class="icon-btn" id="close-d"><i data-lucide="x"></i></button></div>
      <form class="form-grid" id="table-form">
        <label>Capacity <input class="input" type="number" name="capacity" min="1" value="${t.capacity}"></label>
        <label>Status
          <select class="select" name="status">
            ${["Available", "Occupied", "Reserved", "Cleaning"].map((s) => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <label>Assign order
          <select class="select" name="orderId">
            <option value="">None</option>
            ${activeOrders.map((o) => `<option value="${o.id}" ${o.id === t.orderId ? "selected" : ""}>${o.id} · ${o.customerName}</option>`).join("")}
          </select>
        </label>
        <div class="actions">
          <button type="button" class="btn btn-ghost" id="clean">Mark cleaned</button>
          <button type="button" class="btn btn-danger" id="remove">Remove</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>`);
    document.getElementById("close-d").onclick = () => UI.closeAll();
    document.getElementById("clean").onclick = () => {
      this.update(id, { status: "Available", orderId: null });
    };
    document.getElementById("remove").onclick = async () => {
      const ok = await UI.confirm({ title: "Remove table", body: "It will disappear from the floor plan.", danger: true });
      if (!ok) return;
      Store.patch((d) => {
        d.tables = d.tables.filter((x) => x.id !== id);
      });
      UI.closeAll();
      App.show("tables");
    };
    document.getElementById("table-form").onsubmit = (e) => {
      e.preventDefault();
      this.update(id, {
        capacity: Number(e.target.capacity.value),
        status: e.target.status.value,
        orderId: e.target.orderId.value || null,
      });
    };
  },

  update(id, patch) {
    Store.patch((d) => {
      const t = d.tables.find((x) => x.id === id);
      Object.assign(t, patch);
    });
    UI.closeAll();
    UI.toast("Table updated");
    App.show("tables");
  },
};
