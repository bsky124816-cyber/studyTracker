// StudyBuddy Main Application Logic
// Handles Pomodoro, Flashcards, Quiz, Streaks, Progress & Storage

(function () {
  'use strict';

  // ============================================================
  // STORAGE & STATE
  // ============================================================
  const STORAGE_KEYS = {
    DECKS: 'studybuddy_decks_v1',
    CUSTOM_QUIZZES: 'studybuddy_custom_quizzes_v1',
    SETTINGS: 'studybuddy_settings_v1',
    STATS: 'studybuddy_stats_v1',
    THEME: 'studybuddy_theme_v1'
  };

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let state = {
    decks: [],
    customQuizzes: [],
    settings: {},
    stats: {
      streak: 1,
      bestStreak: 1,
      lastActiveDate: null,
      weekActivity: {}, // { 'YYYY-MM-DD': true }
      totalFocusMinutes: 0,
      completedPomodoros: 0,
      cardsReviewed: 0,
      quizzesCompleted: 0,
      totalQuizScore: 0,
      today: {
        date: getTodayString(),
        pomodoros: 0,
        flashcards: 0,
        quizzes: 0
      },
      activityLog: []
    }
  };

  function loadState() {
    try {
      const savedDecks = localStorage.getItem(STORAGE_KEYS.DECKS);
      state.decks = savedDecks ? JSON.parse(savedDecks) : JSON.parse(JSON.stringify(DEFAULT_DECKS));

      const savedQuizzes = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES);
      state.customQuizzes = savedQuizzes ? JSON.parse(savedQuizzes) : JSON.parse(JSON.stringify(DEFAULT_CUSTOM_QUIZZES));

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      state.settings = savedSettings ? JSON.parse(savedSettings) : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

      const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (savedStats) {
        state.stats = { ...state.stats, ...JSON.parse(savedStats) };
      }

      // Ensure today's object is fresh if date rolled over
      const todayStr = getTodayString();
      if (!state.stats.today || state.stats.today.date !== todayStr) {
        state.stats.today = {
          date: todayStr,
          pomodoros: 0,
          flashcards: 0,
          quizzes: 0
        };
      }

      // Check streak validity on load
      checkStreakStatus();

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      state.decks = JSON.parse(JSON.stringify(DEFAULT_DECKS));
      state.customQuizzes = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_QUIZZES));
      state.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(state.decks));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(state.customQuizzes));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(state.stats));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // ============================================================
  // STREAK & ACTIVITY TRACKING
  // ============================================================
  function checkStreakStatus() {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = state.stats.lastActiveDate;

    if (!lastActive) {
      state.stats.streak = 1;
      return;
    }

    if (lastActive === today) {
      // Streak already active today
      return;
    } else if (lastActive === yesterday) {
      // Streak is safe, waiting for today's activity
      return;
    } else {
      // More than 1 day missed: reset to 0 until an action is done today
      state.stats.streak = 0;
    }
  }

  function recordActivity(type, description) {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = state.stats.lastActiveDate;

    // Streak increment logic
    if (lastActive !== today) {
      if (lastActive === yesterday) {
        state.stats.streak += 1;
      } else {
        state.stats.streak = 1;
      }
      state.stats.lastActiveDate = today;
      showToast(`🔥 Streak continued! ${state.stats.streak} day streak!`);
    }

    if (state.stats.streak > state.stats.bestStreak) {
      state.stats.bestStreak = state.stats.streak;
    }

    // Mark today as active in week record
    state.stats.weekActivity[today] = true;

    // Log item
    const d = new Date();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.stats.activityLog.unshift({
      id: Date.now().toString(),
      type: type,
      text: description,
      time: timeStr,
      date: today
    });

    if (state.stats.activityLog.length > 50) {
      state.stats.activityLog.pop();
    }

    saveState();
    updateStreakUI();
    renderProgressUI();
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ============================================================
  // TAB NAVIGATION
  // ============================================================
  function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        window.soundEngine.playClick();
        const targetId = tab.getAttribute('data-tab');

        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const activeContent = document.getElementById(`tab-${targetId}`);
        if (activeContent) {
          activeContent.classList.add('active');
        }

        // Re-render subviews when tab opens
        if (targetId === 'flashcards') {
          renderFlashcardsView();
        } else if (targetId === 'progress') {
          renderProgressUI();
        } else if (targetId === 'quiz') {
          initQuizSetup();
        }
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEYS.THEME, next);
        updateThemeIcon(next);
        window.soundEngine.playClick();
      });
    }

    // Audio Mute toggle
    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        window.soundEngine.soundEnabled = !window.soundEngine.soundEnabled;
        muteBtn.classList.toggle('active', window.soundEngine.soundEnabled);
        muteBtn.innerHTML = window.soundEngine.soundEnabled ? '🔊' : '🔇';
        showToast(window.soundEngine.soundEnabled ? 'Sound enabled' : 'Sound muted');
      });
    }

    // Ambient Rain toggle
    const ambientBtn = document.getElementById('btn-ambient-rain');
    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        const isPlaying = window.soundEngine.toggleAmbient(state.settings.ambientVolume || 0.08);
        ambientBtn.classList.toggle('active', isPlaying);
        showToast(isPlaying ? '🌧️ Focus Rain Ambience Playing' : 'Ambience paused');
      });
    }

    // Streak badge click jumps to progress
    const streakBadge = document.getElementById('header-streak-badge');
    if (streakBadge) {
      streakBadge.addEventListener('click', () => {
        const progressTab = document.querySelector('[data-tab="progress"]');
        if (progressTab) progressTab.click();
      });
    }
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  // ============================================================
  // POMODORO TIMER
  // ============================================================
  let pomoTimer = {
    mode: 'pomo', // 'pomo', 'short', 'long'
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    intervalId: null,
    sessionCount: 0
  };

  const CIRCLE_RADIUS = 110;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~691.15

  function initPomodoro() {
    pomoTimer.timeLeft = state.settings.pomoTime * 60;
    pomoTimer.totalTime = pomoTimer.timeLeft;

    // Mode buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (pomoTimer.isRunning) {
          if (!confirm('Timer is active. Switch mode and reset?')) return;
          pauseTimer();
        }
        window.soundEngine.playClick();
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-mode');
        switchPomodoroMode(mode);
      });
    });

    // Control buttons
    const btnToggle = document.getElementById('btn-timer-toggle');
    const btnReset = document.getElementById('btn-timer-reset');
    const btnSkip = document.getElementById('btn-timer-skip');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        window.soundEngine.playClick();
        if (pomoTimer.isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        window.soundEngine.playClick();
        resetTimer();
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        window.soundEngine.playClick();
        skipTimer();
      });
    }

    // Timer Settings modal button
    const btnSettings = document.getElementById('btn-timer-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', openTimerSettingsModal);
    }

    updateTimerDisplay();
  }

  function switchPomodoroMode(mode) {
    pomoTimer.mode = mode;
    let mins = state.settings.pomoTime;
    let statusText = 'Focus Session';

    if (mode === 'short') {
      mins = state.settings.shortBreakTime;
      statusText = 'Short Break';
    } else if (mode === 'long') {
      mins = state.settings.longBreakTime;
      statusText = 'Long Break';
    }

    pomoTimer.timeLeft = mins * 60;
    pomoTimer.totalTime = pomoTimer.timeLeft;
    document.getElementById('timer-status-text').textContent = statusText;
    updateTimerDisplay();
  }

  function startTimer() {
    pomoTimer.isRunning = true;
    updatePlayPauseButton();

    pomoTimer.intervalId = setInterval(() => {
      if (pomoTimer.timeLeft > 0) {
        pomoTimer.timeLeft--;
        updateTimerDisplay();
      } else {
        timerFinished();
      }
    }, 1000);
  }

  function pauseTimer() {
    pomoTimer.isRunning = false;
    clearInterval(pomoTimer.intervalId);
    pomoTimer.intervalId = null;
    updatePlayPauseButton();
  }

  function resetTimer() {
    pauseTimer();
    switchPomodoroMode(pomoTimer.mode);
  }

  function skipTimer() {
    pauseTimer();
    if (pomoTimer.mode === 'pomo') {
      pomoTimer.sessionCount++;
      const nextMode = (pomoTimer.sessionCount % state.settings.longBreakInterval === 0) ? 'long' : 'short';
      activateModeBtn(nextMode);
      switchPomodoroMode(nextMode);
    } else {
      activateModeBtn('pomo');
      switchPomodoroMode('pomo');
    }
  }

  function activateModeBtn(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
  }

  function timerFinished() {
    pauseTimer();
    window.soundEngine.playChime();

    const taskInput = document.getElementById('pomo-current-task');
    const taskName = taskInput && taskInput.value.trim() ? taskInput.value.trim() : 'Focus Session';

    if (pomoTimer.mode === 'pomo') {
      pomoTimer.sessionCount++;
      state.stats.completedPomodoros++;
      const durationMins = Math.round(pomoTimer.totalTime / 60);
      state.stats.totalFocusMinutes += durationMins;
      state.stats.today.pomodoros++;

      recordActivity('pomo', `Completed ${durationMins}m Focus: "${taskName}"`);
      showToast(`🎉 Focus session complete! Time for a well-deserved break!`);
      triggerConfetti(35);

      // Auto transition to break
      const isLong = pomoTimer.sessionCount % state.settings.longBreakInterval === 0;
      const nextMode = isLong ? 'long' : 'short';
      activateModeBtn(nextMode);
      switchPomodoroMode(nextMode);

      if (state.settings.autoStartBreaks) {
        startTimer();
      }
    } else {
      showToast(`⚡ Break over! Ready to focus again?`);
      activateModeBtn('pomo');
      switchPomodoroMode('pomo');

      if (state.settings.autoStartPomos) {
        startTimer();
      }
    }

    updatePomoDots();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(pomoTimer.timeLeft / 60);
    const secs = pomoTimer.timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const digitsEl = document.getElementById('timer-digits');
    if (digitsEl) digitsEl.textContent = formatted;

    // Document title update
    document.title = pomoTimer.isRunning ? `(${formatted}) StudyBuddy` : 'StudyBuddy - Focus & Learn';

    // Update circular SVG progress
    const circle = document.getElementById('timer-progress-circle');
    if (circle) {
      const fraction = pomoTimer.timeLeft / pomoTimer.totalTime;
      const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
      circle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE}`;
      circle.style.strokeDashoffset = `${offset}`;
    }
  }

  function updatePlayPauseButton() {
    const btn = document.getElementById('btn-timer-toggle');
    if (!btn) return;
    if (pomoTimer.isRunning) {
      btn.innerHTML = `<span>⏸️</span><span>Pause</span>`;
      btn.classList.add('running');
    } else {
      btn.innerHTML = `<span>▶️</span><span>Start Focus</span>`;
      btn.classList.remove('running');
    }
  }

  function updatePomoDots() {
    const dotsContainer = document.getElementById('pomo-session-dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    const max = state.settings.longBreakInterval || 4;
    const currentInCycle = (pomoTimer.sessionCount % max);

    for (let i = 0; i < max; i++) {
      const dot = document.createElement('div');
      dot.className = `session-dot ${i < currentInCycle ? 'completed' : ''}`;
      dotsContainer.appendChild(dot);
    }

    const countText = document.getElementById('pomo-today-count');
    if (countText) {
      countText.textContent = `${state.stats.today.pomodoros} today`;
    }
  }

  // Timer Settings Modal
  function openTimerSettingsModal() {
    const modal = document.getElementById('modal-timer-settings');
    if (!modal) return;

    document.getElementById('input-setting-pomo').value = state.settings.pomoTime;
    document.getElementById('input-setting-short').value = state.settings.shortBreakTime;
    document.getElementById('input-setting-long').value = state.settings.longBreakTime;
    document.getElementById('input-setting-interval').value = state.settings.longBreakInterval;

    modal.classList.add('open');
  }

  function saveTimerSettings() {
    const pomo = parseInt(document.getElementById('input-setting-pomo').value, 10) || 25;
    const sBreak = parseInt(document.getElementById('input-setting-short').value, 10) || 5;
    const lBreak = parseInt(document.getElementById('input-setting-long').value, 10) || 15;
    const interval = parseInt(document.getElementById('input-setting-interval').value, 10) || 4;

    state.settings.pomoTime = Math.max(1, Math.min(120, pomo));
    state.settings.shortBreakTime = Math.max(1, Math.min(60, sBreak));
    state.settings.longBreakTime = Math.max(1, Math.min(90, lBreak));
    state.settings.longBreakInterval = Math.max(1, Math.min(12, interval));

    saveState();
    closeAllModals();
    resetTimer();
    updatePomoDots();
    showToast('Timer settings saved!');
  }

  // ============================================================
  // FLASHCARDS
  // ============================================================
  let flashcardState = {
    selectedDeckId: 'all',
    activeCards: [],
    currentIndex: 0,
    isFlipped: false,
    viewMode: 'study' // 'study' or 'manager'
  };

  function initFlashcards() {
    // Populate deck select dropdown
    populateDeckSelect();

    const deckSelect = document.getElementById('deck-select');
    if (deckSelect) {
      deckSelect.addEventListener('change', (e) => {
        flashcardState.selectedDeckId = e.target.value;
        loadActiveCards();
        renderCard();
      });
    }

    // 3D Card click to flip
    const cardEl = document.getElementById('flashcard-3d-element');
    if (cardEl) {
      cardEl.addEventListener('click', (e) => {
        // Prevent flipping if clicked an action button
        if (e.target.closest('.no-flip')) return;
        flipCurrentCard();
      });
    }

    // Flip button
    const btnFlip = document.getElementById('btn-card-flip');
    if (btnFlip) {
      btnFlip.addEventListener('click', flipCurrentCard);
    }

    // Mastered button
    const btnMastered = document.getElementById('btn-card-mastered');
    if (btnMastered) {
      btnMastered.addEventListener('click', () => rateCard('mastered'));
    }

    // Need Review button
    const btnReview = document.getElementById('btn-card-review');
    if (btnReview) {
      btnReview.addEventListener('click', () => rateCard('review'));
    }

    // Shuffle button
    const btnShuffle = document.getElementById('btn-shuffle-deck');
    if (btnShuffle) {
      btnShuffle.addEventListener('click', shuffleCurrentDeck);
    }

    // New Deck button
    const btnNewDeck = document.getElementById('btn-modal-new-deck');
    if (btnNewDeck) {
      btnNewDeck.addEventListener('click', () => {
        document.getElementById('modal-new-deck').classList.add('open');
      });
    }

    // Add Card button
    const btnAddCard = document.getElementById('btn-modal-add-card');
    if (btnAddCard) {
      btnAddCard.addEventListener('click', openAddCardModal);
    }

    // View mode toggle (Study vs Manage)
    const btnToggleManager = document.getElementById('btn-toggle-deck-manager');
    if (btnToggleManager) {
      btnToggleManager.addEventListener('click', () => {
        flashcardState.viewMode = flashcardState.viewMode === 'study' ? 'manager' : 'study';
        btnToggleManager.textContent = flashcardState.viewMode === 'study' ? '🗂️ Manage Cards' : '📖 Study Mode';
        renderFlashcardsView();
      });
    }

    // Keyboard shortcuts for study
    window.addEventListener('keydown', (e) => {
      const activeTab = document.querySelector('.tab-content.active');
      if (!activeTab || activeTab.id !== 'tab-flashcards') return;
      if (document.querySelector('.modal-overlay.open')) return; // ignore if modal open
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        flipCurrentCard();
      } else if (e.code === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        rateCard('mastered');
      } else if (e.code === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        rateCard('review');
      }
    });

    loadActiveCards();
    renderCard();
  }

  function populateDeckSelect() {
    const deckSelect = document.getElementById('deck-select');
    const modalDeckSelect = document.getElementById('input-card-deck');
    if (!deckSelect) return;

    let html = `<option value="all">🌟 All Decks (${getAllCards().length} cards)</option>`;
    let modalHtml = '';

    state.decks.forEach(deck => {
      html += `<option value="${deck.id}">${deck.name} (${deck.cards.length})</option>`;
      modalHtml += `<option value="${deck.id}">${deck.name}</option>`;
    });

    deckSelect.innerHTML = html;
    deckSelect.value = flashcardState.selectedDeckId;

    if (modalDeckSelect) {
      modalDeckSelect.innerHTML = modalHtml;
    }
  }

  function getAllCards() {
    let all = [];
    state.decks.forEach(d => {
      d.cards.forEach(c => all.push({ ...c, deckName: d.name, deckId: d.id }));
    });
    return all;
  }

  function loadActiveCards() {
    if (flashcardState.selectedDeckId === 'all') {
      flashcardState.activeCards = getAllCards();
    } else {
      const deck = state.decks.find(d => d.id === flashcardState.selectedDeckId);
      flashcardState.activeCards = deck ? [...deck.cards] : [];
    }
    flashcardState.currentIndex = 0;
    flashcardState.isFlipped = false;
  }

  function renderFlashcardsView() {
    const studyView = document.getElementById('flashcards-study-view');
    const managerView = document.getElementById('flashcards-manager-view');

    if (flashcardState.viewMode === 'study') {
      if (studyView) studyView.style.display = 'block';
      if (managerView) managerView.style.display = 'none';
      renderCard();
    } else {
      if (studyView) studyView.style.display = 'none';
      if (managerView) managerView.style.display = 'block';
      renderDeckManagerTable();
    }
  }

  function renderCard() {
    const cardEl = document.getElementById('flashcard-3d-element');
    const emptyBox = document.getElementById('flashcards-empty-state');
    const activeCards = flashcardState.activeCards;

    if (!activeCards || activeCards.length === 0) {
      if (cardEl) cardEl.style.display = 'none';
      if (emptyBox) emptyBox.style.display = 'block';
      document.getElementById('card-counter-label').textContent = '0 / 0';
      document.getElementById('card-progress-fill').style.width = '0%';
      return;
    }

    if (cardEl) cardEl.style.display = 'block';
    if (emptyBox) emptyBox.style.display = 'none';

    // Wrap index safely
    if (flashcardState.currentIndex >= activeCards.length) {
      flashcardState.currentIndex = 0;
    }

    const card = activeCards[flashcardState.currentIndex];

    // Reset flip
    flashcardState.isFlipped = false;
    cardEl.classList.remove('flipped');

    // Populate front
    document.getElementById('card-front-text').textContent = card.question;
    document.getElementById('card-back-text').textContent = card.answer;

    // Status indicator dot
    const statusDot = document.getElementById('card-status-dot');
    if (statusDot) {
      statusDot.className = `card-status-dot ${card.status || ''}`;
    }

    // Counter and progress
    const idx = flashcardState.currentIndex + 1;
    const total = activeCards.length;
    document.getElementById('card-counter-label').textContent = `Card ${idx} of ${total}`;
    const percent = Math.round((idx / total) * 100);
    document.getElementById('card-progress-fill').style.width = `${percent}%`;
  }

  function flipCurrentCard() {
    const cardEl = document.getElementById('flashcard-3d-element');
    if (!cardEl) return;

    window.soundEngine.playFlip();
    flashcardState.isFlipped = !flashcardState.isFlipped;
    cardEl.classList.toggle('flipped', flashcardState.isFlipped);
  }

  function rateCard(status) {
    if (flashcardState.activeCards.length === 0) return;
    const card = flashcardState.activeCards[flashcardState.currentIndex];

    // Update in state.decks
    state.decks.forEach(d => {
      const target = d.cards.find(c => c.id === card.id);
      if (target) {
        target.status = status;
      }
    });

    card.status = status;
    state.stats.cardsReviewed++;
    state.stats.today.flashcards++;

    if (status === 'mastered') {
      window.soundEngine.playCorrect();
      recordActivity('flashcard', `Mastered card: "${card.question.slice(0, 30)}..."`);
    } else {
      window.soundEngine.playClick();
      recordActivity('flashcard', `Reviewed card: "${card.question.slice(0, 30)}..."`);
    }

    // Move to next card
    flashcardState.currentIndex = (flashcardState.currentIndex + 1) % flashcardState.activeCards.length;
    saveState();
    renderCard();
    renderProgressUI();
  }

  function shuffleCurrentDeck() {
    window.soundEngine.playFlip();
    const array = flashcardState.activeCards;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    flashcardState.currentIndex = 0;
    renderCard();
    showToast('Deck shuffled!');
  }

  // Deck Manager Table
  function renderDeckManagerTable() {
    const tableBody = document.getElementById('cards-table-body');
    if (!tableBody) return;

    let cards = [];
    if (flashcardState.selectedDeckId === 'all') {
      cards = getAllCards();
    } else {
      const deck = state.decks.find(d => d.id === flashcardState.selectedDeckId);
      cards = deck ? deck.cards.map(c => ({ ...c, deckName: deck.name, deckId: deck.id })) : [];
    }

    if (cards.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-dim);">No cards in this deck yet. Click "+ Add Card" to create one!</td></tr>`;
      return;
    }

    tableBody.innerHTML = cards.map(c => `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(c.question)}</td>
        <td>${escapeHtml(c.answer)}</td>
        <td><span class="card-status-dot ${c.status || ''}" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span>${c.status || 'unlearned'}</td>
        <td style="text-align: right;">
          <button class="btn-table-action" onclick="deleteCard('${c.deckId}', '${c.id}')" title="Delete Card">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteCard = function (deckId, cardId) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    const deck = state.decks.find(d => d.id === deckId);
    if (deck) {
      deck.cards = deck.cards.filter(c => c.id !== cardId);
      saveState();
      populateDeckSelect();
      loadActiveCards();
      renderFlashcardsView();
      showToast('Card deleted.');
    }
  };

  function openAddCardModal() {
    populateDeckSelect();
    const modal = document.getElementById('modal-add-card');
    if (modal) modal.classList.add('open');
  }

  function handleCreateCardSubmit(e) {
    e.preventDefault();
    const deckId = document.getElementById('input-card-deck').value;
    const question = document.getElementById('input-card-question').value.trim();
    const answer = document.getElementById('input-card-answer').value.trim();

    if (!question || !answer) {
      alert('Please enter both question and answer.');
      return;
    }

    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;

    deck.cards.push({
      id: 'c_' + Date.now(),
      question: question,
      answer: answer,
      status: 'unlearned'
    });

    saveState();
    closeAllModals();
    document.getElementById('form-add-card').reset();
    populateDeckSelect();
    loadActiveCards();
    renderFlashcardsView();
    showToast('New flashcard created!');
  }

  function handleCreateDeckSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('input-deck-name').value.trim();
    const desc = document.getElementById('input-deck-desc').value.trim();

    if (!name) {
      alert('Please enter a deck name.');
      return;
    }

    const newDeck = {
      id: 'deck_' + Date.now(),
      name: name,
      description: desc,
      cards: []
    };

    state.decks.push(newDeck);
    flashcardState.selectedDeckId = newDeck.id;

    saveState();
    closeAllModals();
    document.getElementById('form-new-deck').reset();
    populateDeckSelect();
    loadActiveCards();
    renderFlashcardsView();
    showToast(`Deck "${name}" created!`);
  }

  // ============================================================
  // QUIZ ENGINE
  // ============================================================
  let quizState = {
    mode: 'flashcards', // 'flashcards' or 'custom'
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    score: 0,
    isAnswered: false,
    selectedDeckId: 'all'
  };

  function initQuizSetup() {
    const setupCard = document.getElementById('quiz-setup-section');
    const playerCard = document.getElementById('quiz-player-section');
    const resultsCard = document.getElementById('quiz-results-section');

    if (setupCard) setupCard.style.display = 'block';
    if (playerCard) playerCard.style.display = 'none';
    if (resultsCard) resultsCard.style.display = 'none';

    // Populate quiz deck selector
    const quizDeckSelect = document.getElementById('quiz-deck-select');
    if (quizDeckSelect) {
      quizDeckSelect.innerHTML = `<option value="all">🌟 All Decks Mixed (${getAllCards().length} cards)</option>` +
        state.decks.map(d => `<option value="${d.id}">${d.name} (${d.cards.length} cards)</option>`).join('');
    }

    // Populate custom quiz selector
    const customQuizSelect = document.getElementById('custom-quiz-select');
    if (customQuizSelect) {
      customQuizSelect.innerHTML = state.customQuizzes.map(q => `<option value="${q.id}">${q.title} (${q.questions.length} Qs)</option>`).join('');
    }

    // Mode box selection
    const modeBoxes = document.querySelectorAll('.quiz-mode-box');
    modeBoxes.forEach(box => {
      box.addEventListener('click', () => {
        modeBoxes.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        quizState.mode = box.getAttribute('data-quiz-mode');

        document.getElementById('quiz-options-flashcards').style.display = quizState.mode === 'flashcards' ? 'block' : 'none';
        document.getElementById('quiz-options-custom').style.display = quizState.mode === 'custom' ? 'block' : 'none';
      });
    });

    const btnStart = document.getElementById('btn-start-quiz');
    if (btnStart) {
      btnStart.onclick = startQuiz;
    }

    const btnNext = document.getElementById('btn-quiz-next');
    if (btnNext) {
      btnNext.onclick = nextQuizQuestion;
    }

    const btnRetake = document.getElementById('btn-retake-quiz');
    if (btnRetake) {
      btnRetake.onclick = initQuizSetup;
    }

    const btnNewCustomQuiz = document.getElementById('btn-modal-new-quiz');
    if (btnNewCustomQuiz) {
      btnNewCustomQuiz.onclick = () => {
        document.getElementById('modal-new-quiz').classList.add('open');
      };
    }
  }

  function startQuiz() {
    window.soundEngine.playClick();
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.userAnswers = [];
    quizState.isAnswered = false;

    if (quizState.mode === 'flashcards') {
      const deckId = document.getElementById('quiz-deck-select').value;
      const count = parseInt(document.getElementById('quiz-question-count').value, 10) || 5;

      let sourceCards = deckId === 'all' ? getAllCards() : (state.decks.find(d => d.id === deckId)?.cards || []);

      if (sourceCards.length < 3) {
        alert('You need at least 3 flashcards in this deck to generate a multiple-choice quiz!');
        return;
      }

      quizState.questions = generateQuizFromCards(sourceCards, count);
    } else {
      const quizId = document.getElementById('custom-quiz-select').value;
      const custom = state.customQuizzes.find(q => q.id === quizId);
      if (!custom || custom.questions.length === 0) {
        alert('Selected quiz has no questions.');
        return;
      }
      quizState.questions = JSON.parse(JSON.stringify(custom.questions));
    }

    document.getElementById('quiz-setup-section').style.display = 'none';
    document.getElementById('quiz-player-section').style.display = 'block';
    document.getElementById('quiz-results-section').style.display = 'none';

    renderCurrentQuizQuestion();
  }

  // Generates multiple choice questions with distractors from flashcards
  function generateQuizFromCards(cards, count) {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, cards.length));

    return selected.map((card, idx) => {
      // Pick 3 distractors
      const otherAnswers = cards
        .filter(c => c.id !== card.id)
        .map(c => c.answer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Fallback if not enough other cards
      while (otherAnswers.length < 3) {
        otherAnswers.push(`Option ${otherAnswers.length + 1} (Alternative response)`);
      }

      const options = [card.answer, ...otherAnswers].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(card.answer);

      return {
        id: 'gen_' + idx,
        question: card.question,
        options: options,
        correctIndex: correctIndex,
        explanation: `Answer: ${card.answer}`
      };
    });
  }

  function renderCurrentQuizQuestion() {
    quizState.isAnswered = false;
    const q = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;

    document.getElementById('quiz-current-num').textContent = `Question ${quizState.currentIndex + 1} of ${total}`;
    document.getElementById('quiz-score-indicator').textContent = `Score: ${quizState.score}`;
    document.getElementById('quiz-progress-fill').style.width = `${((quizState.currentIndex) / total) * 100}%`;
    document.getElementById('quiz-prompt-text').textContent = q.question;

    const feedbackBox = document.getElementById('quiz-feedback-box');
    feedbackBox.classList.remove('active');
    feedbackBox.innerHTML = '';

    const btnNext = document.getElementById('btn-quiz-next');
    btnNext.style.display = 'none';

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span class="quiz-opt-letter">${letters[idx] || idx + 1}</span> <span>${escapeHtml(opt)}</span>`;
      btn.addEventListener('click', () => selectQuizOption(idx, btn));
      optionsContainer.appendChild(btn);
    });
  }

  function selectQuizOption(selectedIndex, btnElement) {
    if (quizState.isAnswered) return;
    quizState.isAnswered = true;

    const q = quizState.questions[quizState.currentIndex];
    const allButtons = document.querySelectorAll('.quiz-option-btn');
    allButtons.forEach(b => b.disabled = true);

    const isCorrect = selectedIndex === q.correctIndex;
    quizState.userAnswers.push({ question: q.question, isCorrect: isCorrect });

    if (isCorrect) {
      window.soundEngine.playCorrect();
      btnElement.classList.add('correct');
      quizState.score++;
      document.getElementById('quiz-score-indicator').textContent = `Score: ${quizState.score}`;
    } else {
      window.soundEngine.playIncorrect();
      btnElement.classList.add('incorrect');
      if (allButtons[q.correctIndex]) {
        allButtons[q.correctIndex].classList.add('correct');
      }
    }

    // Feedback explanation
    const feedbackBox = document.getElementById('quiz-feedback-box');
    feedbackBox.classList.add('active');
    feedbackBox.innerHTML = `
      <strong>${isCorrect ? '✅ Excellent!' : '❌ Not quite.'}</strong>
      <div>${escapeHtml(q.explanation || '')}</div>
    `;

    const btnNext = document.getElementById('btn-quiz-next');
    btnNext.style.display = 'inline-flex';
    btnNext.textContent = quizState.currentIndex + 1 < quizState.questions.length ? 'Next Question →' : 'Finish Quiz 🏁';
  }

  function nextQuizQuestion() {
    window.soundEngine.playClick();
    quizState.currentIndex++;

    if (quizState.currentIndex < quizState.questions.length) {
      renderCurrentQuizQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const total = quizState.questions.length;
    const percent = Math.round((quizState.score / total) * 100);

    state.stats.quizzesCompleted++;
    state.stats.totalQuizScore += percent;
    state.stats.today.quizzes++;

    recordActivity('quiz', `Finished Quiz: scored ${quizState.score}/${total} (${percent}%)`);

    document.getElementById('quiz-player-section').style.display = 'none';
    document.getElementById('quiz-results-section').style.display = 'block';

    document.getElementById('result-percent-text').textContent = `${percent}%`;
    document.getElementById('result-fraction-text').textContent = `${quizState.score} / ${total} Correct`;

    let title = 'Great Effort!';
    let desc = 'Keep practicing to master these topics!';
    if (percent === 100) {
      title = '🏆 Perfect Score!';
      desc = 'Outstanding mastery! You nailed every question!';
      triggerConfetti(60);
    } else if (percent >= 80) {
      title = '🌟 Fantastic Job!';
      desc = 'You have a solid command of the material!';
      triggerConfetti(40);
    } else if (percent >= 60) {
      title = '👍 Good Work!';
      desc = 'Review the cards you missed and try again to improve!';
    }

    document.getElementById('result-title-text').textContent = title;
    document.getElementById('result-desc-text').textContent = desc;

    saveState();
    renderProgressUI();
  }

  function handleCreateQuizSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('input-quiz-title').value.trim();
    const q1Text = document.getElementById('input-q1-text').value.trim();
    const q1Correct = document.getElementById('input-q1-correct').value.trim();
    const q1W1 = document.getElementById('input-q1-w1').value.trim();
    const q1W2 = document.getElementById('input-q1-w2').value.trim();
    const q1W3 = document.getElementById('input-q1-w3').value.trim();

    if (!title || !q1Text || !q1Correct || !q1W1) {
      alert('Please fill out the quiz title, question, correct answer, and wrong options.');
      return;
    }

    const options = [q1Correct, q1W1, q1W2 || 'Alternative A', q1W3 || 'Alternative B'].sort(() => 0.5 - Math.random());
    const correctIdx = options.indexOf(q1Correct);

    const newQuiz = {
      id: 'quiz_' + Date.now(),
      title: title,
      description: 'Custom community quiz',
      questions: [
        {
          id: 'q_' + Date.now(),
          question: q1Text,
          options: options,
          correctIndex: correctIdx,
          explanation: `Correct: ${q1Correct}`
        }
      ]
    };

    state.customQuizzes.push(newQuiz);
    saveState();
    closeAllModals();
    document.getElementById('form-new-quiz').reset();
    initQuizSetup();
    showToast(`Quiz "${title}" created!`);
  }

  // ============================================================
  // PROGRESS & STREAK UI
  // ============================================================
  function updateStreakUI() {
    const badgeFlame = document.getElementById('header-streak-count');
    if (badgeFlame) {
      badgeFlame.textContent = state.stats.streak;
    }

    const heroStreakNum = document.getElementById('streak-hero-days');
    if (heroStreakNum) {
      heroStreakNum.textContent = state.stats.streak;
    }

    const heroBest = document.getElementById('streak-best-num');
    if (heroBest) {
      heroBest.textContent = `${state.stats.bestStreak} Days`;
    }

    const heroSubtitle = document.getElementById('streak-status-subtitle');
    if (heroSubtitle) {
      const today = getTodayString();
      if (state.stats.lastActiveDate === today) {
        heroSubtitle.textContent = '🔥 Flame active! You studied today. Keep it burning tomorrow!';
      } else {
        heroSubtitle.textContent = '⚡ Study today (complete a pomodoro, review cards, or take a quiz) to keep your streak!';
      }
    }
  }

  function renderProgressUI() {
    updateStreakUI();

    // Week Strip
    renderWeekStrip();

    // Metric cards
    document.getElementById('metric-focus-time').textContent = `${state.stats.totalFocusMinutes}m`;
    document.getElementById('metric-pomos-count').textContent = state.stats.completedPomodoros;

    // Mastered count
    let masteredCount = 0;
    let totalCardsCount = 0;
    state.decks.forEach(d => {
      totalCardsCount += d.cards.length;
      masteredCount += d.cards.filter(c => c.status === 'mastered').length;
    });
    document.getElementById('metric-cards-mastered').textContent = `${masteredCount} / ${totalCardsCount}`;

    // Quizzes average
    const avgScore = state.stats.quizzesCompleted > 0
      ? Math.round(state.stats.totalQuizScore / state.stats.quizzesCompleted)
      : 0;
    document.getElementById('metric-quiz-avg').textContent = `${avgScore}%`;

    // Daily Goals
    const goalPomos = state.settings.dailyGoals.pomodoros;
    const goalCards = state.settings.dailyGoals.flashcards;
    const goalQuizzes = state.settings.dailyGoals.quizzes;

    const pPomo = Math.min(100, Math.round((state.stats.today.pomodoros / goalPomos) * 100));
    const pCard = Math.min(100, Math.round((state.stats.today.flashcards / goalCards) * 100));
    const pQuiz = Math.min(100, Math.round((state.stats.today.quizzes / goalQuizzes) * 100));

    document.getElementById('goal-pomo-label').textContent = `${state.stats.today.pomodoros} / ${goalPomos}`;
    document.getElementById('goal-pomo-bar').style.width = `${pPomo}%`;

    document.getElementById('goal-card-label').textContent = `${state.stats.today.flashcards} / ${goalCards}`;
    document.getElementById('goal-card-bar').style.width = `${pCard}%`;

    document.getElementById('goal-quiz-label').textContent = `${state.stats.today.quizzes} / ${goalQuizzes}`;
    document.getElementById('goal-quiz-bar').style.width = `${pQuiz}%`;

    // Activity Timeline
    const timeline = document.getElementById('activity-timeline-list');
    if (timeline) {
      if (state.stats.activityLog.length === 0) {
        timeline.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No activity recorded yet. Start studying!</div>`;
      } else {
        timeline.innerHTML = state.stats.activityLog.map(item => {
          let icon = '⚡';
          if (item.type === 'pomo') icon = '🍅';
          else if (item.type === 'flashcard') icon = '🗂️';
          else if (item.type === 'quiz') icon = '🎯';

          return `
            <div class="timeline-item">
              <div class="timeline-left">
                <span>${icon}</span>
                <span>${escapeHtml(item.text)}</span>
              </div>
              <span class="timeline-time">${item.time}</span>
            </div>
          `;
        }).join('');
      }
    }
  }

  function renderWeekStrip() {
    const strip = document.getElementById('week-days-strip');
    if (!strip) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const currentDayIdx = today.getDay(); // 0 is Sunday

    // Get current week's dates (starting Monday)
    let html = '';
    for (let i = 1; i <= 7; i++) {
      const dayOffset = i % 7; // 1 = Mon ... 0 = Sun
      const d = new Date(today);
      const diff = dayOffset - (currentDayIdx === 0 ? 7 : currentDayIdx);
      d.setDate(today.getDate() + diff);

      const dYear = d.getFullYear();
      const dMonth = String(d.getMonth() + 1).padStart(2, '0');
      const dDay = String(d.getDate()).padStart(2, '0');
      const dateStr = `${dYear}-${dMonth}-${dDay}`;

      const isCompleted = !!state.stats.weekActivity[dateStr];
      const isToday = dateStr === getTodayString();

      html += `
        <div class="week-day-pill ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" title="${dateStr}">
          <span class="day-name">${days[dayOffset]}</span>
          <div class="day-indicator">${isCompleted ? '✓' : ''}</div>
        </div>
      `;
    }

    strip.innerHTML = html;
  }

  // ============================================================
  // CONFETTI CELEBRATION
  // ============================================================
  function triggerConfetti(particleCount = 50) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#38bdf8', '#ff6b35'];
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let animationId;
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.rotSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(update);
      } else {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    update();
  }

  // ============================================================
  // DATA IMPORT / EXPORT & BACKUP
  // ============================================================
  function initDataManagement() {
    const btnExport = document.getElementById('btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const fullBackup = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          state: state
        };
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studybuddy-backup-${getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!');
      });
    }

    const btnImport = document.getElementById('btn-import-data');
    const inputImport = document.getElementById('file-input-import');
    if (btnImport && inputImport) {
      btnImport.addEventListener('click', () => inputImport.click());
      inputImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.state) {
              state = { ...state, ...data.state };
              saveState();
              location.reload();
            } else {
              alert('Invalid StudyBuddy backup format.');
            }
          } catch (err) {
            alert('Failed to parse JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }

    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data back to original defaults? This cannot be undone.')) {
          localStorage.clear();
          location.reload();
        }
      });
    }
  }

  // ============================================================
  // UTILITIES & MODAL HELPERS
  // ============================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });

    document.querySelectorAll('.btn-close-modal, .btn-cancel-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    // Form handlers
    const formAddCard = document.getElementById('form-add-card');
    if (formAddCard) formAddCard.addEventListener('submit', handleCreateCardSubmit);

    const formNewDeck = document.getElementById('form-new-deck');
    if (formNewDeck) formNewDeck.addEventListener('submit', handleCreateDeckSubmit);

    const formNewQuiz = document.getElementById('form-new-quiz');
    if (formNewQuiz) formNewQuiz.addEventListener('submit', handleCreateQuizSubmit);

    const btnSaveTimerSettings = document.getElementById('btn-save-timer-settings');
    if (btnSaveTimerSettings) btnSaveTimerSettings.addEventListener('click', saveTimerSettings);
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  // ============================================================
  // BOOTSTRAP APP
  // ============================================================
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    initNavigation();
    initPomodoro();
    initFlashcards();
    initQuizSetup();
    renderProgressUI();
    initModals();
    initDataManagement();
  });

})();
