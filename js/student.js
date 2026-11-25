const Student = {
  view: "home",
  cat: "All",
  q: "",
  lastOrderId: null,
  trackId: null,

  boot() {
    seedIfNeeded();
    this.cart = Store.get().cart || [];
    applyTheme(Store.get().settings.theme);
    this.renderChrome();
    this.show("home");
    document.getElementById("cart-fab").onclick = () => this.openCart();
    document.getElementById("overlay").onclick = () => this.closeCart();
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest("[data-sview]");
      if (!a) return;
      e.preventDefault();
      this.show(a.dataset.sview);
    });
    if (window.lucide) lucide.createIcons();
  },

  renderChrome() {
    document.getElementById("cart-count").textContent = this.qty();
  },

  qty() {
    return this.cart.reduce((s, i) => s + i.qty, 0);
  },

  persistCart() {
    Store.patch((d) => {
      d.cart = this.cart;
    });
    this.renderChrome();
  },

  show(name) {
    this.view = name;
    document.querySelectorAll(".s-view").forEach((v) => v.classList.remove("active"));
    const el = document.getElementById(`view-${name}`);
    el.classList.add("active");
    document.querySelectorAll(".s-nav a").forEach((a) => a.classList.toggle("active", a.dataset.sview === name));
    if (name === "home") this.renderHome();
    if (name === "menu") this.renderMenu();
    if (name === "orders") this.renderOrders();
    if (name === "checkout") this.renderCheckout();
    if (name === "track") this.renderTrack();
    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  foods() {
    return Store.get().menu.filter((m) => m.available);
  },

  renderHome() {
    const foods = this.foods();
    const featured = foods.slice().sort((a, b) => b.popularity - a.popularity);
    const recent = foods.slice(-4).reverse();
    document.getElementById("view-home").innerHTML = `
      <section class="hero">
        <img class="bg" src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1800&q=80" alt="">
        <div class="hero-copy">
          <h1>Good food.<br>Better campus days.</h1>
          <p>Your campus favorites, ready when you are.</p>
          <div class="hero-actions">
            <div class="s-search">
              <i data-lucide="search"></i>
              <input id="hero-q" placeholder="Search firfir, shiro, macchiato…">
            </div>
            <button class="btn btn-primary" id="browse">Browse menu</button>
          </div>
        </div>
      </section>
      <section class="section">
        <h2>Today’s specials</h2>
        <p style="color:var(--text-2);margin-top:0">Kitchen picks with the shortest wait.</p>
        <div class="specials">
          ${featured
            .slice(0, 2)
            .map(
              (m) => `<article class="feature">
                <img src="${m.image}" alt="${m.name}">
                <div class="cap"><h3>${m.name}</h3><p>${m.description}</p><button class="btn btn-primary" data-add="${m.id}">Add · ${money(m.price)}</button></div>
              </article>`
            )
            .join("")}
        </div>
      </section>
      <section class="section">
        <h2>Popular right now</h2>
        <div class="menu-grid">${featured.slice(0, 6).map((m) => this.card(m)).join("")}</div>
      </section>
      <section class="section">
        <h2>Recently added</h2>
        <div class="menu-grid">${recent.map((m) => this.card(m)).join("")}</div>
      </section>`;
    document.getElementById("browse").onclick = () => this.show("menu");
    document.getElementById("hero-q").onkeydown = (e) => {
      if (e.key === "Enter") {
        this.q = e.target.value;
        this.show("menu");
      }
    };
    this.bindCards(document.getElementById("view-home"));
  },

  card(m) {
    return `<article class="meal">
      <img src="${m.image}" alt="${m.name}">
      <div class="pad">
        <h3>${m.name}</h3>
        <p>${m.description}</p>
        <div class="meal-meta">
          <strong>${money(m.price)}</strong>
          <span style="color:var(--text-3);font-size:12px">${m.rating} · ${m.prep} min</span>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:12px" data-add="${m.id}">Add to tray</button>
      </div>
    </article>`;
  },

  renderMenu() {
    const cats = ["All", ...Store.get().categories.map((c) => c.name)];
    const foods = this.foods().filter((m) => {
      const okC = this.cat === "All" || m.category === this.cat;
      const okQ = `${m.name} ${m.description}`.toLowerCase().includes(this.q.toLowerCase());
      return okC && okQ;
    });
    document.getElementById("view-menu").innerHTML = `
      <section class="section">
        <h2>The board</h2>
        <p style="color:var(--text-2)">Filter by service, then add to your tray.</p>
        <input class="input" id="menu-search" placeholder="Search food" value="${this.q}" style="max-width:360px;margin:12px 0">
        <div class="cats">${cats
          .map((c) => `<button class="chip ${c === this.cat ? "active" : ""}" data-cat="${c}">${c}</button>`)
          .join("")}</div>
        <div class="menu-grid">${foods.map((m) => this.card(m)).join("") || "<div class='empty'>Nothing matches.</div>"}</div>
      </section>`;
    document.getElementById("menu-search").oninput = (e) => {
      this.q = e.target.value;
      this.renderMenu();
      const el = document.getElementById("menu-search");
      el.focus();
      el.setSelectionRange(this.q.length, this.q.length);
    };
    document.querySelector(".cats").onclick = (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      this.cat = b.dataset.cat;
      this.renderMenu();
    };
    this.bindCards(document.getElementById("view-menu"));
  },

  bindCards(root) {
    root.querySelectorAll("[data-add]").forEach((btn) => {
      btn.onclick = () => this.add(btn.dataset.add);
    });
  },

  add(id) {
    const food = Store.get().menu.find((m) => m.id === id);
    const line = this.cart.find((c) => c.id === id);
    if (line) line.qty += 1;
    else this.cart.push({ id: food.id, name: food.name, price: food.price, image: food.image, qty: 1 });
    this.persistCart();
    this.renderCart();
    document.getElementById("cart-panel").classList.add("open");
    document.getElementById("overlay").classList.add("open");
  },

  openCart() {
    this.renderCart();
    document.getElementById("cart-panel").classList.add("open");
    document.getElementById("overlay").classList.add("open");
  },

  closeCart() {
    document.getElementById("cart-panel").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
  },

  renderCart() {
    const sub = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById("cart-body").innerHTML = this.cart.length
      ? this.cart
          .map(
            (i) => `<div class="cart-line">
              <img src="${i.image}" alt="">
              <div>
                <strong>${i.name}</strong>
                <div class="qty">
                  <button data-q="${i.id}" data-d="-1">−</button>
                  <span>${i.qty}</span>
                  <button data-q="${i.id}" data-d="1">+</button>
                </div>
              </div>
              <div>
                <div>${money(i.price * i.qty)}</div>
                <button class="btn btn-ghost btn-sm" data-rm="${i.id}" style="height:28px;margin-top:6px">Remove</button>
              </div>
            </div>`
          )
          .join("")
      : `<p class="empty">Your tray is empty.</p>`;
    document.getElementById("cart-sub").textContent = money(sub);
    document.getElementById("cart-total").textContent = money(sub);
    document.getElementById("cart-body").onclick = (e) => {
      const q = e.target.closest("[data-q]");
      const rm = e.target.closest("[data-rm]");
      if (q) {
        const line = this.cart.find((c) => c.id === q.dataset.q);
        line.qty += Number(q.dataset.d);
        if (line.qty <= 0) this.cart = this.cart.filter((c) => c.id !== line.id);
        this.persistCart();
        this.renderCart();
      }
      if (rm) {
        this.cart = this.cart.filter((c) => c.id !== rm.dataset.rm);
        this.persistCart();
        this.renderCart();
      }
    };
  },

  renderCheckout() {
    const sub = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById("view-checkout").innerHTML = `
      <section class="section checkout">
        <h2>Checkout</h2>
        <p style="color:var(--text-2)">Pickup only — pay in the app (demo) or at the counter.</p>
        ${
          this.cart.length
            ? `<form class="form-grid" id="check-form">
          <label>Name <input class="input" name="name" required placeholder="Your name"></label>
          <label>Student ID <input class="input" name="studentId" required placeholder="UGR/0000/15"></label>
          <label>Pickup location
            <select class="select" name="pickup">
              <option>Main Cafeteria</option>
              <option>Student Center</option>
              <option>Library Café</option>
              <option>Block A Food Court</option>
            </select>
          </label>
          <label>Payment
            <select class="select" name="payment">
              <option value="unpaid">Cash at pickup</option>
              <option value="paid">Simulated payment</option>
            </select>
          </label>
          <label>Special instructions <textarea class="input" name="notes" placeholder="No extra berbere, extra injera…"></textarea></label>
          <div class="order-card">${this.cart.map((i) => `<div class="low-row"><span>${i.qty}× ${i.name}</span><strong>${money(i.price * i.qty)}</strong></div>`).join("")}
            <div class="low-row"><span>Total</span><strong>${money(sub)}</strong></div>
          </div>
          <button class="btn btn-primary">Place order</button>
        </form>`
            : `<p class="empty">Add something delicious first.</p><button class="btn btn-primary" id="to-menu">Browse</button>`
        }
      </section>`;
    document.getElementById("to-menu")?.addEventListener("click", () => this.show("menu"));
    document.getElementById("check-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.place(e.target);
    });
  },

  place(form) {
    if (!this.cart.length) return;
    const name = form.name.value.trim();
    const studentId = form.studentId.value.trim();
    if (name.length < 2 || studentId.length < 3) return;
    const createdAt = new Date().toISOString();
    const items = this.cart.map((i) => ({ ...i }));
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const rec = {
      id: `CB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: uid("c"),
      customerName: name,
      studentId,
      items,
      total,
      status: "Pending",
      createdAt,
      pickup: form.pickup.value,
      payment: form.payment.value,
      notes: form.notes.value.trim(),
      history: [{ status: "Pending", at: createdAt }],
    };
    Store.patch((d) => {
      d.orders.unshift(rec);
      d.activity.unshift({ id: uid("a"), text: `New order ${rec.id} received from ${name}`, at: createdAt });
      let c = d.customers.find((x) => x.studentId === studentId);
      if (!c) {
        c = { id: rec.customerId, name, studentId, email: `${studentId.toLowerCase()}@campus.edu`, orders: 0, spent: 0, last: createdAt };
        d.customers.unshift(c);
      }
      c.orders += 1;
      c.spent += total;
      c.last = createdAt;
      rec.customerId = c.id;
      d.cart = [];
      d.notifications.unshift({ id: uid("n"), text: `New student order ${rec.id}`, at: createdAt });
    });
    this.cart = [];
    this.persistCart();
    this.lastOrderId = rec.id;
    this.trackId = rec.id;
    this.closeCart();
    this.renderSuccess(rec);
  },

  renderSuccess(o) {
    document.getElementById("view-home").classList.remove("active");
    document.getElementById("view-checkout").classList.remove("active");
    const el = document.getElementById("view-success");
    el.classList.add("active");
    el.innerHTML = `
      <section class="section checkout">
        <p style="letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-size:12px">Order placed</p>
        <h2>We’re on it.</h2>
        <p style="color:var(--text-2)">${o.id} · ${o.pickup}</p>
        <div class="order-card">
          ${o.items.map((i) => `<div class="low-row"><span>${i.qty}× ${i.name}</span><strong>${money(i.price * i.qty)}</strong></div>`).join("")}
          <div class="low-row"><span>Total</span><strong>${money(o.total)}</strong></div>
        </div>
        <button class="btn btn-primary" id="see-track">Track order</button>
      </section>`;
    document.getElementById("see-track").onclick = () => this.show("track");
  },

  myOrders() {
    return Store.get().orders.filter((o) => this.lastOrderId === o.id || true).slice(0, 12);
  },

  renderOrders() {
    const mine = Store.get()
      .orders.slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 16);
    document.getElementById("view-orders").innerHTML = `
      <section class="section">
        <h2>My orders</h2>
        <p style="color:var(--text-2)">Recent kitchen tickets on this device.</p>
        ${mine
          .map(
            (o) => `<article class="order-card">
              <div class="actions" style="justify-content:space-between">
                <strong>${o.id}</strong>
                <span class="badge ${badgeClass(o.status)}">${o.status}</span>
              </div>
              <p style="color:var(--text-2)">${o.customerName} · ${formatDate(o.createdAt)} · ${o.pickup}</p>
              <p>${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
              <div class="actions">
                <strong>${money(o.total)}</strong>
                <button class="btn btn-ghost" data-track="${o.id}">Track</button>
              </div>
            </article>`
          )
          .join("")}
      </section>`;
    document.getElementById("view-orders").onclick = (e) => {
      const t = e.target.closest("[data-track]");
      if (!t) return;
      this.trackId = t.dataset.track;
      this.show("track");
    };
  },

  renderTrack() {
    const id = this.trackId || this.lastOrderId || Store.get().orders[0]?.id;
    const o = Store.get().orders.find((x) => x.id === id);
    const steps = ["Pending", "Confirmed", "Preparing", "Ready", "Completed"];
    const labels = {
      Pending: "Order placed",
      Confirmed: "Confirmed",
      Preparing: "Preparing",
      Ready: "Ready for pickup",
      Completed: "Completed",
    };
    const idx = Math.max(0, steps.indexOf(o?.status === "Cancelled" ? "Pending" : o?.status));
    document.getElementById("view-track").innerHTML = o
      ? `<section class="section checkout">
          <h2>Tracking ${o.id}</h2>
          <p style="color:var(--text-2)">${formatDate(o.createdAt)} · Est. ${Math.max(...o.items.map((i) => Store.get().menu.find((m) => m.id === i.id)?.prep || 12))} min</p>
          ${o.status === "Cancelled" ? `<p style="color:var(--danger)">This order was cancelled.</p>` : ""}
          <div class="track">
            ${steps
              .map((s, i) => {
                const done = i <= idx && o.status !== "Cancelled";
                return `<div class="track-step ${done ? "done" : ""}">
                  <div class="n"></div>
                  <div><strong>${labels[s]}</strong></div>
                </div>${i < steps.length - 1 ? `<div class="track-step ${done && i < idx ? "done" : ""}"><div class="line"></div><div></div></div>` : ""}`;
              })
              .join("")}
          </div>
          <div class="order-card">
            ${o.items.map((i) => `<div class="low-row"><span>${i.qty}× ${i.name}</span><strong>${money(i.price * i.qty)}</strong></div>`).join("")}
            <div class="low-row"><span>Pickup</span><strong>${o.pickup}</strong></div>
            <div class="low-row"><span>Total</span><strong>${money(o.total)}</strong></div>
          </div>
        </section>`
      : `<section class="section"><p class="empty">No order to track yet.</p></section>`;
  },
};

document.addEventListener("DOMContentLoaded", () => Student.boot());
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  Student.closeCart();
  Student.show("checkout");
});
document.getElementById("clear-cart")?.addEventListener("click", () => {
  Student.cart = [];
  Student.persistCart();
  Student.renderCart();
});
