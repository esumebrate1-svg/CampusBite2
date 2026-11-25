function daysAgo(n, hour = 12, minute = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedIfNeeded() {
  const existing = Store.get();
  if (existing.menu && existing.menu.length) {
    applyTheme(existing.settings.theme);
    return existing;
  }
  const seed = buildSeed();
  Store.set(seed);
  applyTheme(seed.settings.theme);
  return seed;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
}

function buildSeed() {
  const categories = [
    { id: "cat-breakfast", name: "Breakfast", description: "Morning plates from the campus kitchen" },
    { id: "cat-lunch", name: "Lunch", description: "Hearty midday meals" },
    { id: "cat-dinner", name: "Dinner", description: "Evening service" },
    { id: "cat-snacks", name: "Snacks", description: "Between-class bites" },
    { id: "cat-drinks", name: "Drinks", description: "Juices, coffee, and tea" },
    { id: "cat-desserts", name: "Desserts", description: "Sweet finish" },
  ];

  const menu = [
    {
      id: "food-firfir",
      name: "Firfir",
      description: "Torn injera sautéed with berbere, onion, and spiced butter.",
      price: 85,
      category: "Breakfast",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
      prep: 12,
      available: true,
      stock: 48,
      popularity: 92,
      rating: 4.8,
    },
    {
      id: "food-chechebsa",
      name: "Chechebsa",
      description: "Crisped unleavened bread in kibe and berbere, honey on the side.",
      price: 70,
      category: "Breakfast",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
      prep: 10,
      available: true,
      stock: 36,
      popularity: 81,
      rating: 4.6,
    },
    {
      id: "food-genfo",
      name: "Genfo",
      description: "Warm barley porridge with a well of niter kibbeh and berbere.",
      price: 65,
      category: "Breakfast",
      image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=900&q=80",
      prep: 8,
      available: true,
      stock: 30,
      popularity: 74,
      rating: 4.5,
    },
    {
      id: "food-shiro",
      name: "Shiro",
      description: "Silky chickpea stew over injera. Campus classic.",
      price: 80,
      category: "Lunch",
      image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=900&q=80",
      prep: 15,
      available: true,
      stock: 54,
      popularity: 96,
      rating: 4.9,
    },
    {
      id: "food-tibs",
      name: "Tibs",
      description: "Seared beef with rosemary, chili, and caramelized onion.",
      price: 180,
      category: "Dinner",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
      prep: 22,
      available: true,
      stock: 28,
      popularity: 88,
      rating: 4.7,
    },
    {
      id: "food-doro",
      name: "Doro Wot",
      description: "Slow berbere chicken stew with a boiled egg.",
      price: 220,
      category: "Dinner",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
      prep: 28,
      available: true,
      stock: 22,
      popularity: 90,
      rating: 4.9,
    },
    {
      id: "food-pasta",
      name: "Campus Pasta",
      description: "Tomato-garlic spaghetti finished with herbs and cheese.",
      price: 95,
      category: "Lunch",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
      prep: 14,
      available: true,
      stock: 40,
      popularity: 77,
      rating: 4.4,
    },
    {
      id: "food-rice",
      name: "Vegetable Rice Bowl",
      description: "Steamed rice, garden vegetables, and mild sauce.",
      price: 75,
      category: "Lunch",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
      prep: 12,
      available: true,
      stock: 44,
      popularity: 69,
      rating: 4.3,
    },
    {
      id: "food-burger",
      name: "Library Burger",
      description: "Charred beef, cheddar, pickles, campus sauce.",
      price: 150,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1568901345625-1ff12b2430ea?auto=format&fit=crop&w=900&q=80",
      prep: 16,
      available: true,
      stock: 32,
      popularity: 85,
      rating: 4.6,
    },
    {
      id: "food-pizza",
      name: "Block A Pizza",
      description: "Wood-fired slice with tomato, mozzarella, and basil.",
      price: 200,
      category: "Dinner",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
      prep: 18,
      available: true,
      stock: 26,
      popularity: 83,
      rating: 4.5,
    },
    {
      id: "food-juice",
      name: "Fresh Juice",
      description: "Seasonal mango, avocado, or mixed fruit.",
      price: 50,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80",
      prep: 5,
      available: true,
      stock: 80,
      popularity: 91,
      rating: 4.7,
    },
    {
      id: "food-macchiato",
      name: "Macchiato",
      description: "Ethiopian espresso marked with steamed milk.",
      price: 40,
      category: "Drinks",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      prep: 4,
      available: true,
      stock: 120,
      popularity: 98,
      rating: 4.8,
    },
    {
      id: "food-baklava",
      name: "Honey Baklava",
      description: "Layered pastry with nuts and orange blossom honey.",
      price: 55,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=900&q=80",
      prep: 3,
      available: true,
      stock: 24,
      popularity: 71,
      rating: 4.4,
    },
    {
      id: "food-sambusa",
      name: "Sambusa",
      description: "Crisp pastry filled with lentils or spiced beef.",
      price: 35,
      category: "Snacks",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
      prep: 8,
      available: true,
      stock: 60,
      popularity: 86,
      rating: 4.6,
    },
  ];

  const customers = [
    { id: "c1", name: "Hanna Bekele", studentId: "UGR/1201/15", email: "hanna@campus.edu", orders: 14, spent: 1860, last: daysAgo(0, 11) },
    { id: "c2", name: "Yonas Tadesse", studentId: "UGR/0882/14", email: "yonas@campus.edu", orders: 9, spent: 1420, last: daysAgo(0, 13) },
    { id: "c3", name: "Marta Alemu", studentId: "UGR/2310/15", email: "marta@campus.edu", orders: 21, spent: 2740, last: daysAgo(1, 9) },
    { id: "c4", name: "Abel Girma", studentId: "UGR/0444/13", email: "abel@campus.edu", orders: 6, spent: 890, last: daysAgo(2, 18) },
    { id: "c5", name: "Selamawit Desta", studentId: "UGR/1777/15", email: "selam@campus.edu", orders: 11, spent: 1510, last: daysAgo(0, 8) },
    { id: "c6", name: "Nahom Tesfaye", studentId: "UGR/0901/14", email: "nahom@campus.edu", orders: 8, spent: 1180, last: daysAgo(3, 12) },
    { id: "c7", name: "Liya Mekonnen", studentId: "UGR/3012/16", email: "liya@campus.edu", orders: 5, spent: 640, last: daysAgo(1, 16) },
    { id: "c8", name: "Daniel Worku", studentId: "UGR/0666/13", email: "daniel@campus.edu", orders: 17, spent: 2210, last: daysAgo(0, 14) },
  ];

  const staff = [
    { id: "s1", name: "Admin Kassa", role: "Manager", status: "Active", email: "admin@campusbite.et", phone: "+251 911 000 101", photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80" },
    { id: "s2", name: "Rahel Getachew", role: "Head Chef", status: "Active", email: "rahel@campusbite.et", phone: "+251 911 000 102", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" },
    { id: "s3", name: "Biruk Hailu", role: "Line Cook", status: "Active", email: "biruk@campusbite.et", phone: "+251 911 000 103", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
    { id: "s4", name: "Sofia Mengistu", role: "Cashier", status: "Off duty", email: "sofia@campusbite.et", phone: "+251 911 000 104", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
    { id: "s5", name: "Kidus Abate", role: "Runner", status: "Active", email: "kidus@campusbite.et", phone: "+251 911 000 105", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  ];

  const tables = [
    { id: "t1", number: 1, capacity: 2, status: "Available", orderId: null },
    { id: "t2", number: 2, capacity: 4, status: "Occupied", orderId: "CB-1042" },
    { id: "t3", number: 3, capacity: 4, status: "Reserved", orderId: null },
    { id: "t4", number: 4, capacity: 6, status: "Available", orderId: null },
    { id: "t5", number: 5, capacity: 2, status: "Cleaning", orderId: null },
    { id: "t6", number: 6, capacity: 8, status: "Occupied", orderId: "CB-1045" },
    { id: "t7", number: 7, capacity: 4, status: "Available", orderId: null },
    { id: "t8", number: 8, capacity: 4, status: "Reserved", orderId: null },
  ];

  const inventory = [
    { id: "i1", name: "Teff flour", category: "Dry goods", qty: 42, unit: "kg", cost: 85, supplier: "Addis Mills", min: 15 },
    { id: "i2", name: "Berbere", category: "Spices", qty: 6, unit: "kg", cost: 220, supplier: "Merkato Spice", min: 8 },
    { id: "i3", name: "Niter kibbeh", category: "Dairy", qty: 9, unit: "kg", cost: 310, supplier: "Campus Dairy", min: 5 },
    { id: "i4", name: "Chicken", category: "Protein", qty: 18, unit: "kg", cost: 280, supplier: "Highland Farms", min: 10 },
    { id: "i5", name: "Beef", category: "Protein", qty: 12, unit: "kg", cost: 420, supplier: "Highland Farms", min: 8 },
    { id: "i6", name: "Chickpeas", category: "Dry goods", qty: 28, unit: "kg", cost: 70, supplier: "Addis Mills", min: 10 },
    { id: "i7", name: "Coffee beans", category: "Drinks", qty: 14, unit: "kg", cost: 650, supplier: "Yirgacheffe Co-op", min: 6 },
    { id: "i8", name: "Milk", category: "Dairy", qty: 22, unit: "L", cost: 55, supplier: "Campus Dairy", min: 12 },
    { id: "i9", name: "Mango", category: "Produce", qty: 3, unit: "crate", cost: 180, supplier: "Rift Valley", min: 4 },
    { id: "i10", name: "Tomato", category: "Produce", qty: 16, unit: "kg", cost: 40, supplier: "Rift Valley", min: 8 },
    { id: "i11", name: "Pasta", category: "Dry goods", qty: 0, unit: "kg", cost: 48, supplier: "Import Co.", min: 10 },
    { id: "i12", name: "Cooking oil", category: "Dry goods", qty: 19, unit: "L", cost: 95, supplier: "Import Co.", min: 8 },
  ];

  const orders = [
    order("CB-1048", customers[0], "Pending", daysAgo(0, 16, 42), [{ id: "food-shiro", qty: 1 }, { id: "food-macchiato", qty: 1 }], "Main Cafeteria", "unpaid"),
    order("CB-1047", customers[1], "Preparing", daysAgo(0, 16, 18), [{ id: "food-tibs", qty: 1 }, { id: "food-juice", qty: 1 }], "Student Center", "paid"),
    order("CB-1046", customers[4], "Confirmed", daysAgo(0, 15, 55), [{ id: "food-firfir", qty: 2 }], "Library Café", "paid"),
    order("CB-1045", customers[7], "Ready", daysAgo(0, 15, 20), [{ id: "food-burger", qty: 2 }, { id: "food-juice", qty: 2 }], "Block A Food Court", "paid"),
    order("CB-1044", customers[2], "Completed", daysAgo(0, 12, 10), [{ id: "food-doro", qty: 1 }], "Main Cafeteria", "paid"),
    order("CB-1043", customers[5], "Completed", daysAgo(1, 13, 4), [{ id: "food-pasta", qty: 1 }, { id: "food-macchiato", qty: 2 }], "Student Center", "paid"),
    order("CB-1042", customers[3], "Preparing", daysAgo(0, 14, 40), [{ id: "food-pizza", qty: 1 }], "Main Cafeteria", "paid"),
    order("CB-1041", customers[6], "Cancelled", daysAgo(1, 18, 2), [{ id: "food-rice", qty: 1 }], "Library Café", "unpaid"),
    order("CB-1040", customers[0], "Completed", daysAgo(2, 9, 15), [{ id: "food-chechebsa", qty: 1 }, { id: "food-macchiato", qty: 1 }], "Main Cafeteria", "paid"),
    order("CB-1039", customers[2], "Completed", daysAgo(3, 19, 30), [{ id: "food-sambusa", qty: 4 }, { id: "food-juice", qty: 2 }], "Block A Food Court", "paid"),
    order("CB-1038", customers[7], "Completed", daysAgo(4, 12, 0), [{ id: "food-shiro", qty: 2 }, { id: "food-genfo", qty: 1 }], "Student Center", "paid"),
    order("CB-1037", customers[1], "Completed", daysAgo(6, 11, 45), [{ id: "food-burger", qty: 1 }, { id: "food-baklava", qty: 1 }], "Library Café", "paid"),
  ];

  return {
    settings: {
      restaurantName: "CampusBite Kitchen",
      description: "University cafeteria service for students, staff, and guests.",
      openHour: "07:00",
      closeHour: "21:00",
      isOpen: true,
      currency: "ETB",
      theme: "dark",
      notifyOrders: true,
      notifyStock: true,
    },
    categories,
    menu,
    orders,
    tables,
    inventory,
    customers,
    staff,
    activity: [
      { id: "a1", text: "New order CB-1048 received from Hanna Bekele", at: daysAgo(0, 16, 42) },
      { id: "a2", text: "Order CB-1045 marked ready", at: daysAgo(0, 15, 40) },
      { id: "a3", text: "Menu item Doro Wot updated", at: daysAgo(0, 14, 5) },
      { id: "a4", text: "Low inventory: Mango", at: daysAgo(0, 13, 12) },
      { id: "a5", text: "Table 6 occupied", at: daysAgo(0, 12, 50) },
    ],
    notifications: [
      { id: "n1", text: "3 orders awaiting confirmation", at: daysAgo(0, 16, 42) },
      { id: "n2", text: "Pasta is out of stock", at: daysAgo(0, 10, 0) },
      { id: "n3", text: "Berbere is below minimum", at: daysAgo(0, 9, 20) },
    ],
    cart: [],
  };

  function order(id, customer, status, createdAt, lines, pickup, payment) {
    const items = lines.map((l) => {
      const food = menu.find((m) => m.id === l.id);
      return { id: food.id, name: food.name, price: food.price, qty: l.qty, image: food.image };
    });
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const history = [{ status: "Pending", at: createdAt }];
    if (status !== "Pending") history.push({ status, at: createdAt });
    return {
      id,
      customerId: customer.id,
      customerName: customer.name,
      studentId: customer.studentId,
      items,
      total,
      status,
      createdAt,
      pickup,
      payment,
      notes: "",
      history,
    };
  }
}

function stockStatus(item) {
  if (item.qty <= 0) return "Out of Stock";
  if (item.qty <= item.min) return "Low Stock";
  return "In Stock";
}

function badgeClass(status) {
  return "badge-" + String(status || "").toLowerCase().replace(/\s+/g, "-");
}
