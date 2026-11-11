// clientViews/components/matchHeader.js

function renderMatchHeader(user, matchData) {
    const username = user ? user.username || 'Client' : 'Client';
    const balance = Number(user ? user.points || 0 : 0);
    const exposure = Number(user ? user.exposure || 0 : 0);

    const teamA = matchData && matchData.teamA ? matchData.teamA : 'Pakistan';
    const teamB = matchData && matchData.teamB ? matchData.teamB : 'Sri Lanka';
    const flagA = matchData && matchData.flagA ? matchData.flagA : 'https://flagcdn.com/w40/pk.png';
    const flagB = matchData && matchData.flagB ? matchData.flagB : 'https://flagcdn.com/w40/lk.png';
    
    const venue = matchData && matchData.venue ? matchData.venue : 'Rawalpindi Cricket Stadium, Pakistan';
    const matchTime = matchData && matchData.dateTime ? matchData.dateTime : '09/11/2026 10:00:00';

    // API ke liye match status ('LIVE', 'TOSS', 'SCHEDULED')
    const matchStatus = matchData && matchData.status ? matchData.status.toUpperCase() : 'LIVE';

    return `
    <!-- TOP HEADER BAR -->
    <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center space-x-3">
            <a href="/home?user=${encodeURIComponent(username)}" class="text-white text-base focus:outline-none"><i class="fa-solid fa-arrow-left"></i></a>
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

    <!-- DYNAMIC MATCH BANNER (SCHEDULED, TOSS, OR LIVE) -->
    <div class="bg-scoreboard-dark text-white border-b border-gray-800">
        <div class="bg-[#0b141d] px-3 py-1.5 flex justify-between items-center text-[11px] font-semibold text-gray-300 border-b border-gray-800">
            <div class="flex items-center space-x-1.5">
                <span class="text-white font-bold tracking-wide">${teamA.toUpperCase()} V ${teamB.toUpperCase()}</span>
            </div>
            <div class="text-[10px] text-gray-400 font-mono">${matchTime}</div>
        </div>

        ${matchStatus === 'SCHEDULED' ? `
            <!-- SCHEDULED / COUNTDOWN VIEW -->
            <div class="p-4 bg-[#111c26] text-center space-y-2">
                <div class="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                    <span class="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-1.5 py-0.5 rounded font-bold uppercase">Scheduled</span>
                    <span>• ${venue}</span>
                </div>
                <div class="text-sm font-bold text-white">${teamA} vs ${teamB}</div>
                <div class="bg-[#1a2234] inline-block px-4 py-1.5 rounded border border-gray-700">
                    <div class="text-[10px] text-gray-400 uppercase">Starts in</div>
                    <div id="match-countdown" class="text-base font-mono font-bold text-[#00c0FF]">05:00</div>
                </div>
            </div>
        ` : matchStatus === 'TOSS' ? `
            <!-- TOSS TIME VIEW -->
            <div class="p-4 bg-[#111c26] text-center space-y-2">
                <div class="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
                    <span class="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1.5 py-0.5 rounded font-bold uppercase">Toss Time</span>
                    <span>• ${venue}</span>
                </div>
                <div class="text-sm font-bold text-white">${teamA} vs ${teamB}</div>
                <div class="bg-[#1a2234] inline-block px-4 py-1.5 rounded border border-yellow-500/50">
                    <div class="text-[10px] text-yellow-400 uppercase font-semibold">Toss in</div>
                    <div id="toss-countdown" class="text-base font-mono font-bold text-yellow-300">00:30</div>
                </div>
            </div>
        ` : `
            <!-- LIVE SCOREBOARD VIEW (Aapka Original Design) -->
            <div class="p-3 bg-[#111c26] relative">
                <div class="text-[10px] text-gray-400 flex items-center space-x-1.5 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="font-bold text-green-400">LIVE</span>
                    <span>• Test • ${venue}</span>
                </div>
                
                <div class="grid grid-cols-12 items-center gap-2">
                    <div class="col-span-4 flex items-center space-x-2">
                        <img src="${flagA}" alt="${teamA}" class="w-6 h-4 rounded shadow-sm object-cover border border-white/20">
                        <div>
                            <div class="font-black text-sm text-white flex items-center space-x-1">
                                <span id="score-a">434/9</span>
                                <span class="text-[9px] text-gray-400 font-normal">d</span>
                            </div>
                            <div class="text-[9px] text-gray-400">(106.3)</div>
                        </div>
                    </div>

                    <div class="col-span-4 text-center flex flex-col items-center justify-center">
                        <div id="match-event-badge" class="mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase bg-[#00c0FF]/20 border border-[#00c0FF] text-[#00c0FF] shadow-[0_0_10px_rgba(0,192,255,0.4)] animate-pulse">
                            DOT
                        </div>
                        <div class="text-[10px] text-gray-300 font-bold">Day 2 | SL trail by 348</div>
                        <div class="text-yellow-400 font-extrabold text-xs">31.5 ovr</div>
                    </div>

                    <div class="col-span-4 flex items-center justify-end space-x-2 text-right">
                        <div>
                            <div class="font-black text-sm text-white" id="score-b">86/3</div>
                            <div class="text-[9px] text-gray-400">(20.0) <span class="text-yellow-400">CRR: 4.3</span></div>
                        </div>
                        <img src="${flagB}" alt="${teamB}" class="w-6 h-4 rounded shadow-sm object-cover border border-white/20">
                    </div>
                </div>

                <div class="mt-3 pt-2 border-t border-gray-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[10px]">
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 20 <span class="text-yellow-400">(9)</span></span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 19 <span class="text-yellow-400">(5)</span></span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>
                </div>
            </div>
        `}
    </div>

    <!-- TABS BAR WITH LIVE TV ICON -->
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
