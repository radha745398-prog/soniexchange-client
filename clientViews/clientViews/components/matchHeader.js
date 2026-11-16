// clientViews/components/matchHeader.js - Final Updated with All States, Countdowns & Event Popups
function logoHTML(src, name) {
    if (src) {
        return `<img src="${src}" alt="${name}" class="w-6 h-6 rounded-full object-contain bg-white/10 border border-white/20">`;
    }
    const initials = String(name || '?').trim().slice(0, 2).toUpperCase();
    return `<div class="w-6 h-6 rounded-full bg-[#1f2937] border border-white/20 flex items-center justify-center text-[8px] font-bold text-gray-300">${initials}</div>`;
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
    const matchStatus = String(d.status || 'SCHEDULED').toUpperCase();

    const scoreA = d.scoreA || '-';
    const oversA = d.oversA || '';
    const scoreB = d.scoreB || '-';
    const oversB = d.oversB || '';
    const matchStateText = d.matchStateText || matchStatus;
    const countdownTimestamp = d.countdownTimestamp || null;

    const hasScore = (scoreA !== '-' || scoreB !== '-' || scoreA === 'Yet to bat' || scoreB === 'Yet to bat');
    const isLive = matchStatus === 'LIVE' || hasScore;
    const isFinished = matchStatus === 'FINISHED';

    const dot = isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500';
    const statusColor = isLive ? 'text-green-400' : 'text-gray-400';
    const badgeText = isLive ? 'LIVE' : (isFinished ? 'FINISHED' : 'UPCOMING');

    // Smart Initial Badge determination
    let initialBadgeText = matchStateText;
    let initialBadgeClass = "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    
    const upperState = String(matchStateText).toUpperCase();
    if (upperState.includes('BREAK') || upperState.includes('LUNCH') || upperState.includes('TEA') || upperState.includes('STUMPS') || upperState.includes('INNINGS') || upperState.includes('DRINKS')) {
        initialBadgeClass = "bg-orange-500/30 border-orange-400 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.4)]";
    } else if (upperState.includes('NOT STARTED') || upperState.includes('SCHEDULED') || upperState.includes('UPCOMING')) {
        initialBadgeText = 'UPCOMING';
        initialBadgeClass = "bg-blue-500/20 border-blue-400 text-blue-300";
    } else if (isLive && !upperState.includes('BOWLER')) {
        initialBadgeText = "BOWLER RUNNING IN";
        initialBadgeClass = "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse";
    }

    return `
    <!-- TOP HEADER BAR -->
    <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center space-x-3">
            <a href="/dashboard?user=${encodeURIComponent(username)}" class="text-white text-base focus:outline-none"><i class="fa-solid fa-arrow-left"></i></a>
            <h1 class="text-base font-black tracking-wider italic text-[#00c0FF]">SONIEXCHANGE</h1>
        </div>

        <div class="flex items-center space-x-3 text-[11px]">
            <div class="text-right">
                <div class="text-gray-300">Balance: <span class="font-bold text-green-400" id="user-balance">${balance.toLocaleString()}</span></div>
                <div class="text-gray-400">Exp: <span class="font-bold text-red-400" id="user-exposure">${exposure.toLocaleString()}</span></div>
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
                <span class="text-white font-bold tracking-wide">${teamA.toUpperCase()} V ${teamB.toUpperCase()}</span>
            </div>
            <div class="text-[10px] text-gray-400 font-mono">${matchTime}</div>
        </div>

        <div class="p-3 bg-[#111c26] relative">
            <div class="text-[10px] text-gray-400 flex items-center space-x-1.5 mb-2">
                <span class="w-2 h-2 rounded-full ${dot}"></span>
                <span class="font-bold ${statusColor}" id="match-status-badge">${badgeText}</span>
                <span>• ${venue}</span>
            </div>

            <div class="grid grid-cols-12 items-center gap-2">
                <div class="col-span-4 flex items-center space-x-2">
                    ${logoHTML(d.logoA, teamA)}
                    <div>
                        <div class="font-black text-sm text-white flex items-center space-x-1">
                            <span id="score-a">${scoreA}</span>
                        </div>
                        <div class="text-[9px] text-gray-400" id="overs-a">${oversA}</div>
                    </div>
                </div>

                <div class="col-span-4 text-center flex flex-col items-center justify-center">
                    <div id="match-event-badge" class="mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border ${initialBadgeClass}">
                        ${initialBadgeText}
                    </div>
                    <div class="text-[10px] text-gray-300 font-bold" id="match-state-text">${matchStateText}</div>
                </div>

                <div class="col-span-4 flex items-center justify-end space-x-2 text-right">
                    <div>
                        <div class="font-black text-sm text-white" id="score-b">${scoreB}</div>
                        <div class="text-[9px] text-gray-400" id="overs-b">${oversB}</div>
                    </div>
                    ${logoHTML(d.logoB, teamB)}
                </div>
            </div>
        </div>
    </div>

    <!-- TABS BAR -->
    <div class="bg-[#0b141d] border-b border-gray-800 flex text-center font-bold text-xs sticky top-[41px] z-40">
        <div class="flex-1 py-2.5 border-b-2 border-[#00c0FF] text-[#00c0FF] tracking-wider uppercase">ODDS</div>
        <div class="flex-1 py-2.5 text-gray-400 hover:text-white cursor-pointer tracking-wider uppercase">MATCHED BET (<span id="matched-bet-count">0</span>)</div>
        <div class="px-4 py-2.5 text-gray-400 hover:text-white cursor-pointer border-l border-gray-800 flex items-center justify-center">
            <i class="fa-solid fa-tv text-sm text-[#00c0FF]"></i>
        </div>
    </div>

    <!-- SMART REAL-TIME POLLING, COUNTDOWN & MATCH STATE SCRIPT -->
    <script>
        (function() {
            const matchId = "${matchId}";
            if (!matchId) return;

            let lastScoreA = "${scoreA}";
            let lastScoreB = "${scoreB}";
            let lastOvers = "${oversA}" || "${oversB}";
            let popupTimer = null;
            
            let targetTimestamp = ${countdownTimestamp ? countdownTimestamp : 'null'};
            let stateLabel = "${matchStateText}";

            // Professional Countdown Ticker
            function updateCountdown() {
                const badge = document.getElementById('match-event-badge');
                if (!badge) return;
                if (!targetTimestamp) return;

                const now = new Date().getTime();
                const distance = targetTimestamp - now;

                if (distance <= 0) {
                    badge.innerText = stateLabel !== 'UPCOMING' ? stateLabel : 'MATCH STARTING SOON';
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                let timeStr = '';
                if (days > 0) timeStr += days + 'd ';
                timeStr += (hours < 10 ? '0' : '') + hours + ':' + 
                           (minutes < 10 ? '0' : '') + minutes + ':' + 
                           (seconds < 10 ? '0' : '') + seconds;

                badge.innerText = stateLabel + ' - ' + timeStr;
            }

            if (targetTimestamp) {
                updateCountdown();
                setInterval(updateCountdown, 1000);
            }

            function setBadgeState(text, colorClass, animate = true) {
                const badge = document.getElementById('match-event-badge');
                if (!badge) return;
                badge.innerText = text;
                badge.className = "mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border " + colorClass + (animate ? " shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse" : "");
            }

            function triggerPopup(text, colorClass) {
                const badge = document.getElementById('match-event-badge');
                if (!badge) return;
                
                badge.innerText = text;
                badge.className = "mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase border shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-bounce " + colorClass;

                if (popupTimer) clearTimeout(popupTimer);

                popupTimer = setTimeout(() => {
                    setBadgeState("BOWLER RUNNING IN", "bg-amber-500/20 border-amber-400 text-amber-300", true);
                }, 3000);
            }

            setInterval(async () => {
                try {
                    const res = await fetch('/api/match/' + matchId + '?_t=' + Date.now(), { 
                        headers: { 
                            'Cache-Control': 'no-store, no-cache, must-revalidate',
                            'Pragma': 'no-cache'
                        } 
                    });
                    const data = await res.json();
                    
                    if (data && data.success && data.match) {
                        const m = data.match;
                        
                        const elScoreA = document.getElementById('score-a');
                        const elOversA = document.getElementById('overs-a');
                        const elOversB = document.getElementById('overs-b');
                        const elScoreB = document.getElementById('score-b');
                        const elStateText = document.getElementById('match-state-text');

                        let currentScoreA = m.scoreA || '-';
                        let currentOvers = m.oversA || m.oversB || '';
                        let stateText = String(m.matchStateText || '').toUpperCase();
                        let wicketText = String(m.wicketText || m.howOut || '').toUpperCase();

                        if (m.countdownTimestamp) {
                            targetTimestamp = m.countdownTimestamp;
                            stateLabel = m.matchStateText || stateText;
                        }

                        // 1. Comprehensive Breaks & Special States Check
                        if (stateText.includes('LUNCH') || stateText.includes('TEA') || stateText.includes('STUMPS') || stateText.includes('BREAK')) {
                            setBadgeState(stateText, "bg-orange-500/30 border-orange-400 text-orange-300", true);
                        } else if (stateText.includes('DRINKS')) {
                            setBadgeState("DRINKS BREAK", "bg-yellow-500/30 border-yellow-400 text-yellow-300", true);
                        } else if (stateText.includes('INNINGS') || stateText.includes('INN BREAK')) {
                            setBadgeState("INNINGS BREAK", "bg-blue-500/30 border-blue-400 text-blue-300", true);
                        } else if (stateText.includes('UPCOMING') || stateText.includes('SCHEDULED')) {
                            setBadgeState("UPCOMING", "bg-blue-500/20 border-blue-400 text-blue-300", false);
                        } else if (stateText.includes('FINISHED') || stateText.includes('COMPLETED')) {
                            setBadgeState("FINISHED", "bg-gray-500/20 border-gray-400 text-gray-300", false);
                        } else {
                            // 2. Live Play & Score Event Popups (4, 6, Wickets, 1,2,3 Runs, Dot Ball)
                            if (currentScoreA !== lastScoreA || currentOvers !== lastOvers) {
                                let diffText = "SCORE UPDATED";
                                let color = "bg-yellow-500/20 border-yellow-400 text-yellow-300";

                                if (currentScoreA.includes('/') && lastScoreA.includes('/')) {
                                    let oldParts = lastScoreA.split('/');
                                    let newParts = currentScoreA.split('/');
                                    let runDiff = parseInt(newParts[0]) - parseInt(oldParts[0]);
                                    let wktDiff = parseInt(newParts[1]) - parseInt(oldParts[1]);

                                    if (wktDiff > 0) {
                                        if (wicketText.includes('STUMP')) {
                                            diffText = "STUMP OUT!";
                                        } else if (wicketText.includes('RUN OUT')) {
                                            diffText = "RUN OUT!";
                                        } else if (wicketText.includes('CAUGHT') || wicketText.includes('CATCH')) {
                                            diffText = "CAUGHT OUT!";
                                        } else {
                                            diffText = "WICKET FALLEN!";
                                        }
                                        color = "bg-red-600/40 border-red-500 text-red-300";
                                    } else if (runDiff === 6) {
                                        diffText = "SIX (6) 🚀";
                                        color = "bg-purple-600/40 border-purple-400 text-purple-200";
                                    } else if (runDiff === 4) {
                                        diffText = "FOUR (4) 🏏";
                                        color = "bg-blue-600/40 border-blue-400 text-blue-200";
                                    } else if (runDiff === 3) {
                                        diffText = "3 RUNS";
                                        color = "bg-green-500/30 border-green-400 text-green-300";
                                    } else if (runDiff === 2) {
                                        diffText = "2 RUNS";
                                        color = "bg-green-500/30 border-green-400 text-green-300";
                                    } else if (runDiff === 1) {
                                        diffText = "1 RUN";
                                        color = "bg-green-500/30 border-green-400 text-green-300";
                                    } else if (runDiff === 0) {
                                        diffText = "DOT BALL";
                                        color = "bg-gray-600/30 border-gray-400 text-gray-300";
                                    }
                                }

                                triggerPopup(diffText, color);
                                lastScoreA = currentScoreA;
                                lastOvers = currentOvers;
                            }
                        }

                        if (elScoreA) elScoreA.innerText = m.scoreA;
                        if (elOversA && m.oversA !== undefined) elOversA.innerText = m.oversA;
                        if (elScoreB) elScoreB.innerText = m.scoreB;
                        if (elOversB && m.oversB !== undefined) elOversB.innerText = m.oversB;
                        if (elStateText && m.matchStateText) elStateText.innerText = m.matchStateText;
                    }
                } catch (e) {
                    console.error("Live Polling Error:", e);
                }
            }, 1500);
        })();
    </script>
    `;
}

module.exports = { renderMatchHeader };
