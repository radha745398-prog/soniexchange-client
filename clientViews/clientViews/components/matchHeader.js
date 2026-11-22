// clientViews/components/matchHeader.js
// Instant Ball-by-Ball Live Score + Event Popup + Break/Upcoming Timers + Auto Sync

function flagOrLogoHTML(src, name) {
    if (src) {
        return `<img src="${src}" alt="${name}" class="w-8 h-8 rounded-full object-cover bg-white/10 border border-white/30 shrink-0">`;
    }

    const initials = String(name || '').trim().slice(0, 2).toUpperCase();

    return `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] border border-white/25 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow">${initials}</div>`;
}

function renderMatchHeader(user, matchData) {
    const username = user ? user.username || 'Client' : 'Client';
    const balance = Number(user ? user.points || 0 : 0);
    const exposure = Number(user ? user.exposure || 0 : 0);

    const d = matchData || {};

    const matchId = d.id || '';
    const teamA = d.teamA || '';
    const teamB = d.teamB || '';
    const shortA = d.shortA || String(teamA).slice(0, 4).toUpperCase();
    const shortB = d.shortB || String(teamB).slice(0, 4).toUpperCase();
    const venue = d.venue || '';
    const rawMatchTime = String(d.dateTime || '').trim();
    const matchTime = /\b(DAY\s*\d+|SESSION|LEAD\s+BY)\b/i.test(rawMatchTime) ? '' : rawMatchTime;

    const scoreA = d.scoreA || '-';
    const oversA = d.oversA || '';
    const scoreB = d.scoreB || '-';
    const oversB = d.oversB || '';

    const matchStateText = d.matchStateText || '';
    const matchNote = d.matchNote || '';
    const resultText = d.resultText || '';
    const countdownTimestamp = Number(d.countdownTimestamp) || null;
    const initialLiveEvent = d.liveEvent || null;
    const breakTimerMode = d.breakTimerMode || 'FORWARD';
    const breakEndTimestamp = Number(d.breakEndTimestamp) || null;
    const breakStartTimestamp = Number(d.breakStartTimestamp) || null;

    const combinedInitial = (
        String(d.status || '') + ' ' +
        String(matchStateText || '') + ' ' +
        String(resultText || '')
    ).toUpperCase();

    const initialHasResult =
        combinedInitial.includes('WON BY') ||
        combinedInitial.includes('TIED') ||
        combinedInitial.includes('NO RESULT') ||
        combinedInitial.includes('ABANDONED') ||
        combinedInitial.includes('FINISHED') ||
        combinedInitial.includes('COMPLETED');

    const matchStatus = initialHasResult
        ? 'FINISHED'
        : String(d.status || 'UPCOMING').toUpperCase();

    const isLive = matchStatus === 'LIVE';
    const isFinished = matchStatus === 'FINISHED';
    const isBreak = matchStatus === 'BREAK';

    const dot = isLive
        ? 'bg-green-500 animate-pulse'
        : (isFinished ? 'bg-emerald-400' : 'bg-gray-500');

    const statusColor = isLive
        ? 'text-green-400'
        : (isFinished ? 'text-emerald-300' : 'text-gray-400');

    const badgeText = isLive
        ? 'LIVE'
        : (isFinished ? 'FINISHED' : (isBreak ? 'BREAK' : 'UPCOMING'));

    const upperState = String(matchStateText).toUpperCase();

    let initialBadgeText = 'UPCOMING';
    let initialBadgeClass = 'bg-blue-500/20 border-blue-400 text-blue-300';

    if (isFinished) {
        initialBadgeText = resultText || matchStateText || 'FINISHED';
        initialBadgeClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
    } else if (isLive) {
        initialBadgeText = 'LIVE';
        initialBadgeClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
    } else if (isBreak || upperState.includes('LUNCH') || upperState.includes('TEA') || upperState.includes('DRINKS') || upperState.includes('BREAK')) {
        initialBadgeText = 'BREAK';
        initialBadgeClass = 'bg-orange-500/30 border-orange-400 text-orange-300';
    }

    const initialStateText = isFinished
        ? (resultText || matchNote || matchStateText || '')
        : (matchNote || matchStateText || '');

    const safeMatchId = JSON.stringify(String(matchId));
    const safeScoreA = JSON.stringify(String(scoreA));
    const safeScoreB = JSON.stringify(String(scoreB));
    const safeOversA = JSON.stringify(String(oversA));
    const safeOversB = JSON.stringify(String(oversB));
    const safeState = JSON.stringify(String(matchStateText));
    const safeNote = JSON.stringify(String(matchNote));
    const safeResult = JSON.stringify(String(resultText));
    const safeShortA = JSON.stringify(String(shortA));
    const safeShortB = JSON.stringify(String(shortB));
    const safeStatus = JSON.stringify(String(matchStatus));
    const safeCountdown = countdownTimestamp || 'null';
    const safeLiveEvent = JSON.stringify(initialLiveEvent);
    const safeBreakMode = JSON.stringify(String(breakTimerMode || 'FORWARD'));
    const safeBreakEnd = breakEndTimestamp || 'null';
    const safeBreakStart = breakStartTimestamp || 'null';

    return `
    <!-- TOP HEADER BAR -->
    <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2.5 flex items-center justify-between sticky top-0 z-50">

        <div class="flex items-center space-x-3">
            <a href="/dashboard?user=${encodeURIComponent(username)}"
                class="text-white text-base focus:outline-none">
                <i class="fa-solid fa-arrow-left"></i>
            </a>

            <h1 class="text-base sm:text-lg font-black tracking-wider italic text-[#00c0FF]">
                SONIEXCHANGE
            </h1>
        </div>

        <div class="flex items-center space-x-3 text-xs">
            <div class="text-right">
                <div class="text-gray-300">
                    Balance:
                    <span class="font-bold text-green-400" id="user-balance">
                        ${balance.toLocaleString()}
                    </span>
                </div>

                <div class="text-gray-400">
                    Exp:
                    <span class="font-bold text-red-400" id="user-exposure">
                        ${exposure.toLocaleString()}
                    </span>
                </div>
            </div>

            <div class="bg-[#1f2937] px-2.5 py-1 rounded border border-gray-700 font-bold text-white flex items-center space-x-1">
                <i class="fa-solid fa-user text-[#00c0FF]"></i>
                <span>${username}</span>
            </div>
        </div>
    </header>

    <!-- DYNAMIC MATCH BANNER -->
    <div class="bg-scoreboard-dark text-white border-b border-gray-800">

        <div class="bg-[#0b141d] px-3 py-1.5 flex justify-between items-center text-xs font-semibold text-gray-300 border-b border-gray-800">

            <div class="flex items-center space-x-1.5">
                <span class="text-white font-bold tracking-wide">
                    ${teamA.toUpperCase()} V ${teamB.toUpperCase()}
                </span>
            </div>

            <div class="text-[11px] text-gray-400 font-mono">
                ${matchTime}
            </div>
        </div>

        <div class="p-3 sm:p-4 bg-[#111c26] relative">

            <div class="text-[11px] text-gray-400 flex items-center space-x-1.5 mb-2">

                <span id="match-status-dot"
                    class="w-2.5 h-2.5 rounded-full ${dot}">
                </span>

                <span class="font-bold ${statusColor}" id="match-status-badge">
                    ${badgeText}
                </span>

                <span>${venue ? '• ' + venue : ''}</span>
            </div>

            <div class="grid grid-cols-12 items-center gap-2">

                <div class="col-span-4 flex items-center space-x-2">

                    ${flagOrLogoHTML(d.logoA, teamA)}

                    <div>
                        <div class="font-black text-base sm:text-lg text-white flex items-center space-x-1">
                            <span id="score-a">${scoreA}</span>
                        </div>

                        <div class="text-xs sm:text-sm font-bold text-cyan-300 tracking-wide mt-0.5" id="overs-a">
                            ${oversA}
                        </div>
                    </div>
                </div>

                <div class="col-span-4 text-center flex flex-col items-center justify-center">

                    <div id="match-event-badge"
                        class="mb-1 px-3 py-1 rounded-full font-black text-xs tracking-wider uppercase border ${initialBadgeClass}">
                        ${initialBadgeText}
                    </div>

                    <div class="text-xs text-amber-200 font-bold"
                        id="match-state-text">
                        ${initialStateText}
                    </div>
                </div>

                <div class="col-span-4 flex items-center justify-end space-x-2 text-right">

                    <div>
                        <div class="font-black text-base sm:text-lg text-white" id="score-b">
                            ${scoreB}
                        </div>

                        <div class="text-xs sm:text-sm font-bold text-cyan-300 tracking-wide mt-0.5" id="overs-b">
                            ${oversB}
                        </div>
                    </div>

                    ${flagOrLogoHTML(d.logoB, teamB)}
                </div>
            </div>
        </div>
    </div>

    <!-- TABS BAR -->
    <div class="bg-[#0b141d] border-b border-gray-800 flex text-center font-bold text-xs sticky top-[45px] z-40">

        <div class="flex-1 py-2.5 border-b-2 border-[#00c0FF] text-[#00c0FF] tracking-wider uppercase">
            ODDS
        </div>

        <div class="flex-1 py-2.5 text-gray-400 hover:text-white cursor-pointer tracking-wider uppercase">
            MATCHED BET (<span id="matched-bet-count">0</span>)
        </div>

        <div class="px-4 py-2.5 text-gray-400 hover:text-white cursor-pointer border-l border-gray-800 flex items-center justify-center">
            <i class="fa-solid fa-tv text-sm text-[#00c0FF]"></i>
        </div>
    </div>

    <!-- INSTANT BALL-BY-BALL POLLING + EVENT POPUPS + TIMERS -->
    <script>
        (function() {
            const matchId = ${safeMatchId};

            if (!matchId) return;

            let lastScoreA = ${safeScoreA};
            let lastScoreB = ${safeScoreB};

            let lastOversA = ${safeOversA};
            let lastOversB = ${safeOversB};

            let lastLiveEvent = ${safeLiveEvent};
            let lastCommentaryText = '';
            let lastBallSignature = '';

            let popupTimer = null;
            let bowlerReadyTimer = null;
            let isBowlerReadyWindow = false;
            let pollTimer = null;
            let isPolling = false;
            let lastLiveChangeAt = Date.now();

            let targetTimestamp = ${safeCountdown};
            let breakTimerMode = ${safeBreakMode};
            let breakEndTimestamp = ${safeBreakEnd};
            let breakStartTimestamp = ${safeBreakStart};

            let stateLabel = ${safeState};
            let currentNote = ${safeNote};
            let currentResult = ${safeResult};
            const shortTeamA = ${safeShortA};
            const shortTeamB = ${safeShortB};
            let currentStatus = ${safeStatus};

            let currentMatchState =
                String(stateLabel || '').toUpperCase();

            const badgeColor = {
                blue: 'bg-blue-500/20 border-blue-400 text-blue-300',
                amber: 'bg-amber-500/20 border-amber-400 text-amber-300',
                orange: 'bg-orange-500/30 border-orange-400 text-orange-300',
                gray: 'bg-gray-500/20 border-gray-400 text-gray-300',
                green: 'bg-emerald-500/25 border-emerald-400 text-emerald-200',
                red: 'bg-red-600/40 border-red-500 text-red-300',
                purple: 'bg-purple-600/40 border-purple-400 text-purple-200',
                cyan: 'bg-cyan-500/25 border-cyan-300 text-cyan-200'
            };

            function resolveStatus(rawStatus, note, state, resText) {
                const combined = (
                    String(rawStatus || '') + ' ' +
                    String(resText || '')
                ).toUpperCase();

                if (
                    combined.includes('WON BY') ||
                    combined.includes('TIED') ||
                    combined.includes('NO RESULT') ||
                    combined.includes('ABANDONED') ||
                    combined.includes('FINISHED') ||
                    combined.includes('COMPLETED')
                ) {
                    return 'FINISHED';
                }

                const noteUpper = (String(note || '') + ' ' + String(state || '')).toUpperCase();
                if (
                    noteUpper.includes('BREAK') ||
                    noteUpper.includes('LUNCH') ||
                    noteUpper.includes('TEA') ||
                    noteUpper.includes('DRINK')
                ) {
                    return 'BREAK';
                }

                return String(rawStatus || 'UPCOMING').toUpperCase();
            }

            function getCleanBreakLabel(rawText) {
                const up = String(rawText || '').toUpperCase();
                if (up.includes('INNINGS BREAK')) return 'INNINGS BREAK';
                if (up.includes('LUNCH')) return 'LUNCH BREAK';
                if (up.includes('TEA')) return 'TEA BREAK';
                if (up.includes('DRINK')) return 'DRINKS BREAK';
                return 'BREAK';
            }

            function parseScore(score) {
                const value = String(score || '');
                const parts = value.split('/');
                const runs = parseInt(parts[0], 10);
                const wickets = parts.length > 1 ? parseInt(parts[1], 10) : 0;
                if (!Number.isFinite(runs)) return null;
                return {
                    runs,
                    wickets: Number.isFinite(wickets) ? wickets : 0
                };
            }

            function parseOversToBalls(oversStr, maxOvers = 20) {
                const m = String(oversStr || '').match(/(\\d+(?:\\.\\d+)?)/);
                if (!m) return null;
                const val = parseFloat(m[1]);
                if (!Number.isFinite(val)) return null;
                const completed = Math.floor(val);
                const ballsInOv = Math.min(6, Math.max(0, Math.round((val - completed) * 10)));
                const bowledBalls = (completed * 6) + ballsInOv;
                const totalBalls = maxOvers * 6;
                return Math.max(0, totalBalls - bowledBalls);
            }

            function extractTarget(oversStr, noteStr) {
                const ovMatch = String(oversStr || '').match(/T\\s*:?\\s*(\\d+)/i);
                if (ovMatch) return parseInt(ovMatch[1], 10);

                const targetMatch = String(noteStr || '').match(/TARGET\\s*(?:OF)?\\s*(\\d+)/i);
                if (targetMatch) return parseInt(targetMatch[1], 10);

                const needMatch = String(noteStr || '').match(/NEED\\s*(\\d+)\\s*(?:RUNS?)?\\s*(?:FROM|IN|OFF)\\s*(\\d+)/i);
                if (needMatch) {
                    return {
                        runsNeeded: parseInt(needMatch[1], 10),
                        ballsLeft: parseInt(needMatch[2], 10),
                        isDirect: true
                    };
                }
                return null;
            }

            function buildChaseText(scoreAVal, oversAVal, scoreBVal, oversBVal, noteStr) {
                const targetInfo = extractTarget(oversAVal || oversBVal, noteStr);
                if (!targetInfo) return '';

                if (targetInfo && targetInfo.isDirect) {
                    const chasingTeam = String(noteStr || '').toUpperCase().includes(shortTeamB) ? shortTeamB : shortTeamA;
                    return chasingTeam + ' NEED ' + targetInfo.runsNeeded + ' FROM ' + targetInfo.ballsLeft + ' BALLS';
                }

                const targetRuns = Number(targetInfo);
                if (!Number.isFinite(targetRuns) || targetRuns <= 0) return '';

                const pA = parseScore(scoreAVal);
                const pB = parseScore(scoreBVal);

                let chasingShort = shortTeamA;
                let currentRuns = pA ? pA.runs : null;
                let activeOvers = oversAVal || '';

                if (pB && (!pA || pB.runs > 0)) {
                    chasingShort = shortTeamB;
                    currentRuns = pB.runs;
                    activeOvers = oversBVal || oversAVal || '';
                }

                if (currentRuns === null || !Number.isFinite(currentRuns)) return '';

                const runsNeeded = Math.max(0, targetRuns - currentRuns);
                const ballsLeft = parseOversToBalls(activeOvers, 20);

                if (runsNeeded <= 0) return chasingShort + ' WON';
                if (ballsLeft !== null && ballsLeft > 0) {
                    return chasingShort + ' NEED ' + runsNeeded + ' FROM ' + ballsLeft + ' BALLS';
                }
                return chasingShort + ' NEED ' + runsNeeded + ' RUNS';
            }

            function setBadgeState(text, colorClass, animate = false) {
                const badge = document.getElementById('match-event-badge');
                if (!badge) return;

                badge.innerText = text;
                badge.className =
                    'mb-1 px-3 py-1 rounded-full font-black text-xs tracking-wider uppercase border ' +
                    colorClass +
                    (animate ? ' animate-pulse' : '');
            }

            function formatTime(distance) {
                const safeMs = Math.max(0, Number(distance) || 0);
                const days = Math.floor(safeMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((safeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((safeMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((safeMs % (1000 * 60)) / 1000);

                let time = '';
                if (days > 0) time += days + 'd ';
                time +=
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0');
                return time;
            }

            function formatShortTimer(ms) {
                const safeMs = Math.max(0, Number(ms) || 0);
                const totalSec = Math.floor(safeMs / 1000);
                const hours = Math.floor(totalSec / 3600);
                const minutes = Math.floor((totalSec % 3600) / 60);
                const seconds = totalSec % 60;

                if (hours > 0) {
                    return (
                        String(hours).padStart(2, '0') + ':' +
                        String(minutes).padStart(2, '0') + ':' +
                        String(seconds).padStart(2, '0')
                    );
                }
                return (
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0')
                );
            }

            function isMatchDayAfterMidnight(matchTs, nowTs) {
                const mDate = new Date(Number(matchTs));
                const nDate = new Date(Number(nowTs));
                return (
                    mDate.getFullYear() === nDate.getFullYear() &&
                    mDate.getMonth() === nDate.getMonth() &&
                    mDate.getDate() === nDate.getDate()
                );
            }

            function updateCountdown() {
                if (currentStatus !== 'UPCOMING') return;
                if (!targetTimestamp) {
                    setBadgeState('UPCOMING', badgeColor.blue, false);
                    return;
                }

                const now = Date.now();
                if (!isMatchDayAfterMidnight(targetTimestamp, now)) {
                    setBadgeState('UPCOMING', badgeColor.blue, false);
                    return;
                }

                const distance = Number(targetTimestamp) - now;
                if (distance <= 0) {
                    setBadgeState('MATCH STARTING SOON', badgeColor.amber, true);
                    return;
                }

                setBadgeState('UPCOMING - ' + formatTime(distance), badgeColor.blue, false);
            }

            function updateBreakTimer() {
                if (currentStatus !== 'BREAK') return;
                const label = getCleanBreakLabel(currentMatchState + ' ' + currentNote);
                const now = Date.now();

                if (breakTimerMode === 'COUNTDOWN' && breakEndTimestamp) {
                    const rem = Number(breakEndTimestamp) - now;
                    setBadgeState(label + ' • ' + formatShortTimer(rem), badgeColor.orange, true);
                    return;
                }

                const startRef = Number(breakStartTimestamp) || now;
                const elapsed = Math.max(0, now - startRef);
                setBadgeState(label + ' • ' + formatShortTimer(elapsed), badgeColor.orange, true);
            }

            updateCountdown();
            updateBreakTimer();

            setInterval(() => {
                if (currentStatus === 'UPCOMING') {
                    updateCountdown();
                } else if (currentStatus === 'BREAK' && !popupTimer) {
                    updateBreakTimer();
                }
            }, 1000);

            function armBowlerReadyWindow(delayMs = 1200) {
                if (currentStatus !== 'LIVE') return;
                isBowlerReadyWindow = false;
                if (bowlerReadyTimer) {
                    clearTimeout(bowlerReadyTimer);
                    bowlerReadyTimer = null;
                }
                bowlerReadyTimer = setTimeout(() => {
                    bowlerReadyTimer = null;
                    if (currentStatus === 'LIVE' && !popupTimer) {
                        isBowlerReadyWindow = true;
                        setBadgeState('BOWLER RUNNING IN', badgeColor.amber, true);
                    }
                }, delayMs);
            }

            function renderLiveIdleBadge() {
                if (currentStatus !== 'LIVE' || popupTimer) return;
                if (isBowlerReadyWindow) {
                    setBadgeState('BOWLER RUNNING IN', badgeColor.amber, true);
                } else {
                    setBadgeState('LIVE', badgeColor.green, false);
                }
            }

            function lockFinishedUI() {
                if (popupTimer) {
                    clearTimeout(popupTimer);
                    popupTimer = null;
                }
                if (bowlerReadyTimer) {
                    clearTimeout(bowlerReadyTimer);
                    bowlerReadyTimer = null;
                }
                isBowlerReadyWindow = false;
                targetTimestamp = null;
                breakEndTimestamp = null;
                breakStartTimestamp = null;
                updateStatusBadge('FINISHED');
                setBadgeState(
                    currentResult || currentMatchState || 'FINISHED',
                    badgeColor.green,
                    false
                );
                const elStateText = document.getElementById('match-state-text');
                if (elStateText) {
                    elStateText.innerText = currentResult || currentNote || currentMatchState || '';
                }
                if (pollTimer) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
            }

            if (currentStatus === 'FINISHED') {
                lockFinishedUI();
            }

            function restoreBadge() {
                if (currentStatus === 'FINISHED') {
                    lockFinishedUI();
                } else if (currentStatus === 'UPCOMING') {
                    updateCountdown();
                } else if (currentStatus === 'BREAK') {
                    updateBreakTimer();
                } else if (currentStatus === 'LIVE') {
                    armBowlerReadyWindow(1200);
                    renderLiveIdleBadge();
                }
            }

            function triggerPopup(text, colorClass, durationMs = 2800) {
                if (currentStatus === 'FINISHED') return;
                const badge = document.getElementById('match-event-badge');
                if (!badge) return;

                isBowlerReadyWindow = false;
                if (bowlerReadyTimer) {
                    clearTimeout(bowlerReadyTimer);
                    bowlerReadyTimer = null;
                }

                badge.innerText = text;
                badge.className =
                    'mb-1 px-3 py-1 rounded-full font-black text-xs tracking-wider uppercase border shadow-[0_0_15px_rgba(255,255,255,0.65)] animate-pulse ' +
                    colorClass;

                if (popupTimer) {
                    clearTimeout(popupTimer);
                }

                popupTimer = setTimeout(() => {
                    popupTimer = null;
                    restoreBadge();
                }, durationMs);
            }

            function isBallInAirText(text) {
                const t = String(text || '').toLowerCase();
                return (
                    t.includes('in the air') ||
                    t.includes('high in the air') ||
                    t.includes('up in the air') ||
                    t.includes('skied')
                );
            }

            function updateStatusBadge(status) {
                const elStatus = document.getElementById('match-status-badge');
                const elDot = document.getElementById('match-status-dot');
                if (!elStatus) return;

                if (status === 'LIVE') {
                    elStatus.innerText = 'LIVE';
                    elStatus.className = 'font-bold text-green-400';
                    if (elDot) elDot.className = 'w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse';
                } else if (status === 'FINISHED') {
                    elStatus.innerText = 'FINISHED';
                    elStatus.className = 'font-bold text-emerald-300';
                    if (elDot) elDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
                } else if (status === 'BREAK') {
                    elStatus.innerText = 'BREAK';
                    elStatus.className = 'font-bold text-orange-300';
                    if (elDot) elDot.className = 'w-2.5 h-2.5 rounded-full bg-orange-400';
                } else {
                    elStatus.innerText = 'UPCOMING';
                    elStatus.className = 'font-bold text-gray-400';
                    if (elDot) elDot.className = 'w-2.5 h-2.5 rounded-full bg-gray-500';
                }
            }

            async function pollMatch() {
                if (isPolling || currentStatus === 'FINISHED') return;
                isPolling = true;
                try {
                    const res = await fetch(
                        '/api/match/' +
                        encodeURIComponent(matchId) +
                        '?_t=' + Date.now() + '&_r=' + Math.random().toString(36).slice(2),
                        {
                            method: 'GET',
                            cache: 'no-store',
                            headers: {
                                'Cache-Control': 'no-store, no-cache, must-revalidate',
                                'Pragma': 'no-cache'
                            }
                        }
                    );

                    if (!res.ok) return;
                    const data = await res.json();
                    if (!data || !data.success || !data.match) return;

                    const m = data.match;

                    const elScoreA = document.getElementById('score-a');
                    const elScoreB = document.getElementById('score-b');
                    const elOversA = document.getElementById('overs-a');
                    const elOversB = document.getElementById('overs-b');
                    const elStateText = document.getElementById('match-state-text');

                    const currentScoreA = m.scoreA || '-';
                    const currentScoreB = m.scoreB || '-';
                    const currentOversA = m.oversA || '';
                    const currentOversB = m.oversB || '';
                    const activeOverStr = currentOversB || currentOversA || '';

                    const stateText = String(m.matchStateText || '').toUpperCase();
                    const wicketText = String(m.wicketText || m.howOut || '').toUpperCase();
                    const latestCommentary = String(m.latestCommentary || '').trim();

                    const newStatus = resolveStatus(
                        m.status || 'UPCOMING',
                        m.matchNote,
                        m.matchStateText,
                        m.resultText
                    );

                    const prevStatus = currentStatus;
                    const reloadKey = 'live_reloaded_' + matchId + '_' + newStatus;

                    if (
                        prevStatus === 'UPCOMING' &&
                        (newStatus === 'LIVE' || newStatus === 'BREAK') &&
                        !sessionStorage.getItem(reloadKey)
                    ) {
                        sessionStorage.setItem(reloadKey, '1');
                        window.location.reload();
                        return;
                    }

                    if (elScoreA) elScoreA.textContent = currentScoreA;
                    if (elOversA && m.oversA !== undefined) elOversA.textContent = m.oversA;
                    if (elScoreB) elScoreB.textContent = currentScoreB;
                    if (elOversB && m.oversB !== undefined) elOversB.textContent = m.oversB;

                    if (typeof window.syncOversStrip === 'function') {
                        window.syncOversStrip(m);
                    }

                    currentStatus = newStatus;
                    stateLabel = m.matchStateText || newStatus;
                    currentNote = m.matchNote || '';
                    currentResult = m.resultText || '';
                    currentMatchState = String(stateLabel || '').toUpperCase();

                    if (currentStatus === 'FINISHED') {
                        lockFinishedUI();
                        return;
                    }

                    if (newStatus === 'UPCOMING' && m.countdownTimestamp) {
                        const newTimestamp = Number(m.countdownTimestamp);
                        if (Number.isFinite(newTimestamp)) {
                            targetTimestamp = newTimestamp;
                        }
                    } else if (newStatus !== 'UPCOMING') {
                        targetTimestamp = null;
                    }

                    if (newStatus === 'BREAK') {
                        breakTimerMode = m.breakTimerMode || 'FORWARD';
                        breakEndTimestamp = m.breakEndTimestamp ? Number(m.breakEndTimestamp) : null;
                        if (m.breakStartTimestamp) {
                            breakStartTimestamp = Number(m.breakStartTimestamp);
                        } else if (!breakStartTimestamp) {
                            breakStartTimestamp = Date.now();
                        }
                    } else {
                        breakEndTimestamp = null;
                        breakStartTimestamp = null;
                    }

                    updateStatusBadge(newStatus);

                    const chaseLiveText = buildChaseText(
                        currentScoreA,
                        currentOversA,
                        currentScoreB,
                        currentOversB,
                        currentNote
                    );

                    if (elStateText) {
                        if (newStatus === 'LIVE') {
                            const cleanNote = /\\b(DAY\\s*\\d+|SESSION)\\b/i.test(currentNote) ? '' : currentNote;
                            elStateText.innerText = chaseLiveText || cleanNote || '';
                        } else {
                            elStateText.innerText = currentNote || m.matchStateText || '';
                        }
                    }

                    if (
                        newStatus === 'BREAK' ||
                        stateText.includes('LUNCH') ||
                        stateText.includes('TEA') ||
                        stateText.includes('DRINKS') ||
                        stateText.includes('BREAK')
                    ) {
                        if (!popupTimer) {
                            updateBreakTimer();
                        }
                    } else if (newStatus === 'UPCOMING') {
                        if (popupTimer) {
                            clearTimeout(popupTimer);
                            popupTimer = null;
                        }
                        updateCountdown();
                    } else if (newStatus === 'LIVE') {
                        const ev = m.liveEvent || null;
                        const prevEv = lastLiveEvent || null;

                        const sixDiff = ev && prevEv ? (Number(ev.totalSixes || 0) - Number(prevEv.totalSixes || 0)) : 0;
                        const fourDiff = ev && prevEv ? (Number(ev.totalFours || 0) - Number(prevEv.totalFours || 0)) : 0;
                        const wktStatDiff = ev && prevEv ? (Number(ev.totalWickets || 0) - Number(prevEv.totalWickets || 0)) : 0;
                        const runStatDiff = ev && prevEv ? (Number(ev.totalRuns || 0) - Number(prevEv.totalRuns || 0)) : 0;
                        const ballStatDiff = ev && prevEv ? (Number(ev.totalBalls || 0) - Number(prevEv.totalBalls || 0)) : 0;
                        const reportChanged = ev && prevEv && ev.report && ev.report !== prevEv.report;
                        const ballSignature = ev
                            ? [ev.latestOver || '', ev.latestBallNumber || '', ev.latestBall || '', ev.latestBallTimestamp || ''].join('|')
                            : '';
                        const latestBallChanged = Boolean(ballSignature && ballSignature !== lastBallSignature);

                        const scoreChanged =
                            currentScoreA !== lastScoreA ||
                            currentScoreB !== lastScoreB ||
                            currentOversA !== lastOversA ||
                            currentOversB !== lastOversB ||
                            sixDiff > 0 ||
                            fourDiff > 0 ||
                            wktStatDiff > 0 ||
                            runStatDiff > 0 ||
                            ballStatDiff > 0 ||
                            reportChanged ||
                            latestBallChanged;

                        if (scoreChanged) {
                            lastLiveChangeAt = Date.now();
                            let diffText = 'SCORE UPDATED';
                            let color = 'bg-yellow-500/20 border-yellow-400 text-yellow-300';
                            let ballSymbol = null;

                            const oldScoreA = parseScore(lastScoreA);
                            const newScoreA = parseScore(currentScoreA);
                            const oldScoreB = parseScore(lastScoreB);
                            const newScoreB = parseScore(currentScoreB);

                            const wktDiffA = oldScoreA && newScoreA ? (newScoreA.wickets - oldScoreA.wickets) : 0;
                            const wktDiffB = oldScoreB && newScoreB ? (newScoreB.wickets - oldScoreB.wickets) : 0;
                            const runDiffA = oldScoreA && newScoreA ? (newScoreA.runs - oldScoreA.runs) : 0;
                            const runDiffB = oldScoreB && newScoreB ? (newScoreB.runs - oldScoreB.runs) : 0;

                            const wktDelta = Math.max(wktStatDiff, wktDiffA, wktDiffB);
                            const runDelta = runDiffB > 0 ? runDiffB : (runDiffA > 0 ? runDiffA : runStatDiff);
                            const rawBallSym = String(ev?.latestBall || '').toUpperCase();

                            if (wktDelta > 0 || rawBallSym === 'W') {
                                ballSymbol = 'W';
                                if (wicketText.includes('STUMP')) {
                                    diffText = 'STUMP OUT!';
                                } else if (wicketText.includes('RUN OUT')) {
                                    diffText = 'RUN OUT!';
                                } else if (wicketText.includes('CAUGHT') || wicketText.includes('CATCH')) {
                                    diffText = 'CAUGHT OUT!';
                                } else {
                                    diffText = 'WICKET FALLEN!';
                                }
                                color = badgeColor.red;
                            } else if (rawBallSym && !['DOT', 'W', '6', '4', '3', '2', '1'].includes(rawBallSym)) {
                                ballSymbol = rawBallSym;
                                diffText = rawBallSym + ' BALL';
                                color = 'bg-amber-500/30 border-amber-400 text-amber-200';
                            } else if (sixDiff > 0 || runDelta === 6 || rawBallSym === '6') {
                                ballSymbol = '6';
                                diffText = 'SIX (6)';
                                color = badgeColor.purple;
                            } else if (fourDiff > 0 || runDelta === 4 || rawBallSym === '4') {
                                ballSymbol = '4';
                                diffText = 'FOUR (4)';
                                color = 'bg-blue-600/40 border-blue-400 text-blue-200';
                            } else if (runDelta === 3 || rawBallSym === '3') {
                                ballSymbol = '3';
                                diffText = '3 RUNS';
                                color = 'bg-emerald-500/30 border-emerald-400 text-emerald-300';
                            } else if (runDelta === 2 || rawBallSym === '2') {
                                ballSymbol = '2';
                                diffText = '2 RUNS';
                                color = 'bg-indigo-500/30 border-indigo-400 text-indigo-300';
                            } else if (runDelta === 1 || rawBallSym === '1') {
                                ballSymbol = '1';
                                diffText = '1 RUN';
                                color = 'bg-green-500/30 border-green-400 text-green-300';
                            } else if (
                                runDelta === 0 &&
                                (currentOversA !== lastOversA || currentOversB !== lastOversB || ballStatDiff > 0 || rawBallSym === 'DOT')
                            ) {
                                ballSymbol = 'DOT';
                                diffText = 'DOT BALL';
                                color = 'bg-slate-600/30 border-slate-400 text-slate-300';
                            }

                            const activeScore = (currentScoreB && currentScoreB !== '-' && currentScoreB !== 'Yet to bat')
                                ? currentScoreB
                                : currentScoreA;

                            if (ballSymbol && typeof window.recordLiveOverBall === 'function') {
                                window.recordLiveOverBall(activeOverStr, ballSymbol, activeScore);
                            }

                            triggerPopup(diffText, color, 2800);

                            lastScoreA = currentScoreA;
                            lastScoreB = currentScoreB;
                            lastOversA = currentOversA;
                            lastOversB = currentOversB;
                            lastLiveEvent = ev;
                            if (ballSignature) {
                                lastBallSignature = ballSignature;
                            }
                        } else if (latestCommentary && latestCommentary !== lastCommentaryText && isBallInAirText(latestCommentary)) {
                            lastCommentaryText = latestCommentary;
                            triggerPopup('BALL IN THE AIR', badgeColor.cyan, 2400);
                        } else if (!popupTimer) {
                            if (!bowlerReadyTimer && !isBowlerReadyWindow) {
                                armBowlerReadyWindow(1000);
                            }
                            renderLiveIdleBadge();
                        }
                    }

                } catch (e) {
                    console.error('Live Polling Error:', e);
                } finally {
                    isPolling = false;
                }
            }

            // Fast polling + immediate sync on resume/focus + soft auto-sync safety
            pollMatch();
            pollTimer = setInterval(pollMatch, 800);
            setInterval(function() {
                if (currentStatus === 'LIVE' && (Date.now() - lastLiveChangeAt) > 120000) {
                    lastLiveChangeAt = Date.now();
                    window.location.reload();
                }
            }, 15000);
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden && currentStatus !== 'FINISHED') {
                    pollMatch();
                }
            });
            window.addEventListener('focus', function() {
                if (currentStatus !== 'FINISHED') {
                    pollMatch();
                }
            });

        })();
    </script>
    `;
}

module.exports = { renderMatchHeader };
