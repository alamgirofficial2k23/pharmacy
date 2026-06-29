const BASE = 'https://pharmacy.shohozvibe.com/api';

function getToken() {
  return localStorage.getItem('pharmacy_token');
}

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'কিছু একটা সমস্যা হয়েছে');
  return data;
}

export const api = {
  login: (body) => req('/auth/login.php', { method: 'POST', body: JSON.stringify(body) }),

  getSummary: (date) => req(`/summary/index.php?date=${date}`),

  getSales: (date) => req(`/sales/index.php?date=${date}`),
  addSale: (body) => req('/sales/index.php', { method: 'POST', body: JSON.stringify(body) }),
  deleteSale: (id) => req(`/sales/index.php?id=${id}`, { method: 'DELETE' }),

  getExpenses: (date) => req(`/expenses/index.php?date=${date}`),
  addExpense: (body) => req('/expenses/index.php', { method: 'POST', body: JSON.stringify(body) }),
  deleteExpense: (id) => req(`/expenses/index.php?id=${id}`, { method: 'DELETE' }),

  getPurchases: (date) => req(`/purchases/index.php?date=${date}`),
  addPurchase: (body) => req('/purchases/index.php', { method: 'POST', body: JSON.stringify(body) }),
  deletePurchase: (id) => req(`/purchases/index.php?id=${id}`, { method: 'DELETE' }),

  getDaily: (date) => req(`/daily/index.php?date=${date}`),
  saveDaily: (body) => req('/daily/index.php', { method: 'POST', body: JSON.stringify(body) }),

  getReport: (from, to) => req(`/report/index.php?from=${from}&to=${to}`),
};
