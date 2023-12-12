import { ethers } from "hardhat";
import { DelegatedOps } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function getDelegateHash(
  delegateContract: DelegatedOps,
  owner: SignerWithAddress,
  delegatee: string,
  deadline: number
) {
  const network = await ethers.provider.getNetwork();
  const domain = {
    name: "ONEZ.cash",
    version: "1",
    chainId: network.chainId,
    verifyingContract: delegateContract.address,
  };

  //   "Delegate(address owner,address delegate,bool value,uint256 nonce,uint256 deadline)"
  const DelegateType = {
    Delegate: [
      { name: "owner", type: "address" },
      { name: "delegate", type: "address" },
      { name: "value", type: "bool" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const playerNonce = await delegateContract.nonces(owner.address);

  const data = {
    owner: owner.address,
    delegate: delegatee,
    value: true,
    deadline,
    nonce: playerNonce.toNumber(),
  };

  const playerSignature = await owner._signTypedData(
    domain,
    DelegateType,
    data
  );

  return {
    who: owner.address,
    signature: playerSignature,
    nonce: Number(playerNonce),
  };
}
