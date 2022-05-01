import pkg from "pg";
import util from "util";

const { Pool } = pkg;
console.log(process.env.DB_USER);
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mycoin",
  password: "postgres",
  port: 5432,
});

const pool_query = util.promisify(pool.query).bind(pool);

export default pool_query;
