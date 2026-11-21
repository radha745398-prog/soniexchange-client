// clientViews/matchDetailView.js

const { renderMatchHeader } = require('./clientViews/components/matchHeader');
const { renderMatchOdds } = require('./clientViews/components/matchOdds');
const { renderBookmaker } = require('./clientViews/components/bookmaker');
const { renderNormalMarkets } = require('./clientViews/components/normalMarkets');
const { renderOverByOver } = require('./clientViews/components/overByOver');
const { renderFancyMarkets } = require('./clientViews/components/fancyMarkets');
const { renderSecondInnings } = require('./clientViews/components/secondInnings');
const { renderFooter } = require('./clientViews/components/footer');

function renderMatchDetailPage(user, matchData) {
    const username = user.username || 'Client';
    const balance = Number(user.points || 0);
    const exposure = Number(user.exposure || 0);

    const teamA = matchData ? matchData.teamA : 'Pakistan';
    const teamB = matchData ? matchData.teamB : 'Sri Lanka';
    const matchId = matchData ? matchData.id : '556727281';
    const initialOversA = matchData ? (matchData.oversA || '') : '';
    const initialOversB = matchData ? (matchData.oversB || '') : '';
    const initialScoreA = matchData ? (matchData.scoreA || '-') : '-';
    const initialOversList = matchData && Array.isArray(matchData.oversList) ? matchData.oversList : [];
    const safeInitialOvers = JSON.stringify(String(initialOversA || initialOversB || ''));
    const safeInitialScoreA = JSON.stringify(String(initialScoreA));
    const safeInitialOversList = JSON.stringify(initialOversList);

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
            body {
                background-color: #ffffff;
                color: #111827;
                font-family: sans-serif;
            }

            .bg-custom-navy {
                background-color: #f8fafc;
            }

            .bg-custom-header {
                background-color: #0b1118;
                color: #ffffff;
            }

            .bg-teal-bar {
                background-color: #0e5c75;
                color: #ffffff;
            }

            .bg-scoreboard-dark {
                background-color: #111827;
            }

            .odds-back {
                background-color: #72bbef;
                color: #000;
                cursor: pointer;
            }

            .odds-lay {
                background-color: #faa9ba;
                color: #000;
                cursor: pointer;
            }

            .fancy-no {
                background-color: #faa9ba;
                color: #000;
                cursor: pointer;
            }

            .fancy-yes {
                background-color: #72bbef;
                color: #000;
                cursor: pointer;
            }

            .bet-clickable {
                cursor: pointer;
            }

            .market-suspended {
                background-color: #2a2e33 !important;
                color: #71767a !important;
                position: relative;
                cursor: not-allowed;
            }

            .market-suspended::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 2px;
                background-color: #ef4444;
            }

            .modal-overlay {
                background: rgba(0, 0, 0, 0.6);
            }

            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }

            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        </style>
    </head>

    <body class="min-h-screen flex flex-col text-xs sm:text-sm relative">

        <!-- 1. MATCH HEADER & LIVE SCOREBOARD -->
        ${renderMatchHeader(user, matchData)}

        <!-- MAIN CONTENT MARKETS -->
        <main class="flex-1 p-2 sm:p-3 space-y-3 max-w-7xl mx-auto w-full">

            <!-- OVER-BY-OVER SLIDEABLE BALL HISTORY LINE -->
            <section id="overs-balls-strip-box"
                     class="bg-[#0f172a] text-white rounded border border-gray-800 overflow-hidden shadow">
                <div class="bg-[#0b141d] px-3 py-2 flex items-center justify-between border-b border-gray-800 text-xs">
                    <div class="font-bold tracking-wider uppercase text-[#00c0FF] flex items-center space-x-1.5">
                        <i class="fa-solid fa-baseball-bat-ball"></i>
                        <span>OVER HISTORY (SLIDE)</span>
                    </div>
                    <div class="flex items-center space-x-1 text-[11px] font-bold">
                        <span class="px-1.5 py-0.5 rounded bg-red-600 text-white">W</span>
                        <span class="px-1.5 py-0.5 rounded bg-purple-600 text-white">6</span>
                        <span class="px-1.5 py-0.5 rounded bg-blue-600 text-white">4</span>
                        <span class="px-1.5 py-0.5 rounded bg-emerald-600 text-white">3</span>
                        <span class="px-1.5 py-0.5 rounded bg-indigo-600 text-white">2</span>
                        <span class="px-1.5 py-0.5 rounded bg-green-600 text-white">1</span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-600 text-white">DOT</span>
                    </div>
                </div>

                <div id="overs-slider-track"
                     class="flex items-center space-x-2 px-3 py-2.5 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <div class="inline-flex items-center space-x-2 bg-[#1e293b] border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300">
                        <span>Over 1 se aage ke overs yahan slide hokar aayenge</span>
                    </div>
                </div>
            </section>

            <!-- 2. MATCH ODDS -->
            ${renderMatchOdds(matchData)}

            <!-- 3. BOOKMAKER -->
            ${renderBookmaker(matchData)}

            <!-- 4. NORMAL MARKETS -->
            ${renderNormalMarkets()}

            <!-- 5. OVER BY OVER -->
            ${renderOverByOver()}

            <!-- 6. FANCY1, ODD-EVEN & METER -->
            ${renderFancyMarkets()}

            <!-- 7. 2ND INN OVERS -->
            ${renderSecondInnings()}

        </main>

        <!-- ================= PLACE BET MODAL POPUP ================= -->
        <div id="bet-slip-modal"
             class="fixed inset-0 modal-overlay z-50 flex items-center justify-center hidden">

            <div class="bg-[#1e293b] text-white w-full max-w-md rounded-lg shadow-2xl border border-gray-700 overflow-hidden mx-3">

                <div class="bg-[#0f172a] px-4 py-2.5 flex justify-between items-center border-b border-gray-700 font-bold text-sm">

                    <span id="modal-market-title" class="text-[#00c0FF]">
                        Place Bet
                    </span>

                    <button onclick="closeBetSlip()"
                            class="text-gray-400 hover:text-white text-base">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="p-4 space-y-3 text-xs">

                    <div class="flex justify-between bg-black/30 p-2 rounded">

                        <div>
                            <div class="text-gray-400 text-[10px]">
                                Odds
                            </div>

                            <div class="flex items-center space-x-2 mt-1">

                                <button onclick="adjustOdds(-0.01)"
                                        class="bg-gray-700 px-2 py-0.5 rounded font-bold">
                                    -
                                </button>

                                <span id="modal-odds-val"
                                      class="font-bold text-sm text-yellow-400">
                                    0.00
                                </span>

                                <button onclick="adjustOdds(0.01)"
                                        class="bg-gray-700 px-2 py-0.5 rounded font-bold">
                                    +
                                </button>

                            </div>
                        </div>

                        <div class="text-right">

                            <div class="text-gray-400 text-[10px]">
                                Profit
                            </div>

                            <div id="modal-profit-val"
                                 class="font-bold text-sm text-green-400 mt-1">
                                0.00
                            </div>

                        </div>
                    </div>

                    <div>
                        <label class="text-gray-300 font-semibold block mb-1">
                            Amount (Stake)
                        </label>

                        <input type="number"
                               id="modal-stake-input"
                               class="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#00c0FF]"
                               placeholder="Enter amount..."
                               oninput="calculateProfit()">
                    </div>

                    <div class="grid grid-cols-4 gap-1.5">

                        <button onclick="addStake(1000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +1k
                        </button>

                        <button onclick="addStake(2000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +2k
                        </button>

                        <button onclick="addStake(5000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +5k
                        </button>

                        <button onclick="addStake(10000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +10k
                        </button>

                        <button onclick="addStake(25000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +25k
                        </button>

                        <button onclick="addStake(50000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +50k
                        </button>

                        <button onclick="addStake(75000)"
                                class="bg-[#334155] hover:bg-[#475569] py-1 rounded font-bold">
                            +75k
                        </button>

                        <button onclick="clearStake()"
                                class="bg-red-900/60 hover:bg-red-800 py-1 rounded font-bold text-red-200">
                            Clear
                        </button>

                    </div>

                    <div class="flex space-x-2 pt-2">

                        <button onclick="closeBetSlip()"
                                class="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded font-bold text-gray-300">
                            Reset
                        </button>

                        <button onclick="confirmPlaceBet()"
                                class="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded font-bold text-white shadow-lg">
                            Place Bet
                        </button>

                    </div>

                </div>
            </div>
        </div>

        <!-- JAVASCRIPT FOR SLIDEABLE OVER-BY-OVER BALL HISTORY & BETTING -->
        <script>
            (function() {
                const oversMap = new Map();

                function normalizeBall(rawBall) {
                    const s = String(rawBall ?? '').trim().toUpperCase();
                    if (!s || s === '0' || s === 'DOT' || s === '.') return 'DOT';
                    if (s === 'W' || s.includes('WICKET') || s.includes('OUT')) return 'W';
                    if (['6', '4', '3', '2', '1'].includes(s)) return s;
                    return s.slice(0, 4);
                }

                function getBallBadgeStyle(ball) {
                    const code = normalizeBall(ball);
                    if (code === 'W') return 'bg-red-600 text-white border-red-400';
                    if (code === '6') return 'bg-purple-600 text-white border-purple-400';
                    if (code === '4') return 'bg-blue-600 text-white border-blue-400';
                    if (code === '3') return 'bg-emerald-600 text-white border-emerald-400';
                    if (code === '2') return 'bg-indigo-600 text-white border-indigo-400';
                    if (code === '1') return 'bg-green-600 text-white border-green-400';
                    return 'bg-slate-600 text-white border-slate-400';
                }

                function parseOverNumberFromText(oversText) {
                    const match = String(oversText || '').match(/(\\d+(?:\\.\\d+)?)/);
                    if (!match) return 1;
                    const val = parseFloat(match[1]);
                    if (!Number.isFinite(val) || val < 0) return 1;
                    const completed = Math.floor(val);
                    const ballsPart = Math.round((val - completed) * 10);
                    return ballsPart > 0 ? completed + 1 : Math.max(1, completed);
                }

                function ensureOversUpTo(maxOver) {
                    const limit = Math.max(1, Math.min(100, Number(maxOver) || 1));
                    for (let ov = 1; ov <= limit; ov++) {
                        if (!oversMap.has(ov)) {
                            oversMap.set(ov, { balls: [], score: '' });
                        }
                    }
                }

                function renderOverHistoryLine() {
                    const track = document.getElementById('overs-slider-track');
                    if (!track) return;

                    const sortedOvers = Array.from(oversMap.entries())
                        .sort((a, b) => a[0] - b[0]);

                    if (sortedOvers.length === 0) {
                        track.innerHTML =
                            '<div class="inline-flex items-center space-x-2 bg-[#1e293b] border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300">' +
                            '<span>Over 1 se aage ke overs yahan slide hokar aayenge</span>' +
                            '</div>';
                        return;
                    }

                    track.innerHTML = sortedOvers.map(([overNum, info]) => {
                        const ballsList = Array.isArray(info.balls) ? info.balls : [];
                        const ballsChips = ballsList.length > 0
                            ? ballsList.map((b, idx) => {
                                const label = normalizeBall(b);
                                const cls = getBallBadgeStyle(label);
                                return '<span title="Over ' + overNum + ', Ball ' + (idx + 1) + ': ' + label + '" ' +
                                    'class="px-2 h-6 min-w-[26px] rounded-full border text-xs font-black inline-flex items-center justify-center shrink-0 ' + cls + '">' +
                                    label +
                                    '</span>';
                            }).join('')
                            : '<span class="text-xs text-gray-400 px-1">Slide</span>';

                        const scoreTag = info.score
                            ? '<span class="text-xs font-mono text-amber-300 ml-1.5">' + info.score + '</span>'
                            : '';

                        return '<div class="inline-flex items-center bg-[#1e293b] border border-gray-700 rounded-full px-3 py-1.5 shrink-0 space-x-2">' +
                            '<span class="text-xs font-black uppercase text-[#00c0FF] pr-1.5 border-r border-gray-700">' +
                            'Over ' + overNum +
                            '</span>' +
                            '<div class="inline-flex items-center space-x-1">' +
                            ballsChips +
                            '</div>' +
                            scoreTag +
                            '</div>';
                    }).join('');

                    track.scrollLeft = track.scrollWidth;
                }

                window.recordLiveOverBall = function(oversText, ballSymbol, scoreText) {
                    const overNum = parseOverNumberFromText(oversText);
                    ensureOversUpTo(overNum);
                    const entry = oversMap.get(overNum);
                    entry.balls.push(normalizeBall(ballSymbol));
                    if (scoreText && scoreText !== '-') {
                        entry.score = scoreText;
                    }
                    oversMap.set(overNum, entry);
                    renderOverHistoryLine();
                };

                window.syncOversStrip = function(matchObj) {
                    if (!matchObj) return;

                    const rawList =
                        Array.isArray(matchObj.oversList) ? matchObj.oversList :
                        Array.isArray(matchObj.overs) ? matchObj.overs :
                        Array.isArray(matchObj.recentOvers) ? matchObj.recentOvers :
                        null;

                    if (rawList && rawList.length > 0) {
                        let maxOv = 1;
                        rawList.forEach((item, idx) => {
                            const ovNum = Number(item.overNumber ?? item.over ?? item.number ?? (idx + 1));
                            const cleanOv = Number.isFinite(ovNum) && ovNum > 0 ? ovNum : (idx + 1);
                            if (cleanOv > maxOv) maxOv = cleanOv;

                            const rawBalls = Array.isArray(item.balls)
                                ? item.balls
                                : (Array.isArray(item.deliveries) ? item.deliveries : []);

                            const balls = rawBalls.map(b =>
                                normalizeBall(b?.ball ?? b?.runs ?? b?.symbol ?? b?.value ?? b?.event ?? b)
                            );

                            const prev = oversMap.get(cleanOv);
                            oversMap.set(cleanOv, {
                                balls: balls.length > 0 ? balls : (prev ? prev.balls : []),
                                score: item.score ? String(item.score) : (prev ? prev.score : '')
                            });
                        });

                        ensureOversUpTo(maxOv);
                        renderOverHistoryLine();
                        return;
                    }

                    const currentOvText = matchObj.oversA || matchObj.oversB || '';
                    if (currentOvText) {
                        const ovNum = parseOverNumberFromText(currentOvText);
                        ensureOversUpTo(ovNum);
                        const existing = oversMap.get(ovNum);
                        if (matchObj.scoreA && matchObj.scoreA !== '-') {
                            existing.score = matchObj.scoreA;
                        }
                        renderOverHistoryLine();
                    }
                };

                const initList = ${safeInitialOversList};
                if (Array.isArray(initList) && initList.length > 0) {
                    let maxOv = 1;
                    initList.forEach((item, idx) => {
                        const ovNum = Number(item.overNumber ?? (idx + 1));
                        const cleanOv = Number.isFinite(ovNum) && ovNum > 0 ? ovNum : (idx + 1);
                        if (cleanOv > maxOv) maxOv = cleanOv;
                        oversMap.set(cleanOv, {
                            balls: Array.isArray(item.balls) ? item.balls.map(normalizeBall) : [],
                            score: item.score ? String(item.score) : ''
                        });
                    });
                    ensureOversUpTo(maxOv);
                } else {
                    const initOv = ${safeInitialOvers};
                    const initSc = ${safeInitialScoreA};
                    const startOver = initOv ? parseOverNumberFromText(initOv) : 1;
                    ensureOversUpTo(startOver);
                    if (initSc && initSc !== '-') {
                        oversMap.get(startOver).score = initSc;
                    }
                }
                renderOverHistoryLine();
            })();

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

                document.getElementById('modal-odds-val').innerText =
                    currentBet.odds;

                document.getElementById('modal-stake-input').value = '';

                document.getElementById('modal-profit-val').innerText = '0.00';

                document.getElementById('bet-slip-modal')
                    .classList.remove('hidden');
            }

            function closeBetSlip() {
                document.getElementById('bet-slip-modal')
                    .classList.add('hidden');
            }

            function adjustOdds(val) {
                currentBet.odds = Math.max(
                    1.01,
                    +(currentBet.odds + val).toFixed(2)
                );

                document.getElementById('modal-odds-val').innerText =
                    currentBet.odds;

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
                const stake = parseFloat(
                    document.getElementById('modal-stake-input').value
                ) || 0;

                currentBet.stake = stake;

                const profit = (
                    stake * (currentBet.odds - 1)
                ).toFixed(2);

                document.getElementById('modal-profit-val').innerText =
                    profit > 0 ? profit : '0.00';
            }

            function confirmPlaceBet() {
                if (currentBet.stake <= 0) {
                    alert('Please enter a valid stake amount.');
                    return;
                }

                if (currentBet.stake > userBalance) {
                    alert('Insufficient balance / points!');
                    return;
                }

                userBalance -= currentBet.stake;
                userExposure += currentBet.stake;
                betCount += 1;

                document.getElementById('user-balance').innerText =
                    userBalance.toLocaleString();

                document.getElementById('user-exposure').innerText =
                    userExposure.toLocaleString();

                document.getElementById('matched-bet-count').innerText =
                    betCount;

                fetch('/api/place-bet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(currentBet)
                })
                .then(res => {
                    console.log('Bet successfully recorded.');
                })
                .catch(err => {
                    console.error('Error syncing bet:', err);
                });

                closeBetSlip();
            }
        </script>

        <!-- 8. FOOTER -->
        ${renderFooter()}

    </body>
    </html>
    `;
}

module.exports = { renderMatchDetailPage };
