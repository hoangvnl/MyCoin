const SHA256 = require("crypto-js/sha256");
import {
  createTransaction,
  getBalance,
  getPrivateFromWallet,
  getPublicFromWallet,
} from "./wallet";
import { getCoinbaseTransaction, isValidAddress } from "./transaction";
// in seconds
const BLOCK_GENERATION_INTERVAL = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
class Block {
  constructor(index, hash, precedingHash, timestamp, data, difficulty, nonce) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.precedingHash = precedingHash;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}
let blockchain = [getGenesisBlock()];

let unspentTxOuts = [];

const calculateHash = (
  index,
  precedingHash,
  timestamp,
  data,
  difficulty,
  nonce
) => {
  return SHA256(
    index +
      precedingHash +
      timestamp +
      JSON.stringify(data) +
      difficulty +
      nonce
  ).toString();
};

const getGenesisBlock = () => {
  return new Block(
    0,
    "91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627",
    "",
    "1465154705",
    "my genesis block!"
  );
};

const getBlockchain = () => blockchain;

const getLatestBlock = () => {
  return blockchain[blockchain.length - 1];
};

const generateNextBlock = (blockData) => {
  const previousBlock = getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Data().getTime() / 1000;
  const nextHash = calculateHash(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    JSON.stringify(blockData)
  );

  return new Block(
    nextIndex,
    nextTimestamp,
    blockData,
    previousBlock.hash,
    nextHash
  );
};

const generateNextBlockWithTransaction = (receiverAddress, amount) => {
  if (!isValidAddress(receiverAddress)) {
    throw Error("invalid address");
  }
  if (typeof amount !== "number") {
    throw Error("invalid amount");
  }
  const coinbaseTx = getCoinbaseTransaction(
    getPublicFromWallet(),
    getLatestBlock().index + 1
  );
  const tx = createTransaction(
    receiverAddress,
    amount,
    getPrivateFromWallet(),
    unspentTxOuts
  );
  const blockData = [coinbaseTx, tx];
  return generateRawNextBlock(blockData);
};

const calculateHashForBlock = (block) =>
  calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce
  );

const isValidNewBlock = (newBlock, previousBlock) => {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log("invalid index");
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log("invalid previous hash");
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.log("invalid hash");
    return false;
  }
  return true;
};

const isValidChain = (blockchainToValidate) => {
  const isValidGenesis = (block) => {
    return JSON.stringify(block) === JSON.stringify(getGenesisBlock());
  };

  if (!isValidGenesis(blockchainToValidate[0])) {
    return false;
  }

  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (
      !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])
    ) {
      return false;
    }
  }
  return true;
};

const replaceChain = (newBlocks) => {
  if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
    console.log("new blockchain is valid");
    blockchain = newBlocks;
  } else {
    console.log("received blockchain invalid");
  }
};

const hashMatchesDifficulty = (hash, difficulty) => {
  const hashInBinary = hexToBinary(hash);
  const requiredPrefix = "0".repeat(difficulty);
  return hashInBinary.startsWith(requiredPrefix);
};

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
      nonce
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(
        index,
        hash,
        previousHash,
        timestamp,
        data,
        difficulty,
        nonce
      );
    }
    nonce++;
  }
};

const getDifficulty = (aBlockchain) => {
  const latestBlock = aBlockchain[blockchain.length - 1];
  if (
    latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, aBlockchain);
  } else {
    return latestBlock.difficulty;
  }
};

const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
  const prevAdjustmentBlock =
    aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  if (timeTaken < timeExpected / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    return prevAdjustmentBlock.difficulty - 1;
  } else {
    return prevAdjustmentBlock.difficulty;
  }
};

const getAccountBalance = () => {
  return getBalance(getPublicFromWallet(), unspentTxOuts);
};

export {
  Block,
  generateNextBlock,
  getBlockchain,
  getAccountBalance,
  generateNextBlockWithTransaction,
};
