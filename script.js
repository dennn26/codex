const initialProducts = [
  { name: "iPhone 11", price: 6499000, stock: 7 },
  { name: "iPhone 12", price: 7499000, stock: 6 },
  { name: "iPhone 13", price: 9199000, stock: 5 },
  { name: "iPhone 14", price: 10999000, stock: 4 },
  { name: "iPhone 15", price: 12999000, stock: 4 },
  { name: "iPhone 16", price: 14999000, stock: 3 },
  { name: "iPhone 17 Pro Max", price: 21999000, stock: 2 },
];

const STORAGE_KEY = "neoapplehub-stock-v1";
let currentFilter = "all";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const productGrid = document.querySelector("#productGrid");
const priceTicker = document.querySelector("#priceTicker");
const seriesSelect = document.querySelector("#series");
const ownerSeriesSelect = document.querySelector("#ownerSeries");
const totalStockCount = document.querySelector("#totalStockCount");
const readyModelsCount = document.querySelector("#readyModelsCount");
const stockFilter = document.querySelector("#stockFilter");

const stockForm = document.querySelector("#stockForm");
const stockAction = document.querySelector("#stockAction");
const stockQty = document.querySelector("#stockQty");
const stockMessage = document.querySelector("#stockMessage");

const tradeinForm = document.querySelector("#tradeinForm");
const estimateResult = document.querySelector("#estimateResult");

const savedProducts = localStorage.getItem(STORAGE_KEY);
const products = savedProducts ? JSON.parse(savedProducts) : initialProducts;

const saveProducts = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

const getStockLabel = (stock) => {
  if (stock <= 0) return "Habis";
  if (stock <= 2) return "Menipis";
  return "Ready";
};

const getBadgeClass = (stock) => {
  if (stock <= 0) return "danger";
  if (stock <= 2) return "warning";
  return "success";
};

const filterProducts = (list) => {
  if (currentFilter === "ready") return list.filter((product) => product.stock > 2);
  if (currentFilter === "low") return list.filter((product) => product.stock > 0 && product.stock <= 2);
  if (currentFilter === "empty") return list.filter((product) => product.stock <= 0);
  return list;
};

const renderSelectOptions = () => {
  const options = products.map((product) => `<option value="${product.name}">${product.name}</option>`).join("");
  seriesSelect.innerHTML = options;
  ownerSeriesSelect.innerHTML = options;
};

const renderProducts = () => {
  const filtered = filterProducts(products);

  if (filtered.length === 0) {
    productGrid.innerHTML = `<article class="product-card"><h3>Tidak ada data</h3><p>Belum ada produk di filter ini.</p></article>`;
    return;
  }

  productGrid.innerHTML = filtered
    .map((product) => {
      const disabledAttr = product.stock <= 0 ? "disabled" : "";
      const fillPercent = Math.min(100, (product.stock / 10) * 100);
      return `<article class="product-card">
      <div class="card-head">
        <h3>${product.name}</h3>
        <span class="stock-badge ${getBadgeClass(product.stock)}">${getStockLabel(product.stock)}</span>
      </div>
      <p>Garansi toko + quality check 32 titik.</p>
      <div class="price">${formatIDR(product.price)}</div>
      <div class="stock-row">Sisa stok: <strong>${product.stock} unit</strong></div>
      <div class="stock-bar"><span class="stock-fill" style="width:${fillPercent}%"></span></div>
      <button class="secondary-btn" ${disabledAttr}>${product.stock > 0 ? "Booking Unit" : "Kosong"}</button>
    </article>`;
    })
    .join("");
};

const renderPriceTicker = () => {
  priceTicker.innerHTML = products
    .map((product) => `<li>${product.name}: <strong>${formatIDR(product.price)}</strong> · ${product.stock} unit</li>`)
    .join("");
};

const renderStats = () => {
  const total = products.reduce((sum, product) => sum + product.stock, 0);
  const readyCount = products.filter((product) => product.stock > 0).length;
  totalStockCount.textContent = `${total} unit`;
  readyModelsCount.textContent = `${readyCount} model`;
};

const renderAll = () => {
  renderProducts();
  renderPriceTicker();
  renderStats();
};

stockFilter.addEventListener("click", (event) => {
  const filterButton = event.target.closest("button[data-filter]");
  if (!filterButton) return;

  currentFilter = filterButton.dataset.filter;
  stockFilter.querySelectorAll(".pill").forEach((pill) => pill.classList.remove("is-active"));
  filterButton.classList.add("is-active");
  renderProducts();
});

tradeinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const series = document.querySelector("#series").value;
  const condition = document.querySelector("#condition").value;
  const storage = Number(document.querySelector("#storage").value);
  const battery = Number(document.querySelector("#battery").value);

  const selectedProduct = products.find((product) => product.name === series);
  const base = selectedProduct ? selectedProduct.price : 0;
  const conditionFactor = { excellent: 0.82, good: 0.72, fair: 0.58 }[condition];
  const storageFactor = storage === 256 ? 1.08 : storage === 512 ? 1.14 : storage === 1024 ? 1.2 : 1;
  const batteryFactor = Math.max(0.75, Math.min(1, battery / 100));

  const estimate = Math.round(base * conditionFactor * storageFactor * batteryFactor);
  estimateResult.textContent = `Estimasi harga ${series}: ${formatIDR(estimate)} (harga final setelah QC).`;
});

stockForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const model = ownerSeriesSelect.value;
  const action = stockAction.value;
  const quantity = Number(stockQty.value);

  const targetProduct = products.find((product) => product.name === model);
  if (!targetProduct || quantity < 1) {
    stockMessage.textContent = "Input tidak valid. Cek model dan jumlah unit.";
    return;
  }

  if (action === "add") targetProduct.stock += quantity;
  if (action === "remove") targetProduct.stock = Math.max(0, targetProduct.stock - quantity);
  if (action === "set") targetProduct.stock = quantity;

  saveProducts();
  renderAll();
  stockMessage.textContent = `Stok ${model} berhasil diupdate menjadi ${targetProduct.stock} unit.`;
});

const themeToggle = document.querySelector("#themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});

renderSelectOptions();
renderAll();
