import { ApiClient } from './api.js';

export async function loadComparisonTimelineData() {
    const container = document.getElementById('compareAnalysisMatrixContainer');
    const containerGrp = document.getElementById('compareGrpAnalysisContainer');
    const labelLastYear = document.getElementById('compare2025TotalLabel');
    const labelThisYear = document.getElementById('compare2026TotalLabel');
    const labelVariance = document.getElementById('compareNetVarianceLabel');

    if (!container || !containerGrp || !labelLastYear || !labelThisYear || !labelVariance) return;
    container.innerHTML = '<div class="text-sm text-slate-600 text-center py-12">Compiling structural matrix data models...</div>';
    containerGrp.innerHTML = '<div class="text-sm text-slate-600 text-center py-12">Compiling structural matrix data models...</div>';

    try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const [paymentsLastYear, paymentsThisYear] = await Promise.all([
            ApiClient.getPaymentsByYear(previousYear),
            ApiClient.getPaymentsByYear(currentYear)
        ]);

        const totalLastYear = paymentsLastYear.reduce((sum, p) => sum + p.amount, 0);
        const totalThisYear = paymentsThisYear.reduce((sum, p) => sum + p.amount, 0);
        const netVariance = totalThisYear - totalLastYear;

        labelLastYear.innerText = `£${totalLastYear.toFixed(2)}`;
        labelThisYear.innerText = `£${totalThisYear.toFixed(2)}`;

        if (netVariance > 0) {
            labelVariance.innerText = `+£${netVariance.toFixed(2)} (Up)`;
            labelVariance.className = "text-2xl font-black mt-1 tracking-tight text-rose-400";
        } else if (netVariance < 0) {
            labelVariance.innerText = `-£${Math.abs(netVariance).toFixed(2)} (Down)`;
            labelVariance.className = "text-2xl font-black mt-1 tracking-tight text-emerald-400";
        } else {
            labelVariance.innerText = "£0.00";
            labelVariance.className = "text-2xl font-black mt-1 tracking-tight text-slate-400";
        }

        const itemMap = {};

        paymentsLastYear.forEach(p => {
            if (!itemMap[p.itemName]) itemMap[p.itemName] = { name: p.itemName, pLastYear: null, pThisYear: null, cat: p.categoryName, grp: p.groupName };
            itemMap[p.itemName].pLastYear = p;
        });

        paymentsThisYear.forEach(p => {
            if (!itemMap[p.itemName]) itemMap[p.itemName] = { name: p.itemName, pLastYear: null, pThisYear: null, cat: p.categoryName, grp: p.groupName };
            itemMap[p.itemName].pThisYear = p;
        });

        const sortedItems = Object.values(itemMap).sort((a, b) => {
            const dateA = a.pThisYear ? new Date(a.pThisYear.paymentDate) : new Date(a.pLastYear.paymentDate);
            const dateB = b.pThisYear ? new Date(b.pThisYear.paymentDate) : new Date(b.pLastYear.paymentDate);

            dateA.setFullYear(currentYear);
            dateB.setFullYear(currentYear);

            return dateA - dateB;
        });

        if (sortedItems.length === 0) {
            container.innerHTML = '<div class="text-sm text-slate-500 text-center py-12">No tracking profiles discoverable inside active records.</div>';
            return;
        }

        container.innerHTML = sortedItems.map(node => {
            let costBadgeHTML = '';
            let dateBadgeHTML = '';
            let statusBannerHTML = '';

            if (node.pLastYear && node.pThisYear) {
                const diff = node.pThisYear.amount - node.pLastYear.amount;
                if (diff > 0) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400">+£${diff.toFixed(2)}</span>`;
                } else if (diff < 0) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">-£${Math.abs(diff).toFixed(2)}</span>`;
                } else {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Stable</span>`;
                }

                const dLastYear = new Date(node.pLastYear.paymentDate);
                const dThisYear = new Date(node.pThisYear.paymentDate);

                dLastYear.setFullYear(currentYear);
                const timeDiff = dThisYear.getTime() - dLastYear.getTime();
                const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

                if (dayDiff > 0) {
                    dateBadgeHTML = `<span class="text-[10px] text-amber-400/80 font-medium">• ${dayDiff} days later</span>`;
                } else if (dayDiff < 0) {
                    dateBadgeHTML = `<span class="text-[10px] text-indigo-400/80 font-medium">• ${Math.abs(dayDiff)} days earlier</span>`;
                } else {
                    dateBadgeHTML = `<span class="text-[10px] text-slate-500 font-medium">• Same day</span>`;
                }

                statusBannerHTML = `<div class="text-right"><div class="text-xs font-bold text-slate-100">£${node.pThisYear.amount.toFixed(2)}</div><div class="text-[10px] text-slate-500 font-mono mt-0.5">Was £${node.pLastYear.amount.toFixed(2)}</div></div>`;
            }
            else if (node.pLastYear && !node.pThisYear) {
                costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">Scheduled / Owed</span>`;

                const dLastYear = new Date(node.pLastYear.paymentDate);
                const projectedDateStr = dLastYear.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

                dateBadgeHTML = `<span class="text-[10px] text-slate-500 font-medium">• Expect around ${projectedDateStr}</span>`;
                statusBannerHTML = `<div class="text-right"><div class="text-xs font-bold text-amber-500/80">Pending</div><div class="text-[10px] text-slate-500 font-mono mt-0.5">Est: £${node.pLastYear.amount.toFixed(2)}</div></div>`;
            }
            else if (!node.pLastYear && node.pThisYear) {
                costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">New Addition</span>`;
                dateBadgeHTML = `<span class="text-[10px] text-slate-500 font-medium">• First logged tracking milestone</span>`;
                statusBannerHTML = `<div class="text-right"><div class="text-xs font-bold text-indigo-400">£${node.pThisYear.amount.toFixed(2)}</div><div class="text-[10px] text-slate-500 font-mono mt-0.5">No benchmark</div></div>`;
            }

            return `
                <div class="flex justify-between items-center p-3.5 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-slate-700/60 transition group">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-sm text-slate-200 group-hover:text-indigo-400 transition">${node.name}</span>
                            ${costBadgeHTML}
                        </div>
                        <div class="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 flex-wrap">
                            <span class="bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">${node.cat.toUpperCase()}</span>
                            ${node.grp !== "Unassigned" ? `<span class="bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">${node.grp.toUpperCase()}</span>` : ``}
                            ${dateBadgeHTML}
                        </div>
                    </div>
                    ${statusBannerHTML}
                </div>
            `;
        }).join('');

        const groupMap = Object.values(itemMap).reduce((acc, node) => {
            const groupName = node.grp || "Unassigned";

            if (!acc[groupName]) {
                acc[groupName] = {
                    name: groupName,
                    amountLastYear: 0,
                    amountThisYear: 0,
                    itemCount: 0,
                    hasLastYear: false,
                    hasThisYear: false
                };
            }

            if (node.pLastYear) {
                acc[groupName].amountLastYear += node.pLastYear.amount;
                acc[groupName].hasLastYear = true;
            }
            if (node.pThisYear) {
                acc[groupName].amountThisYear += node.pThisYear.amount;
                acc[groupName].hasThisYear = true;
            }

            acc[groupName].itemCount++;
            return acc;
        }, {});

        const sortedGroups = Object.values(groupMap).sort((a, b) => a.name.localeCompare(b.name));

        if (sortedGroups.length === 0) {
            containerGrp.innerHTML = '<div class="text-sm text-slate-500 text-center py-12">No tracking groups discoverable inside active records.</div>';
            return;
        }

        containerGrp.innerHTML = sortedGroups.map(grp => {
            let costBadgeHTML = '';
            let itemBadgeHTML = `<span class="text-[10px] text-slate-500 font-medium">${grp.itemCount} ${grp.itemCount === 1 ? 'item' : 'items'}</span>`;
            let statusBannerHTML = '';

            if (grp.hasLastYear && grp.hasThisYear) {
                const diff = grp.amountThisYear - grp.amountLastYear;
                if (diff > 0) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400">+£${diff.toFixed(2)}</span>`;
                } else if (diff < 0) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">-£${Math.abs(diff).toFixed(2)}</span>`;
                } else {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Stable</span>`;
                }

                statusBannerHTML = `
                    <div class="text-right">
                        <div class="text-xs font-bold text-slate-100">£${grp.amountThisYear.toFixed(2)}</div>
                        <div class="text-[10px] text-slate-500 font-mono mt-0.5">Was £${grp.amountLastYear.toFixed(2)}</div>
                    </div>`;
                }
                else if (grp.hasLastYear && !grp.hasThisYear) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">Pending Group</span>`;
                    statusBannerHTML = `
                        <div class="text-right">
                            <div class="text-xs font-bold text-amber-500/80">Pending</div>
                            <div class="text-[10px] text-slate-500 font-mono mt-0.5">Est: £${grp.amountLastYear.toFixed(2)}</div>
                        </div>
                    `;
                }
                else if (!grp.hasLastYear && grp.hasThisYear) {
                    costBadgeHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">New Group</span>`;
                    statusBannerHTML = `
                        <div class="text-right">
                            <div class="text-xs font-bold text-indigo-400">£${grp.amountThisYear.toFixed(2)}</div>
                            <div class="text-[10px] text-slate-500 font-mono mt-0.5">No benchmark</div>
                        </div>
                    `;
                }

            return `
                <div class="flex justify-between items-center p-3.5 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-slate-700/60 transition group">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-sm text-slate-200 group-hover:text-indigo-400 transition">${grp.name}</span>
                            ${costBadgeHTML}
                        </div>
                        <div class="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 flex-wrap">
                            ${itemBadgeHTML}
                        </div>
                    </div>
                    ${statusBannerHTML}
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="text-sm text-rose-400 text-center py-12">Error generating comparison audit models.</div>';
    }
}
