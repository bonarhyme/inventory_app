import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const Home = () => {
  const [db, setDb] = useState(null);
  const [errors, setErrors] = useState({
    dbOpen: "",
    itemAdd: "",
  });
  const [successes, setSuccesses] = useState({
    addItem: "Success",
  });
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [productImage, setproductImage] = useState("");
  const [id, setId] = useState("");
  const imageRef = useRef(null);
  const [itemsList, setItemsList] = useState([]);
  const [editProduct, setEditProduct] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const openRequest = window.indexedDB.open("inventory_db", 1);

      openRequest.onerror = () => {
        setErrors({ ...errors, dbOpen: "Database failed to open" });
      };
      openRequest.onsuccess = () => {
        setDb(openRequest.result);
      };

      openRequest.onupgradeneeded = (e) => {
        setDb(e.target.result);
        // db
        const objectStore = e.target.result.createObjectStore(
          "inventory_store",
          {
            keyPath: "id",
            autoIncrement: true,
          }
        );

        objectStore.createIndex("productName", "productName", {
          unique: false,
        });
        objectStore.createIndex("description", "description", {
          unique: false,
        });
        objectStore.createIndex("quantity", "quantity", { unique: false });
        objectStore.createIndex("unitPrice", "unitPrice", { unique: false });
        objectStore.createIndex("productImage", "productImage", {
          unique: false,
        });
      };
    }
  }, []);
  const clearForm = () => {
    setProductName("");
    setDescription("");
    setQuantity(0);
    setUnitPrice(0);
    setproductImage("");
    imageRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      productName,
      description,
      quantity,
      unitPrice,
      productImage,
    };

    const transaction = db.transaction(["inventory_store"], "readwrite");

    const objectStore = transaction.objectStore("inventory_store");

    const addRequest = objectStore.add(newItem);

    addRequest.addEventListener("success", () => {
      clearForm();
      setSuccesses({ ...successes, addItem: "Added Item successfully" });
      console.log("Success adding");
    });

    transaction.addEventListener("complete", () => {
      setSuccesses({ ...successes, addItem: "Item added successfully" });
      setErrors({ ...errors, itemAdd: "" });
      console.log("Completely adding");
    });

    transaction.addEventListener("error", (error) => {
      console.log(error);
      setErrors({ ...errors, itemAdd: "Adding item failed. Try again" });
      setSuccesses({ ...successes, addItem: "" });
      console.log("error adding");
    });

    displayData();
  };

  useEffect(() => {
    if (db) {
      displayData();
    }
  }, [db]);

  const displayData = () => {
    const objectStore = db
      .transaction("inventory_store")
      .objectStore("inventory_store")
      .getAll();

    objectStore.addEventListener("success", (e) => {
      const cursor = e.target.result;
      setItemsList(cursor);
      // console.log(cursor);
    });
  };

  const handleRemove = (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    if (db) {
      const transaction = db.transaction(["inventory_store"], "readwrite");
      const objectStore = transaction.objectStore("inventory_store");
      const deleteRequest = objectStore.delete(id);

      transaction.addEventListener("complete", () => {
        setItemsList((prev) => prev.filter((item) => item.id !== id));
      });
    }
  };

  const handleEdit = (id) => {
    const transaction = db.transaction(["inventory_store"], "readwrite");
    const objectStore = transaction.objectStore("inventory_store").get(id);

    objectStore.addEventListener("success", (e) => {
      const item = e.target.result;
      setProductName(item?.productName);
      setDescription(item?.description);
      setQuantity(item?.quantity);
      setUnitPrice(item?.unitPrice);
      setproductImage(item?.productImage);
      setId(id);
      setEditProduct(true);
    });
  };

  const handleEditSave = (e) => {
    e.preventDefault();

    const transaction = db.transaction(["inventory_store"], "readwrite");

    const objectStore = transaction.objectStore("inventory_store");
    const objectStoreSingle = objectStore.get(id);

    objectStoreSingle.addEventListener("success", () => {
      const cursor = objectStoreSingle.result;
      if (cursor) {
        cursor.productName = productName;
        cursor.description = description;
        cursor.quantity = quantity;
        cursor.unitPrice = unitPrice;
        cursor.productImage = productImage;
        const request = objectStore.put(cursor);

        request.addEventListener("success", () => {
          console.log("Edited successfully");
          clearForm();
          displayData();
          setEditProduct(false);
        });
      }
    });
  };
  return (
    <>
      <Head>
        <title>Inventory app</title>
      </Head>
      <main className="container">
        <h1>Inventory App</h1>

        <section style={{ maxWidth: "500px" }}>
          <h2>{editProduct ? "Edit item" : "Add item"}</h2>
          {errors.dbOpen && (
            <div style={{ backgroundColor: "#aa0000", color: "white" }}>
              {errors.dbOpen}
            </div>
          )}
          {errors.itemAdd && (
            <div style={{ backgroundColor: "#aa0000", color: "white" }}>
              {errors.itemAdd}
            </div>
          )}
          <form onSubmit={editProduct ? handleEditSave : handleSubmit}>
            <div className="form-control">
              <label htmlFor="productName">Product name</label>
              <input
                type="text"
                placeholder="Enter product name"
                required
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label htmlFor="description">Product description</label>
              <input
                type="text"
                placeholder="Enter product description"
                required
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label htmlFor="quantity">Product quantity</label>
              <input
                type="number"
                placeholder="Enter product quantity"
                required
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label htmlFor="unitPrice">Product unit price</label>
              <input
                type="number"
                placeholder="Enter product price"
                required
                id="unitPrice"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label htmlFor="productImage">Select product image</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Enter product image"
                required={!editProduct}
                id="productImage"
                ref={imageRef}
                onChange={(e) => setproductImage(e.target.files[0])}
              />
            </div>
            <div className="form-control">
              <button type="submit">
                {editProduct ? "Save" : "Add product"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2>Inventory Items</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product name</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {itemsList?.length > 0 &&
                itemsList?.map((item, index) => {
                  return (
                    <tr key={item?.id}>
                      <td>
                        {" "}
                        <b>{index + 1}.</b>
                      </td>
                      <td>{item?.productName}</td>
                      <td>N{item?.unitPrice}</td>
                      <td>{item?.quantity}</td>
                      <td>
                        <Link href={`/item/${item?.id}`} passHref>
                          <a
                            className="button button-outline"
                            style={{ marginRight: "10px" }}
                          >
                            view
                          </a>
                        </Link>
                        <button
                          onClick={() => handleEdit(item?.id)}
                          style={{ marginRight: "10px" }}
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleRemove(item?.id)}
                          style={{
                            marginRight: "10px",
                            backgroundColor: "#aa0000",
                          }}
                        >
                          remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
};

export default Home;
