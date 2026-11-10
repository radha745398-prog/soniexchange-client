// clientViews/matchDetailView.js

function renderMatchDetailPage(user, matchData) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0);
    const exposure = Number(user.exposure || 0);

    const teamA = matchData ? matchData.teamA : 'Pakistan';
    const teamB = matchData ? matchData.teamB : 'Sri Lanka';
    const matchId = matchData ? matchData.id : '556727281';

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

        <!-- MATCH SCORE & INFO BANNER -->
        <div class="bg-teal-bar px-3 py-2 text-white">
            <div class="flex justify-between items-center text-[11px] border-b border-white/10 pb-1 mb-1.5 font-semibold">
                <span><i class="fa-solid fa-circle text-[7px] text-green-400 animate-pulse mr-1"></i> <span id="team-a-name">${teamA}</span> V <span id="team-b-name">${teamB}</span></span>
                <span class="text-[10px] text-gray-200">09/11/2026 10:00:00</span>
            </div>
            <div class="text-[10px] text-gray-200 mb-1">LIVE Test • Rawalpindi Cricket Stadium, Pakistan</div>
            
            <div class="bg-black/30 rounded p-2 flex justify-between items-center text-xs mb-2 text-white">
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${teamA}</span>
                    <span class="text-sm font-black text-white" id="score-a">434/9 <span class="text-[10px] text-gray-200 font-normal">d</span></span>
                    <span class="text-[10px] text-gray-300">(106.3)</span>
                </div>
                <div class="text-center bg-white/10 px-2 py-0.5 rounded text-[10px]">
                    <div>Day 2 | SL trail by 371</div>
                    <div class="text-yellow-300 font-bold">35.5 ovr</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-black text-white" id="score-b">63/2</span>
                    <span class="text-[10px] text-gray-300">(15.4)</span>
                    <span class="font-bold">SL</span>
                </div>
            </div>

            <!-- Over Ball Trackers -->
            <div class="flex items-center space-x-1.5 overflow-x-auto text-[10px] pb-1 whitespace-nowrap text-white">
                <span class="bg-black/30 px-2 py-0.5 rounded text-gray-200">Ov 13 (4)</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">1</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
                <span class="bg-black/30 px-2 py-0.5 rounded text-gray-200 ml-2">Ov 14 (0)</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-black/30 px-2 py-0.5 rounded text-gray-200 ml-2">Ov 15 (12)</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
            </div>
        </div>

        <!-- TABS BAR -->
        <div class="bg-[#f1f5f9] border-b border-gray-200 flex text-center font-bold text-xs">
            <div class="flex-1 py-2 border-b-2 border-[#00c0FF] text-[#00c0FF]">ODDS</div>
            <div class="flex-1 py-2 text-gray-500 hover:text-black cursor-pointer">MATCHED BET (<span id="matched-bet-count">0</span>)</div>
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
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamA} (Back)', 5)"><span class="font-bold text-xs text-black">5</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamA} (Back)', 5.2)"><span class="font-bold text-xs text-black">5.2</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" id="odds-ta-back" onclick="placeInstantBet('${teamA} (Back)', 5.3)">5.3</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" id="odds-ta-lay" onclick="placeInstantBet('${teamA} (Lay)', 5.4)">5.4</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamA} (Lay)', 5.5)"><span class="font-bold text-xs text-black">5.5</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamA} (Lay)', 5.6)"><span class="font-bold text-xs text-black">5.6</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">${teamB}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamB} (Back)', 9.2)"><span class="font-bold text-xs text-black">9.2</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamB} (Back)', 9.4)"><span class="font-bold text-xs text-black">9.4</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="placeInstantBet('${teamB} (Back)', 9.8)">9.8</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" onclick="placeInstantBet('${teamB} (Lay)', 11)">11</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamB} (Lay)', 11.5)"><span class="font-bold text-xs text-black">11.5</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('${teamB} (Lay)', 12)"><span class="font-bold text-xs text-black">12</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 hover:bg-gray-100 transition">
                    <div class="col-span-6 font-bold text-gray-900 text-xs">The Draw</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('The Draw (Back)', 1.37)"><span class="font-bold text-xs text-black">1.37</span></div>
                        <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('The Draw (Back)', 1.38)"><span class="font-bold text-xs text-black">1.38</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="placeInstantBet('The Draw (Back)', 1.39)">1.39</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs" onclick="placeInstantBet('The Draw (Lay)', 1.4)">1.4</div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('The Draw (Lay)', 1.41)"><span class="font-bold text-xs text-black">1.41</span></div>
                        <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="placeInstantBet('The Draw (Lay)', 1.42)"><span class="font-bold text-xs text-black">1.42</span></div>
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
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="placeInstantBet('${teamA} BM (Back)', 100)">--</div>
                        <div class="odds-back rounded py-1 font-bold text-xs" onclick="placeInstantBet('${teamA} BM (Back)', 100)">--</div>
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
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('16 over run SL (No)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('16 over run SL (Yes)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
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
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('1st innings run 3rd wkt SL (No)', 326)"><div>326</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('1st innings run 3rd wkt SL (Yes)', 329)"><div>329</div><div class="text-[9px] font-normal">100</div></button>
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
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('2nd wkt SL (No)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('2nd wkt SL (Yes)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd wkt inwr SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('3rd wkt inwr SL (No)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('3rd wkt inwr SL (Yes)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">L Udara 1st innings</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('L Udara 1st innings (No)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('L Udara 1st innings (Yes)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Kusal Mendis runs</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Kusal Mendis runs (No)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Kusal Mendis runs (Yes)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">Kaminen Mendis boundaries</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Kaminen Mendis boundaries (No)', 4)"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Kaminen Mendis boundaries (Yes)', 5)"><div>5</div><div class="text-[9px] font-normal">250K</div></button>
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
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Only 18 over run SL (No)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="placeInstantBet('Only 18 over run SL (Yes)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
                    </div>
                </div>
            </div>

            <!-- 5. FANCY1 -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Fancy1</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd Wkt Caught out SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="placeInstantBet('3rd Wkt Caught out SL (Back)', 1.35)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="placeInstantBet('3rd Wkt Caught out SL (Lay)', 1.55)">--</button></div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">3rd wkt out L. Udara</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="placeInstantBet('3rd wkt out L. Udara (Back)', 1.75)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="placeInstantBet('3rd wkt out L. Udara (Lay)', 2.05)">--</button></div>
                </div>
            </div>

            <!-- 6. ODD-EVEN -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Odd-Even</div>
            <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st Inn 20 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="placeInstantBet('1st Inn 20 over run odd even SL (Odd)', 1.96)">1.96</button><button class="market-suspended px-3 py-1 rounded font-bold">1.96</button></div>
                </div>
                <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
                    <div><div class="font-bold text-gray-900">1st Inn 30 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="placeInstantBet('1st Inn 30 over run odd even SL (Odd)', 1.96)">1.96</button><button class="odds-back px-3 py-1 rounded font-bold" onclick="placeInstantBet('1st Inn 30 over run odd even SL (Even)', 1.96)">1.96</button></div>
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
                        <button class="fancy-no px-3 py-1 rounded font-bold" onclick="placeInstantBet('L Udara meter (No)', 83)">83</button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold" onclick="placeInstantBet('L Udara meter (Yes)', 86)">86</button>
                    </div>
                </div>
            </div>

            <!-- 8. 2ND INN OVERS (20, 30, 40, 50) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 20 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 20 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 20 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 20 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 30 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 30 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 30 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 30 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 40 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 40 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 40 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 40 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>

                <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
                    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs">2ND INN 50 OVER PAK VS SL</div>
                    <div class="bg-[#f1f5f9] px-2 py-1 text-[10px] text-gray-600 flex justify-between border-b border-gray-200"><span>Min: 100 Max: 1L</span><span class="text-[#0369a1] font-bold">Back</span></div>
                    <div class="p-2 space-y-1">
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">0 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 50 Ov - 0 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">1 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 50 Ov - 1 Number', 9.5)">9.5</button></div>
                        <div class="flex justify-between items-center bg-white px-2 py-1 rounded text-xs border border-gray-200"><span class="text-gray-900 font-semibold">2 Number</span><button class="odds-back px-3 py-0.5 rounded font-bold" onclick="placeInstantBet('2nd Inn 50 Ov - 2 Number', 9.5)">9.5</button></div>
                    </div>
                </div>
            </div>

        </main>

        <!-- INSTANT 1-CLICK BETTING (NO POPUP, NO ALERT) -->
        <script>
            let userBalance = ${balance};
            let userExposure = ${exposure};
            let betCount = 0;
            const defaultStake = 1000; // Default stake per click

            function placeInstantBet(title, odds) {
                if (userBalance < defaultStake) {
                    console.warn('Insufficient balance / points!');
                    return;
                }

                // Deduct points instantly on client screen
                userBalance -= defaultStake;
                userExposure += defaultStake;
                betCount += 1;

                document.getElementById('user-balance').innerText = userBalance.toLocaleString();
                document.getElementById('user-exposure').innerText = userExposure.toLocaleString();
                document.getElementById('matched-bet-count').innerText = betCount;

                const betData = {
                    title: title,
                    odds: parseFloat(odds),
                    stake: defaultStake,
                    username: '${username}',
                    matchId: '${matchId}'
                };

                // Silently sync with backend / admin panel
                fetch('/api/place-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(betData)
                }).catch(err => {
                    console.error('Admin sync error:', err);
                });
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
