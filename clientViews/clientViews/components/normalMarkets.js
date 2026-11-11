function renderNormalMarkets() {
    return `
    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Normal</div>
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
        
        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">20 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 100K</div></div>
            <div class="flex space-x-1">
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>80</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">16 over run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('16 over run SL (No)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('16 over run SL (Yes)', 64)"><div>64</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">1st innings run SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
            <div class="flex space-x-1">
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>333</div><div class="text-[9px] font-normal">100</div></button>
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>337</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">1st innings run 3rd wkt SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('1st innings run 3rd wkt SL (No)', 326)"><div>326</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('1st innings run 3rd wkt SL (Yes)', 329)"><div>329</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">1st innings run 1st wkt SL 2</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
                <button class="market-suspended px-3 py-1 rounded font-bold text-center"><div>285</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">2nd wkt SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('2nd wkt SL (No)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('2nd wkt SL (Yes)', 98)"><div>98</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">3rd wkt inwr SL</div><div class="text-[10px] text-gray-500">Min: 100 Max: 1L</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('3rd wkt inwr SL (No)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('3rd wkt inwr SL (Yes)', 101)"><div>101</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">L Udara 1st innings</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('L Udara 1st innings (No)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('L Udara 1st innings (Yes)', 72)"><div>72</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">Kusal Mendis runs</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kusal Mendis runs (No)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kusal Mendis runs (Yes)', 45)"><div>45</div><div class="text-[9px] font-normal">100</div></button>
            </div>
        </div>

        <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs">
            <div><div class="font-bold text-gray-900">Kaminen Mendis boundaries</div><div class="text-[10px] text-gray-500">Min: 100 Max: 25K</div></div>
            <div class="flex space-x-1">
                <button class="fancy-no px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kaminen Mendis boundaries (No)', 4)"><div>4</div><div class="text-[9px] font-normal">100</div></button>
                <button class="fancy-yes px-3 py-1 rounded font-bold text-center" onclick="openBetSlip('Kaminen Mendis boundaries (Yes)', 5)"><div>5</div><div class="text-[9px] font-normal">250K</div></button>
            </div>
        </div>

    </div>
    `;
}

module.exports = { renderNormalMarkets };
