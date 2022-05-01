const SHA256 = require("crypto-js/sha256");
class Block {
  constructor(index, hash, precedingHash, timestamp, data) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.precedingHash = precedingHash;
    this.hash = hash;
  }

  blockchain = [this.getGenesisBlock()];

  calculateHash(index, precedingHash, timestamp, data) {
    return SHA256(
      index + precedingHash + timestamp + JSON.stringify(data)
    ).toString();
  }

  getGenesisBlock() {
    return new Block(
      0,
      "91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627",
      "",
      "1465154705",
      "my genesis block!"
    );
  }

  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  generateNextBlock(blockData) {
    const previousBlock = this.getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Data().getTime() / 1000;
    const nextHash = this.calculateHash(
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
  }

  calculateHashForBlock = (block) =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data);

  isValidNewBlock(newBlock, previousBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log("invalid index");
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log("invalid previous hash");
      return false;
    } else if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
      console.log("invalid hash");
      return false;
    }
    return true;
  }

  isValidChain = (blockchainToValidate) => {
    const isValidGenesis = (block) => {
      return JSON.stringify(block) === JSON.stringify(this.getGenesisBlock());
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

  replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
      console.log("new blockchain is valid");
      blockchain = newBlocks;
    } else {
      console.log("received blockchain invalid");
    }
  };
}

export default Block;
