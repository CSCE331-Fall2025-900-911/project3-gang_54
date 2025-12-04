"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useTranslation, LANGUAGE_OPTIONS } from "../hooks/useTranslation";

type View =
  | "dashboard"
  | "menu"
  | "inventory"
  | "employees"
  | "productUsage"
  | "xReports"
  | "zReports"
  | "kitchen"; // ← ADD THIS

export default function ManagerDashboard() {
  const [view, setView] = useState<View>("dashboard");

  const TRANSLATABLE_STRINGS = [
    "Manager Dashboard",
    "Select a function to manage:",
    "Manage Menu Items",
    "Manage Inventory",
    "Manage Employees",
    "Product Usage",
    "X Reports",
    "Z Reports",
    "Kitchen Display",
    "← Back to Dashboard",
    "Language",
    "Translating…",
  ];

  const { language, setLanguage, display, isTranslating } =
    useTranslation(TRANSLATABLE_STRINGS);

  const goBack = () => setView("dashboard");

  return (
    <div className={styles.container}>
      <section
        className="dashboard-language"
        aria-label="Language selection"
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "flex-end",
          paddingRight: "20px",
        }}
      >
        <label htmlFor="dashboard-language-select">{display("Language")}</label>
        <select
          id="dashboard-language-select"
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as "en" | "es" | "zh")
          }
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(0,0,0,0.2)",
            color: "#fff",
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        {isTranslating && <span>{display("Translating…")}</span>}
      </section>

      {view === "dashboard" ? (
        <>
          <h1 className={styles.title}>{display("Manager Dashboard")}</h1>
          <p className={styles.subtitle}>
            {display("Select a function to manage:")}
          </p>

          <div className={styles.buttonGrid}>
            <button
              className={styles.actionButton}
              onClick={() => setView("menu")}
            >
              {display("Manage Menu Items")}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setView("inventory")}
            >
              {display("Manage Inventory")}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setView("employees")}
            >
              {display("Manage Employees")}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setView("productUsage")}
            >
              {display("Product Usage")}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setView("xReports")}
            >
              {display("X Reports")}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setView("zReports")}
            >
              {display("Z Reports")}
            </button>

            {/* ★ KITCHEN BUTTON */}
            <button
              className={styles.actionButton}
              onClick={() => setView("kitchen")}
            >
              {display("Kitchen Display")}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.topBar}>
            <button className={styles.backButton} onClick={goBack}>
              {display("← Back to Dashboard")}
            </button>

            <h1 className={styles.title}>
              {view === "menu" && display("Manage Menu Items")}
              {view === "inventory" && display("Manage Inventory")}
              {view === "employees" && display("Manage Employees")}
              {view === "productUsage" && display("Product Usage")}
              {view === "xReports" && display("X Reports")}
              {view === "zReports" && display("Z Reports")}
              {view === "kitchen" && display("Kitchen Display")} {/* ★ TITLE */}
            </h1>
          </div>

          {/* ★ WHERE DIFFERENT VIEWS RENDER */}
          <div className={styles.contentArea}>
            {view === "menu" && <ManageMenuView />}
            {view === "inventory" && <ManageInventoryView />}
            {view === "employees" && <ManageEmployeesView />}
            {view === "productUsage" && <ProductUsageView />}
            {view === "xReports" && <XReportsView />}
            {view === "zReports" && <ZReportsView />}
            {view === "kitchen" && <KitchenView />} {/* ★ FULL FIX */}
          </div>
        </>
      )}
    </div>
  );
}

/* ====================================================================== */
/*                           MANAGE MENU VIEW                             */
/* ====================================================================== */

function ManageMenuView() {
  type MenuItem = {
    item_id: number;
    item_name: string;
    price: number;
  };

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/menu_items");
        if (!res.ok) throw new Error("Failed to load menu items");
        const data = await res.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message ?? "Error loading items");
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleCellChange = (
    id: number,
    field: "item_name" | "price",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.item_id === id
          ? {
              ...item,
              [field]: field === "price" ? Number(value) || 0 : value,
            }
          : item
      )
    );
  };

  const handleAdd = async () => {
    const name = newName.trim();
    const priceNum = Number(newPrice);
    if (!name || Number.isNaN(priceNum)) {
      alert("Enter valid name and price");
      return;
    }

    try {
      const res = await fetch("/api/menu_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: priceNum }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      const created: MenuItem = await res.json();
      setItems((prev) => [...prev, created]);

      setNewName("");
      setNewPrice("");
    } catch (err: any) {
      alert(err.message ?? "Error adding item");
    }
  };

  const handleUpdate = async () => {
    if (selectedId == null) {
      alert("Select a row to update");
      return;
    }
    const item = items.find((i) => i.item_id === selectedId);
    if (!item) return;

    const name = item.item_name.trim();
    const priceNum = Number(item.price);
    if (!name || Number.isNaN(priceNum)) {
      alert("Invalid values on selected row");
      return;
    }

    try {
      const res = await fetch("/api/menu_items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          name,
          price: priceNum,
        }),
      });

      if (!res.ok) throw new Error("Failed to update item");
      const data = await res.json();
      setItems(data);
      alert("Item updated successfully");
    } catch (err: any) {
      alert(err.message ?? "Error updating item");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/menu_items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setItems((prev) => prev.filter((item) => item.item_id !== id));

      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      alert(err.message ?? "Error deleting item");
    }
  };

  return (
    <div>
      {loading && <p className={styles.helperText}>Loading menu items...</p>}
      {error && <p className={styles.helperText}>Error: {error}</p>}

      <div className={styles.tablePlaceholder}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.item_id}
                onClick={() => setSelectedId(item.item_id)}
                style={{
                  backgroundColor:
                    selectedId === item.item_id ? "#ffe0b3" : "transparent",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "8px" }}>{item.item_id}</td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) =>
                      handleCellChange(
                        item.item_id,
                        "item_name",
                        e.target.value
                      )
                    }
                    style={{ width: "100%" }}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      handleCellChange(item.item_id, "price", e.target.value)
                    }
                    style={{ width: "100%" }}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.item_id);
                    }}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleUpdate} className={styles.updateButton}>
          Update Selected
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className={styles.inputField}
        />

        <button onClick={handleAdd} className={styles.addButton}>
          Add
        </button>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                           INVENTORY VIEW                               */
/* ====================================================================== */

function ManageInventoryView() {
  type Ingredient = {
    ingredient_id: number;
    name: string;
    quantity: number;
  };

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadIngredients = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/inventory");
        if (!res.ok) throw new Error("Failed to load ingredients");
        const data = await res.json();
        setIngredients(data);
      } catch (err: any) {
        setError(err.message ?? "Error loading ingredients");
      } finally {
        setLoading(false);
      }
    };
    loadIngredients();
  }, []);

  const handleCellChange = (
    id: number,
    field: "name" | "quantity",
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.ingredient_id === id
          ? {
              ...ingredient,
              [field]: field === "quantity" ? Number(value) || 0 : value,
            }
          : ingredient
      )
    );
  };

  const handleAdd = async () => {
    const name = newName.trim();
    const quantityNum = Number(newQuantity);

    if (!name || Number.isNaN(quantityNum)) {
      alert("Enter valid name and quantity");
      return;
    }

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity: quantityNum }),
      });

      if (!res.ok) throw new Error("Failed to add ingredient");

      const created: Ingredient = await res.json();
      setIngredients((prev) => [...prev, created]);

      setNewName("");
      setNewQuantity("");
    } catch (err: any) {
      alert(err.message ?? "Error adding ingredient");
    }
  };

  const handleUpdate = async () => {
    if (selectedId == null) {
      alert("Select a row to update");
      return;
    }

    const ingredient = ingredients.find(
      (ing) => ing.ingredient_id === selectedId
    );
    if (!ingredient) return;

    const name = ingredient.name.trim();
    const quantityNum = Number(ingredient.quantity);

    if (!name || Number.isNaN(quantityNum)) {
      alert("Invalid values on selected row");
      return;
    }

    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          name,
          quantity: quantityNum,
        }),
      });

      if (!res.ok) throw new Error("Failed to update ingredient");

      const data = await res.json();
      setIngredients(data);
      alert("Ingredient updated successfully");
    } catch (err: any) {
      alert(err.message ?? "Error updating ingredient");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this ingredient?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete ingredient");

      setIngredients((prev) =>
        prev.filter((ingredient) => ingredient.ingredient_id !== id)
      );

      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      alert(err.message ?? "Error deleting ingredient");
    }
  };

  return (
    <div>
      {loading && <p className={styles.helperText}>Loading ingredients...</p>}
      {error && <p className={styles.helperText}>Error: {error}</p>}

      <div className={styles.tablePlaceholder}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Quantity</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr
                key={ingredient.ingredient_id}
                onClick={() => setSelectedId(ingredient.ingredient_id)}
                style={{
                  backgroundColor:
                    selectedId === ingredient.ingredient_id
                      ? "#ffe0b3"
                      : "transparent",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "8px" }}>{ingredient.ingredient_id}</td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={ingredient.name}
                    onChange={(e) =>
                      handleCellChange(
                        ingredient.ingredient_id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleCellChange(
                        ingredient.ingredient_id,
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ingredient.ingredient_id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleUpdate} className={styles.updateButton}>
          Update Selected
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          className={styles.inputField}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity"
          className={styles.inputField}
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
        />

        <button onClick={handleAdd} className={styles.addButton}>
          Add
        </button>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                           EMPLOYEES VIEW                               */
/* ====================================================================== */

function ManageEmployeesView() {
  type Employee = {
    employee_id: number;
    name: string;
    role: string;
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to load employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err: any) {
        setError(err.message ?? "Error loading employees");
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const handleCellChange = (
    id: number,
    field: "name" | "role",
    value: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employee_id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  const handleAdd = async () => {
    const name = newName.trim();
    const role = newRole.trim();

    if (!name || !role) {
      alert("Enter valid name and role");
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });

      if (!res.ok) throw new Error("Failed to add employee");

      const created: Employee = await res.json();
      setEmployees((prev) => [...prev, created]);

      setNewName("");
      setNewRole("");
    } catch (err: any) {
      alert(err.message ?? "Error adding employee");
    }
  };

  const handleUpdate = async () => {
    if (selectedId == null) {
      alert("Select a row to update");
      return;
    }

    const emp = employees.find((e) => e.employee_id === selectedId);
    if (!emp) return;

    const name = emp.name.trim();
    const role = emp.role.trim();

    if (!name || !role) {
      alert("Invalid values on selected row");
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, name, role }),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      alert(err.message ?? "Error updating employee");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete employee");

      setEmployees((prev) => prev.filter((e) => e.employee_id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      alert(err.message ?? "Error deleting employee");
    }
  };

  return (
    <div>
      {loading && <p className={styles.helperText}>Loading employees...</p>}
      {error && <p className={styles.helperText}>Error: {error}</p>}

      <div className={styles.tablePlaceholder}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>Name</th>
              <th style={{ padding: "8px" }}>Role</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.employee_id}
                onClick={() => setSelectedId(emp.employee_id)}
                style={{
                  backgroundColor:
                    selectedId === emp.employee_id ? "#ffe0b3" : "transparent",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "8px" }}>{emp.employee_id}</td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.name}
                    onChange={(e) =>
                      handleCellChange(emp.employee_id, "name", e.target.value)
                    }
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.role}
                    onChange={(e) =>
                      handleCellChange(emp.employee_id, "role", e.target.value)
                    }
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(emp.employee_id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button className={styles.updateButton} onClick={handleUpdate}>
          Update Selected
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={newName}
          className={styles.inputField}
          onChange={(e) => setNewName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Role"
          value={newRole}
          className={styles.inputField}
          onChange={(e) => setNewRole(e.target.value)}
        />

        <button className={styles.addButton} onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                           PRODUCT USAGE VIEW                           */
/* ====================================================================== */

function ProductUsageView() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    setError(null);
    setRows([]);

    if (!startDate || !endDate) {
      setError("Please enter both start and end dates.");
      return;
    }

    try {
      const res = await fetch("/api/product_usage", {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch product usage");
      }

      const data = await res.json();
      setRows(data);

      if (data.length === 0) {
        setError("No inventory usage data for that range.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Ingredient Usage Report</h2>

      <div className={styles.filterRow}>
        <label>Start Date (YYYY-MM-DD):</label>
        <input
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.inputField}
        />

        <label>End Date (YYYY-MM-DD):</label>
        <input
          type="text"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.inputField}
        />

        <button className={styles.actionButton} onClick={fetchUsage}>
          Inventory Usage
        </button>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {rows.length > 0 && (
        <table className={styles.table} style={{ borderSpacing: "20px 10px" }}>
          <thead>
            <tr>
              <th>Ingredient ID</th>
              <th>Ingredient Name</th>
              <th>Total Used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td>{r.ingredient_id}</td>
                <td>{r.ingredient_name}</td>
                <td>{r.total_used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ====================================================================== */
/*                           ★ KITCHEN VIEW ★                              */
/* ====================================================================== */

function KitchenView() {
  return (
    <div>
      <h2 className={styles.subtitle}>Kitchen Display</h2>
      <div className={styles.tablePlaceholder}>
        <p>Incoming orders will appear here automatically.</p>
        <p style={{ marginTop: "8px" }}>(Read-only kitchen interface)</p>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                           X-REPORTS VIEW                                */
/* ====================================================================== */

function XReportsView() {
  return (
    <div>
      <p className={styles.helperText}>implement backend</p>
      <div className={styles.tablePlaceholder}>
        <p>X-Report table will go here.</p>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                           Z-REPORTS VIEW                                */
/* ====================================================================== */

function ZReportsView() {
  return (
    <div>
      <p className={styles.helperText}>implement backend</p>
      <div className={styles.tablePlaceholder}>
        <p>Z-Report table and run form will go here.</p>
      </div>
    </div>
  );
}
