import { ApiClient } from './api.js';

export async function loadCategoriesPageData() {
    const listContainer = document.getElementById('categoriesNavList');
    if (!listContainer) return;
    listContainer.innerHTML = '<div class="text-xs text-slate-600 p-2">Loading categories...</div>';

    try {
        const categories = await ApiClient.getCategories();
        if (categories.length === 0) {
            listContainer.innerHTML = '<div class="text-xs text-slate-500 p-2">No categories created.</div>';
            return;
        }

        window.loadSpecificCategoryMembers = loadSpecificCategoryMembers;

        listContainer.innerHTML = categories.map(c => `
            <button onclick="window.loadSpecificCategoryMembers(${c.id}, '${c.name}')" class="w-full text-left text-xs font-medium px-3 py-2 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl block transition cursor-pointer">
                folder/ ${c.name}
            </button>
        `).join('');
    } catch (err) {
        listContainer.innerHTML = '<div class="text-xs text-rose-400 p-2">Error loading groupings.</div>';
    }
}

export async function loadSpecificCategoryMembers(categoryId, categoryName) {
    document.getElementById('categoryDetailHeader').innerText = `Category Assets: ${categoryName}`;
    const container = document.getElementById('categoryItemsContainer');
    if (!container) return;
    container.innerHTML = '<div class="text-sm text-slate-600 text-center py-12 md:col-span-2">Filtering member nodes...</div>';

    try {
        const items = await ApiClient.getCategoryItems(categoryId);
        if (items.length === 0) {
            container.innerHTML = '<div class="text-sm text-slate-500 text-center py-12 md:col-span-2">No active items assigned.</div>';
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl relative group">
                <div class="font-bold text-sm text-slate-200">${item.name}</div>
                <p class="text-xs text-slate-500 mt-1">${item.description || 'No description configured.'}</p>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<div class="text-sm text-rose-400 text-center py-12 md:col-span-2">Error pulling member lists.</div>';
    }
}
