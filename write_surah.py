# -*- coding: utf-8 -*-
html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>قارئ السورة | Muslim Companion</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <!-- Topbar -->
  <header class="topbar glass">
    <div class="brand">
      <span class="logo">&#9770;</span>
      <div>
        <h1 id="readerSurahTitle">قارئ السورة</h1>
        <p id="readerReciterName">جاري التحميل...</p>
      </div>
    </div>
    <div class="topbar-actions">
      <button id="readerThemeToggle" class="btn ghost">&#127769;</button>
      <a href="index.html" class="btn">&#8594; القائمة</a>
    </div>
  </header>

  <!-- Reader Page -->
  <main class="reader-page">

    <!-- Live Ayah Box -->
    <div class="live-ayah-box" id="liveAyahBox">
      <div id="readerLiveAyah" class="live-ayah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <div class="live-ayah-meta">
        <span id="readerCurrentAyah" class="live-ayah-num">آية 1</span>
        <span id="readerSurahNameBadge">—</span>
      </div>
    </div>

    <!-- Controls Card -->
    <div class="reader-controls-card">
      <div class="reader-controls-top">
        <div>
          <div class="reader-title" id="readerTitleFull">—</div>
          <div style="margin-top:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="reciter-label">القارئ:</span>
            <select id="readerReciterSelect" class="reciter-select"></select>
          </div>
        </div>
        <div class="reader-btns">
          <button id="readerPlayPause" class="btn primary" style="min-width:100px">&#9654; تشغيل</button>
          <button id="readerAutoToggle" class="btn">&#8635; تلقائي</button>
          <button id="readerMarkFollow" class="btn gold">&#128278; حفظ</button>
        </div>
      </div>

      <!-- Custom Audio Player -->
      <div class="audio-wrap">
        <button id="audioPlayBtn" class="audio-play-btn">&#9654;</button>
        <div class="audio-progress-wrap">
          <span class="audio-label" id="audioLabel">جاري التحميل...</span>
          <input type="range" id="audioProgress" class="audio-progress" value="0" min="0" max="100" step="0.1" />
          <div class="audio-time">
            <span id="audioCurrentTime">0:00</span>
            <span id="audioDuration">0:00</span>
          </div>
        </div>
      </div>
      <audio id="readerAudio"></audio>
    </div>

    <!-- Full Surah Text -->
    <div class="full-text-card">
      <h3>&#128214; نص السورة كاملاً</h3>
      <div id="readerFullText" class="full-surah-text">جاري تحميل النص...</div>
    </div>

  </main>

  <script src="surah.js"></script>
</body>
</html>"""

with open("muslim_companion_web/surah.html", "w", encoding="utf-8") as f:
    f.write(html)
print("surah.html written successfully")
