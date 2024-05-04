const { createConnection } = require("promise-mysql");
require("dotenv").config();

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

if ([host, user, password, database].includes(undefined))
  throw new Error("Missing database credentials. Check .ENV file");

class Database {
  constructor() {
    this.__connection = null;
    this.__init();
  }
  async __init() {
    await this.connect();
  }
  async connect() {
    this.__connection = await createConnection({
      host,
      user,
      password,
      database,
    });
  }
  getConnection() {
    return this.__connection;
  }
}

const dbErrorMessages = {
  connectionError: "No database connection",
  queryError: "Server internal error | 500",
  formatError: "Invalid data format",
};

const myDatabase = new Database();

module.exports = { myDatabase, dbErrorMessages };
