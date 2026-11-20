// clientViews/components/matchHeader.js
// Final Countdown + Live Score + Event Popup + Live Transition Fix

const COUNTRY_BADGE_MAP = {
    INDIA: { flag: '🇮🇳', code: 'IND' },
    PAKISTAN: { flag: '🇵🇰', code: 'PAK' },
    AUSTRALIA: { flag: '🇦🇺', code: 'AUS' },
    ENGLAND: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
    'SOUTH AFRICA': { flag: '🇿🇦', code: 'SA' },
    'NEW ZEALAND': { flag: '🇳🇿', code: 'NZ' },
    'SRI LANKA': { flag: '🇱🇰', code: 'SL' },
    BANGLADESH: { flag: '🇧🇩', code: 'BAN' },
    AFGHANISTAN: { flag: '🇦🇫', code: 'AFG' },
    'WEST INDIES': { flag: '🌴', code: 'WI' },
    UAE: { flag: '🇦🇪', code: 'UAE' },
    'UNITED ARAB EMIRATES': { flag: '🇦🇪', code: 'UAE' },
    IRELAND: { flag: '🇮🇪', code: 'IRE' },
    ZIMBABWE: { flag: '🇿🇼', code: 'ZIM' },
    SCOTLAND: { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO' },
    NETHERLANDS: { flag: '🇳🇱', code: 'NED' },
    USA: { flag: '🇺🇸', code: 'USA' },
    'YAS LIONS': { flag: '🦁', code: 'YL' },
    LIONS: { flag: '🦁', code: 'LNS' }
};

function flagOrLogoHTML(src, name, flagSrc) {
    const imgUrl = src || flagSrc || '';

    if (imgUrl) {
        return `<img src="${imgUrl}" alt="${name}" class="w-7 h-7 rounded-full object-cover bg-white/10 border border-white/30 shrink-0">`;
    }

    const upperName = String(name || '').trim().toUpperCase();
    let matchedCountry = null;

    for (const key of Object.keys(COUNTRY_BADGE_MAP)) {
        if (upperName.includes(key)) {
            matchedCountry = COUNTRY_BADGE_MAP[key];
            break;
        }
    }

    if (matchedCountry) {
        return `<div class="w-7 h-7 rounded-full bg-[#1e293b] border border-white/30 flex items-center justify-center text-sm shrink-0 shadow" title="${name}">${matchedCountry.flag}</div>`;
    }

    const initials = String(name || '?').trim().slice(0, 2).toUpperCase();

    return `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] border border-white/25 flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow">${initials}</div>`;
}

function renderMatchHeader(user, matchData) {
    const username = user ? user.username || 'Client' : 'Client';
    const balance = Number(user ? user.points || 0 : 0);
    const exposure = Number(user ? user.exposure || 0 : 0);

    const d = matchData || {};

    const matchId = d.id || '';
    const teamA = d.teamA || 'Team A';
    const teamB = d.teamB || 'Team B';
    const venue = d.venue || 'Stadium';
    const matchTime = d.dateTime || '';

    const matchStatus = String(d.status || 'UPCOMING').toUpperCase();

    const scoreA = d.scoreA || '-';
    const oversA = d.oversA || '';
    const scoreB = d.scoreB || '-';
    const oversB = d.oversB || '';

    const matchStateText = d.matchStateText || matchStatus;
    const countdownTimestamp = Number(d.countdownTimestamp) || null;
    const initialLiveEvent = d.liveEvent || null;

    // IMPORTANT: Score or "Yet to bat" does NOT mean LIVE.
    const isLive = matchStatus === 'LIVE';
    const isFinished = matchStatus === 'FINISHED';
    const isBreak = matchStatus === 'BREAK';

    const dot = isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500';
    const statusColor = isLive ? 'text-green-400' : 'text-gray-400';

    const badgeText = isLive
        ? 'LIVE'
        : (isFinished ? 'FINISHED' : (isBreak ? 'BREAK' : 'UPCOMING'));

    const upperState = String(matchStateText).toUpperCase();

    let initialBadgeText = 'UPCOMING';

    let initialBadgeClass =
        'bg-blue-500/20 border-blue-400 text-blue-300';

    if (isLive) {
        initialBadgeText = 'BOWLER RUNNING IN';

        initialBadgeClass =
            'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse';

    } else if (isFinished) {
        initialBadgeText = 'FINISHED';

        initialBadgeClass =
            'bg-gray-500/20 border-gray-400 text-gray-300';

    } else if (isBreak) {
        initialBadgeText = matchStateText;

        initialBadgeClass =
            'bg-orange-500/30 border-orange-400 text-orange-300';

    } else if (
        upperState.includes('LUNCH') ||
        upperState.includes('TEA') ||
        upperState.includes('STUMPS') ||
        upperState.includes('DRINKS') ||
        upperState.includes('BREAK')
    ) {
        initialBadgeText = matchStateText;

        initialBadgeClass =
            'bg-orange-500/30 border-orange-400 text-orange-300';
    }

    // Upcoming state text should not duplicate the countdown text.
    let initialStateText = matchStateText;

    if (!isLive && !isFinished && !isBreak) {
        initialStateText = 'Match not started';
    }

    const safeMatchId = JSON.stringify(String(matchId));
    const safeScoreA = JSON.stringify(String(scoreA));
    const safeScoreB = JSON.stringify(String(scoreB));
    const safeOversA = JSON.stringify(String(oversA));
    const safeOversB = JSON.stringify(String(oversB));
    const safeState = JSON.stringify(String(matchStateText));
    const safeStatus = JSON.stringify(String(matchStatus));
    const safeCountdown = countdownTimestamp || 'null';
    const safeLiveEvent = JSON.stringify(initialLiveEvent);

    return `
    <!-- TOP HEADER BAR -->
    <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2 flex items-center justify-between sticky top-0 z-50">

        <div class="flex items-center space-x-3">
            <a href="/dashboard?user=${encodeURIComponent(username)}"
                class="text-white text-base focus:outline-none">
                <i class="fa-solid fa-arrow-left"></i>
            </a>

            <h1 class="text-base font-black tracking-wider italic text-[#00c0FF]">
                SONIEXCHANGE
            </h1>
        </div>

        <div class="flex items-center space-x-3 text-[11px]">
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

        <div class="bg-[#0b141d] px-3 py-1.5 flex justify-between items-center text-[11px] font-semibold text-gray-300 border-b border-gray-800">

            <div class="flex items-center space-x-1.5">
                <span class="text-white font-bold tracking-wide">
                    ${teamA.toUpperCase()} V ${teamB.toUpperCase()}
                </span>
            </div>

            <div class="text-[10px] text-gray-400 font-mono">
                ${matchTime}
            </div>
        </div>

        <div class="p-3 bg-[#111c26] relative">

            <div class="text-[10px] text-gray-400 flex items-center space-x-1.5 mb-2">

                <span id="match-status-dot"
                    class="w-2 h-2 rounded-full ${dot}">
                </span>

                <span class="font-bold ${statusColor}" id="match-status-badge">
                    ${badgeText}
                </span>

                <span>• ${venue}</span>
            </div>

            <div class="grid grid-cols-12 items-center gap-2">

                <div class="col-span-4 flex items-center space-x-2">

                    ${flagOrLogoHTML(d.logoA, teamA, d.flagA)}

                    <div>
                        <div class="font-black text-sm text-white flex items-center space-x-1">
                            <span id="score-a">${scoreA}</span>
                        </div>

                        <div class="text-xs font-bold text-white tracking-wide mt-0.5" id="overs-a">
                            ${oversA}
                        </div>
                    </div>
                </div>

                <div class="col-span-4 text-center flex flex-col items-center justify-center">

                    <div id="match-event-badge"
                        class="mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border ${initialBadgeClass}">
                        ${initialBadgeText}
                    </div>

                    <div class="text-[10px] text-gray-300 font-bold"
                        id="match-state-text">
                        ${initialStateText}
                    </div>
                </div>

                <div class="col-span-4 flex items-center justify-end space-x-2 text-right">

                    <div>
                        <div class="font-black text-sm text-white" id="score-b">
                            ${scoreB}
                        </div>

                        <div class="text-xs font-bold text-white tracking-wide mt-0.5" id="overs-b">
                            ${oversB}
                        </div>
                    </div>

                    ${flagOrLogoHTML(d.logoB, teamB, d.flagB)}
                </div>
            </div>
        </div>
    </div>

    <!-- TABS BAR -->
    <div class="bg-[#0b141d] border-b border-gray-800 flex text-center font-bold text-xs sticky top-[41px] z-40">

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

    <!-- COUNTDOWN + LIVE POLLING + EVENT POPUPS -->
    <script>
        (function() {
            const matchId = ${safeMatchId};

            if (!matchId) return;

            let lastScoreA = ${safeScoreA};
            let lastScoreB = ${safeScoreB};

            let lastOvers =
                ${safeOversA} || ${safeOversB};

            let lastLiveEvent = ${safeLiveEvent};

            let popupTimer = null;

            let targetTimestamp = ${safeCountdown};

            let stateLabel = ${safeState};
            let currentStatus = ${safeStatus};

            let currentMatchState =
                String(stateLabel || '').toUpperCase();

            const badgeColor = {
                blue: 'bg-blue-500/20 border-blue-400 text-blue-300',
                amber: 'bg-amber-500/20 border-amber-400 text-amber-300',
                orange: 'bg-orange-500/30 border-orange-400 text-orange-300',
                gray: 'bg-gray-500/20 border-gray-400 text-gray-300',
                green: 'bg-green-500/20 border-green-400 text-green-300',
                red: 'bg-red-600/40 border-red-500 text-red-300',
                purple: 'bg-purple-600/40 border-purple-400 text-purple-200'
            };

            function setBadgeState(text, colorClass, animate = false) {
                const badge =
                    document.getElementById('match-event-badge');

                if (!badge) return;

                badge.innerText = text;

                badge.className =
                    'mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border ' +
                    colorClass +
                    (animate ? ' animate-pulse' : '');
            }

            function formatTime(distance) {
                const days = Math.floor(
                    distance / (1000 * 60 * 60 * 24)
                );

                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) /
                    (1000 * 60 * 60)
                );

                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) /
                    (1000 * 60)
                );

                const seconds = Math.floor(
                    (distance % (1000 * 60)) / 1000
                );

                let time = '';

                if (days > 0) {
                    time += days + 'd ';
                }

                time +=
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0');

                return time;
            }

            // COUNTDOWN
            function updateCountdown() {
                if (currentStatus !== 'UPCOMING') return;
                if (!targetTimestamp) return;

                const distance = Number(targetTimestamp) - Date.now();

                if (distance <= 0) {
                    setBadgeState(
                        'MATCH STARTING SOON',
                        badgeColor.amber,
                        true
                    );

                    return;
                }

                setBadgeState(
                    'UPCOMING - ' + formatTime(distance),
                    badgeColor.blue,
                    false
                );
            }

            updateCountdown();

            setInterval(updateCountdown, 1000);

            // RESTORE CORRECT BADGE AFTER EVENT POPUP
            function restoreBadge() {
                if (currentStatus === 'UPCOMING') {
                    updateCountdown();

                    if (!targetTimestamp) {
                        setBadgeState(
                            'UPCOMING',
                            badgeColor.blue,
                            false
                        );
                    }

                } else if (currentStatus === 'FINISHED') {
                    setBadgeState(
                        'FINISHED',
                        badgeColor.gray,
                        false
                    );

                } else if (currentStatus === 'BREAK') {
                    setBadgeState(
                        currentMatchState || 'BREAK',
                        badgeColor.orange,
                        true
                    );

                } else if (currentStatus === 'LIVE') {
                    setBadgeState(
                        'BOWLER RUNNING IN',
                        badgeColor.amber,
                        true
                    );
                }
            }

            // EVENT POPUP (BLINKS FOR 3.5s, THEN BOWLER RUNNING IN)
            function triggerPopup(text, colorClass) {
                const badge =
                    document.getElementById('match-event-badge');

                if (!badge) return;

                badge.innerText = text;

                badge.className =
                    'mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border shadow-[0_0_15px_rgba(255,255,255,0.65)] animate-ping ' +
                    colorClass;

                if (popupTimer) {
                    clearTimeout(popupTimer);
                }

                popupTimer = setTimeout(() => {
                    popupTimer = null;
                    restoreBadge();
                }, 3500);
            }

            function updateStatusBadge(status) {
                const elStatus =
                    document.getElementById('match-status-badge');

                const elDot =
                    document.getElementById('match-status-dot');

                if (!elStatus) return;

                if (status === 'LIVE') {
                    elStatus.innerText = 'LIVE';
                    elStatus.className = 'font-bold text-green-400';

                    if (elDot) {
                        elDot.className =
                            'w-2 h-2 rounded-full bg-green-500 animate-pulse';
                    }

                } else if (status === 'FINISHED') {
                    elStatus.innerText = 'FINISHED';
                    elStatus.className = 'font-bold text-gray-400';

                    if (elDot) {
                        elDot.className =
                            'w-2 h-2 rounded-full bg-gray-500';
                    }

                } else if (status === 'BREAK') {
                    elStatus.innerText = 'BREAK';
                    elStatus.className = 'font-bold text-orange-300';

                    if (elDot) {
                        elDot.className =
                            'w-2 h-2 rounded-full bg-orange-400';
                    }

                } else {
                    elStatus.innerText = 'UPCOMING';
                    elStatus.className = 'font-bold text-gray-400';

                    if (elDot) {
                        elDot.className =
                            'w-2 h-2 rounded-full bg-gray-500';
                    }
                }
            }

            function parseScore(score) {
                const value = String(score || '');

                const parts = value.split('/');

                const runs = parseInt(parts[0], 10);

                const wickets = parts.length > 1
                    ? parseInt(parts[1], 10)
                    : 0;

                if (!Number.isFinite(runs)) return null;

                return {
                    runs,
                    wickets: Number.isFinite(wickets) ? wickets : 0
                };
            }

            // LIVE DATA POLLING
            async function pollMatch() {
                try {
                    const res = await fetch(
                        '/api/match/' +
                        encodeURIComponent(matchId) +
                        '?_t=' + Date.now(),
                        {
                            method: 'GET',
                            cache: 'reload',
                            headers: {
                                'Cache-Control': 'no-store, no-cache, must-revalidate',
                                'Pragma': 'no-cache'
                            }
                        }
                    );

                    if (!res.ok) return;

                    const data = await res.json();

                    if (!data || !data.success || !data.match) {
                        return;
                    }

                    const m = data.match;

                    const elScoreA =
                        document.getElementById('score-a');

                    const elScoreB =
                        document.getElementById('score-b');

                    const elOversA =
                        document.getElementById('overs-a');

                    const elOversB =
                        document.getElementById('overs-b');

                    const elStateText =
                        document.getElementById('match-state-text');

                    const currentScoreA = m.scoreA || '-';
                    const currentScoreB = m.scoreB || '-';

                    const currentOvers =
                        m.oversA || m.oversB || '';

                    const stateText =
                        String(m.matchStateText || '').toUpperCase();

                    const newStatus =
                        String(m.status || 'UPCOMING').toUpperCase();

                    const wicketText =
                        String(m.wicketText || m.howOut || '')
                        .toUpperCase();

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

                    // UPDATE CURRENT MATCH STATE
                    currentStatus = newStatus;
                    stateLabel = m.matchStateText || newStatus;

                    currentMatchState =
                        String(stateLabel).toUpperCase();

                    // COUNTDOWN TIMESTAMP
                    if (
                        newStatus === 'UPCOMING' &&
                        m.countdownTimestamp
                    ) {
                        const newTimestamp =
                            Number(m.countdownTimestamp);

                        if (Number.isFinite(newTimestamp)) {
                            targetTimestamp = newTimestamp;
                        }

                    } else if (newStatus !== 'UPCOMING') {
                        targetTimestamp = null;
                    }

                    updateStatusBadge(newStatus);

                    // STATE TEXT
                    if (elStateText) {
                        if (newStatus === 'UPCOMING') {
                            elStateText.innerText =
                                'Match not started';

                        } else if (newStatus === 'LIVE') {
                            elStateText.innerText =
                                m.matchStateText || 'LIVE';

                        } else {
                            elStateText.innerText =
                                m.matchStateText || newStatus;
                        }
                    }

                    // BREAK STATES
                    if (
                        newStatus === 'BREAK' ||
                        stateText.includes('LUNCH') ||
                        stateText.includes('TEA') ||
                        stateText.includes('STUMPS') ||
                        stateText.includes('DRINKS') ||
                        stateText.includes('BREAK')
                    ) {
                        setBadgeState(
                            stateText || 'BREAK',
                            badgeColor.orange,
                            true
                        );

                    } else if (newStatus === 'UPCOMING') {
                        if (popupTimer) {
                            clearTimeout(popupTimer);
                            popupTimer = null;
                        }

                        if (targetTimestamp) {
                            updateCountdown();
                        } else {
                            setBadgeState(
                                'UPCOMING',
                                badgeColor.blue,
                                false
                            );
                        }

                    } else if (
                        newStatus === 'FINISHED' ||
                        stateText.includes('FINISHED') ||
                        stateText.includes('COMPLETED')
                    ) {
                        if (popupTimer) {
                            clearTimeout(popupTimer);
                            popupTimer = null;
                        }

                        targetTimestamp = null;

                        setBadgeState(
                            stateText || 'FINISHED',
                            badgeColor.gray,
                            false
                        );

                    } else if (newStatus === 'LIVE') {
                        // LIVE SCORE AND EVENT DETECTION
                        const ev = m.liveEvent || null;
                        const prevEv = lastLiveEvent || null;

                        const sixDiff = ev && prevEv ? (Number(ev.totalSixes || 0) - Number(prevEv.totalSixes || 0)) : 0;
                        const fourDiff = ev && prevEv ? (Number(ev.totalFours || 0) - Number(prevEv.totalFours || 0)) : 0;
                        const wktStatDiff = ev && prevEv ? (Number(ev.totalWickets || 0) - Number(prevEv.totalWickets || 0)) : 0;
                        const runStatDiff = ev && prevEv ? (Number(ev.totalRuns || 0) - Number(prevEv.totalRuns || 0)) : 0;
                        const ballStatDiff = ev && prevEv ? (Number(ev.totalBalls || 0) - Number(prevEv.totalBalls || 0)) : 0;
                        const reportChanged = ev && prevEv && ev.report && ev.report !== prevEv.report;

                        const scoreChanged =
                            currentScoreA !== lastScoreA ||
                            currentScoreB !== lastScoreB ||
                            currentOvers !== lastOvers ||
                            sixDiff > 0 ||
                            fourDiff > 0 ||
                            wktStatDiff > 0 ||
                            runStatDiff > 0 ||
                            ballStatDiff > 0 ||
                            reportChanged;

                        if (scoreChanged) {
                            let diffText = stateText && stateText !== 'LIVE' ? stateText : 'SCORE UPDATED';

                            let color =
                                'bg-yellow-500/20 border-yellow-400 text-yellow-300';

                            let ballSymbol = null;

                            const oldScore = parseScore(lastScoreA);
                            const newScore = parseScore(currentScoreA);

                            if (wktStatDiff > 0 || (oldScore && newScore && (newScore.wickets - oldScore.wickets) > 0)) {
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
                            } else if (sixDiff > 0 || (oldScore && newScore && (newScore.runs - oldScore.runs) === 6)) {
                                ballSymbol = '6';
                                diffText = 'SIX (6) 🚀';
                                color = badgeColor.purple;
                            } else if (fourDiff > 0 || (oldScore && newScore && (newScore.runs - oldScore.runs) === 4)) {
                                ballSymbol = '4';
                                diffText = 'FOUR (4) 🏏';
                                color = 'bg-blue-600/40 border-blue-400 text-blue-200';
                            } else if (oldScore && newScore) {
                                const runDiff = newScore.runs - oldScore.runs;
                                if (runDiff === 3) {
                                    ballSymbol = '3';
                                    diffText = '3 RUNS';
                                    color = 'bg-emerald-500/30 border-emerald-400 text-emerald-300';
                                } else if (runDiff === 2) {
                                    ballSymbol = '2';
                                    diffText = '2 RUNS';
                                    color = 'bg-indigo-500/30 border-indigo-400 text-indigo-300';
                                } else if (runDiff === 1) {
                                    ballSymbol = '1';
                                    diffText = '1 RUN';
                                    color = 'bg-green-500/30 border-green-400 text-green-300';
                                } else if (runDiff === 0 && (currentOvers !== lastOvers || ballStatDiff > 0)) {
                                    ballSymbol = 'DOT';
                                    diffText = 'DOT BALL';
                                    color = 'bg-slate-600/30 border-slate-400 text-slate-300';
                                }
                            } else if (runStatDiff > 0) {
                                ballSymbol = String(Math.min(runStatDiff, 6));
                                diffText = `${runStatDiff} RUN${runStatDiff > 1 ? 'S' : ''}`;
                                color = 'bg-green-500/30 border-green-400 text-green-300';
                            } else if (ballStatDiff > 0) {
                                ballSymbol = 'DOT';
                                diffText = 'DOT BALL';
                                color = 'bg-slate-600/30 border-slate-400 text-slate-300';
                            }

                            if (
                                ballSymbol &&
                                typeof window.recordLiveOverBall === 'function'
                            ) {
                                window.recordLiveOverBall(
                                    currentOvers,
                                    ballSymbol,
                                    currentScoreA
                                );
                            }

                            triggerPopup(diffText, color);

                            lastScoreA = currentScoreA;
                            lastScoreB = currentScoreB;
                            lastOvers = currentOvers;
                            lastLiveEvent = ev;

                        } else if (!popupTimer) {
                            setBadgeState(
                                'BOWLER RUNNING IN',
                                badgeColor.amber,
                                true
                            );
                        }
                    }

                    // UPDATE SCOREBOARD
                    if (elScoreA) {
                        elScoreA.innerText = currentScoreA;
                    }

                    if (elOversA && m.oversA !== undefined) {
                        elOversA.innerText = m.oversA;
                    }

                    if (elScoreB) {
                        elScoreB.innerText = currentScoreB;
                    }

                    if (elOversB && m.oversB !== undefined) {
                        elOversB.innerText = m.oversB;
                    }

                    if (
                        typeof window.syncOversStrip === 'function'
                    ) {
                        window.syncOversStrip(m);
                    }

                } catch (e) {
                    console.error('Live Polling Error:', e);
                }
            }

            // First refresh after page load, then every 5 seconds.
            pollMatch();
            setInterval(pollMatch, 5000);

        })();
    </script>
    `;
}

module.exports = { renderMatchHeader };
