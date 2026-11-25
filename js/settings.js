const Settings = {
  render() {
    const s = Store.get().settings;
    return `
      <div class="page-head">
        <div><div class="crumb">System</div><h1>Settings</h1><p>Identity, hours, and how CampusBite behaves.</p></div>
      </div>
      <form class="panel" id="set-form" style="padding:22px;display:grid;gap:14px;max-width:720px">
        <label>Restaurant name <input class="input" name="restaurantName" required value="${s.restaurantName}"></label>
        <label>Description <textarea class="input" name="description">${s.description}</textarea></label>
        <div class="toolbar">
          <label>Opens <input class="input" type="time" name="openHour" value="${s.openHour}"></label>
          <label>Closes <input class="input" type="time" name="closeHour" value="${s.closeHour}"></label>
        </div>
        <label>Currency <input class="input" name="currency" value="${s.currency}"></label>
        <label style="display:flex;gap:8px;align-items:center;color:var(--text-2)"><input type="checkbox" name="isOpen" ${s.isOpen ? "checked" : ""}> Restaurant is open</label>
        <label style="display:flex;gap:8px;align-items:center;color:var(--text-2)"><input type="checkbox" name="notifyOrders" ${s.notifyOrders ? "checked" : ""}> Order notifications</label>
        <label style="display:flex;gap:8px;align-items:center;color:var(--text-2)"><input type="checkbox" name="notifyStock" ${s.notifyStock ? "checked" : ""}> Low-stock alerts</label>
        <label>Theme
          <select class="select" name="theme">
            <option value="dark" ${s.theme === "dark" ? "selected" : ""}>Dark</option>
            <option value="light" ${s.theme === "light" ? "selected" : ""}>Light</option>
          </select>
        </label>
        <div class="actions">
          <button class="btn btn-primary">Save settings</button>
          <button type="button" class="btn btn-ghost" id="reset-data">Reset demo data</button>
        </div>
      </form>`;
  },

  bind() {
    document.getElementById("set-form").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      Store.patch((d) => {
        d.settings = {
          restaurantName: f.restaurantName.value.trim(),
          description: f.description.value.trim(),
          openHour: f.openHour.value,
          closeHour: f.closeHour.value,
          currency: f.currency.value.trim() || "ETB",
          isOpen: f.isOpen.checked,
          notifyOrders: f.notifyOrders.checked,
          notifyStock: f.notifyStock.checked,
          theme: f.theme.value,
        };
      });
      applyTheme(f.theme.value);
      UI.toast("Settings saved");
      App.refreshChrome();
      App.show("settings");
    };
    document.getElementById("reset-data").onclick = async () => {
      const ok = await UI.confirm({ title: "Reset demo", body: "All local data will be replaced with the original sample kitchen.", danger: true });
      if (!ok) return;
      Store.reset(buildSeed());
      applyTheme("dark");
      UI.toast("Demo data restored");
      App.show("overview");
    };
  },
};
