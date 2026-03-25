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
  focusMode: localStorage.getItem("readerFocusMode") === "1",
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
  toggleFullText2: document.getElementById("toggleFullText2"),
  readerFocusModeBtn: document.getElementById("readerFocusModeBtn"),
  readerRestartBtn: document.getElementById("readerRestartBtn")
};

const tafsirCache = {
  byAyah: new Map(),
  bySurah: new Map()
};

function pad3(n) { return String(n).padStart(3, "0"); }

function escapeHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

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

function colorLuminanceReader(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function applyTextColorReader() {
  const color = localStorage.getItem("textColor") || "";
  const isDark = document.body.classList.contains("dark");
  if (color) {
    const lum = colorLuminanceReader(color);
    // In light mode: block very light colors → fall back to default --text
    // In dark mode: block very dark colors → fall back to default --text
    if (!isDark && lum > 0.75) {
      document.documentElement.style.removeProperty("--quran-text-color");
    } else if (isDark && lum < 0.15) {
      document.documentElement.style.removeProperty("--quran-text-color");
    } else {
      document.documentElement.style.setProperty("--quran-text-color", color);
    }
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

function applyFocusMode() {
  document.body.classList.toggle("reader-focus-mode", state.focusMode);
  if (el.readerFocusModeBtn) {
    el.readerFocusModeBtn.textContent = state.focusMode ? "🧘 إلغاء التركيز" : "🧘 وضع تركيز";
    el.readerFocusModeBtn.classList.toggle("primary", state.focusMode);
  }
  localStorage.setItem("readerFocusMode", state.focusMode ? "1" : "0");
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

  // ===== Auto-save progress =====
  // Save current position automatically so "متابعة آخر قراءة" always resumes from here
  try {
    localStorage.setItem("lastRead", JSON.stringify({
      number: surahNumber,
      name: SURAHS[surahNumber - 1] || `سورة ${surahNumber}`,
      ayah: ayah.numberInSurah,
      reciterIdx: state.reciterIdx
    }));
  } catch (_) {}
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

// ===== Restart Button =====
if (el.readerRestartBtn) {
  el.readerRestartBtn.addEventListener("click", () => {
    // Seek audio to beginning
    if (el.readerAudio) {
      el.readerAudio.currentTime = 0;
      if (state.playing) {
        el.readerAudio.play().catch(() => {});
      }
    }
    // Reset text to ayah 1
    setActiveAyah(0);
    state.lastSyncedIdx = -1;
    // Visual feedback
    const old = el.readerRestartBtn.innerHTML;
    el.readerRestartBtn.innerHTML = "✅ تمت الإعادة";
    setTimeout(() => { el.readerRestartBtn.innerHTML = old; }, 1200);
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

if (el.readerFocusModeBtn) {
  el.readerFocusModeBtn.addEventListener("click", () => {
    state.focusMode = !state.focusMode;
    applyFocusMode();
  });
}

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

// ===================================================================
// ========================= QUIZ SYSTEM =============================
// ===================================================================

const quizState = {
  type: null,          // "mem" | "tafsir"
  questions: [],
  currentQ: 0,
  score: 0,
  answered: false,
  questionCount: 5,
  wrongAnswers: []
};

const quizEl = {
  modal:          document.getElementById("quizModal"),
  selectScreen:   document.getElementById("quizSelectScreen"),
  loadingScreen:  document.getElementById("quizLoadingScreen"),
  questionScreen: document.getElementById("quizQuestionScreen"),
  resultsScreen:  document.getElementById("quizResultsScreen"),
  surahName:      document.getElementById("quizSurahName"),
  progressFill:   document.getElementById("quizProgressFill"),
  questionNum:    document.getElementById("quizQuestionNum"),
  scoreDisplay:   document.getElementById("quizScoreDisplay"),
  questionType:   document.getElementById("quizQuestionType"),
  questionText:   document.getElementById("quizQuestionText"),
  choices:        document.getElementById("quizChoices"),
  nextWrap:       document.getElementById("quizNextWrap"),
  nextBtn:        document.getElementById("quizNextBtn"),
  resultStars:    document.getElementById("quizResultsStars"),
  resultScore:    document.getElementById("quizResultsScore"),
  resultPct:      document.getElementById("quizResultsPct"),
  resultMsg:      document.getElementById("quizResultsMsg"),
  resultBreakdown:document.getElementById("quizResultsBreakdown"),
  openBtn:        document.getElementById("openQuizBtn"),
  closeBtn:       document.getElementById("quizCloseBtn"),
  startMem:       document.getElementById("startMemQuiz"),
  startTafsir:    document.getElementById("startTafsirQuiz"),
  retryBtn:       document.getElementById("quizRetryBtn"),
  doneBtn:        document.getElementById("quizDoneBtn"),
  countBtns:      document.querySelectorAll(".quiz-count-btn")
};

// ---- Helpers ----
function quizShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function quizPickRandom(arr, n, exclude = []) {
  const pool = arr.filter((_, i) => !exclude.includes(i));
  return quizShuffle(pool).slice(0, n);
}

function quizShowScreen(name) {
  ["selectScreen","loadingScreen","questionScreen","resultsScreen"].forEach(k => {
    if (quizEl[k]) quizEl[k].style.display = "none";
  });
  if (quizEl[name]) quizEl[name].style.display = "block";
}

function quizOpen() {
  if (!state.ayahs.length) {
    alert("يرجى الانتظار حتى يتم تحميل السورة.");
    return;
  }
  if (quizEl.surahName) quizEl.surahName.textContent = "سورة " + (SURAHS[surahNumber - 1] || surahNumber);
  quizShowScreen("selectScreen");
  if (quizEl.modal) quizEl.modal.style.display = "flex";
}

function quizClose() {
  if (quizEl.modal) quizEl.modal.style.display = "none";
}

// ---- Question Generators ----

// Type 1: Complete the Ayah (show first half, choose second half)
function genCompleteAyah(ayahIdx) {
  const ayah = state.ayahs[ayahIdx];
  const words = ayah.text.trim().split(/\s+/);
  if (words.length < 4) return null;

  const splitAt = Math.max(2, Math.floor(words.length * 0.55));
  const firstPart = words.slice(0, splitAt).join(" ");
  const correctAnswer = words.slice(splitAt).join(" ");

  // Wrong answers: second halves of other ayahs
  const otherIdxs = quizPickRandom(state.ayahs, 3, [ayahIdx]);
  const wrongs = otherIdxs.map(a => {
    const ws = a.text.trim().split(/\s+/);
    const sp = Math.max(2, Math.floor(ws.length * 0.55));
    return ws.slice(sp).join(" ");
  }).filter(w => w !== correctAnswer && w.length > 0);

  const choices = quizShuffle([correctAnswer, ...wrongs.slice(0, 3)]);

  return {
    type: "أكمل الآية",
    question: `﴿ ${firstPart} ... ﴾`,
    correctAnswer,
    choices,
    ayahNum: ayah.numberInSurah
  };
}

// Type 2: Fill in the Blank (replace a word with ___)
function genFillBlank(ayahIdx) {
  const ayah = state.ayahs[ayahIdx];
  const words = ayah.text.trim().split(/\s+/);
  if (words.length < 5) return null;

  // Pick a word from the middle (not first or last 2)
  const candidates = [];
  for (let i = 2; i < words.length - 2; i++) {
    if (words[i].length >= 3) candidates.push(i);
  }
  if (!candidates.length) return null;

  const wordIdx = candidates[Math.floor(Math.random() * candidates.length)];
  const correctWord = words[wordIdx];
  const blankedText = words.map((w, i) =>
    i === wordIdx ? `<span class="quiz-blank">___</span>` : w
  ).join(" ");

  // Wrong answers: similar-length words from other ayahs
  const allWords = state.ayahs
    .filter((_, i) => i !== ayahIdx)
    .flatMap(a => a.text.trim().split(/\s+/))
    .filter(w => w !== correctWord && w.length >= 3);
  const wrongs = quizShuffle([...new Set(allWords)]).slice(0, 3);

  const choices = quizShuffle([correctWord, ...wrongs]);

  return {
    type: "أكمل الفراغ",
    question: `﴿ ${blankedText} ﴾`,
    correctAnswer: correctWord,
    choices,
    ayahNum: ayah.numberInSurah,
    isHtml: true
  };
}

// Type 3: What's the Ayah Number?
function genAyahNumber(ayahIdx) {
  const ayah = state.ayahs[ayahIdx];
  const correctNum = ayah.numberInSurah;

  // Wrong numbers: other ayah numbers
  const otherNums = state.ayahs
    .filter((_, i) => i !== ayahIdx)
    .map(a => String(a.numberInSurah));
  const wrongs = quizShuffle(otherNums).slice(0, 3);
  const choices = quizShuffle([String(correctNum), ...wrongs]);

  return {
    type: "ما رقم الآية؟",
    question: `﴿ ${ayah.text} ﴾`,
    correctAnswer: String(correctNum),
    choices,
    ayahNum: correctNum
  };
}

// Type 4: Which is the Correct Ayah?
function genCorrectAyah(ayahIdx) {
  const ayah = state.ayahs[ayahIdx];
  const correctText = ayah.text;

  const wrongs = quizPickRandom(state.ayahs, 3, [ayahIdx]).map(a => a.text);
  const choices = quizShuffle([correctText, ...wrongs]);

  return {
    type: "الآية الصحيحة",
    question: `الآية رقم ﴿${ayah.numberInSurah}﴾ من سورة ${SURAHS[surahNumber - 1] || ""}`,
    correctAnswer: correctText,
    choices,
    ayahNum: ayah.numberInSurah
  };
}

// ---- Build Memorization Questions ----
function buildMemQuestions(count) {
  if (state.ayahs.length < 4) return [];
  const questions = [];
  const types = [genCompleteAyah, genFillBlank, genAyahNumber, genCorrectAyah];
  const usedIdxs = new Set();

  let attempts = 0;
  while (questions.length < count && attempts < count * 6) {
    attempts++;
    const ayahIdx = Math.floor(Math.random() * state.ayahs.length);
    if (usedIdxs.has(ayahIdx)) continue;
    const genFn = types[Math.floor(Math.random() * types.length)];
    const q = genFn(ayahIdx);
    if (q && q.choices.length >= 2) {
      questions.push(q);
      usedIdxs.add(ayahIdx);
    }
  }
  return questions;
}

// ---- Build Tafsir Questions ----
async function buildTafsirQuestions(count) {
  if (state.ayahs.length < 4) return [];
  const questions = [];
  const usedIdxs = new Set();
  const needed = Math.min(count, state.ayahs.length);

  // Pick random ayahs
  const pool = quizShuffle([...Array(state.ayahs.length).keys()]).slice(0, needed);

  for (const ayahIdx of pool) {
    if (usedIdxs.has(ayahIdx)) continue;
    const ayah = state.ayahs[ayahIdx];
    const tafsir = await fetchAyahTafsir(ayah.numberInSurah);
    if (!tafsir || tafsir.includes("تعذر")) continue;

    // Truncate tafsir to ~200 chars for display
    const snippet = tafsir.length > 220
      ? tafsir.slice(0, 220).replace(/\s+\S*$/, "") + "..."
      : tafsir;

    // Wrong ayah numbers
    const otherNums = state.ayahs
      .filter((_, i) => i !== ayahIdx)
      .map(a => String(a.numberInSurah));
    const wrongs = quizShuffle(otherNums).slice(0, 3);
    const choices = quizShuffle([String(ayah.numberInSurah), ...wrongs]);

    questions.push({
      type: "اختبار التفسير",
      question: `📖 "${snippet}"`,
      correctAnswer: String(ayah.numberInSurah),
      choices,
      ayahNum: ayah.numberInSurah,
      isTafsir: true
    });
    usedIdxs.add(ayahIdx);
    if (questions.length >= count) break;
  }
  return questions;
}

// ---- Render Question ----
function quizRenderQuestion() {
  const q = quizState.questions[quizState.currentQ];
  const total = quizState.questions.length;
  const num = quizState.currentQ + 1;

  // Progress
  if (quizEl.progressFill) quizEl.progressFill.style.width = `${(num / total) * 100}%`;
  if (quizEl.questionNum) quizEl.questionNum.textContent = `السؤال ${num} / ${total}`;
  if (quizEl.scoreDisplay) quizEl.scoreDisplay.textContent = `✅ ${quizState.score}`;
  if (quizEl.questionType) quizEl.questionType.textContent = q.type;

  // Question text
  if (quizEl.questionText) {
    if (q.isHtml) {
      quizEl.questionText.innerHTML = q.question;
    } else if (q.isTafsir) {
      quizEl.questionText.style.fontSize = "15px";
      quizEl.questionText.style.lineHeight = "1.9";
      quizEl.questionText.style.fontFamily = "'Cairo', sans-serif";
      quizEl.questionText.textContent = q.question;
    } else {
      quizEl.questionText.style.fontSize = "";
      quizEl.questionText.style.lineHeight = "";
      quizEl.questionText.style.fontFamily = "";
      quizEl.questionText.textContent = q.question;
    }
  }

  // Choices
  if (quizEl.choices) {
    quizEl.choices.innerHTML = q.choices.map((c, i) => {
      const label = ["أ", "ب", "ج", "د"][i] || String(i + 1);
      const displayText = q.isTafsir ? `آية ${c}` : c;
      return `<button class="quiz-choice-btn" data-idx="${i}" data-value="${escapeHtml(c)}">
        <span style="font-size:11px;color:var(--muted);margin-left:6px;font-family:'Cairo',sans-serif">${label}</span>
        ${escapeHtml(displayText)}
      </button>`;
    }).join("");

    // Attach click handlers
    quizEl.choices.querySelectorAll(".quiz-choice-btn").forEach(btn => {
      btn.addEventListener("click", () => quizHandleAnswer(btn.dataset.value, btn));
    });
  }

  // Hide next button
  if (quizEl.nextWrap) quizEl.nextWrap.style.display = "none";
  quizState.answered = false;
}

// ---- Handle Answer ----
function quizHandleAnswer(chosen, clickedBtn) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizState.questions[quizState.currentQ];
  const isCorrect = chosen === q.correctAnswer;

  // Disable all buttons
  quizEl.choices.querySelectorAll(".quiz-choice-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === q.correctAnswer) {
      btn.classList.add("correct");
    }
  });

  if (isCorrect) {
    quizState.score++;
    if (quizEl.scoreDisplay) quizEl.scoreDisplay.textContent = `✅ ${quizState.score}`;
  } else {
    clickedBtn.classList.add("wrong");
    quizState.wrongAnswers.push({
      q: q.question,
      correct: q.correctAnswer,
      chosen,
      ayahNum: q.ayahNum
    });
  }

  // Show next button
  if (quizEl.nextWrap) quizEl.nextWrap.style.display = "block";
}

// ---- Next Question ----
function quizNextQuestion() {
  quizState.currentQ++;
  if (quizState.currentQ >= quizState.questions.length) {
    quizShowResults();
  } else {
    quizRenderQuestion();
  }
}

// ---- Show Results ----
function quizShowResults() {
  const total = quizState.questions.length;
  const score = quizState.score;
  const pct = Math.round((score / total) * 100);

  // Stars
  let stars = "";
  if (pct >= 90) stars = "⭐⭐⭐⭐⭐";
  else if (pct >= 75) stars = "⭐⭐⭐⭐";
  else if (pct >= 60) stars = "⭐⭐⭐";
  else if (pct >= 40) stars = "⭐⭐";
  else stars = "⭐";

  // Message
  let msg = "";
  if (pct === 100) msg = "🎉 ممتاز! حفظت السورة بشكل رائع!";
  else if (pct >= 90) msg = "🌟 أحسنت! نتيجة رائعة جداً!";
  else if (pct >= 75) msg = "👍 جيد جداً! استمر في المراجعة!";
  else if (pct >= 60) msg = "📖 جيد! راجع السورة أكثر!";
  else if (pct >= 40) msg = "💪 لا بأس! تحتاج لمزيد من المراجعة.";
  else msg = "🔄 راجع السورة وأعد الاختبار!";

  if (quizEl.resultStars) quizEl.resultStars.textContent = stars;
  if (quizEl.resultScore) quizEl.resultScore.textContent = `${score}/${total}`;
  if (quizEl.resultPct) quizEl.resultPct.textContent = `${pct}%`;
  if (quizEl.resultMsg) quizEl.resultMsg.textContent = msg;

  // Breakdown
  if (quizEl.resultBreakdown) {
    const wrongCount = quizState.wrongAnswers.length;
    const correctCount = score;
    let html = `✅ إجابات صحيحة: <strong>${correctCount}</strong> &nbsp;|&nbsp; ❌ إجابات خاطئة: <strong>${wrongCount}</strong>`;
    if (wrongCount > 0) {
      html += `<br><br><strong>الآيات التي تحتاج مراجعة:</strong><br>`;
      html += quizState.wrongAnswers.map(w =>
        `<span style="color:var(--primary)">آية ${w.ayahNum}</span>`
      ).join(" · ");
    }
    quizEl.resultBreakdown.innerHTML = html;
  }

  quizShowScreen("resultsScreen");
}

// ---- Start Quiz ----
async function quizStart(type) {
  quizState.type = type;
  quizState.currentQ = 0;
  quizState.score = 0;
  quizState.answered = false;
  quizState.wrongAnswers = [];
  quizState.questions = [];

  quizShowScreen("loadingScreen");

  let questions = [];
  if (type === "mem") {
    questions = buildMemQuestions(quizState.questionCount);
  } else {
    questions = await buildTafsirQuestions(quizState.questionCount);
  }

  if (!questions.length) {
    alert("تعذر إنشاء الأسئلة. يرجى المحاولة مرة أخرى.");
    quizShowScreen("selectScreen");
    return;
  }

  quizState.questions = questions;
  quizShowScreen("questionScreen");
  quizRenderQuestion();
}

// ---- Event Listeners ----
if (quizEl.openBtn) quizEl.openBtn.addEventListener("click", quizOpen);
if (quizEl.closeBtn) quizEl.closeBtn.addEventListener("click", quizClose);
if (quizEl.modal) {
  quizEl.modal.addEventListener("click", (e) => {
    if (e.target === quizEl.modal) quizClose();
  });
}
if (quizEl.startMem) quizEl.startMem.addEventListener("click", () => quizStart("mem"));
if (quizEl.startTafsir) quizEl.startTafsir.addEventListener("click", () => quizStart("tafsir"));
if (quizEl.nextBtn) quizEl.nextBtn.addEventListener("click", quizNextQuestion);
if (quizEl.retryBtn) quizEl.retryBtn.addEventListener("click", () => quizStart(quizState.type));
if (quizEl.doneBtn) quizEl.doneBtn.addEventListener("click", quizClose);

// Count buttons
quizEl.countBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    quizEl.countBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    quizState.questionCount = Number(btn.dataset.count);
  });
});

// ===================================================================
// ========================= END QUIZ ================================
// ===================================================================

async function boot() {
  applyTheme();
  applyFocusMode();
  renderReciters();
  renderHeader();
  applyFullTextToggle();

  await loadSurahText();
  await loadAyahTimingSegments();
  loadContinuousAudio(false);

  // If resuming from a specific ayah (initAyah > 1), seek audio to that ayah once ready
  if (initAyah > 1 && state.ayahSegmentsSec.length > 0) {
    const startIdx = Math.max(0, Math.min(state.ayahs.length - 1, initAyah - 1));
    const doSeek = () => {
      seekAudioToAyah(startIdx);
      setActiveAyah(startIdx);
    };
    if (el.readerAudio) {
      // If metadata already loaded, seek immediately; otherwise wait
      if (el.readerAudio.readyState >= 1) {
        doSeek();
      } else {
        el.readerAudio.addEventListener("loadedmetadata", doSeek, { once: true });
        // Fallback: also try on canplay in case loadedmetadata already fired
        el.readerAudio.addEventListener("canplay", doSeek, { once: true });
      }
    }
  }
}

boot();
