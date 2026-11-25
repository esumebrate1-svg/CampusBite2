const UI = {
  overlay: null,
  modal: null,
  drawer: null,

  init() {
    this.overlay = document.getElementById("overlay");
    this.modal = document.getElementById("modal");
    this.drawer = document.getElementById("drawer");
    this.overlay.addEventListener("click", () => this.closeAll());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAll();
    });
  },

  openModal(html) {
    this.modal.innerHTML = html;
    this.modal.classList.add("open");
    this.overlay.classList.add("open");
    this.drawer.classList.remove("open");
    this.icons();
    const first = this.modal.querySelector("input, select, textarea, button");
    if (first) first.focus();
  },

  openDrawer(html) {
    this.drawer.innerHTML = html;
    this.drawer.classList.add("open");
    this.overlay.classList.add("open");
    this.modal.classList.remove("open");
    this.icons();
  },

  closeAll() {
    this.modal.classList.remove("open");
    this.drawer.classList.remove("open");
    this.overlay.classList.remove("open");
  },

  toast(text) {
    const wrap = document.getElementById("toasts");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  },

  confirm({ title, body, danger }) {
    return new Promise((resolve) => {
      this.openModal(`
        <h2 style="margin:0 0 8px;font-family:var(--display)">${title}</h2>
        <p style="color:var(--text-2)">${body}</p>
        <div class="actions" style="margin-top:18px;justify-content:flex-end">
          <button class="btn btn-ghost" id="c-no">Cancel</button>
          <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="c-yes">Confirm</button>
        </div>`);
      this.modal.querySelector("#c-no").onclick = () => {
        this.closeAll();
        resolve(false);
      };
      this.modal.querySelector("#c-yes").onclick = () => {
        this.closeAll();
        resolve(true);
      };
    });
  },

  icons() {
    if (window.lucide) lucide.createIcons();
  },

  formValue(form, name) {
    const el = form.elements[name];
    if (!el) return "";
    if (el.type === "checkbox") return el.checked;
    return el.value.trim();
  },
};
