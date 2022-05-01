import { ec } from "elliptic";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import * as _ from "lodash";

const EC = new ec("secp256k1");
const privateKeyLocation = "node/wallet/private_key";
const generatePrivateKey = () => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};

const initWallet = () => {
  // let's not override existing private keys
  if (existsSync(privateKeyLocation)) {
    return;
  }
  const newPrivateKey = generatePrivateKey();

  writeFileSync(privateKeyLocation, newPrivateKey);
  console.log("new wallet with private key created");
};

const getPublicFromWallet = () => {
  const privateKey = getPrivateFromWallet();
  const key = EC.keyFromPrivate(privateKey, "hex");
  return key.getPublic().encode("hex");
};

const getBalance = (address, unspentTxOuts) => {
  return _(unspentTxOuts)
    .filter((uTxO) => uTxO.address === address)
    .map((uTxO) => uTxO.amount)
    .sum();
};
