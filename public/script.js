// Get DOM elements
const startButton = document.getElementById("start-btn");
const transcriptElement = document.getElementById("transcript");
const aiResponseElement = document.getElementById("ai-response");

// Set up SpeechRecognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Handle button click
startButton.addEventListener("click", () => {
  recognition.start();
  transcriptElement.innerHTML = "Listening...";
  aiResponseElement.innerHTML = "AI Response: Waiting...";
});

// Handle speech recognition result
recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  transcriptElement.innerHTML = `Transcript: ${transcript}`;

  try {
    const response = await fetch('/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: transcript  // This should match the backend field name
      }),
    });

    const data = await response.json();
    aiResponseElement.innerHTML = `AI Response: ${data.generatedText || "No response generated."}`;
  } catch (error) {
    aiResponseElement.innerHTML = "AI Response: Error generating response.";
    console.error("Error:", error);
  }
};

// Handle recognition errors
recognition.onerror = (event) => {
  transcriptElement.innerHTML = `Error: ${event.error}`;
};
