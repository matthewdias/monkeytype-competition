const afterDOMLoaded = async () => {
  const { leaderboard } = await chrome.storage.local.get(["leaderboard"]);

  displayLeaderboard(leaderboard);
  disableSettings();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", afterDOMLoaded);
} else {
  afterDOMLoaded();
}

chrome.storage.onChanged.addListener((changes) => {
  const {
    leaderboard: { newValue: leaderboard },
  } = changes;

  displayLeaderboard(leaderboard);
});

const displayLeaderboard = (leaderboard) => {
  leaderboard.sort(compareEntries);

  const result = document.querySelector("#result");
  let leaderboardEl = result.querySelector("#leaderboard");

  if (!leaderboardEl) {
    leaderboardEl = document.createElement("div");
    leaderboardEl.id = "leaderboard";
    result.appendChild(leaderboardEl);
  }

  if (leaderboard.length > 0) {
    leaderboardEl.innerHTML =
      "<h2>Leaderboard</h2>" +
      leaderboard
        .map(
          ({ name, wpm, accuracy }, index) =>
            `<div>${
              index + 1
            }. ${name} - wpm: ${wpm}, accuracy: ${accuracy}%</div>`
        )
        .join("");
  }
};

const disableSettings = () => {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Tab" ||
        (event.key === "p" &&
          event.shiftKey === true &&
          (event.metaKey === true || event.ctrlKey === true))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  document.querySelector("#commandLineMobileButton").style.visibility =
    "hidden";
  document.querySelector(".view-settings").style.display = "none";
  document.querySelector(".signInOut").style.display = "none";
  document.querySelector("#testConfig").style.pointerEvents = "none";
  document.querySelector("#testModesNotice").style.pointerEvents = "none";
  document.querySelector("#restartTestButtonWithSameWordset").style.display =
    "none";
  document.querySelector("#practiseWordsButton").style.display = "none";
  document.querySelector("#showWordHistoryButton").style.display = "none";
  document.querySelector("#saveScreenshotButton").style.display = "none";
  document.querySelector(".loginTip").style.display = "none";

  document.querySelector(".keyTips").innerHTML =
    "<key>esc</key>  - restart test";
};

const compareEntries = (a, b) => {
  if (a.wpm === b.wpm) {
    return b.accuracy - a.accuracy;
  } else return b.wpm - a.wpm;
};

let finished = false;

setInterval(async () => {
  const result = document.querySelector("#result:not(.hidden)");

  if (result) {
    if (!finished) {
      finished = true;

      const wpmEl = result.querySelector(".stats .group.wpm .bottom");
      const accEl = result.querySelector(".stats .group.acc .bottom");
      const wpm = wpmEl.textContent;
      const accuracy = parseFloat(accEl.textContent);

      const name = prompt(
        "Please enter your name to submit, or click Cancel to try again:"
      );

      if (name) {
        const newEntry = { name, wpm, accuracy };
        let { leaderboard } = await chrome.storage.local.get(["leaderboard"]);

        if (isEmpty(leaderboard)) {
          leaderboard = [];
        }

        const existingEntryIndex = leaderboard.findIndex(
          (entry) => entry.name === name
        );

        if (existingEntryIndex !== -1) {
          if (compareEntries(leaderboard[existingEntryIndex], newEntry) > 0) {
            leaderboard[existingEntryIndex] = newEntry;
          }
        } else {
          leaderboard.push(newEntry);
        }

        chrome.storage.local.set({ leaderboard });
      } else {
        document.querySelector("#nextTestButton").click();
      }
    }
  } else {
    finished = false;
  }
}, 1500);

const isEmpty = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;
