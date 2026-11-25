const Store = {
  KEY: "campusbite_v2",

  blank() {
    return {
      settings: {},
      categories: [],
      menu: [],
      orders: [],
      tables: [],
      inventory: [],
      customers: [],
      staff: [],
      activity: [],
      notifications: [],
      cart: [],
    };
  },

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.blank();
      return { ...this.blank(), ...JSON.parse(raw) };
    } catch {
      return this.blank();
    }
  },

  set(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("cb:data", { detail: data }));
  },

  patch(mutator) {
    const data = this.get();
    mutator(data);
    this.set(data);
    return data;
  },

  reset(seed) {
    this.set(seed);
  },
};

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-4)}`;
}

function money(n, currency) {
  const cur = currency || Store.get().settings.currency || "ETB";
  return `${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${cur}`;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
