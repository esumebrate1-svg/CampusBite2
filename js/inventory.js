const Inventory = {
  q: "",
  filter: "all",

  render() {
    const items = this.list();
    return `
      <div class="page-head">
        <div><div class="crumb">Kitchen</div><h1>Inventory</h1><p>Quantities, suppliers, and the items running thin.</p></div>
        <button class="btn btn-primary" id="add-inv">Add item</button>
      </div>
      <div class="toolbar">
        <input class="input" id="inv-q" placeholder="Search ingredients" value="${this.q}">
        <select class="select" id="inv-f">
          <option value="all">All stock</option>
          <option value="Low Stock" ${this.filter === "Low Stock" ? "selected" : ""}>Low stock</option>
          <option value="Out of Stock" ${this.filter === "Out of Stock" ? "selected" : ""}>Out of stock</option>
        </select>
      </div>
      <section class="panel"><div class="panel-b" style="padding:0;overflow:auto">
        <table class="data-table">
          <thead><tr><th>Ingredient</th><th>Category</th><th>Qty</th><th>Cost</th><th>Supplier</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${items
              .map((i) => {
                const st = stockStatus(i);
                return `<tr style="${st !== "In Stock" ? "background:rgba(255,200,87,0.04)" : ""}">
                  <td>${i.name}</td>
                  <td>${i.category}</td>
                  <td>${i.qty} ${i.unit}</td>
                  <td>${money(i.cost)}</td>
                  <td>${i.supplier}</td>
                  <td><span class="badge ${badgeClass(st)}">${st}</span></td>
                  <td class="row-actions">
                    <button class="btn btn-ghost btn-sm" data-adj="${i.id}" data-d="-1">−</button>
                    <button class="btn btn-ghost btn-sm" data-adj="${i.id}" data-d="1">+</button>
                    <button class="icon-btn" data-edit="${i.id}"><i data-lucide="pencil"></i></button>
                    <button class="icon-btn" data-del="${i.id}"><i data-lucide="trash-2"></i></button>
                  </td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div></section>`;
  },

  list() {
    return Store.get().inventory.filter((i) => {
      const okQ = `${i.name} ${i.supplier} ${i.category}`.toLowerCase().includes(this.q.toLowerCase());
      const st = stockStatus(i);
      const okF = this.filter === "all" || st === this.filter;
      return okQ && okF;
    });
  },

  bind() {
    document.getElementById("inv-q").oninput = (e) => {
      this.q = e.target.value;
      App.show("inventory");
      const el = document.getElementById("inv-q");
      el.focus();
      el.setSelectionRange(this.q.length, this.q.length);
    };
    document.getElementById("inv-f").onchange = (e) => {
      this.filter = e.target.value;
      App.show("inventory");
    };
    document.getElementById("add-inv").onclick = () => this.form();
    document.querySelector("[data-view-root]").onclick = async (e) => {
      const adj = e.target.closest("[data-adj]");
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (adj) {
        Store.patch((d) => {
          const it = d.inventory.find((x) => x.id === adj.dataset.adj);
          it.qty = Math.max(0, it.qty + Number(adj.dataset.d));
          if (it.qty <= it.min) {
            d.activity.unshift({ id: uid("a"), text: `Low inventory: ${it.name}`, at: new Date().toISOString() });
          }
        });
        App.show("inventory");
      }
      if (edit) this.form(edit.dataset.edit);
      if (del) {
        const ok = await UI.confirm({ title: "Delete ingredient", body: "Remove this from inventory?", danger: true });
        if (!ok) return;
        Store.patch((d) => {
          d.inventory = d.inventory.filter((x) => x.id !== del.dataset.del);
        });
        App.show("inventory");
      }
    };
  },

  form(id) {
    const i = Store.get().inventory.find((x) => x.id === id) || {
      name: "",
      category: "Dry goods",
      qty: 10,
      unit: "kg",
      cost: 50,
      supplier: "",
      min: 5,
    };
    UI.openModal(`
      <h2 style="margin-top:0">${id ? "Edit" : "Add"} ingredient</h2>
      <form class="form-grid" id="inv-form">
        <label>Name <input class="input" name="name" required value="${i.name}"></label>
        <label>Category <input class="input" name="category" required value="${i.category}"></label>
        <label>Quantity <input class="input" type="number" name="qty" min="0" value="${i.qty}"></label>
        <label>Unit <input class="input" name="unit" value="${i.unit}"></label>
        <label>Cost <input class="input" type="number" name="cost" min="0" value="${i.cost}"></label>
        <label>Supplier <input class="input" name="supplier" required value="${i.supplier}"></label>
        <label>Low-stock minimum <input class="input" type="number" name="min" min="0" value="${i.min}"></label>
        <div class="actions" style="justify-content:flex-end">
          <button type="button" class="btn btn-ghost" id="cancel">Close</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>`);
    document.getElementById("cancel").onclick = () => UI.closeAll();
    document.getElementById("inv-form").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const rec = {
        id: id || uid("i"),
        name: f.name.value.trim(),
        category: f.category.value.trim(),
        qty: Number(f.qty.value),
        unit: f.unit.value.trim(),
        cost: Number(f.cost.value),
        supplier: f.supplier.value.trim(),
        min: Number(f.min.value),
      };
      Store.patch((d) => {
        const idx = d.inventory.findIndex((x) => x.id === rec.id);
        if (idx >= 0) d.inventory[idx] = rec;
        else d.inventory.unshift(rec);
      });
      UI.closeAll();
      App.show("inventory");
    };
  },
};
