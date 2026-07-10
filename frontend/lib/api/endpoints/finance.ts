import { apiClient } from '../client';

export const financeApi = {
  // Accounts
  getAccounts: (params?: any) => apiClient.get('/finance/api/accounts/', { params }),
  getAccountById: (id: string) => apiClient.get(`/finance/api/accounts/${id}/`),
  createAccount: (data: any) => apiClient.post('/finance/api/accounts/', data),
  updateAccount: (id: string, data: any) => apiClient.patch(`/finance/api/accounts/${id}/`, data),
  deleteAccount: (id: string) => apiClient.delete(`/finance/api/accounts/${id}/`),
  updateAccountBalance: (id: string, data: any) => apiClient.post(`/finance/api/accounts/${id}/update_balance/`, data),
  
  // Journal Entries
  getJournalEntries: (params?: any) => apiClient.get('/finance/api/journal-entries/', { params }),
  getJournalEntryById: (id: string) => apiClient.get(`/finance/api/journal-entries/${id}/`),
  createJournalEntry: (data: any) => apiClient.post('/finance/api/journal-entries/', data),
  
  // Cash Transactions
  getCashTransactions: (params?: any) => apiClient.get('/finance/api/cash-transactions/', { params }),
  createCashTransaction: (data: any) => apiClient.post('/finance/api/cash-transactions/', data),
  
  // Expenses
  getExpenses: (params?: any) => apiClient.get('/finance/api/expenses/', { params }),
  getExpenseById: (id: string) => apiClient.get(`/finance/api/expenses/${id}/`),
  createExpense: (data: any) => apiClient.post('/finance/api/expenses/', data),
  updateExpense: (id: string, data: any) => apiClient.patch(`/finance/api/expenses/${id}/`, data),
  deleteExpense: (id: string) => apiClient.delete(`/finance/api/expenses/${id}/`),
  
  // Incomes
  getIncomes: (params?: any) => apiClient.get('/finance/api/incomes/', { params }),
  getIncomeById: (id: string) => apiClient.get(`/finance/api/incomes/${id}/`),
  createIncome: (data: any) => apiClient.post('/finance/api/incomes/', data),
  updateIncome: (id: string, data: any) => apiClient.patch(`/finance/api/incomes/${id}/`, data),
  deleteIncome: (id: string) => apiClient.delete(`/finance/api/incomes/${id}/`),
  
  // Closings
  getClosings: (params?: any) => apiClient.get('/finance/api/closings/', { params }),
  getClosingById: (id: string) => apiClient.get(`/finance/api/closings/${id}/`),
  createTodayClosing: () => apiClient.post('/finance/api/closings/create_today/'),
  getClosingSummary: () => apiClient.get('/finance/api/closings/summary/'),
};

export default financeApi;