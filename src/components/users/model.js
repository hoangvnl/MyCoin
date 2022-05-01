import pool_query from "../../utils/db";
import { generatePrivateKey } from "./helpers";
import bcrypt from "bcrypt";

const TBL_USERS = "Users";
const SALT_ROUNDS = 10;

export default {
  add: (password) => {
    const privateKey = generatePrivateKey();
    const bcryptPassword = bcrypt.hash(password, SALT_ROUNDS);
    return pool_query(
      `insert into ${TBL_USERS} (password, privateKey) values ('${password}','${privateKey}');`
    );
  },
};
