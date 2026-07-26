// Get the HTML elements that the app needs.
const textBox = document.getElementById("text");
const languageMenu = document.getElementById("language");
const voiceMenu = document.getElementById("voice");
const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");
const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const counter = document.getElementById("counter");
const statusMessage = document.getElementById("status");

const speakButton = document.getElementById("speakButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const stopButton = document.getElementById("stopButton");
const clearButton = document.getElementById("clearButton");

let availableVoices = [];

/*
  Twi voice settings.

  Normal browser voices come from the user's device. Twi uses a separate
  open-source Akan speech model because most devices do not include a Twi
  system voice. The model is downloaded only when the user first selects Twi
  and presses Speak.
*/
const twiModelName = "onnx-community/mms-tts-aka-ONNX";
const transformersLibrary =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

let twiSpeechMaker = null;
let twiAudioContext = null;
let twiAudioSource = null;

/*
  ISO 639-1 language codes.

  The codes are used internally by the browser. Users will see full language
  names in the menu, not these abbreviations.
*/
const languageCodes = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
  "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce",
  "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee",
  "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr",
  "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr",
  "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is",
  "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn",
  "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln",
  "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms",
  "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv",
  "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu",
  "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk",
  "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta",
  "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw",
  "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi",
  "yo", "za", "zh", "zu"
];

/*
  Full names for every language in the menu.

  The app uses the short codes internally, but it never displays them to the
  user. This also works in browsers that do not support Intl.DisplayNames.
*/
const languageNames = {
  aa: "Afar", ab: "Abkhazian", ae: "Avestan", af: "Afrikaans",
  ak: "Akan (Ghana)", am: "Amharic", an: "Aragonese", ar: "Arabic",
  as: "Assamese", av: "Avaric", ay: "Aymara", az: "Azerbaijani",
  ba: "Bashkir", be: "Belarusian", bg: "Bulgarian", bh: "Bihari",
  bi: "Bislama", bm: "Bambara", bn: "Bengali", bo: "Tibetan",
  br: "Breton", bs: "Bosnian", ca: "Catalan", ce: "Chechen",
  ch: "Chamorro", co: "Corsican", cr: "Cree", cs: "Czech",
  cu: "Church Slavonic", cv: "Chuvash", cy: "Welsh", da: "Danish",
  de: "German", dv: "Divehi", dz: "Dzongkha", ee: "Ewe (Ghana)",
  el: "Greek", en: "English", eo: "Esperanto", es: "Spanish",
  et: "Estonian", eu: "Basque", fa: "Persian", ff: "Fulah",
  fi: "Finnish", fj: "Fijian", fo: "Faroese", fr: "French",
  fy: "Western Frisian", ga: "Irish", gd: "Scottish Gaelic", gl: "Galician",
  gn: "Guarani", gu: "Gujarati", gv: "Manx", ha: "Hausa",
  he: "Hebrew", hi: "Hindi", ho: "Hiri Motu", hr: "Croatian",
  ht: "Haitian Creole", hu: "Hungarian", hy: "Armenian", hz: "Herero",
  ia: "Interlingua", id: "Indonesian", ie: "Interlingue", ig: "Igbo",
  ii: "Sichuan Yi", ik: "Inupiaq", io: "Ido", is: "Icelandic",
  it: "Italian", iu: "Inuktitut", ja: "Japanese", jv: "Javanese",
  ka: "Georgian", kg: "Kongo", ki: "Kikuyu", kj: "Kuanyama",
  kk: "Kazakh", kl: "Kalaallisut", km: "Khmer", kn: "Kannada",
  ko: "Korean", kr: "Kanuri", ks: "Kashmiri", ku: "Kurdish",
  kv: "Komi", kw: "Cornish", ky: "Kyrgyz", la: "Latin",
  lb: "Luxembourgish", lg: "Ganda", li: "Limburgish", ln: "Lingala",
  lo: "Lao", lt: "Lithuanian", lu: "Luba-Katanga", lv: "Latvian",
  mg: "Malagasy", mh: "Marshallese", mi: "Māori", mk: "Macedonian",
  ml: "Malayalam", mn: "Mongolian", mr: "Marathi", ms: "Malay",
  mt: "Maltese", my: "Burmese", na: "Nauru", nb: "Norwegian Bokmål",
  nd: "North Ndebele", ne: "Nepali", ng: "Ndonga", nl: "Dutch",
  nn: "Norwegian Nynorsk", no: "Norwegian", nr: "South Ndebele",
  nv: "Navajo", ny: "Chichewa", oc: "Occitan", oj: "Ojibwe",
  om: "Oromo", or: "Odia", os: "Ossetian", pa: "Punjabi",
  pi: "Pali", pl: "Polish", ps: "Pashto", pt: "Portuguese",
  qu: "Quechua", rm: "Romansh", rn: "Rundi", ro: "Romanian",
  ru: "Russian", rw: "Kinyarwanda", sa: "Sanskrit", sc: "Sardinian",
  sd: "Sindhi", se: "Northern Sami", sg: "Sango", si: "Sinhala",
  sk: "Slovak", sl: "Slovenian", sm: "Samoan", sn: "Shona",
  so: "Somali", sq: "Albanian", sr: "Serbian", ss: "Swati",
  st: "Southern Sotho", su: "Sundanese", sv: "Swedish", sw: "Swahili",
  ta: "Tamil", te: "Telugu", tg: "Tajik", th: "Thai",
  ti: "Tigrinya", tk: "Turkmen", tl: "Filipino", tn: "Tswana",
  to: "Tongan", tr: "Turkish", ts: "Tsonga", tt: "Tatar",
  tw: "Twi (Ghana)", ty: "Tahitian", ug: "Uyghur", uk: "Ukrainian",
  ur: "Urdu", uz: "Uzbek", ve: "Venda", vi: "Vietnamese",
  vo: "Volapük", wa: "Walloon", wo: "Wolof", xh: "Xhosa",
  yi: "Yiddish", yo: "Yoruba", za: "Zhuang", zh: "Chinese",
  zu: "Zulu"
};

/*
  Return only a full language name. Internal codes are never shown on screen.
*/
function getFullLanguageName(languageCode) {
  return languageNames[languageCode] || "Other language";
}

// Show the number of characters entered by the user.
function updateCounter() {
  counter.textContent = textBox.value.length + " / 5000";
}

/*
  Load the voices supplied by the browser or operating system.

  The voiceschanged event below calls this function again because some
  browsers load their voice list a few moments after the page opens.
*/
function loadBrowserVoices() {
  availableVoices = window.speechSynthesis.getVoices();
  languageMenu.innerHTML = "";

  // Keep Ghanaian languages first, then sort the remaining languages by name.
  const ghanaLanguages = ["ak", "ee", "tw"];
  const sortedLanguages = languageCodes.slice().sort(function (first, second) {
    const firstIsGhanaian = ghanaLanguages.includes(first);
    const secondIsGhanaian = ghanaLanguages.includes(second);

    if (firstIsGhanaian && !secondIsGhanaian) return -1;
    if (!firstIsGhanaian && secondIsGhanaian) return 1;

    return getFullLanguageName(first).localeCompare(getFullLanguageName(second));
  });

  sortedLanguages.forEach(function (language) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = getFullLanguageName(language);
    languageMenu.appendChild(option);
  });

  // Select English when it is available.
  languageMenu.value = "en";
  loadVoicesForLanguage();
}

/*
  Show only voices that match the chosen language.

  A voice may use a regional code such as "en-US". Splitting at the hyphen
  lets it match the main language code "en".
*/
function loadVoicesForLanguage() {
  voiceMenu.innerHTML = "";

  const matchingVoices = availableVoices.filter(function (voice) {
    const mainLanguageCode = voice.lang.toLowerCase().split("-")[0];
    return mainLanguageCode === languageMenu.value;
  });

  /*
    Twi and Akan use the downloadable Ghana voice even when the device has no
    built-in voice for those languages.
  */
  const usesTwiVoice =
    languageMenu.value === "tw" || languageMenu.value === "ak";

  if (usesTwiVoice) {
    const twiOption = document.createElement("option");
    twiOption.value = "twi-ghana-model";
    twiOption.textContent = "Twi Voice (Ghana)";
    voiceMenu.appendChild(twiOption);

    voiceMenu.disabled = false;
    speakButton.disabled = false;
    statusMessage.textContent =
      "Ready. The Twi voice downloads the first time you use it.";
  }

  // Tell the user when their device does not contain a matching voice.
  if (matchingVoices.length === 0 && !usesTwiVoice) {
    const option = document.createElement("option");
    option.textContent = "No voice installed for this language";
    option.value = "";
    voiceMenu.appendChild(option);
    voiceMenu.disabled = true;
    speakButton.disabled = true;
    statusMessage.textContent =
      "Your device has no voice installed for " +
      getFullLanguageName(languageMenu.value) +
      ".";
    return;
  }

  voiceMenu.disabled = false;
  speakButton.disabled = false;

  if (!usesTwiVoice) {
    statusMessage.textContent = "Ready";
  }

  matchingVoices.forEach(function (voice, index) {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = "Voice " + (index + 1);
    voiceMenu.appendChild(option);
  });
}

/*
  Stop audio created by the Twi model.

  Browser speech and Twi model speech use different audio systems, so the app
  stops each one separately.
*/
function stopTwiAudio() {
  if (twiAudioSource) {
    try {
      twiAudioSource.stop();
    } catch (error) {
      // The source may already have finished playing.
    }
    twiAudioSource = null;
  }

  if (twiAudioContext) {
    twiAudioContext.close();
    twiAudioContext = null;
  }
}

/*
  Generate and play real Akan/Twi speech in the browser.

  The first request downloads the model. Later requests use the cached model,
  so they are faster. The generated numbers are placed into an AudioBuffer and
  played through the Web Audio API.
*/
async function speakTwiText(text) {
  window.speechSynthesis.cancel();
  stopTwiAudio();

  try {
    if (!twiSpeechMaker) {
      statusMessage.textContent =
        "Downloading the Twi voice. Please wait...";

      const transformers = await import(transformersLibrary);

      twiSpeechMaker = await transformers.pipeline(
        "text-to-speech",
        twiModelName,
        {
          progress_callback: function (progress) {
            if (
              progress.status === "progress" &&
              typeof progress.progress === "number"
            ) {
              statusMessage.textContent =
                "Downloading Twi voice: " +
                Math.round(progress.progress) +
                "%";
            }
          }
        }
      );
    }

    statusMessage.textContent = "Creating Twi speech...";

    const result = await twiSpeechMaker(text);
    const audioSamples = result.audio.data || result.audio;
    const sampleRate = result.sampling_rate;

    twiAudioContext = new AudioContext({ sampleRate: sampleRate });
    const audioBuffer = twiAudioContext.createBuffer(
      1,
      audioSamples.length,
      sampleRate
    );

    audioBuffer.copyToChannel(audioSamples, 0);

    twiAudioSource = twiAudioContext.createBufferSource();
    twiAudioSource.buffer = audioBuffer;
    twiAudioSource.playbackRate.value = Number(speedSlider.value);

    // Convert the pitch slider value into musical cents.
    twiAudioSource.detune.value =
      1200 * Math.log2(Number(pitchSlider.value));

    twiAudioSource.connect(twiAudioContext.destination);
    twiAudioSource.onended = function () {
      statusMessage.textContent = "Finished";
      twiAudioSource = null;
    };

    twiAudioSource.start();
    statusMessage.textContent = "Speaking Twi...";
  } catch (error) {
    console.error("Twi voice error:", error);
    statusMessage.textContent =
      "The Twi voice could not load. Check your internet connection.";
  }
}

// Read the text using the selected voice and settings.
function speakText() {
  const text = textBox.value.trim();

  if (text === "") {
    statusMessage.textContent = "Please enter some text first.";
    textBox.focus();
    return;
  }

  // Use the special Ghana voice when the user selected it.
  if (voiceMenu.value === "twi-ghana-model") {
    speakTwiText(text);
    return;
  }

  stopTwiAudio();
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  const selectedVoice = availableVoices.find(function (voice) {
    return voice.voiceURI === voiceMenu.value;
  });

  if (selectedVoice) {
    speech.voice = selectedVoice;
    speech.lang = selectedVoice.lang;
  }

  speech.rate = Number(speedSlider.value);
  speech.pitch = Number(pitchSlider.value);

  speech.onstart = function () {
    statusMessage.textContent = "Speaking...";
  };

  speech.onend = function () {
    statusMessage.textContent = "Finished";
  };

  speech.onerror = function () {
    statusMessage.textContent = "The speech could not be played.";
  };

  window.speechSynthesis.speak(speech);
}

// Check whether the browser supports text to speech.
if ("speechSynthesis" in window) {
  loadBrowserVoices();
  window.speechSynthesis.addEventListener(
    "voiceschanged",
    loadBrowserVoices
  );
} else {
  statusMessage.textContent = "Your browser does not support text to speech.";
  speakButton.disabled = true;
}

languageMenu.addEventListener("change", loadVoicesForLanguage);
textBox.addEventListener("input", updateCounter);

speedSlider.addEventListener("input", function () {
  speedValue.textContent = Number(speedSlider.value).toFixed(1) + "×";
});

pitchSlider.addEventListener("input", function () {
  pitchValue.textContent = Number(pitchSlider.value).toFixed(1);
});

speakButton.addEventListener("click", speakText);

pauseButton.addEventListener("click", function () {
  if (voiceMenu.value === "twi-ghana-model" && twiAudioContext) {
    twiAudioContext.suspend();
  } else {
    window.speechSynthesis.pause();
  }
  statusMessage.textContent = "Paused";
});

resumeButton.addEventListener("click", function () {
  if (voiceMenu.value === "twi-ghana-model" && twiAudioContext) {
    twiAudioContext.resume();
  } else {
    window.speechSynthesis.resume();
  }
  statusMessage.textContent = "Speaking...";
});

stopButton.addEventListener("click", function () {
  window.speechSynthesis.cancel();
  stopTwiAudio();
  statusMessage.textContent = "Stopped";
});

clearButton.addEventListener("click", function () {
  window.speechSynthesis.cancel();
  stopTwiAudio();
  textBox.value = "";
  statusMessage.textContent = "Ready";
  updateCounter();
  textBox.focus();
});

updateCounter();
