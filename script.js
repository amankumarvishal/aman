// script.js
let timer = null;
let seconds = 0;
let startTime = 0;
let textToType = document.getElementById("text");
let userInput = document.getElementById("user-input");
let timerDisplay = document.getElementById("timer");
let accuracyDisplay = document.getElementById("accuracy");
let wpmDisplay = document.getElementById("wpm");

let totalWords = textToType.textContent.split(" ").length;

function startPractice() {
  userInput.value = "";
  userInput.disabled = false;
  startTime = Date.now();
  seconds = 0;
  timerDisplay.textContent = seconds;
  accuracyDisplay.textContent = "100%";
  wpmDisplay.textContent = "0";
  userInput.focus();

  // Start the timer
  timer = setInterval(function () {
    seconds++;
    timerDisplay.textContent = seconds;
  }, 1000);
}

function checkInput() {
  let typedText = userInput.value;
  let correctText = textToType.textContent.slice(0, typedText.length);

  // Check for correct typing
  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === correctText[i]) {
      correctChars++;
    }
  }

  // Update accuracy
  let accuracy = (correctChars / typedText.length) * 100;
  accuracyDisplay.textContent = `${accuracy.toFixed(2)}%`;

  // Check for completion
  if (typedText === textToType.textContent) {
    clearInterval(timer);  // Stop the timer
    userInput.disabled = true;
    let totalTime = (Date.now() - startTime) / 1000; // Time in seconds
    let wordsTyped = typedText.split(" ").length;
    let wpm = Math.floor((wordsTyped / totalTime) * 60); // Calculate WPM
    wpmDisplay.textContent = wpm;
    alert(`Practice completed! WPM: ${wpm}`);
  }
}
