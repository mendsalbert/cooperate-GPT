const mysql = require("mysql2/promise");
const { Pool } = require("pg");
const MongoClient = require("mongodb").MongoClient;

// MySQL connection
const connectMySQL = async (config) => {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
    });
    console.log("MySQL Connected");
    return connection;
  } catch (error) {
    console.error("MySQL connection error:", error);
    throw error;
  }
};

// PostgreSQL connection
const connectPostgreSQL = async (config) => {
  try {
    const pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
    });
    await pool.connect();
    console.log("PostgreSQL Connected");
    return pool;
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
  }
};

// MongoDB connection
const connectMongoDB = async (config) => {
  try {
    const url = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
    return client.db(config.database);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Function to connect to a database based on its type
const connectToDatabase = async (config) => {
  switch (config.type) {
    case "MySQL":
      return await connectMySQL(config);
    case "PostgreSQL":
      return await connectPostgreSQL(config);
    case "MongoDB":
      return await connectMongoDB(config);
    default:
      throw new Error("Unsupported database type");
  }
};

module.exports = {
  connectToDatabase,
};
