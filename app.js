// ===== APIs =====
const API = {
  prayerByCity: (city, country) =>
    `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=5`,
  prayerByCoords: (lat, lon) =>
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`,
};

const ADHKAR_URLS = [
  "./data/adhkar.local.json",
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/main/azkar.json",
  "https://raw.githubusercontent.com/hablullah/data-islamic/main/azkar/azkar.json"
];

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النّور","الفرقان","الشعراء","النّمل","القصص","العنكبوت","الرّوم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الإنفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
];

const RECITERS = [
  { name: "مشاري العفاسي" },
  { name: "عبد الرحمن السديس" },
  { name: "ماهر المعيقلي" }
];

const ADHKAR_FALLBACK = {
  "أذكار الصباح": [
    { zekr: "أَصْـبَحْنا وَأَصْـبَحَ المـلكُ للهِ رَبِّ العـالَمين.", repeat: 1 },
    { zekr: "اللّهـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـيْنا.", repeat: 1 },
    { zekr: "سُبْحـانَ اللهِ وَبِحَمْـدِهِ", repeat: 100 }
  ],
  "أذكار المساء": [
    { zekr: "أَمْسَيْنا وَأَمْسَى المُلْكُ للهِ رَبِّ العَالَمِينَ.", repeat: 1 },
    { zekr: "اللّهـمَّ بِكَ أَمْسَـيْنا وَبِكَ أَصْـبَحْنا.", repeat: 1 },
    { zekr: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", repeat: 3 }
  ],
  "أذكار بعد الصلاة": [
    { zekr: "أَسْتَغْفِرُ اللهَ", repeat: 3 },
    { zekr: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ.", repeat: 1 }
  ],
  "أذكار النوم": [
    { zekr: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.", repeat: 1 },
    { zekr: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", repeat: 3 }
  ]
};

const DAILY_MESSAGES = [
  "خيركم من تعلم القرآن وعلمه.",
  "ألا بذكر الله تطمئن القلوب.",
  "إن مع العسر يسرا.",
  "اللهم أعنا على ذكرك وشكرك وحسن عبادتك.",
  "من قرأ حرفاً من كتاب الله فله به حسنة.",
  "الصلاة عماد الدين."
];

// ===== DOM Elements =====
const el = {
  tabs: document.querySelectorAll(".tab"),
  navBtns: document.querySelectorAll(".nav-btn"),
  jumps: document.querySelectorAll(".nav-jump"),
  themeToggle: document.getElementById("themeToggle"),
  darkSwitch: document.getElementById("darkSwitch"),
  locateBtn: document.getElementById("locateBtn"),
  statSurahs: document.getElementById("statSurahs"),
  statAdhkar: document.getElementById("statAdhkar"),
  statFav: document.getElementById("statFav"),
  lastReadText: document.getElementById("lastReadText"),
  lastRead: document.getElementById("lastRead"),
  dailyMessage: document.getElementById("dailyMessage"),
  reciterSelect: document.getElementById("reciterSelect"),
  surahSearch: document.getElementById("surahSearch"),
  fontSize2: document.getElementById("fontSize2"),
  surahList: document.getElementById("surahList"),
  quranLoading: document.getElementById("quranLoading"),
  adhkarCategory: document.getElementById("adhkarCategory"),
  adhkarList: document.getElementById("adhkarList"),
  adhkarLoading: document.getElementById("adhkarLoading"),
  cityInput: document.getElementById("cityInput"),
  countryInput: document.getElementById("countryInput"),
  loadPrayerByCity: document.getElementById("loadPrayerByCity"),
  prayerDate: document.getElementById("prayerDate"),
  prayerList: document.getElementById("prayerList"),
  prayerLoading: document.getElementById("prayerLoading"),
  tasbeehCount: document.getElementById("tasbeehCount"),
  tasbeehTap: document.getElementById("tasbeehTap"),
  tasbeehReset: document.getElementById("tasbeehReset"),
  qiblaDirection: document.getElementById("qiblaDirection"),
  favoritesList: document.getElementById("favoritesList"),
};

// ===== State =====
function parseJsonSafe(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

const state = {
  dark: localStorage.getItem("dark") === "1",
  quranFont: Number(localStorage.getItem("quranFont") || 28),
  lastRead: parseJsonSafe("lastRead", null),
  tasbeeh: Number(localStorage.getItem("tasbeehCount") || 0),
  adhkarCount: parseJsonSafe("adhkarCount", {}),
  favorites: parseJsonSafe("favorites", []),
  followMarks: parseJsonSafe("followMarks", {}),
  currentAdhkarCategory: "",
  adhkarData: null,
  currentReciterIdx: Number(localStorage.getItem("reciterIdx") || 0),
};

function save() {
  localStorage.setItem("dark", state.dark ? "1" : "0");
  localStorage.setItem("quranFont", String(state.quranFont));
  localStorage.setItem("tasbeehCount", String(state.tasbeeh));
  localStorage.setItem("adhkarCount", JSON.stringify(state.adhkarCount));
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  localStorage.setItem("lastRead", JSON.stringify(state.lastRead));
  localStorage.setItem("followMarks", JSON.stringify(state.followMarks));
  localStorage.setItem("reciterIdx", String(state.currentReciterIdx));
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

// ===== Navigation =====
function switchTab(name) {
  el.tabs.forEach((t) => t.classList.toggle("active", t.id === name));
  el.navBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
}
el.navBtns.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
el.jumps.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.jump)));

// ===== Theme =====
function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  if (el.darkSwitch) el.darkSwitch.checked = state.dark;
  if (el.themeToggle) el.themeToggle.textContent = state.dark ? "☀️" : "🌙";
}
el.themeToggle.addEventListener("click", () => { state.dark = !state.dark; save(); applyTheme(); });
if (el.darkSwitch) el.darkSwitch.addEventListener("change", () => { state.dark = el.darkSwitch.checked; save(); applyTheme(); });

// ===== Header Stats =====
function updateHeaderStats() {
  if (el.statSurahs) el.statSurahs.textContent = "114";
  if (el.statAdhkar) el.statAdhkar.textContent = Object.values(state.adhkarCount).reduce((a, b) => a + b, 0);
  if (el.statFav) el.statFav.textContent = state.favorites.length;
  if (el.lastReadText) el.lastReadText.textContent = state.lastRead
    ? `آخر قراءة: ${state.lastRead.name} - آية ${state.lastRead.ayah || 1}`
    : "لا توجد قراءة محفوظة";
  if (el.lastRead) el.lastRead.textContent = state.lastRead ? `${state.lastRead.name} - آية ${state.lastRead.ayah || 1}` : "—";
  if (el.dailyMessage) el.dailyMessage.textContent = DAILY_MESSAGES[new Date().getDate() % DAILY_MESSAGES.length];
}

// ===== Reciters =====
function renderReciters() {
  if (!el.reciterSelect) return;
  el.reciterSelect.innerHTML = RECITERS.map((r, i) =>
    `<option value="${i}" ${i === state.currentReciterIdx ? "selected" : ""}>${r.name}</option>`
  ).join("");
}
if (el.reciterSelect) {
  el.reciterSelect.addEventListener("change", () => {
    state.currentReciterIdx = Number(el.reciterSelect.value || 0);
    save();
  });
}

// ===== Surah List =====
function renderSurahList() {
  const q = (el.surahSearch ? el.surahSearch.value.trim() : "").toLowerCase();
  const filtered = SURAHS
    .map((name, idx) => ({ number: idx + 1, name }))
    .filter((s) => !q || s.name.includes(q) || String(s.number).includes(q));

  if (el.surahList) {
    el.surahList.innerHTML = filtered.map((s) => `
      <div class="surah-card" onclick="openSurah(${s.number})">
        <div class="surah-num">${s.number}</div>
        <div class="surah-name">${s.name}</div>
        <span class="surah-open">فتح &#8594;</span>
      </div>
    `).join("");
  }
}

function openSurah(number) {
  window.location.href = `surah.html?surah=${number}&reciter=${state.currentReciterIdx}`;
}
window.openSurah = openSurah;

if (el.surahSearch) el.surahSearch.addEventListener("input", renderSurahList);

// ===== Adhkar =====
async function loadAdhkar() {
  if (el.adhkarLoading) el.adhkarLoading.textContent = "جاري تحميل الأذكار...";
  for (const url of ADHKAR_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        state.adhkarData = data;
        break;
      }
    } catch {}
  }
  if (!state.adhkarData) state.adhkarData = ADHKAR_FALLBACK;
  const keys = Object.keys(state.adhkarData);
  if (el.adhkarCategory) {
    el.adhkarCategory.innerHTML = keys.map((k) => `<option value="${k}">${k}</option>`).join("");
  }
  state.currentAdhkarCategory = keys[0] || "";
  renderAdhkarList();
  if (el.adhkarLoading) el.adhkarLoading.textContent = "";
}

function renderAdhkarList() {
  const list = state.adhkarData?.[state.currentAdhkarCategory] || [];
  if (!el.adhkarList) return;
  if (!list.length) {
    el.adhkarList.innerHTML = `<p class="muted">لا توجد أذكار في هذه الفئة.</p>`;
    return;
  }
  el.adhkarList.innerHTML = list.map((z) => `
    <div class="dhikr-card">
      <div class="dhikr-text">${escapeHtml(z.zekr || z.text || "")}</div>
      <div class="dhikr-meta">التكرار: ${z.repeat || 1}</div>
    </div>
  `).join("");
}

if (el.adhkarCategory) {
  el.adhkarCategory.addEventListener("change", () => {
    state.currentAdhkarCategory = el.adhkarCategory.value;
    renderAdhkarList();
  });
}

// ===== Prayer Times =====
function renderPrayersData(data) {
  const t = data.timings;
  const d = data.date;
  if (el.prayerDate) {
    el.prayerDate.textContent = `${d.hijri.weekday.ar} - ${d.hijri.day} ${d.hijri.month.ar} ${d.hijri.year} هـ`;
  }
  const rows = [
    ["الفجر", t.Fajr, "🌅"],
    ["الشروق", t.Sunrise, "☀️"],
    ["الظهر", t.Dhuhr, "🌤️"],
    ["العصر", t.Asr, "🌇"],
    ["المغرب", t.Maghrib, "🌆"],
    ["العشاء", t.Isha, "🌙"]
  ];
  if (el.prayerList) {
    el.prayerList.innerHTML = rows.map(([n, v, icon]) => `
      <div class="prayer-item">
        <span class="prayer-name">${icon} ${n}</span>
        <span class="prayer-time">${v}</span>
      </div>
    `).join("");
  }
}

async function loadPrayerByCity() {
  const city = el.cityInput ? el.cityInput.value.trim() || "Amman" : "Amman";
  const country = el.countryInput ? el.countryInput.value.trim() || "Jordan" : "Jordan";
  if (el.prayerLoading) el.prayerLoading.textContent = "جاري تحميل مواقيت الصلاة...";
  try {
    const res = await fetch(API.prayerByCity(city, country));
    const json = await res.json();
    renderPrayersData(json.data);
    if (el.prayerLoading) el.prayerLoading.textContent = "";
  } catch {
    if (el.prayerLoading) el.prayerLoading.textContent = "تعذر تحميل المواقيت. حاول مرة أخرى.";
  }
}

if (el.loadPrayerByCity) el.loadPrayerByCity.addEventListener("click", loadPrayerByCity);

// ===== Qibla =====
function calcQibla(lat, lon) {
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLon = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLon = lon * (Math.PI / 180);
  const y = Math.sin(kaabaLon - userLon);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(kaabaLon - userLon);
  let brng = Math.atan2(y, x) * (180 / Math.PI);
  return ((brng + 360) % 360).toFixed(1);
}

if (el.locateBtn) {
  el.locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      if (el.prayerLoading) el.prayerLoading.textContent = "المتصفح لا يدعم تحديد الموقع.";
      return;
    }
    if (el.prayerLoading) el.prayerLoading.textContent = "جاري تحديد موقعك...";
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (el.qiblaDirection) {
          el.qiblaDirection.textContent = `اتجاه القبلة من موقعك: ${calcQibla(lat, lon)}°`;
        }
        try {
          const res = await fetch(API.prayerByCoords(lat, lon));
          const json = await res.json();
          renderPrayersData(json.data);
          if (el.prayerLoading) el.prayerLoading.textContent = "";
        } catch {
          if (el.prayerLoading) el.prayerLoading.textContent = "تعذر تحميل مواقيت الموقع الحالي.";
        }
      },
      () => {
        if (el.prayerLoading) el.prayerLoading.textContent = "تعذر الوصول للموقع. فعّل صلاحية GPS.";
      }
    );
  });
}

// ===== Tasbeeh =====
if (el.tasbeehCount) el.tasbeehCount.textContent = state.tasbeeh;
if (el.tasbeehTap) {
  el.tasbeehTap.addEventListener("click", () => {
    state.tasbeeh += 1;
    if (el.tasbeehCount) el.tasbeehCount.textContent = state.tasbeeh;
    save();
  });
}
if (el.tasbeehReset) {
  el.tasbeehReset.addEventListener("click", () => {
    state.tasbeeh = 0;
    if (el.tasbeehCount) el.tasbeehCount.textContent = "0";
    save();
  });
}

// ===== Favorites =====
function renderFavorites() {
  if (!el.favoritesList) return;
  if (!state.favorites.length) {
    el.favoritesList.innerHTML = `<div class="fav-empty">⭐ لا توجد مفضلة بعد. أضف آيات أو أذكار من صفحاتها.</div>`;
    return;
  }
  el.favoritesList.innerHTML = state.favorites.map((f) => `
    <div class="item">
      <div>${escapeHtml(f.text || f.name || "")}</div>
      <span class="meta">${f.type || ""}</span>
    </div>
  `).join("");
}

// ===== Font Size =====
if (el.fontSize2) {
  el.fontSize2.value = String(state.quranFont);
  el.fontSize2.addEventListener("input", () => {
    state.quranFont = Number(el.fontSize2.value);
    save();
  });
}

// ===== Boot =====
async function boot() {
  applyTheme();
  renderReciters();
  renderSurahList();
  updateHeaderStats();
  renderFavorites();
  await Promise.all([loadAdhkar(), loadPrayerByCity()]);
}
boot();
