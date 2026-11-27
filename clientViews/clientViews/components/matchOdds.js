function formatLimit(val, fallback = '--') {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return fallback;
    if (num >= 100000) return `${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return String(num);
}

function buildSelectionNameMap(matchData) {
    const map = new Map();
    if (!matchData || typeof matchData !== 'object') return map;

    const addEntry = (id, name) => {
        if (id !== undefined && id !== null && name) {
            map.set(String(id), String(name));
        }
    };

    // Optional map object { "448": "New Zealand", ... }
    if (matchData.runnersMap && typeof matchData.runnersMap === 'object') {
        Object.entries(matchData.runnersMap).forEach(([k, v]) => addEntry(k, v));
    }

    // Optional catalogue runners array [{ selectionId, runnerName }]
    const catList = Array.isArray(matchData.catalogueRunners)
        ? matchData.catalogueRunners
        : Array.isArray(matchData.runnersCatalogue)
            ? matchData.runnersCatalogue
            : [];

    catList.forEach((r) => {
        addEntry(r.selectionId ?? r.id ?? r.sid, r.runnerName ?? r.name ?? r.nat);
    });

    // Optional section array with sid + nat
    if (Array.isArray(matchData.section)) {
        matchData.section.forEach((s) => addEntry(s.sid, s.nat));
    }

    return map;
}

function normalizeMatchOddsMarket(matchData) {
    if (!matchData) return null;

    const nameMap = buildSelectionNameMap(matchData);

    // 1. Find `All Odds V3` `gtype: "match"` block if wrapped in array or { data: [...] }
    const candidates = Array.isArray(matchData)
        ? matchData
        : Array.isArray(matchData.data)
            ? matchData.data
            : [matchData];

    const v3Market = candidates.find(
        (m) =>
            m &&
            (String(m.gtype).toLowerCase() === 'match' ||
                String(m.mname).toUpperCase().includes('MATCH_ODDS')) &&
            Array.isArray(m.section)
    );

    if (v3Market) {
        const runners = v3Market.section.map((sec, idx) => {
            const oddsArr = Array.isArray(sec.odds) ? sec.odds : [];
            const findOdd = (oname, otype, tno) =>
                oddsArr.find((o) => String(o.oname).toLowerCase() === oname) ||
                oddsArr.filter((o) => String(o.otype).toLowerCase() === otype)[tno] ||
                null;

            const b3 = findOdd('back3', 'back', 2);
            const b2 = findOdd('back2', 'back', 1);
            const b1 = findOdd('back1', 'back', 0);

            const l1 = findOdd('lay1', 'lay', 0);
            const l2 = findOdd('lay2', 'lay', 1);
            const l3 = findOdd('lay3', 'lay', 2);

            const fallbackTeam = idx === 0 && matchData.teamA
                ? matchData.teamA
                : idx === 1 && matchData.teamB
                    ? matchData.teamB
                    : `Runner ${idx + 1}`;

            return {
                sid: sec.sid ?? idx + 1,
                name: sec.nat || nameMap.get(String(sec.sid)) || fallbackTeam,
                status: String(sec.gstatus || v3Market.status || 'ACTIVE').toUpperCase(),
                backs: [
                    { price: b3 && Number(b3.odds) > 0 ? Number(b3.odds) : null, size: b3 && Number(b3.size) > 0 ? Number(b3.size) : '' },
                    { price: b2 && Number(b2.odds) > 0 ? Number(b2.odds) : null, size: b2 && Number(b2.size) > 0 ? Number(b2.size) : '' },
                    { price: b1 && Number(b1.odds) > 0 ? Number(b1.odds) : null, size: b1 && Number(b1.size) > 0 ? Number(b1.size) : '' }
                ],
                lays: [
                    { price: l1 && Number(l1.odds) > 0 ? Number(l1.odds) : null, size: l1 && Number(l1.size) > 0 ? Number(l1.size) : '' },
                    { price: l2 && Number(l2.odds) > 0 ? Number(l2.odds) : null, size: l2 && Number(l2.size) > 0 ? Number(l2.size) : '' },
                    { price: l3 && Number(l3.odds) > 0 ? Number(l3.odds) : null, size: l3 && Number(l3.size) > 0 ? Number(l3.size) : '' }
                ]
            };
        });

        return {
            title: v3Market.mname || 'MATCH_ODDS',
            marketId: v3Market.mid || '',
            status: String(v3Market.status || 'OPEN').toUpperCase(),
            inplay: Boolean(v3Market.iplay),
            min: v3Market.min ?? matchData.min ?? 100,
            max: v3Market.max ?? matchData.max ?? 50000,
            runners
        };
    }

    // 2. `listMarketBook` market object format (`market.runners` with `ex.availableToBack` & `availableToLay`)
    const bookMarket = candidates.find((m) => m && Array.isArray(m.runners)) || null;

    if (bookMarket) {
        const runners = bookMarket.runners.map((r, idx) => {
            const ex = r.ex || {};
            const availBack = Array.isArray(ex.availableToBack) ? ex.availableToBack : [];
            const availLay = Array.isArray(ex.availableToLay) ? ex.availableToLay : [];

            // Betfair returns best back at index 0; arrange left-to-right [3rd best, 2nd best, best back]
            const b1 = availBack[0] || null;
            const b2 = availBack[1] || null;
            const b3 = availBack[2] || null;

            // Betfair returns best lay at index 0; arrange left-to-right [best lay, 2nd best, 3rd best]
            const l1 = availLay[0] || null;
            const l2 = availLay[1] || null;
            const l3 = availLay[2] || null;

            const fallbackTeam = idx === 0 && matchData.teamA
                ? matchData.teamA
                : idx === 1 && matchData.teamB
                    ? matchData.teamB
                    : `Selection ${r.selectionId || idx + 1}`;

            return {
                sid: r.selectionId ?? idx + 1,
                name: nameMap.get(String(r.selectionId)) || r.runnerName || fallbackTeam,
                status: String(r.status || bookMarket.status || 'ACTIVE').toUpperCase(),
                backs: [
                    { price: b3 && Number(b3.price) > 0 ? Number(b3.price) : null, size: b3 && Number(b3.size) > 0 ? Number(b3.size) : '' },
                    { price: b2 && Number(b2.price) > 0 ? Number(b2.price) : null, size: b2 && Number(b2.size) > 0 ? Number(b2.size) : '' },
                    { price: b1 && Number(b1.price) > 0 ? Number(b1.price) : null, size: b1 && Number(b1.size) > 0 ? Number(b1.size) : '' }
                ],
                lays: [
                    { price: l1 && Number(l1.price) > 0 ? Number(l1.price) : null, size: l1 && Number(l1.size) > 0 ? Number(l1.size) : '' },
                    { price: l2 && Number(l2.price) > 0 ? Number(l2.price) : null, size: l2 && Number(l2.size) > 0 ? Number(l2.size) : '' },
                    { price: l3 && Number(l3.price) > 0 ? Number(l3.price) : null, size: l3 && Number(l3.size) > 0 ? Number(l3.size) : '' }
                ]
            };
        });

        return {
            title: matchData.marketName || 'MATCH_ODDS',
            marketId: bookMarket.marketId || '',
            status: String(bookMarket.status || 'OPEN').toUpperCase(),
            inplay: Boolean(bookMarket.inplay),
            min: matchData.min ?? 100,
            max: matchData.max ?? 50000,
            runners
        };
    }

    return null;
}

function renderOddBox(cell, runnerName, sideLabel, isPrimary, isSuspended) {
    const hasPrice = !isSuspended && cell && cell.price !== null && cell.price !== undefined && Number(cell.price) > 0;

    if (!hasPrice) {
        return `<div class="market-suspended rounded py-1 font-bold text-[10px] leading-tight">${isSuspended ? 'SUSP' : '--'}</div>`;
    }

    const safeName = String(runnerName).replace(/'/g, "\\'");
    const boxClass = sideLabel === 'Back'
        ? (isPrimary ? 'odds-back font-bold' : 'bg-[#72bbef]/30 bet-clickable font-bold text-black')
        : (isPrimary ? 'odds-lay font-bold' : 'bg-[#faa9ba]/30 bet-clickable font-bold text-black');

    return `
        <div class="${boxClass} rounded py-0.5 px-0.5 text-xs cursor-pointer leading-tight" onclick="openBetSlip('${safeName} (${sideLabel})', ${cell.price})">
            <div>${cell.price}</div>
            ${cell.size !== '' ? `<div class="text-[9px] font-normal opacity-80">${cell.size}</div>` : ''}
        </div>
    `;
}

function renderMatchOdds(matchData) {
    const market = normalizeMatchOddsMarket(matchData);

    if (!market || !Array.isArray(market.runners) || market.runners.length === 0) {
        const teamA = (matchData && matchData.teamA) || 'Team A';
        const teamB = (matchData && matchData.teamB) || 'Team B';
        return `
        <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
            <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 flex justify-between items-center text-xs border-b border-gray-200">
                <span>MATCH_ODDS (${teamA} vs ${teamB})</span>
                <span class="text-[10px] text-gray-600">Min: 100 Max: 50K</span>
            </div>
            <div class="p-3 text-center text-xs text-gray-500">Waiting for live match odds...</div>
        </div>
        `;
    }

    const minText = formatLimit(market.min, '100');
    const maxText = formatLimit(market.max, '50K');
    const marketSuspended = market.status === 'SUSPENDED' || market.status === 'CLOSED';

    const runnersHtml = market.runners.map((runner, idx) => {
        const runnerSuspended =
            marketSuspended ||
            runner.status === 'SUSPENDED' ||
            runner.status === 'CLOSED' ||
            runner.status === 'REMOVED';

        const statusBadge = runnerSuspended
            ? `<span class="ml-1.5 px-1.5 py-0.5 text-[9px] rounded bg-red-100 text-red-700 font-semibold">${runner.status}</span>`
            : '';

        const backIdAttr = idx === 0 ? 'id="odds-ta-back"' : '';
        const layIdAttr = idx === 0 ? 'id="odds-ta-lay"' : '';

        return `
        <div class="grid grid-cols-12 items-center p-2 border-b last:border-b-0 border-gray-200 hover:bg-gray-100 transition" data-sid="${runner.sid}">
            <div class="col-span-6 font-bold text-gray-900 text-xs flex items-center flex-wrap">
                <span>${runner.name}</span>
                ${statusBadge}
            </div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center">
                ${renderOddBox(runner.backs[0], runner.name, 'Back', false, runnerSuspended)}
                ${renderOddBox(runner.backs[1], runner.name, 'Back', false, runnerSuspended)}
                <div ${backIdAttr} class="contents">${renderOddBox(runner.backs[2], runner.name, 'Back', true, runnerSuspended)}</div>
            </div>
            <div class="col-span-3 grid grid-cols-3 gap-1 text-center pl-1">
                <div ${layIdAttr} class="contents">${renderOddBox(runner.lays[0], runner.name, 'Lay', true, runnerSuspended)}</div>
                ${renderOddBox(runner.lays[1], runner.name, 'Lay', false, runnerSuspended)}
                ${renderOddBox(runner.lays[2], runner.name, 'Lay', false, runnerSuspended)}
            </div>
        </div>
        `;
    }).join('');

    return `
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm" data-market-id="${market.marketId || ''}">
        <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 flex justify-between items-center text-xs border-b border-gray-200">
            <div class="flex items-center space-x-2">
                <span>${market.title}</span>
                ${market.inplay ? '<span class="px-1.5 py-0.5 text-[9px] rounded bg-green-600 text-white uppercase">Inplay</span>' : ''}
                ${marketSuspended ? `<span class="px-1.5 py-0.5 text-[9px] rounded bg-red-600 text-white uppercase">${market.status}</span>` : ''}
            </div>
            <span class="text-[10px] text-gray-600">Min: ${minText} Max: ${maxText}</span>
        </div>
        <div class="grid grid-cols-12 bg-[#f1f5f9] text-gray-600 text-[10px] py-1 px-2 border-b border-gray-200">
            <div class="col-span-6"></div>
            <div class="col-span-3 text-center text-[#0369a1] font-bold">Back</div>
            <div class="col-span-3 text-center text-[#991b1b] font-bold">Lay</div>
        </div>
        ${runnersHtml}
    </div>
    `;
}

module.exports = { renderMatchOdds };
