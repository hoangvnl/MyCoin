import pkg from "elliptic";
import { existsSync, readFileSync, writeFileSync, writeFile } from "fs";
import * as _ from "lodash";

const { ec } = pkg;
const EC = new ec("secp256k1");
const privateKeyLocation = "node/wallet/private_key";

const generatePrivateKey = () => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};

const initWallet = () => {
  // let's not override existing private keys
  // if (existsSync(privateKeyLocation)) {
  //   return;
  // }
  return generatePrivateKey();
};

const accessWallet = (key) => {
  try {
    writeFileSync(privateKeyLocation, key);
    return getPublicFromWallet();
  } catch (err) {
    console.log(err);
  }
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

const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];
  for (const myUnspentTxOut of myUnspentTxOuts) {
    includedUnspentTxOuts.push(myUnspentTxOut);
    currentAmount = currentAmount + myUnspentTxOut.amount;
    if (currentAmount >= amount) {
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }
  throw Error("not enough coins to send transaction");
};

const createTransaction = (
  receiverAddress,
  amount,
  privateKey,
  unspentTxOuts
) => {
  const myAddress = getPublicKey(privateKey);
  const myUnspentTxOuts = unspentTxOuts.filter(
    (uTxO) => uTxO.address === myAddress
  );

  const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
    amount,
    myUnspentTxOuts
  );

  const toUnsignedTxIn = (unspentTxOut) => {
    const txIn = new TxIn();
    txIn.txOutId = unspentTxOut.txOutId;
    txIn.txOutIndex = unspentTxOut.txOutIndex;
    return txIn;
  };

  const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

  const tx = new Transaction();
  tx.txIns = unsignedTxIns;
  tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
  tx.id = getTransactionId(tx);

  tx.txIns = tx.txIns.map((txIn, index) => {
    txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts);
    return txIn;
  });

  return tx;
};

const getPrivateFromWallet = () => {
  const buffer = readFileSync(privateKeyLocation, "utf8");
  return buffer.toString();
};

export {
  initWallet,
  createTransaction,
  getPublicFromWallet,
  getPrivateFromWallet,
  getBalance,
  generatePrivateKey,
  accessWallet,
};
