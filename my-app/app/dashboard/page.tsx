"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useTranslation } from "../hooks/useTranslation";

type View =
  | "dashboard"
  | "menu"
  | "inventory"
  | "employees"
  | "productUsage"
  | "xReports"
  | "zReports";

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
    // <div className={styles.dashboardPage}>
      <div className={styles.container}>
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
              </h1>
            </div>

            <div className={styles.contentArea}>
              {view === "menu" && <ManageMenuView />}
              {view === "inventory" && <ManageInventoryView />}
              {view === "employees" && <ManageEmployeesView />}
              {view === "productUsage" && <ProductUsageView />}
              {view === "xReports" && <XReportsView />}
              {view === "zReports" && <ZReportsView />}
            </div>
          </>
        )}
      </div>
    // </div>
  );
}

/* ====================================================================== */
/*                           MANAGE MENU VIEW                             */
/* ====================================================================== */

function ManageMenuView() {
  type MenuItem = {
    item_id: number;
    name: string;
    subtitle: string | null;
    description: string | null;
    price: number;
    tags: string[];
    category: string | null;
    icon: string | null;
    badge: string | null;
  };

  const normalizeTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags.map((t) => String(t)).filter((t) => t.length > 0);
    if (typeof tags === "string") {
      const s = tags.trim();
      if (!s) return [];
      const inner = s.startsWith("{") && s.endsWith("}") ? s.slice(1, -1) : s;
      return inner
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    }
    return [];
  };

  const tagsToString = (tags: any) => normalizeTags(tags).join(", ");

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/menu_items");
        if (!res.ok) throw new Error("Failed to load menu items");
        const data = await res.json();
        const normalized: MenuItem[] = (Array.isArray(data) ? data : []).map((r: any) => ({
          item_id: Number(r.item_id),
          name: String(r.name ?? ""),
          subtitle: r.subtitle == null ? null : String(r.subtitle),
          description: r.description == null ? null : String(r.description),
          price: Number(r.price) || 0,
          tags: normalizeTags(r.tags),
          category: r.category == null ? null : String(r.category),
          icon: r.icon == null ? null : String(r.icon),
          badge: r.badge == null ? null : String(r.badge),
        }));
        setItems(normalized);
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
    field: "name" | "subtitle" | "description" | "price" | "tags" | "category" | "icon" | "badge",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.item_id === id
          ? {
              ...item,
              [field]:
                field === "price"
                  ? Number(value) || 0
                  : field === "tags"
                  ? normalizeTags(value)
                  : value,
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

    const payload = {
      name,
      subtitle: newSubtitle.trim() ? newSubtitle.trim() : null,
      description: newDescription.trim() ? newDescription.trim() : null,
      price: priceNum,
      tags: normalizeTags(newTags),
      category: newCategory.trim() ? newCategory.trim() : null,
      icon: newIcon.trim() ? newIcon.trim() : null,
      badge: newBadge.trim() ? newBadge.trim() : null,
    };

    try {
      const res = await fetch("/api/menu_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add item");

      const createdRaw = await res.json();
      const created: MenuItem = {
        item_id: Number(createdRaw.item_id),
        name: String(createdRaw.name ?? ""),
        subtitle: createdRaw.subtitle == null ? null : String(createdRaw.subtitle),
        description: createdRaw.description == null ? null : String(createdRaw.description),
        price: Number(createdRaw.price) || 0,
        tags: normalizeTags(createdRaw.tags),
        category: createdRaw.category == null ? null : String(createdRaw.category),
        icon: createdRaw.icon == null ? null : String(createdRaw.icon),
        badge: createdRaw.badge == null ? null : String(createdRaw.badge),
      };

      setItems((prev) => [...prev, created]);

      setNewName("");
      setNewSubtitle("");
      setNewDescription("");
      setNewPrice("");
      setNewTags("");
      setNewCategory("");
      setNewIcon("");
      setNewBadge("");
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

    const name = item.name.trim();
    const priceNum = Number(item.price);
    if (!name || Number.isNaN(priceNum)) {
      alert("Invalid values on selected row");
      return;
    }

    const payload = {
      id: selectedId,
      name,
      subtitle: item.subtitle == null ? null : String(item.subtitle),
      description: item.description == null ? null : String(item.description),
      price: priceNum,
      tags: normalizeTags(item.tags),
      category: item.category == null ? null : String(item.category),
      icon: item.icon == null ? null : String(item.icon),
      badge: item.badge == null ? null : String(item.badge),
    };

    try {
      const res = await fetch("/api/menu_items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update item");
      const data = await res.json();
      const normalized: MenuItem[] = (Array.isArray(data) ? data : []).map((r: any) => ({
        item_id: Number(r.item_id),
        name: String(r.name ?? ""),
        subtitle: r.subtitle == null ? null : String(r.subtitle),
        description: r.description == null ? null : String(r.description),
        price: Number(r.price) || 0,
        tags: normalizeTags(r.tags),
        category: r.category == null ? null : String(r.category),
        icon: r.icon == null ? null : String(r.icon),
        badge: r.badge == null ? null : String(r.badge),
      }));
      setItems(normalized);
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

      <div className={`${styles.tablePlaceholder} ${styles.tableWrapper}`}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Subtitle</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Description</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Price</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Tags</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Icon</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Badge</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.item_id}
                onClick={() => setSelectedId(item.item_id)}
                style={{
                  backgroundColor:
                    selectedId === item.item_id ? "rgba(52, 52, 52, 1)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "8px" }}>{item.item_id}</td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleCellChange(item.item_id, "name", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.subtitle ?? ""}
                    onChange={(e) => handleCellChange(item.item_id, "subtitle", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.description ?? ""}
                    onChange={(e) => handleCellChange(item.item_id, "description", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleCellChange(item.item_id, "price", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={tagsToString(item.tags)}
                    onChange={(e) => handleCellChange(item.item_id, "tags", e.target.value)}
                    className={styles.inputField}
                    placeholder="e.g. Limited, Nutty"
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.category ?? ""}
                    onChange={(e) => handleCellChange(item.item_id, "category", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.icon ?? ""}
                    onChange={(e) => handleCellChange(item.item_id, "icon", e.target.value)}
                    className={styles.inputField}
                  />
                </td>

                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.badge ?? ""}
                    onChange={(e) => handleCellChange(item.item_id, "badge", e.target.value)}
                    className={styles.inputField}
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
          flexWrap: "wrap",
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
          type="text"
          placeholder="Subtitle"
          value={newSubtitle}
          onChange={(e) => setNewSubtitle(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
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

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={newTags}
          onChange={(e) => setNewTags(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="Icon"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="Badge"
          value={newBadge}
          onChange={(e) => setNewBadge(e.target.value)}
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
                      ? "rgba(52, 52, 52, 1)"
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
    phone_number: string;
    email: string;
    role: string;
    hire_date: string;
    salary: number;
    status: string;
    address: string;
    date_of_birth: string;
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    email: "",
    role: "",
    hire_date: "",
    salary: "",
    status: "",
    address: "",
    date_of_birth: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to load employees");
        const data = await res.json();

        const cleaned = data.map((emp: any) => ({
          ...emp,
          hire_date: emp.hire_date?.split("T")[0] ?? "",
          date_of_birth: emp.date_of_birth?.split("T")[0] ?? "",
        }));

        setEmployees(cleaned);
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
    field: keyof Employee,
    value: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employee_id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  const handleAdd = async () => {
    const body = { ...form };

    // simple validation
    if (!body.name || !body.phone_number || !body.email || !body.role) {
      alert("Missing required fields");
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add employee");

      const created: Employee = await res.json();
      setEmployees((prev) => [...prev, created]);

      setForm({
        name: "",
        phone_number: "",
        email: "",
        role: "",
        hire_date: "",
        salary: "",
        status: "",
        address: "",
        date_of_birth: "",
      });
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

    const payload = {
      ...emp,
      employee_id: selectedId,
      hire_date: emp.hire_date?.split("T")[0] ?? emp.hire_date,
      date_of_birth: emp.date_of_birth?.split("T")[0] ?? emp.date_of_birth,
    };

    try {
      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update employee");

      let updated = await res.json();

      updated = updated.map((emp: any) => ({
        ...emp,
        hire_date: emp.hire_date?.split("T")[0] ?? "",
        date_of_birth: emp.date_of_birth?.split("T")[0] ?? "",
      }));

      setEmployees(updated);
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

      <div className={`${styles.tablePlaceholder} ${styles.tableWrapper}`}>
        <table>
          <thead>
            <tr>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>Name</th>
              <th style={{ padding: "8px" }}>Phone</th>
              <th style={{ padding: "8px" }}>Email</th>
              <th style={{ padding: "8px" }}>Role</th>
              <th style={{ padding: "8px" }}>Hire Date (YYYY-MM-DD)</th>
              <th style={{ padding: "8px" }}>Salary</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Address</th>
              <th style={{ padding: "8px" }}>DOB (YYYY-MM-DD)</th>
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
                    selectedId === emp.employee_id ? "rgba(52, 52, 52, 1)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <td style={{ padding: "8px" }}>{emp.employee_id}</td>

                {/* NAME */}
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

                {/* PHONE */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.phone_number}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "phone_number",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* EMAIL */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.email}
                    onChange={(e) =>
                      handleCellChange(emp.employee_id, "email", e.target.value)
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* ROLE */}
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

                {/* HIRE DATE */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={emp.hire_date ?? ""}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "hire_date",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* SALARY */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    value={emp.salary}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "salary",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* STATUS */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.status}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "status",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* ADDRESS */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={emp.address}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "address",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* DOB */}
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={emp.date_of_birth ?? ""}
                    onChange={(e) =>
                      handleCellChange(
                        emp.employee_id,
                        "date_of_birth",
                        e.target.value
                      )
                    }
                    className={styles.inputField}
                  />
                </td>

                {/* DELETE */}
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

      {/* UPDATE BUTTON */}
      <div style={{ marginTop: "20px" }}>
        <button className={styles.updateButton} onClick={handleUpdate}>
          Update Selected
        </button>
      </div>

      {/* ADD EMPLOYEE FORM */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          className={styles.inputField}
          onChange={(e) => updateForm("name", e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone_number}
          className={styles.inputField}
          onChange={(e) => updateForm("phone_number", e.target.value)}
        />

        <input
          type="text"
          placeholder="Email"
          value={form.email}
          className={styles.inputField}
          onChange={(e) => updateForm("email", e.target.value)}
        />

        <input
          type="text"
          placeholder="Role"
          value={form.role}
          className={styles.inputField}
          onChange={(e) => updateForm("role", e.target.value)}
        />

        <input
          type="text"
          placeholder="Hire Date (YYYY-MM-DD)"
          value={form.hire_date}
          className={styles.inputField}
          onChange={(e) => updateForm("hire_date", e.target.value)}
        />

        <input
          type="number"
          placeholder="Salary"
          value={form.salary}
          className={styles.inputField}
          onChange={(e) => updateForm("salary", e.target.value)}
        />

        <input
          type="text"
          placeholder="Status"
          value={form.status}
          className={styles.inputField}
          onChange={(e) => updateForm("status", e.target.value)}
        />

        <input
          type="text"
          placeholder="Address"
          value={form.address}
          className={styles.inputField}
          onChange={(e) => updateForm("address", e.target.value)}
        />

        <input
          type="text"
          placeholder="DOB (YYYY-MM-DD)"
          value={form.date_of_birth}
          className={styles.inputField}
          onChange={(e) => updateForm("date_of_birth", e.target.value)}
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
/*                           X-REPORTS VIEW                                */
/* ====================================================================== */

function XReportsView() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadXReport = async () => {
    setError(null);
    setRows([]);

    if (!date) {
      setError("Please enter a date.");
      return;
    }

    try {
      const res = await fetch("/api/xreports", {
        method: "POST",
        body: JSON.stringify({ date }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate X-Report");
      }

      const data = await res.json();
      setRows(data);

      if (data.length === 0) setError("No sales recorded for that date.");
    } catch (err: any) {
      setError(err.message ?? "Unexpected error");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>X-Report</h1>
      <p className={styles.subtitle}>
        Hourly breakdown of sales for a selected day.
      </p>

      <div className={styles.filterRow}>
        <label>Date (YYYY-MM-DD):</label>
        <input
          type="text"
          className={styles.inputField}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className={styles.actionButton} onClick={loadXReport}>
          Generate X-Report
        </button>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {rows.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hour</th>
              <th>Orders</th>
              <th>Total Sales ($)</th>
              <th>Returns</th>
              <th>Voids</th>
              <th>Cash ($)</th>
              <th>Credit ($)</th>
              <th>Debit ($)</th>
              <th>Gift Card ($)</th>
              <th>Mobile Pay ($)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td>{r.hour}</td>
                <td>{r.orders}</td>
                <td>{r.total_sales}</td>
                <td>{r.returns}</td>
                <td>{r.voids}</td>
                <td>{r.cash_total}</td>
                <td>{r.credit_total}</td>
                <td>{r.debit_total}</td>
                <td>{r.gift_card_total}</td>
                <td>{r.mobile_pay_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ====================================================================== */
/*                           Z-REPORTS VIEW                                */
/* ====================================================================== */

function ZReportsView() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllReports = async () => {
      try {
        const res = await fetch("/api/zreports");
        if (!res.ok) throw new Error("Failed to load Z-Reports");
        const data = await res.json();
        setAllReports(data);
      } catch (err: any) {
        setError(err.message ?? "Error loading Z-Reports");
      }
    };
    loadAllReports();
  }, []);

  const runZReport = async () => {
    setError(null);
    setRows([]);

    if (!date) {
      setError("Please enter a date.");
      return;
    }

    try {
      const res = await fetch("/api/zreports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!res.ok) throw new Error("Failed to generate Z-Report");

      const data = await res.json();
      setRows(data);

      if (data.length === 0) setError("No sales on that date.");
    } catch (err: any) {
      setError(err.message ?? "Unexpected error");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Z-Report</h1>
      <p className={styles.subtitle}>
        Daily summary with totals and cashier signatures.
      </p>

      <div className={styles.filterRow}>
        <label>Date (YYYY-MM-DD):</label>
        <input
          type="text"
          className={styles.inputField}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className={styles.actionButton} onClick={runZReport}>
          Run Z-Report
        </button>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {rows.length > 0 && (
        <>
          <h2 className={styles.subtitle}>Z-Report for {date}</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Date</th>
                  <th>Total Gross</th>
                  <th>Total Discount</th>
                  <th>Total Tax</th>
                  <th>Total Net</th>
                  <th>Void Count</th>
                  <th>Return Count</th>
                  <th>Cash Total</th>
                  <th>Credit Total</th>
                  <th>Debit Total</th>
                  <th>Gift Card Total</th>
                  <th>Mobile Pay Total</th>
                  <th>Cashier Signatures</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.report_id}</td>
                    <td>{r.report_date}</td>
                    <td>{r.total_gross}</td>
                    <td>{r.total_discount}</td>
                    <td>{r.total_tax}</td>
                    <td>{r.total_net}</td>
                    <td>{r.void_count}</td>
                    <td>{r.return_count}</td>
                    <td>{r.cash_total}</td>
                    <td>{r.credit_total}</td>
                    <td>{r.debit_total}</td>
                    <td>{r.gift_card_total}</td>
                    <td>{r.mobile_pay_total}</td>
                    <td>{r.cashier_signatures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className={styles.subtitle} style={{ marginTop: "40px" }}>
        All Z-Reports
      </h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Report Date</th>
              <th>Total Gross</th>
              <th>Total Discount</th>
              <th>Total Tax</th>
              <th>Total Net</th>
              <th>Void Count</th>
              <th>Return Count</th>
              <th>Cash Total</th>
              <th>Credit Total</th>
              <th>Debit Total</th>
              <th>Gift Card Total</th>
              <th>Mobile Pay Total</th>
              <th>Cashier Signatures</th>
            </tr>
          </thead>

          <tbody>
            {allReports.map((r, idx) => (
              <tr key={idx}>
                <td>{r.report_id}</td>
                <td>{r.report_date}</td>
                <td>{r.total_gross}</td>
                <td>{r.total_discount}</td>
                <td>{r.total_tax}</td>
                <td>{r.total_net}</td>
                <td>{r.void_count}</td>
                <td>{r.return_count}</td>
                <td>{r.cash_total}</td>
                <td>{r.credit_total}</td>
                <td>{r.debit_total}</td>
                <td>{r.gift_card_total}</td>
                <td>{r.mobile_pay_total}</td>
                <td>{r.cashier_signatures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
