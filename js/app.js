const App = {
  view: "overview",
    checkAdminLogin() {
    const login = document.getElementById("admin-login");
    const form = document.getElementById("admin-login-form");
    const error = document.getElementById("admin-login-error");

    if (sessionStorage.getItem("campusbite_admin") === "true") {
      login.style.display = "none";
      return true;
    }

    login.style.display = "flex";

    form.onsubmit = (e) => {
      e.preventDefault();

      const email = document.getElementById("admin-email").value;
      const password = document.getElementById("admin-password").value;

      if (
        email === "admin@campusbite.local" &&
        password === "Bite@2026"
      ) {
        sessionStorage.setItem("campusbite_admin", "true");
        login.style.display = "none";
        App.boot();
      } else {
        error.textContent = "Incorrect email or password.";
      }
    };

    return false;
  },
  views: {
    overview: Dashboard,
    orders: Orders,
    menu: Menu,
    categories: Categories,
    tables: Tables,
    inventory: Inventory,
    customers: Customers,
    staff: Staff,
    analytics: Analytics,
    settings: Settings,
  },

    boot() {
    if (!this.checkAdminLogin()) return;

    seedIfNeeded();
    UI.init();
    this.refreshChrome();
    this.clock();
    setInterval(() => this.clock(), 1000);

    document.getElementById("collapse").onclick = () => {
      document.querySelector(".app").classList.toggle("sidebar-collapsed");
    };
    document.getElementById("open-side").onclick = (e) => {
      e.stopPropagation();
      const app = document.querySelector(".app");
      const isOpen = app.classList.toggle("sidebar-open");
      document.getElementById("open-side").setAttribute("aria-expanded", String(isOpen));
    };
    document.querySelector(".app").addEventListener("click", (e) => {
      const app = document.querySelector(".app");
      if (app.classList.contains("sidebar-open") && e.target === app) {
        app.classList.remove("sidebar-open");
        document.getElementById("open-side").setAttribute("aria-expanded", "false");
      }
    });
    document.querySelector(".nav").onclick = (e) => {
      const btn = e.target.closest("[data-view]");
      if (!btn) return;
      this.show(btn.dataset.view);
      document.querySelector(".app").classList.remove("sidebar-open");
    };
    document.getElementById("notify-btn").onclick = (e) => {
      e.stopPropagation();
      document.getElementById("notice-menu").classList.toggle("open");
      document.getElementById("profile-menu").classList.remove("open");
    };
    document.getElementById("profile-btn").onclick = (e) => {
      e.stopPropagation();
      document.getElementById("profile-menu").classList.toggle("open");
      document.getElementById("notice-menu").classList.remove("open");
    };
    document.body.addEventListener("click", () => {
      document.getElementById("notice-menu").classList.remove("open");
      document.getElementById("profile-menu").classList.remove("open");
    });
    document.getElementById("go-student").onclick = () => (location.href = "student.html");
    document.getElementById("admin-logout").onclick = () => {
    sessionStorage.removeItem("campusbite_admin");
     location.reload();
   };
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelector(".app").classList.remove("sidebar-open");
        document.getElementById("open-side").setAttribute("aria-expanded", "false");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search").focus();
      }
    });
    document.getElementById("global-search").onkeydown = (e) => {
      if (e.key !== "Enter") return;
      const q = e.target.value.trim();
      if (!q) return;
      Menu.q = q;
      this.show("menu");
    };

    const hash = location.hash.replace("#", "");
    this.show(this.views[hash] ? hash : "overview");
    window.addEventListener("hashchange", () => {
      const v = location.hash.replace("#", "");
      if (this.views[v]) this.show(v);
    });
  },

  show(name) {
    this.view = name;
    if (location.hash !== `#${name}`) location.hash = name;
    const root = document.querySelector("[data-view-root]");
    root.innerHTML = this.views[name].render();
    root.classList.remove("is-entering");
    void root.offsetWidth;
    root.classList.add("is-entering");
    this.views[name].bind();
    this.initMotion(root);
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    UI.icons();
    this.refreshChrome();
  },

  initMotion(root) {
    const targets = root.querySelectorAll(
      ".panel, .food-card, .table-tile, .stat-card, .metric-card, .page-head, .dash-hero, .chart-card, .feature"
    );
    targets.forEach((el) => el.classList.add("reveal"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, root: document.querySelector(".content") });
    targets.forEach((el) => observer.observe(el));
  },

  refreshChrome() {
    const data = Store.get();
    document.getElementById("brand-name").textContent = data.settings.restaurantName.split(" ")[0] || "CampusBite";
    document.getElementById("notice-list").innerHTML = data.notifications
      .map((n) => `<div class="notice-item">${n.text}<div style="color:var(--text-3)">${timeAgo(n.at)}</div></div>`)
      .join("");
    document.getElementById("notice-dot").style.display = data.notifications.length ? "block" : "none";
    const admin = data.staff[0];
    if (admin) {
      document.querySelectorAll("[data-admin-name]").forEach((el) => (el.textContent = admin.name));
      document.querySelectorAll("[data-admin-role]").forEach((el) => (el.textContent = admin.role));
      document.querySelectorAll("[data-admin-photo]").forEach((el) => (el.src = admin.photo));
    }
  },

  clock() {
    const el = document.getElementById("live-clock");
    if (!el) return;
    el.textContent = new Date().toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },
};

document.addEventListener("DOMContentLoaded", () => App.boot());
