// ===== Helpers =====
function parseJsonSafe(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function escapeHtml(s) {
  return String(s)
    .replace(/\x26/g, '\x26amp;')
    .replace(/\x3c/g, '\x26lt;')
    .replace(/\x3e/g, '\x26gt;')
    .replace(/\x22/g, '\x26quot;');
}

// Clean corrupted adhkar content (Python list artifacts)
function cleanAdhkarContent(content) {
  if (!content) return content;
  if (!content.includes("', '")) return content;
  const parts = [];
  const regex = /"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let text = match[1].trim();
    text = text.replace(/\s*\.\s*\[[^\]]+\]\s*\.?\s*$/, '').trim();
    text = text.replace(/\s*\[[^\]]+\]\s*\.?\s*$/, '').trim();
    if (text && text.length > 5 && /[\u0600-\u06FF]/.test(text)) {
      parts.push(text);
    }
  }
  if (parts.length > 0) return parts.join('\n');
  return content.replace(/\n', '/g, ' ').replace(/^[\s\n',]+|[\s\n',]+$/g, '').trim();
}

// ===== Constants =====
const API = {
  byCity: (city, country) => `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`,
  byCoords: (lat, lon) => `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`,
};

const COUNTRY_NAMES = {
  SA:"Saudi Arabia",EG:"Egypt",JO:"Jordan",AE:"United Arab Emirates",KW:"Kuwait",QA:"Qatar",
  BH:"Bahrain",OM:"Oman",YE:"Yemen",IQ:"Iraq",SY:"Syria",LB:"Lebanon",PS:"Palestine",
  LY:"Libya",TN:"Tunisia",DZ:"Algeria",MA:"Morocco",SD:"Sudan",TR:"Turkey",PK:"Pakistan",
  IN:"India",ID:"Indonesia",MY:"Malaysia",GB:"United Kingdom",DE:"Germany",FR:"France",US:"United States"
};

const CITIES_BY_COUNTRY = {
  SA:["Riyadh","Makkah","Madinah","Jeddah","Dammam","Taif"],
  EG:["Cairo","Alexandria","Giza","Luxor","Aswan"],
  JO:["Amman","Irbid","Zarqa","Aqaba"],
  AE:["Abu Dhabi","Dubai","Sharjah","Ajman"],
  KW:["Kuwait City","Hawalli","Farwaniya"],
  QA:["Doha","Al Rayyan"],
  BH:["Manama","Riffa"],
  OM:["Muscat","Salalah","Sohar"],
  YE:["Sanaa","Aden","Taiz"],
  IQ:["Baghdad","Basra","Mosul","Erbil"],
  SY:["Damascus","Aleppo","Homs"],
  LB:["Beirut","Tripoli"],
  PS:["Gaza","Ramallah","Nablus"],
  LY:["Tripoli","Benghazi"],
  TN:["Tunis","Sfax","Sousse"],
  DZ:["Algiers","Oran","Constantine"],
  MA:["Casablanca","Rabat","Marrakech","Fez"],
  SD:["Khartoum","Omdurman"],
  TR:["Istanbul","Ankara","Bursa","Konya"],
  PK:["Karachi","Lahore","Islamabad","Rawalpindi"],
  IN:["Delhi","Mumbai","Hyderabad","Chennai"],
  ID:["Jakarta","Bandung","Surabaya","Medan"],
  MY:["Kuala Lumpur","Johor Bahru","Penang"],
  GB:["London","Birmingham","Manchester"],
  DE:["Berlin","Hamburg","Munich","Frankfurt"],
  FR:["Paris","Lyon","Marseille"],
  US:["New York","Chicago","Los Angeles","Houston"]
};

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

// Accurate Medinan surahs based on scholarly consensus
const MADANI = new Set([2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110]);

const RECITERS = [
  {name:"مشاري العفاسي"},{name:"عبد الرحمن السديس"},{name:"ماهر المعيقلي"},
  {name:"ياسر الدوسري"},{name:"سعد الغامدي"}
];

const DAILY_MESSAGES = [
  "خيركم من تعلم القرآن وعلمه.",
  "ألا بذكر الله تطمئن القلوب.",
  "إن مع العسر يسرا.",
  "اللهم أعنا على ذكرك وشكرك وحسن عبادتك.",
  "من قرأ حرفاً من كتاب الله فله به حسنة والحسنة بعشر أمثالها.",
  "الصلاة عماد الدين، من أقامها فقد أقام الدين.",
  "رب اغفر وارحم وأنت خير الراحمين.",
  "اللهم ارزقنا الإخلاص في القول والعمل.",
  "اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا.",
  "اللهم ثبتنا على دينك حتى نلقاك.",
  "حافظ على أذكارك فهي حصنك من الشيطان.",
  "اللهم صل وسلم على نبينا محمد.",
  "ومن يتوكل على الله فهو حسبه إن الله بالغ أمره.",
  "يا حي يا قيوم برحمتك نستغيث أصلح لنا شأننا كله.",
  "اللهم إنا نسألك الهدى والتقى والعفاف والغنى.",
  "اللهم أصلح لنا ديننا الذي هو عصمة أمرنا.",
  "اللهم بارك لنا في أوقاتنا وأعمارنا.",
  "اللهم اجعلنا من أهل القرآن الذين هم أهل الله وخاصته.",
  "اللهم اغفر لنا ولوالدينا وللمسلمين أجمعين.",
  "اللهم ارحم موتانا وموتى المسلمين.",
  "استكثروا من الاستغفار فإنه يفتح الأبواب المغلقة.",
  "اذكر الله في الرخاء يذكرك في الشدة.",
  "خير الدعاء دعاء يوم عرفة وخير ما قلت أنا والنبيون.",
  "الدال على الخير كفاعله.",
  "تبسمك في وجه أخيك صدقة.",
  "اللهم اجعلنا من المتقين الذين لا خوف عليهم ولا هم يحزنون.",
  "وقل رب زدني علما نافعا.",
  "اللهم ارزقنا حسن الخاتمة.",
  "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.",
  "اللهم اجعلنا مفاتيح للخير مغاليق للشر."
];

const ADHKAR_FALLBACK = {
  "أذكار الصباح": [
    {zekr:"أَصْبَحْنا وَأَصْبَحَ المُلْكُ لله وَالحَمدُ لله، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُلكُ ولهُ الحَمْد، وهُوَ على كلّ شَيءٍ قدير.",count:"1",description:""},
    {zekr:"اللّهُمَّ بِكَ أَصْبَحْنا وَبِكَ أَمْسَيْنا، وَبِكَ نَحْيا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُور.",count:"1",description:""},
    {zekr:"اللّهُمَّ أَنْتَ رَبِّي لا إلهَ إلاّ أَنْتَ، خَلَقْتَنِي وَأَنا عَبْدُك، وَأَنا عَلى عَهْدِكَ وَوَعْدِكَ ما اسْتَطَعْت، أَعُوذُ بِكَ مِنْ شَرِّ ما صَنَعْت، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاّ أَنْت.",count:"1",description:"سيد الاستغفار - من قالها موقناً بها فمات دخل الجنة."},
    {zekr:"سُبْحانَ اللهِ وَبِحَمْدِهِ",count:"100",description:"من قالها مئة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر."},
    {zekr:"بِسمِ اللهِ الذي لا يَضُرُّ مَعَ اسمِهِ شَيءٌ في الأرْضِ وَلا في السَّماءِ وَهُوَ السَّمِيعُ العَلِيم.",count:"3",description:"لم يضره شيء."},
    {zekr:"رَضيتُ بِاللهِ رَبَّاً وَبِالإسْلامِ ديناً وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيَّاً.",count:"3",description:"كان حقاً على الله أن يرضيه يوم القيامة."},
    {zekr:"اللّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُك، وَأُشْهِدُ حَمَلَةَ عَرْشِك، وَمَلائِكَتَك، وَجَمِيعَ خَلْقِك، أَنَّكَ أَنْتَ اللهُ لا إلهَ إلاّ أَنْتَ وَحْدَكَ لا شَريكَ لَك، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُك.",count:"4",description:"أعتقه الله من النار."},
    {zekr:"حَسْبِيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ العَرْشِ العَظِيم.",count:"7",description:"كفاه الله ما أهمه من أمر الدنيا والآخرة."}
  ],
  "أذكار المساء": [
    {zekr:"أَمْسَيْنا وَأَمْسَى المُلْكُ للهِ رَبِّ العَالَمِين، لا إلهَ إلاّ اللهُ وَحدَهُ لا شَريكَ لَه.",count:"1",description:""},
    {zekr:"اللّهُمَّ بِكَ أَمْسَيْنا وَبِكَ أَصْبَحْنا، وَبِكَ نَحْيا وَبِكَ نَمُوتُ وَإِلَيْكَ المَصِير.",count:"1",description:""},
    {zekr:"أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق.",count:"3",description:"لم يضره شيء تلك الليلة."},
    {zekr:"اللّهُمَّ عَافِنِي في بَدَنِي، اللّهُمَّ عَافِنِي في سَمْعِي، اللّهُمَّ عَافِنِي في بَصَرِي، لا إلهَ إلاّ أَنْت.",count:"3",description:""},
    {zekr:"اللّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ في الدُّنْيا وَالآخِرَة.",count:"1",description:""},
    {zekr:"اللّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الكُفْرِ وَالفَقْر، وَأَعُوذُ بِكَ مِنْ عَذابِ القَبْر، لا إلهَ إلاّ أَنْت.",count:"3",description:""}
  ],
  "أذكار بعد الصلاة": [
    {zekr:"أَسْتَغْفِرُ اللهَ",count:"3",description:""},
    {zekr:"اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ، تَبارَكْتَ يا ذَا الجَلالِ وَالإِكْرام.",count:"1",description:""},
    {zekr:"سُبْحانَ اللهِ",count:"33",description:""},
    {zekr:"الحَمْدُ لله",count:"33",description:""},
    {zekr:"اللهُ أَكْبَر",count:"34",description:""},
    {zekr:"لا إلهَ إلاّ اللهُ وَحْدَهُ لا شَريكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْد، وَهُوَ عَلى كُلِّ شَيءٍ قَدِير.",count:"1",description:"غُفِرَت له ذنوبه وإن كانت مثل زبد البحر."},
    {zekr:"آيَةُ الكُرْسِيّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",count:"1",description:"من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا الموت."}
  ],
  "أذكار النوم": [
    {zekr:"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيا.",count:"1",description:""},
    {zekr:"اللَّهُمَّ قِنِي عَذابَكَ يَوْمَ تَبْعَثُ عِبادَك.",count:"3",description:""},
    {zekr:"سُبْحانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لا إِلهَ إِلاّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْك.",count:"1",description:"كفارة المجلس."},
    {zekr:"اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لا مَلْجَأَ وَلا مَنْجَا مِنْكَ إِلاّ إِلَيْك.",count:"1",description:""},
    {zekr:"اللَّهُمَّ بِاسْمِكَ أَحْيا وَأَمُوت.",count:"1",description:""}
  ],
  "أدعية متنوعة": [
    {zekr:"رَبَّنا آتِنا في الدُّنْيا حَسَنَةً وَفي الآخِرَةِ حَسَنَةً وَقِنا عَذابَ النَّار.",count:"1",description:""},
    {zekr:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَالحَزَن، وَأَعُوذُ بِكَ مِنَ العَجْزِ وَالكَسَل، وَأَعُوذُ بِكَ مِنَ الجُبْنِ وَالبُخْل.",count:"1",description:""},
    {zekr:"اللَّهُمَّ اغْفِرْ لِي وَلِوالِدَيَّ وَلِلمُؤمِنِينَ يَوْمَ يَقُومُ الحِساب.",count:"1",description:""},
    {zekr:"رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسانِي يَفْقَهُوا قَوْلِي.",count:"1",description:"دعاء موسى عليه السلام."},
    {zekr:"لا إِلهَ إِلاّ أَنْتَ سُبْحانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِين.",count:"1",description:"دعاء يونس عليه السلام - ما دعا به مكروب إلا فرج الله عنه."},
    {zekr:"حَسْبُنا اللهُ وَنِعْمَ الوَكِيل.",count:"1",description:""},
    {zekr:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نافِعاً وَرِزْقاً طَيِّباً وَعَمَلاً مُتَقَبَّلاً.",count:"1",description:""},
    {zekr:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّار.",count:"3",description:""}
  ]
};

// ===== State =====
const DEFAULT_TASBEEH = ["سبحان الله","الحمد لله","الله أكبر","لا إله إلا الله"];

const state = {
  dark: localStorage.getItem("dark") !== "0",
  colorTheme: localStorage.getItem("colorTheme") || "green",
  siteFontSize: Number(localStorage.getItem("siteFontSize") || 16),
  quranFont: Number(localStorage.getItem("quranFont") || 28),
  lastRead: parseJsonSafe("lastRead", null),
  tasbeehCounts: parseJsonSafe("tasbeehCounts", {}),
  tasbeehItems: parseJsonSafe("tasbeehItems", [...DEFAULT_TASBEEH]),
  favorites: parseJsonSafe("favorites", []),
  currentAdhkarCategory: "",
  adhkarData: null,
  currentReciterIdx: Number(localStorage.getItem("currentReciterIdx") || 0),
  currentDhikrIdx: 0,
  wird: parseJsonSafe("dailyWird", { date: "", done: 0, target: 20 }),
};

function save() {
  localStorage.setItem("dark", state.dark ? "1" : "0");
  localStorage.setItem("colorTheme", state.colorTheme);
  localStorage.setItem("siteFontSize", String(state.siteFontSize));
  localStorage.setItem("quranFont", String(state.quranFont));
  localStorage.setItem("tasbeehCounts", JSON.stringify(state.tasbeehCounts));
  localStorage.setItem("tasbeehItems", JSON.stringify(state.tasbeehItems));
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  localStorage.setItem("currentReciterIdx", String(state.currentReciterIdx));
}

// ===== DOM =====
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
  surahList: document.getElementById("surahList"),
  adhkarCategoryTabs: document.getElementById("adhkarCategoryTabs"),
  dhikrCounter: document.getElementById("dhikrCounter"),
  dhikrCardText: document.getElementById("dhikrCardText"),
  dhikrCardDesc: document.getElementById("dhikrCardDesc"),
  dhikrCardRepeat: document.getElementById("dhikrCardRepeat"),
  dhikrPrevBtn: document.getElementById("dhikrPrevBtn"),
  dhikrNextBtn: document.getElementById("dhikrNextBtn"),
  dhikrFavBtn: document.getElementById("dhikrFavBtn"),
  adhkarLoading: document.getElementById("adhkarLoading"),
  cityInput: document.getElementById("cityInput"),
  countryInput: document.getElementById("countryInput"),
  prayerAutoMsg: document.getElementById("prayerAutoMsg"),
  prayerManualForm: document.getElementById("prayerManualForm"),
  loadPrayerByCity: document.getElementById("loadPrayerByCity"),
  locatePrayerBtn: document.getElementById("locatePrayerBtn"),
  prayerDate: document.getElementById("prayerDate"),
  prayerList: document.getElementById("prayerList"),
  prayerLoading: document.getElementById("prayerLoading"),
  tasbeehGrid: document.getElementById("tasbeehGrid"),
  addCustomTasbeehBtn: document.getElementById("addCustomTasbeehBtn"),
  addCustomForm: document.getElementById("addCustomForm"),
  customTasbeehInput: document.getElementById("customTasbeehInput"),
  saveCustomTasbeehBtn: document.getElementById("saveCustomTasbeehBtn"),
  cancelCustomTasbeehBtn: document.getElementById("cancelCustomTasbeehBtn"),
  qiblaDirection: document.getElementById("qiblaDirection"),
  favoritesList: document.getElementById("favoritesList"),
  themeColors: document.getElementById("themeColors"),
  siteFontDec: document.getElementById("siteFontDec"),
  siteFontInc: document.getElementById("siteFontInc"),
  siteFontVal: document.getElementById("siteFontVal"),
  quranFontDec: document.getElementById("quranFontDec"),
  quranFontInc: document.getElementById("quranFontInc"),
  quranFontVal: document.getElementById("quranFontVal"),

  prayerReminderBanner: document.getElementById("prayerReminderBanner"),
  wirdTargetLabel: document.getElementById("wirdTargetLabel"),
  wirdProgressFill: document.getElementById("wirdProgressFill"),
  wirdProgressText: document.getElementById("wirdProgressText"),
  wirdProgressPercent: document.getElementById("wirdProgressPercent"),
  wirdAddOneBtn: document.getElementById("wirdAddOneBtn"),
  wirdAddFiveBtn: document.getElementById("wirdAddFiveBtn"),
  wirdResetBtn: document.getElementById("wirdResetBtn"),
  quickAdhkarList: document.getElementById("quickAdhkarList"),
  openAdhkarTabBtn: document.getElementById("openAdhkarTabBtn"),
};

// ===== Tab Navigation =====
let prayerAutoLocated = false;

function switchTab(tabId) {
  el.tabs.forEach(t => t.classList.remove("active"));
  el.navBtns.forEach(b => b.classList.remove("active"));
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add("active");
  const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (btn) btn.classList.add("active");
  if (tabId === "prayers" && !prayerAutoLocated) {
    prayerAutoLocated = true;
    autoLocatePrayer();
  }
}

el.navBtns.forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
el.jumps.forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.jump)));

// ===== Color Themes =====
const COLOR_THEMES = {
  green:  { p:"#0d7a58", d:"#095e43", l:"#e6f4ef", g:"rgba(13,122,88,.18)" },
  blue:   { p:"#0077b6", d:"#005f8e", l:"#e0f2fe", g:"rgba(0,119,182,.18)" },
  maroon: { p:"#7b2d3e", d:"#5c1e2c", l:"#fce8ec", g:"rgba(123,45,62,.18)" },
  purple: { p:"#6b3fa0", d:"#4e2d7a", l:"#f0e8ff", g:"rgba(107,63,160,.18)" },
  teal:   { p:"#2d6a4f", d:"#1b4332", l:"#d8f3dc", g:"rgba(45,106,79,.18)" },
  gold:   { p:"#b8860b", d:"#8b6508", l:"#fdf6e3", g:"rgba(184,134,11,.18)" },
};

function applyColorTheme(theme) {
  const t = COLOR_THEMES[theme] || COLOR_THEMES.green;
  const r = document.documentElement;
  r.style.setProperty("--primary", t.p);
  r.style.setProperty("--primary-dark", t.d);
  r.style.setProperty("--primary-light", t.l);
  r.style.setProperty("--primary-glow", t.g);
  document.querySelectorAll(".theme-color-btn").forEach(b => b.classList.toggle("active", b.dataset.theme === theme));
  // Persist so surah.html can read it
  localStorage.setItem("colorTheme", theme);
}

// Returns luminance 0-1 for a hex color
function colorLuminance(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function applyTextColor() {
  const color = localStorage.getItem("textColor") || "";
  const isDark = document.body.classList.contains("dark");
  if (color) {
    const lum = colorLuminance(color);
    // In light mode: block very light colors (luminance > 0.75) → use dark text
    // In dark mode: block very dark colors (luminance < 0.15) → use light text
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
  const picker = document.getElementById("textColorPicker");
  if (picker && color) picker.value = color;
}

function applySiteFont() {
  document.body.style.fontSize = state.siteFontSize + "px";
  if (el.siteFontVal) el.siteFontVal.textContent = state.siteFontSize;
  if (el.quranFontVal) el.quranFontVal.textContent = state.quranFont;
  document.documentElement.style.setProperty("--reader-font-size", state.quranFont + "px");
}

function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  if (el.darkSwitch) el.darkSwitch.checked = state.dark;
  if (el.themeToggle) el.themeToggle.textContent = state.dark ? "☀️" : "🌙";
  applyColorTheme(state.colorTheme);
  applySiteFont();
  applyTextColor();
}

if (el.themeToggle) el.themeToggle.addEventListener("click", () => { state.dark = !state.dark; save(); applyTheme(); });
if (el.darkSwitch) el.darkSwitch.addEventListener("change", () => { state.dark = el.darkSwitch.checked; save(); applyTheme(); });

if (el.themeColors) {
  el.themeColors.addEventListener("click", e => {
    const btn = e.target.closest(".theme-color-btn");
    if (!btn) return;
    state.colorTheme = btn.dataset.theme;
    // Switching theme color disables dark mode for better color visibility
    state.dark = false;
    save();
    applyTheme();
  });
}

// Font size controls
if (el.siteFontDec) el.siteFontDec.addEventListener("click", () => { state.siteFontSize = Math.max(12, state.siteFontSize - 1); save(); applySiteFont(); });
if (el.siteFontInc) el.siteFontInc.addEventListener("click", () => { state.siteFontSize = Math.min(24, state.siteFontSize + 1); save(); applySiteFont(); });
if (el.quranFontDec) el.quranFontDec.addEventListener("click", () => { state.quranFont = Math.max(18, state.quranFont - 2); save(); applySiteFont(); });
if (el.quranFontInc) el.quranFontInc.addEventListener("click", () => { state.quranFont = Math.min(48, state.quranFont + 2); save(); applySiteFont(); });

// ===== Header Stats =====
function ensureWirdDate() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.wird.date !== today) {
    state.wird.date = today;
    state.wird.done = 0;
    if (!state.wird.target || state.wird.target < 1) state.wird.target = 20;
    localStorage.setItem("dailyWird", JSON.stringify(state.wird));
  }
}

function renderWirdCard() {
  ensureWirdDate();
  const done = Math.max(0, Number(state.wird.done || 0));
  const target = Math.max(1, Number(state.wird.target || 20));
  const pct = Math.min(100, Math.round((done / target) * 100));
  if (el.wirdTargetLabel) el.wirdTargetLabel.textContent = `الهدف: ${target} آية`;
  if (el.wirdProgressFill) el.wirdProgressFill.style.width = `${pct}%`;
  if (el.wirdProgressText) el.wirdProgressText.textContent = `${done} / ${target} آية`;
  if (el.wirdProgressPercent) el.wirdProgressPercent.textContent = `${pct}%`;
}

function renderQuickAdhkar() {
  if (!el.quickAdhkarList) return;
  const favDhikr = state.favorites.filter(f => f.type === "dhikr").slice(0, 3);
  if (!favDhikr.length) {
    el.quickAdhkarList.innerHTML = `<div class="muted">لا توجد أذكار مفضلة بعد. أضف من قسم الأذكار.</div>`;
    return;
  }
  el.quickAdhkarList.innerHTML = favDhikr.map((d) => `
    <div class="quick-adhkar-item">
      <div class="quick-adhkar-text">${escapeHtml((d.text || "").slice(0, 140))}${(d.text || "").length > 140 ? "..." : ""}</div>
      <div class="quick-adhkar-meta">${escapeHtml(d.category || "ذكر")} • التكرار: ${d.repeat || 1}</div>
      <div class="quick-adhkar-actions">
        <button class="btn" onclick="copyQuickDhikr('${escapeHtml((d.text || "").replace(/'/g, "\\'"))}')">نسخ</button>
      </div>
    </div>
  `).join("");
}

window.copyQuickDhikr = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
};

function toMinutesFromMidnight(t) {
  const clean = cleanTime(t);
  const parts = clean.split(":");
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function updatePrayerReminderFromTimings(timings) {
  if (!el.prayerReminderBanner || !timings) return;
  const schedule = [
    { key: "Fajr", name: "الفجر" },
    { key: "Dhuhr", name: "الظهر" },
    { key: "Asr", name: "العصر" },
    { key: "Maghrib", name: "المغرب" },
    { key: "Isha", name: "العشاء" }
  ].map(p => ({ ...p, min: toMinutesFromMidnight(timings[p.key]) }))
   .filter(p => p.min !== null);

  if (!schedule.length) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  let next = schedule.find(p => p.min > nowMin);
  let diff = 0;

  if (!next) {
    next = schedule[0];
    diff = (24 * 60 - nowMin) + next.min;
  } else {
    diff = next.min - nowMin;
  }

  const hh = Math.floor(diff / 60);
  const mm = diff % 60;
  const remain = hh > 0 ? `${hh}س ${mm}د` : `${mm}د`;

  let prefix = "⏳";
  if (diff <= 10) prefix = "🔔";
  if (diff <= 2) prefix = "🕌";

  el.prayerReminderBanner.style.display = "";
  el.prayerReminderBanner.textContent = `${prefix} الصلاة القادمة: ${next.name} بعد ${remain}`;
}

function updateHeaderStats() {
  if (el.statSurahs) el.statSurahs.textContent = "114";
  const totalTasbeeh = Object.values(state.tasbeehCounts).reduce((a, b) => a + b, 0);
  if (el.statAdhkar) el.statAdhkar.textContent = totalTasbeeh;
  if (el.statFav) el.statFav.textContent = state.favorites.length;
  const lr = parseJsonSafe("lastRead", null);
  if (el.lastReadText) el.lastReadText.textContent = lr ? `آخر قراءة: سورة ${lr.name} - آية ${lr.ayah || 1}` : "لا توجد قراءة محفوظة";
  if (el.lastRead) el.lastRead.textContent = lr ? `${lr.name} - آية ${lr.ayah || 1}` : "—";
  if (el.dailyMessage) el.dailyMessage.textContent = DAILY_MESSAGES[new Date().getDate() % DAILY_MESSAGES.length];
}

// ===== Reciters =====
function renderReciters() {
  if (!el.reciterSelect) return;
  el.reciterSelect.innerHTML = RECITERS.map((r, i) =>
    `<option value="${i}" ${i === state.currentReciterIdx ? "selected" : ""}>${r.name}</option>`
  ).join("");
}
if (el.reciterSelect) el.reciterSelect.addEventListener("change", () => { state.currentReciterIdx = Number(el.reciterSelect.value); save(); });

// ===== Surah List =====
function renderSurahList() {
  if (!el.surahList) return;
  const q = (el.surahSearch ? el.surahSearch.value.trim() : "");
  const filtered = SURAHS.map((name, idx) => ({ number: idx + 1, name }))
    .filter(s => !q || s.name.includes(q) || String(s.number).includes(q));
  el.surahList.innerHTML = filtered.map(s => {
    const type = MADANI.has(s.number) ? "مدنية" : "مكية";
    const typeClass = MADANI.has(s.number) ? "badge-madani" : "badge-makki";
    return `<div class="surah-card" onclick="openSurah(${s.number})">
      <div class="surah-num">${s.number}</div>
      <div class="surah-info">
        <div class="surah-name">${s.name}</div>
        <span class="surah-badge ${typeClass}">${type}</span>
      </div>
      <span class="surah-open">&#8594;</span>
    </div>`;
  }).join("");
  renderQuickAdhkar();
}
function openSurah(n) { window.location.href = `surah.html?surah=${n}&reciter=${state.currentReciterIdx}`; }
window.openSurah = openSurah;
if (el.surahSearch) el.surahSearch.addEventListener("input", renderSurahList);

// ===== Adhkar Card Navigation =====
async function loadAdhkar() {
  if (el.adhkarLoading) el.adhkarLoading.textContent = "جاري تحميل الأذكار...";
  try {
    const res = await fetch("./data/adhkar.local.json");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        // Normalize: each category value should be an array of objects
        const normalized = {};
        for (const [cat, items] of Object.entries(data)) {
          if (!Array.isArray(items)) continue;
          const flat = [];
          for (const item of items) {
            if (Array.isArray(item)) { item.forEach(i => { if (i && i.content) flat.push({zekr: cleanAdhkarContent(i.content), count: i.count || "1", description: i.description || ""}); }); }
            else if (item && item.content) flat.push({zekr: cleanAdhkarContent(item.content), count: item.count || "1", description: item.description || ""});
            else if (item && item.zekr) flat.push(item);
          }
          if (flat.length) normalized[cat] = flat;
        }
        if (Object.keys(normalized).length > 0) { state.adhkarData = normalized; }
      }
    }
  } catch {}
  if (!state.adhkarData) state.adhkarData = ADHKAR_FALLBACK;
  if (el.adhkarLoading) el.adhkarLoading.textContent = "";
  renderAdhkarCategoryTabs();
}

function renderAdhkarCategoryTabs() {
  if (!el.adhkarCategoryTabs || !state.adhkarData) return;
  const cats = Object.keys(state.adhkarData);
  state.currentAdhkarCategory = cats[0] || "";
  state.currentDhikrIdx = 0;
  el.adhkarCategoryTabs.innerHTML = cats.map((c, i) =>
    `<button class="adhkar-cat-btn ${i === 0 ? "active" : ""}" data-cat="${escapeHtml(c)}">${c}</button>`
  ).join("");
  el.adhkarCategoryTabs.querySelectorAll(".adhkar-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      el.adhkarCategoryTabs.querySelectorAll(".adhkar-cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentAdhkarCategory = btn.dataset.cat;
      state.currentDhikrIdx = 0;
      renderDhikrCard();
    });
  });
  renderDhikrCard();
}

function getCurrentDhikrList() {
  return (state.adhkarData && state.adhkarData[state.currentAdhkarCategory]) || [];
}

function renderDhikrCard() {
  const list = getCurrentDhikrList();
  if (!list.length) return;
  const idx = Math.max(0, Math.min(state.currentDhikrIdx, list.length - 1));
  state.currentDhikrIdx = idx;
  const d = list[idx];
  const text = d.zekr || d.text || "";
  const desc = d.description || d.desc || "";
  const count = d.count || d.repeat || "1";
  if (el.dhikrCounter) el.dhikrCounter.textContent = `${idx + 1} / ${list.length}`;
  if (el.dhikrCardText) el.dhikrCardText.textContent = text;
  if (el.dhikrCardDesc) { el.dhikrCardDesc.textContent = desc; el.dhikrCardDesc.style.display = desc ? "" : "none"; }
  if (el.dhikrCardRepeat) el.dhikrCardRepeat.textContent = `التكرار: ${count} مرة`;
  const isFav = isDhikrFavorited(text, state.currentAdhkarCategory);
  if (el.dhikrFavBtn) {
    el.dhikrFavBtn.textContent = isFav ? "❤️ في المفضلة" : "🤍 مفضلة";
    el.dhikrFavBtn.classList.toggle("fav-active", isFav);
  }
}

function isDhikrFavorited(text, cat) {
  return state.favorites.some(f => f.type === "dhikr" && f.text === text && f.category === cat);
}

if (el.dhikrPrevBtn) el.dhikrPrevBtn.addEventListener("click", () => {
  const list = getCurrentDhikrList();
  state.currentDhikrIdx = (state.currentDhikrIdx - 1 + list.length) % list.length;
  renderDhikrCard();
});
if (el.dhikrNextBtn) el.dhikrNextBtn.addEventListener("click", () => {
  const list = getCurrentDhikrList();
  state.currentDhikrIdx = (state.currentDhikrIdx + 1) % list.length;
  renderDhikrCard();
});
if (el.dhikrFavBtn) el.dhikrFavBtn.addEventListener("click", () => {
  const list = getCurrentDhikrList();
  const d = list[state.currentDhikrIdx];
  if (!d) return;
  const text = d.zekr || d.text || "";
  const count = Number(d.count || d.repeat || 1);
  const cat = state.currentAdhkarCategory;
  const idx = state.favorites.findIndex(f => f.type === "dhikr" && f.text === text && f.category === cat);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.unshift({ type: "dhikr", text, repeat: count, category: cat, savedAt: new Date().toISOString() });
  save();
  renderDhikrCard();
  updateHeaderStats();
});

// ===== Prayer Times =====
function cleanTime(t) { return (t || "").replace(/\s*\(.*\)/, "").trim(); }

function to12h(t) {
  const clean = cleanTime(t);
  const parts = clean.split(":");
  if (parts.length < 2) return clean;
  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, "0");
  if (isNaN(h)) return clean;
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

function renderPrayersData(data, cityLabel) {
  const t = data.timings;
  const d = data.date;
  let dateStr = `${d.hijri.weekday.ar} - ${d.hijri.day} ${d.hijri.month.ar} ${d.hijri.year} هـ`;
  if (cityLabel) dateStr = `📍 ${cityLabel} | ` + dateStr;
  if (el.prayerDate) el.prayerDate.textContent = dateStr;
  const rows = [
    ["الفجر",   to12h(t.Fajr),    "🌅"],
    ["الشروق",  to12h(t.Sunrise), "☀️"],
    ["الظهر",   to12h(t.Dhuhr),   "🌤️"],
    ["العصر",   to12h(t.Asr),     "🌇"],
    ["المغرب",  to12h(t.Maghrib), "🌆"],
    ["العشاء",  to12h(t.Isha),    "🌙"]
  ];
  if (el.prayerList) el.prayerList.innerHTML = rows.map(([n,v,icon]) =>
    `<div class="prayer-item"><span class="prayer-name">${icon} ${n}</span><span class="prayer-time">${v}</span></div>`
  ).join("");
  updatePrayerReminderFromTimings(t);
}

async function autoLocatePrayer() {
  if (!navigator.geolocation) { showManualForm("المتصفح لا يدعم تحديد الموقع."); return; }
  if (el.prayerAutoMsg) { el.prayerAutoMsg.style.display = ""; el.prayerAutoMsg.textContent = "⏳ جاري تحديد موقعك تلقائياً..."; }
  if (el.prayerManualForm) el.prayerManualForm.style.display = "none";
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Reverse geocode to get city name
        let cityLabel = "";
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`, { headers: { "Accept-Language": "ar" } });
          const geoData = await geoRes.json();
          const addr = geoData?.address || {};
          cityLabel = addr.city || addr.town || addr.village || addr.county || addr.state || "";
        } catch {}
        const res = await fetch(API.byCoords(lat, lon));
        const json = await res.json();
        if (json.code === 200 && json.data) {
          renderPrayersData(json.data, cityLabel);
          if (el.prayerAutoMsg) el.prayerAutoMsg.textContent = cityLabel ? `✅ موقعك: ${cityLabel}` : "✅ تم تحديد موقعك تلقائياً";
          if (el.qiblaDirection) el.qiblaDirection.textContent = `اتجاه القبلة: ${calcQibla(lat, lon)}°`;
        } else throw new Error();
      } catch { showManualForm("تعذر تحميل المواقيت. أدخل مدينتك يدوياً:"); }
    },
    () => showManualForm("تعذر تحديد موقعك. أدخل مدينتك يدوياً:")
  );
}

function showManualForm(msg) {
  if (el.prayerAutoMsg) { el.prayerAutoMsg.style.display = ""; el.prayerAutoMsg.textContent = msg; }
  if (el.prayerManualForm) el.prayerManualForm.style.display = "";
}

async function loadPrayerByCity() {
  const city = el.cityInput ? el.cityInput.value.trim() : "";
  const country = el.countryInput ? el.countryInput.value.trim() : "";
  if (!city || !country) { if (el.prayerLoading) el.prayerLoading.textContent = "⚠️ أدخل اسم المدينة والدولة."; return; }
  if (el.prayerLoading) el.prayerLoading.textContent = "⏳ جاري التحميل...";
  if (el.prayerList) el.prayerList.innerHTML = "";
  try {
    const res = await fetch(API.byCity(city, country));
    const json = await res.json();
    if (json.code === 200 && json.data) {
      renderPrayersData(json.data, `${city}، ${country}`);
      if (el.prayerLoading) el.prayerLoading.textContent = "";
    } else throw new Error();
  } catch { if (el.prayerLoading) el.prayerLoading.textContent = "❌ تعذر تحميل المواقيت. تحقق من اسم المدينة والدولة."; }
}
if (el.loadPrayerByCity) el.loadPrayerByCity.addEventListener("click", loadPrayerByCity);
if (el.locatePrayerBtn) el.locatePrayerBtn.addEventListener("click", () => { prayerAutoLocated = false; autoLocatePrayer(); });

// ===== Qibla =====
function calcQibla(lat, lon) {
  const kLat = 21.4225 * Math.PI / 180, kLon = 39.8262 * Math.PI / 180;
  const uLat = lat * Math.PI / 180, uLon = lon * Math.PI / 180;
  const y = Math.sin(kLon - uLon);
  const x = Math.cos(uLat) * Math.tan(kLat) - Math.sin(uLat) * Math.cos(kLon - uLon);
  return (((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360).toFixed(1);
}

// Top-bar locate button
if (el.locateBtn) {
  el.locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      if (el.qiblaDirection) el.qiblaDirection.textContent = `اتجاه القبلة من موقعك: ${calcQibla(lat, lon)}°`;
      try {
        const res = await fetch(API.byCoords(lat, lon));
        const json = await res.json();
        if (json.code === 200 && json.data) renderPrayersData(json.data);
      } catch {}
    });
  });
}

// ===== Tasbeeh Grid =====
function renderTasbeehGrid() {
  if (!el.tasbeehGrid) return;
  el.tasbeehGrid.innerHTML = state.tasbeehItems.map((name, i) => {
    const count = state.tasbeehCounts[name] || 0;
    const isDefault = DEFAULT_TASBEEH.includes(name);
    return `<div class="tasbeeh-item" id="tasbeeh-item-${i}">
      <div class="tasbeeh-name">${escapeHtml(name)}</div>
      <div class="tasbeeh-count" id="tc-${i}">${count}</div>
      <div class="tasbeeh-btns">
        <button class="btn primary tasbeeh-tap" onclick="tapTasbeeh(${i})">تسبيح</button>
        <button class="btn tasbeeh-reset" onclick="resetTasbeeh(${i})">↺</button>
        ${!isDefault ? `<button class="btn tasbeeh-del" onclick="delTasbeeh(${i})">✕</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

function tapTasbeeh(i) {
  const name = state.tasbeehItems[i];
  if (!name) return;
  state.tasbeehCounts[name] = (state.tasbeehCounts[name] || 0) + 1;
  save();
  const el2 = document.getElementById(`tc-${i}`);
  if (el2) { el2.textContent = state.tasbeehCounts[name]; el2.classList.add("tasbeeh-pulse"); setTimeout(() => el2.classList.remove("tasbeeh-pulse"), 300); }
  updateHeaderStats();
}
function resetTasbeeh(i) {
  const name = state.tasbeehItems[i];
  if (!name) return;
  state.tasbeehCounts[name] = 0;
  save();
  const el2 = document.getElementById(`tc-${i}`);
  if (el2) el2.textContent = "0";
  updateHeaderStats();
}
function delTasbeeh(i) {
  const name = state.tasbeehItems[i];
  state.tasbeehItems.splice(i, 1);
  delete state.tasbeehCounts[name];
  save();
  renderTasbeehGrid();
}
window.tapTasbeeh = tapTasbeeh;
window.resetTasbeeh = resetTasbeeh;
window.delTasbeeh = delTasbeeh;

if (el.addCustomTasbeehBtn) {
  el.addCustomTasbeehBtn.addEventListener("click", () => {
    if (el.addCustomForm) el.addCustomForm.style.display = el.addCustomForm.style.display === "none" ? "" : "none";
    if (el.customTasbeehInput) el.customTasbeehInput.focus();
  });
}
if (el.saveCustomTasbeehBtn) {
  el.saveCustomTasbeehBtn.addEventListener("click", () => {
    const val = el.customTasbeehInput ? el.customTasbeehInput.value.trim() : "";
    if (!val) return;
    if (!state.tasbeehItems.includes(val)) { state.tasbeehItems.push(val); save(); renderTasbeehGrid(); }
    if (el.addCustomForm) el.addCustomForm.style.display = "none";
    if (el.customTasbeehInput) el.customTasbeehInput.value = "";
  });
}
if (el.cancelCustomTasbeehBtn) {
  el.cancelCustomTasbeehBtn.addEventListener("click", () => {
    if (el.addCustomForm) el.addCustomForm.style.display = "none";
    if (el.customTasbeehInput) el.customTasbeehInput.value = "";
  });
}

// ===== Favorites =====
let currentFavFilter = "all";

function removeFavorite(idx) {
  state.favorites = parseJsonSafe("favorites", []);
  state.favorites.splice(idx, 1);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
  save();
  renderFavorites();
  updateHeaderStats();
}
window.removeFavorite = removeFavorite;

function openFavSurah(number, ayah, reciterIdx) {
  window.location.href = `surah.html?surah=${number}&ayah=${ayah || 1}&reciter=${reciterIdx || 0}`;
}
window.openFavSurah = openFavSurah;

function renderFavorites() {
  state.favorites = parseJsonSafe("favorites", []);
  if (!el.favoritesList) return;
  const filtered = currentFavFilter === "all" ? state.favorites : state.favorites.filter(f => f.type === currentFavFilter);
  if (!filtered.length) {
    el.favoritesList.innerHTML = `<div class="fav-empty">⭐ لا توجد مفضلة بعد.</div>`;
    return;
  }
  el.favoritesList.innerHTML = filtered.map(f => {
    const realIdx = state.favorites.indexOf(f);
    if (f.type === "surah") return `
      <div class="fav-item" onclick="openFavSurah(${f.number},${f.ayah||1},${f.reciterIdx||0})">
        <div class="fav-item-icon">📖</div>
        <div class="fav-item-body">
          <div class="fav-item-title">سورة ${escapeHtml(f.name||"")}</div>
          <div class="fav-item-meta">آية ${f.ayah||1}</div>
        </div>
        <button class="btn fav-remove-btn" onclick="event.stopPropagation();removeFavorite(${realIdx})">✕</button>
      </div>`;
    if (f.type === "dhikr") return `
      <div class="fav-item">
        <div class="fav-item-icon">🤲</div>
        <div class="fav-item-body">
          <div class="fav-item-title">${escapeHtml((f.text||"").substring(0,80))}${(f.text||"").length>80?"...":""}</div>
          <div class="fav-item-meta">${escapeHtml(f.category||"")} • التكرار: ${f.repeat||1}</div>
        </div>
        <button class="btn fav-remove-btn" onclick="removeFavorite(${realIdx})">✕</button>
      </div>`;
    return "";
  }).join("");
}

document.querySelectorAll(".fav-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".fav-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFavFilter = btn.dataset.favtype || "all";
    renderFavorites();
  });
});

// ===== Continue Reading =====
const continueReadBtn = document.getElementById("continueReadBtn");
if (continueReadBtn) {
  continueReadBtn.addEventListener("click", () => {
    const lr = parseJsonSafe("lastRead", null);
    if (lr && lr.number) window.location.href = `surah.html?surah=${lr.number}&ayah=${lr.ayah||1}&reciter=${lr.reciterIdx||state.currentReciterIdx}`;
    else switchTab("quran");
  });
}

if (el.wirdAddOneBtn) {
  el.wirdAddOneBtn.addEventListener("click", () => {
    ensureWirdDate();
    state.wird.done += 1;
    localStorage.setItem("dailyWird", JSON.stringify(state.wird));
    renderWirdCard();
  });
}
if (el.wirdAddFiveBtn) {
  el.wirdAddFiveBtn.addEventListener("click", () => {
    ensureWirdDate();
    state.wird.done += 5;
    localStorage.setItem("dailyWird", JSON.stringify(state.wird));
    renderWirdCard();
  });
}
if (el.wirdResetBtn) {
  el.wirdResetBtn.addEventListener("click", () => {
    ensureWirdDate();
    state.wird.done = 0;
    localStorage.setItem("dailyWird", JSON.stringify(state.wird));
    renderWirdCard();
  });
}

if (el.openAdhkarTabBtn) {
  el.openAdhkarTabBtn.addEventListener("click", () => switchTab("adhkar"));
}

// ===== Text Color Settings =====
const textColorPicker = document.getElementById("textColorPicker");
const saveTextColorBtn = document.getElementById("saveTextColor");
const resetTextColorBtn = document.getElementById("resetTextColor");
const textColorPreview = document.getElementById("textColorPreview");

if (textColorPicker) {
  textColorPicker.addEventListener("input", () => {
    // Live preview on Quran text only
    if (textColorPreview) textColorPreview.style.color = textColorPicker.value;
  });
}
if (saveTextColorBtn) {
  saveTextColorBtn.addEventListener("click", () => {
    const color = textColorPicker ? textColorPicker.value : "";
    localStorage.setItem("textColor", color);
    applyTextColor();
    saveTextColorBtn.textContent = "✅ تم الحفظ";
    setTimeout(() => { saveTextColorBtn.textContent = "💾 حفظ"; }, 1500);
  });
}
if (resetTextColorBtn) {
  resetTextColorBtn.addEventListener("click", () => {
    localStorage.removeItem("textColor");
    document.documentElement.style.removeProperty("--quran-text-color");
    if (textColorPicker) textColorPicker.value = "#e8f5ee";
    if (textColorPreview) textColorPreview.style.color = "";
  });
}

// ===== Continue Reading Popup =====
function showContinueReadingPopup() {
  const lr = parseJsonSafe("lastRead", null);
  if (!lr || !lr.number) return;
  if (sessionStorage.getItem("continuePopupShown") === "1") return;
  sessionStorage.setItem("continuePopupShown", "1");

  const popup = document.getElementById("continueReadingPopup");
  const surahEl = document.getElementById("continuePopupSurah");
  const yesBtn = document.getElementById("continuePopupYes");
  const noBtn = document.getElementById("continuePopupNo");
  if (!popup) return;

  if (surahEl) surahEl.textContent = `سورة ${lr.name} — آية ${lr.ayah || 1}`;
  popup.style.display = "flex";

  function closePopup() { popup.style.display = "none"; }

  if (yesBtn) yesBtn.onclick = () => {
    closePopup();
    window.location.href = `surah.html?surah=${lr.number}&ayah=${lr.ayah||1}&reciter=${lr.reciterIdx||state.currentReciterIdx}`;
  };
  if (noBtn) noBtn.onclick = closePopup;
  popup.addEventListener("click", e => { if (e.target === popup) closePopup(); });
}

// ===== Prayer Notifications =====
let _notifTimeouts = [];

function clearPrayerNotifTimeouts() {
  _notifTimeouts.forEach(t => clearTimeout(t));
  _notifTimeouts = [];
}

function schedulePrayerNotifications(timings) {
  clearPrayerNotifTimeouts();
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const prayers = [
    { key:"Fajr", name:"الفجر" }, { key:"Dhuhr", name:"الظهر" },
    { key:"Asr", name:"العصر" }, { key:"Maghrib", name:"المغرب" }, { key:"Isha", name:"العشاء" }
  ];
  const now = new Date();
  prayers.forEach(p => {
    const raw = cleanTime(timings[p.key]);
    if (!raw) return;
    const parts = raw.split(":");
    if (parts.length < 2) return;
    const pt = new Date();
    pt.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    const diff = pt - now;
    if (diff > 0 && diff < 24 * 3600 * 1000) {
      _notifTimeouts.push(setTimeout(() => {
        try {
          new Notification("🕌 حان وقت الصلاة", {
            body: `حان الآن وقت صلاة ${p.name}`,
            icon: "favicon.svg",
            tag: `prayer-${p.key}`,
            requireInteraction: false
          });
        } catch {}
      }, diff));
    }
  });
}

function initNotificationTip() {
  const tip = document.getElementById("notificationTip");
  const enableBtn = document.getElementById("enableNotifBtn");
  const dismissBtn = document.getElementById("dismissNotifBtn");
  if (!tip) return;

  if (!("Notification" in window) || localStorage.getItem("notifDismissed") === "1") {
    tip.style.display = "none";
    return;
  }
  if (Notification.permission === "granted") {
    tip.style.display = "none";
    return;
  }
  if (Notification.permission === "denied") {
    tip.style.display = "none";
    return;
  }

  tip.style.display = "";

  if (enableBtn) enableBtn.onclick = async () => {
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      tip.style.display = "none";
      enableBtn.textContent = "✅ تم التفعيل";
    } else {
      tip.style.display = "none";
      localStorage.setItem("notifDismissed", "1");
    }
  };
  if (dismissBtn) dismissBtn.onclick = () => {
    tip.style.display = "none";
    localStorage.setItem("notifDismissed", "1");
  };
}

// ===== Splash Screen =====
function initSplash() {
  const splash = document.getElementById("splashScreen");
  if (!splash) return;

  const SPLASH_KEY = "splashShownSession";
  if (sessionStorage.getItem(SPLASH_KEY) === "1") {
    splash.style.display = "none";
    return;
  }

  // Auto-dismiss after 3.2 seconds
  const SPLASH_DURATION = 3200;

  function hideSplash() {
    sessionStorage.setItem(SPLASH_KEY, "1");
    splash.classList.add("splash-hide");
    splash.addEventListener("animationend", () => {
      splash.style.display = "none";
    }, { once: true });
  }

  // Tap/click to dismiss early
  splash.addEventListener("click", hideSplash, { once: true });

  // Auto dismiss
  setTimeout(hideSplash, SPLASH_DURATION);
}

// ===== Boot =====
async function boot() {
  initSplash();
  applyTheme();
  renderReciters();
  renderSurahList();
  state.favorites = parseJsonSafe("favorites", []);
  state.lastRead = parseJsonSafe("lastRead", null);
  ensureWirdDate();
  updateHeaderStats();
  renderWirdCard();
  renderFavorites();
  renderQuickAdhkar();
  renderTasbeehGrid();
  initNotificationTip();
  await loadAdhkar();
  // Show continue reading popup after splash finishes
  const splashAlreadyDone = sessionStorage.getItem("splashShownSession") === "1";
  setTimeout(() => showContinueReadingPopup(), splashAlreadyDone ? 400 : 3600);
}
boot();
