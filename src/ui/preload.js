const { contextBridge, ipcRenderer } = require("electron");
const { myDatabase, dbErrorMessages } = require("../database.js");

contextBridge.exposeInMainWorld("electron", {
  dbErrorMessages,

  viewProducts: () => ipcRenderer.send("view-products"),

  createProduct: async (product) => {
    const conn = myDatabase.getConnection();
    if (conn === null) throw new Error(dbErrorMessages.connectionError);
    // Validacion de formato
    if (
      product.name.trim().length < 3 ||
      product.category.trim().length < 3 ||
      product.description.trim().length < 3 ||
      product.price.trim().length < 1
    ) {
      throw new Error(dbErrorMessages.formatError);
    }
    try {
      product.price = parseFloat(product.price);
    } catch {
      throw new Error(dbErrorMessages.formatError);
    }
    //
    try {
      const result = await conn.query("INSERT INTO product SET ?", product);
      ipcRenderer.send("notification", {
        title: "Electron & MySQL",
        body: "New product saved successfully",
      });
      return { ...product, id: result.insertId };
    } catch {
      throw new Error(dbErrorMessages.queryError);
    }
  },

  getProductById: async (id) => {
    const conn = myDatabase.getConnection();
    if (conn === null) throw new Error(dbErrorMessages.connectionError);
    try {
      const [result] = await conn.query(
        `SELECT * FROM product WHERE \`product\`.\`id\` = ${id}`
      );
      return result;
    } catch {
      throw new Error(dbErrorMessages.queryError);
    }
  },

  getProducts: async () => {
    const conn = myDatabase.getConnection();
    if (conn === null) throw new Error(dbErrorMessages.connectionError);
    try {
      const products = await conn.query(
        "SELECT * FROM product ORDER BY id DESC"
      );
      return products;
    } catch {
      throw new Error(dbErrorMessages.queryError);
    }
  },

  removeProductById: async (id) => {
    const conn = myDatabase.getConnection();
    if (conn === null) throw new Error(dbErrorMessages.connectionError);
    try {
      const product = await conn.query("DELETE FROM product WHERE id = ?", id);
      return product;
    } catch {
      throw new Error(dbErrorMessages.queryError);
    }
  },

  updateProductById: async (id, valuesToUpdate) => {
    const conn = myDatabase.getConnection();
    if (conn === null) throw new Error(dbErrorMessages.connectionError);
    try {
      const [product] = await conn.query(
        "SELECT * FROM product WHERE id = ?",
        id
      );
      if (!product) throw new Error(dbErrorMessages.queryError);
      const updatedProduct = { ...product, ...valuesToUpdate };
      const result = await conn.query("UPDATE product SET ? WHERE id = ?", [
        updatedProduct,
        id,
      ]);
      return result;
    } catch (error) {
      throw new Error(dbErrorMessages.queryError);
    }
  },

  refreshConnection: async () => {
    await myDatabase.connect();
  },
});
