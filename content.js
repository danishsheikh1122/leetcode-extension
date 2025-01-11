(function () {
  const checkAcceptedText = () => {
    const acceptedText = document.querySelector('span[data-e2e-locator="submission-result"]');

    if (acceptedText && acceptedText.textContent.trim() === "Accepted") {
      console.log("Accepted text is now visible");
      fetchSubmissionDetails();
      observer.disconnect(); // Stop observing
    }
  };

  const fetchSubmissionDetails = () => {
    const urlString = window.location.href;
    const match = urlString.match(/\/submissions\/(\d+)/);

    if (match && match[1]) {
      const submissionId = parseInt(match[1], 10);
      console.log("Extracted submissionId:", submissionId);

      const query = `
        query submissionDetails($submissionId: Int!) {
          submissionDetails(submissionId: $submissionId) {
            code
            lang {
              name
              verboseName
            }
          }
        }
      `;
      const variables = { submissionId };
      const url = "https://leetcode.com/graphql/";
      const headers = {
        "Content-Type": "application/json",
        Accept: "*/*",
        "User-Agent": navigator.userAgent,
      };
      const body = JSON.stringify({ query, variables, operationName: "submissionDetails" });

      fetch(url, { method: "POST", headers, body })
        .then((response) => response.json())
        .then((data) => {
          if (data.data?.submissionDetails) {
            const { code, lang } = data.data.submissionDetails;
            console.log("Extracted Code:", code);
            console.log("Programming Language:", lang.verboseName);

            // Send data to external endpoint
            postToBigOCalcEndpoint(code, lang.verboseName, submissionId, code);
          } else {
            console.error("Details not found in response");
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      console.error("No valid submissionId found in the URL");
    }
  };

  const postToBigOCalcEndpoint = (code, language, submissionId, submissionCode) => {
    const endpointUrl = "https://daleseo-bigocalc.web.val.run";
    const requestBody = JSON.stringify({ code, lang: language });
    const headers = {
      "Content-Type": "application/json",
    };

    fetch(endpointUrl, { method: "POST", headers, body: requestBody })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from BigO Calc Endpoint:", data);

        // Reflect the result in popup.html
        chrome.runtime.sendMessage({
          action: "updatePopup",
          submissionId: submissionId,
          submissionCode: submissionCode,
          language: language,
          result: data,
        });
      })
      .catch((error) => console.error("Error posting to BigO Calc endpoint:", error));
  };

  const observer = new MutationObserver(() => checkAcceptedText());
  observer.observe(document.body, { childList: true, subtree: true });
})();
