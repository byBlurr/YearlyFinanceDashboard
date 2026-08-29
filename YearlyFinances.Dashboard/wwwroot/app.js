import { switchView } from './js/router.js';
import { ApiClient } from './js/api.js';
import { stitchUiComponents } from './js/componentLoader.js';
import * as Dashboard from './js/dashboard.js';

let currentGlobalCurrencySymbol = "£";
let currentGlobalAlertDaysThreshold = 30;

document.addEventListener('DOMContentLoaded', async () => {
    await stitchUiComponents();

    loadAndApplyCachedSettings();
    initializeDashboard();

    const yearSel = document.getElementById('yearSelector');
    if (yearSel) {
        yearSel.addEventListener('change', (e) => {
            Dashboard.loadPaymentLogs(parseInt(e.target.value));
        });
    }
});

async function initializeDashboard() {
    try {
        await Promise.all([
            Dashboard.loadForecastMetrics(),
            Dashboard.loadVarianceAndMeters(),
            Dashboard.loadPaymentLogs(2026),
            Dashboard.loadManagementCategories(),
            Dashboard.loadUpcomingBillAlerts(currentGlobalAlertDaysThreshold)
        ]);

        applyCurrencyToTextElements(currentGlobalCurrencySymbol);
    } catch (err) {
        console.error(err);
    }
}

function loadAndApplyCachedSettings() {
    const cachedPrivacy = localStorage.getItem('finTrack_privacyMode') === 'true';
    currentGlobalCurrencySymbol = localStorage.getItem('finTrack_currencySymbol') || "£";
    currentGlobalAlertDaysThreshold = parseInt(localStorage.getItem('finTrack_alertDaysThreshold')) || 30;

    const privacyCb = document.getElementById('settingsPrivacyModeCheckbox');
    const currencySel = document.getElementById('settingsCurrencySelect');
    const alertSlider = document.getElementById('settingsAlertDaysSlider');
    const alertLabel = document.getElementById('settingsAlertDaysLabel');

    if (privacyCb) privacyCb.checked = cachedPrivacy;
    if (currencySel) currencySel.value = currentGlobalCurrencySymbol;
    if (alertSlider) alertSlider.value = currentGlobalAlertDaysThreshold;
    if (alertLabel) alertLabel.innerText = `${currentGlobalAlertDaysThreshold} Days`;

    window.togglePrivacyMaskMode(cachedPrivacy, false);
}

function applyCurrencyToTextElements(chosenSymbol) {
    const spentBox = document.getElementById('spentYtdTxt');
    const projBox = document.getElementById('projectedTxt');
    const totalBox = document.getElementById('totalTxt');
    const lastYearTotalBox = document.getElementById('lastYearTotalTxt');
    const lastYrLabel = document.getElementById('lastYearYtdLabel');
    const thisYrLabel = document.getElementById('thisYearYtdLabel');

    if (spentBox) spentBox.innerText = spentBox.innerText.replace(/[£€$]/g, chosenSymbol);
    if (projBox) projBox.innerText = projBox.innerText.replace(/[£€$]/g, chosenSymbol);
    if (totalBox) totalBox.innerText = totalBox.innerText.replace(/[£€$]/g, chosenSymbol);
    if (lastYearTotalBox) lastYearTotalBox.innerText = lastYearTotalBox.innerText.replace(/[£€$]/g, chosenSymbol);
    if (lastYrLabel) lastYrLabel.innerText = lastYrLabel.innerText.replace(/[£€$]/g, chosenSymbol);
    if (thisYrLabel) thisYrLabel.innerText = thisYrLabel.innerText.replace(/[£€$]/g, chosenSymbol);
}

window.switchView = switchView;

window.openPaymentModal = function () {
    const dateInput = document.getElementById('formDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('hidden');
    setTimeout(() => {
        const modalInner = document.getElementById('paymentModal');
        const box = document.getElementById('modalBox');
        if (modalInner) modalInner.classList.remove('opacity-0');
        if (box) box.classList.remove('scale-95');
    }, 10);
    Dashboard.populateFormItemsDropdown();
};

window.closePaymentModal = function () {
    const modal = document.getElementById('paymentModal');
    const box = document.getElementById('modalBox');
    if (modal) modal.classList.add('opacity-0');
    if (box) box.classList.add('scale-95');
    setTimeout(() => {
        if (modal) modal.classList.add('hidden');
        const form = document.getElementById('paymentForm');
        if (form) form.reset();
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

window.togglePrivacyMaskMode = function (isMaskedEnabled, saveToCache = true) {
    const dashboardContainer = document.getElementById('view-panel-dashboard');
    if (!dashboardContainer) return;

    if (saveToCache) localStorage.setItem('finTrack_privacyMode', isMaskedEnabled);

    const spentTxt = document.getElementById('spentYtdTxt');
    const projTxt = document.getElementById('projectedTxt');
    const totalTxt = document.getElementById('totalTxt');

    if (isMaskedEnabled) {
        dashboardContainer.classList.add('privacy-masked-active');
        if (!document.getElementById('privacy-mask-css-rules')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = "privacy-mask-css-rules";
            styleSheet.innerText = `
                .privacy-masked-active #spentYtdTxt, 
                .privacy-masked-active #projectedTxt, 
                .privacy-masked-active #totalTxt,
                .privacy-masked-active #lastYearYtdLabel,
                .privacy-masked-active #thisYearYtdLabel {
                    font-family: monospace !important;
                    letter-spacing: -2px;
                    color: #64748b !important;
                }
            `;
            document.head.appendChild(styleSheet);
        }

        if (spentTxt && projTxt && totalTxt) {
            if (!spentTxt.getAttribute('data-orig')) spentTxt.setAttribute('data-orig', spentTxt.innerText);
            spentTxt.innerText = "£•••••";
            if (!projTxt.getAttribute('data-orig')) projTxt.setAttribute('data-orig', projTxt.innerText);
            projTxt.innerText = "£•••••";
            if (!totalTxt.getAttribute('data-orig')) totalTxt.setAttribute('data-orig', totalTxt.innerText);
            totalTxt.innerText = "£•••••";
        }
    } else {
        dashboardContainer.classList.remove('privacy-masked-active');
        const activeRules = document.getElementById('privacy-mask-css-rules');
        if (activeRules) activeRules.remove();

        if (spentTxt && spentTxt.getAttribute('data-orig')) spentTxt.innerText = spentTxt.getAttribute('data-orig');
        if (projTxt && projTxt.getAttribute('data-orig')) projTxt.innerText = projTxt.getAttribute('data-orig');
        if (totalTxt && totalTxt.getAttribute('data-orig')) totalTxt.innerText = totalTxt.getAttribute('data-orig');
    }
};

window.updateGlobalCurrencySymbol = function (chosenSymbol) {
    currentGlobalCurrencySymbol = chosenSymbol;
    localStorage.setItem('finTrack_currencySymbol', chosenSymbol);

    const kpiCardsRow = document.getElementById('view-panel-dashboard');
    if (!kpiCardsRow) return;

    Dashboard.loadForecastMetrics().then(() => {
        Dashboard.loadVarianceAndMeters();
        applyCurrencyToTextElements(chosenSymbol);
    });
};

window.updateAlertTimeframeDays = function (selectedDaysAmount) {
    currentGlobalAlertDaysThreshold = parseInt(selectedDaysAmount);
    localStorage.setItem('finTrack_alertDaysThreshold', currentGlobalAlertDaysThreshold);

    const textLabel = document.getElementById('settingsAlertDaysLabel');
    if (textLabel) textLabel.innerText = `${selectedDaysAmount} Days`;

    Dashboard.loadUpcomingBillAlerts(currentGlobalAlertDaysThreshold);
};





async function runDatabaseHealthMonitorCycle() {
    const container = document.getElementById('sidebarSystemStatusContainer');
    if (!container) return;

    try {
        const health = await ApiClient.checkDatabaseHealth();

        container.innerHTML = `
            <div class="flex flex-col gap-0.5">
                <div class="text-emerald-400 font-semibold flex items-center gap-2 transition">
                    <span class="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse"></span>
                    Database Connected
                </div>
                <div class="text-[10px] text-slate-500 font-sans pl-4">Latency: ${health.latencyMs}ms • .NET 10 App Engine</div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="flex flex-col gap-0.5">
                <div class="text-rose-400 font-bold flex items-center gap-2 tracking-wide">
                    <span class="h-2 w-2 bg-rose-600 rounded-full shadow-[0_0_8px_#f43f5e] animate-ping"></span>
                    DATABASE OFFLINE
                </div>
                <div class="text-[10px] text-rose-500/80 font-sans pl-4">Network Bridge Connection Refused</div>
            </div>
        `;
    }
}

const originalInitializeDashboard = initializeDashboard;
initializeDashboard = async function () {
    await originalInitializeDashboard();
    runDatabaseHealthMonitorCycle();
    setInterval(runDatabaseHealthMonitorCycle, 10000);
};