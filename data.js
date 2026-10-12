export const STORAGE_KEYS = {
  books: 'commonplace.books',
  users: 'commonplace.users',
  transactions: 'commonplace.transactions',
  session: 'commonplace.session',
};

export const initialBooks = [
  { id: 'b-1', title: 'The Creative Act', author: 'Rick Rubin', genre: 'Arts & Culture', isbn: '978-0-593-53824-0', quantity: 4 },
  { id: 'b-2', title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', genre: 'Nature', isbn: '978-1-57131-356-0', quantity: 1 },
  { id: 'b-3', title: 'The Midnight Library', author: 'Matt Haig', genre: 'Fiction', isbn: '978-0-525-55947-4', quantity: 6 },
  { id: 'b-4', title: 'Crying in H Mart', author: 'Michelle Zauner', genre: 'Memoir', isbn: '978-0-525-53973-0', quantity: 0 },
  { id: 'b-5', title: 'How to Do Nothing', author: 'Jenny Odell', genre: 'Ideas', isbn: '978-1-61039-803-9', quantity: 3 },
  { id: 'b-6', title: 'The House in the Cerulean Sea', author: 'TJ Klune', genre: 'Fiction', isbn: '978-1-250-21828-8', quantity: 2 },
];

export const initialUsers = [
  { id: 'u-1', name: 'Asanda Kibiti', membershipId: 'ADMIN-901020612', role: 'Admin', joinedAt: '2024-02-12' },
  { id: 'u-2', name: 'Lechesa Refuoe', membershipId: 'LIB-901020610', role: 'Librarian', joinedAt: '2024-03-08' },
  { id: 'u-3', name: 'Lefa Moopisa', membershipId: 'MEM-901021212', role: 'Member', joinedAt: '2024-04-19' },
  { id: 'u-4', name: 'Paul Matsoetlane', membershipId: 'MEM-901020661', role: 'Member', joinedAt: '2024-06-03' },
];

export function sanitizeUsers(users = []) {
  return Array.isArray(users)
    ? users.filter((user) => !(typeof user?.name === 'string' && user.name.trim().toLowerCase() === 'morgan price'))
    : [];
}

const today = new Date().toISOString();
export const initialTransactions = [
  { id: 't-1', type: 'borrow', bookId: 'b-3', userId: 'u-3', quantity: 1, date: today },
  { id: 't-2', type: 'restock', bookId: 'b-1', userId: 'u-2', quantity: 2, date: today },
  { id: 't-3', type: 'borrow', bookId: 'b-2', userId: 'u-4', quantity: 1, date: today },
];

export function createId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}

export function readStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}