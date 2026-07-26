# Text Speaker

Text Speaker is a simple browser-based text-to-speech project made with HTML,
CSS, and JavaScript.

## Project files

- `index.html` contains the page structure and controls.
- `style.css` controls the appearance and responsive layout.
- `script.js` loads languages and voices and controls speech playback.

## How to run the project

1. Open the project folder.
2. Double-click `index.html`.
3. Enter some text.
4. Select a language and an available voice.
5. Press **Speak**.

No installation or account is required.

## How the speech feature works

The project uses the browser's built-in Web Speech API:

```javascript
const speech = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(speech);
```

`SpeechSynthesisUtterance` stores the text, selected voice, speed, and pitch.
`speechSynthesis.speak()` asks the browser to read the text aloud.

## Languages and voices

The menu contains the complete language list and displays readable names such
as **English**, **French**, and **Swahili**. Internal language codes are never
shown to the user.

The Ghanaian options **Akan (Ghana)**, **Ewe (Ghana)**, and **Twi (Ghana)** are
placed at the top of the menu so they are easy to find.

Most languages can be spoken only when the browser or operating system has a
matching voice installed. If no voice is available, the app displays a clear
message and disables the Speak button.

Different devices may therefore show different voices for the same language.

## Twi voice

Twi is handled differently because most browsers and operating systems do not
include a Twi voice.

When **Twi (Ghana)** or **Akan (Ghana)** is selected, the app provides **Twi
Voice (Ghana)**. It uses the open-source
`onnx-community/mms-tts-aka-ONNX` model, based on Meta's Massively Multilingual
Speech Akan model.

The model runs inside the browser using Transformers.js. It downloads when the
user presses Speak for the first time, so the first use needs an internet
connection and may take longer. The browser caches the model for later use.
Text remains on the device while the model generates the audio.

The model is licensed for non-commercial use under CC BY-NC 4.0. A commercial
project would need a voice model or service with suitable commercial terms.

## Main JavaScript functions

- `getFullLanguageName()` changes an internal language code into a full name.
- `updateCounter()` displays the number of characters entered.
- `loadBrowserVoices()` gets the voices supplied by the device.
- `loadVoicesForLanguage()` filters voices using the selected language.
- `speakTwiText()` downloads, generates, and plays Akan/Twi speech.
- `stopTwiAudio()` stops speech created by the Twi model.
- `speakText()` creates and plays the speech.

## Browser support

The standard voices work in current browsers that support the Web Speech API.
The Twi voice needs a modern browser that supports JavaScript modules, the Web
Audio API, and WebAssembly. Chrome and Edge provide the most reliable support.
