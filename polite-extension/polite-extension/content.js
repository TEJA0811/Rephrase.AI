// Rephrase endpoint
const API_ENDPOINT = "https://0ec2-141-44-228-191.ngrok-free.app/rephrase";
// Usage endpoint
const USAGE_ENDPOINT = "https://0ec2-141-44-228-191.ngrok-free.app/usage";

/* ───────── stable anonymous id ───────── */
let anonId = null;
chrome.storage.local.get("anonId", (result) => {
  anonId = result.anonId ?? crypto.randomUUID();
  chrome.storage.local.set({ anonId });
});

let debounceTimer = null;
const DEBOUNCE_MS = 500;

/* ---- caches so click-handler can log ---- */
let lastTone = "neutral";
let lastOriginal = null;
let lastRephrased = null;

/* Wait for Slack editable box */
const waitForInput = setInterval(() => {
  const input = document.querySelector(
    'div.ql-editor[contenteditable="true"][role="textbox"]'
  );
  if (input) {
    clearInterval(waitForInput);
    setupSuggestionUI(input);
  }
}, 1000);

function setupSuggestionUI(input) {
  const suggestionBox = document.createElement("div");
  Object.assign(suggestionBox.style, {
    position: "absolute",
    maxWidth: "400px",
    background: "#fff",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    zIndex: "10000",
    display: "none",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#333",
    userSelect: "none",
  });
  document.body.appendChild(suggestionBox);

  /* ───────── request rephrase on input ───────── */
  input.addEventListener("input", () => {
    const text = input.innerText.trim();
    if (!text) return (suggestionBox.style.display = "none");

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ message: text }),
      })
        .then((r) => r.json())
        .then((data) => {
          const suggestion = data.rephrased;
          if (!suggestion) return (suggestionBox.style.display = "none");

          /* ---- cache fields for /usage ---- */
          lastOriginal = data.original;
          lastRephrased = suggestion;
          lastTone = data.tone || "neutral"; // ← never undefined/null

          suggestionBox.textContent = suggestion;
          suggestionBox.style.display = "block";
          const rect = input.getBoundingClientRect();
          suggestionBox.style.left = rect.left + window.scrollX + "px";
          suggestionBox.style.top =
            rect.top + window.scrollY - suggestionBox.offsetHeight - 8 + "px";
        })
        .catch(() => (suggestionBox.style.display = "none"));
    }, DEBOUNCE_MS);
  });

  /* ───────── hide box on Enter (send) ───────── */
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) suggestionBox.style.display = "none";
  });

  /* ───────── accept suggestion on click ───────── */
  suggestionBox.addEventListener("click", () => {
    input.innerText = suggestionBox.innerText;

    /* place caret at end */
    const r = document.createRange();
    const s = window.getSelection();
    r.selectNodeContents(input);
    r.collapse(false);
    s.removeAllRanges();
    s.addRange(r);
    input.focus();

    suggestionBox.style.display = "none";

    /* ---- log usage ---- */
    fetch(USAGE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        ts: Date.now(),
        user: anonId,
        tone: lastTone,
        original: lastOriginal,
        rephrased: lastRephrased,
      }),
      keepalive: true,
    }).catch(() => {});
  });
}
