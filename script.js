const products = [
  ["iPhone 11", 6499000],
  ["iPhone 12", 7499000],
  ["iPhone 13", 9199000],
  ["iPhone 14", 10999000],
  ["iPhone 15", 12999000],
  ["iPhone 16", 14999000],
  ["iPhone 17 Pro Max", 21999000],
];

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const productGrid = document.querySelector("#productGrid");
const priceTicker = document.querySelector("#priceTicker");
const seriesSelect = document.querySelector("#series");

products.forEach(([name, price]) => {
  productGrid.insertAdjacentHTML(
    "beforeend",
    `<article class="product-card">
      <h3>${name}</h3>
      <p>Garansi toko + quality check 32 titik.</p>
      <div class="price">${formatIDR(price)}</div>
      <button class="secondary-btn">Booking Unit</button>
    </article>`
  );

  priceTicker.insertAdjacentHTML(
    "beforeend",
    `<li>${name}: <strong>${formatIDR(price)}</strong></li>`
  );

  seriesSelect.insertAdjacentHTML(
    "beforeend",
    `<option value="${name}">${name}</option>`
  );
});

const tradeinForm = document.querySelector("#tradeinForm");
const estimateResult = document.querySelector("#estimateResult");

tradeinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const series = document.querySelector("#series").value;
  const condition = document.querySelector("#condition").value;
  const storage = Number(document.querySelector("#storage").value);
  const battery = Number(document.querySelector("#battery").value);

  const base = Object.fromEntries(products)[series] || 0;
  const conditionFactor = { excellent: 0.82, good: 0.72, fair: 0.58 }[condition];
  const storageFactor = storage === 256 ? 1.08 : storage === 512 ? 1.14 : storage === 1024 ? 1.2 : 1;
  const batteryFactor = Math.max(0.75, Math.min(1, battery / 100));

  const estimate = Math.round(base * conditionFactor * storageFactor * batteryFactor);

  estimateResult.textContent = `Estimasi harga ${series} kamu: ${formatIDR(estimate)} (final setelah QC).`;
});

const themeToggle = document.querySelector("#themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});
