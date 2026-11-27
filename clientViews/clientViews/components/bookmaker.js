function formatLimit(val, fallback = '--') {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return fallback;
    if (num >= 100000) return `${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return String(num);
}

function normalizeBookmakerRows(matchData) {
    if (!matchData) return [];

    // 1. Direct `bookmaker` array format (e.g. { bookmaker: [...] })
    if (Array.isArray(matchData.bookmaker) && matchData.bookmaker.length > 0) {
        return matchData.bookmaker.map((row) => {
            const back1 = Number(row.b1 ?? 0);
            const backSize1 = Number(row.bs1 ?? 0);
            const back2 = Number(row.b2 ?? 0);
            const backSize2 = Number(row.bs2 ?? 0);

            const lay1 = Number(row.l1 ?? 0);
            const laySize1 = Number(row.ls1 ?? 0);
            const lay2 = Number(row.l2 ?? 0);
            const laySize2 = Number(row.ls2 ?? 0);

            return {
                mid: row.mid || '',
                sid: row.sid || '',
                name: row.nat || row.runnerName || 'Runner',
                status: String(row.s || matchData.status || 'ACTIVE').toUpperCase(),
                min: row.min ?? matchData.min ?? 100,
                max: row.max ?? matchData.max ?? 50000,
                backs: [
                    { price: back1 > 0 ? back1 : null, size: backSize1 > 0 ? backSize1 : '' },
                    { price: back2 > 0 ? back2 : null, size: backSize2 > 0 ? backSize2 : '' }
                ],
                lays: [
                    { price: lay1 > 0 ? lay1 : null, size: laySize1 > 0 ? laySize1 : '' },
                    { price: lay2 > 0 ? lay2 : null, size: laySize2 > 0 ? laySize2 : '' }
                ]
            };
        });
    }

    // 2. `All Odds V3` `gtype: "match1"` market object format
    const marketObj = Array.isArray(matchData)
        ? matchData.find((m) => String(m.gtype).toLowerCase() === 'match1' || String(m.mname).toLowerCase() === 'bookmaker')
        : (String(matchData.gtype).toLowerCase() === 'match1' || String(matchData.mname).toLowerCase() === 'bookmaker')
            ? matchData
            : null;

    if (marketObj && Array.isArray(marketObj.section)) {
        return marketObj.section.map((sec) => {
            const oddsArr = Array.isArray(sec.odds) ? sec.odds : [];
            const getOdd = (oname) => oddsArr.find((o) => String(o.oname).toLowerCase() === oname) || null;

            const b1Obj = getOdd('back1');
            const b2Obj = getOdd('back2');
            const l1Obj = getOdd('lay1');
            const l2Obj = getOdd('lay2');

            return {
                mid: marketObj.mid || '',
                sid: sec.sid || '',
                name: sec.nat || 'Runner',
                status: String(sec.gstatus || marketObj.status || 'ACTIVE').toUpperCase(),
                min: sec.min || marketObj.min || 100,
                max: sec.max || marketObj.max || 50000,
                backs: [
                    {
                        price: b1Obj && Number(b1Obj.odds) > 0 ? Number(b1Obj.odds) : null,
                        size: b1Obj && Number(b1Obj.size) > 0 ? Number(b1Obj.size) : ''
                    },
                    {
                        price: b2Obj && Number(b2Obj.odds) > 0 ? Number(b2Obj.odds) : null,
                        size: b2Obj && Number(b2Obj.size) > 0 ? Number(b2Obj.size) : ''
                    }
                ],
                lays: [
                    {
                        price: l1Obj && Number(l1Obj.odds) > 0 ? Number(l1Obj.odds) : null,
                        size: l1Obj && Number(l1Obj.size) > 0 ? Number(l1Obj.size) : ''
                    },
                    {
                        price: l2Obj && Number(l2Obj.odds) > 0 ? Number(l2Obj.odds) : null,
                        size: l2Obj && Number(l2Obj.size) > 0 ? Number(l2Obj.size) : ''
                    }
                ]
            };
        });
    }

    // 3. Fallback if only teamA string/object is passed without live bookmaker rows
    if (matchData.teamA) {
        return [{
            mid: '',
            sid: '1',
            name: matchData.teamA,
            status: 'SUSPENDED',
            min: 100,
            max: 50000,
            backs: [{ price: null, size: '' }, { price: null, size: '' }],
            lays: [{ price: null, size: '' }, { price: null, size: '' }]
        }];
    }

    return [];
}

function renderCell(cell, runnerName, sideLabel, isSuspended) {
    const hasPrice = !isSuspended && cell && cell.price !== null && cell.price !== undefined && Number(cell.price) > 0;
    const baseClass = sideLabel === 'Back' ? 'odds-back' : 'odds-lay';

    if (!hasPrice) {
        return `<div class="market-suspended rounded py-1 font-bold text-[11px]">${isSuspended ? 'SUSP' : '--'}</div>`;
    }

    const safeName = String(runnerName).replace(/'/g, "\\'");
    return `
        <div class="${baseClass} rounded py-0.5 px-1 font-bold text-xs cursor-pointer leading-tight" onclick="openBetSlip('${safeName} BM (${sideLabel})', ${cell.price})">
            <div>${cell.price}</div>
            ${cell.size !== '' ? `<div class="text-[9px] font-normal opacity-80">${cell.size}</div>` : ''}
        </div>
    `;
}

function renderBookmaker(matchData) {
    const rows = normalizeBookmakerRows(matchData);

    if (!rows.length) {
        return `
        <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm">
            <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 text-xs border-b border-gray-200">
                Bookmaker
            </div>
            <div class="p-3 text-center text-xs text-gray-500">No live bookmaker market available</div>
        </div>
        `;
    }

    const minText = formatLimit(rows[0].min, '100');
    const maxText = formatLimit(rows[0].max, '50K');

    const rowsHtml = rows.map((row) => {
        const isSuspended = row.status === 'SUSPENDED' || row.status === 'CLOSED' || row.status === 'INACTIVE';
        const statusBadge = isSuspended
            ? `<span class="ml-1.5 px-1.5 py-0.2 text-[9px] rounded bg-red-100 text-red-700 font-semibold">${row.status}</span>`
            : '';

        return `
        <div class="grid grid-cols-12 items-center p-2 border-b last:border-b-0 border-gray-100 hover:bg-gray-100 transition">
            <div class="col-span-6 font-bold text-gray-900 text-xs flex items-center flex-wrap">
                <span>${row.name}</span>
                ${statusBadge}
            </div>
            <div class="col-span-3 grid grid-cols-2 gap-1 text-center">
                ${renderCell(row.backs[0], row.name, 'Back', isSuspended)}
                ${renderCell(row.backs[1], row.name, 'Back', isSuspended)}
            </div>
            <div class="col-span-3 grid grid-cols-2 gap-1 text-center pl-1">
                ${renderCell(row.lays[0], row.name, 'Lay', isSuspended)}
                ${renderCell(row.lays[1], row.name, 'Lay', isSuspended)}
            </div>
        </div>
        `;
    }).join('');

    return `
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden shadow-sm" data-mid="${rows[0].mid || ''}">
        <div class="bg-[#e2e8f0] px-3 py-1.5 font-bold text-gray-800 text-xs border-b border-gray-200 flex justify-between items-center">
            <span>Bookmaker</span>
        </div>
        <div class="grid grid-cols-12 bg-[#f1f5f9] text-gray-600 text-[10px] py-1 px-2 border-b border-gray-200">
            <div class="col-span-6">Min: ${minText} Max: ${maxText}</div>
            <div class="col-span-3 text-center text-[#0369a1] font-bold">Back</div>
            <div class="col-span-3 text-center text-[#991b1b] font-bold">Lay</div>
        </div>
        ${rowsHtml}
    </div>
    `;
}

module.exports = { renderBookmaker };
