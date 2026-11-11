function renderOverByOver() {
    return `
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
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Only 18 over run SL (No)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Only 18 over run SL (Yes)', 10)"><div>--</div><div class="text-[9px] font-normal">--</div></button>
            </div>
        </div>
    </div>
    `;
}

module.exports = { renderOverByOver };
