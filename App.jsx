import React, { useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowUpRight, BookCopy, BookOpen, Check, ChevronRight, CircleHelp,
  ClipboardList, LayoutDashboard, LogIn, LogOut, Menu, Plus, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Users, X,
} from 'lucide-react';
import { useLibrary } from './LibraryContext';
import { createId } from './data';

const navigation = [
  { to: '/login', label: 'Sign in', icon: LogIn },
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/books', label: 'Book collection', icon: BookOpen },
  { to: '/transactions', label: 'Circulation', icon: ClipboardList },
  { to: '/users', label: 'People', icon: Users },
];

function AppShell() {
  const { currentUser, logout } = useLibrary();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const page = navigation.find((item) => item.to === location.pathname)?.label ?? 'Sign in';

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><BookOpen size={21} strokeWidth={2.1} /></span>
          <span className="brand-name">Community Library</span>
        </Link>
        <div className="side-label">LIBRARY DESK</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'People' && <span className="nav-lock"><ShieldCheck size={14} /></span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><Sparkles size={16} /><span>A little room for every story.</span></div>
          {currentUser ? (
            <div className="sidebar-user">
              <span className="avatar">{initials(currentUser.name)}</span>
              <div className="sidebar-user-copy">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.role}</span>
              </div>
              <button className="icon-button logout-button" title="Sign out" aria-label="Sign out" onClick={logout}><LogOut size={16} /></button>
            </div>
          ) : (
            <div className="sidebar-user">
              <span className="avatar">C</span>
              <div className="sidebar-user-copy">
                <strong>Community Library</strong>
                <span>Sign in</span>
              </div>
              <Link className="icon-button logout-button" title="Sign in" aria-label="Sign in" to="/login"><ChevronRight size={17} /></Link>
            </div>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="crumb"><span>Library desk</span><ChevronRight size={14} /><strong>{page}</strong></div>
          <div className="topbar-right">
            <span className="open-indicator"><span /> Open today</span>
            {currentUser ? (
              <button className="account-button" onClick={logout}><span className="avatar avatar-small">{initials(currentUser.name)}</span><span>{currentUser.name}</span><LogOut size={15} /></button>
            ) : <Link className="sign-in-link" to="/login">Sign in <ChevronRight size={15} /></Link>}
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
        <footer className="app-footer"><span>Community Library</span><span>Made for curious minds <span className="footer-star">*</span></span></footer>
      </div>
    </div>
  );
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function ProtectedRoute({ roles }) {
  const { currentUser } = useLibrary();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone = 'coral' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-${tone}`}><Icon size={19} strokeWidth={1.8} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

function StockBadge({ quantity }) {
  const state = quantity === 0 ? 'out' : quantity < 2 ? 'low' : 'available';
  return <span className={`stock-badge stock-${state}`}><span />{quantity === 0 ? 'Out of stock' : quantity < 2 ? 'Low stock' : 'In stock'}</span>;
}

function Dashboard() {
  const { books, users, transactions, currentUser } = useLibrary();
  const totalCopies = books.reduce((sum, book) => sum + Number(book.quantity || 0), 0);
  const availableTitles = books.filter((book) => book.quantity > 0).length;
  const lowStock = books.filter((book) => book.quantity < 2);
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  return (
    <>
      <PageHeading eyebrow="YOUR NEIGHBORHOOD, IN PAGES" title={currentUser ? `Good to see you, ${currentUser.name.split(' ')[0]}.` : 'A library for everyone.'} description="A small look at what’s happening between these shelves." action={<Link className="button button-primary" to="/transactions"><Plus size={17} /> New transaction</Link>} />
      <section className="stats-grid" aria-label="Library statistics">
        <StatCard label="Copies on the shelf" value={totalCopies.toLocaleString()} note="Across the whole collection" icon={BookCopy} tone="coral" />
        <StatCard label="Titles available" value={availableTitles} note={`${books.length} titles in the catalogue`} icon={BookOpen} tone="green" />
        <StatCard label="Library members" value={users.filter((user) => user.role === 'Member').length} note="Growing one reader at a time" icon={Users} tone="blue" />
      </section>
      <section className="dashboard-grid">
        <div className="content-panel collection-panel">
          <div className="panel-heading"><div><div className="eyebrow">NEEDS A LITTLE LOVE</div><h2>Running low</h2></div><Link className="text-link" to="/books">All books <ChevronRight size={15} /></Link></div>
          {lowStock.length ? <div className="low-stock-list">{lowStock.slice(0, 4).map((book) => (
            <div className="low-stock-row" key={book.id}>
              <div className="book-swatch"><BookOpen size={17} /></div>
              <div className="book-row-copy"><strong>{book.title}</strong><span>{book.author}</span></div>
              <div className="low-stock-count"><strong>{book.quantity}</strong><span>{book.quantity === 1 ? 'copy left' : 'copies left'}</span></div>
            </div>
          ))}</div> : <EmptyState title="Shelves are looking good" message="Every title has at least two copies available." />}
        </div>
        <div className="content-panel activity-panel">
          <div className="panel-heading"><div><div className="eyebrow">AROUND THE LIBRARY</div><h2>Recent activity</h2></div><Link className="text-link" to="/transactions">View log <ChevronRight size={15} /></Link></div>
          {recent.length ? <div className="activity-list">{recent.map((transaction) => <ActivityRow key={transaction.id} transaction={transaction} />)}</div> : <EmptyState title="A quiet day" message="New checkouts and arrivals will show up here." />}
        </div>
      </section>
      <div className="welcome-strip"><span className="welcome-icon"><CircleHelp size={19} /></span><span><strong>Every book has a next chapter.</strong> Keep your catalogue current and your shelves ready to explore.</span><Link to="/books" aria-label="Go to book collection"><ChevronRight size={18} /></Link></div>
    </>
  );
}

function EmptyState({ title, message }) {
  return <div className="empty-state"><span className="empty-icon"><BookOpen size={18} /></span><strong>{title}</strong><p>{message}</p></div>;
}

function BookCollection() {
  const { books, setBooks } = useLibrary();
  const [query, setQuery] = useState('');
  const [dialogBook, setDialogBook] = useState(undefined);
  const filteredBooks = useMemo(() => books.filter((book) => `${book.title} ${book.author} ${book.genre} ${book.isbn}`.toLowerCase().includes(query.toLowerCase())), [books, query]);

  function saveBook(form) {
    setBooks((previous) => previous.some((book) => book.id === form.id)
      ? previous.map((book) => book.id === form.id ? form : book)
      : [form, ...previous]);
  }

  function deleteBook(book) {
    if (window.confirm(`Remove “${book.title}” from the collection? Its transaction history will remain.`)) {
      setBooks((previous) => previous.filter((item) => item.id !== book.id));
    }
  }

  return (
    <>
      <PageHeading eyebrow="THE COLLECTION" title="Books" description="Keep the shelves in good order." action={<button className="button button-primary" onClick={() => setDialogBook(null)}><Plus size={17} /> Add a book</button>} />
      <section className="content-panel table-panel">
        <div className="table-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Search books" placeholder="Search title, author, ISBN..." value={query} onChange={(event) => setQuery(event.target.value)} /><span className="search-shortcut"><SlidersHorizontal size={14} /></span></div><span className="result-count">{filteredBooks.length} {filteredBooks.length === 1 ? 'title' : 'titles'}</span></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>BOOK</th><th>GENRE</th><th>ISBN</th><th>AVAILABILITY</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {filteredBooks.map((book, index) => <tr key={book.id}>
            <td><div className="book-cell"><div className={`book-cover cover-${index % 4}`}><BookOpen size={17} /></div><div><strong>{book.title}</strong><span>{book.author}</span></div></div></td>
            <td><span className="genre-label">{book.genre}</span></td><td className="isbn-cell">{book.isbn}</td><td><strong className="quantity-value">{book.quantity}</strong><span className="quantity-unit"> {book.quantity === 1 ? 'copy' : 'copies'}</span></td><td><StockBadge quantity={book.quantity} /></td>
            <td><div className="row-actions"><button className="text-button" onClick={() => setDialogBook(book)}>Update</button><button className="text-button text-danger" onClick={() => deleteBook(book)}>Delete</button></div></td>
          </tr>)}
          {!filteredBooks.length && <tr><td colSpan="6"><EmptyState title="No titles found" message={query ? 'Try a different title, author, or ISBN.' : 'Add the first book to your collection.'} /></td></tr>}
        </tbody></table></div>
      </section>
      <div className="table-footnote"><span className="low-dot" /> Fewer than 2 copies means a book is running low.</div>
      {dialogBook !== undefined && <BookDialog book={dialogBook} books={books} onClose={() => setDialogBook(undefined)} onSave={saveBook} />}
    </>
  );
}

function Dialog({ title, subtitle, onClose, children, wide = false }) {
  return <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`dialog ${wide ? 'dialog-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
    <div className="dialog-header"><div><div className="eyebrow">LIBRARY DESK</div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div>{children}
  </section></div>;
}

function BookDialog({ book, books, onClose, onSave }) {
  const [form, setForm] = useState(() => book ? { ...book } : { title: '', author: '', genre: '', isbn: '', quantity: 0 });
  const [error, setError] = useState('');
  function update(field, value) { setForm((previous) => ({ ...previous, [field]: value })); }
  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim() || !form.isbn.trim()) return setError('Fill in each book detail before saving.');
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) return setError('Quantity must be a whole number, zero or greater.');
    if (books.some((item) => item.isbn.toLowerCase() === form.isbn.trim().toLowerCase() && item.id !== book?.id)) return setError('That ISBN is already in the collection.');
    onSave({ ...form, id: book?.id ?? createId('b'), title: form.title.trim(), author: form.author.trim(), genre: form.genre.trim(), isbn: form.isbn.trim(), quantity: Number(form.quantity) });
    onClose();
  }
  return <Dialog title={book ? 'Update a book' : 'Add a book'} subtitle={book ? 'Make a change to this catalogue entry.' : 'A new title for the community shelves.'} onClose={onClose}>
    <form className="form-stack" onSubmit={submit} noValidate>
      <label className="field-label">TITLE<input autoFocus value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. The Creative Act" /></label>
      <label className="field-label">AUTHOR<input value={form.author} onChange={(event) => update('author', event.target.value)} placeholder="Author name" /></label>
      <div className="form-row"><label className="field-label">GENRE<input value={form.genre} onChange={(event) => update('genre', event.target.value)} placeholder="e.g. Fiction" /></label><label className="field-label">ISBN<input value={form.isbn} onChange={(event) => update('isbn', event.target.value)} placeholder="978-..." /></label></div>
      <label className="field-label">INITIAL QUANTITY<input type="number" min="0" step="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary"><Check size={16} /> {book ? 'Save changes' : 'Add to collection'}</button></div>
    </form>
  </Dialog>;
}

function Circulation() {
  const { books, setBooks, users, transactions, setTransactions, currentUser } = useLibrary();
  const members = users.filter((user) => user.role === 'Member');
  const [type, setType] = useState('borrow');
  const [bookId, setBookId] = useState(books[0]?.id ?? '');
  const [userId, setUserId] = useState(members[0]?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const currentBook = books.find((book) => book.id === bookId);
  const history = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  function submit(event) {
    event.preventDefault();
    const count = Number(quantity);
    if (!bookId || !Number.isInteger(count) || count < 1) return setError('Choose a title and enter a whole number greater than zero.');
    if (type === 'borrow' && count > currentBook.quantity) return setError(`Only ${currentBook.quantity} ${currentBook.quantity === 1 ? 'copy is' : 'copies are'} available.`);
    if (type === 'borrow' && !userId) return setError('Add a member account before recording a checkout.');
    setBooks((previous) => previous.map((book) => book.id === bookId ? { ...book, quantity: book.quantity + (type === 'restock' ? count : -count) } : book));
    setTransactions((previous) => [{ id: createId('t'), type, bookId, userId: type === 'borrow' ? userId : currentUser.id, quantity: count, date: new Date().toISOString() }, ...previous]);
    setQuantity('1');
    setError('');
  }

  return <>
    <PageHeading eyebrow="CHECKOUT & ARRIVALS" title="Circulation" description="Every checkout and delivery, all in one place." />
    <div className="circulation-grid">
      <section className="content-panel transaction-form-panel"><div className="panel-heading"><div><div className="eyebrow">RECORD ACTIVITY</div><h2>New transaction</h2></div><span className="panel-ornament"><ClipboardList size={19} /></span></div>
        <form className="form-stack" onSubmit={submit} noValidate>
          <div className="segmented-control" role="group" aria-label="Transaction type">
            <button type="button" className={type === 'borrow' ? 'segment-active' : ''} onClick={() => { setType('borrow'); setError(''); }}><ArrowUpRight size={16} /> Borrow</button>
            <button type="button" className={type === 'restock' ? 'segment-active' : ''} onClick={() => { setType('restock'); setError(''); }}><ArrowDownLeft size={16} /> Add stock</button>
          </div>
          <label className="field-label">BOOK<select value={bookId} onChange={(event) => setBookId(event.target.value)}><option value="" disabled>Select a title</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title} · {book.quantity} available</option>)}</select></label>
          {currentBook && <div className="selected-book-note"><BookOpen size={16} /><span><strong>{currentBook.quantity}</strong> {currentBook.quantity === 1 ? 'copy' : 'copies'} currently on the shelf</span><StockBadge quantity={currentBook.quantity} /></div>}
          {type === 'borrow' && <label className="field-label">MEMBER<select value={userId} onChange={(event) => setUserId(event.target.value)}><option value="" disabled>Select a member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.membershipId}</option>)}</select></label>}
          <label className="field-label">QUANTITY<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary button-full"><Check size={16} /> Record {type === 'borrow' ? 'checkout' : 'arrival'}</button>
        </form>
      </section>
      <section className="content-panel history-panel"><div className="panel-heading"><div><div className="eyebrow">THE PAPER TRAIL</div><h2>Transaction history</h2></div><span className="history-count">{transactions.length} entries</span></div>
        <div className="history-list">{history.length ? history.map((transaction) => <ActivityRow key={transaction.id} transaction={transaction} detailed />) : <EmptyState title="No transactions yet" message="The first checkout or delivery will appear here." />}</div>
      </section>
    </div>
  </>;
}

function ActivityRow({ transaction, detailed = false }) {
  const { books, users } = useLibrary();
  const book = books.find((item) => item.id === transaction.bookId);
  const user = users.find((item) => item.id === transaction.userId);
  const restock = transaction.type === 'restock';
  return <div className="activity-row">
    <span className={`activity-icon ${restock ? 'activity-in' : 'activity-out'}`}>{restock ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
    <div className="activity-copy"><strong>{book?.title ?? 'Removed book'}</strong><span>{restock ? 'Stock arrival' : `Checked out${user ? ` by ${user.name}` : ''}`}</span>{detailed && <span className="activity-date">{new Date(transaction.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}</div>
    <span className={`activity-quantity ${restock ? 'quantity-in' : 'quantity-out'}`}>{restock ? '+' : '−'}{transaction.quantity}</span>
  </div>;
}

function People() {
  const { users, setUsers, currentUser } = useLibrary();
  const [query, setQuery] = useState('');
  const [dialogUser, setDialogUser] = useState(undefined);
  const filteredUsers = users.filter((user) => `${user.name} ${user.membershipId} ${user.role}`.toLowerCase().includes(query.toLowerCase()));
  function saveUser(form) {
    setUsers((previous) => previous.some((user) => user.id === form.id)
      ? previous.map((user) => user.id === form.id ? { ...user, ...form } : user)
      : [{ ...form, joinedAt: new Date().toISOString().slice(0, 10) }, ...previous]);
  }
  function deleteUser(user) {
    if (user.id === currentUser.id) return window.alert('You cannot delete the account you are currently using.');
    if (window.confirm(`Remove ${user.name} from library accounts?`)) setUsers((previous) => previous.filter((item) => item.id !== user.id));
  }
  return <>
    <PageHeading eyebrow="THE COMMUNITY" title="People" description="Membership, handled with care." action={<button className="button button-primary" onClick={() => setDialogUser(null)}><Plus size={17} /> Add a person</button>} />
    <section className="content-panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Search people" placeholder="Search name, membership ID..." value={query} onChange={(event) => setQuery(event.target.value)} /><span className="search-shortcut"><Users size={14} /></span></div><span className="result-count">{users.length} accounts</span></div>
      <div className="table-scroll"><table className="data-table people-table"><thead><tr><th>PERSON</th><th>MEMBERSHIP ID</th><th>ROLE</th><th>JOINED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
        {filteredUsers.map((user, index) => <tr key={user.id}><td><div className="person-cell"><span className={`avatar person-avatar person-${index % 4}`}>{initials(user.name)}</span><div><strong>{user.name}</strong><span>{user.id === currentUser.id ? 'You' : 'Community account'}</span></div></div></td><td className="member-id">{user.membershipId}</td><td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td><td className="date-cell">{new Date(`${user.joinedAt}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><div className="row-actions"><button className="text-button" onClick={() => setDialogUser(user)}>Update</button><button className="text-button text-danger" onClick={() => deleteUser(user)}>Delete</button></div></td></tr>)}
        {!filteredUsers.length && <tr><td colSpan="5"><EmptyState title="No accounts found" message="Try another name, role, or membership ID." /></td></tr>}
      </tbody></table></div>
    </section>
    <div className="table-footnote"><ShieldCheck size={15} /> Account access is managed by library administrators.</div>
    {dialogUser !== undefined && <UserDialog user={dialogUser} users={users} onClose={() => setDialogUser(undefined)} onSave={saveUser} />}
  </>;
}

function UserDialog({ user, users, onClose, onSave }) {
  const [form, setForm] = useState(() => user ? { ...user } : { name: '', membershipId: '', role: 'Member' });
  const [error, setError] = useState('');
  function update(field, value) { setForm((previous) => ({ ...previous, [field]: value })); }
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.membershipId.trim()) return setError('Enter a name and membership ID.');
    if (users.some((item) => item.membershipId.toLowerCase() === form.membershipId.trim().toLowerCase() && item.id !== user?.id)) return setError('That membership ID is already in use.');
    onSave({ ...form, id: user?.id ?? createId('u'), name: form.name.trim(), membershipId: form.membershipId.trim().toUpperCase() });
    onClose();
  }
  return <Dialog title={user ? 'Update account' : 'Add a person'} subtitle="A place in the community starts here." onClose={onClose}>
    <form className="form-stack" onSubmit={submit} noValidate>
      <label className="field-label">FULL NAME<input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Riley Morgan" /></label>
      <label className="field-label">MEMBERSHIP ID<input value={form.membershipId} onChange={(event) => update('membershipId', event.target.value)} placeholder="e.g. MEM-042" /></label>
      <label className="field-label">ROLE<select value={form.role} onChange={(event) => update('role', event.target.value)}><option>Member</option><option>Librarian</option><option>Admin</option></select></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary"><Check size={16} /> {user ? 'Save changes' : 'Add account'}</button></div>
    </form>
  </Dialog>;
}

function Login() {
  const { users, login, currentUser, setUsers } = useLibrary();
  const [membershipId, setMembershipId] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', membershipId: '' });
  const [newError, setNewError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  if (currentUser) return <Navigate to="/" replace />;

  function submit(event) {
    event.preventDefault();
    const user = users.find((item) => item.membershipId.toLowerCase() === membershipId.trim().toLowerCase());
    if (!user) return setError('We couldn’t find that membership ID. Check it and try again.');
    login(user);
    navigate(location.state?.from ?? '/', { replace: true });
  }

  function submitCreateAccount(event) {
    event.preventDefault();
    const name = newAccount.name.trim();
    const accountId = newAccount.membershipId.trim();

    if (!name || !accountId) return setNewError('Enter a name and membership ID.');
    if (users.some((item) => item.membershipId.toLowerCase() === accountId.toLowerCase())) {
      return setNewError('That membership ID is already in use.');
    }

    const account = {
      id: createId('u'),
      name,
      membershipId: accountId.toUpperCase(),
      role: 'Member',
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    setUsers((previous) => [account, ...previous]);
    login(account);
    navigate(location.state?.from ?? '/', { replace: true });
  }

  return <div className="login-wrap"><section className="login-card">
    <div className="login-art"><div className="login-art-mark"><BookOpen size={31} /></div><span className="eyebrow">A PLACE TO BEGIN</span><h2>Good stories bring us together.</h2><div className="art-rule" /><span className="art-caption">COMMUNITY LIBRARY <span>EST. FOR EVERYONE</span></span></div>
    <div className="login-form-side"><span className="eyebrow">WELCOME BACK</span><h1>Sign in</h1><p>Use your membership ID to open the library desk.</p>
      {!creating ? (
        <>
          <form className="form-stack" onSubmit={submit} noValidate>
            <label className="field-label">MEMBERSHIP ID<input autoFocus value={membershipId} onChange={(event) => { setMembershipId(event.target.value); setError(''); }} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary button-full">Continue <ChevronRight size={17} /></button>
          </form>
          <button type="button" className="button button-quiet button-full" onClick={() => { setCreating(true); setError(''); setNewError(''); }}>Create an account</button>
        </>
      ) : (
        <form className="form-stack" onSubmit={submitCreateAccount} noValidate>
          <label className="field-label">FULL NAME<input autoFocus autoComplete="name" required value={newAccount.name} onChange={(event) => setNewAccount((previous) => ({ ...previous, name: event.target.value }))} /></label>
          <label className="field-label">MEMBERSHIP ID<input autoComplete="off" required value={newAccount.membershipId} onChange={(event) => setNewAccount((previous) => ({ ...previous, membershipId: event.target.value }))} /></label>
          {newError && <p className="form-error" role="alert">{newError}</p>}
          <div className="dialog-actions">
            <button type="button" className="button button-quiet" onClick={() => { setCreating(false); setNewError(''); }}>Cancel</button>
            <button className="button button-primary">Create account</button>
          </div>
        </form>
      )}
    </div>
  </section></div>;
}

export default function App() {
  return <Routes><Route element={<AppShell />}>
    <Route element={<ProtectedRoute roles={['Admin', 'Librarian', 'Member']} />}>
      <Route index element={<Dashboard />} />
      <Route path="overview" element={<Dashboard />} />
    </Route>
    <Route path="login" element={<Login />} />
    <Route element={<ProtectedRoute roles={['Admin', 'Librarian']} />}>
      <Route path="books" element={<BookCollection />} />
      <Route path="transactions" element={<Circulation />} />
    </Route>
    <Route element={<ProtectedRoute roles={['Admin']} />}><Route path="users" element={<People />} /></Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Route></Routes>;
}