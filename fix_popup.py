import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the function boundaries
start_marker = '// ===== Continue Reading Popup ====='
end_marker = '// ===== Prayer Notifications ====='

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f'ERROR: start={start_idx}, end={end_idx}')
    exit(1)

print(f'Found at: start={start_idx}, end={end_idx}')

new_fn = '''// ===== Continue Reading Popup =====
function showContinueReadingPopup() {
  const lr = parseJsonSafe("lastRead", null);
  if (!lr || !lr.number) return;
  if (sessionStorage.getItem("continuePopupShown") === "1") return;
  sessionStorage.setItem("continuePopupShown", "1");

  const popup = document.getElementById("continueReadingPopup");
  if (!popup) return;

  const surahEl = document.getElementById("continuePopupSurah");
  const titleEl = document.getElementById("continuePopupTitle");
  const msgEl   = document.getElementById("continuePopupMsg");
  const iconEl  = document.getElementById("continuePopupIcon");
  const yesBtn  = document.getElementById("continuePopupYes");
  const bmBtn   = document.getElementById("continuePopupBookmark");
  const noBtn   = document.getElementById("continuePopupNo");

  // Check for bookmark on the lastRead surah
  const bm = getBookmarkForSurah(lr.number);
  const hasBookmark = !!bm;
  const lastReadAyah = lr.ayah || 1;
  const bookmarkAyah = bm ? bm.ayah : null;

  // Determine if bookmark and lastRead are at different positions
  const differentPositions = hasBookmark && bookmarkAyah !== lastReadAyah;

  if (hasBookmark) {
    // Has bookmark → show both options
    if (iconEl) iconEl.textContent = "📌";
    if (titleEl) titleEl.textContent = "استئناف القراءة";
    if (msgEl) msgEl.textContent = `لديك علامة محفوظة عند الآية ${bookmarkAyah}. اختر كيف تريد المتابعة:`;
    if (surahEl) surahEl.textContent = `سورة ${lr.name}`;
    // Show bookmark button
    if (bmBtn) {
      bmBtn.style.display = "inline-flex";
      bmBtn.innerHTML = `📌 الذهاب للعلامة (آية ${bookmarkAyah})`;
    }
    // Show lastRead button only if different position
    if (yesBtn) {
      if (differentPositions) {
        yesBtn.style.display = "inline-flex";
        yesBtn.innerHTML = `📖 إكمال القراءة (آية ${lastReadAyah})`;
      } else {
        yesBtn.style.display = "none";
      }
    }
  } else {
    // No bookmark → show only continue reading
    if (iconEl) iconEl.textContent = "📖";
    if (titleEl) titleEl.textContent = "متابعة القراءة";
    if (msgEl) msgEl.textContent = "هل تريد متابعة قراءتك من حيث توقفت؟";
    if (surahEl) surahEl.textContent = `سورة ${lr.name} — آية ${lastReadAyah}`;
    if (bmBtn) bmBtn.style.display = "none";
    if (yesBtn) {
      yesBtn.style.display = "inline-flex";
      yesBtn.innerHTML = "📖 إكمال القراءة";
    }
  }

  popup.style.display = "flex";

  function closePopup() { popup.style.display = "none"; }

  // Bookmark button → go to bookmark
  if (bmBtn) bmBtn.onclick = () => {
    closePopup();
    window.location.href = `surah.html?surah=${lr.number}&ayah=${bookmarkAyah}&reciter=${lr.reciterIdx || state.currentReciterIdx}`;
  };

  // Yes button → go to lastRead position
  if (yesBtn) yesBtn.onclick = () => {
    closePopup();
    window.location.href = `surah.html?surah=${lr.number}&ayah=${lastReadAyah}&reciter=${lr.reciterIdx || state.currentReciterIdx}`;
  };

  if (noBtn) noBtn.onclick = closePopup;
  popup.addEventListener("click", e => { if (e.target === popup) closePopup(); });
}

'''

new_content = content[:start_idx] + new_fn + content[end_idx:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('SUCCESS: showContinueReadingPopup replaced!')
