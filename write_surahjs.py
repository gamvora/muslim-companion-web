content = r"""// ===== Constants =====
// Continuous per-surah audio + real-time ayah sync via quran.com API
const SURAHS = [
  "\u0627\u0644\u0641\u0627\u062a\u062d\u0629","\u0627\u0644\u0628\u0642\u0631\u0629","\u0622\u0644 \u0639\u0645\u0631\u0627\u0646","\u0627\u0644\u0646\u0633\u0627\u0621","\u0627\u0644\u0645\u0627\u0626\u062f\u0629","\u0627\u0644\u0623\u0646\u0639\u0627\u0645","\u0627\u0644\u0623\u0639\u0631\u0627\u0641","\u0627\u0644\u0623\u0646\u0641\u0627\u0644","\u0627\u0644\u062a\u0648\u0628\u0629","\u064a\u0648\u0646\u0633","\u0647\u0648\u062f","\u064a\u0648\u0633\u0641","\u0627\u0644\u0631\u0639\u062f","\u0625\u0628\u0631\u0627\u0647\u064a\u0645","\u0627\u0644\u062d\u062c\u0631","\u0627\u0644\u0646\u062d\u0644","\u0627\u0644\u0625\u0633\u0631\u0627\u0621","\u0627\u0644\u0643\u0647\u0641","\u0645\u0631\u064a\u0645","\u0637\u0647","\u0627\u0644\u0623\u0646\u0628\u064a\u0627\u0621","\u0627\u0644\u062d\u062c","\u0627\u0644\u0645\u0624\u0645\u0646\u0648\u0646","\u0627\u0644\u0646\u0651\u0648\u0631","\u0627\u0644\u0641\u0631\u0642\u0627\u0646","\u0627\u0644\u0634\u0639\u0631\u0627\u0621","\u0627\u0644\u0646\u0651\u0645\u0644","\u0627\u0644\u0642\u0635\u0635","\u0627\u0644\u0639\u0646\u0643\u0628\u0648\u062a","\u0627\u0644\u0631\u0651\u0648\u0645","\u0644\u0642\u0645\u0627\u0646","\u0627\u0644\u0633\u062c\u062f\u0629","\u0627\u0644\u0623\u062d\u0632\u0627\u0628","\u0633\u0628\u0623","\u0641\u0627\u0637\u0631","\u064a\u0633","\u0627\u0644\u0635\u0627\u0641\u0627\u062a","\u0635","\u0627\u0644\u0632\u0645\u0631","\u063a\u0627\u0641\u0631","\u0641\u0635\u0644\u062a","\u0627\u0644\u0634\u0648\u0631\u0649","\u0627\u0644\u0632\u062e\u0631\u0641","\u0627\u0644\u062f\u062e\u0627\u0646","\u0627\u0644\u062c\u0627\u062b\u064a\u0629","\u0627\u0644\u0623\u062d\u0642\u0627\u0641","\u0645\u062d\u0645\u062f","\u0627\u0644\u0641\u062a\u062d","\u0627\u0644\u062d\u062c\u0631\u0627\u062a","\u0642","\u0627\u0644\u0630\u0627\u0631\u064a\u0627\u062a","\u0627\u0644\u0637\u0648\u0631","\u0627\u0644\u0646\u062c\u0645","\u0627\u0644\u0642\u0645\u0631","\u0627\u0644\u0631\u062d\u0645\u0646","\u0627\u0644\u0648\u0627\u0642\u0639\u0629","\u0627\u0644\u062d\u062f\u064a\u062f","\u0627\u0644\u0645\u062c\u0627\u062f\u0644\u0629","\u0627\u0644\u062d\u0634\u0631","\u0627\u0644\u0645\u0645\u062a\u062d\u0646\u0629","\u0627\u0644\u0635\u0641","\u0627\u0644\u062c\u0645\u0639\u0629","\u0627\u0644\u0645\u0646\u0627\u0641\u0642\u0648\u0646","\u0627\u0644\u062a\u063a\u0627\u0628\u0646","\u0627\u0644\u0637\u0644\u0627\u0642","\u0627\u0644\u062a\u062d\u0631\u064a\u0645","\u0627\u0644\u0645\u0644\u0643","\u0627\u0644\u0642\u0644\u0645","\u0627\u0644\u062d\u0627\u0642\u0629","\u0627\u0644\u0645\u0639\u0627\u0631\u062c","\u0646\u0648\u062d","\u0627\u0644\u062c\u0646","\u0627\u0644\u0645\u0632\u0645\u0644","\u0627\u0644\u0645\u062f\u062b\u0631","\u0627\u0644\u0642\u064a\u0627\u0645\u0629","\u0627\u0644\u0625\u0646\u0633\u0627\u0646","\u0627\u0644\u0645\u0631\u0633\u0644\u0627\u062a","\u0627\u0644\u0646\u0628\u0623","\u0627\u0644\u0646\u0627\u0632\u0639\u0627\u062a","\u0639\u0628\u0633","\u0627\u0644\u062a\u0643\u0648\u064a\u0631","\u0627\u0644\u0625\u0646\u0641\u0637\u0627\u0631","\u0627\u0644\u0645\u0637\u0641\u0641\u064a\u0646","\u0627\u0644\u0627\u0646\u0634\u0642\u0627\u0642","\u0627\u0644\u0628\u0631\u0648\u062c","\u0627\u0644\u0637\u0627\u0631\u0642","\u0627\u0644\u0623\u0639\u0644\u0649","\u0627\u0644\u063a\u0627\u0634\u064a\u0629","\u0627\u0644\u0641\u062c\u0631","\u0627\u0644\u0628\u0644\u062f","\u0627\u0644\u0634\u0645\u0633","\u0627\u0644\u0644\u064a\u0644","\u0627\u0644\u0636\u062d\u0649","\u0627\u0644\u0634\u0631\u062d","\u0627\u0644\u062a\u064a\u0646","\u0627\u0644\u0639\u0644\u0642","\u0627\u0644\u0642\u062f\u0631","\u0627\u0644\u0628\u064a\u0646\u0629","\u0627\u0644\u0632\u0644\u0632\u0644\u0629","\u0627\u0644\u0639\u0627\u062f\u064a\u0627\u062a","\u0627\u0644\u0642\u0627\u0631\u0639\u0629","\u0627\u0644\u062a\u0643\u0627\u062b\u0631","\u0627\u0644\u0639\u0635\u0631","\u0627\u0644\u0647\u0645\u0632\u0629","\u0627\u0644\u0641\u064a\u0644","\u0642\u0631\u064a\u0634","\u0627\u0644\u0645\u0627\u0639\u0648\u0646","\u0627\u0644\u0643\u0648\u062b\u0631","\u0627\u0644\u0643\u0627\u0641\u0631\u0648\u0646","\u0627\u0644\u0646\u0635\u0631","\u0627\u0644\u0645\u0633\u062f","\u0627\u0644\u0625\u062e\u0644\u0627\u0635","\u0627\u0644\u0641\u0644\u0642","\u0627\u0644\u0646\u0627\u0633"
];

// quran.com recitation IDs + everyayah.com folders as fallback
const RECITERS = [
  { name: "\u0645\u0634\u0627\u0631\u064a \u0627\u0644\u0639\u0641\u0627\u0633\u064a",     rid: 7,  folder: "Alafasy_128kbps" },
  { name: "\u0639\u0628\u062f \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0633\u062f\u064a\u0633", rid: 1,  folder: "Abdurrahmaan_As-Sudais_192kbps" },
  { name: "\u0645\u0627\u0647\u0631 \u0627\u0644\u0645\u0639\u064a\u0642\u0644\u064a",     rid: 2,  folder: "Maher_AlMuaiqly_128kbps" },
  { name: "\u064a\u0627\u0633\u0631 \u0627\u0644\u062f\u0648\u0633\u0631\u064a",      rid: 9,  folder: "Yasser_Ad-Dussary_128kbps" },
  { name: "\u0633\u0639\u062f \u0627\u0644\u063a\u0627\u0645\u062f\u064a",       rid: 10, folder: "Saad_Al-Ghamdi_128kbps" },
  { name: "\u0646\u0627\u0635\u0631 \u0627\u0644\u0642\u0637\u0627\u0645\u064a",      rid: 3,  folder: "Nasser_Alqatami_128kbps" },
  { name: "\u0633\u0639\u0648\u062f \u0627\u0644\u0634\u0631\u064a\u0645",       rid: 4,  folder: "Saud_Al-Shuraym_128kbps" },
  { name: "\u0645\u062d\u0645\u062f \u0635\u062f\u064a\u0642 \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064a", rid: 5,  folder: "Mohammad_al_Minshawi_128kbps" }
];

// ===== Parse URL Params =====
const params = new URLSearchParams(location.search);
const surahNumber = Math.max(1, Math.min(114, Number(params.get("surah") || 1)));
const initReciter = Number(params.get("reciter") ?? localStorage.getItem("reciterIdx") ?? 0);

// ===== State =====
const state = {
  ayahs: [],
  currentIdx: 0,
  reciterIdx: Math.min(Math.max(0, initReciter), RECITERS.length - 1),
  followMarks: JSON.parse(localStorage.getItem("followMarks") || "{}"),
  dark: localStorage.getItem("dark") === "1",
  playing: false,
  autoPlay: false,
  verseTimings: [],   // [{verse_key, timestamp_from, timestamp_to}, ...]
  useFallback: false, // true = per-ayah everyayah.com mode
  fullTextVisible: localStorage.getItem("fullTextVisible") === "1",
};

// ===== DOM =====
const el = {
  title:            document.getElementById("readerSurahTitle"),
  reciterName:      document.getElementById("readerReciterName"),
  titleFull:        document.getElementById("readerTitleFull"),
  reciterSelect:    document.getElementById("readerReciterSelect"),
  playPause:        document.getElementById("readerPlayPause"),
  markFollow:       document.getElementById("readerMarkFollow"),
  audio:            document.getElementById("readerAudio"),
  audioPlayBtn:     document.getElementById("audioPlayBtn"),
  audioProgress:    document.getElementById("audioProgress"),
  audioCurrentTime: document.getElementById("audioCurrentTime"),
  audioDuration:    document.getElementById("audioDuration"),
  audioLabel:       document.getElementById("audioLabel"),
  liveAyah:         document.getElementById("readerLiveAyah"),
  currentAyah:      document.getElementById("readerCurrentAyah"),
  surahNameBadge:   document.getElementById("readerSurahNameBadge"),
  singleAyahText:   document.getElementById("singleAyahText"),
  singleAyahNum:    document.getElementById("singleAyahNum"),
  fullTextCard:     document.getElementById("fullTextCard"),
  fullText:         document.getElementById("readerFullText"),
  toggleFullText:   document.getElementById("toggleFullText"),
  themeToggle:      document.getElementById("readerThemeToggle"),
  prevAyah:         document.getElementById("readerPrevAyah"),
  nextAyah:         document.getElementById("readerNextAyah"),
};

// ===== Theme =====
function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  if (el.themeToggle) el.themeToggle.textContent = state.dark ? "\u2600\ufe0f" : "\ud83c\udf19";
}
if (el.themeToggle) {
  el.themeToggle.addEventListener("click", () => {
    state.dark = !state.dark;
    localStorage.setItem("dark", state.dark ? "1" : "0");
    applyTheme();
  });
}

// ===== Helpers =====
function pad3(n) { return String(n).padStart(3, "0"); }
function ayahAudioUrl(surah, ayah) {
  var folder = RECITERS[state.reciterIdx].folder;
  return "https://everyayah.com/data/" + folder + "/" + pad3(surah) + pad3(ayah) + ".mp3";
}
function quranComUrl(rid, surah) {
  return "https://api.quran.com/api/v4/chapter_recitations/" + rid + "/" + surah;
}
function formatTime(sec) {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

// ===== Save Position =====
function savePosition(ayahNumber) {
  state.followMarks[String(surahNumber)] = ayahNumber;
  localStorage.setItem("followMarks", JSON.stringify(state.followMarks));
  localStorage.setItem("lastRead", JSON.stringify({
    surah: surahNumber,
    ayah: ayahNumber,
    name: SURAHS[surahNumber - 1]
  }));
}

// ===== Render Reciters =====
function renderReciters() {
  if (!el.reciterSelect) return;
  el.reciterSelect.innerHTML = RECITERS.map(function(r, i) {
    return '<option value="' + i + '"' + (i === state.reciterIdx ? ' selected' : '') + '>' + r.name + '</option>';
  }).join("");
}

// ===== Render Header =====
function renderHeader() {
  var name = SURAHS[surahNumber - 1] || ("\u0633\u0648\u0631\u0629 " + surahNumber);
  if (el.title)          el.title.textContent = "\u0633\u0648\u0631\u0629 " + name;
  if (el.titleFull)      el.titleFull.textContent = "\u0633\u0648\u0631\u0629 " + name;
  if (el.surahNameBadge) el.surahNameBadge.textContent = "\u0633\u0648\u0631\u0629 " + name;
  if (el.reciterName)    el.reciterName.textContent = "\u0627\u0644\u0642\u0627\u0631\u0626: " + RECITERS[state.reciterIdx].name;
}

// ===== Full Text Toggle =====
function applyFullTextToggle() {
  if (!el.fullTextCard || !el.toggleFullText) return;
  if (state.fullTextVisible) {
    el.fullTextCard.style.display = "block";
    el.toggleFullText.textContent = "\u2716 \u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0646\u0635";
  } else {
    el.fullTextCard.style.display = "none";
    el.toggleFullText.textContent = "\ud83d\udcd6 \u0639\u0631\u0636 \u0643\u0627\u0645\u0644";
  }
}
if (el.toggleFullText) {
  el.toggleFullText.addEventListener("click", function() {
    state.fullTextVisible = !state.fullTextVisible;
    localStorage.setItem("fullTextVisible", state.fullTextVisible ? "1" : "0");
    applyFullTextToggle();
    if (state.fullTextVisible) {
      // Scroll to highlight
      var activeSpan = document.getElementById("span-" + state.currentIdx);
      if (activeSpan) activeSpan.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// ===== Render Full Text =====
function renderFullText() {
  if (!el.fullText) return;
  el.fullText.innerHTML = state.ayahs.map(function(a, idx) {
    return '<span class="ayah-span" id="span-' + idx + '" data-idx="' + idx + '" onclick="jumpToAyah(' + idx + ')">' +
      a.text + ' <span class="ayah-num-badge">\uFD3E' + a.numberInSurah + '\uFD3F</span> </span>';
  }).join("");
}

window.jumpToAyah = function(idx) {
  setActiveAyah(idx);
};

// ===== Set Active Ayah =====
function setActiveAyah(idx) {
  state.currentIdx = Math.max(0, Math.min(idx, state.ayahs.length - 1));
  var ayah = state.ayahs[state.currentIdx];
  if (!ayah) return;

  savePosition(ayah.numberInSurah);

  // Update live box
  if (el.liveAyah) {
    el.liveAyah.textContent = ayah.text;
    el.liveAyah.style.animation = "none";
    void el.liveAyah.offsetWidth;
    el.liveAyah.style.animation = "ayahFade .4s ease";
  }
  if (el.currentAyah) el.currentAyah.textContent = "\u0622\u064a\u0629 " + ayah.numberInSurah + " / " + state.ayahs.length;

  // Update single ayah card
  if (el.singleAyahText) el.singleAyahText.textContent = ayah.text;
  if (el.singleAyahNum)  el.singleAyahNum.textContent  = "\u0622\u064a\u0629 " + ayah.numberInSurah + " \u0645\u0646 " + state.ayahs.length;

  // Highlight in full text
  document.querySelectorAll(".ayah-span").forEach(function(s) { s.classList.remove("active-span"); });
  var activeSpan = document.getElementById("span-" + state.currentIdx);
  if (activeSpan) {
    activeSpan.classList.add("active-span");
    if (state.fullTextVisible) activeSpan.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Update audio label
  if (el.audioLabel) el.audioLabel.textContent = SURAHS[surahNumber - 1] + " - \u0622\u064a\u0629 " + ayah.numberInSurah;

  // Update prev/next buttons
  if (el.prevAyah) el.prevAyah.disabled = state.currentIdx === 0;
  if (el.nextAyah) el.nextAyah.disabled = state.currentIdx === state.ayahs.length - 1;
}

// ===== Load Ayah Audio =====
function loadAyahAudio(idx, autoplay) {
  if (!el.audio || !state.ayahs[idx]) return;
  var ayah = state.ayahs[idx];
  el.audio.src = ayahAudioUrl(surahNumber, ayah.numberInSurah);
  el.audio.load();
  if (el.audioProgress)    el.audioProgress.value = 0;
  if (el.audioCurrentTime) el.audioCurrentTime.textContent = "0:00";
  if (el.audioDuration)    el.audioDuration.textContent = "0:00";
  if (autoplay) {
    el.audio.play().catch(function() {});
    updatePlayBtns(true);
  } else {
    updatePlayBtns(false);
  }
}

function updatePlayBtns(playing) {
  state.playing = playing;
  if (playing) state.autoPlay = true;
  if (el.playPause)    el.playPause.innerHTML    = playing ? "&#9646;&#9646; \u0625\u064a\u0642\u0627\u0641" : "&#9654; \u062a\u0634\u063a\u064a\u0644";
  if (el.audioPlayBtn) el.audioPlayBtn.innerHTML = playing ? "&#9646;&#9646;" : "&#9654;";
}

// ===== Audio Events =====
if (el.audio) {
  el.audio.addEventListener("timeupdate", function() {
    if (!el.audio.duration || isNaN(el.audio.duration)) return;
    var pct = (el.audio.currentTime / el.audio.duration) * 100;
    if (el.audioProgress)    el.audioProgress.value = pct;
    if (el.audioCurrentTime) el.audioCurrentTime.textContent = formatTime(el.audio.currentTime);
  });

  el.audio.addEventListener("loadedmetadata", function() {
    if (el.audioDuration)    el.audioDuration.textContent = formatTime(el.audio.duration);
  });

  // AUTO-ADVANCE: when ayah ends, move to next ayah automatically
  el.audio.addEventListener("ended", function() {
    // Use autoPlay flag (not state.playing) because pause fires before ended in some browsers
    if (state.autoPlay && state.currentIdx < state.ayahs.length - 1) {
      var nextIdx = state.currentIdx + 1;
      setActiveAyah(nextIdx);
      loadAyahAudio(nextIdx, true);
    } else {
      state.autoPlay = false;
      updatePlayBtns(false);
      if (el.audioProgress) el.audioProgress.value = 0;
    }
  });

  el.audio.addEventListener("play",  function() { state.autoPlay = true; updatePlayBtns(true); });
  el.audio.addEventListener("pause", function() {
    // Only update UI if not ended (ended fires after pause in some browsers)
    if (!el.audio.ended) { updatePlayBtns(false); }
  });

  el.audio.addEventListener("error", function() {
    // Skip to next ayah on error
    if (state.autoPlay && state.currentIdx < state.ayahs.length - 1) {
      var nextIdx = state.currentIdx + 1;
      setActiveAyah(nextIdx);
      loadAyahAudio(nextIdx, true);
    } else {
      state.autoPlay = false;
      updatePlayBtns(false);
    }
  });
}

if (el.audioProgress) {
  el.audioProgress.addEventListener("input", function() {
    if (el.audio && el.audio.duration && !isNaN(el.audio.duration)) {
      el.audio.currentTime = (el.audioProgress.value / 100) * el.audio.duration;
    }
  });
}

// ===== Play/Pause =====
function togglePlay() {
  if (!el.audio) return;
  if (el.audio.paused) {
    state.autoPlay = true;
    if (!el.audio.src || el.audio.readyState === 0) {
      loadAyahAudio(state.currentIdx, true);
    } else {
      el.audio.play().catch(function() { loadAyahAudio(state.currentIdx, true); });
    }
  } else {
    state.autoPlay = false;
    el.audio.pause();
  }
}
if (el.playPause)    el.playPause.addEventListener("click", togglePlay);
if (el.audioPlayBtn) el.audioPlayBtn.addEventListener("click", togglePlay);

// ===== Prev / Next Ayah =====
if (el.prevAyah) {
  el.prevAyah.addEventListener("click", function() {
    if (state.currentIdx > 0) {
      var wasPlaying = !el.audio.paused;
      setActiveAyah(state.currentIdx - 1);
      loadAyahAudio(state.currentIdx, wasPlaying);
    }
  });
}
if (el.nextAyah) {
  el.nextAyah.addEventListener("click", function() {
    if (state.currentIdx < state.ayahs.length - 1) {
      var wasPlaying = !el.audio.paused;
      setActiveAyah(state.currentIdx + 1);
      loadAyahAudio(state.currentIdx, wasPlaying);
    }
  });
}

// ===== Mark Follow =====
if (el.markFollow) {
  el.markFollow.addEventListener("click", function() {
    var ayah = state.ayahs[state.currentIdx];
    if (!ayah) return;
    savePosition(ayah.numberInSurah);
    el.markFollow.innerHTML = "&#10003; \u062a\u0645 \u0627\u0644\u062d\u0641\u0638";
    setTimeout(function() { el.markFollow.innerHTML = "&#128278; \u062d\u0641\u0638"; }, 1500);
  });
}

// ===== Reciter Change =====
if (el.reciterSelect) {
  el.reciterSelect.addEventListener("change", function() {
    var wasPlaying = !el.audio.paused;
    state.reciterIdx = Number(el.reciterSelect.value);
    localStorage.setItem("reciterIdx", String(state.reciterIdx));
    if (el.reciterName) el.reciterName.textContent = "\u0627\u0644\u0642\u0627\u0631\u0626: " + RECITERS[state.reciterIdx].name;
    loadAyahAudio(state.currentIdx, wasPlaying);
  });
}

// ===== Fetch Ayahs =====
async function fetchAyahs() {
  if (el.singleAyahText) el.singleAyahText.textContent = "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0633\u0648\u0631\u0629...";
  try {
    var res = await fetch("https://api.alquran.cloud/v1/surah/" + surahNumber + "/quran-uthmani");
    if (!res.ok) throw new Error("HTTP " + res.status);
    var json = await res.json();
    state.ayahs = (json && json.data && json.data.ayahs) ? json.data.ayahs : [];
    if (!state.ayahs.length) throw new Error("No ayahs");
    return true;
  } catch(e) {
    if (el.singleAyahText) el.singleAyahText.textContent = "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0646\u0635. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0627\u062a\u0635\u0627\u0644.";
    return false;
  }
}

// ===== Boot =====
async function boot() {
  applyTheme();
  renderReciters();
  renderHeader();
  applyFullTextToggle();

  var ok = await fetchAyahs();
  if (!ok || !state.ayahs.length) return;

  renderFullText();

  // Restore saved position
  var savedMark = state.followMarks[String(surahNumber)];
  var startIdx = 0;
  if (savedMark) {
    var idx = state.ayahs.findIndex(function(a) { return a.numberInSurah === savedMark; });
    if (idx >= 0) startIdx = idx;
  }

  // Always start from ayah 1
  setActiveAyah(0);
  loadAyahAudio(0, false);
}

boot();
"""

with open("surah.js", "w", encoding="utf-8") as f:
    f.write(content)
print("surah.js written successfully")
