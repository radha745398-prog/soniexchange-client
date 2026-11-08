// clientViews/dashboardView.js

function renderDashboardPage(user, liveMatches) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0).toLocaleString();
    const exposure = Number(user.exposure || 0).toLocaleString();

    const matchesHTML = liveMatches.map(m => `
        <tr class="border-b border-[#2b394a] text-xs hover:bg-[#1f2937] transition cursor-pointer" onclick="window.location.href='/match/${m.id}?user=${encodeURIComponent(username)}'">
            <td class="p-2.5 text-white font-semibold flex items-center justify-between">
                <div>
                    <span class="text-[#00c0FF] text-[11px] font-bold block">${m.tournament}</span>
                    <span class="text-sm">${m.teamA} <span class="text-gray-400 font-normal">v</span> ${m.teamB}</span>
                    <span class="text-[10px] text-gray-400 block">${m.dateTime}</span>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    <span class="text-[10px] text-green-400 uppercase font-bold">In Play</span>
                </div>
            </td>
            <!-- Back & Lay Odds Columns for 1, X, 2 -->
            <td class="p-1 text-center border-l border-[#2b394a] bg-[#72bbef]/10">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.teamA_back}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/10 border-r border-[#2b394a]">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.teamA_lay}</span>
            </td>
            <td class="p-1 text-center bg-[#72bbef]/10">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.draw_back || '-'}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/10 border-r border-[#2b394a]">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.draw_lay || '-'}</span>
            </td>
            <td class="p-1 text-center bg-[#72bbef]/10">
                <span class="block bg-[#72bbef] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.teamB_back}</span>
            </td>
            <td class="p-1 text-center bg-[#faa9ba]/10">
                <span class="block bg-[#faa9ba] text-black font-bold py-1 px-2 rounded text-[11px]">${m.odds.teamB_lay}</span>
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
            body { background-color: #0f172a; color: #f8fafc; font-family: sans-serif; }
            .bg-custom-navy { background-color: #16202c; }
            .bg-custom-header { background-color: #0b1118; }
            .active-tab { border-bottom: 2px solid #00c0FF; color: #00c0FF; }
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

        <!-- TOP MATCH TICKER BAR -->
        <div class="bg-[#111827] border-b border-[#2b394a] py-1.5 px-3 flex space-x-4 overflow-x-auto text-[11px] text-gray-300 whitespace-nowrap">
            <a href="#" class="bg-[#1f2937] px-2.5 py-1 rounded border border-[#00c0FF]/40 text-[#00c0FF] font-semibold">New Zealand v India</a>
            <a href="#" class="bg-[#1f2937] px-2.5 py-1 rounded border border-gray-700 hover:text-white">Bangladesh v West Indies</a>
        </div>

        <!-- MAIN NAVIGATION BAR (As per Screenshot top bar) -->
        <nav class="bg-custom-navy border-b border-[#2b394a] px-2 flex space-x-6 text-[11px] font-bold uppercase tracking-wider overflow-x-auto">
            <a href="#" class="py-2.5 active-tab">Sports</a>
        </nav>

        <!-- SPORTS SUB-NAVIGATION BAR (Exact Screenshot Sports List) -->
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

        <!-- MAIN MATCH LIST TABLE -->
        <main class="flex-1 p-2 space-y-4 max-w-7xl mx-auto w-full">
            <div class="bg-custom-navy border border-[#2b394a] rounded overflow-hidden">
                <div class="bg-[#1f2937] px-3 py-2 font-bold text-white flex justify-between items-center text-xs">
                    <span>LIVE CRICKET MATCHES</span>
                    <span class="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded uppercase font-bold">In-Play</span>
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
        </main>

        <footer class="bg-[#0b1118] border-t border-[#2b394a] p-3 text-center text-gray-500 text-[10px]">
            &copy; 2026 SONIEXCHANGE. All Rights Reserved.
        </footer>
    </body>
    </html>
    `;
}

module.exports = { renderDashboardPage };
