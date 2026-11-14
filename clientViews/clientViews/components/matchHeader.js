// clientViews/components/matchHeader.js

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

    const hasScore = (scoreA !== '-' || scoreB !== '-');
    const isLive = matchStatus === 'LIVE' || hasScore;
    const isFinished = matchStatus === 'FINISHED';

    const dot = isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500';
    const statusColor = isLive ? 'text-green-400' : 'text-gray-400';
    const badgeText = isLive ? 'LIVE' : (isFinished ? 'FINISHED' : 'UPCOMING');

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

    <!-- DYNAMIC MATCH BANNER (Always active structure) -->
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
                <span class="font-bold ${statusColor}">${badgeText}</span>
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
                    <div id="match-event-badge" class="mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase bg-[#00c0FF]/20 border border-[#00c0FF] text-[#00c0FF] ${isLive ? 'shadow-[0_0_10px_rgba(0,192,255,0.4)] animate-pulse' : ''}">
                        ${badgeText}
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
    `;
}

module.exports = { renderMatchHeader };
