import { ApiClient } from './api.js';

export async function loadItemsPageData() {
    const listContainer = document.getElementById('itemsNavList');
    if (!listContainer) return;
    listContainer.innerHTML = '<div class="text-xs text-slate-600 p-2">Loading items...</div>';

    try {
        const categories = await ApiClient.getCategories();
        let allItems = [];

        const fetches = categories.map(c => ApiClient.getCategoryItems(c.id));
        const results = await Promise.all(fetches);
        results.forEach(itemList => allItems = allItems.concat(itemList));

        if (allItems.length === 0) {
            listContainer.innerHTML = '<div class="text-xs text-slate-500 p-2">No tracked items found.</div>';
            return;
        }

        window.loadSpecificItemHistory = loadSpecificItemHistory;

        listContainer.innerHTML = allItems.map(item => `
            <button onclick="window.loadSpecificItemHistory(${item.id}, '${item.name}')" class="w-full text-left text-xs font-medium px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl block transition cursor-pointer">
                • ${item.name}
            </button>
        `).join('');
    } catch (err) {
        listContainer.innerHTML = '<div class="text-xs text-rose-400 p-2">Error loading asset list.</div>';
    }
}

export async function loadSpecificItemHistory(itemId, itemName) {
    document.getElementById('itemDetailHeader').innerText = `Statement History: ${itemName}`;
    const container = document.getElementById('itemPaymentsHistoryContainer');
    if (!container) return;
    container.innerHTML = '<div class="text-sm text-slate-600 text-center py-8">Fetching records...</div>';

    try {
        const payments = await ApiClient.getPaymentsByItem(itemId);
        if (payments.length === 0) {
            container.innerHTML = '<div class="text-sm text-slate-500 text-center py-12">No historical payments recorded for this asset.</div>';
            return;
        }
        container.innerHTML = payments.map(p => {
            const dateStr = new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            return `
                <div class="flex justify-between items-center p-3.5 bg-slate-900 rounded-xl border border-slate-800/80">
                    <div>
                        <div class="text-xs text-slate-400 font-medium">${dateStr}</div>
                        <div class="text-[10px] text-slate-500 font-mono mt-0.5">${p.groupName || 'Unassigned Group'}</div>
                    </div>
                    <div class="text-base font-bold text-slate-200">£${p.amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<div class="text-sm text-rose-400 text-center py-8">Error loading statements.</div>';
    }
}
