// clientViews/dashboardView.js

function renderDashboardPage(user, liveMatches = [], upcomingMatches = []) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0).toLocaleString();
    const exposure = Number(user.exposure || 0).toLocaleString();

    let tickerHTML = '';
    let liveMatchesHTML = '';
    let upcomingMatchesHTML = '';

    if (Array.isArray(liveMatches) && liveMatches.length > 0) {
        // 1. Ticker HTML for all live matches
        tickerHTML = liveMatches.map(m => `
            <a href="/match/${encodeURIComponent(m.id)}?user=${encodeURIComponent(username)}" class="bg-[#1f2937] px-4 py-1.5 rounded border border-[#00c0FF]/40 text-[#00c0FF] font-bold hover:border-white transition whitespace-nowrap match-blink inline-block mr-3 text-xs">
                <span>${m.teamA} v ${m.teamB}</span>
            </a>
        `).join('');

        // 2. Main Live Matches Cards
        liveMatchesHTML = `
            <div class="w-full space-y-3">
                <h2 class="text-sm font-bold text-[#00c0FF] uppercase tracking-wider mb-2">Live Matches (${liveMatches.length})</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${liveMatches.map(m => `
                        <a href="/match/${encodeURIComponent(m.id)}?user=${encodeURIComponent(username)}" class="block bg-custom-navy p-4 rounded border border-[#2b394a] hover:border-[#00c0FF] transition">
                            <div class="flex justify-between items-center gap-2 text-[10px] text-gray-400 mb-1">
                                <span class="truncate">${m.tournament || ''}</span>
                                <span class="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/60 font-bold shrink-0">${m.formatBadge || 'MATCH'}</span>
                            </div>
                            <div class="flex justify-between items-center font-bold text-sm mb-2">
                                <span>${m.teamA} vs ${m.teamB}</span>
                                <span class="text-red-400 text-[10px] animate-pulse px-2 py-0.5 bg-red-950 rounded border border-red-800">LIVE</span>
                            </div>
                            <div class="text-[11px] text-gray-200 mb-1.5">
                                ${m.scoreSummary || ''}
                            </div>
                            <div class="text-[11px] text-gray-300 flex justify-between items-center">
                                <span>${m.dateTime || m.status || ''}</span>
                                <span class="text-[#00c0FF] underline">View Match &rarr;</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        tickerHTML = `<span class="text-gray-400 text-xs px-2">No live matches currently available.</span>`;
        liveMatchesHTML = `
            <div class="w-full text-gray-400 text-xs italic bg-[#16202c] px-6 py-4 rounded border border-[#2b394a]">
                No live matches running right now. Please check back later or check ticker when matches are live.
            </div>
        `;
    }

    // Upcoming Matches / Series Section with Live Countdown
    if (Array.isArray(upcomingMatches) && upcomingMatches.length > 0) {
        upcomingMatchesHTML = `
            <div class="w-full space-y-3 mt-6">
                <h2 class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Upcoming Matches (${upcomingMatches.length})</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${upcomingMatches.map(u => {
                        const isMatchCard = Boolean(u.teamA && u.teamB && u.id);
                        const titleText = u.title || `${u.teamA || ''} vs ${u.teamB || ''}`;
                        const countdownBadge = u.countdownTimestamp
                            ? `<span class="text-emerald-300 font-mono font-bold text-[11px] px-2 py-0.5 bg-emerald-950/70 rounded border border-emerald-700/60" data-countdown="${Number(u.countdownTimestamp)}">--:--:--</span>`
                            : `<span class="text-amber-300 text-[10px] px-2 py-0.5 bg-amber-950/60 rounded border border-amber-700/60">UPCOMING</span>`;

                        const cardInner = `
                            <div class="flex justify-between items-center gap-2 text-[10px] text-gray-400 mb-1">
                                <span class="truncate">${u.tournament || 'Upcoming'}</span>
                                <span class="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/60 font-bold shrink-0">${u.formatBadge || 'MATCH'}</span>
                            </div>
                            <div class="flex justify-between items-center font-bold text-sm mb-1.5 gap-2">
                                <span>${titleText}</span>
                                ${countdownBadge}
                            </div>
                            ${u.venue ? `<div class="text-[10px] text-gray-400 mb-1"><i class="fa-solid fa-location-dot mr-1 text-amber-400/80"></i>${u.venue}</div>` : ''}
                            <div class="text-[11px] text-gray-300 flex justify-between items-center">
                                <span>${u.dateTime || ''}</span>
                                ${isMatchCard ? `<span class="text-amber-400 underline">View &rarr;</span>` : ''}
                            </div>
                        `;

                        if (isMatchCard) {
                            return `<a href="/match/${encodeURIComponent(u.id)}?user=${encodeURIComponent(username)}" class="block bg-custom-navy p-4 rounded border border-[#2b394a] hover:border-amber-400 transition">${cardInner}</a>`;
                        }
                        return `<div class="bg-custom-navy p-4 rounded border border-[#2b394a]">${cardInner}</div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

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
            body { background-color: #121e2b; color: #f8fafc; font-family: sans-serif; }
            .bg-custom-navy { background-color: #16202c; }
            .bg-custom-header { background-color: #0b1118; }
            .active-tab { border-bottom: 2px solid #00c0FF; color: #00c0FF; }

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

        <!-- TOP MATCH TICKER BAR -->
        <div class="bg-[#111827] border-b border-[#2b394a] py-1.5 px-3 overflow-x-auto whitespace-nowrap">
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
        <div class="bg-[#0e5c75] px-3 py-2.5 flex space-x-6 text-[10px] font-bold overflow-x-auto border-b border-[#00c0FF]/40 whitespace-nowrap text-white">
            <a href="#" class="flex flex-col items-center text-white border-b-2 border-white pb-0.5">
                <i class="fa-solid fa-baseball-bat-ball text-sm mb-1"></i> <span>CRICKET</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-futbol text-sm mb-1"></i> <span>FOOTBALL</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-table-tennis-paddle-ball text-sm mb-1"></i> <span>TENNIS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-table-tennis text-sm mb-1"></i> <span>TABLE TENNIS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-horse-head text-sm mb-1"></i> <span>HORSE RACING</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-dog text-sm mb-1"></i> <span>GREYHOUND</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-basketball text-sm mb-1"></i> <span>BASKETBALL</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-user-shield text-sm mb-1"></i> <span>KABADDI</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-feather text-sm mb-1"></i> <span>BADMINTON</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-hand-fist text-sm mb-1"></i> <span>BOXING</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-flag-checkered text-sm mb-1"></i> <span>MOTOR SPORTS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-landmark text-sm mb-1"></i> <span>POLITICS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-bullseye text-sm mb-1"></i> <span>DARTS</span>
            </a>
            <a href="#" class="flex flex-col items-center text-gray-200 hover:text-white">
                <i class="fa-solid fa-circle-dot text-sm mb-1"></i> <span>E-SOCCER</span>
            </a>
        </div>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col items-start justify-start">
            ${liveMatchesHTML}
            ${upcomingMatchesHTML}
        </main>

        <footer class="bg-[#0b1118] border-t border-[#2b394a] p-3 text-center text-gray-500 text-[10px]">
            &copy; 2026 SONIEXCHANGE. All Rights Reserved.
        </footer>

        <script>
        (function () {
            function formatRemaining(ms) {
                if (!Number.isFinite(ms) || ms <= 0) return 'Starting Soon';
                const totalSec = Math.floor(ms / 1000);
                const days = Math.floor(totalSec / 86400);
                const hours = Math.floor((totalSec % 86400) / 3600);
                const mins = Math.floor((totalSec % 3600) / 60);
                const secs = totalSec % 60;

                const pad = (n) => String(n).padStart(2, '0');
                if (days > 0) {
                    return days + 'd ' + pad(hours) + ':' + pad(mins) + ':' + pad(secs);
                }
                return pad(hours) + ':' + pad(mins) + ':' + pad(secs);
            }

            function tickCountdowns() {
                const now = Date.now();
                document.querySelectorAll('[data-countdown]').forEach((el) => {
                    const target = Number(el.getAttribute('data-countdown'));
                    if (!target) {
                        el.textContent = '';
                        return;
                    }
                    el.textContent = formatRemaining(target - now);
                });
            }

            tickCountdowns();
            setInterval(tickCountdowns, 1000);
        })();
        </script>
    </body>
    </html>
    `;
}

module.exports = { renderDashboardPage };
