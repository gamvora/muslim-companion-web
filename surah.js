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

// Continuous full-surah MP3 servers (restored previous sheikhs)
const RECITERS = [
  { name: "مشاري العفاسي", audioBase: "https://server8.mp3quran.net/afs/", timingReaderId: 7, offsetSec: 0.00 },
  { name: "عبد الرحمن السديس", audioBase: "https://server11.mp3quran.net/sds/", timingReaderId: 3, offsetSec: 0.10 },
  { name: "ماهر المعيقلي", audioBase: "https://server12.mp3quran.net/maher/", timingReaderId: 7, offsetSec: 0.15 },
  { name: "ياسر الدوسري", audioBase: "https://server11.mp3quran.net/yasser/", timingReaderId: 7, offsetSec: 0.12 },
  { name: "سعد الغامدي", audioBase: "https://server7.mp3quran.net/s_gmd/", timingReaderId: 7, offsetSec: 0.20 },
  { name: "ناصر القطامي", audioBase: "https://server6.mp3quran.net/qtm/", timingReaderId: 7, offsetSec: 0.18 },
  { name: "سعود الشريم", audioBase: "https://server7.mp3quran.net/shur/", timingReaderId: 10, offsetSec: 0.08 },
  { name: "علي الحذيفي", audioBase: "https://server9.mp3quran.net/hthfi/", timingReaderId: 3, offsetSec: 0.10 }
];

const params = new URLSearchParams(location.search);
const surahNumber = Math.max(1, Math.min(114, Number(params.get("surah") || 1)));
const initReciter = Number(params.get("reciter") ?? localStorage.getItem("reciterIdx") ?? 0);

const state = {
  ayahs: [],
  currentIdx: 0,
  reciterIdx: Math.min(Math.max(0, initReciter), RECITERS.length - 1),
  playing: false,
  dark: localStorage.getItem("dark") === "1",
  fullTextVisible: true,
  lastSyncedIdx: -1,
  ayahSegmentsSec: []
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
  readerMarkFollow: document.getElementById("readerMarkFollow")
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

function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  if (el.readerThemeToggle) el.readerThemeToggle.textContent = state.dark ? "☀️" : "🌙";
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
  if (el.readerSurahTitle) el.readerSurahTitle.textContent = "سورة " + name;
  if (el.readerTitleFull) el.readerTitleFull.textContent = "سورة " + name + " (تشغيل متصل)";
  if (el.readerSurahNameBadge) el.readerSurahNameBadge.textContent = name;
  if (el.readerReciterName) el.readerReciterName.textContent = "القارئ: " + RECITERS[state.reciterIdx].name;
}

function applyFullTextToggle() {
  if (el.fullTextCard) el.fullTextCard.style.display = "block";
  if (el.toggleFullText) el.toggleFullText.style.display = "none";
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

  document.querySelectorAll(".ayah-span").forEach((span) => span.classList.remove("active-span"));
  const activeSpan = document.getElementById("span-" + safeIdx);
  if (activeSpan) activeSpan.classList.add("active-span");
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
  renderFullText();
  setActiveAyah(0);
  if (el.singleAyahText) el.singleAyahText.textContent = state.ayahs[0]?.text || "";
}

async function loadAyahTimingSegments() {
  state.ayahSegmentsSec = [];
  const readerId = RECITERS[state.reciterIdx]?.timingReaderId || 7;
  try {
    const url = `https://api.quran.com/api/v4/chapter_recitations/${readerId}/${surahNumber}?segments=true`;
    const res = await fetch(url);
    const json = await res.json();
    const timing = json?.audio_file?.verse_timings || [];
    if (!timing.length) throw new Error("No verse timings");

    const seg = timing.map((v, i) => {
      const start = Number(v.timestamp_from || 0) / 1000;
      const end = Number(v.timestamp_to || 0) / 1000;
      return { idx: i, start, end };
    });
    state.ayahSegmentsSec = seg;
  } catch (e) {
    state.ayahSegmentsSec = [];
  }
}

function getAyahIndexByTime(t) {
  if (!state.ayahSegmentsSec.length) return 0;
  const offset = RECITERS[state.reciterIdx]?.offsetSec || 0;
  const adjustedTime = Math.max(0, t + offset);
  for (let i = 0; i < state.ayahSegmentsSec.length; i++) {
    const s = state.ayahSegmentsSec[i];
    if (adjustedTime >= s.start && adjustedTime < s.end) return Math.min(i, state.ayahs.length - 1);
  }
  return Math.max(0, state.ayahSegmentsSec.length - 1);
}

function seekAudioToAyah(idx) {
  if (!el.readerAudio || !state.ayahSegmentsSec.length) return;
  const s = state.ayahSegmentsSec[Math.max(0, Math.min(state.ayahSegmentsSec.length - 1, idx))];
  if (!s) return;
  el.readerAudio.currentTime = Math.max(0, s.start + 0.01);
}

function loadContinuousAudio(autoplay = false) {
  if (!el.readerAudio) return;
  el.readerAudio.src = continuousAudioUrl();
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
    const idx = getAyahIndexByTime(el.readerAudio.currentTime);
    if (idx !== state.lastSyncedIdx) {
      state.lastSyncedIdx = idx;
      setActiveAyah(idx);
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
  el.readerReciterSelect.addEventListener("change", async () => {
    const wasPlaying = el.readerAudio && !el.readerAudio.paused;
    const currentTimeBefore = el.readerAudio ? el.readerAudio.currentTime : 0;
    state.reciterIdx = Number(el.readerReciterSelect.value);
    localStorage.setItem("reciterIdx", String(state.reciterIdx));
    if (el.readerReciterName) el.readerReciterName.textContent = "القارئ: " + RECITERS[state.reciterIdx].name;

    await loadAyahTimingSegments();
    loadContinuousAudio(false);

    if (el.readerAudio) {
      const targetIdx = getAyahIndexByTime(currentTimeBefore);
      setActiveAyah(targetIdx);
      seekAudioToAyah(targetIdx);
      if (wasPlaying) {
        el.readerAudio.play().catch(() => {});
        updatePlayBtns(true);
      }
    }
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

if (el.readerMarkFollow) {
  el.readerMarkFollow.addEventListener("click", () => {
    const ayah = state.ayahs[state.currentIdx];
    const mark = {
      surah: surahNumber,
      surahName: SURAHS[surahNumber - 1] || `سورة ${surahNumber}`,
      ayah: ayah?.numberInSurah || 1,
      ayahText: ayah?.text || "",
      reciterIdx: state.reciterIdx,
      reciterName: RECITERS[state.reciterIdx]?.name || "",
      savedAt: new Date().toISOString()
    };
    localStorage.setItem("followMark", JSON.stringify(mark));
    localStorage.setItem("lastRead", JSON.stringify({
      number: surahNumber,
      name: mark.surahName,
      ayah: mark.ayah
    }));
    const old = el.readerMarkFollow.innerHTML;
    el.readerMarkFollow.innerHTML = "✅ تم الحفظ";
    setTimeout(() => {
      el.readerMarkFollow.innerHTML = old;
    }, 1400);
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
