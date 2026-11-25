const Staff = {
  q: "",

  render() {
    const list = Store.get().staff.filter((s) =>
      `${s.name} ${s.role} ${s.email}`.toLowerCase().includes(this.q.toLowerCase())
    );
    return `
      <div class="page-head">
        <div><div class="crumb">People</div><h1>Staff</h1><p>The team behind the pass.</p></div>
        <button class="btn btn-primary" id="add-staff">Add staff</button>
      </div>
      <div class="toolbar"><input class="input" id="st-q" placeholder="Search staff" value="${this.q}"></div>
      <div class="card-grid">
        ${list
          .map(
            (s) => `<article class="panel" style="padding:16px">
              <div class="person">
                <img src="${s.photo}" alt="">
                <div>
                  <strong>${s.name}</strong>
                  <div style="color:var(--text-2);font-size:13px">${s.role}</div>
                </div>
              </div>
              <p style="color:var(--text-2);font-size:13px">${s.email}<br>${s.phone}</p>
              <span class="badge ${s.status === "Active" ? "badge-available" : "badge-cancelled"}">${s.status}</span>
              <div class="actions" style="margin-top:12px">
                <button class="btn btn-ghost btn-sm" data-edit="${s.id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-del="${s.id}">Remove</button>
              </div>
            </article>`
          )
          .join("")}
      </div>`;
  },

  bind() {
    document.getElementById("st-q").oninput = (e) => {
      this.q = e.target.value;
      App.show("staff");
      const el = document.getElementById("st-q");
      el.focus();
      el.setSelectionRange(this.q.length, this.q.length);
    };
    document.getElementById("add-staff").onclick = () => this.form();
    document.querySelector("[data-view-root]").onclick = async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (edit) this.form(edit.dataset.edit);
      if (del) {
        const ok = await UI.confirm({ title: "Remove staff", body: "They will lose dashboard access in this demo.", danger: true });
        if (!ok) return;
        Store.patch((d) => {
          d.staff = d.staff.filter((x) => x.id !== del.dataset.del);
        });
        App.show("staff");
      }
    };
  },

  form(id) {
    const s = Store.get().staff.find((x) => x.id === id) || {
      name: "",
      role: "Runner",
      status: "Active",
      email: "",
      phone: "",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    };
    UI.openModal(`
      <h2 style="margin-top:0">${id ? "Edit" : "Add"} staff</h2>
      <form class="form-grid" id="staff-form">
        <label>Name <input class="input" name="name" required value="${s.name}"></label>
        <label>Role
          <select class="select" name="role">
            ${["Manager", "Head Chef", "Line Cook", "Cashier", "Runner"].map((r) => `<option ${r === s.role ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </label>
        <label>Status
          <select class="select" name="status">
            <option ${s.status === "Active" ? "selected" : ""}>Active</option>
            <option ${s.status === "Off duty" ? "selected" : ""}>Off duty</option>
          </select>
        </label>
        <label>Email <input class="input" type="email" name="email" required value="${s.email}"></label>
        <label>Phone <input class="input" name="phone" required value="${s.phone}"></label>
        <label>Photo URL <input class="input" name="photo" value="${s.photo}"></label>
        <div class="actions" style="justify-content:flex-end">
          <button type="button" class="btn btn-ghost" id="cancel">Close</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>`);
    document.getElementById("cancel").onclick = () => UI.closeAll();
    document.getElementById("staff-form").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const rec = {
        id: id || uid("s"),
        name: f.name.value.trim(),
        role: f.role.value,
        status: f.status.value,
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        photo: f.photo.value.trim(),
      };
      Store.patch((d) => {
        const i = d.staff.findIndex((x) => x.id === rec.id);
        if (i >= 0) d.staff[i] = rec;
        else d.staff.unshift(rec);
      });
      UI.closeAll();
      App.show("staff");
    };
  },
};
