import { ApiClient } from './api.js';

let globalGroupsCache = [];

export async function loadForecastMetrics() {
    try {
        const data = await ApiClient.getForecast();

        document.getElementById('spentYtdTxt').innerText = `£${data.thisYearSoFar.toFixed(2)}`;
        document.getElementById('projectedTxt').innerText = `£${data.remainingProjected.toFixed(2)}`;
        document.getElementById('totalTxt').innerText = `£${data.forecastedYearlyTotal.toFixed(2)}`;

        const lastYearTotalCard = document.getElementById('lastYearTotalTxt');
        if (lastYearTotalCard) {
            lastYearTotalCard.innerText = `£${data.lastYearGrandTotal.toFixed(2)}`;
        }

        const thisYearLabel = document.getElementById('thisYearYtdLabel');
        if (thisYearLabel) {
            thisYearLabel.innerText = `£${data.thisYearSoFar.toFixed(2)}`;
        }

        if (data.forecastedYearlyTotal > 0) {
            const spentPercentage = (data.thisYearSoFar / data.forecastedYearlyTotal) * 100;
            const progressLabel = document.getElementById('progressPercentageLabel');
            const progressBar = document.getElementById('progressMeterBar');

            if (progressLabel) progressLabel.innerText = `${spentPercentage.toFixed(0)}%`;
            if (progressBar) {
                progressBar.style.setProperty('width', `${spentPercentage}%`, 'important');
                progressBar.style.width = `${spentPercentage}%`;
            }
        }
    } catch (err) {
        console.error('Forecast render error:', err);
    }
}

export async function loadVarianceAndMeters() {
    try {
        const varianceData = await ApiClient.getVariance();
        const forecastData = await ApiClient.getForecast();

        const lastYearLabel = document.getElementById('lastYearYtdLabel');
        if (lastYearLabel) {
            lastYearLabel.innerText = `£${varianceData.lastYearYtdTotal.toFixed(2)}`;
        }

        const badge = document.getElementById('varianceBadge');
        if (badge && varianceData.lastYearYtdTotal > 0) {
            const absorptionPercentage = (forecastData.thisYearSoFar / varianceData.lastYearYtdTotal) * 100;

            badge.innerText = `${absorptionPercentage.toFixed(1)}%`;

            if (absorptionPercentage > 100) {
                badge.className = 'font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded';
            } else {
                badge.className = 'font-semibold text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded';
            }
        }
    } catch (err) {
        console.error('Variance render error:', err);
    }
}


export async function loadPaymentLogs(year) {
    const container = document.getElementById('paymentLogsContainer');
    if (!container) return;
    try {
        const payments = await ApiClient.getPaymentsByYear(year);
        if (payments.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-500 text-center py-8">No payments recorded for ${year}.</div>`;
            return;
        }
        container.innerHTML = payments.map(p => {
            const dateStr = new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            return `
                <div class="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800/40 hover:border-slate-700/60 transition group">
                    <div>
                        <div class="font-medium text-sm text-slate-200 group-hover:text-white transition">${p.itemName}</div>
                        <div class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span class="inline-block px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-md font-mono">${p.categoryName}</span>
                            <span class="text-slate-400 font-medium">${p.groupName}</span>
                            <span>• ${dateStr}</span>
                        </div>
                    </div>
                    <div class="font-semibold text-sm text-slate-100">£${p.amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `<div class="text-xs text-rose-400 text-center py-8">Failed to download transaction lists.</div>`;
    }
}

export async function loadManagementCategories() {
    const manageCatDropdown = document.getElementById('manageItemCategoryId');
    const manageGroupDropdown = document.getElementById('manageItemGroupId');
    const groupBuilderCatDropdown = document.getElementById('manageGroupCategoryId');
    if (!manageCatDropdown || !manageGroupDropdown) return;

    try {
        const [categories, groups] = await Promise.all([ApiClient.getCategories(), ApiClient.getGroups()]);
        globalGroupsCache = groups;

        const catOptionsHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        manageCatDropdown.innerHTML = '<option value="" disabled selected>Choose category group...</option>' + catOptionsHTML;

        if (groupBuilderCatDropdown) {
            groupBuilderCatDropdown.innerHTML = '<option value="" disabled selected>Assign parent category...</option>' + catOptionsHTML;
        }

        manageGroupDropdown.innerHTML = '<option value="">None / Unassigned (Manual Category Mode)</option>' +
            groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    } catch (err) {
        console.error(err);
    }
}

export async function populateFormItemsDropdown() {
    const dropdown = document.getElementById('formItemId');
    try {
        const categories = await ApiClient.getCategories();
        let allItems = [];
        const fetches = categories.map(c => ApiClient.getCategoryItems(c.id));
        const results = await Promise.all(fetches);
        results.forEach(itemList => allItems = allItems.concat(itemList));

        dropdown.innerHTML = '<option value="" disabled selected>Select an item...</option>' +
            allItems.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    } catch (err) {
        dropdown.innerHTML = '<option value="" disabled>Error loading assets</option>';
    }
}

export async function loadUpcomingBillAlerts(customDays = 30) {
    const bannerContainer = document.getElementById('upcomingAlertsBannerContainer');
    if (!bannerContainer) return;
    try {
        const res = await fetch('/api/dashboard/alerts');
        if (!res.ok) throw new Error();
        const allAlerts = await res.json();

        const alerts = allAlerts.filter(bill => bill.daysRemaining <= customDays);

        if (alerts.length === 0) {
            bannerContainer.classList.add('hidden');
            return;
        }

        bannerContainer.classList.remove('hidden');
        bannerContainer.innerHTML = `
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <span class="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                    Attention Required: Upcoming Renewals (Next ${customDays} Days)
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${alerts.map(bill => {
            const dateStr = new Date(bill.estimatedDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            return `
                            <div class="bg-slate-950/60 border border-amber-500/10 rounded-xl p-3 flex justify-between items-center group hover:border-amber-500/30 transition">
                                <div>
                                    <div class="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">${bill.itemName}</div>
                                    <div class="text-[10px] text-slate-500 font-mono mt-0.5">${bill.categoryName.toUpperCase()} • Due ${dateStr}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs font-black text-amber-400">£${bill.estimatedAmount.toFixed(2)}</div>
                                    <div class="text-[9px] font-medium text-slate-400 mt-0.5">${bill.daysRemaining} days left</div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
    }
}

window.handleFormGroupSelectionChange = function (selectedGroupId) {
    const catDropdown = document.getElementById('manageItemCategoryId');
    if (!catDropdown || !selectedGroupId) return;

    const matchedGroup = globalGroupsCache.find(g => g.id === parseInt(selectedGroupId));
    if (matchedGroup) {
        catDropdown.value = matchedGroup.categoryId;
    }
};
