function renderFancyMarkets() {
    return `
    <!-- FANCY1 -->
    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Fancy1</div>
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">3rd Wkt Caught out SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
            <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd Wkt Caught out SL (Back)', 1.35)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd Wkt Caught out SL (Lay)', 1.55)">--</button></div>
        </div>
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">3rd wkt out L. Udara</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
            <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd wkt out L. Udara (Back)', 1.75)">--</button><button class="odds-lay px-3 py-1 rounded font-bold" onclick="openBetSlip('3rd wkt out L. Udara (Lay)', 2.05)">--</button></div>
        </div>
    </div>

    <!-- ODD-EVEN -->
    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Odd-Even</div>
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">1st Inn 20 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
            <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 20 over run odd even SL (Odd)', 1.96)">1.96</button><button class="market-suspended px-3 py-1 rounded font-bold">1.96</button></div>
        </div>
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">1st Inn 30 over run odd even SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
            <div class="flex space-x-1"><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 30 over run odd even SL (Odd)', 1.96)">1.96</button><button class="odds-back px-3 py-1 rounded font-bold" onclick="openBetSlip('1st Inn 30 over run odd even SL (Even)', 1.96)">1.96</button></div>
        </div>
    </div>

    <!-- METER -->
    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Meter</div>
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">3rd wkt meter SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
            <div class="flex space-x-1">
                <button class="market-suspended px-3 py-1 rounded font-bold">112</button>
                <button class="market-suspended px-3 py-1 rounded font-bold">115</button>
            </div>
        </div>
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">L Udara meter</div><div class="text-[10px] text-gray-500">Min: 100 Max: 10K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold" onclick="openBetSlip('L Udara meter (No)', 83)">83</button>
                <button class="fancy-yes px-3 py-1 rounded font-bold" onclick="openBetSlip('L Udara meter (Yes)', 86)">86</button>
            </div>
        </div>
    </div>
    `;
}

module.exports = { renderFancyMarkets };
