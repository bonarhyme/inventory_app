import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const Item = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [productImage, setproductImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const openRequest = window.indexedDB.open("inventory_db", 1);
      openRequest.onerror = () => {
        setError("Database failed to open");
      };
      openRequest.onsuccess = () => {
        const transaction = openRequest.result.transaction(
          ["inventory_store"],
          "readwrite"
        );

        const productId = Number(window.location.pathname.split("/")[2]);

        const objectStore = transaction
          .objectStore("inventory_store")
          .get(productId);

        objectStore.addEventListener("success", (e) => {
          const item = e.target.result;
          setProductName(item?.productName);
          setDescription(item?.description);
          setQuantity(item?.quantity);
          setUnitPrice(item?.unitPrice);
          setproductImage(item?.productImage);
        });
      };
    }
  }, []);
  return (
    <>
      <Head>
        <title>{productName}</title>
      </Head>
      <main className="container">
        {error && (
          <div style={{ backgroundColor: "#aa0000", color: "white" }}>
            {error}
          </div>
        )}
        <h1>{productName}</h1>
        <p>{description}</p>
        <p>Quantity: {quantity}</p>
        <p>Unit Price: {unitPrice}</p>
        {productImage && (
          <div>
            <Image
              src={URL.createObjectURL(productImage)}
              alt={productName}
              width={500}
              height={300}
              objectFit="cover"
            />
          </div>
        )}
      </main>
    </>
  );
};

export default Item;
