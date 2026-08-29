export const ApiClient = {
    async getForecast() {
        const res = await fetch('/api/dashboard/forecast');
        if (!res.ok) throw new Error('Forecast fetch failure');
        return res.json();
    },

    async getVariance() {
        const res = await fetch('/api/dashboard/variance');
        if (!res.ok) throw new Error('Variance fetch failure');
        return res.json();
    },

    async getPaymentsByYear(year) {
        const res = await fetch(`/api/payments/${year}`);
        if (!res.ok) throw new Error('Yearly payments fetch failure');
        return res.json();
    },

    async getPaymentsByItem(itemId) {
        const res = await fetch(`/api/items/${itemId}/payments`);
        if (!res.ok) throw new Error('Item payments ledger fetch failure');
        return res.json();
    },

    async getCategories() {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Categories collection fetch failure');
        return res.json();
    },

    async getCategoryItems(categoryId) {
        const res = await fetch(`/api/categories/${categoryId}/items`);
        if (!res.ok) throw new Error('Category member items fetch failure');
        return res.json();
    },

    async getGroups() {
        const res = await fetch('/api/groups');
        if (!res.ok) throw new Error('Groups centre array fetch failure');
        return res.json();
    },

    async createPayment(payload) {
        const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Transaction submission failure');
        return res.json();
    },

    async createCategory(name) {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Category creation failure');
        return res.json();
    },

    async createItem(payload) {
        const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Asset deployment item creation failure');
        return res.json();
    },

    async checkDatabaseHealth() {
        const res = await fetch('/api/health/database');
        if (!res.ok) throw new Error('Database unreachable');
        return res.json();
    }
};
