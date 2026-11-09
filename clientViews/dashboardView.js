// clientViews/dashboardView.js

function renderDashboardPage(user, liveMatches) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0).toLocaleString();
    const exposure = Number(user.exposure || 0).toLocaleString();

    // Ticker matches with blinking effect as requested
    const tickerMatches = [
        { id: 'match-1', teamA: 'Bangladesh', teamB: 'West Indies' },
        { id: 'match-2', teamA: 'Afghanistan', teamB: 'Zimbabwe' }
    ];

    const tickerHTML = tickerMatches.map(m => `
        <a href="/match/${m.id}?user=${encodeURIComponent(username)}" class="bg-[#1f2937] px-3 py-1 rounded border border-[#00c0FF]/40 text-[#00c0FF] font-semibold hover:border-white transition whitespace-nowrap match-blink inline-block mr-3">
            ${m.teamA} v ${m.teamB}
        </a>
    `).join('');

    // Matches table matching exact screenshot layout
    const sampleMatches = [
        { tournament: 'Super Over2', teamA: 'Delhi Capitals (e)', teamB: 'Chennai Super Kings (e)', date: '08/11/2026 14:30:00', odds: { aBack: '1.05', aLay: '1.08', drawBack: '-', drawLay: '-', bBack: '14.0', bLay: '15.5' } },
        { tournament: 'ODI International', teamA: 'Mumbai Indians (e)', teamB: 'Delhi Capitals (e)', date: '08/11/2026 15:30:00', odds: { aBack: '1.42', aLay: '1.45', drawBack: '-', drawLay: '-', bBack: '3.10', bLay: '3.20' } },
        { tournament: 'Test Match', teamA: 'Bangladesh', teamB: 'West Indies', date: '09/11/2026 10:00:00', odds: { aBack: '2.10', aLay: '2.15', drawBack: '3.20', drawLay: '3.30', bBack: '2.40', bLay: '2.48' } }
    ];

    const matchesHTML = sampleMatches.map((m, idx) => `
        <tr class="border-b border-[#2b394a] text-xs hover:bg-[#1f2937] transition cursor-pointer">
            <td class="p-2.5 text-white font-semibold">
                <span class="text-[#00c0FF] text-[10px] font-bold block">${m.tournament}</span>
                <span class="text-xs sm:text-sm text-white">${m.teamA} <span class="text-gray-400 font-normal">v</span> ${m.teamB}</span>
                <span class="text-[10px] text-gray-400 block">${m.date}</span>
            </td>
            <td class="p-1 text-center border-l border-[#2b394a] bg-[#72bbef]/20">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.aBack}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/20 border-r border-[#2b394a]">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.aLay}</span>
            </td>
            <td class="p-1 text-center bg-[#72bbef]/20">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.drawBack}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/20 border-r border-[#2b394a]">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.drawLay}</span>
            </td>
            <td class="p-1 text-center bg-[#72bbef]/20">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.bBack}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/20">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-1.5 rounded text-[11px]">${m.odds.bLay}</span>
            </td>
        </tr>
    `).join('');

    // Casino items matching the exact screenshot grid items
    const casinoItems = [
        { name: 'GOAL 2', bg: 'bg-gradient-to-t from-black to-blue-900' },
        { name: 'MATKA MARKET', bg: 'bg-gradient-to-t from-black to-amber-900' },
        { name: 'DOLI DANA', bg: 'bg-gradient-to-t from-black to-emerald-900' },
        { name: 'MOGAMBO', bg: 'bg-gradient-to-t from-black to-yellow-900' },
        { name: 'LUCKY 6', bg: 'bg-gradient-to-t from-black to-green-900' },
        { name: 'BEACH ROULETTE', bg: 'bg-gradient-to-t from-black to-cyan-900' },
        { name: 'ROULETTE', bg: 'bg-gradient-to-t from-black to-purple-900' },
        { name: 'VIP ROULETTE', bg: 'bg-gradient-to-t from-black to-red-900' },
        { name: 'POISON TEENPATTI', bg: 'bg-gradient-to-t from-black to-gray-900' },
        { name: 'UNIQUE TEENPATTI', bg: 'bg-gradient-to-t from-black to-indigo-900' },
        { name: 'TEENPATTI 20-20', bg: 'bg-gradient-to-t from-black to-emerald-950' },
        { name: 'UNLIMITED JOKER', bg: 'bg-gradient-to-t from-black to-teal-900' },
        { name: 'SIC BO', bg: 'bg-gradient-to-t from-black to-slate-900' },
        { name: 'ANDAR BAHAR', bg: 'bg-gradient-to-t from-black to-blue-950' },
        { name: 'LUCKY 15', bg: 'bg-gradient-to-t from-black to-orange-950' },
        { name: 'SUPER OVER', bg: 'bg-gradient-to-t from-black to-cyan-950' },
        { name: 'QUEEN TOP OPEN', bg: 'bg-gradient-to-t from-black to-amber-950' },
        { name: 'JACK TOP OPEN', bg: 'bg-gradient-to-t from-black to-yellow-950' }
    ];

    const casinoHTML = casinoItems.map(c => `
        <div class="${c.bg} border border-[#2b394a] rounded overflow-hidden shadow-md flex flex-col justify-end h-28 p-2 relative hover:border-[#00c0FF] transition cursor-pointer">
            <div class="absolute inset-0 flex items-center justify-center opacity-30 text-white font-black text-xs tracking-widest">${c.name}</div>
            <span class="relative z-10 bg-black/60 text-white font-bold text-[10px] text-center py-1 rounded border border-white/10 uppercase">${c.name}</span>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SONIEXCHANGE - Sports Exchange</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { background-color: #0f172a; color: #f8fafc; font-family: sans-serif; }
            .bg-custom-navy { background-color: #16202c; }
            .bg-custom-header { background-color: #0b1118; }
            .active-tab { border-bottom: 2px solid #00c0FF; color: #00c0FF; }
            
            /* Smooth Blinking Animation for Ticker Matches */
            @keyframes textBlink {
                0% { opacity: 1; }
                50% { opacity: 0.3; }
                100% { opacity: 1; }
            }
            .match-blink {
                animation: textBlink 1.5s infinite ease-in-out;
            }
        </style>
    </head>
    <body class="min-h-screen flex flex-col text-xs">
        
        <!-- TOP HEADER BAR -->
        <header class="bg-custom-header border-b border-[#2b394a] px-3 py-2 flex items-center justify-between sticky top-0 z-50">
            <div class="flex items-center space-x-3">
                <button type="button" class="text-white text-lg focus:outline-none"><i class="fa-solid fa-bars"></i></button>
                <h1 class="text-lg font-black tracking-wider italic text-[#00c0FF]">SONIEXCHANGE</h1>
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

        <!-- TOP MATCH TICKER BAR (Bangladesh v West Indies & Afghanistan v Zimbabwe Blinking) -->
        <div class="bg-[#111827] border-b border-[#2b394a] py-1.5 px-3 overflow-x-auto whitespace-nowrap text-[11px]">
            ${tickerHTML}
        </div>

        <!-- MAIN CATEGORY NAVIGATION BAR -->
        <nav class="bg-custom-navy border-b border-[#2b394a] px-2 flex space-x-6 text-[11px] font-bold uppercase tracking-wider overflow-x-auto whitespace-nowrap">
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Crash</a>
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Lottery</a>
            <a href="#" class="py-2.5 active-tab">Sports</a>
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Our Casino</a>
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Live Casino</a>
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Slots</a>
            <a href="#" class="py-2.5 text-gray-400 hover:text-white">Fantasy</a>
        </nav>

        <!-- SPORTS SUB-NAVIGATION BAR -->
        <div class="bg-[#111827] px-3 py-2 flex space-x-6 text-[10px] font-bold overflow-x-auto border-b border-[#2b394a] whitespace-nowrap">
            <a href="#" class="flex flex-col items-center text-[#00c0FF]">
                <i class="fa-solid fa-baseball-bat-ball text-sm mb-0.5"></i> <span>CRICKET</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-futbol text-sm mb-0.5"></i> <span>FOOTBALL</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-table-tennis-paddle-ball text-sm mb-0.5"></i> <span>TENNIS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-table-tennis text-sm mb-0.5"></i> <span>TABLE TENNIS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-horse-head text-sm mb-0.5"></i> <span>HORSE RACING</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-dog text-sm mb-0.5"></i> <span>GREYHOUND RACING</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-basketball text-sm mb-0.5"></i> <span>BASKETBALL</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-child-reaching text-sm mb-0.5"></i> <span>WRESTLING</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-volleyball text-sm mb-0.5"></i> <span>VOLLEYBALL</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-400 hover:text-white">
                <i class="fa-solid fa-circle text-sm mb-0.5"></i> <span>SNOOKER</span>
            </a>
        </div>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 p-2 space-y-4 max-w-7xl mx-auto w-full">
            
            <!-- LIVE MATCHES TABLE -->
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-2 font-bold text-white flex justify-between items-center text-xs">
                    <span>LIVE CRICKET MATCHES</span>
                    <span class="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded uppercase font-bold animate-pulse">In-Play</span>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-[#0b1118] text-gray-400 text-[10px] uppercase border-b border-[#2b394a]">
                                <th class="p-2 border-r border-[#2b394a]">Match</th>
                                <th colspan="2" class="p-2 text-center border-r border-[#2b394a]">1</th>
                                <th colspan="2" class="p-2 text-center border-r border-[#2b394a]">X</th>
                                <th colspan="2" class="p-2 text-center">2</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matchesHTML}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- CASINO GRIDS SECTION -->
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                ${casinoHTML}
            </div>

        </main>

        <footer class="bg-[#0b1118] border-t border-[#2b394a] p-3 text-center text-gray-500 text-[10px]">
            &copy; 2026 SONIEXCHANGE. All Rights Reserved.
        </footer>
    </body>
    </html>
    `;
}

module.exports = { renderDashboardPage };
