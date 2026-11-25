const Categories = {
  render() {
    const { categories, menu } = Store.get();
    return `
      <div class="page-head">
        <div><div class="crumb">Catalog</div><h1>Categories</h1><p>Keep service periods and cuisine lanes precise.</p></div>
        <button class="btn btn-primary" id="add-cat">Add category</button>
      </div>
      <div class="card-grid">
        ${categories
          .map((c) => {
            const count = menu.filter((m) => m.category === c.name).length;
            return `<article class="panel" style="padding:18px">
              <h3 style="margin:0 0 6px">${c.name}</h3>
              <p style="color:var(--text-2)">${c.description}</p>
              <div style="color:var(--text-3);font-size:13px;margin-bottom:12px">${count} dishes</div>
              <div class="actions">
                <button class="btn btn-ghost btn-sm" data-edit="${c.id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-del="${c.id}">Delete</button>
              </div>
            </article>`;
          })
          .join("")}
      </div>`;
  },

  bind() {
    document.getElementById("add-cat").onclick = () => this.form();
    document.querySelector("[data-view-root]").onclick = async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (edit) this.form(edit.dataset.edit);
      if (del) {
        const ok = await UI.confirm({ title: "Delete category", body: "Existing dishes keep their labels.", danger: true });
        if (!ok) return;
        Store.patch((d) => {
          d.categories = d.categories.filter((c) => c.id !== del.dataset.del);
        });
        App.show("categories");
      }
    };
  },

  form(id) {
    const c = Store.get().categories.find((x) => x.id === id) || { name: "", description: "" };
    UI.openModal(`
      <h2 style="margin-top:0">${id ? "Edit" : "New"} category</h2>
      <form class="form-grid" id="cat-form">
        <label>Name <input class="input" name="name" required value="${c.name}"></label>
        <label>Description <input class="input" name="description" required value="${c.description}"></label>
        <div class="actions" style="justify-content:flex-end">
          <button type="button" class="btn btn-ghost" id="cancel">Close</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>`);
    document.getElementById("cancel").onclick = () => UI.closeAll();
    document.getElementById("cat-form").onsubmit = (e) => {
      e.preventDefault();
      const rec = { id: id || uid("cat"), name: e.target.name.value.trim(), description: e.target.description.value.trim() };
      Store.patch((d) => {
        const i = d.categories.findIndex((x) => x.id === rec.id);
        if (i >= 0) d.categories[i] = rec;
        else d.categories.push(rec);
      });
      UI.closeAll();
      App.show("categories");
    };
  },
};
