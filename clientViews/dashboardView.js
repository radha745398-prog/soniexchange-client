// clientViews/dashboardView.js

function renderDashboardPage(user, liveMatches) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0).toLocaleString();
    const exposure = Number(user.exposure || 0).toLocaleString();

    // Ticker matches jo usi ek patli line mein fit rahenge
    const tickerMatches = [
        { id: 'match-1', teamA: 'Bangladesh', teamB: 'West Indies' },
        { id: 'match-2', teamA: 'Afghanistan', teamB: 'Zimbabwe' }
    ];

    const tickerHTML = tickerMatches.map(m => `
        <a href="/match/${m.id}?user=${encodeURIComponent(username)}" class="flex items-center space-x-1.5 bg-[#1f2937]/80 px-3 py-1 rounded border border-[#00c0FF]/30 text-[#00c0FF] font-semibold hover:border-white transition whitespace-nowrap match-blink text-[11px]">
            <span>${m.teamA} v ${m.teamB}</span>
        </a>
    `).join('');

    const activeMatches = [
        { id: 'match-1', tournament: 'Test Match', teamA: 'Bangladesh', teamB: 'West Indies', date: '09/11/2026 10:00:00', odds: { aBack: '2.10', aLay: '2.15', drawBack: '3.20', drawLay: '3.30', bBack: '2.40', bLay: '2.48' } },
        { id: 'match-2', tournament: 'Test Match', teamA: 'Afghanistan', teamB: 'Zimbabwe', date: '09/11/2026 11:30:00', odds: { aBack: '1.85', aLay: '1.90', drawBack: '3.50', drawLay: '3.60', bBack: '2.05', bLay: '2.12' } }
    ];

    const matchesHTML = activeMatches.map(m => `
        <tr class="border-b border-[#2b394a] text-xs hover:bg-[#1f2937] transition cursor-pointer" onclick="window.location.href='/match/${m.id}?user=${encodeURIComponent(username)}'">
            <td class="p-2.5 text-white font-semibold">
                <span class="text-[#00c0FF] text-[10px] font-bold block">${m.tournament}</span>
                <span class="text-xs sm:text-sm text-white font-bold">${m.teamA} <span class="text-gray-400 font-normal">v</span> ${m.teamB}</span>
                <span class="text-[10px] text-gray-400 block">${m.date}</span>
            </td>
            <td class="p-1.5 text-center border-l border-[#2b394a] bg-[#72bbef]/20">
                <span class="inline-block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.aBack}</span>
            </td>
            <td class="p-1.5 text-center bg-[#faa9ba]/20 border-r border-[#2b394a]">
                <span class="inline-block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.aLay}</span>
            </td>
            <td class="p-1.5 text-center bg-[#72bbef]/20">
                <span class="inline-block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.drawBack}</span>
            </td>
            <td class="p-1.5 text-center bg-[#faa9ba]/20 border-r border-[#2b394a]">
                <span class="inline-block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.drawLay}</span>
            </td>
            <td class="p-1.5 text-center bg-[#72bbef]/20">
                <span class="inline-block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.bBack}</span>
            </td>
            <td class="p-1.5 text-center bg-[#faa9ba]/20">
                <span class="inline-block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.bLay}</span>
            </td>
        </tr>
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
            /* Panel ka halka blue background */
            body { background-color: #121e2b; color: #f8fafc; font-family: sans-serif; }
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

        <!-- TOP MATCH TICKER BAR (Ek hi line mein dono match fit aur blink karte hue) -->
        <div class="bg-[#111827] border-b border-[#2b394a] py-1.5 px-3 flex items-center space-x-3 overflow-x-auto whitespace-nowrap">
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
        <main class="flex-1 p-3 max-w-7xl mx-auto w-full">
            <div class="bg-custom-navy border border-[#2b394a] rounded shadow-lg overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-2.5 font-bold text-white flex justify-between items-center text-xs">
                    <span>LIVE CRICKET MATCHES</span>
                    <span class="text-[10px] bg-red-600 text-white px-2.5 py-1 rounded uppercase font-bold animate-pulse">In-Play</span>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-[#0b1118] text-gray-400 text-[10px] uppercase border-b border-[#2b394a]">
                                <th class="p-2.5 border-r border-[#2b394a]">Match</th>
                                <th colspan="2" class="p-2.5 text-center border-r border-[#2b394a]">1</th>
                                <th colspan="2" class="p-2.5 text-center border-r border-[#2b394a]">X</th>
                                <th colspan="2" class="p-2.5 text-center">2</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matchesHTML}
                        </tbody>
                    </table>
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

module.exports = { renderDashboardPage };
