function renderMatchOdds(matchData) {
    const teamA = matchData ? matchData.teamA : 'Pakistan';
    const teamB = matchData ? matchData.teamB : 'Sri Lanka';

    return `
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
        <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 flex justify-between items-center text-xs border-b border-gray-200">
            <span>MATCH_ODDS</span>
            <span class="text-[10px] text-gray-600">Min: 100 Max: 50K</span>
        </div>
        <div class="grid grid-cols-12 bg-[#f1f5f9] text-gray-600 text-[10px] py-1 px-2 border-b border-gray-200">
            <div class="col-span-6"></div>
            <div class="col-span-3 text-center text-[#0369a1] font-bold">Back</div>
            <div class="col-span-3 text-center text-[#991b1b] font-bold">Lay</div>
        </div>

        <div class="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition">
            <div class="col-span-6 font-bold text-gray-900 text-xs">${teamA}</div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Back)', 5)"><span class="font-bold text-xs text-black">5</span></div>
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Back)', 5.2)"><span class="font-bold text-xs text-black">5.2</span></div>
                <div class="odds-back rounded py-1 font-bold text-xs" id="odds-ta-back" onclick="openBetSlip('${teamA} (Back)', 5.3)">5.3</div>
            </div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                <div class="odds-lay rounded py-1 font-bold text-xs" id="odds-ta-lay" onclick="openBetSlip('${teamA} (Lay)', 5.4)">5.4</div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Lay)', 5.5)"><span class="font-bold text-xs text-black">5.5</span></div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamA} (Lay)', 5.6)"><span class="font-bold text-xs text-black">5.6</span></div>
            </div>
        </div>

        <div class="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 transition">
            <div class="col-span-6 font-bold text-gray-900 text-xs">${teamB}</div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Back)', 9.2)"><span class="font-bold text-xs text-black">9.2</span></div>
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Back)', 9.4)"><span class="font-bold text-xs text-black">9.4</span></div>
                <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamB} (Back)', 9.8)">9.8</div>
            </div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                <div class="odds-lay rounded py-1 font-bold text-xs" onclick="openBetSlip('${teamB} (Lay)', 11)">11</div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Lay)', 11.5)"><span class="font-bold text-xs text-black">11.5</span></div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('${teamB} (Lay)', 12)"><span class="font-bold text-xs text-black">12</span></div>
            </div>
        </div>

        <div class="grid grid-cols-12 items-center p-2 hover:bg-gray-100 transition">
            <div class="col-span-6 font-bold text-gray-900 text-xs">The Draw</div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Back)', 1.37)"><span class="font-bold text-xs text-black">1.37</span></div>
                <div class="bg-[#72bbef]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Back)', 1.38)"><span class="font-bold text-xs text-black">1.38</span></div>
                <div class="odds-back rounded py-1 font-bold text-xs" onclick="openBetSlip('The Draw (Back)', 1.39)">1.39</div>
            </div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                <div class="odds-lay rounded py-1 font-bold text-xs" onclick="openBetSlip('The Draw (Lay)', 1.4)">1.4</div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Lay)', 1.41)"><span class="font-bold text-xs text-black">1.41</span></div>
                <div class="bg-[#faa9ba]/30 rounded py-1 bet-clickable" onclick="openBetSlip('The Draw (Lay)', 1.42)"><span class="font-bold text-xs text-black">1.42</span></div>
            </div>
        </div>
    </div>
    `;
}

module.exports = { renderMatchOdds };
