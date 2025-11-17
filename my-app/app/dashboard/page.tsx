'use client';

import { useState } from 'react';
import styles from './dashboard.module.css';

type View =
  | 'dashboard'
  | 'menu'
  | 'inventory'
  | 'employees'
  | 'productUsage'
  | 'xReports'
  | 'zReports';

export default function ManagerDashboard() {
  const [view, setView] = useState<View>('dashboard');

  const goBack = () => setView('dashboard');

  return (
    <div className={styles.container}>
      {view === 'dashboard' ? (
        <>
          <h1 className={styles.title}>Manager Dashboard</h1>
          <p className={styles.subtitle}>Select a function to manage:</p>

          <div className={styles.buttonGrid}>
            <button
              className={styles.actionButton}
              onClick={() => setView('menu')}
            >
              Manage Menu Items
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView('inventory')}
            >
              Manage Inventory
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView('employees')}
            >
              Manage Employees
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView('productUsage')}
            >
              Product Usage
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView('xReports')}
            >
              X Reports
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView('zReports')}
            >
              Z Reports
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.topBar}>
            <button className={styles.backButton} onClick={goBack}>
              ← Back to Dashboard
            </button>
            <h1 className={styles.title}>
              {view === 'menu' && 'Manage Menu Items'}
              {view === 'inventory' && 'Manage Inventory'}
              {view === 'employees' && 'Manage Employees'}
              {view === 'productUsage' && 'Product Usage'}
              {view === 'xReports' && 'X Reports'}
              {view === 'zReports' && 'Z Reports'}
            </h1>
          </div>

          <div className={styles.contentArea}>
            {view === 'menu' && <ManageMenuView />}
            {view === 'inventory' && <ManageInventoryView />}
            {view === 'employees' && <ManageEmployeesView />}
            {view === 'productUsage' && <ProductUsageView />}
            {view === 'xReports' && <XReportsView />}
            {view === 'zReports' && <ZReportsView />}
          </div>
        </>
      )}
    </div>
  );
}

function ManageMenuView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>Menu Items table will go here.</p>
      </div>
    </div>
  );
}

function ManageInventoryView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>Inventory table will go here.</p>
      </div>
    </div>
  );
}

function ManageEmployeesView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>Employees table will go here.</p>
      </div>
    </div>
  );
}

function ProductUsageView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>Product usage report UI will go here.</p>
      </div>
    </div>
  );
}

function XReportsView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>X-Report table will go here.</p>
      </div>
    </div>
  );
}

function ZReportsView() {
  return (
    <div>
      <p className={styles.helperText}>
        implement backend
      </p>
      <div className={styles.tablePlaceholder}>
        <p>Z-Report table and run form will go here.</p>
      </div>
    </div>
  );
}