import { loadItemsPageData } from './items.js';
import { loadCategoriesPageData } from './categories.js';
import { loadGroupsPageData } from './groups.js';
import { loadManagementCategories } from './dashboard.js';

export function switchView(viewName) {
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));

    const activePanel = document.getElementById(`view-panel-${viewName}`);
    if (activePanel) activePanel.classList.remove('hidden');

    document.querySelectorAll('#sidebarNav button').forEach(btn => {
        btn.className = "w-full text-left flex items-center space-x-3 px-4 py-2.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200 rounded-xl font-medium transition cursor-pointer";
    });

    const targetNavBtn = document.getElementById(`nav-${viewName}`);
    if (targetNavBtn) {
        targetNavBtn.className = "w-full text-left flex items-center space-x-3 px-4 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl font-medium transition cursor-pointer";
    }

    if (viewName === 'manage') loadManagementCategories();
    if (viewName === 'groups') loadGroupsPageData();
    if (viewName === 'items') loadItemsPageData();
    if (viewName === 'categories') loadCategoriesPageData();
}
