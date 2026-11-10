// clientViews/matchDetailView.js

function renderMatchDetailPage(user, matchData) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0).toLocaleString();
    const exposure = Number(user.exposure || 0).toLocaleString();

    const teamA = matchData ? matchData.teamA : 'Pakistan';
    const teamB = matchData ? matchData.teamB : 'Sri Lanka';

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
            body { background-color: #121e2b; color: #f8fafc; font-family: sans-serif; }
            .bg-custom-navy { background-color: #16202c; }
            .bg-custom-header { background-color: #0b1118; }
            .bg-teal-bar { background-color: #0e5c75; }
            .odds-back { background-color: #72bbef; color: #000; }
            .odds-lay { background-color: #faa9ba; color: #000; }
            .fancy-no { background-color: #faa9ba; color: #000; }
            .fancy-yes { background-color: #72bbef; color: #000; }
            /* Suspended Market Styling */
            .market-suspended { background-color: #2a2e33 !important; color: #71767a !important; position: relative; cursor: not-allowed; }
            .market-suspended::after { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background-color: #ef4444; }
        </style>
    </head>
    <body class="min-h-screen flex flex-col text-xs">
        
        <!-- TOP HEADER BAR -->
        <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2 flex items-center justify-between sticky top-0 z-50">
            <div class="flex items-center space-x-3">
                <a href="/home?user=${encodeURIComponent(username)}" class="text-white text-base focus:outline-none"><i class="fa-solid fa-arrow-left"></i></a>
                <h1 class="text-base font-black tracking-wider italic text-[#00c0FF]">SONIEXCHANGE</h1>
            </div>
            
            <div class="flex items-center space-x-3 text-[11px]">
                <div class="text-right">
                    <div class="text-gray-300">Balance: <span class="font-bold text-green-400">${balance}</span></div>
                    <div class="text-gray-400">Exp: <span class="font-bold text-red-400">${exposure}</span></div>
                </div>
                <div class="bg-[#1f2937] px-2.5 py-1 rounded border border-gray-700 font-bold text-white flex items-center space-x-1">
                    <i class="fa-solid fa-user text-[#00c0FF]"></i>
                    <span>${username}</span>
                </div>
            </div>
        </header>

        <!-- MATCH SCORE & INFO BANNER (Enhanced with Ball Tracker) -->
        <div class="bg-teal-bar px-3 py-2 text-white">
            <div class="flex justify-between items-center text-[11px] border-b border-white/10 pb-1 mb-1.5 font-semibold">
                <span><i class="fa-solid fa-circle text-[7px] text-green-400 animate-pulse mr-1"></i> ${teamA} V ${teamB}</span>
                <span class="text-[10px] text-gray-200">09/11/2026 10:00:00</span>
            </div>
            <div class="text-[10px] text-gray-200 mb-1">LIVE Test • Rawalpindi Cricket Stadium, Pakistan</div>
            
            <div class="bg-black/40 rounded p-2 flex justify-between items-center text-xs mb-2">
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${teamA}</span>
                    <span class="text-sm font-black text-white">434/9 <span class="text-[10px] text-gray-300 font-normal">d</span></span>
                    <span class="text-[10px] text-gray-400">(106.3)</span>
                </div>
                <div class="text-center bg-white/10 px-2 py-0.5 rounded text-[10px]">
                    <div>Day 2 | SL trail by 371</div>
                    <div class="text-yellow-400 font-bold">35.5 ovr</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-black text-white">63/2</span>
                    <span class="text-[10px] text-gray-400">(15.4)</span>
                    <span class="font-bold">SL</span>
                </div>
            </div>

            <!-- Detailed Over Ball Trackers (As seen in screenshot) -->
            <div class="flex items-center space-x-1.5 overflow-x-auto text-[10px] pb-1 whitespace-nowrap scrollbar-none">
                <span class="bg-black/40 px-2 py-0.5 rounded text-gray-300">Ov 13 (4)</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">1</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
                <span class="bg-black/40 px-2 py-0.5 rounded text-gray-300 ml-2">Ov 14 (0)</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-[#1f2937] w-5 h-5 rounded-full flex items-center justify-center font-bold text-white border border-gray-600">0</span>
                <span class="bg-black/40 px-2 py-0.5 rounded text-gray-300 ml-2">Ov 15 (12)</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
                <span class="bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">4</span>
            </div>
        </div>

        <!-- TABS BAR -->
        <div class="bg-[#16202c] border-b border-[#2b394a] flex text-center font-bold text-xs">
            <div class="flex-1 py-2 border-b-2 border-[#00c0FF] text-[#00c0FF]">ODDS</div>
            <div class="flex-1 py-2 text-gray-400 hover:text-white cursor-pointer">MATCHED BET (0)</div>
        </div>

        <!-- MAIN CONTENT MARKETS -->
        <main class="flex-1 p-2 space-y-3 max-w-7xl mx-auto w-full">
            
            <!-- 1. MATCH ODDS -->
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-1.5 font-bold text-white flex justify-between items-center text-xs border-b border-[#2b394a]">
                    <span>MATCH_ODDS</span>
                    <span class="text-[10px] text-gray-400">Min: 100 Max: 50K</span>
                </div>
                <div class="grid grid-cols-12 bg-[#0b1118] text-gray-400 text-[10px] py-1 px-2 border-b border-[#2b394a]">
                    <div class="col-span-6"></div>
                    <div class="col-span-3 text-center text-[#72bbef] font-bold">Back</div>
                    <div class="col-span-3 text-center text-[#faa9ba] font-bold">Lay</div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 border-b border-[#2b394a] hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">${teamA}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">5</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">5.2</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">5.3</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">5.4</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">5.5</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">5.6</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 border-b border-[#2b394a] hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">${teamB}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">9.2</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">9.4</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">9.8</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">11</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">11.5</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">12</span></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 items-center p-2 hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">The Draw</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">1.37</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">1.38</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">1.39</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">1.4</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">1.41</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">1.42</span></div>
                    </div>
                </div>
            </div>

            <!-- 2. BOOKMAKER -->
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-1.5 font-bold text-white text-xs border-b border-[#2b394a]">
                    Bookmaker
                </div>
                <div class="grid grid-cols-12 bg-[#0b1118] text-gray-400 text-[10px] py-1 px-2 border-b border-[#2b394a]">
                    <div class="col-span-6">Min: 100 Max: 50K</div>
                    <div class="col-span-3 text-center text-[#72bbef] font-bold">Back</div>
                    <div class="col-span-3 text-center text-[#faa9ba] font-bold">Lay</div>
                </div>
                <div class="grid grid-cols-12 items-center p-2 hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">${teamA}</div>
                    <div class="col-span-3 grid grid-cols-2 gap-1 text-center">
                        <div class="odds-back rounded py-1 font-bold text-xs">--</div>
                        <div class="odds-back rounded py-1 font-bold text-xs">--</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-2 gap-1 text-center pl-1">
                        <div class="market-suspended rounded py-1 font-bold text-xs">--</div>
                        <div class="market-suspended rounded py-1 font-bold text-xs">--</div>
                    </div>
                </div>
            </div>

            <!-- 3. NORMAL SECTION (With Suspended State Support) -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Normal</div>
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">20 over run SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 100K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">16 over run SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">1st innings run SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>333</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>337</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">1st innings run 3rd wkt SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center"><div>326</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center"><div>329</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">1st innings run 1st wkt SL 2</div><div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">2nd wkt SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>

            </div>

            <!-- 4. OVER BY OVER -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Over By Over</div>
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">Only 17 over run SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                        <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                    </div>
                </div>
            </div>

            <!-- 5. FANCY1 -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Fancy1</div>
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">3rd Wkt Caught out SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold">--</button><button class="odds-lay px-3 py-1 rounded font-bold">--</button></div>
                </div>
            </div>

            <!-- 6. ODD-EVEN -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Odd-Even</div>
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">1st Inn 20 over run odd even SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 1L</div></div>
                    <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold">1.96</button><button class="market-suspended px-3 py-1 rounded font-bold">1.96</button></div>
                </div>
            </div>

            <!-- 7. METER -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Meter</div>
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div><div class="font-bold text-white">3rd wkt meter SL</div><div class="text-[10px] text-gray-400">Min: 100 Max: 10K</div></div>
                    <div class="flex space-x-1">
                        <button class="market-suspended px-3 py-1 rounded font-bold">112</button>
                        <button class="market-suspended px-3 py-1 rounded font-bold">115</button>
                    </div>
                </div>
            </div>

        </main>

        <footer class="bg-[#0b1118] border-t border-[#2b394a] p-4 text-center text-gray-400 text-[10px] space-y-2 mt-4">
            <div class="flex justify-center space-x-4 font-bold text-gray-300 text-xs">
                <a href="#" class="hover:text-white">Terms and Conditions</a>
                <span>|</span>
                <a href="#" class="hover:text-white">24X7 Support</a>
            </div>
            <div class="flex justify-center items-center space-x-2 py-1">
                <span class="bg-green-800 text-green-200 px-2 py-0.5 rounded font-bold text-[9px]">100% SAFE</span>
                <span class="text-gray-400">Protected connection and encrypted data.</span>
            </div>
            <div>&copy; 2026 SONIEXCHANGE. All Rights Reserved. Powered by TULA111.</div>
        </footer>
    </body>
    </html>
    `;
}

module.exports = { renderMatchDetailPage };
