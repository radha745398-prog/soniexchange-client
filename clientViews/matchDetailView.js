// clientViews/matchDetailView.js

function renderMatchDetailPage(user, matchData) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0);
    const exposure = Number(user.exposure || 0);

    const teamA = matchData ? matchData.teamA : 'Pakistan';
    const teamB = matchData ? matchData.teamB : 'Sri Lanka';
    const matchId = matchData ? matchData.id : '556727281';

    // Flag URLs for national teams (fallback to SVG placeholder if custom)
    const flagA = 'https://flagcdn.com/w40/pk.png';
    const flagB = 'https://flagcdn.com/w40/lk.png';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${teamA} v ${teamB} - SONIEXCHANGE</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { background-color: #ffffff; color: #111827; font-family: sans-serif; }
            .bg-custom-navy { background-color: #f8fafc; }
            .bg-custom-header { background-color: #0b1118; color: #ffffff; }
            .bg-teal-bar { background-color: #0e5c75; color: #ffffff; }
            .bg-scoreboard-dark { background-color: #111827; }
            .odds-back { background-color: #72bbef; color: #000; cursor: pointer; }
            .odds-lay { background-color: #faa9ba; color: #000; cursor: pointer; }
            .fancy-no { background-color: #faa9ba; color: #000; cursor: pointer; }
            .fancy-yes { background-color: #72bbef; color: #000; cursor: pointer; }
            .bet-clickable { cursor: pointer; }
            
            /* Market Suspended State */
            .market-suspended { background-color: #2a2e33 !important; color: #71767a !important; position: relative; cursor: not-allowed; }
            .market-suspended::after { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background-color: #ef4444; }
            
            /* Yellow Price Flash */
            @keyframes priceFlash {
                0% { background-color: #fde047 !important; color: #000 !important; }
                100% { background-color: inherit; }
            }
            .price-update { animation: priceFlash 0.8s ease-in-out; }

            /* Modal Overlay */
            .modal-overlay { background: rgba(0, 0, 0, 0.6); }

            /* Custom Horizontal Scrollbar */
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
    </head>
    <body class="min-h-screen flex flex-col text-xs relative">
        
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

        <!-- EXACT MATCH SCORE & OVER-BY-OVER INFO BANNER -->
        <div class="bg-scoreboard-dark text-white border-b border-gray-800">
            <!-- Top Match Header info line -->
            <div class="bg-[#0b141d] px-3 py-1.5 flex justify-between items-center text-[11px] font-semibold text-gray-300 border-b border-gray-800">
                <div class="flex items-center space-x-1.5">
                    <span class="text-white font-bold tracking-wide">${teamA.toUpperCase()} V ${teamB.toUpperCase()}</span>
                </div>
                <div class="text-[10px] text-gray-400 font-mono">09/11/2026 10:00:00</div>
            </div>

            <!-- Main Live Score Card with Team Logos -->
            <div class="p-3 bg-[#111c26] relative">
                <div class="text-[10px] text-gray-400 flex items-center space-x-1.5 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="font-bold text-green-400">LIVE</span>
                    <span>• Test • Rawalpindi Cricket Stadium, Pakistan</span>
                </div>
                
                <div class="grid grid-cols-12 items-center gap-2">
                    <!-- Team A Score & Flag -->
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

                    <!-- Match Status Center Badge & Dynamic Ball Event Badge (DOT / 4 / 6 / W) Added Here -->
                    <div class="col-span-4 text-center flex flex-col items-center justify-center">
                        <div id="match-event-badge" class="mb-1 px-3 py-0.5 rounded-full font-black text-[11px] tracking-wider uppercase bg-[#00c0FF]/20 border border-[#00c0FF] text-[#00c0FF] shadow-[0_0_10px_rgba(0,192,255,0.4)] animate-pulse">
                            DOT
                        </div>
                        <div class="text-[10px] text-gray-300 font-bold">Day 2 | SL trail by 348</div>
                        <div class="text-yellow-400 font-extrabold text-xs">31.5 ovr</div>
                    </div>

                    <!-- Team B Score & Flag -->
                    <div class="col-span-4 flex items-center justify-end space-x-2 text-right">
                        <div>
                            <div class="font-black text-sm text-white" id="score-b">86/3</div>
                            <div class="text-[9px] text-gray-400">(20.0) <span class="text-yellow-400">CRR: 4.3</span></div>
                        </div>
                        <img src="${flagB}" alt="${teamB}" class="w-6 h-4 rounded shadow-sm object-cover border border-white/20">
                    </div>
                </div>

                <!-- Over-by-Over Ball Tracker Line (1 Over to All Overs Scrollable Underline) -->
                <div class="mt-3 pt-2 border-t border-gray-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[10px]">
                    
                    <!-- Over 20 -->
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 20 <span class="text-yellow-400">(9)</span></span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>

                    <!-- Over 19 -->
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 19 <span class="text-yellow-400">(5)</span></span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">4</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>

                    <!-- Over 18 -->
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 18 <span class="text-yellow-400">(7)</span></span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-[#00c0FF] text-black flex items-center justify-center font-bold text-[9px]">6</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>

                    <!-- Over 17 -->
                    <div class="flex items-center space-x-1 bg-black/40 px-2 py-1 rounded border border-gray-700/40">
                        <span class="text-gray-300 font-bold">Ov 17 <span class="text-red-400">(W)</span></span>
                        <span class="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[9px]">W</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                        <span class="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">1</span>
                        <span class="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px]">0</span>
                    </div>

                </div>
            </div>
        </div>

        <!-- TABS BAR WITH LIVE TV ICON -->
        <div class="bg-[#0b141d] border-b border-gray-800 flex text-center font-bold text-xs sticky top-[41px] z-40">
            <div class="flex-1 py-2.5 border-b-2 border-[#00c0FF] text-[#00c0FF] tracking-wider uppercase">ODDS</div>
            <div class="flex-1 py-2.5 text-gray-400 hover:text-white cursor-pointer tracking-wider uppercase">MATCHED BET (<span id="matched-bet-count">0</span>)</div>
            <div class="px-4 py-2.5 text-gray-400 hover:text-white cursor-pointer border-l border-gray-800 flex items-center justify-center">
                <i class="fa-solid fa-tv text-sm text-[#00c0FF]"></i>
            </div>
        </div>

        <!-- MAIN CONTENT MARKETS -->
        <main class="flex-1 p-2 space-y-3 max-w-7xl mx-auto w-full">
            
            <!-- 1. MATCH ODDS -->
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 flex justify-between items-center text-xs border-b border-gray-200">
                    <span>MATCH_ODDS</span>
                    <span class="text-[10px] text-gray-600">Min: 100 Max: 50K</span>
                </div>
                <div class="grid grid-cols-12 bg-[#f1f5f9] text-gray-600 text-[10px] py-1 px-2 border-b border-gray-200">
                    <div class="col-span-6"></div>
                    <div class="col-span-3 text-center text-[#0369a1] font-bold">Back</div>
                    <div class="col-span-3 text-center text-[#991b1b] font-bold">Lay</div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">${teamA}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Back)', 5)"><span class="font-bold text-xs text-black">5</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Back)', 5.2)"><span class="font-bold text-xs text-black">5.2</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" id="odds-ta-back" onclick="openBetSlip('${teamA} (Back)', 5.3)">5.3</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" id="odds-ta-lay" onclick="openBetSlip('${teamA} (Lay)', 5.4)">5.4</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Lay)', 5.5)"><span class="font-bold text-xs text-black">5.5</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Lay)', 5.6)"><span class="font-bold text-xs text-black">5.6</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">${teamB}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Back)', 9.2)"><span class="font-bold text-xs text-black">9.2</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Back)', 9.4)"><span class="font-bold text-xs text-black">9.4</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamB} (Back)', 9.8)">9.8</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamB} (Lay)', 11)">11</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Lay)', 11.5)"><span class="font-bold text-xs text-black">11.5</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Lay)', 12)"><span class="font-bold text-xs text-black">12</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">The Draw</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Back)', 1.37)"><span class="font-bold text-xs text-black">1.37</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Back)', 1.38)"><span class="font-bold text-xs text-black">1.38</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('The Draw (Back)', 1.39)">1.39</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" onclick="openBetSlip('The Draw (Lay)', 1.4)">1.4</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Lay)', 1.41)"><span class="font-bold text-xs text-black">1.41</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Lay)', 1.42)"><span class="font-bold text-xs text-black">1.42</span></div>
                    </div>
                </div>
            </div>

            <!-- 2. BOOKMAKER -->
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 text-xs border-b border-gray-200">
                    Bookmaker
                </div>
                <div class="grid grid-cols-12 bg-[#f1f5f9] text-gray-600 text-[10px] py-1 px-2 border-b border-gray-200">
                    <div class="col-span-6">Min: 100 Max: 50K</div>
                    <div class="col-span-3 text-center text-[#0369a1] font-bold">Back</div>
                    <div class="col-span-3 text-center text-[#991b1b] font-bold">Lay</div>
                </div>
                <div class="grid grid-cols-12 items-center p-2 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">${teamA}</div>
                    <div class="col-span-3 grid grid-cols-2 gap-1 text-center">
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamA} BM (Back)', 100)">--</div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamA} BM (Back)', 100)">--</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-2 gap-1 text-center pl-1">
                        <div class="market-suspended rounded py-1 font-bold text-xs">--</div>
                        <div class="market-suspended rounded py-1 font-bold text-xs">--</div>
                    </div>
                </div>
            </div>

            <!-- 3. NORMAL SECTION (2-Column Grid) -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Normal</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">20 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 100K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">16 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('16 over run SL (No)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('16 over run SL (Yes)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st innings run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>333</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>337</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st innings run 3rd wkt SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('1st innings run 3rd wkt SL (No)', 326)"><div>326</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('1st innings run 3rd wkt SL (Yes)', 329)"><div>329</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st innings run 1st wkt SL 2</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">2nd wkt SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('2nd wkt SL (No)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('2nd wkt SL (Yes)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd wkt inwr SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('3rd wkt inwr SL (No)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('3rd wkt inwr SL (Yes)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">L Udara 1st innings</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('L Udara 1st innings (No)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('L Udara 1st innings (Yes)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Kusal Mendis runs</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kusal Mendis runs (No)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kusal Mendis runs (Yes)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Kaminen Mendis boundaries</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kaminen Mendis boundaries (No)', 4)"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kaminen Mendis boundaries (Yes)', 5)"><div>5</div><div class="text-[9px] font-normal">250K</div></button>
                    </div>
                </div>

            </div>

            <!-- 4. OVER BY OVER -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Over By Over</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Only 17 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Only 18 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Only 18 over run SL (No)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Only 18 over run SL (Yes)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
                    </div>
                </div>
            </div>

            <!-- 5. FANCY1 -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Fancy1</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd Wkt Caught out SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd Wkt Caught out SL (Back)', 1.35)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd Wkt Caught out SL (Lay)', 1.55)">--</button></div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd wkt out L. Udara</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd wkt out L. Udara (Back)', 1.75)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd wkt out L. Udara (Lay)', 2.05)">--</button></div>
                </div>
            </div>

            <!-- 6. ODD-EVEN -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Odd-Even</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st Inn 20 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 20 over run odd even SL (Odd)', 1.96)">1.96</button><button class="market-suspended px-3 py-1 rounded font-bold">1.96</button></div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st Inn 30 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 30 over run odd even SL (Odd)', 1.96)">1.96</button><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 30 over run odd even SL (Even)', 1.96)">1.96</button></div>
                </div>
            </div>

            <!-- 7. METER -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Meter</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd wkt meter SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold">112</button>
                        <button class="market-suspended px-3 py-1 rounded font-bold">115</button>
                    </div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">L Udara meter</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold" onclick="openBetSlip('L Udara meter (No)', 83)">83</button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold" onclick="openBetSlip('L Udara meter (Yes)', 86)">86</button>
                    </div>
                </div>
            </div>

            <!-- 8. 2ND INN OVERS (20, 30, 40, 50) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 20 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 20 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 20 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 20 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 30 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 30 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 30 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 30 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 40 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 40 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 40 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 40 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 50 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 50 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 50 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="openBetSlip('2nd Inn 50 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>
            </div>

        </main>

        <!-- ================= PLACE BET MODAL POPUP ================= -->
        <div id="bet-slip-modal" class="fixed inset-0 modal-overlay z-50 flex items-center justify-center hidden">
            <div class="bg-[#1e293b] text-white w-full max-w-md rounded-lg shadow-2xl border border-gray-700 overflow-hidden mx-3">
                <div class="bg-[#0f172a] px-4 py-2.5 flex justify-between items-center border-b border-gray-700 font-bold text-sm">
                    <span id="modal-market-title" class="text-[#00c0FF]">Place Bet</span>
                    <button onclick="closeBetSlip()" class="text-gray-400 hover:text-white text-base"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <div class="p-4 space-y-3 text-xs">
                    <div class="flex justify-between bg-black/30 p-2 rounded">
                        <div>
                            <div class="text-gray-400 text-[10px]">Odds</div>
                            <div class="flex items-center space-x-2 mt-1">
                                <button onclick="adjustOdds(-0.01)" class="bg-gray-700 px-2 py-0.5 rounded font-bold">-</button>
                                <span id="modal-odds-val" class="font-bold text-sm text-yellow-400">0.00</span>
                                <button onclick="adjustOdds(0.01)" class="bg-gray-700 px-2 py-0.5 rounded font-bold">+</button>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-gray-400 text-[10px]">Profit</div>
                            <div id="modal-profit-val" class="font-bold text-sm text-green-400 mt-1">0.00</div>
                        </div>
                    </div>

                    <div>
                        <label class="text-gray-300 font-semibold block mb-1">Amount (Stake)</label>
                        <input type="number" id="modal-stake-input" class="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#00c0FF]" placeholder="Enter amount..." oninput="calculateProfit()">
                    </div>

                    <!-- Quick Stake Buttons -->
                    <div class="grid grid-cols-4 gap-1.5">
                        <button onclick="addStake(1000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+1k</button>
                        <button onclick="addStake(2000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+2k</button>
                        <button onclick="addStake(5000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+5k</button>
                        <button onclick="addStake(10000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+10k</button>
                        <button onclick="addStake(25000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+25k</button>
                        <button onclick="addStake(50000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+50k</button>
                        <button onclick="addStake(75000)" class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">+75k</button>
                        <button onclick="clearStake()" class="bg-red-900/60 hover:bg-red-800 py-1 rounded font-bold text-red-200">Clear</button>
                    </div>

                    <div class="flex space-x-2 pt-2">
                        <button onclick="closeBetSlip()" class="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded font-bold text-gray-300">Reset</button>
                        <button onclick="confirmPlaceBet()" class="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded font-bold text-white shadow-lg">Place Bet</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- JAVASCRIPT FOR BETTING & POINTS LOGIC -->
        <script>
            let currentBet = {
                title: '',
                odds: 0,
                stake: 0,
                username: '${username}',
                matchId: '${matchId}'
            };

            let userBalance = ${balance};
            let userExposure = ${exposure};
            let betCount = 0;

            function openBetSlip(title, odds) {
                currentBet.title = title;
                currentBet.odds = parseFloat(odds);
                currentBet.stake = 0;

                document.getElementById('modal-market-title').innerText = title;
                document.getElementById('modal-odds-val').innerText = currentBet.odds;
                document.getElementById('modal-stake-input').value = '';
                document.getElementById('modal-profit-val').innerText = '0.00';
                
                document.getElementById('bet-slip-modal').classList.remove('hidden');
            }

            function closeBetSlip() {
                document.getElementById('bet-slip-modal').classList.add('hidden');
            }

            function adjustOdds(val) {
                currentBet.odds = Math.max(1.01, +(currentBet.odds + val).toFixed(2));
                document.getElementById('modal-odds-val').innerText = currentBet.odds;
                calculateProfit();
            }

            function addStake(amount) {
                const input = document.getElementById('modal-stake-input');
                let currentVal = parseInt(input.value) || 0;
                input.value = currentVal + amount;
                calculateProfit();
            }

            function clearStake() {
                document.getElementById('modal-stake-input').value = '';
                calculateProfit();
            }

            function calculateProfit() {
                const stake = parseFloat(document.getElementById('modal-stake-input').value) || 0;
                currentBet.stake = stake;
                const profit = (stake * (currentBet.odds - 1)).toFixed(2);
                document.getElementById('modal-profit-val').innerText = profit > 0 ? profit : '0.00';
            }

            // CONFIRM PLACE BET (Deducts points & sends to Admin Panel without annoying browser alert)
            function confirmPlaceBet() {
                if (currentBet.stake <= 0) {
                    alert('Please enter a valid stake amount.');
                    return;
                }

                if (currentBet.stake > userBalance) {
                    alert('Insufficient balance / points!');
                    return;
                }

                // Deduct points locally
                userBalance -= currentBet.stake;
                userExposure += currentBet.stake;
                betCount += 1;

                document.getElementById('user-balance').innerText = userBalance.toLocaleString();
                document.getElementById('user-exposure').innerText = userExposure.toLocaleString();
                document.getElementById('matched-bet-count').innerText = betCount;

                // Send Bet to Backend API so Admin can see it in real-time
                fetch('/api/place-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentBet)
                }).then(res => {
                    console.log('Bet successfully recorded and sent to Admin panel.');
                }).catch(err => {
                    console.error('Error syncing bet with backend:', err);
                });

                // Modal closes smoothly without any browser alert popup
                closeBetSlip();
            }
        </script>

        <footer class="bg-gray-900 border-t border-gray-200 p-4 text-center text-gray-400 text-[10px] space-y-2 mt-4">
            <div class="flex justify-center space-x-4 font-bold text-gray-300 text-xs">
                <a href="#" class="hover:text-white">Terms and Conditions</a>
                <span>|</span>
                <a href="#" class="hover:text-white">24X7 Support</a>
            </div>
            <div>&copy; 2026 SONIEXCHANGE. All Rights Reserved. Powered by TULA111.</div>
        </footer>
    </body>
    </html>
    `;
}

module.exports = { renderMatchDetailPage };
