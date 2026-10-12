# Community Library Management System

A lightweight React + Vite application for managing a community library's books, members, and circulation activity.

## Features

- Browse and manage a book collection
- Track library members and roles
- Record borrow/restock transactions
- Sign in with membership ID
- Dashboard overview for library activity

## Tech Stack

- React
- Vite
- React Router
- Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app in development mode:
   ```bash
   npm run dev
   ```

3. Open the local URL shown in the terminal, typically:
   ```text
   http://localhost:5173/
   ```

## Build

To create a production build:

```bash
npm run build
```

## Run without npm

Open the repository's `index.html` directly in a browser to use the standalone library app without installing dependencies or starting a server. Sign in, manage the catalogue and accounts, and record circulation activity; the app saves its data in browser storage.

Alternatively, build with `npm run build` and open `dist/index.html` directly. That bundled version also runs without npm or a local server.

When running from the standalone file, navigation uses the URL fragment. The development server continues to use regular browser routes.

## Project Structure

```text
.
├── index.html
├── package.json
├── src/
│   ├── App.jsx
│   ├── LibraryContext.jsx
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
└── README.md
```

## Notes

This project uses local browser storage to persist books, users, transactions, and the active session.
