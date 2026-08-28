import { switchView } from './js/router.js';
import { ApiClient } from './js/api.js';
import { stitchUiComponents } from './js/componentLoader.js';
import * as Dashboard from './js/dashboard.js';

document.addEventListener('DOMContentLoaded', async () => {
    await stitchUiComponents();
    initializeDashboard();

    document.getElementById('yearSelector').addEventListener('change', (e) => {
        Dashboard.loadPaymentLogs(parseInt(e.target.value));
    });
});

async function initializeDashboard() {
    try {
        await Promise.all([
            Dashboard.loadForecastMetrics(),
            Dashboard.loadVarianceAndMeters(),
            Dashboard.loadPaymentLogs(2026),
            Dashboard.loadManagementCategories(),
            Dashboard.loadUpcomingBillAlerts()
        ]);
    } catch (err) {
        console.error(err);
    }
}

window.switchView = switchView;

window.openPaymentModal = function () {
    document.getElementById('formDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paymentModal').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('paymentModal').classList.remove('opacity-0');
        document.getElementById('modalBox').classList.remove('scale-95');
    }, 10);
    Dashboard.populateFormItemsDropdown();
};

window.closePaymentModal = function () {
    document.getElementById('paymentModal').classList.add('opacity-0');
    document.getElementById('modalBox').classList.add('scale-95');
    setTimeout(() => {
        document.getElementById('paymentModal').classList.add('hidden');
        document.getElementById('paymentForm').reset();
    }, 300);
};

window.handleFormSubmit = async function (event) {
    event.preventDefault();
    const payload = {
        itemId: parseInt(document.getElementById('formItemId').value),
        amount: parseFloat(document.getElementById('formAmount').value),
        paymentDate: new Date(document.getElementById('formDate').value).toISOString()
    };
    try {
        await ApiClient.createPayment(payload);
        window.closePaymentModal();
        await initializeDashboard();
    } catch (err) {
        alert('Failed to save payment.');
    }
};

window.handleCategoryCreateSubmit = async function (event) {
    event.preventDefault();
    const nameInput = document.getElementById('manageCategoryName');
    try {
        await ApiClient.createCategory(nameInput.value);
        nameInput.value = '';
        await Dashboard.loadManagementCategories();
        alert('Category added successfully!');
    } catch (err) {
        alert('Error saving category.');
    }
};

window.handleItemCreateSubmit = async function (event) {
    event.preventDefault();
    const groupSelectValue = document.getElementById('manageItemGroupId').value;
    const payload = {
        categoryId: parseInt(document.getElementById('manageItemCategoryId').value),
        groupId: groupSelectValue ? parseInt(groupSelectValue) : null,
        name: document.getElementById('manageItemName').value,
        description: document.getElementById('manageItemDesc').value
    };
    try {
        await ApiClient.createItem(payload);
        document.getElementById('manageItemName').value = '';
        document.getElementById('manageItemDesc').value = '';
        document.getElementById('manageItemGroupId').value = '';
        alert('Asset item registered!');
    } catch (err) {
        alert('Error registering item.');
    }
};
