
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

        <!-- MATCH SCORE & INFO BANNER -->
        <div class="bg-teal-bar px-3 py-2 text-white">
            <div class="flex justify-between items-center text-[11px] border-b border-white/10 pb-1 mb-1.5 font-semibold">
                <span><i class="fa-solid fa-circle text-[7px] text-green-400 animate-pulse mr-1"></i> ${teamA} V ${teamB}</span>
                <span class="text-[10px] text-gray-200">09/11/2026 10:00:00</span>
            </div>
            <div class="text-[10px] text-gray-200 mb-1">LIVE Test • Rawalpindi Cricket Stadium, Pakistan</div>
            
            <!-- Scoreboard Box -->
            <div class="bg-black/40 rounded p-2 flex justify-between items-center text-xs">
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${teamA}</span>
                    <span class="text-sm font-black text-white">434/9 <span class="text-[10px] text-gray-300 font-normal">d</span></span>
                    <span class="text-[10px] text-gray-400">(106.3)</span>
                </div>
                <div class="text-center bg-white/10 px-2 py-0.5 rounded text-[10px]">
                    <div>Day 2</div>
                    <div class="text-yellow-400 font-bold">38.6 ovr</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-black text-white">42/2</span>
                    <span class="text-[10px] text-gray-400">(12.0)</span>
                    <span class="font-bold">${teamB}</span>
                </div>
            </div>
        </div>

        <!-- TABS BAR -->
        <div class="bg-[#16202c] border-b border-[#2b394a] flex text-center font-bold text-xs">
            <div class="flex-1 py-2 border-b-2 border-[#00c0FF] text-[#00c0FF]">ODDS</div>
            <div class="flex-1 py-2 text-gray-400 hover:text-white cursor-pointer">MATCHED BET (0)</div>
        </div>

        <!-- MAIN CONTENT MARKETS -->
        <main class="flex-1 p-2 space-y-3 max-w-7xl mx-auto w-full">
            
            <!-- MATCH ODDS TABLE -->
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

                <!-- Team 1 Row -->
                <div class="grid grid-cols-12 items-center p-2 border-b border-[#2b394a] hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">${teamA}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">3.5</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">3.55</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">3.6</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">3.65</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">3.7</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">3.75</span></div>
                    </div>
                </div>

                <!-- Team 2 Row -->
                <div class="grid grid-cols-12 items-center p-2 border-b border-[#2b394a] hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">${teamB}</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">13.5</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">14</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">14.5</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">15.5</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">16</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">16.5</span></div>
                    </div>
                </div>

                <!-- The Draw Row -->
                <div class="grid grid-cols-12 items-center p-2 hover:bg-[#1f2937] transition">
                    <div class="col-span-6 font-bold text-white text-xs">The Draw</div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">1.49</span></div>
                        <div class="bg-[#72bbef]/20 rounded py-1"><span class="font-bold text-xs">1.5</span></div>
                        <div class="odds-back rounded py-1 font-bold text-xs">1.51</div>
                    </div>
                    <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                        <div class="odds-lay rounded py-1 font-bold text-xs">1.52</div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">1.53</span></div>
                        <div class="bg-[#faa9ba]/20 rounded py-1"><span class="font-bold text-xs">1.54</span></div>
                    </div>
                </div>
            </div>

            <!-- BOOKMAKER SECTION -->
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-1.5 font-bold text-white text-xs border-b border-[#2b394a]">
                    Bookmaker
                </div>
                <div class="grid grid-cols-12 bg-[#0b1118] text-gray-400 text-[10px] py-1 px-2 border-b border-[#2b394a]">
                    <div class="col-span-6">Min: 100 Max: 25K</div>
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
                        <div class="odds-lay rounded py-1 font-bold text-xs">--</div>
                        <div class="odds-lay rounded py-1 font-bold text-xs">--</div>
                    </div>
                </div>
            </div>

            <!-- NORMAL / FANCY MARKETS SECTION -->
            <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">
                Normal / Fancy Markets
            </div>

            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div>
                        <div class="font-bold text-white">15 Over Run SL</div>
                        <div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div>
                    </div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center">
                            <div>52</div>
                            <div class="text-[9px] font-normal">100</div>
                        </button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center">
                            <div>54</div>
                            <div class="text-[9px] font-normal">100</div>
                        </button>
                    </div>
                </div>

                <div class="bg-[#0b1118] p-2 rounded border border-[#2b394a] flex justify-between items-center">
                    <div>
                        <div class="font-bold text-white">1st Innings Run SL</div>
                        <div class="text-[10px] text-gray-400">Min: 100 Max: 25K</div>
                    </div>
                    <div class="flex space-x-1">
                        <button class="fancy-no px-3 py-1 rounded font-bold text-center">
                            <div>308</div>
                            <div class="text-[9px] font-normal">100</div>
                        </button>
                        <button class="fancy-yes px-3 py-1 rounded font-bold text-center">
                            <div>312</div>
                            <div class="text-[9px] font-normal">100</div>
                        </button>
                    </div>
                </div>
            </div>

        </main>

        <footer class="bg-[#0b1118] border-t border-[#2b394a] p-3 text-center text-gray-500 text-[10px]">
            &copy; 2026 SONIEXCHANGE. All Rights Reserved.
        </footer>
    </body>
    </html>
    `;
}

module.exports = { renderMatchDetailPage };
