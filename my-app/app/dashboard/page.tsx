"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

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

  const goBack = () => setView("dashboard");

  return (
    <div className={styles.container}>
      {view === "dashboard" ? (
        <>
          <h1 className={styles.title}>Manager Dashboard</h1>
          <p className={styles.subtitle}>Select a function to manage:</p>

          <div className={styles.buttonGrid}>
            <button
              className={styles.actionButton}
              onClick={() => setView("menu")}
            >
              Manage Menu Items
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView("inventory")}
            >
              Manage Inventory
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView("employees")}
            >
              Manage Employees
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView("productUsage")}
            >
              Product Usage
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView("xReports")}
            >
              X Reports
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setView("zReports")}
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
              {view === "menu" && "Manage Menu Items"}
              {view === "inventory" && "Manage Inventory"}
              {view === "employees" && "Manage Employees"}
              {view === "productUsage" && "Product Usage"}
              {view === "xReports" && "X Reports"}
              {view === "zReports" && "Z Reports"}
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
  );
}

function ManageMenuView() {
  type MenuItem = {
    item_id: number;
    item_name: string;
    // category: string;
    price: number;
  };

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  // const [newCategory, setNewCategory] = useState("");
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
    // const category = newCategory.trim();
    const priceNum = Number(newPrice);
    if (!name || Number.isNaN(priceNum)) {
      alert("Enter valid name and price");
      return;
    }

    try {
      const res = await fetch("/api/menu_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ name, category, price: priceNum }),
        body: JSON.stringify({ name, price: priceNum }),
      });
      if (!res.ok) throw new Error("Failed to add item");

      const created: MenuItem = await res.json();
      setItems((prev) => [...prev, created]);

      setNewName("");
      // setNewCategory("");
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
    // const category = item.category.trim();
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
                {/* <td style={{ padding: "8px" }}> */}
                  {/* <input
                    type="text"
                    value={item.category}
                    onChange={(e) =>
                      handleCellChange(item.item_id, "category", e.target.value)
                    }
                    style={{ width: "100%" }}
                  /> */}
                {/* </td> */}
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
        <button
          onClick={handleUpdate}
          className={styles.updateButton}
        >
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
        {/* <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className={styles.inputField}
        /> */}
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className={styles.inputField}
        />

        <button
          onClick={handleAdd}
          className={styles.addButton}
        >
          Add
        </button>
      </div>
    </div>
  );
}

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
      {loading && (
        <p className={styles.helperText}>Loading ingredients...</p>
      )}
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

function ManageEmployeesView() {
  return (
    <div>
      <p className={styles.helperText}>implement backend</p>
      <div className={styles.tablePlaceholder}>
        <p>Employees table will go here.</p>
      </div>
    </div>
  );
}

function ProductUsageView() {
  return (
    <div>
      <p className={styles.helperText}>implement backend</p>
      <div className={styles.tablePlaceholder}>
        <p>Product usage report UI will go here.</p>
      </div>
    </div>
  );
}

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
