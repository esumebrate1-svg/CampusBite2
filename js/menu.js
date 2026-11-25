const Menu = {
  q: "",
  cat: "All",

  render() {
    const { menu, categories } = Store.get();
    const items = menu.filter((m) => {
      const okQ = `${m.name} ${m.description}`.toLowerCase().includes(this.q.toLowerCase());
      const okC = this.cat === "All" || m.category === this.cat;
      return okQ && okC;
    });
    return `
      <div class="page-head">
        <div><div class="crumb">Catalog</div><h1>Menu</h1><p>Shape the campus plate with availability, pricing, and photography.</p></div>
        <div class="actions"><button class="btn btn-primary" id="add-food"><i data-lucide="plus"></i> Add food</button></div>
      </div>
      <div class="toolbar">
        <input class="input" id="menu-q" placeholder="Search dishes" value="${this.q}">
        <select class="select" id="menu-cat">
          <option>All</option>
          ${categories.map((c) => `<option ${this.cat === c.name ? "selected" : ""}>${c.name}</option>`).join("")}
        </select>
      </div>
      <div class="food-grid">
        ${items
          .map(
            (m) => `<article class="food-card">
              <img src="${m.image}" alt="${m.name}">
              <div class="body">
                <div class="actions" style="justify-content:space-between;margin-bottom:6px">
                  <span class="badge ${m.available ? "badge-available" : "badge-cancelled"}">${m.available ? "Available" : "Hidden"}</span>
                  <span style="color:var(--text-3);font-size:12px">${m.category}</span>
                </div>
                <h3>${m.name}</h3>
                <p>${m.description}</p>
                <div class="actions" style="justify-content:space-between;align-items:center">
                  <span class="price">${money(m.price)}</span>
                  <span style="color:var(--text-3);font-size:12px">${m.prep} min · stock ${m.stock}</span>
                </div>
                <div class="actions" style="margin-top:12px">
                  <button class="btn btn-ghost btn-sm" data-edit="${m.id}">Edit</button>
                  <button class="btn btn-ghost btn-sm" data-toggle="${m.id}">${m.available ? "Disable" : "Enable"}</button>
                  <button class="btn btn-danger btn-sm" data-del="${m.id}">Delete</button>
                </div>
              </div>
            </article>`
          )
          .join("") || `<div class="empty">No dishes in this filter.</div>`}
      </div>`;
  },

  bind() {
    document.getElementById("menu-q").oninput = (e) => {
      this.q = e.target.value;
      App.show("menu");
      const el = document.getElementById("menu-q");
      el.focus();
      el.setSelectionRange(this.q.length, this.q.length);
    };
    document.getElementById("menu-cat").onchange = (e) => {
      this.cat = e.target.value;
      App.show("menu");
    };
    document.getElementById("add-food").onclick = () => this.form();
    document.querySelector("[data-view-root]").onclick = async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      const tog = e.target.closest("[data-toggle]");
      if (edit) this.form(edit.dataset.edit);
      if (tog) {
        Store.patch((d) => {
          const m = d.menu.find((x) => x.id === tog.dataset.toggle);
          if (m) m.available = !m.available;
        });
        App.show("menu");
      }
      if (del) {
        const ok = await UI.confirm({ title: "Remove dish", body: "Students will no longer see this item.", danger: true });
        if (!ok) return;
        Store.patch((d) => {
          d.menu = d.menu.filter((x) => x.id !== del.dataset.del);
        });
        UI.toast("Dish removed");
        App.show("menu");
      }
    };
  },

  form(id) {
    const data = Store.get();
    const m = data.menu.find((x) => x.id === id) || {
      name: "",
      description: "",
      price: 80,
      category: data.categories[0].name,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
      prep: 12,
      available: true,
      stock: 20,
      popularity: 50,
      rating: 4.5,
    };
    UI.openModal(`
      <h2 style="margin-top:0">${id ? "Edit" : "Add"} food</h2>
      <form class="form-grid" id="food-form">
        <label>Name <input class="input" name="name" required value="${m.name}"></label>
        <label>Description <textarea class="input" name="description" required>${m.description}</textarea></label>
        <label>Price (ETB) <input class="input" type="number" min="1" name="price" required value="${m.price}"></label>
        <label>Category <select class="select" name="category">${data.categories
          .map((c) => `<option ${c.name === m.category ? "selected" : ""}>${c.name}</option>`)
          .join("")}</select></label>
        <label>Food photo from your phone or computer
          <input class="input" type="file" name="imageFile" id="food-image-file" accept="image/*">
          <small style="display:block;color:var(--text-3);margin-top:5px">Choose a photo from your gallery. JPG, PNG or WEBP recommended.</small>
        </label>
        <div style="grid-column:1/-1;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          <img id="food-image-preview" src="${m.image}" alt="Food preview" style="width:112px;height:88px;object-fit:cover;border-radius:12px;border:1px solid var(--border)">
          <label style="flex:1;min-width:180px">Or use an image URL
            <input class="input" name="image" value="${m.image}" placeholder="https://example.com/food.jpg">
          </label>
        </div>
        <label>Prep time (min) <input class="input" type="number" name="prep" min="1" value="${m.prep}"></label>
        <label>Stock <input class="input" type="number" name="stock" min="0" value="${m.stock}"></label>
        <label style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" name="available" ${m.available ? "checked" : ""}> Available</label>
        <div class="actions" style="justify-content:flex-end">
          <button type="button" class="btn btn-ghost" id="cancel">Close</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </form>`);
    document.getElementById("cancel").onclick = () => UI.closeAll();
    const imageFile = document.getElementById("food-image-file");
    const imagePreview = document.getElementById("food-image-preview");
    imageFile.onchange = () => {
      const file = imageFile.files && imageFile.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        UI.toast("Please choose an image file");
        imageFile.value = "";
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        UI.toast("Please choose an image smaller than 8 MB");
        imageFile.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { imagePreview.src = reader.result; };
      reader.readAsDataURL(file);
    };
    document.getElementById("food-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      let selectedImage = f.image.value.trim() || m.image;
      const photo = imageFile.files && imageFile.files[0];
      if (photo) {
        try {
          selectedImage = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read image"));
            reader.onload = () => {
              const img = new Image();
              img.onerror = () => reject(new Error("Invalid image"));
              img.onload = () => {
                const max = 1000;
                const scale = Math.min(1, max / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
              };
              img.src = reader.result;
            };
            reader.readAsDataURL(photo);
          });
        } catch (err) {
          UI.toast("Could not load that photo. Please try another image.");
          return;
        }
      }
      const rec = {
        ...m,
        id: id || uid("food"),
        name: f.name.value.trim(),
        description: f.description.value.trim(),
        price: Number(f.price.value),
        category: f.category.value,
        image: selectedImage,
        prep: Number(f.prep.value),
        stock: Number(f.stock.value),
        available: f.available.checked,
        popularity: m.popularity || 50,
        rating: m.rating || 4.5,
      };
      if (!rec.name || rec.price <= 0) {
        UI.toast("Name and a valid price are required");
        return;
      }
      Store.patch((d) => {
        const i = d.menu.findIndex((x) => x.id === rec.id);
        if (i >= 0) d.menu[i] = rec;
        else d.menu.unshift(rec);
        d.activity.unshift({ id: uid("a"), text: `Menu item ${rec.name} ${id ? "updated" : "added"}`, at: new Date().toISOString() });
      });
      UI.closeAll();
      UI.toast("Menu saved");
      App.show("menu");
    };
  },
};
