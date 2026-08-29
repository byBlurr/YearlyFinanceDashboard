async function loadComponent(elementId, componentPath) {
    const container = document.getElementById(elementId);
    if (!container) {
        console.error(`Component mounting target element not found: ${elementId}`);
        return;
    }

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`HTTP error downloading chunk status: ${response.status}`);

        const htmlContent = await response.text();
        container.innerHTML = htmlContent;
    } catch (error) {
        console.error(`Failed stitching template block component: ${componentPath}`, error);
        container.innerHTML = `<div class="p-4 text-xs text-rose-400 border border-rose-900 bg-rose-950/20 rounded-xl">Template payload extraction error.</div>`;
    }
}

export async function stitchUiComponents() {
    await Promise.all([
        loadComponent('component-sidebar', '/components/sidebar.html'),
        loadComponent('component-modal', '/components/modal.html')
    ]);

    await Promise.all([
        loadComponent('view-panel-dashboard', '/components/dashboardView.html'),
        loadComponent('view-panel-compare', '/components/compareView.html'),
        loadComponent('view-panel-groups', '/components/groupsView.html'),
        loadComponent('view-panel-items', '/components/itemsView.html'),
        loadComponent('view-panel-categories', '/components/categoriesView.html'),
        loadComponent('view-panel-manage', '/components/manageView.html'),
        loadComponent('view-panel-settings', '/components/settingsView.html')
    ]);

}
