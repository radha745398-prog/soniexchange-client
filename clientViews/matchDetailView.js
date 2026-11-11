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

            /* Modal Overlay */
            .modal-overlay { background: rgba(0, 0, 0, 0.6); }

            /* Custom Horizontal Scrollbar */
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
    </head>
    <body class="min-h-screen flex flex-col text-xs relative">
        
        <!-- 1. MATCH HEADER & LIVE SCOREBOARD -->
        ${renderMatchHeader(user, matchData)}

        <!-- MAIN CONTENT MARKETS -->
        <main class="flex-1 p-2 space-y-3 max-w-7xl mx-auto w-full">
            
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

                document.getElementById('user-balance').innerText = userBalance.toLocaleString();
                document.getElementById('user-exposure').innerText = userExposure.toLocaleString();
                document.getElementById('matched-bet-count').innerText = betCount;

                fetch('/api/place-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentBet)
                }).then(res => {
                    console.log('Bet successfully recorded.');
                }).catch(err => {
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
