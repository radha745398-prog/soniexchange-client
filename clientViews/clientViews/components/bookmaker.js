function renderBookmaker(matchData) {
    const teamA = matchData ? matchData.teamA : 'Pakistan';

    return `
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
    `;
}

module.exports = { renderBookmaker };
