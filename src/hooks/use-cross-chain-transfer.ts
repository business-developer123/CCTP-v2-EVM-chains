"use client";

import { useState } from "react";
import {
  createWalletClient,
  http,
  encodeFunctionData,
  HttpTransport,
  type Chain,
  type Account,
  type WalletClient,
  type Hex,
  TransactionExecutionError,
  parseUnits,
  createPublicClient,
  formatUnits,
  parseEther,
  custom,
  parseGwei,
  Transaction,
  WriteContractReturnType,
  keccak256,
} from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import axios from "axios";
import {
  mainnet,
  avalanche,
  arbitrum,
  linea,
  base,
  optimism,
  polygon,
  unichain,
} from "viem/chains";
import {
  SupportedChainId,
  CHAIN_IDS_TO_USDC_ADDRESSES,
  CHAIN_IDS_TO_TOKEN_MESSENGER_V2,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V2,
  DESTINATION_DOMAINS_V2,
  CHAIN_TO_RPC_URL,
  CHAIN_TO_CHAIN_NAME_V2,
  CHAIN_IDS_TO_TOKEN_MESSENGER_V1,
  DESTINATION_DOMAINS_V1,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V1,
} from "@/lib/chains";
import { sendTransaction } from "viem/actions";
import { Config, useEstimateGas, useSendTransaction } from 'wagmi';
import { SendTransactionMutate, WriteContractMutate } from "wagmi/query";

import { createConfig, writeContract, switchChain } from "@wagmi/core";
import { Sree_Krushnadevaraya } from "next/font/google";

export type TransferStep =
  | "idle"
  | "approving"
  | "burning"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

export type ResumeStep =
  | "idle"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

interface ParsedMessage {
  sourceDomain: number;
  destinationDomain: number;
  recipientAddress: string;
}

function parseCrossChainMessage(messageHex: string): ParsedMessage {
  const messageBuffer = Buffer.from(messageHex.slice(2), 'hex'); // Remove 0x prefix

  // Extract fields using byte offsets
  const sourceDomain = messageBuffer.readUInt32BE(4);   // Bytes 4-7
  const destinationDomain = messageBuffer.readUInt32BE(8); // Bytes 8-11

  // Recipient is bytes32 at offset 76 (needs conversion to address)
  const recipientBytes32 = messageBuffer.subarray(76, 108);
  const recipientAddress = '0x' + recipientBytes32.subarray(12).toString('hex');

  return {
    sourceDomain,
    destinationDomain,
    recipientAddress
  };
}

const config = createConfig({
  chains: [mainnet, avalanche, arbitrum, base, linea, optimism, polygon, unichain],
  transports: {
    [mainnet.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [linea.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [unichain.id]: http(),
  },
})

const chains = {
  // Testnets
  // [SupportedChainId.ETH_SEPOLIA]: sepolia,
  // [SupportedChainId.AVAX_FUJI]: avalancheFuji,
  // [SupportedChainId.BASE_SEPOLIA]: baseSepolia,
  // Mainnets
  [SupportedChainId.ETH_MAINNET]: mainnet,
  [SupportedChainId.AVAX_MAINNET]: avalanche,
  [SupportedChainId.ARBITRUM_ONE]: arbitrum,
  [SupportedChainId.BASE_MAINNET]: base,
  [SupportedChainId.LINEA_MAINNET]: linea,
  [SupportedChainId.OPTIMISM_MAINNET]: optimism,
  [SupportedChainId.POLYGON_MAINNET]: polygon,
  [SupportedChainId.UNICHAIN_MAINNET]: unichain,
};

export function useCrossChainTransfer() {
  const [currentStep, setCurrentStep] = useState<TransferStep>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resumeStep, setResumeStep] = useState<ResumeStep>("idle");
  const [resumeLogs, setResumeLogs] = useState<string[]>([]);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeElapsedSeconds, setResumeElapsedSeconds] = useState(0);
  const [isResuming, setIsResuming] = useState(false);
  const [showResumeFinalTime, setShowResumeFinalTime] = useState(false);

  const DEFAULT_DECIMALS = 6;

  const addLog = (message: string) =>
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  const addResumeLog = (message: string) =>
    setResumeLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

  const getPublicClient = (chainId: SupportedChainId) => {
    return createPublicClient({
      chain: chains[chainId],
      transport: http(CHAIN_TO_RPC_URL[chainId]),
    });
  };

  const getClients = async (address: `0x${string}`, chainId: SupportedChainId) => {
    //const account = privateKeyToAccount(`0x${privateKey}`, { nonceManager });
    // @ts-ignore
    // let  = await window.ethereum
    // console.log('outer account', account);

    return createWalletClient({
      chain: chains[chainId],
      // @ts-ignore
      transport: custom(window.ethereum!)
    });
  };

  const getAllowance = async (owner: `0x${string}`, spender: `0x${string}`, chainId: SupportedChainId) => {
    const publicClient = getPublicClient(chainId);
    // const account = privateKeyToAccount(`0x${privateKey}`, { nonceManager });

    const allowance = await publicClient.readContract({
      address: CHAIN_IDS_TO_USDC_ADDRESSES[chainId],
      abi: [
        {
          constant: true,
          inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
          name: "allowance",
          outputs: [{ name: "allowance", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "allowance",
      args: [owner, spender],
    });

    const formattedAllowance = formatUnits(allowance, DEFAULT_DECIMALS);

    return formattedAllowance;
  };

  const getBalance = async (address: `0x${string}`, chainId: SupportedChainId) => {
    const publicClient = getPublicClient(chainId);
    // const account = privateKeyToAccount(`0x${privateKey}`, { nonceManager });

    const balance = await publicClient.readContract({
      address: CHAIN_IDS_TO_USDC_ADDRESSES[chainId],
      abi: [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [address],
    });

    const formattedBalance = formatUnits(balance, DEFAULT_DECIMALS);

    return formattedBalance;
  };

  const approveUSDC = async (
    address: string,
    //client: WalletClient<HttpTransport, Chain, Account>,
    sourceChainId: number,
    amount: bigint,
    maxFee: bigint = 0n,
    transferType: "fast" | "standard"
  ) => {

    await switchChain(config, {
      chainId: sourceChainId as SupportedChainId,
    })

    setCurrentStep("approving");
    addLog("Approving USDC transfer...");

    try {
      // Calculate total amount needed (transfer amount + maxFee)
      const maxFee = (amount + 9999n) / 10000n;
      const totalAmount = amount + maxFee;
      addLog(`Approving ${formatUnits(totalAmount, DEFAULT_DECIMALS)} USDC (amount: ${formatUnits(amount, DEFAULT_DECIMALS)}, fee: ${formatUnits(maxFee, DEFAULT_DECIMALS)})`);
      /*
            const tx = await client.sendTransaction({
              to: CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as `0x${string}`,
              data: encodeFunctionData({
                abi: [
                  {
                    type: "function",
                    name: "approve",
                    stateMutability: "nonpayable",
                    inputs: [
                      { name: "spender", type: "address" },
                      { name: "amount", type: "uint256" },
                    ],
                    outputs: [{ name: "", type: "bool" }],
                  },
                ],
                functionName: "approve",
                args: [CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId], totalAmount],
              }),
            });
      */

      const allowance = await getAllowance(address as `0x${string}`, CHAIN_IDS_TO_TOKEN_MESSENGER_V2[sourceChainId] as `0x${string}`, sourceChainId);
      console.log('allowance', allowance);

      if (parseUnits(allowance, DEFAULT_DECIMALS) >= totalAmount) {
        addLog('Allowance is sufficient');
        return;
      }

      const result = await writeContract(config, {
        address: CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as `0x${string}`,
        abi: [
          {
            type: "function",
            name: "approve",
            stateMutability: "nonpayable",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ],
        functionName: "approve",
        args: [transferType === 'standard' ? CHAIN_IDS_TO_TOKEN_MESSENGER_V1[sourceChainId] : CHAIN_IDS_TO_TOKEN_MESSENGER_V2[sourceChainId], totalAmount],
      });
      console.log('result', result);
      addLog('Approval Tx: ' + result);
      /*
            const tx = {
              to: CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as `0x${string}`,
              data: encodeFunctionData({
                abi: [
                  {
                    type: "function",
                    name: "approve",
                    stateMutability: "nonpayable",
                    inputs: [
                      { name: "spender", type: "address" },
                      { name: "amount", type: "uint256" },
                    ],
                    outputs: [{ name: "", type: "bool" }],
                  },
                ],
                functionName: "approve",
                args: [CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId], totalAmount],
              })
            };
      
            sendTransaction({
              ...tx
            });
      */
      // addLog(`USDC Approval Tx:`);
      // return tx;
    } catch (err) {
      setError("Approval failed");
      throw err;
    }
  };

  const burnUSDC = async (
    address: `0x${string}`,
    sourceChainId: number,
    amount: bigint,
    destinationChainId: number,
    destinationAddress: string,
    transferType: "fast" | "standard"
  ) => {
    await switchChain(config, {
      chainId: sourceChainId as SupportedChainId,
    })
    setCurrentStep("burning");
    addLog("Burning USDC...");

    try {
      // Get fast transfer fee if it's a fast transfer
      let maxFee = 0n; // Default to 0 for standard transfers
      if (transferType === "fast") {
        // const fee = await getFastTransferFees(sourceChainId, destinationChainId);
        // maxFee = parseUnits(fee.toString(), DEFAULT_DECIMALS);
        maxFee = (amount + 9999n) / 10000n;

        // Check if amount is less than or equal to max fee
        // if (amount <= maxFee) {
        //   throw new Error(
        //     `Transfer amount (${formatUnits(amount, DEFAULT_DECIMALS)} USDC) must be greater than the fast transfer fee (${formatUnits(maxFee, DEFAULT_DECIMALS)} USDC)`
        //   );
        // }

      }

      // // Check if amount is at least 0.01 USDC
      // const MIN_TRANSFER_AMOUNT = 10_000n; // 0.01 USDC with 6 decimals
      // if (amount < MIN_TRANSFER_AMOUNT) {
      //   throw new Error(
      //     `Amount must be at least 0.01 USDC. You entered: ${formatUnits(
      //       amount,
      //       DEFAULT_DECIMALS
      //     )} USDC`
      //   );
      // }

      const finalityThreshold = transferType === "fast" ? 1000 : 2000;

      // Properly format the mintRecipient to bytes32
      // Remove 0x prefix, pad to 64 characters (32 bytes), and add 0x back
      const recipientAddress = destinationAddress
        .toLowerCase()
        .replace(/^0x/, "");
      const mintRecipient = `0x${recipientAddress.padStart(64, "0")}` as Hex;

      // const publicClient = getPublicClient(sourceChainId);
      // const feeData = await publicClient.estimateFeesPerGas();
      let tx;
      if (transferType == 'fast') {
        tx = await writeContract(config, {
          address: CHAIN_IDS_TO_TOKEN_MESSENGER_V2[sourceChainId] as `0x${string}`,
          abi: [
            {
              type: "function",
              name: "depositForBurn",
              stateMutability: "nonpayable",
              inputs: [
                { name: "amount", type: "uint256" },
                { name: "destinationDomain", type: "uint32" },
                { name: "mintRecipient", type: "bytes32" },
                { name: "burnToken", type: "address" },
                { name: "destinationCaller", type: "bytes32" },
                { name: "maxFee", type: "uint256" },
                { name: "minFinalityThreshold", type: "uint32" },
              ],
              outputs: [],
            },
          ],
          functionName: "depositForBurn",
          args: [
            amount,
            DESTINATION_DOMAINS_V2[destinationChainId],
            mintRecipient,
            CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
            mintRecipient,
            maxFee,
            finalityThreshold,
          ],
          // maxFeePerGas: feeData.maxFeePerGas,
          // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          // gas: 300000n, // Keep the increased gas limit for V2 functions
        })
      } else {
        tx = await writeContract(config, {
          address: CHAIN_IDS_TO_TOKEN_MESSENGER_V1[sourceChainId] as `0x${string}`,
          abi: [
            {
              type: "function",
              name: "depositForBurn",
              stateMutability: "nonpayable",
              inputs: [
                { name: "amount", type: "uint256" },
                { name: "destinationDomain", type: "uint32" },
                { name: "mintRecipient", type: "bytes32" },
                { name: "burnToken", type: "address" },
              ],
            },
          ],
          functionName: "depositForBurn",
          args: [
            amount,
            DESTINATION_DOMAINS_V1[destinationChainId],
            mintRecipient,
            CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
          ],
        });
      }
      console.log('result', tx);
      addLog('Burn Tx: ' + tx);
      /*
            const tx = await client.sendTransaction({
              to: CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId] as `0x${string}`,
              data: encodeFunctionData({
                abi: [
                  {
                    type: "function",
                    name: "depositForBurn",
                    stateMutability: "nonpayable",
                    inputs: [
                      { name: "amount", type: "uint256" },
                      { name: "destinationDomain", type: "uint32" },
                      { name: "mintRecipient", type: "bytes32" },
                      { name: "burnToken", type: "address" },
                      { name: "destinationCaller", type: "bytes32" },
                      { name: "maxFee", type: "uint256" },
                      { name: "minFinalityThreshold", type: "uint32" },
                    ],
                    outputs: [],
                  },
                ],
                functionName: "depositForBurn",
                args: [
                  amount,
                  DESTINATION_DOMAINS[destinationChainId],
                  mintRecipient,
                  CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
                  mintRecipient,
                  maxFee,
                  finalityThreshold,
                ],
              }),
              // Use the actual estimated fees without reduction
              maxFeePerGas: feeData.maxFeePerGas,
              maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
              gas: 300000n, // Keep the increased gas limit for V2 functions
            });
      */
      //addLog(`Burn Tx: ${tx}`);
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Burn failed: ${errorMessage}`);
      throw err;
    }
  };

  const retrieveAttestation = async (
    transactionHash: string,
    sourceChainId: number,
    transferType: "fast" | "standard",
    isResume: boolean = false
  ) => {
    if (isResume) {
      setResumeStep("waiting-attestation");
      addResumeLog("Retrieving attestation...");
    } else {
      setCurrentStep("waiting-attestation");
      addLog("Retrieving attestation...");
    }

    const baseUrl = "https://iris-api.circle.com";
    const sourceDomain = transferType === "fast" ? DESTINATION_DOMAINS_V2[sourceChainId] : DESTINATION_DOMAINS_V1[sourceChainId];
    const url = transferType === "fast" ? `${baseUrl}/v2/messages/${sourceDomain}?transactionHash=${transactionHash}` : `${baseUrl}/v1/messages/${sourceDomain}/${transactionHash}`;

    if (isResume) {
      addResumeLog(`API URL: ${url}`);
    } else {
      addLog(`API URL: ${url}`);
    }

    while (true) {
      try {
        const response = await axios.get(url);
        if (transferType === "fast" && response.data?.messages?.[0]?.status === "complete") {
          if (isResume) {
            addResumeLog("Attestation retrieved!");
          } else {
            addLog("Attestation retrieved!");
          }
          return response.data.messages[0];
        } else if (transferType === "standard" && response.data?.messages?.[0]?.message !== null) {

          console.log('response.data.messages[0].message', response.data.messages[0].message);
          const convertedMsg = keccak256(response.data.messages[0].message);
          console.log('convertedMsg', convertedMsg);
          const secondUrl = `${baseUrl}/v1/attestations/${convertedMsg}`
          const secondResponse = await axios.get(secondUrl);

          console.log('secondResponse', secondResponse.data);

          if (secondResponse.data?.status === "complete") {
            if (isResume) {
              addResumeLog("Attestation retrieved!");
            } else {
              addLog("Attestation retrieved!");
            }
            return response.data.messages[0];
          }
        }

        if (isResume) {
          addResumeLog("Waiting for attestation...");
        } else {
          addLog("Waiting for attestation...");
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (isResume) {
            addResumeLog("Attestation not found yet, retrying...");
          } else {
            addLog("Attestation not found yet, retrying...");
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        if (isResume) {
          setResumeError("Attestation retrieval failed");
        } else {
          setError("Attestation retrieval failed");
        }
        throw error;
      }
    }
  };

  // New function to check if fast transfer is available and get allowance
  const checkFastTransferAllowance = async (sourceChainId: number) => {
    try {
      // Use production API for mainnet chains, sandbox for testnet

      const baseUrl = "https://iris-api.circle.com";

      // Use the /v2/fastBurn/USDC/allowance endpoint to check allowance
      const allowanceUrl = `${baseUrl}/v2/fastBurn/USDC/allowance`;
      const response = await axios.get(allowanceUrl);

      // Log the allowance information
      addLog(`Fast Transfer Allowance: ${response.data.allowance}`);
      return response.data.allowance;
    } catch (error) {
      addLog("Failed to check Fast Transfer allowance");
      return null;
    }
  };

  // New function to get fast transfer fees
  const getFastTransferFees = async (
    sourceChainId: number,
    destinationChainId: number
  ) => {
    try {
      // Use production API for mainnet chains, sandbox for testnet

      const baseUrl = "https://iris-api.circle.com";

      const sourceDomain = DESTINATION_DOMAINS_V2[sourceChainId];
      const destDomain = DESTINATION_DOMAINS_V2[destinationChainId];

      // Use the /v2/fastBurn/USDC/fees/:sourceDomainId/:destDomainId endpoint to get fees
      const feesUrl = `${baseUrl}/v2/fastBurn/USDC/fees/${sourceDomain}/${destDomain}`;
      const response = await axios.get(feesUrl);

      // Log the fee information
      addLog(`Fast Transfer Fee: ${response.data.minimumFee} USDC`);
      return response.data.minimumFee;
    } catch (error) {
      addLog("Failed to retrieve Fast Transfer fees");
      return null;
    }
  };

  const mintUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    destinationChainId: number,
    attestation: any,
    transferType: "fast" | "standard",
    isResume: boolean = false
  ) => {
    await switchChain(config, {
      chainId: destinationChainId as SupportedChainId,
    })
    const MAX_RETRIES = 3;
    let retries = 0;

    if (isResume) {
      setResumeStep("minting");
      addResumeLog("Minting USDC...");
    } else {
      setCurrentStep("minting");
      addLog("Minting USDC...");
    }

    while (retries < MAX_RETRIES) {
      try {
        const contractConfig = {
          address: transferType === "fast" ? CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V2[
            destinationChainId
          ] as `0x${string}` : CHAIN_IDS_TO_MESSAGE_TRANSMITTER_V1[
          destinationChainId
          ] as `0x${string}`,
          abi: [
            {
              type: "function",
              name: "receiveMessage",
              stateMutability: "nonpayable",
              inputs: [
                { name: "message", type: "bytes" },
                { name: "attestation", type: "bytes" },
              ],
              outputs: [],
            },
          ] as const,
        };

        const tx = await writeContract(config, {
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: "receiveMessage",
          args: [attestation.message, attestation.attestation],
        });

        if (isResume) {
          addResumeLog(`Mint Tx: ${tx}`);
          setResumeStep("completed");
        } else {
          addLog(`Mint Tx: ${tx}`);
          setCurrentStep("completed");
        }
        break;
      } catch (err) {
        if (err instanceof TransactionExecutionError && retries < MAX_RETRIES) {
          retries++;
          if (isResume) {
            addResumeLog(`Retry ${retries}/${MAX_RETRIES}...`);
          } else {
            addLog(`Retry ${retries}/${MAX_RETRIES}...`);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
          continue;
        }
        throw err;
      }
    }
  };

  const executeApprove = async (
    address: `0x${string}`,
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
    transferType: "fast" | "standard"
  ) => {
    try {
      const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);
      let maxFee = 0n;
      if (transferType === "fast") {
        addLog("Checking Fast Transfer availability...");
        await checkFastTransferAllowance(sourceChainId);
        const fee = await getFastTransferFees(sourceChainId, destinationChainId);
        maxFee = parseUnits(fee.toString(), DEFAULT_DECIMALS);
      }
      await approveUSDC(address, sourceChainId, numericAmount, maxFee, transferType);
    } catch (error) {
      setCurrentStep("error");
      addLog(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  const executeTransfer = async (
    address: `0x${string}`,
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
    transferType: "fast" | "standard"
  ) => {
    try {
      const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);
      // const account = privateKeyToAccount(`0x${privateKey}`);
      const defaultDestination = address;
      const sourceClient = await getClients(address, sourceChainId);
      const destinationClient = await getClients(address, destinationChainId);
      const publicClient = getPublicClient(sourceChainId);

      const checkNativeBalance = async (chainId: SupportedChainId) => {
        const publicClient = getPublicClient(chainId);
        const balance = await publicClient.getBalance({
          address: defaultDestination,
        });
        return balance;
      };

      // Get maxFee if it's a fast transfer
      let maxFee = 0n;
      if (transferType === "fast") {
        addLog("Checking Fast Transfer availability...");
        await checkFastTransferAllowance(sourceChainId);
        const fee = await getFastTransferFees(sourceChainId, destinationChainId);
        maxFee = parseUnits(fee.toString(), DEFAULT_DECIMALS);
      }

      //await approveUSDC(address, sourceChainId, numericAmount, maxFee, transferType);

      // Get burn transaction hash
      const burnTx = await burnUSDC(
        sourceClient as any,
        sourceChainId,
        numericAmount,
        destinationChainId,
        defaultDestination,
        transferType
      );

      // Wait for the burn transaction to be confirmed
      addLog(`Waiting for burn transaction to be confirmed...`);
      const burnReceipt = await publicClient.waitForTransactionReceipt({
        hash: burnTx as `0x${string}`,
        confirmations: 1,
        timeout: 120_000, // 2 minutes timeout
      });

      addLog(`Burn transaction confirmed with status: ${burnReceipt.status}`);

      if (burnReceipt.status !== "success") {
        throw new Error("Burn transaction failed");
      }

      // Now that burn is confirmed, proceed to retrieve attestation
      addLog(`Proceeding to retrieve attestation...`);
      const attestation = await retrieveAttestation(burnTx, sourceChainId, transferType);

      // const minBalance = parseEther("0.01"); // 0.01 native token
      // const balance = await checkNativeBalance(destinationChainId);
      // if (balance < minBalance) {
      //   throw new Error("Insufficient native token for gas fees");
      // }
      await mintUSDC(destinationClient as any, destinationChainId, attestation, transferType);

    } catch (error) {
      setCurrentStep("error");
      addLog(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleApproveUSDC = async (address: `0x${string}`,
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
    transferType: "fast" | "standard") => {

    const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);

    // Get maxFee if it's a fast transfer
    let maxFee = 0n;
    if (transferType === "fast") {
      addLog("Checking Fast Transfer availability...");
      await checkFastTransferAllowance(sourceChainId);
      const fee = await getFastTransferFees(sourceChainId, destinationChainId);
      maxFee = parseUnits(fee.toString(), DEFAULT_DECIMALS);
    }

    await approveUSDC(address, sourceChainId, numericAmount, maxFee, transferType);
  }

  const handleBurnUSDC = async (
    address: `0x${string}`,
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
    transferType: "fast" | "standard"
  ) => {
    const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);
    const defaultDestination = address;
    const burnTx = await burnUSDC(
      address,
      sourceChainId,
      numericAmount,
      destinationChainId,
      defaultDestination,
      transferType
    );
  }

  const reset = () => {
    setCurrentStep("idle");
    setLogs([]);
    setError(null);
  };

  const getChainIdFromDomain = (domainId: number): SupportedChainId => {
    const chainId = Object.entries(DESTINATION_DOMAINS_V2).find(
      ([_, domain]) => domain === domainId
    )?.[0];

    if (!chainId) {
      throw new Error(`No chain found for domain ${domainId}`);
    }

    return Number(chainId) as SupportedChainId;
  };

  const resumeTransfer = async (resumeTx: string, resumeChainId: SupportedChainId, transferType: "fast" | "standard") => {
    try {
      setIsResuming(true);
      setShowResumeFinalTime(false);
      setResumeElapsedSeconds(0);
      setResumeStep("waiting-attestation");
      addResumeLog(`Resuming transfer: ${resumeTx} on chain: ${resumeChainId}`);

      const attestation = await retrieveAttestation(resumeTx, resumeChainId, transferType, true);
      addResumeLog("Attestation retrieved successfully");

      const result = parseCrossChainMessage(attestation.message);
      addResumeLog(`Source Domain: ${result.sourceDomain}`);
      addResumeLog(`Destination Domain: ${result.destinationDomain}`);
      addResumeLog(`Recipient Address: ${result.recipientAddress}`);

      const destinationChainId = getChainIdFromDomain(result.destinationDomain);
      const destClient = await getClients(result.recipientAddress as `0x${string}`, destinationChainId);
      addResumeLog(`Connected to destination chain: ${destinationChainId}`);

      await mintUSDC(destClient as any, destinationChainId, attestation, transferType, true);
      setResumeStep("completed");
      setShowResumeFinalTime(true);
    } catch (error) {
      setResumeStep("error");
      setResumeError(error instanceof Error ? error.message : "Unknown error");
      addResumeLog(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsResuming(false);
    }
  }

  const resetResume = () => {
    setResumeStep("idle");
    setResumeLogs([]);
    setResumeError(null);
    setResumeElapsedSeconds(0);
    setShowResumeFinalTime(false);
  };

  return {
    currentStep,
    logs,
    error,
    executeTransfer,
    executeApprove,
    getBalance,
    reset,
    handleApproveUSDC,
    handleBurnUSDC,
    mintUSDC,
    resumeTransfer,
    addLog,
    // Resume transfer states and functions
    resumeStep,
    resumeLogs,
    resumeError,
    resumeElapsedSeconds,
    setResumeElapsedSeconds,
    isResuming,
    showResumeFinalTime,
    resetResume
  };
}
