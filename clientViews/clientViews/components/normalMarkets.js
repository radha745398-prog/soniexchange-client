function formatLimit(val, fallback = '--') {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return fallback;
    if (num >= 100000) return `${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return String(num);
}

function safeParseJson(item) {
    if (!item) return null;
    if (typeof item === 'string') {
        try {
            return JSON.parse(item);
        } catch (err) {
            return null;
        }
    }
    return typeof item === 'object' ? item : null;
}

function normalizeNormalItems(marketData) {
    if (!marketData) return [];
    const items = [];

    // 1. `All Odds V3` `gtype: "fancy"` & `mname: "Normal"` block(s)
    const blocks = Array.isArray(marketData)
        ? marketData
        : Array.isArray(marketData.data)
            ? marketData.data
            : Array.isArray(marketData.section)
                ? [marketData]
                : [];

    blocks.forEach((block) => {
        if (!block || !Array.isArray(block.section)) return;
        const gtype = String(block.gtype || '').toLowerCase();
        const mname = String(block.mname || '').toLowerCase();

        const isNormalBlock =
            mname === 'normal' ||
            (gtype === 'fancy' && !mname.includes('odd') && !mname.includes('meter'));

        if (!isNormalBlock) return;

        block.section.forEach((sec) => {
            const secName = sec.nat || sec.RunnerName || 'Session';
            const secGtype = String(sec.gtype || gtype || '').toLowerCase();

            // Skip odd/even or meter if mixed inside same block
            if (secGtype.includes('odd') || secGtype.includes('meter') || /\bodd\s*even\b|\bmeter\b/i.test(secName)) {
                return;
            }

            const oddsArr = Array.isArray(sec.odds) ? sec.odds : [];
            const layObj = oddsArr.find((o) => String(o.oname || o.otype).toLowerCase().includes('lay')) || null;
            const backObj = oddsArr.find((o) => String(o.oname || o.otype).toLowerCase().includes('back')) || null;

            const noPrice = layObj ? Number(layObj.odds ?? 0) : 0;
            const noSize = layObj ? Number(layObj.size ?? 0) : 0;
            const yesPrice = backObj ? Number(backObj.odds ?? 0) : 0;
            const yesSize = backObj ? Number(backObj.size ?? 0) : 0;

            const status = String(sec.gstatus || block.status || 'OPEN').trim().toUpperCase();

            items.push({
                id: sec.sid || sec.SelectionId || '',
                name: secName,
                min: sec.min ?? block.min ?? 100,
                max: sec.max ?? block.max ?? 25000,
                status: status || 'OPEN',
                noPrice: noPrice > 0 ? noPrice : null,
                noSize: noSize > 0 ? formatLimit(noSize, '') : '',
                yesPrice: yesPrice > 0 ? yesPrice : null,
                yesSize: yesSize > 0 ? formatLimit(yesSize, '') : ''
            });
        });
    });

    // 2. Direct `{ fancy: [...] }` array format (`gtype: "session"` or normal session items)
    if (!items.length && Array.isArray(marketData.fancy)) {
        marketData.fancy.forEach((rawItem) => {
            const item = safeParseJson(rawItem);
            if (!item) return;

            const name = item.RunnerName || item.runnerName || item.nat || item.name || 'Session';
            const gtype = String(item.gtype || 'session').toLowerCase();

            if (gtype.includes('odd') || gtype.includes('meter') || /\bodd\s*even\b|\bmeter\b/i.test(name)) {
                return;
            }

            const layPrice = Number(item.LayPrice1 ?? item.layPrice1 ?? 0);
            const laySize = Number(item.LaySize1 ?? item.laySize1 ?? 0);
            const backPrice = Number(item.BackPrice1 ?? item.backPrice1 ?? 0);
            const backSize = Number(item.BackSize1 ?? item.backSize1 ?? 0);
            const status = String(item.GameStatus ?? item.gameStatus ?? item.gstatus ?? item.status ?? 'OPEN').trim().toUpperCase();

            items.push({
                id: item.SelectionId || item.selectionId || item.sid || '',
                name,
                min: item.min ?? 100,
                max: item.max ?? 25000,
                status: status || 'OPEN',
                noPrice: layPrice > 0 ? layPrice : null,
                noSize: laySize > 0 ? formatLimit(laySize, '') : '',
                yesPrice: backPrice > 0 ? backPrice : null,
                yesSize: backSize > 0 ? formatLimit(backSize, '') : ''
            });
        });
    }

    return items;
}

function renderNormalCard(item) {
    const isSuspended =
        item.status === 'SUSPENDED' ||
        item.status === 'CLOSED' ||
        item.status === 'BALL RUNNING' ||
        item.status === 'INACTIVE';

    const safeName = String(item.name).replace(/'/g, "\\'");
    const minText = formatLimit(item.min, '100');
    const maxText = formatLimit(item.max, '25K');

    const hasNo = !isSuspended && item.noPrice !== null && Number(item.noPrice) > 0;
    const hasYes = !isSuspended && item.yesPrice !== null && Number(item.yesPrice) > 0;

    const noBtn = hasNo
        ? `<button class="fancy-no px-3 py-1 rounded font-bold text-center cursor-pointer" onclick="openBetSlip('${safeName} (No)', ${item.noPrice})">
                <div>${item.noPrice}</div>
                <div class="text-[9px] font-normal">${item.noSize || '--'}</div>
           </button>`
        : `<button type="button" disabled class="market-suspended px-3 py-1 rounded font-bold text-center">
                <div>${item.noPrice !== null ? item.noPrice : '--'}</div>
                <div class="text-[9px] font-normal">${isSuspended ? 'SUSP' : (item.noSize || '--')}</div>
           </button>`;

    const yesBtn = hasYes
        ? `<button class="fancy-yes px-3 py-1 rounded font-bold text-center cursor-pointer" onclick="openBetSlip('${safeName} (Yes)', ${item.yesPrice})">
                <div>${item.yesPrice}</div>
                <div class="text-[9px] font-normal">${item.yesSize || '--'}</div>
           </button>`
        : `<button type="button" disabled class="market-suspended px-3 py-1 rounded font-bold text-center">
                <div>${item.yesPrice !== null ? item.yesPrice : '--'}</div>
                <div class="text-[9px] font-normal">${isSuspended ? 'SUSP' : (item.yesSize || '--')}</div>
           </button>`;

    const badge = isSuspended
        ? `<span class="ml-1.5 px-1.5 py-0.5 text-[9px] rounded bg-red-100 text-red-700 font-semibold">${item.status}</span>`
        : '';

    return `
    <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs" data-sid="${item.id || ''}">
        <div class="pr-2">
            <div class="font-bold text-gray-900 flex items-center flex-wrap">
                <span>${item.name}</span>
                ${badge}
            </div>
            <div class="text-[10px] text-gray-500">Min: ${minText} Max: ${maxText}</div>
        </div>
        <div class="flex space-x-1 shrink-0">
            ${noBtn}
            ${yesBtn}
        </div>
    </div>
    `;
}

function renderNormalMarkets(marketData) {
    const items = normalizeNormalItems(marketData);

    if (!items.length) {
        return `
        <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Normal</div>
        <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-3 text-center text-xs text-gray-500 shadow-sm">
            No live normal session markets available
        </div>
        `;
    }

    return `
    <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Normal</div>
    <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
        ${items.map(renderNormalCard).join('')}
    </div>
    `;
}

module.exports = { renderNormalMarkets };
