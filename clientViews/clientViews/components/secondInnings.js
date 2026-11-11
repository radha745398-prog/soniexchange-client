
// clientViews/components/secondInnings.js

function renderSecondInnings() {
    return `
    <div class="bg-[#1e293b] rounded-lg p-3 text-white shadow-md border border-gray-700">
        <div class="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
            <span class="font-bold text-sm text-[#00c0FF]"><i class="fa-solid fa-flag mr-1.5"></i> 2nd Innings Overs</span>
            <span class="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-300">Upcoming</span>
        </div>
        <div class="text-center py-4 text-gray-400 text-xs">
            2nd innings market will open shortly.
        </div>
    </div>
    `;
}

module.exports = { renderSecondInnings };
