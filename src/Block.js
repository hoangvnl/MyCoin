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

  addNewBlock(newBlock) {
    newBlock.precedingHash = this.obtainLatestBlock().hash;
    //newBlock.hash = newBlock.computeHash();
    newBlock.proofOfWork(this.difficulty);
    this.blockchain.push(newBlock);
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

  checkValidNewBlock(newBlock, previousBlock) {
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
}

export default Block;
