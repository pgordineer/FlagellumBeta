let flags = [];
let currentFlag = {};
let mcCorrectIndex = 0;

// Entry Mode scoring
let entryScore = 0;
let entryTotal = 0;
let entryHighScore = 0;
let entryHighTotal = 0;
let entryStreak = 0;
let entryLongestStreak = 0;
let usedHint = false;

// MC Mode scoring
let mcScore = 0;
let mcTotal = 0;
let mcHighScore = 0;
let mcHighTotal = 0;
let mcStreak = 0;
let mcLongestStreak = 0;
let mcAttempts = 0;
let mcTried = [];

// Reverse Choice Mode scoring
let rcScore = 0;
let rcTotal = 0;
let rcHighScore = 0;
let rcHighTotal = 0;
let rcStreak = 0;
let rcLongestStreak = 0;
let rcAttempts = 0;
let rcTried = [];
let rcCorrectIndex = 0;
let rcOptions = [];
let rcCurrentFlag = {};

// --- Saviour Mode ---
let saviourScore = 0;
let saviourTotal = 0;
let saviourHighScore = 0;
let saviourHighTotal = 0;
let saviourStreak = 0;
let saviourLongestStreak = 0;
let saviourGrid = [];
let saviourHighlightIndex = 12; // Center of 5x5 grid
let saviourActive = [];
const SAVIOUR_GRID_SIZE = 5;
const SAVIOUR_ACTIONS = [
  { name: 'Freeze Ray', icon: '❄️' },
  { name: 'Heat Ray', icon: '🔥' },
  { name: 'Tailor', icon: '✂️' },
  { name: 'Shrink Ray', icon: '🔬' },
  { name: 'Money Bags', icon: '💰' },
  { name: 'Penny Pincher', icon: '🪙' },
  { name: 'Tidal Force', icon: '🌊' },
  { name: 'Landlocked', icon: '🏜️' },
  { name: 'Baby Boomer', icon: '👶' },
  { name: 'Gamma Burst', icon: '☢️' }
];

// --- Saviour Mode Undo/Redo State ---
let saviourActionHistory = [];
let saviourActionPointer = -1;
let saviourUsedActions = [];
let saviourGameOver = false;

// --- Saviour Mode Undo/Redo Implementation ---
function saveSaviourActionState(actionName) {
  // If we are not at the end, slice off redo history
  if (saviourActionPointer < saviourActionHistory.length - 1) {
    saviourActionHistory = saviourActionHistory.slice(0, saviourActionPointer + 1);
  }
  saviourActionHistory.push({
    saviourActive: JSON.parse(JSON.stringify(saviourActive)),
    saviourUsedActions: JSON.parse(JSON.stringify(saviourUsedActions)),
    saviourScore,
    saviourGameOver,
    actionName,
    grid: JSON.parse(JSON.stringify(saviourGrid)),
    highlight: saviourHighlightIndex,
    streak: saviourStreak,
    total: saviourTotal,
    longestStreak: saviourLongestStreak
  });
  saviourActionPointer = saviourActionHistory.length - 1;
  renderSaviourUndoRedo();
}

function handleGameOverAction(actionName) {
  saveSaviourActionState(actionName);
  saviourGameOver = true;
}

function undoSaviourAction() {
  if (saviourActionPointer <= 0) return;
  saviourActionPointer--;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function redoSaviourAction() {
  if (saviourActionPointer >= saviourActionHistory.length - 1) return;
  saviourActionPointer++;
  restoreSaviourActionState(saviourActionHistory[saviourActionPointer]);
}

function restoreSaviourActionState(state) {
  saviourActive = JSON.parse(JSON.stringify(state.saviourActive));
  saviourUsedActions = JSON.parse(JSON.stringify(state.saviourUsedActions));
  saviourScore = state.saviourScore;
  saviourGameOver = state.saviourGameOver;
  saviourGrid = JSON.parse(JSON.stringify(state.grid));
  saviourHighlightIndex = state.highlight;
  saviourStreak = state.streak;
  saviourTotal = state.total;
  saviourLongestStreak = state.longestStreak;
  renderSaviourGrid(saviourGameOver);
  updateSaviourScoreDisplays();
  renderSaviourActions();
  renderSaviourUndoRedo();
  if (saviourGameOver) showSaviourGameOver();
  else document.getElementById('result-saviour').innerHTML = '';
}

function renderSaviourUndoRedo() {
  const undoRedoDiv = document.getElementById('saviour-undo-redo');
  if (!undoRedoDiv) return;
  undoRedoDiv.innerHTML = '';
  const undoBtn = document.createElement('button');
  undoBtn.className = 'back-to-menu-study';
  undoBtn.textContent = 'Undo';
  undoBtn.disabled = saviourActionPointer <= 0;
  undoBtn.onclick = undoSaviourAction;
  const redoBtn = document.createElement('button');
  redoBtn.className = 'back-to-menu-study';
  redoBtn.textContent = 'Redo';
  redoBtn.disabled = saviourActionPointer >= saviourActionHistory.length - 1;
  redoBtn.onclick = redoSaviourAction;
  // Place on same line
  undoRedoDiv.style.display = 'flex';
  undoRedoDiv.style.justifyContent = 'center';
  undoRedoDiv.style.gap = '0.7em';
  undoRedoDiv.appendChild(undoBtn);
  undoRedoDiv.appendChild(redoBtn);
}

function loadHighScores() {
  entryHighScore = parseFloat(localStorage.getItem('flagellum_entry_highscore')) || 0;
  entryHighTotal = parseInt(localStorage.getItem('flagellum_entry_hightotal')) || 0;
  entryLongestStreak = parseInt(localStorage.getItem('flagellum_entry_longeststreak')) || 0;
  mcHighScore = parseFloat(localStorage.getItem('flagellum_mc_highscore')) || 0;
  mcHighTotal = parseInt(localStorage.getItem('flagellum_mc_hightotal')) || 0;
  mcLongestStreak = parseInt(localStorage.getItem('flagellum_mc_longeststreak')) || 0;
  rcHighScore = parseFloat(localStorage.getItem('flagellum_rc_highscore')) || 0;
  rcHighTotal = parseInt(localStorage.getItem('flagellum_rc_hightotal')) || 0;
  rcLongestStreak = parseInt(localStorage.getItem('flagellum_rc_longeststreak')) || 0;
  saviourHighScore = parseInt(localStorage.getItem('flagellum_saviour_highscore')) || 0;
  saviourHighTotal = parseInt(localStorage.getItem('flagellum_saviour_hightotal')) || 0;
  saviourLongestStreak = parseInt(localStorage.getItem('flagellum_saviour_longeststreak')) || 0;
}

// Update: Saviour mode high score is lowest number of actions (minimum, not maximum)
function saveHighScores() {
  // Entry mode
  if (
    entryScore > entryHighScore ||
    (entryScore === entryHighScore && entryTotal < entryHighTotal)
  ) {
    // Only update if this is a better score (higher score, or same score but fewer total)
    localStorage.setItem('flagellum_entry_highscore', entryScore);
    localStorage.setItem('flagellum_entry_hightotal', entryTotal);
    entryHighScore = entryScore;
    entryHighTotal = entryTotal;
  }
  if (entryStreak > entryLongestStreak) {
    entryLongestStreak = entryStreak;
    localStorage.setItem('flagellum_entry_longeststreak', entryLongestStreak);
  }
  // MC mode
  if (
    mcScore > mcHighScore ||
    (mcScore === mcHighScore && mcTotal < mcHighTotal)
  ) {
    localStorage.setItem('flagellum_mc_highscore', mcScore);
    localStorage.setItem('flagellum_mc_hightotal', mcTotal);
    mcHighScore = mcScore;
    mcHighTotal = mcTotal;
  }
  if (mcStreak > mcLongestStreak) {
    mcLongestStreak = mcStreak;
    localStorage.setItem('flagellum_mc_longeststreak', mcLongestStreak);
  }
  // Reverse Choice mode
  if (
    rcScore > rcHighScore ||
    (rcScore === rcHighScore && rcTotal < rcHighTotal)
  ) {
    localStorage.setItem('flagellum_rc_highscore', rcScore);
    localStorage.setItem('flagellum_rc_hightotal', rcTotal);
    rcHighScore = rcScore;
    rcHighTotal = rcTotal;
  }
  if (rcStreak > rcLongestStreak) {
    rcLongestStreak = rcStreak;
    localStorage.setItem('flagellum_rc_longeststreak', rcLongestStreak);
  }
  // Saviour mode (lower is better, but must be >0)
  if (
    (saviourScore > 0 && (saviourHighScore === 0 || saviourScore < saviourHighScore)) ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal && saviourScore > 0)
  ) {
    localStorage.setItem('flagellum_saviour_highscore', saviourScore);
    localStorage.setItem('flagellum_saviour_hightotal', saviourTotal);
    saviourHighScore = saviourScore;
    saviourHighTotal = saviourTotal;
  }
  if (saviourStreak > saviourLongestStreak) {
    saviourLongestStreak = saviourStreak;
    localStorage.setItem('flagellum_saviour_longeststreak', saviourLongestStreak);
  }
}

function updateScoreDisplays() {
  // Entry mode
  document.getElementById('score-entry').innerHTML = `Score: ${entryScore > 0 ? formatScore(entryScore) : '-'} of ${entryTotal > 0 ? entryTotal : '-'}`;
  let entryHS = `High Score: ${entryHighScore > 0 ? formatScore(entryHighScore) : '-'} of ${entryHighTotal > 0 ? entryHighTotal : '-'}`;
  let nhs = '';
  if (
    entryScore > entryHighScore ||
    (entryScore === entryHighScore && entryTotal < entryHighTotal && entryHighScore > 0)
  ) {
    nhs = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-entry').innerHTML = entryHS + nhs;

  // MC mode
  document.getElementById('score-mc').innerHTML = `Score: ${mcScore > 0 ? formatScore(mcScore) : '-'} of ${mcTotal > 0 ? mcTotal : '-'}`;
  let mcHS = `High Score: ${mcHighScore > 0 ? formatScore(mcHighScore) : '-'} of ${mcHighTotal > 0 ? mcHighTotal : '-'}`;
  let nhsMC = '';
  if (
    mcScore > mcHighScore ||
    (mcScore === mcHighScore && mcTotal < mcHighTotal && mcHighScore > 0)
  ) {
    nhsMC = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-mc').innerHTML = mcHS + nhsMC;

  // Reverse Choice mode
  document.getElementById('score-rc').innerHTML = `Score: ${rcScore > 0 ? formatScore(rcScore) : '-'} of ${rcTotal > 0 ? rcTotal : '-'}`;
  let rcHS = `High Score: ${rcHighScore > 0 ? formatScore(rcHighScore) : '-'} of ${rcHighTotal > 0 ? rcHighTotal : '-'}`;
  let nhsRC = '';
  if (
    rcScore > rcHighScore ||
    (rcScore === rcHighScore && rcTotal < rcHighTotal && rcHighScore > 0)
  ) {
    nhsRC = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-rc').innerHTML = rcHS + nhsRC;

  // Saviour mode
  document.getElementById('score-saviour').innerHTML = `Actions: ${saviourScore > 0 ? saviourScore : '-'} of ${saviourTotal > 0 ? saviourTotal : '-'}`;
  let savHS = `High Score: ${saviourHighScore > 0 ? saviourHighScore : '-'} of ${saviourHighTotal > 0 ? saviourHighTotal : '-'}`;
  let nhsSaviour = '';
  if (
    (saviourScore > 0 && (saviourHighScore === 0 || saviourScore < saviourHighScore)) ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal && saviourHighScore > 0)
  ) {
    nhsSaviour = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-saviour').innerHTML = savHS + nhsSaviour;
}

function formatScore(score) {
  // Show as integer if whole, else as fraction (e.g. 1 2/3)
  if (Number.isInteger(score)) return score === 0 ? '0' : score;
  let intPart = Math.floor(score);
  let frac = score - intPart;
  let fracStr = '';
  // Use normal font size for fractions
  if (Math.abs(frac - 2/3) < 0.01) fracStr = '2/3';
  else if (Math.abs(frac - 1/3) < 0.01) fracStr = '1/3';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '1/2';
  else fracStr = score.toFixed(2);
  if (intPart === 0 && fracStr) return fracStr;
  if (fracStr && intPart > 0) return `${intPart} ${fracStr}`;
  return score.toFixed(2);
}

function updateMainMenuHighscores() {
  const mainHigh = document.getElementById('main-highscores');
  mainHigh.innerHTML =
    `<h2>Personal High Scores</h2>` +
    `<div class="main-highscore-row">Entry Mode: <b>${entryHighScore > 0 ? formatScore(entryHighScore) : '-'} of ${entryHighTotal > 0 ? entryHighTotal : '-'}</b> <span class="score-streak">Longest Streak: ${entryLongestStreak > 0 ? entryLongestStreak : '-'}</span></div>` +
    `<div class="main-highscore-row">Multiple Choice: <b>${mcHighScore > 0 ? formatScore(mcHighScore) : '-'} of ${mcHighTotal > 0 ? mcHighTotal : '-'}</b> <span class="score-streak">Longest Streak: ${mcLongestStreak > 0 ? mcLongestStreak : '-'}</span></div>` +
    `<div class="main-highscore-row">Reverse Choice: <b>${rcHighScore > 0 ? formatScore(rcHighScore) : '-'} of ${rcHighTotal > 0 ? rcHighTotal : '-'}</b> <span class="score-streak">Longest Streak: ${rcLongestStreak > 0 ? rcLongestStreak : '-'}</span></div>` +
    `<div class="main-highscore-row">Saviour Mode: <b>${saviourHighScore > 0 ? saviourHighScore : '-'} of ${saviourHighTotal > 0 ? saviourHighTotal : '-'}</b> <span class="score-streak">Longest Streak: ${saviourLongestStreak > 0 ? saviourLongestStreak : '-'}</span></div>`;
}

function showMainMenu() {
  updateMainMenuHighscores();
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('congrats').style.display = 'none';
  document.getElementById('game-saviour').style.display = 'none'; // Hide Saviour mode when returning to menu
}

function showEntryMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'block';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  usedHint = false;
  entryStreak = 0;
  updateScoreDisplays();
  pickRandomFlag();
  document.getElementById('guess').focus();
  setupAutocomplete();
  addFlagClickHandlers();
}

function showMCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'block';
  document.getElementById('game-rc').style.display = 'none';
  mcAttempts = 0;
  mcTried = [];
  mcStreak = 0;
  updateScoreDisplays();
  pickRandomFlagMC();
  addFlagClickHandlers();
}

function showRCMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'block';
  rcAttempts = 0;
  rcTried = [];
  rcStreak = 0;
  updateScoreDisplays();
  pickRandomFlagRC();
  addFlagClickHandlers();
}

function showStudyPage() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('study-page').style.display = 'block';
  renderStudyTable('country');
  addFlagClickHandlers();
}

function renderStudyTable(sortKey, sortDir = 'asc') {
  let sorted = [...flags];
  // Determine if the column is numeric
  const numericCols = ['gdp', 'area', 'coastline_km', 'min_lat', 'max_lat', 'min_lng', 'max_lng'];
  sorted.sort((a, b) => {
    let vA = a[sortKey];
    let vB = b[sortKey];
    if (numericCols.includes(sortKey)) {
      vA = vA !== undefined && vA !== null ? Number(vA) : -Infinity;
      vB = vB !== undefined && vB !== null ? Number(vB) : -Infinity;
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    } else if (sortKey === 'nuclear_arms') {
      // Sort 'Yes' before 'No' in ascending
      vA = a.nuclear_arms ? 1 : 0;
      vB = b.nuclear_arms ? 1 : 0;
      if (vA < vB) return sortDir === 'asc' ? 1 : -1;
      if (vA > vB) return sortDir === 'asc' ? -1 : 1;
      return 0;
    } else {
      vA = vA ? vA.toString().toLowerCase() : '';
      vB = vB ? vB.toString().toLowerCase() : '';
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
  });
  const tbody = document.getElementById('study-tbody');
  tbody.innerHTML = '';
  for (const flag of sorted) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${flag.country}</td>
      <td>${flag.code}</td>
      <td style="font-size:1.5em;">${flag.emoji}</td>
      <td><a href="https://en.wikipedia.org/wiki/${flag.wiki}" target="_blank">Wiki</a></td>
      <td><img src="${flag.img}" alt="Flag of ${flag.country}" /></td>
      <td>${flag.gdp ? (flag.gdp/1e6).toLocaleString(undefined, {maximumFractionDigits:0}) : ''}</td>
      <td>${flag.area ? flag.area.toLocaleString() : ''}</td>
      <td>${flag.coastline_km !== undefined ? flag.coastline_km.toLocaleString() : ''}</td>
      <td>${flag.nuclear_arms ? 'Yes' : 'No'}</td>
      <td>${flag.min_lat !== undefined ? flag.min_lat : ''}</td>
      <td>${flag.max_lat !== undefined ? flag.max_lat : ''}</td>
      <td>${flag.min_lng !== undefined ? flag.min_lng : ''}</td>
      <td>${flag.max_lng !== undefined ? flag.max_lng : ''}</td>
    `;
    tbody.appendChild(tr);
  }
  // Set up sorting buttons
  const ths = document.querySelectorAll('.sort-btn');
  ths.forEach(btn => {
    btn.onclick = () => {
      let newDir = sortKey === btn.dataset.sort && sortDir === 'asc' ? 'desc' : 'asc';
      renderStudyTable(btn.dataset.sort, newDir);
    };
  });
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
}

function pickRandomFlag() {
  if (!flags.length) return;
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  document.getElementById('guess').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('wiki-link').innerHTML = '';
  document.getElementById('submit').textContent = 'Guess';
  document.getElementById('submit').disabled = false;
  document.getElementById('guess').disabled = false;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint').textContent = 'Hint';
  document.getElementById('hint').disabled = false;
  document.getElementById('skip').style.display = 'inline-block';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('submit').onclick = checkGuess;
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
}

function showHint() {
  usedHint = true;
  document.getElementById('hint').textContent = `Country code: ${currentFlag.code}`;
  document.getElementById('hint').disabled = true;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint-text').textContent = '';
}

function checkGuess() {
  const guess = document.getElementById('guess').value.trim().toLowerCase();
  const answer = currentFlag.country.toLowerCase();
  const code = currentFlag.code.toLowerCase();
  if (guess === answer || guess === code) {
    let addScore = usedHint ? 0.5 : 1;
    entryScore += addScore;
    entryTotal++;
    // Streak logic
    if (!usedHint && addScore === 1) {
      entryStreak++;
      if (entryStreak > entryLongestStreak) entryLongestStreak = entryStreak;
    } else {
      entryStreak = 0;
    }
    updateScoreDisplays();
    saveHighScores();
    const pointStr = addScore === 1 ? '1 Point!' : (addScore === 0.5 ? '1/2 Point!' : `${addScore} Point!`);
    document.getElementById('result').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result').style.color = '#2e7d32';
    document.getElementById('wiki-link').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    document.getElementById('submit').textContent = 'Next Flag';
    document.getElementById('guess').disabled = true;
    document.getElementById('submit').onclick = function() {
      usedHint = false;
      pickRandomFlag();
      document.getElementById('guess').focus();
    };
    document.getElementById('hint').style.display = 'none';
    document.getElementById('skip').style.display = 'none';
    document.getElementById('hint-text').textContent = '';
  } else {
    entryStreak = 0;
    document.getElementById('result').textContent = '❌ Try again!';
    document.getElementById('result').style.color = '#c62828';
    document.getElementById('hint').style.display = 'block';
    document.getElementById('hint').textContent = 'Hint';
    document.getElementById('hint').disabled = false;
    document.getElementById('skip').style.display = 'inline-block';
    document.getElementById('hint-text').textContent = '';
    document.getElementById('submit').onclick = checkGuess;
  }
}

function skipEntryFlag() {
  entryTotal++;
  entryStreak = 0;
  updateScoreDisplays();
  saveHighScores();
  pickRandomFlag();
  document.getElementById('guess').focus();
}

function pickRandomFlagMC() {
  if (!flags.length) return;
  // Pick correct flag
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Pick 3 other random, unique countries
  let options = [currentFlag];
  let used = new Set([currentFlag.country]);
  while (options.length < 4) {
    let f = flags[Math.floor(Math.random() * flags.length)];
    if (!used.has(f.country)) {
      options.push(f);
      used.add(f.country);
    }
  }
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  mcCorrectIndex = options.findIndex(f => f.country === currentFlag.country);
  mcAttempts = 0;
  mcTried = [false, false, false, false];
  // Show flag and options
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji-mc').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  const mcOptionsDiv = document.getElementById('mc-options');
  mcOptionsDiv.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option-btn';
    btn.textContent = `${opt.country} (${opt.code})`;
    btn.disabled = false;
    btn.onclick = () => checkMCAnswer(idx, options, btns);
    mcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(mcOptionsDiv.children);
  btns.forEach((btn, idx) => {
    btn.onclick = () => checkMCAnswer(idx, options, btns);
  });
  document.getElementById('result-mc').textContent = '';
  document.getElementById('wiki-link-mc').innerHTML = '';
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'none';
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
}

function checkMCAnswer(idx, options, btns) {
  if (mcTried[idx]) return;
  mcTried[idx] = true;
  btns[idx].disabled = true;
  mcAttempts++;
  let addScore = 0;
  if (idx === mcCorrectIndex) {
    if (mcAttempts === 1) addScore = 1;
    else if (mcAttempts === 2) addScore = 2/3;
    else if (mcAttempts === 3) addScore = 1/3;
    else addScore = 0;
    mcScore += addScore;
    mcTotal++;
    // Streak logic
    if (mcAttempts === 1 && addScore === 1) {
      mcStreak++;
      if (mcStreak > mcLongestStreak) mcLongestStreak = mcStreak;
    } else {
      mcStreak = 0;
    }
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-mc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${currentFlag.country} (${currentFlag.code})`;
    document.getElementById('result-mc').style.color = '#2e7d32';
    document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-mc').style.display = 'block';
  } else {
    mcStreak = 0;
    // If this was the last possible attempt, finish the round
    if (mcAttempts >= 4 || mcTried.filter(Boolean).length === 4) {
      mcScore += 0;
      mcTotal++;
      updateScoreDisplays();
      saveHighScores();
      document.getElementById('result-mc').textContent = `❌ Out of tries! Correct: ${currentFlag.country} (${currentFlag.code})`;
      document.getElementById('result-mc').style.color = '#c62828';
      document.getElementById('wiki-link-mc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${currentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
      btns.forEach(b => b.disabled = true);
      document.getElementById('next-mc').style.display = 'block';
    }
  }
}

function pickRandomFlagRC() {
  if (!flags.length) return;
  rcCurrentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Pick 3 other random, unique countries
  rcOptions = [rcCurrentFlag];
  let used = new Set([rcCurrentFlag.country]);
  while (rcOptions.length < 4) {
    let f = flags[Math.floor(Math.random() * flags.length)];
    if (!used.has(f.country)) {
      rcOptions.push(f);
      used.add(f.country);
    }
  }
  // Shuffle options
  for (let i = rcOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rcOptions[i], rcOptions[j]] = [rcOptions[j], rcOptions[i]];
  }
  rcCorrectIndex = rcOptions.findIndex(f => f.country === rcCurrentFlag.country);
  rcAttempts = 0;
  rcTried = [false, false, false, false];
  // Show country and code
  document.getElementById('rc-country').innerHTML = `${rcCurrentFlag.country} <span style="color:#888;">(${rcCurrentFlag.code})</span>`;
  // Show flag image options in a 2x2 grid with zoom button
  const rcOptionsDiv = document.getElementById('rc-options');
  rcOptionsDiv.innerHTML = '';
  rcOptions.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'rc-option-btn';
    btn.disabled = false;
    btn.tabIndex = 0;
    btn.innerHTML = `
      <img src="${opt.img}" alt="Flag of ${opt.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;" />
      <span class="rc-zoom-btn" title="Enlarge flag" tabindex="-1">+</span>
    `;
    btn.onclick = (e) => {
      // Only trigger answer if not clicking zoom
      if (e.target.classList.contains('rc-zoom-btn')) return;
      checkRCAnswer(idx, rcOptions, btns);
    };
    // Zoom button event
    btn.querySelector('.rc-zoom-btn').onclick = (e) => {
      e.stopPropagation();
      showFlagModal(opt.img, `Flag of ${opt.country}`);
    };
    rcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(rcOptionsDiv.children);
  document.getElementById('result-rc').textContent = '';
  document.getElementById('wiki-link-rc').innerHTML = '';
  document.getElementById('next-rc').style.display = 'none';
  addFlagClickHandlers();
}

function checkRCAnswer(idx, options, btns) {
  if (rcTried[idx]) return;
  rcTried[idx] = true;
  btns[idx].disabled = true;
  rcAttempts++;
  let addScore = 0;
  if (idx === rcCorrectIndex) {
    if (rcAttempts === 1) addScore = 1;
    else if (rcAttempts === 2) addScore = 2/3;
    else if (rcAttempts === 3) addScore = 1/3;
    else addScore = 0;
    rcScore += addScore;
    rcTotal++;
    // Streak logic
    if (rcAttempts === 1 && addScore === 1) {
      rcStreak++;
      if (rcStreak > rcLongestStreak) rcLongestStreak = rcStreak;
    } else {
      rcStreak = 0;
    }
    updateScoreDisplays();
    saveHighScores();
    let pointStr = addScore === 1 ? '1 Point!' : (addScore === 2/3 ? '2/3 Point!' : (addScore === 1/3 ? '1/3 Point!' : '0 Point!'));
    document.getElementById('result-rc').innerHTML = `✅ Correct! <span class='fraction'>${pointStr}</span> ${rcCurrentFlag.country} (${rcCurrentFlag.code})`;
    document.getElementById('result-rc').style.color = '#2e7d32';
    document.getElementById('wiki-link-rc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${rcCurrentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
    btns.forEach(b => b.disabled = true);
    document.getElementById('next-rc').style.display = 'block';
  } else {
    rcStreak = 0;
    // If this was the last possible attempt, finish the round
    if (rcAttempts >= 4 || rcTried.filter(Boolean).length === 4) {
      rcScore += 0;
      rcTotal++;
      updateScoreDisplays();
      saveHighScores();
      document.getElementById('result-rc').textContent = `❌ Out of tries! Correct: ${rcCurrentFlag.country} (${rcCurrentFlag.code})`;
      document.getElementById('result-rc').style.color = '#c62828';
      document.getElementById('wiki-link-rc').innerHTML = `<a href="https://en.wikipedia.org/wiki/${rcCurrentFlag.wiki}" target="_blank">Learn more on Wikipedia</a>`;
      btns.forEach(b => b.disabled = true);
      document.getElementById('next-rc').style.display = 'block';
    }
  }
}

function nextMCFlag() {
  pickRandomFlagMC();
}

function nextRCFlag() {
  pickRandomFlagRC();
}

function setupAutocomplete() {
  const guessInput = document.getElementById('guess');
  const listDiv = document.getElementById('autocomplete-list');
  let currentFocus = -1;
  let lastFiltered = [];

  function closeList() {
    listDiv.style.display = 'none';
    listDiv.innerHTML = '';
    currentFocus = -1;
  }

  function filterFlags(val) {
    if (!val) return [];
    // Respect spaces: match substring with exact spacing
    const lowerVal = val.toLowerCase();
    return flags.filter(f =>
      (`${f.country} (${f.code})`).toLowerCase().includes(lowerVal)
    ).slice(0, 15);
  }

  function renderList(filtered) {
    lastFiltered = filtered;
    if (!filtered.length) {
      closeList();
      return;
    }
    listDiv.innerHTML = '';
    filtered.forEach((flag, idx) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `${flag.country} <span style='color:#888;'>(${flag.code})</span>`;
      item.onclick = function() {
        guessInput.value = `${flag.country}`;
        closeList();
        guessInput.focus();
      };
      listDiv.appendChild(item);
    });
    // Position below input
    const rect = guessInput.getBoundingClientRect();
    const parentRect = guessInput.parentElement.getBoundingClientRect();
    listDiv.style.top = (guessInput.offsetTop + guessInput.offsetHeight + 2) + 'px';
    listDiv.style.left = guessInput.offsetLeft + 'px';
    listDiv.style.width = guessInput.offsetWidth + 'px';
    listDiv.style.display = 'block';
  }

  guessInput.addEventListener('input', function() {
    if (!document.getElementById('autocomplete-toggle').checked) {
      closeList();
      return;
    }
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('focus', function() {
    if (!document.getElementById('autocomplete-toggle').checked) return;
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });

  guessInput.addEventListener('keydown', function(e) {
    const items = listDiv.querySelectorAll('.autocomplete-item');
    if (!items.length || listDiv.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (currentFocus > -1) {
        items[currentFocus].click();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      closeList();
    }
  });

  function setActive(items, idx) {
    items.forEach(i => i.classList.remove('active'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({block:'nearest'});
    }
  }

  document.addEventListener('click', function(e) {
    if (e.target !== guessInput && e.target.parentNode !== listDiv) {
      closeList();
    }
  });

  // Hide autocomplete if toggle is off
  document.getElementById('autocomplete-toggle').addEventListener('change', function() {
    if (!this.checked) closeList();
    else {
      // If toggled on and input has value, show list
      if (guessInput.value) {
        const filtered = filterFlags(guessInput.value);
        renderList(filtered);
      }
    }
  });
}

// --- Flag Image Modal ---
function setupFlagImageModal() {
  if (!document.getElementById('flag-modal')) {
    const modal = document.createElement('div');
    modal.id = 'flag-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div id="flag-modal-bg" style="position:fixed;left:0;top:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(0,0,0,0.55);"></div>
      <div id="flag-modal-content" style="position:relative;z-index:2;display:flex;align-items:center;justify-content:center;max-width:95vw;max-height:90vh;margin:auto;">
        <img id="flag-modal-img" src="" alt="Flag" style="max-width:80vw;max-height:70vh;border-radius:0.5rem;box-shadow:0 2px 16px #0003;border:1px solid #ccc;background:#fff;" />
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('flag-modal-bg').onclick = closeFlagModal;
    document.getElementById('flag-modal-content').onclick = function(e) { e.stopPropagation(); };
    modal.onclick = function(e) { if (e.target === modal) closeFlagModal(); };
  }
}
function showFlagModal(imgUrl, alt) {
  const modal = document.getElementById('flag-modal');
  const img = document.getElementById('flag-modal-img');
  img.src = imgUrl;
  img.alt = alt || 'Flag';
  modal.style.display = 'flex';
}
function closeFlagModal() {
  const modal = document.getElementById('flag-modal');
  if (modal) modal.style.display = 'none';
}

function addFlagClickHandlers() {
  // Entry mode
  const entryFlag = document.getElementById('flag-emoji');
  if (entryFlag) {
    const img = entryFlag.querySelector('img');
    if (img) {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to enlarge';
      img.onclick = function(e) {
        e.stopPropagation();
        if (currentFlag && currentFlag.img) {
          showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
        }
      };
    }
  }
  // MC mode
  const mcFlag = document.getElementById('flag-emoji-mc');
  if (mcFlag) {
    const img = mcFlag.querySelector('img');
    if (img) {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to enlarge';
      img.onclick = function(e) {
        e.stopPropagation();
        if (currentFlag && currentFlag.img) {
          showFlagModal(currentFlag.img, `Flag of ${currentFlag.country}`);
        }
      };
    }
  }
  // Study mode: delegate to table
  const studyTable = document.getElementById('study-tbody');
  if (studyTable) {
    studyTable.onclick = function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        e.stopPropagation();
        showFlagModal(e.target.src, e.target.alt);
      }
    };
  }
  // Modal close events
  const modal = document.getElementById('flag-modal');
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) closeFlagModal();
    };
    const closeBtn = document.getElementById('flag-modal-close');
    if (closeBtn) closeBtn.onclick = closeFlagModal;
  }
}

// Ensure addFlagClickHandlers is called after every DOM update that changes flag images:
function pickRandomFlag() {
  if (!flags.length) return;
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  document.getElementById('guess').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('wiki-link').innerHTML = '';
  document.getElementById('submit').textContent = 'Guess';
  document.getElementById('submit').disabled = false;
  document.getElementById('guess').disabled = false;
  document.getElementById('hint').style.display = 'block';
  document.getElementById('hint').textContent = 'Hint';
  document.getElementById('hint').disabled = false;
  document.getElementById('skip').style.display = 'inline-block';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('submit').onclick = checkGuess;
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
}

function pickRandomFlagMC() {
  if (!flags.length) return;
  // Pick correct flag
  currentFlag = flags[Math.floor(Math.random() * flags.length)];
  // Pick 3 other random, unique countries
  let options = [currentFlag];
  let used = new Set([currentFlag.country]);
  while (options.length < 4) {
    let f = flags[Math.floor(Math.random() * flags.length)];
    if (!used.has(f.country)) {
      options.push(f);
      used.add(f.country);
    }
  }
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  mcCorrectIndex = options.findIndex(f => f.country === currentFlag.country);
  mcAttempts = 0;
  mcTried = [false, false, false, false];
  // Show flag and options
  const isMobile = window.innerWidth < 700;
  document.getElementById('flag-emoji-mc').innerHTML = `<img src="${currentFlag.img}" alt="Flag of ${currentFlag.country}" style="width:90px;height:60px;vertical-align:middle;border-radius:0.3em;border:1px solid #ccc;box-shadow:0 2px 8px #0001;margin-bottom:0.5em;">` + (isMobile ? ` <span style="font-size:2.2rem;">${currentFlag.emoji}</span>` : '');
  const mcOptionsDiv = document.getElementById('mc-options');
  mcOptionsDiv.innerHTML = '';
  options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option-btn';
    btn.textContent = `${opt.country} (${opt.code})`;
    btn.disabled = false;
    btn.onclick = () => checkMCAnswer(idx, options, btns);
    mcOptionsDiv.appendChild(btn);
  });
  // Store buttons for disabling
  let btns = Array.from(mcOptionsDiv.children);
  btns.forEach((btn, idx) => {
    btn.onclick = () => checkMCAnswer(idx, options, btns);
  });
  document.getElementById('result-mc').textContent = '';
  document.getElementById('wiki-link-mc').innerHTML = '';
  document.getElementById('hint-text-mc').textContent = '';
  document.getElementById('next-mc').style.display = 'none';
  addFlagClickHandlers(); // Ensure click handler is always set after DOM update
}

function startGame() {
  loadHighScores();
  fetch('flags.json')
    .then(res => res.json())
    .then(data => {
      flags = data;
      // Main menu event listeners
      document.getElementById('entry-mode-btn').addEventListener('click', showEntryMode);
      document.getElementById('mc-mode-btn').addEventListener('click', showMCMode);
      document.getElementById('rc-mode-btn').addEventListener('click', showRCMode);
      document.getElementById('study-btn').addEventListener('click', showStudyPage);
      document.getElementById('back-to-menu-study').onclick = showMainMenu;
      document.getElementById('back-to-menu-study-top').onclick = showMainMenu;
      // Entry mode events
      document.getElementById('submit').onclick = checkGuess;
      document.getElementById('guess').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (document.getElementById('submit').textContent === 'Next Flag') {
            usedHint = false;
            pickRandomFlag();
            document.getElementById('guess').focus();
          } else if (!document.getElementById('guess').disabled) {
            checkGuess();
          }
        }
      });
      document.getElementById('hint').onclick = showHint;
      document.getElementById('skip').onclick = skipEntryFlag;
      // MC mode events
      document.getElementById('next-mc').onclick = nextMCFlag;
      // RC mode events
      document.getElementById('next-rc').onclick = nextRCFlag;
      // Study mode events
      document.getElementById('back-to-menu-study-top').onclick = showMainMenu;
      // Autocomplete toggle
      const autocompleteToggle = document.getElementById('autocomplete-toggle');
      if (autocompleteToggle) {
        autocompleteToggle.addEventListener('change', function() {
          document.getElementById('guess').setAttribute('autocomplete', this.checked ? 'on' : 'off');
        });
      }
      // End game: reset all game state for entry mode
      document.getElementById('back-to-menu-entry').onclick = function() {
        usedHint = false;
        pickRandomFlag();
        entryScore = 0;
        entryTotal = 0;
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      // End game: reset all game state for MC mode
      document.getElementById('back-to-menu-mc').onclick = function() {
        mcScore = 0;
        mcTotal = 0;
        mcAttempts = 0;
        mcTried = [];
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      // End game: reset all game state for RC mode
      document.getElementById('back-to-menu-rc').onclick = function() {
        rcScore = 0;
        rcTotal = 0;
        rcAttempts = 0;
        rcTried = [];
        updateScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      // End game: reset all game state for Saviour mode
      document.getElementById('back-to-menu-saviour').onclick = function() {
        saviourScore = 0;
        saviourTotal = 0;
        saviourStreak = 0;
        updateSaviourScoreDisplays();
        saveHighScores();
        showMainMenu();
      };
      showMainMenu();
      updateScoreDisplays();
      updateMainMenuHighscores();
    });
}

window.onload = function() {
  startGame();
  addFlagClickHandlers();
  // Saviour mode button event
  const savBtn = document.getElementById('saviour-mode-btn');
  if (savBtn) savBtn.onclick = showSaviourMode;
  const backSavBtn = document.getElementById('back-to-menu-saviour');
  if (backSavBtn) backSavBtn.onclick = showMainMenu;
};

window.showSaviourMode = showSaviourMode;

// --- Saviour Mode ---
function showSaviourMode() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('game-saviour').style.display = 'flex';
  saviourStreak = 0;
  updateSaviourScoreDisplays();
  // --- NEW: Clear result message on new game ---
  const resultDiv = document.getElementById('result-saviour');
  if (resultDiv) resultDiv.innerHTML = '';
  setupSaviourGrid();
  setupSaviourActions();
}

function updateSaviourScoreDisplays() {
  document.getElementById('score-saviour').innerHTML = `<span style="color:#0078d7;font-weight:500;">Actions Used:</span> ${saviourScore}`;
  document.getElementById('streak-saviour').innerHTML = `<span style="color:#0078d7;font-weight:500;">Streak:</span> ${saviourStreak} <span class="score-streak">(Longest: ${saviourLongestStreak})</span>`;
  let savHS = `<span style="color:#0078d7;font-weight:500;">High Score:</span> ${saviourHighScore > 0 ? saviourHighScore : '-'}`;
  let nhs = '';
  if (
    (saviourScore > 0 && (saviourHighScore === 0 || saviourScore < saviourHighScore)) ||
    (saviourScore === saviourHighScore && saviourTotal < saviourHighTotal && saviourHighScore > 0)
  ) {
    nhs = '<div class="new-highscore">New High Score!</div>';
  }
  document.getElementById('highscore-saviour').innerHTML = savHS + nhs;
}

function setupSaviourGrid() {
  if (flags.length < 25) return;
  let shuffled = [...flags].sort(() => Math.random() - 0.5);
  saviourGrid = shuffled.slice(0, 25);
  saviourActive = Array(25).fill(true);
  saviourUsedActions = Array(SAVIOUR_ACTIONS.length).fill(false);
  saviourScore = 0;
  saviourGameOver = false;
  saviourActionHistory = [];
  saviourActionPointer = -1;
  saveSaviourActionState('Start');
  renderSaviourGrid();
}

function renderSaviourGrid(gameOver = false) {
  const gridDiv = document.getElementById('saviour-grid');
  gridDiv.innerHTML = '';
  let activeCount = 0;
  let lastActiveIdx = -1;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i]) {
      activeCount++;
      lastActiveIdx = i;
    }
  }
  // Win detection: only the highlighted flag remains
  if (activeCount === 1 && lastActiveIdx === saviourHighlightIndex && !gameOver) {
    saviourGameOver = true;
    // --- Update: Save high score on win (lower is better) ---
    if (
      (saviourScore > 0 && (saviourHighScore === 0 || saviourScore < saviourHighScore)) ||
      (saviourScore === saviourHighScore && saviourGrid.length < saviourHighTotal && saviourHighScore > 0)
    ) {
      saviourHighScore = saviourScore;
      saviourHighTotal = saviourGrid.length;
      localStorage.setItem('flagellum_saviour_highscore', saviourHighScore);
      localStorage.setItem('flagellum_saviour_hightotal', saviourHighTotal);
    }
    updateSaviourScoreDisplays();
    renderSaviourGrid(true);
    document.getElementById('result-saviour').innerHTML = `<span style="color:#2e7d32;font-weight:bold;">🎉 Congratulations! You saved ${saviourGrid[saviourHighlightIndex].country} (${saviourGrid[saviourHighlightIndex].code}) and won Saviour Mode!</span>`;
    return;
  }
  for (let i = 0; i < saviourGrid.length; i++) {
    const flag = saviourGrid[i];
    const btn = document.createElement('button');
    btn.className = 'saviour-flag-btn' + (i === saviourHighlightIndex ? ' saviour-highlight' : '');
    btn.disabled = !saviourActive[i] || gameOver;
    if (!saviourActive[i]) {
      btn.style.filter = 'grayscale(1)';
      btn.style.opacity = '0.5';
    }
    if (gameOver) {
      btn.style.background = '#ffdddd';
      btn.style.borderColor = '#c62828';
    }
    // Remove title attribute to prevent hover country name
    btn.innerHTML = `<img src="${flag.img}" alt="Flag" />`;
    // Add click handler for popout entry
    if (saviourActive[i] && !gameOver) {
      btn.onclick = function() {
        showSaviourFlagEntryModal(i);
      };
    }
    gridDiv.appendChild(btn);
  }
}

function showSaviourFlagEntryModal(idx) {
  if (saviourGameOver) return; // Prevent opening modal after game over
  // Remove existing modal if present
  let existing = document.getElementById('saviour-flag-entry-modal');
  if (existing) existing.remove();
  const flag = saviourGrid[idx];
  // Modal container
  const modal = document.createElement('div');
  modal.id = 'saviour-flag-entry-modal';
  modal.style.position = 'fixed';
  modal.style.zIndex = '2000';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.55)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  // Modal content
  modal.innerHTML = `
    <div style="background:#fff;padding:1.5em 1.2em 1.2em 1.2em;border-radius:1.1em;max-width:95vw;box-shadow:0 2px 16px #0003;min-width:270px;position:relative;display:flex;flex-direction:column;align-items:center;">
      <button id="saviour-flag-entry-close" style="position:absolute;top:0.5em;right:0.7em;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <img src="${flag.img}" alt="Flag of ${flag.country}" style="max-width:220px;max-height:120px;border-radius:0.5em;border:1px solid #ccc;box-shadow:0 2px 8px #0002;margin-bottom:1em;" />
      <div style="width:100%;max-width:320px;">
        <input type="text" id="saviour-flag-entry-input" placeholder="Enter country or code..." autocomplete="off" style="width:100%;padding:0.7rem;font-size:1.1rem;border:1px solid #ddd;border-radius:0.5rem;margin-bottom:0.5rem;box-sizing:border-box;" />
        <div id="saviour-flag-entry-autocomplete" class="autocomplete-list" style="display:none;"></div>
        <button id="saviour-flag-entry-submit" style="width:100%;padding:0.7rem;font-size:1.1rem;border:none;border-radius:0.5rem;background:#0078d7;color:#fff;margin-bottom:0.5rem;cursor:pointer;">Submit</button>
        <button id="saviour-hint-btn" style="width:100%;padding:0.7rem;font-size:1.1rem;border:none;border-radius:0.5rem;background:#0078d7;color:#fff;margin-bottom:0.5rem;cursor:pointer;">Hint</button>
        <div id="saviour-flag-entry-result" style="min-height:1.5em;text-align:center;margin-bottom:0.5rem;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Close logic
  document.getElementById('saviour-flag-entry-close').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  // Autocomplete logic (reuse Entry Mode)
  setupSaviourFlagEntryAutocomplete(idx);
  // Submit logic
  document.getElementById('saviour-flag-entry-submit').onclick = function() {
    handleSaviourFlagEntrySubmit(idx);
  };
  document.getElementById('saviour-flag-entry-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      handleSaviourFlagEntrySubmit(idx);
    }
  });
  // Hint button logic
  document.getElementById('saviour-hint-btn').onclick = function() {
    const resultDiv = document.getElementById('saviour-flag-entry-result');
    resultDiv.textContent = `Hint: Country code is '${flag.code}'.`;
    resultDiv.style.color = '#0078d7';
  };
  setTimeout(() => document.getElementById('saviour-flag-entry-input').focus(), 100);
}

function setupSaviourFlagEntryAutocomplete(idx) {
  const input = document.getElementById('saviour-flag-entry-input');
  const listDiv = document.getElementById('saviour-flag-entry-autocomplete');
  let currentFocus = -1;
  let lastFiltered = [];
  function closeList() {
    listDiv.style.display = 'none';
    listDiv.innerHTML = '';
    currentFocus = -1;
  }
  function filterFlags(val) {
    if (!val) return [];
    const lowerVal = val.toLowerCase();
    return flags.filter(f =>
      (`${f.country} (${f.code})`).toLowerCase().includes(lowerVal)
    ).slice(0, 15);
  }
  function renderList(filtered) {
    lastFiltered = filtered;
    if (!filtered.length) {
      closeList();
      return;
    }
    listDiv.innerHTML = '';
    filtered.forEach((flag, idx2) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `${flag.country} <span style='color:#888;'>(${flag.code})</span>`;
      item.onclick = function() {
        input.value = `${flag.country}`;
        closeList();
        input.focus();
      };
      listDiv.appendChild(item);
    });
    listDiv.style.display = 'block';
  }
  input.addEventListener('input', function() {
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });
  input.addEventListener('focus', function() {
    const val = this.value;
    const filtered = filterFlags(val);
    renderList(filtered);
  });
  input.addEventListener('keydown', function(e) {
    const items = listDiv.querySelectorAll('.autocomplete-item');
    if (!items.length || listDiv.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      setActive(items, currentFocus);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (currentFocus > -1) {
        items[currentFocus].click();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      closeList();
    }
  });
  function setActive(items, idx) {
    items.forEach(i => i.classList.remove('active'));
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active');
      items[idx].scrollIntoView({block:'nearest'});
    }
  }
  document.addEventListener('click', function(e) {
    if (e.target !== input && e.target.parentNode !== listDiv) {
      closeList();
    }
  });
}

function handleSaviourFlagEntrySubmit(idx) {
  if (saviourGameOver) return;
  const input = document.getElementById('saviour-flag-entry-input');
  const resultDiv = document.getElementById('saviour-flag-entry-result');
  const hintBtn = document.getElementById('saviour-hint-btn');
  const hintDisplay = document.getElementById('saviour-hint-display');
  const guess = input.value.trim().toLowerCase();
  const flag = saviourGrid[idx];

  if (hintBtn) {
    hintBtn.onclick = () => {
      saveSaviourActionState('Hint Used');
      saviourScore++;
      usedHint = true;
      hintDisplay.textContent = `Hint: Country code is '${flag.code}'.`;
      hintDisplay.style.display = 'block';
      updateSaviourScoreDisplays();
    };
  }

  if (!guess) {
    resultDiv.textContent = 'Please enter a country or code.';
    resultDiv.style.color = '#c62828';
    return;
  }

  if (guess === flag.country.toLowerCase() || guess === flag.code.toLowerCase()) {
    saveSaviourActionState('Click and Entry');
    saviourActive[idx] = false;
    saviourScore++;
    if (idx === saviourHighlightIndex) {
      saviourGameOver = true;
      resultDiv.innerHTML = `<span style='color:#c62828;font-weight:bold;'>❌ You eliminated the saviour flag (${flag.country})!</span>`;
      const mainResultDiv = document.getElementById('result-saviour');
      if (mainResultDiv) mainResultDiv.innerHTML = `<span style="color:#c62828;font-weight:bold;">❌ Game Over! The saviour flag (${flag.country}) was eliminated.</span>`;
      setTimeout(() => {
        let modal = document.getElementById('saviour-flag-entry-modal');
        if (modal) modal.remove();
        showSaviourGameOver();
      }, 700);
      return;
    }
    resultDiv.innerHTML = `<span style='color:#2e7d32;font-weight:bold;'>✅ Eliminated ${flag.country} (${flag.code})</span>`;
    setTimeout(() => {
      let modal = document.getElementById('saviour-flag-entry-modal');
      if (modal) modal.remove();
      renderSaviourGrid();
      updateSaviourScoreDisplays();
      renderSaviourActions();
    }, 700);
  } else {
    resultDiv.textContent = '❌ Incorrect. Try again!';
    resultDiv.style.color = '#c62828';
  }
}

// Saviour action descriptions for info popout
const SAVIOUR_ACTION_DESCRIPTIONS = [
  { name: 'Freeze Ray', icon: '❄️', desc: 'Eliminate all countries with territory in the polar circles.' },
  { name: 'Heat Ray', icon: '🔥', desc: 'Eliminate all countries with territory in the tropics.' },
  { name: 'Tailor', icon: '✂️', desc: 'Eliminate all countries with area at or over 83,879 km².' },
  { name: 'Shrink Ray', icon: '🔬', desc: 'Eliminate all countries with area under 83,879 km².' },
  { name: 'Money Bags', icon: '💰', desc: 'Eliminate all countries with GDP of 25,000,000,000 or over.' },
  { name: 'Penny Pincher', icon: '🪙', desc: 'Eliminate all countries with GDP under 25,000,000,000.' },
  { name: 'Tidal Force', icon: '🌊', desc: 'Eliminate all countries with a coastline.' },
  { name: 'Landlocked', icon: '🏜️', desc: 'Eliminate all countries with no coastline.' },
  { name: 'Baby Boomer', icon: '👶', desc: 'Special action (not yet implemented).' },
  { name: 'Gamma Burst', icon: '☢️', desc: 'Eliminate all countries with nuclear arms.' },
  { name: 'Click and Entry', icon: '🖱️', desc: 'Click a flag to zoom and enter its country or code. If correct, that flag is eliminated as an action.' }
];

function renderSaviourActions() {
  const actionsDiv = document.getElementById('saviour-actions');
  actionsDiv.innerHTML = '';
  // Render as two columns, five rows
  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.gap = '0.5em';
    rowDiv.style.marginBottom = '0.5em';
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col;
      if (idx >= SAVIOUR_ACTIONS.length) continue;
      const action = SAVIOUR_ACTIONS[idx];
      const btn = document.createElement('button');
      btn.className = 'saviour-action-btn';
      btn.innerHTML = `${action.icon} <span style="font-size:0.95em;">${action.name}</span>`;
      // Only disable if already used or game over
      btn.disabled = !!saviourUsedActions[idx] || saviourGameOver;
      // Action handlers
      let handler = null;
      switch (action.name) {
        case 'Gamma Burst': handler = () => gammaBurstAction(idx); break;
        case 'Freeze Ray': handler = () => freezeRayAction(idx); break;
        case 'Heat Ray': handler = () => heatRayAction(idx); break;
        case 'Tidal Force': handler = () => tidalForceAction(idx); break;
        case 'Landlocked': handler = () => landlockedAction(idx); break;
        case 'Tailor': handler = () => tailorAction(idx); break;
        case 'Penny Pincher': handler = () => pennyPincherAction(idx); break;
        case 'Money Bags': handler = () => moneyBagsAction(idx); break;
        case 'Shrink Ray': handler = () => shrinkRayAction(idx); break;
        case 'Baby Boomer': handler = () => babyBoomerAction ? babyBoomerAction(idx) : () => {}; break;
        default: handler = () => {};
      }
      btn.onclick = handler;
      rowDiv.appendChild(btn);
    }
    actionsDiv.appendChild(rowDiv);
  }
}

function processSaviourAction(idx, actionName, eliminationCondition) {
  if (saviourUsedActions[idx] || saviourGameOver) return;
  saveSaviourActionState(actionName);
  let eliminatedSaviour = false;
  for (let i = 0; i < saviourGrid.length; i++) {
    if (saviourActive[i] && eliminationCondition(saviourGrid[i])) {
      saviourActive[i] = false;
      if (i === saviourHighlightIndex) eliminatedSaviour = true;
    }
  }
  saviourUsedActions[idx] = true;
  saviourScore++;
  if (eliminatedSaviour) {
    saviourGameOver = true;
    const mainResultDiv = document.getElementById('result-saviour');
    if (mainResultDiv) {
      mainResultDiv.innerHTML = `<span style='color:#c62828;font-weight:bold;'>❌ Game Over! The saviour flag was eliminated.</span>`;
    }
    showSaviourGameOver();
    return;
  }
  renderSaviourGrid();
  updateSaviourScoreDisplays();
  renderSaviourActions();
}

function gammaBurstAction(idx) {
  processSaviourAction(idx, 'Gamma Burst', flag => flag.nuclear_arms);
}

function freezeRayAction(idx) {
  processSaviourAction(idx, 'Freeze Ray', flag => flag.max_lat > 66.5 || flag.min_lat < -66.5);
}

function heatRayAction(idx) {
  processSaviourAction(idx, 'Heat Ray', flag => flag.min_lat > 23.5 || flag.max_lat < -23.5);
}

function tidalForceAction(idx) {
  processSaviourAction(idx, 'Tidal Force', flag => flag.coastline_km > 0);
}

function landlockedAction(idx) {
  processSaviourAction(idx, 'Landlocked', flag => flag.coastline_km === 0);
}

function tailorAction(idx) {
  processSaviourAction(idx, 'Tailor', flag => flag.area >= 83879);
}

function shrinkRayAction(idx) {
  processSaviourAction(idx, 'Shrink Ray', flag => flag.area < 83879);
}

function pennyPincherAction(idx) {
  processSaviourAction(idx, 'Penny Pincher', flag => flag.gdp < 25000000000);
}

function moneyBagsAction(idx) {
  processSaviourAction(idx, 'Money Bags', flag => flag.gdp >= 25000000000);
}

function babyBoomerAction(idx) {

  // Placeholder for future implementation
  alert('Baby Boomer action is not yet implemented.');
}

function setupSaviourActions() {
  renderSaviourActions();
  renderSaviourUndoRedo();
  setTimeout(() => {
    const infoBtn = document.getElementById('saviour-info-btn');
    if (infoBtn) infoBtn.onclick = showSaviourInfoPopout;
  }, 0);
}

function showSaviourInfoPopout() {
  // Remove if already present
  let existing = document.getElementById('saviour-info-popout');
  if (existing) existing.remove();
  // Create popout
  const pop = document.createElement('div');
  pop.id = 'saviour-info-popout';
  pop.style.position = 'fixed';
  pop.style.zIndex = '2000';
  pop.style.left = '0';
  pop.style.top = '0';
  pop.style.width = '100vw';
  pop.style.height = '100vh';
  pop.style.background = 'rgba(0,0,0,0.45)';
  pop.style.display = 'flex';
  pop.style.alignItems = 'center';
  pop.style.justifyContent = 'center';
  pop.innerHTML = `
    <div style="background:#fff;padding:1.5em 1.2em 1.2em 1.2em;border-radius:1.1em;max-width:95vw;box-shadow:0 2px 16px #0003;min-width:270px;position:relative;">
      <button id="saviour-info-close" style="position:absolute;top:0.5em;right:0.7em;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;text-align:center;font-size:1.2em;">Saviour Actions</h3>
      <div style="display:grid;grid-template-columns:1.5em 1fr;gap:0.5em 0.7em;align-items:center;">
        ${SAVIOUR_ACTION_DESCRIPTIONS.map(a => `<span>${a.icon}</span><span><b>${a.name}:</b> ${a.desc}</span>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(pop);
  document.getElementById('saviour-info-close').onclick = () => pop.remove();
  pop.onclick = e => { if (e.target === pop) pop.remove(); };
}

// Patch showSaviourMode to call setupSaviourActions
const _origShowSaviourMode = showSaviourMode;
showSaviourMode = function() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-entry').style.display = 'none';
  document.getElementById('game-mc').style.display = 'none';
  document.getElementById('game-rc').style.display = 'none';
  document.getElementById('study-page').style.display = 'none';
  document.getElementById('game-saviour').style.display = 'flex';
  saviourStreak = 0;
  updateSaviourScoreDisplays();
  // --- NEW: Clear result message on new game ---
  const resultDiv = document.getElementById('result-saviour');
  if (resultDiv) resultDiv.innerHTML = '';
  setupSaviourGrid();
  setupSaviourActions();
};