import lodashPkg from "lodash";
import { validateTransaction } from "./transaction";

const { cloneDeep, without, flatten, map, values, find } = lodashPkg;

let transactionPool = [];

const getTransactionPool = () => {
  return cloneDeep(transactionPool);
};

const addToTransactionPool = (tx, unspentTxOuts) => {
  console.log("adding to txPool: %s", JSON.stringify(tx));
  transactionPool.push(tx);
};

const hasTxIn = (txIn, unspentTxOuts) => {
  const foundTxIn = unspentTxOuts.find((uTxO) => {
    return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
  });
  return foundTxIn !== undefined;
};

const updateTransactionPool = (unspentTxOuts) => {
  const invalidTxs = [];
  for (const tx of transactionPool) {
    for (const txIn of tx.txIns) {
      if (!hasTxIn(txIn, unspentTxOuts)) {
        invalidTxs.push(tx);
        break;
      }
    }
  }
  if (invalidTxs.length > 0) {
    console.log(
      "removing the following transactions from txPool: %s",
      JSON.stringify(invalidTxs)
    );
    transactionPool = without(transactionPool, ...invalidTxs);
  }
};

const getTxPoolIns = (aTransactionPool) => {
  return values(flatten(map((aTransactionPool, (tx) => tx.txIns))));
};

const isValidTxForPool = (tx, aTtransactionPool) => {
  const txPoolIns = getTxPoolIns(aTtransactionPool);

  const containsTxIn = (txIns, txIn) => {
    return find(txPoolIns, (txPoolIn) => {
      return (
        txIn.txOutIndex === txPoolIn.txOutIndex &&
        txIn.txOutId === txPoolIn.txOutId
      );
    });
  };

  for (const txIn of tx.txIns) {
    if (containsTxIn(txPoolIns, txIn)) {
      console.log("txIn already found in the txPool");
      return false;
    }
  }
  return true;
};

export { addToTransactionPool, getTransactionPool, updateTransactionPool };
