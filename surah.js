// Quran Reader - continuous full-surah audio + ayah-by-ayah synced text

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء",
  "الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان",
  "السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى",
  "الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور",
  "النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة",
  "المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل",
  "المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار",
  "المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل",
  "الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر",
  "العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص",
  "الفلق","الناس"
];

// Continuous full-surah MP3 servers — mushafId is specific to each reciter's exact recording on mp3quran.net
const RECITERS = [
  { name: "مشاري العفاسي",       audioBase: "https://server8.mp3quran.net/afs/",     mushafId: 123 },
  { name: "عبد الرحمن السديس",   audioBase: "https://server11.mp3quran.net/sds/",    mushafId: 54  },
  { name: "ماهر المعيقلي",       audioBase: "https://server12.mp3quran.net/maher/",  mushafId: 102 },
  { name: "ياسر الدوسري",        audioBase: "https://server11.mp3quran.net/yasser/", mushafId: 92  },
  { name: "سعد الغامدي",         audioBase: "https://server7.mp3quran.net/s_gmd/",   mushafId: 30  },
  { name: "ناصر القطامي",        audioBase: "https://server6.mp3quran.net/qtm/",     mushafId: 86  },
  { name: "سعود الشريم",         audioBase: "https://server7.mp3quran.net/shur/",    mushafId: 31  },
  { name: "علي الحذيفي",         audioBase: "https://server9.mp3quran.net/hthfi/",   mushafId: 74  }
];

const params = new URLSearchParams(location.search);
let surahNumber = Math.max(1, Math.min(114, Number(params.get("surah") || 1)));
const initReciter = Number(params.get("reciter") ?? localStorage.getItem("reciterIdx") ?? 0);
const initAyah = Math.max(1, Number(params.get("ayah") || 1));

const state = {
  ayahs: [],
  currentIdx: 0,
  reciterIdx: Math.min(Math.max(0, initReciter), RECITERS.length - 1),
  playing: false,
  dark: localStorage.getItem("dark") !== "0",
  fullTextVisible: false,
  lastSyncedIdx: -1,
  ayahSegmentsSec: [],
  playbackRate: Number(localStorage.getItem("readerPlaybackRate") || 1),
  readerFontSize: Number(localStorage.getItem("readerFontSize") || 30)
};

const el = {
  readerSurahTitle: document.getElementById("readerSurahTitle"),
  readerReciterName: document.getElementById("readerReciterName"),
  readerTitleFull: document.getElementById("readerTitleFull"),
  readerReciterSelect: document.getElementById("readerReciterSelect"),
  readerPlayPause: document.getElementById("readerPlayPause"),
  readerAudio: document.getElementById("readerAudio"),
  audioPlayBtn: document.getElementById("audioPlayBtn"),
  audioProgress: document.getElementById("audioProgress"),
  audioCurrentTime: document.getElementById("audioCurrentTime"),
  audioDuration: document.getElementById("audioDuration"),
  audioLabel: document.getElementById("audioLabel"),
  readerLiveAyah: document.getElementById("readerLiveAyah"),
  readerCurrentAyah: document.getElementById("readerCurrentAyah"),
  readerSurahNameBadge: document.getElementById("readerSurahNameBadge"),
  singleAyahText: document.getElementById("singleAyahText"),
  singleAyahNum: document.getElementById("singleAyahNum"),
  fullTextCard: document.getElementById("fullTextCard"),
  readerFullText: document.getElementById("readerFullText"),
  toggleFullText: document.getElementById("toggleFullText"),
  readerThemeToggle: document.getElementById("readerThemeToggle"),
  readerPrevAyah: document.getElementById("readerPrevAyah"),
  readerNextAyah: document.getElementById("readerNextAyah"),
  openSurahTafsirBtn: document.getElementById("openSurahTafsirBtn"),
  ayahActionWrap: document.getElementById("ayahActionWrap"),
  showAyahTafsirBtn: document.getElementById("showAyahTafsirBtn"),
  tafsirModal: document.getElementById("tafsirModal"),
  tafsirModalTitle: document.getElementById("tafsirModalTitle"),
  tafsirModalBody: document.getElementById("tafsirModalBody"),
  tafsirModalCloseBtn: document.getElementById("tafsirModalCloseBtn"),
  readerMarkFollow: document.getElementById("readerMarkFollow"),
  readerPrevSurah: document.getElementById("readerPrevSurah"),
  readerNextSurah: document.getElementById("readerNextSurah"),
  readerFontSize: document.getElementById("readerFontSize"),
  fontSizeVal: document.getElementById("fontSizeVal"),
  singleAyahCard: document.getElementById("singleAyahCard"),
  toggleFullText2: document.getElementById("toggleFullText2")
};

const tafsirCache = {
  byAyah: new Map(),
  bySurah: new Map()
};

function pad3(n) { return String(n).padStart(3, "0"); }

function continuousAudioUrl() {
  return RECITERS[state.reciterIdx].audioBase + pad3(surahNumber) + ".mp3";
}

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + s.toString().padStart(2, "0");
}

const COLOR_THEMES_READER = {
  green:  { p:"#0d7a58", d:"#095e43", l:"#e6f4ef", g:"rgba(13,122,88,.18)" },
  blue:   { p:"#0077b6", d:"#005f8e", l:"#e0f2fe", g:"rgba(0,119,182,.18)" },
  maroon: { p:"#7b2d3e", d:"#5c1e2c", l:"#fce8ec", g:"rgba(123,45,62,.18)" },
  purple: { p:"#6b3fa0", d:"#4e2d7a", l:"#f0e8ff", g:"rgba(107,63,160,.18)" },
  teal:   { p:"#2d6a4f", d:"#1b4332", l:"#d8f3dc", g:"rgba(45,106,79,.18)" },
  gold:   { p:"#b8860b", d:"#8b6508", l:"#fdf6e3", g:"rgba(184,134,11,.18)" },
};

function applyColorThemeReader() {
  const theme = localStorage.getItem("colorTheme") || "green";
  const t = COLOR_THEMES_READER[theme] || COLOR_THEMES_READER.green;
  const r = document.documentElement;
  r.style.setProperty("--primary", t.p);
  r.style.setProperty("--primary-dark", t.d);
  r.style.setProperty("--primary-light", t.l);
  r.style.setProperty("--primary-glow", t.g);
}

function applyTextColorReader() {
  const color = localStorage.getItem("textColor") || "";
  if (color) {
    document.documentElement.style.setProperty("--quran-text-color", color);
  } else {
    document.documentElement.style.removeProperty("--quran-text-color");
  }
}

function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  if (el.readerThemeToggle) el.readerThemeToggle.textContent = state.dark ? "☀️" : "🌙";
  applyColorThemeReader();
  applyTextColorReader();
}
if (el.readerThemeToggle) {
  el.readerThemeToggle.addEventListener("click", () => {
    state.dark = !state.dark;
    localStorage.setItem("dark", state.dark ? "1" : "0");
    applyTheme();
  });
}

function renderReciters() {
  if (!el.readerReciterSelect) return;
  el.readerReciterSelect.innerHTML = RECITERS.map((r, i) =>
    `<option value="${i}" ${i === state.reciterIdx ? "selected" : ""}>${r.name}</option>`
  ).join("");
}

function renderHeader() {
  const name = SURAHS[surahNumber - 1] || ("سورة " + surahNumber);
  if (el.readerSurahTitle) el.readerSurahTitle.textContent = "سورة " + name + " - im muslim";
  if (el.readerTitleFull) el.readerTitleFull.textContent = "سورة " + name + " (تشغيل متصل)";
  if (el.readerSurahNameBadge) el.readerSurahNameBadge.textContent = name;
  if (el.readerReciterName) el.readerReciterName.textContent = "القارئ: " + RECITERS[state.reciterIdx].name;
}

// fullTextVisible=false => focus box shown, fullTextVisible=true => full text shown
function applyFullTextToggle() {
  if (el.fullTextCard) el.fullTextCard.style.display = state.fullTextVisible ? "block" : "none";
  if (el.singleAyahCard) el.singleAyahCard.style.display = state.fullTextVisible ? "none" : "block";
  if (el.toggleFullText) {
    el.toggleFullText.textContent = state.fullTextVisible ? "🎯 عرض مصغر" : "📖 عرض كامل";
  }
}

function renderFullText() {
  if (!el.readerFullText) return;
  el.readerFullText.innerHTML = state.ayahs.map((a, idx) =>
    `<span class="ayah-span" id="span-${idx}" onclick="jumpToAyah(${idx})">
      ${a.text} <span class="ayah-num-badge">﴿${a.numberInSurah}﴾</span>
    </span>`
  ).join("");
}

window.jumpToAyah = (idx) => {
  setActiveAyah(idx);
  seekAudioToAyah(idx);

  if (!el.showAyahTafsirBtn) return;
  const span = document.getElementById("span-" + idx);
  if (!span) return;

  const prevHolder = document.getElementById("inlineAyahTafsirHolder");
  if (prevHolder) prevHolder.remove();

  const holder = document.createElement("div");
  holder.id = "inlineAyahTafsirHolder";
  holder.className = "inline-ayah-tafsir-holder";

  const btn = el.showAyahTafsirBtn;
  btn.style.display = "inline-flex";
  holder.appendChild(btn);

  span.insertAdjacentElement("afterend", holder);
};

function setActiveAyah(idx) {
  if (!state.ayahs.length) return;
  const safeIdx = Math.max(0, Math.min(state.ayahs.length - 1, idx));
  state.currentIdx = safeIdx;
  const ayah = state.ayahs[safeIdx];
  if (!ayah) return;

  if (el.audioLabel) el.audioLabel.textContent = `${SURAHS[surahNumber - 1]} - آية ${ayah.numberInSurah}`;
  if (el.singleAyahText) el.singleAyahText.textContent = ayah.text || "";
  if (el.singleAyahNum) el.singleAyahNum.textContent = `آية ${ayah.numberInSurah}`;

  document.querySelectorAll(".ayah-span").forEach((span) => span.classList.remove("active-span"));
  const activeSpan = document.getElementById("span-" + safeIdx);
  if (activeSpan) {
    activeSpan.classList.add("active-span");
    if (state.playing || !state.fullTextVisible) {
      activeSpan.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function updatePlayBtns(playing) {
  state.playing = playing;
  if (el.readerPlayPause) el.readerPlayPause.innerHTML = playing ? "⏸ إيقاف" : "▶ تشغيل";
  if (el.audioPlayBtn) el.audioPlayBtn.innerHTML = playing ? "⏸" : "▶";
}

async function loadSurahText() {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
  const data = await res.json();
  state.ayahs = data?.data?.ayahs || [];
  state.lastSyncedIdx = -1;
  renderFullText();
  // Start from initAyah if provided, else ayah 1
  const startIdx = Math.max(0, Math.min(state.ayahs.length - 1, initAyah - 1));
  state.currentIdx = startIdx;
  setActiveAyah(startIdx);
  if (el.singleAyahText) el.singleAyahText.textContent = state.ayahs[startIdx]?.text || "";
  if (el.singleAyahNum) el.singleAyahNum.textContent = `آية ${initAyah}`;
}

async function loadAyahTimingSegments() {
  state.ayahSegmentsSec = [];
  const mushafId = RECITERS[state.reciterIdx]?.mushafId;
  if (!mushafId) return;
  try {
    // mp3quran.net timing API — mushafId is tied to the reciter's exact recording, no offset needed
    const url = `https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${mushafId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("No timing data");

    // data = [{ayah, start_time, end_time}] in milliseconds, ordered by ayah number
    const seg = state.ayahs.map((ayah, i) => {
      // Match by ayah number; handle 0-indexed API responses (e.g. Surah 1)
      const entry = data.find(d => d.ayah === ayah.numberInSurah)
                 || data.find(d => d.ayah + 1 === ayah.numberInSurah)
                 || data[i];
      return {
        idx: i,
        startMs: Number(entry?.start_time ?? 0),
        endMs:   Number(entry?.end_time   ?? 0)
      };
    }).filter(s => s.endMs > 0);

    state.ayahSegmentsSec = seg;
  } catch (e) {
    state.ayahSegmentsSec = [];
  }
}

function getAyahIndexByTime(t) {
  if (!state.ayahSegmentsSec.length) return 0;
  if (t <= 0) return 0;
  const timeMs = t * 1000;
  for (let i = 0; i < state.ayahSegmentsSec.length; i++) {
    const s = state.ayahSegmentsSec[i];
    if (timeMs >= s.startMs && timeMs < s.endMs) return Math.min(i, state.ayahs.length - 1);
  }
  // If time is before first segment starts, return 0
  if (state.ayahSegmentsSec.length > 0 && timeMs < state.ayahSegmentsSec[0].startMs) return 0;
  return Math.max(0, state.ayahSegmentsSec.length - 1);
}

function seekAudioToAyah(idx) {
  if (!el.readerAudio || !state.ayahSegmentsSec.length) return;
  const s = state.ayahSegmentsSec[Math.max(0, Math.min(state.ayahSegmentsSec.length - 1, idx))];
  if (!s) return;
  el.readerAudio.currentTime = Math.max(0, s.startMs / 1000 + 0.01);
}

function loadContinuousAudio(autoplay = false) {
  if (!el.readerAudio) return;
  el.readerAudio.src = continuousAudioUrl();
  el.readerAudio.playbackRate = state.playbackRate;
  el.readerAudio.load();
  if (autoplay) {
    el.readerAudio.play().catch(() => {});
    updatePlayBtns(true);
  } else {
    updatePlayBtns(false);
  }
}

if (el.readerAudio) {
  el.readerAudio.addEventListener("loadedmetadata", () => {
    if (el.audioDuration) el.audioDuration.textContent = formatTime(el.readerAudio.duration);
  });

  el.readerAudio.addEventListener("timeupdate", () => {
    if (el.readerAudio.duration && isFinite(el.readerAudio.duration)) {
      const pct = (el.readerAudio.currentTime / el.readerAudio.duration) * 100;
      if (el.audioProgress) el.audioProgress.value = pct;
      if (el.audioCurrentTime) el.audioCurrentTime.textContent = formatTime(el.readerAudio.currentTime);
    }
    // Only sync ayah by time if audio is actually playing (currentTime > 0)
    if (el.readerAudio.currentTime > 0.1 && state.ayahSegmentsSec.length > 0) {
      const idx = getAyahIndexByTime(el.readerAudio.currentTime);
      if (idx !== state.lastSyncedIdx) {
        state.lastSyncedIdx = idx;
        setActiveAyah(idx);
      }
    }
  });

  el.readerAudio.addEventListener("play", () => updatePlayBtns(true));
  el.readerAudio.addEventListener("pause", () => updatePlayBtns(false));

  el.readerAudio.addEventListener("ended", () => {
    if (state.playing) {
      el.readerAudio.currentTime = 0;
      el.readerAudio.play().catch(() => {});
      setActiveAyah(0);
    } else {
      setActiveAyah(0);
      if (el.audioProgress) el.audioProgress.value = 0;
    }
  });
}

if (el.audioProgress) {
  el.audioProgress.addEventListener("input", () => {
    if (el.readerAudio && el.readerAudio.duration) {
      el.readerAudio.currentTime = (el.audioProgress.value / 100) * el.readerAudio.duration;
    }
  });
}

function togglePlay() {
  if (!el.readerAudio) return;
  if (!el.readerAudio.paused) {
    el.readerAudio.pause();
  } else {
    if (!el.readerAudio.src) {
      loadContinuousAudio(true);
    } else {
      el.readerAudio.play().catch(() => {});
      updatePlayBtns(true);
    }
  }
}
if (el.readerPlayPause) el.readerPlayPause.addEventListener("click", togglePlay);
if (el.audioPlayBtn) el.audioPlayBtn.addEventListener("click", togglePlay);

if (el.readerReciterSelect) {
  el.readerReciterSelect.addEventListener("change", () => {
    const newReciterIdx = Number(el.readerReciterSelect.value);
    localStorage.setItem("reciterIdx", String(newReciterIdx));
    // Reload page with new reciter, always starting from ayah 1
    location.href = `surah.html?surah=${surahNumber}&reciter=${newReciterIdx}`;
  });
}

if (el.readerPrevAyah) {
  el.readerPrevAyah.addEventListener("click", () => {
    const idx = Math.max(0, state.currentIdx - 1);
    setActiveAyah(idx);
    seekAudioToAyah(idx);
  });
}
if (el.readerNextAyah) {
  el.readerNextAyah.addEventListener("click", () => {
    const idx = Math.min(state.ayahs.length - 1, state.currentIdx + 1);
    setActiveAyah(idx);
    seekAudioToAyah(idx);
  });
}
if (el.readerPrevSurah) {
  el.readerPrevSurah.addEventListener("click", () => {
    const prev = Math.max(1, surahNumber - 1);
    location.href = `surah.html?surah=${prev}&reciter=${state.reciterIdx}`;
  });
}
if (el.readerNextSurah) {
  el.readerNextSurah.addEventListener("click", () => {
    const next = Math.min(114, surahNumber + 1);
    location.href = `surah.html?surah=${next}&reciter=${state.reciterIdx}`;
  });
}
// Font size slider
function applyFontSize(size) {
  document.documentElement.style.setProperty("--reader-font-size", `${size}px`);
  if (el.fontSizeVal) el.fontSizeVal.textContent = size;
}
if (el.readerFontSize) {
  el.readerFontSize.value = String(state.readerFontSize);
  applyFontSize(state.readerFontSize);
  el.readerFontSize.addEventListener("input", () => {
    state.readerFontSize = Number(el.readerFontSize.value || 30);
    localStorage.setItem("readerFontSize", String(state.readerFontSize));
    applyFontSize(state.readerFontSize);
  });
}

// Toggle view buttons (both toggleFullText and toggleFullText2)
function handleToggleView() {
  state.fullTextVisible = !state.fullTextVisible;
  applyFullTextToggle();
  setActiveAyah(state.currentIdx);
}
if (el.toggleFullText) el.toggleFullText.addEventListener("click", handleToggleView);
if (el.toggleFullText2) el.toggleFullText2.addEventListener("click", handleToggleView);

if (el.readerMarkFollow) {
  el.readerMarkFollow.addEventListener("click", () => {
    const ayah = state.ayahs[state.currentIdx];
    const surahName = SURAHS[surahNumber - 1] || `سورة ${surahNumber}`;
    const ayahNum = ayah?.numberInSurah || 1;

    // Save as last read (for continue reading)
    localStorage.setItem("lastRead", JSON.stringify({
      number: surahNumber,
      name: surahName,
      ayah: ayahNum,
      reciterIdx: state.reciterIdx
    }));

    // Add to favorites (surah type)
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = favs.find(f => f.type === "surah" && f.number === surahNumber);
    if (!exists) {
      favs.unshift({
        type: "surah",
        number: surahNumber,
        name: surahName,
        ayah: ayahNum,
        reciterIdx: state.reciterIdx,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("favorites", JSON.stringify(favs));
    }

    const old = el.readerMarkFollow.innerHTML;
    el.readerMarkFollow.innerHTML = "✅ أُضيفت للمفضلة";
    setTimeout(() => { el.readerMarkFollow.innerHTML = old; }, 1600);
  });
}

async function fetchAyahTafsir(ayahNumberInSurah) {
  const key = `${surahNumber}:${ayahNumberInSurah}`;
  if (tafsirCache.byAyah.has(key)) return tafsirCache.byAyah.get(key);

  const candidates = [
    `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-muyassar/${surahNumber}/${ayahNumberInSurah}.json`,
    `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafseer-al-qurtubi/${surahNumber}/${ayahNumberInSurah}.json`,
    `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-al-baghawi/${surahNumber}/${ayahNumberInSurah}.json`
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      const text = json?.text || json?.tafsir || json?.data?.text || "";
      if (text && String(text).trim().length > 0) {
        tafsirCache.byAyah.set(key, text);
        return text;
      }
    } catch (_) {}
  }

  const fallback = "تعذر تحميل التفسير لهذه الآية حالياً.";
  tafsirCache.byAyah.set(key, fallback);
  return fallback;
}

function openTafsirModal(title, html) {
  if (!el.tafsirModal || !el.tafsirModalTitle || !el.tafsirModalBody) return;
  el.tafsirModalTitle.textContent = title;
  el.tafsirModalBody.innerHTML = html;
  el.tafsirModal.style.display = "flex";
}

function closeTafsirModal() {
  if (el.tafsirModal) el.tafsirModal.style.display = "none";
}

async function showAyahTafsir(idx) {
  if (!state.ayahs[idx]) return;
  const ayah = state.ayahs[idx];
  openTafsirModal(`تفسير الآية ${ayah.numberInSurah}`, "جاري تحميل التفسير...");
  const tafsir = await fetchAyahTafsir(ayah.numberInSurah);
  openTafsirModal(`تفسير الآية ${ayah.numberInSurah}`, `
    <div class="tafsir-item">
      <div class="tafsir-ayah">${ayah.text}</div>
      <div class="tafsir-text">${tafsir}</div>
    </div>
  `);
}

async function fetchSurahTafsir() {
  const key = String(surahNumber);
  if (tafsirCache.bySurah.has(key)) return tafsirCache.bySurah.get(key);

  const rows = [];
  for (let i = 0; i < state.ayahs.length; i++) {
    const ayah = state.ayahs[i];
    const tafsir = await fetchAyahTafsir(ayah.numberInSurah);
    rows.push({
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text,
      tafsirText: tafsir
    });
  }
  tafsirCache.bySurah.set(key, rows);
  return rows;
}

async function showSurahTafsir() {
  const name = SURAHS[surahNumber - 1] || `سورة ${surahNumber}`;
  openTafsirModal(`تفسير سورة ${name}`, "جاري تحميل تفسير السورة كاملة...");
  const rows = await fetchSurahTafsir();
  openTafsirModal(`تفسير سورة ${name}`, rows.map((r) => `
    <div class="tafsir-item">
      <div class="tafsir-ayah">﴿${r.ayahNumber}﴾ ${r.ayahText}</div>
      <div class="tafsir-text">${r.tafsirText}</div>
    </div>
  `).join(""));
}

// Focus mode tafsir buttons
const showAyahTafsirFocusBtn = document.getElementById("showAyahTafsirFocusBtn");
const openSurahTafsirFocusBtn = document.getElementById("openSurahTafsirFocusBtn");
if (showAyahTafsirFocusBtn) {
  showAyahTafsirFocusBtn.addEventListener("click", () => showAyahTafsir(state.currentIdx));
}
if (openSurahTafsirFocusBtn) {
  openSurahTafsirFocusBtn.addEventListener("click", showSurahTafsir);
}
if (el.showAyahTafsirBtn) {
  el.showAyahTafsirBtn.addEventListener("click", () => showAyahTafsir(state.currentIdx));
}
if (el.openSurahTafsirBtn) {
  el.openSurahTafsirBtn.addEventListener("click", showSurahTafsir);
}
if (el.tafsirModalCloseBtn) {
  el.tafsirModalCloseBtn.addEventListener("click", closeTafsirModal);
}
if (el.tafsirModal) {
  el.tafsirModal.addEventListener("click", (e) => {
    if (e.target === el.tafsirModal) closeTafsirModal();
  });
}

async function boot() {
  applyTheme();
  renderReciters();
  renderHeader();
  applyFullTextToggle();

  await loadSurahText();
  await loadAyahTimingSegments();
  loadContinuousAudio(false);
}

boot();
