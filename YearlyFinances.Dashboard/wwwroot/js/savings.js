import { ApiClient } from './api.js';

export async function loadSavingsPageData() {
    const result = document.getElementById('calculateSavingsResult');
    result.innerHTML = '£0';
    window.handleSavingsCalculateSubmit = HandleSavingsCalculateSubmit;
    window.updateSavingNumberOfMonths = UpdateSavingNumberOfMonths;
}

export async function HandleSavingsCalculateSubmit(event) {
    event.preventDefault();
    const result = document.getElementById('calculateSavingsResult');
    const starting = document.getElementById('calculateStartingMoney');
    const amountToSave = document.getElementById('calculateAmoutToSave');
    const numberOfMonths = document.getElementById('calculateNumberOfMonths');

    result.innerHTML = '£' + (parseFloat(starting.value) + (parseFloat(amountToSave.value) * parseInt(numberOfMonths.value)));
}

export async function UpdateSavingNumberOfMonths(value) {
    const label = document.getElementById('calculateNumberOfMonthsLabel');
    if (label) {
        label.innerText = `${value} Months`;
    }
}
