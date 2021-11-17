import { BigNumber, ethers } from "ethers";
import { bscProvider } from "../provider";
import { config } from "./../config";

export const getAllowance = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  tokenAddress: string
): Promise<BigNumber> => {
  const account = new ethers.Wallet(
    wallet.PRIVATE_KEY,
    bscProvider.provider
  ).connect(bscProvider.provider);

  const ERC20TokenContract = new ethers.Contract(
    tokenAddress,
    [
      "function allowance(address owner, address spender) public view returns(uint256)",
    ],
    account
  );

  try {
    const allowance = await ERC20TokenContract.allowance(
      wallet.ADDRESS,
      config.BSC.PANCAKE_V2_ROUTE
    );
    return allowance;
  } catch (error) {
    console.log(error);
  }

  return BigNumber.from("0");
};
