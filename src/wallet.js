import ecPkg from "elliptic";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import lodashPkg from "lodash";
import {
  getPublicKey,
  getTransactionId,
  signTxIn,
  Transaction,
  TxIn,
  TxOut,
} from "./transaction";
const { map, sum, filter, find, without, flatten, values } = lodashPkg;
const { ec } = ecPkg;
const EC = new ec("secp256k1");
const privateKeyLocation = process.env.PRIVATE_KEY || "node/wallet/private_key";

const getPrivateFromWallet = () => {
  const buffer = readFileSync(privateKeyLocation, "utf8");
  return buffer.toString();
};

const getPublicFromWallet = () => {
  const privateKey = getPrivateFromWallet();
  const key = EC.keyFromPrivate(privateKey, "hex");
  return key.getPublic().encode("hex");
};

const generatePrivateKey = () => {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
};

const initWallet = () => {
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

const deleteWallet = () => {
  if (existsSync(privateKeyLocation)) {
    unlinkSync(privateKeyLocation);
  }
};

const getBalance = (address, unspentTxOuts) => {
  return sum(
    map(findUnspentTxOuts(address, unspentTxOuts), (uTxO) => uTxO.amount)
  );
};

const findUnspentTxOuts = (ownerAddress, unspentTxOuts) => {
  console.log(ownerAddress);
  console.log(unspentTxOuts);
  return filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
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

  const eMsg =
    "Cannot create transaction from the available unspent transaction outputs." +
    " Required amount:" +
    amount +
    ". Available unspentTxOuts:" +
    JSON.stringify(myUnspentTxOuts);
  throw Error(eMsg);
};

const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
  const txOut1 = new TxOut(receiverAddress, amount);
  if (leftOverAmount === 0) {
    return [txOut1];
  } else {
    const leftOverTx = new TxOut(myAddress, leftOverAmount);
    return [txOut1, leftOverTx];
  }
};

const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
  const txIns = values(flatten(map(transactionPool, (tx) => tx.txIns)));

  const removable = [];
  for (const unspentTxOut of unspentTxOuts) {
    const txIn = find(txIns, (aTxIn) => {
      return (
        aTxIn.txOutIndex === unspentTxOut.txOutIndex &&
        aTxIn.txOutId === unspentTxOut.txOutId
      );
    });

    if (txIn === undefined) {
    } else {
      removable.push(unspentTxOut);
    }
  }

  return without(unspentTxOuts, ...removable);
};

const createTransaction = (
  receiverAddress,
  amount,
  privateKey,
  unspentTxOuts,
  txPool
) => {
  console.log("txPool: %s", JSON.stringify(txPool));
  const myAddress = getPublicKey(privateKey);
  const myUnspentTxOutsA = unspentTxOuts.filter(
    (uTxO) => uTxO.address === myAddress
  );

  const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);

  // filter from unspentOutputs such inputs that are referenced in pool
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

export {
  createTransaction,
  getPublicFromWallet,
  getPrivateFromWallet,
  getBalance,
  generatePrivateKey,
  initWallet,
  deleteWallet,
  findUnspentTxOuts,
  accessWallet,
};
