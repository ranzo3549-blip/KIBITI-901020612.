import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialBooks, initialTransactions, initialUsers, readStoredValue, sanitizeUsers, STORAGE_KEYS } from './data';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(() => readStoredValue(STORAGE_KEYS.books, initialBooks));
  const [users, setUsers] = useState(() => sanitizeUsers(readStoredValue(STORAGE_KEYS.users, initialUsers)));
  const [transactions, setTransactions] = useState(() => readStoredValue(STORAGE_KEYS.transactions, initialTransactions));
  const [session, setSession] = useState(() => {
    const storedSession = readStoredValue(STORAGE_KEYS.session, null);
    if (!storedSession?.userId) return null;
    return sanitizeUsers(readStoredValue(STORAGE_KEYS.users, initialUsers)).some((user) => user.id === storedSession.userId) ? storedSession : null;
  });
  const currentUser = users.find((user) => user.id === session?.userId) ?? null;

  useEffect(() => window.localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books)), [books]);
  useEffect(() => window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)), [users]);
  useEffect(() => window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions)), [transactions]);
  useEffect(() => {
    if (session) window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEYS.session);
  }, [session]);
  useEffect(() => {
    if (session && !users.some((user) => user.id === session.userId)) setSession(null);
  }, [session, users]);

  const value = useMemo(() => ({
    books,
    setBooks,
    users,
    setUsers,
    transactions,
    setTransactions,
    currentUser,
    login: (user) => setSession({ userId: user.id }),
    logout: () => setSession(null),
  }), [books, users, transactions, currentUser]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}