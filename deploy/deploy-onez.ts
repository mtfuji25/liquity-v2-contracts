const { network, ethers } = require("hardhat");

async function main() {
  console.log("network", network.name);

  const governance = "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC";

  const ONEZ = await ethers.getContractFactory("ONEZ");
  const instance = await ONEZ.deploy();
  await instance.deployed();
  console.log("created", instance.address);

  await this.hre.run("verify:verify", {
    address: instance.address,
    constructorArguments: [governance],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
