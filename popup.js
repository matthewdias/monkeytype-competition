const button = document.getElementById("clear");
button.addEventListener("click", async () => {
  if (confirm("Are you sure you want to clear the leaderboard?")) {
    await chrome.storage.local.set({ leaderboard: [] });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  }
});
