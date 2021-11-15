import { ethers } from "ethers";
import { bscProvider } from "../provider";
import { config } from "./../config";
// Approve ABI
const approveABI = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
];

// MAXIMUM AMOUNT TO APPROVE
const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

/**
 *
 * @param wallet: {ADDRESS: user address, PRIVATE_KEY:  user private key} Current Wallet private key
 * @param tokenToApprove Token to approve address
 * @param nonce Nonce of the incoming transaction
 */
export const approve = async (
  wallet: { ADDRESS: string; PRIVATE_KEY: string },
  tokenToApprove: string
) => {
  const account = new ethers.Wallet(
    wallet.PRIVATE_KEY,
    bscProvider.provider
  ).connect(bscProvider.provider);

  try {
    const nonce = await bscProvider.provider.getTransactionCount(
      wallet.ADDRESS,
      "pending"
    );
    let contract = new ethers.Contract(tokenToApprove, approveABI, account);
    const tx = await contract.approve(config.BSC.PANCAKE_V2_ROUTE, MAX_INT, {
      nonce,
      gasPrice: 20 * 10 ** 9,
      gasLimit: 500000,
    });

    console.log("\n\n\n ************** APPROVE ***************");
    console.log("Transaction hash: ", tx.hash);
    console.log("*********************************************");
    return { success: true, data: `${tx.hash}` };
  } catch (error: any) {
    console.log(`Approving Error: ${error.message}`);
    return { success: false, data: `${error}` };
  }
};
