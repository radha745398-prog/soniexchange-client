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

function classifyCategory(gtype = '', name = '') {
    const gt = String(gtype).toLowerCase().trim();
    const nm = String(name).toLowerCase().trim();

    if (gt.includes('meter') || /\bmeter\b/.test(nm)) {
        return 'Meter';
    }
    if (gt.includes('odd') || gt.includes('even') || /\bodd\s*even\b/.test(nm)) {
        return 'Odd-Even';
    }
    if (gt.includes('fancy1') || gt.includes('match1') || /\bfancy\s*1\b/.test(nm)) {
        return 'Fancy1';
    }
    return 'Fancy / Session';
}

function normalizeFancyItems(marketData) {
    if (!marketData) return [];
    const normalized = [];

    // 1. Direct `{ fancy: [ "...json...", { RunnerName: ... } ] }` format
    if (Array.isArray(marketData.fancy)) {
        marketData.fancy.forEach((rawItem) => {
            const item = safeParseJson(rawItem);
            if (!item) return;

            const name = item.RunnerName || item.runnerName || item.nat || item.name || 'Market';
            const backPrice = Number(item.BackPrice1 ?? item.backPrice1 ?? 0);
            const backSize = Number(item.BackSize1 ?? item.backSize1 ?? 0);
            const layPrice = Number(item.LayPrice1 ?? item.layPrice1 ?? 0);
            const laySize = Number(item.LaySize1 ?? item.laySize1 ?? 0);
            const status = String(item.GameStatus ?? item.gameStatus ?? item.gstatus ?? item.status ?? 'OPEN').trim().toUpperCase();
            const gtype = item.gtype || 'session';

            normalized.push({
                id: item.SelectionId || item.selectionId || item.sid || '',
                name,
                category: classifyCategory(gtype, name),
                min: item.min ?? 100,
                max: item.max ?? 25000,
                status: status || 'OPEN',
                noPrice: layPrice > 0 ? layPrice : null,
                noSize: laySize > 0 ? laySize : '',
                yesPrice: backPrice > 0 ? backPrice : null,
                yesSize: backSize > 0 ? backSize : ''
            });
        });
    }

    // 2. `All Odds V3` `data` array or market block format (`section` + `odds`)
    const blocks = Array.isArray(marketData)
        ? marketData
        : Array.isArray(marketData.data)
            ? marketData.data
            : Array.isArray(marketData.section)
                ? [marketData]
                : [];

    blocks.forEach((block) => {
        if (!block || !Array.isArray(block.section)) return;
        const blockGtype = String(block.gtype || '').toLowerCase();
        const blockMname = String(block.mname || '').toLowerCase();

        // Skip pure match odds / bookmaker blocks here unless explicitly fancy/meter/oddeven
        const isFancyBlock =
            blockGtype.includes('fancy') ||
            blockGtype.includes('meter') ||
            blockGtype.includes('odd') ||
            blockMname.includes('normal') ||
            blockMname.includes('fancy');

        if (!isFancyBlock) return;

        block.section.forEach((sec) => {
            const oddsArr = Array.isArray(sec.odds) ? sec.odds : [];
            const backObj = oddsArr.find((o) => String(o.oname || o.otype).toLowerCase().includes('back')) || null;
            const layObj = oddsArr.find((o) => String(o.oname || o.otype).toLowerCase().includes('lay')) || null;

            const name = sec.nat || sec.RunnerName || 'Market';
            const gtype = sec.gtype || block.gtype || 'fancy';
            const status = String(sec.gstatus || block.status || 'OPEN').trim().toUpperCase();

            const backPrice = backObj ? Number(backObj.odds ?? 0) : 0;
            const backSize = backObj ? Number(backObj.size ?? 0) : 0;
            const layPrice = layObj ? Number(layObj.odds ?? 0) : 0;
            const laySize = layObj ? Number(layObj.size ?? 0) : 0;

            normalized.push({
                id: sec.sid || sec.SelectionId || '',
                name,
                category: classifyCategory(gtype, name),
                min: sec.min ?? block.min ?? 100,
                max: sec.max ?? block.max ?? 25000,
                status: status || 'OPEN',
                noPrice: layPrice > 0 ? layPrice : null,
                noSize: laySize > 0 ? laySize : '',
                yesPrice: backPrice > 0 ? backPrice : null,
                yesSize: backSize > 0 ? backSize : ''
            });
        });
    });

    return normalized;
}

function renderFancyCard(item) {
    const isSuspended =
        item.status === 'SUSPENDED' ||
        item.status === 'CLOSED' ||
        item.status === 'BALL RUNNING' ||
        item.status === 'INACTIVE';

    const safeName = String(item.name).replace(/'/g, "\\'");
    const minLabel = formatLimit(item.min, '100');
    const maxLabel = formatLimit(item.max, '25K');

    const hasNo = !isSuspended && item.noPrice !== null && Number(item.noPrice) > 0;
    const hasYes = !isSuspended && item.yesPrice !== null && Number(item.yesPrice) > 0;

    const noBtnHtml = hasNo
        ? `<button class="fancy-no px-2.5 py-1 rounded font-bold cursor-pointer leading-tight" onclick="openBetSlip('${safeName} (No)', ${item.noPrice})">
                <div>${item.noPrice}</div>
                ${item.noSize !== '' ? `<div class="text-[9px] font-normal opacity-80">${item.noSize}</div>` : ''}
           </button>`
        : `<button type="button" disabled class="market-suspended px-2.5 py-1 rounded font-bold text-[10px] leading-tight">${isSuspended ? 'SUSP' : '--'}</button>`;

    const yesBtnHtml = hasYes
        ? `<button class="fancy-yes px-2.5 py-1 rounded font-bold cursor-pointer leading-tight" onclick="openBetSlip('${safeName} (Yes)', ${item.yesPrice})">
                <div>${item.yesPrice}</div>
                ${item.yesSize !== '' ? `<div class="text-[9px] font-normal opacity-80">${item.yesSize}</div>` : ''}
           </button>`
        : `<button type="button" disabled class="market-suspended px-2.5 py-1 rounded font-bold text-[10px] leading-tight">${isSuspended ? 'SUSP' : '--'}</button>`;

    const badgeHtml = isSuspended
        ? `<span class="ml-1.5 px-1.5 py-0.5 text-[9px] rounded bg-red-100 text-red-700 font-semibold">${item.status}</span>`
        : '';

    return `
    <div class="bg-white p-2 rounded border border-gray-200 flex justify-between items-center shadow-xs" data-sid="${item.id || ''}">
        <div class="pr-2">
            <div class="font-bold text-gray-900 flex items-center flex-wrap">
                <span>${item.name}</span>
                ${badgeHtml}
            </div>
            <div class="text-[10px] text-gray-500">Min: ${minLabel} Max: ${maxLabel}</div>
        </div>
        <div class="flex space-x-1 shrink-0">
            ${noBtnHtml}
            ${yesBtnHtml}
        </div>
    </div>
    `;
}

function renderFancyMarkets(marketData) {
    const items = normalizeFancyItems(marketData);

    if (!items.length) {
        return `
        <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded">Fancy Markets</div>
        <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-3 text-center text-xs text-gray-500 shadow-sm">
            No live fancy markets available right now
        </div>
        `;
    }

    const order = ['Fancy / Session', 'Fancy1', 'Odd-Even', 'Meter'];
    const grouped = new Map();

    items.forEach((item) => {
        if (!grouped.has(item.category)) {
            grouped.set(item.category, []);
        }
        grouped.get(item.category).push(item);
    });

    const categoriesToRender = [
        ...order.filter((cat) => grouped.has(cat)),
        ...Array.from(grouped.keys()).filter((cat) => !order.includes(cat))
    ];

    return categoriesToRender.map((categoryName) => {
        const list = grouped.get(categoryName) || [];
        return `
        <div class="bg-teal-bar text-white px-3 py-1.5 font-bold text-xs rounded mt-2 first:mt-0">${categoryName}</div>
        <div class="bg-custom-navy border border-gray-200 rounded overflow-hidden p-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs shadow-sm">
            ${list.map(renderFancyCard).join('')}
        </div>
        `;
    }).join('');
}

module.exports = { renderFancyMarkets };
