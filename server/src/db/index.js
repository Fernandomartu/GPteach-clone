const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return result; // Assuming you want to return the rows from the query
  },
};
