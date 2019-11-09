"use strict";

const ethers = require('ethers');


let privKey = process.argv[2];
if (!privKey) throw("must pass in privKey!");


async function deploy() {
    let contracts = loadContracts();

    let wallet = new ethers.Wallet(privKey);
    let provider = ethers.getDefaultProvider('goerli');
    wallet = wallet.connect(provider);

    let gasPrice = ethers.utils.bigNumberify("1000000000").mul(2);

    let factory = new ethers.ContractFactory(contracts.overlayAbi, contracts.overlayBin, wallet);
    let overlayContract = await factory.deploy({ gasLimit: 6000000, gasPrice, });
    console.log(`CONTRACT ADDRESS: ${overlayContract.address}`);
}

deploy();




/////////

function loadContracts() {
    let contracts = {};

    let overlaySpec = require('./build/Overlay.json');
    contracts.overlayAbi = JSON.parse(overlaySpec.contracts['Overlay.sol:Overlay'].abi);
    contracts.overlayBin = overlaySpec.contracts['Overlay.sol:Overlay'].bin;

    return contracts;
}
