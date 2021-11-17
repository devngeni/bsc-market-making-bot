import { BigNumber, ethers } from "ethers";
import { bscProvider } from "../provider";
import { config } from "./../config";

export const balanceOf = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  tokenAddress: string
) => {
  const account = new ethers.Wallet(
    wallet.PRIVATE_KEY,
    bscProvider.provider
  ).connect(bscProvider.provider);

  const ERC20TokenContract = new ethers.Contract(
    tokenAddress,
    ["function balanceOf(address account) public view returns(uint256)"],
    account
  );

  try {
    const balance = await ERC20TokenContract.balanceOf(tokenAddress);
    return parseInt(balance._hex, 16) / Math.pow(10, 18);
  } catch (error) {
    console.log(error);
  }

  return 0;
};
