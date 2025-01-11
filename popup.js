document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const codeElement = document.getElementById("code");
  const resultElement = document.getElementById("result");
  const languageElement = document.getElementById("language");

  // Clear previous content
  statusElement.textContent = "Waiting for submission details...";
  codeElement.textContent = "";
  resultElement.textContent = "";
  languageElement.textContent = "";

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updatePopup") {
      const { submissionId, submissionCode, result, language } = message;

      // Update the popup with the latest submission details and endpoint result
      if (submissionId && submissionCode) {
        statusElement.textContent = `Submission ${submissionId} Accepted!`;
        codeElement.textContent = submissionCode;
      } else {
        statusElement.textContent = "No recent submission found.";
      }

      if (language) {
        languageElement.textContent = `Language: ${language}`;
      } else {
        languageElement.textContent = "Language: Not available";
      }

      // Check if the result is an object and handle it accordingly
      if (result) {
        if (typeof result === 'object' && result.result) {
          resultElement.textContent = result.result; // Display the Big-O result text
        } else {
          resultElement.textContent = "Big-O result not available";
        }
      } else {
        resultElement.textContent = "Big-O result not available";
      }
    }
  });
});
