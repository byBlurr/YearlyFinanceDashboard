import { ApiClient } from './api.js';

export async function loadSavingsPageData() {
    result.innerHTML = '£0';
}

export function HandleSavingsCalculateSubmit(event) {
    event.preventDefault();
    const result = document.getElementById('calculateSavingsResult');
    const starting = document.getElementById('calculateStartingMoney');
    const amountToSave = document.getElementById('calculateAmoutToSave');
    const numberOfMonths = document.getElementById('calculateNumberOfMonths');

    result.innerHTML = '£' + (parseFloat(starting.value) + (parseFloat(amountToSave.value) * parseInt(numberOfMonths.value)));
}

export function UpdateSavingNumberOfMonths(value) {
    const label = document.getElementById('calculateNumberOfMonthsLabel');
    if (label) {
        label.innerText = `${value} Months`;
    }
}
