import { ApiClient } from './api.js';

export async function loadGroupsPageData() {
    const listContainer = document.getElementById('groupsNavList');
    if (!listContainer) return;
    listContainer.innerHTML = '<div class="text-xs text-slate-600 p-2">Loading asset groups...</div>';
    try {
        const groups = await ApiClient.getGroups();
        if (groups.length === 0) {
            listContainer.innerHTML = '<div class="text-xs text-slate-500 p-2">No groups created.</div>';
            return;
        }

        window.loadSpecificGroupSummary = loadSpecificGroupSummary;

        listContainer.innerHTML = groups.map(g => `
            <button onclick="window.loadSpecificGroupSummary(${g.id}, '${g.name}')" class="w-full text-left text-xs font-medium px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl block transition cursor-pointer">
                📦 ${g.name}
            </button>
        `).join('');
    } catch (err) {
        listContainer.innerHTML = '<div class="text-xs text-rose-400 p-2">Error loading groupings.</div>';
    }
}

export async function loadSpecificGroupSummary(groupId, groupName) {
    document.getElementById('groupDetailHeader').innerText = `Combined Group Ledger Statement: ${groupName}`;
    const ledgerContainer = document.getElementById('groupPaymentsContainer');
    const totalLabel = document.getElementById('groupAggregatedTotalTxt');
    const thisYearLabel = document.getElementById('groupThisYearTotalTxt');
    const lastYearLabel = document.getElementById('groupLastYearTotalTxt');

    if (!ledgerContainer || !totalLabel || !thisYearLabel || !lastYearLabel) return;
    ledgerContainer.innerHTML = '<div class="text-sm text-slate-600 text-center py-8">Calculating aggregates...</div>';

    try {
        const res = await fetch(`/api/groups/${groupId}/payments`);
        if (!res.ok) throw new Error();
        const filteredPayments = await res.json();

        if (filteredPayments.length === 0) {
            totalLabel.innerText = '£0.00';
            thisYearLabel.innerText = '£0.00';
            lastYearLabel.innerText = '£0.00';
            ledgerContainer.innerHTML = '<div class="text-sm text-slate-500 text-center py-12">No transactions logged under this asset package group.</div>';
            return;
        }

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const grandSum = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

        const thisYearSum = filteredPayments
            .filter(p => new Date(p.paymentDate).getFullYear() === currentYear)
            .reduce((acc, p) => acc + p.amount, 0);

        const lastYearSum = filteredPayments
            .filter(p => new Date(p.paymentDate).getFullYear() === previousYear)
            .reduce((acc, p) => acc + p.amount, 0);

        totalLabel.innerText = `£${grandSum.toFixed(2)}`;
        thisYearLabel.innerText = `£${thisYearSum.toFixed(2)}`;
        lastYearLabel.innerText = `£${lastYearSum.toFixed(2)}`;

        ledgerContainer.innerHTML = filteredPayments.map(p => {
            const dateStr = new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
                <div class="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-slate-700/60 transition group">
                    <div>
                        <div class="font-medium text-sm text-slate-200 group-hover:text-white transition">${p.itemName}</div>
                        <div class="text-[10px] text-slate-500 font-mono mt-0.5">${p.categoryName.toUpperCase()} • ${dateStr}</div>
                    </div>
                    <div class="font-bold text-sm text-slate-100">£${p.amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        ledgerContainer.innerHTML = '<div class="text-sm text-rose-400 text-center py-8">Error mapping financial packages.</div>';
    }
}
