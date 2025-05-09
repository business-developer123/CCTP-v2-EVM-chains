"use client";

import { useEffect, useState } from 'react';
import { TransferStep, ResumeStep, useCrossChainTransfer } from '@/hooks/use-cross-chain-transfer';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SupportedChainId, SUPPORTED_CHAINS_V1, CHAIN_TO_CHAIN_NAME_V1, SUPPORTED_CHAINS_V2, CHAIN_TO_CHAIN_NAME_V2 } from '@/lib/chains';
import { ProgressSteps } from '@/components/progress-step';
import { TransferLog } from '@/components/transfer-log';
import { Timer } from '@/components/timer';
import { TransferTypeSelector } from '@/components/transfer-type';

import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActionButtonList } from './../components/ActionButtonList'
import { SmartContractActionButtonList } from './../components/SmartContractActionButtonList'
import { InfoList } from './../components/InfoList'
import { projectId, metadata, networks, wagmiAdapter } from './../config'

import { writeContract as writeContractAction } from '@wagmi/core'


import { useSendTransaction, useEstimateGas, useReadContract, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem';

export default function Home() {
  //const [currentStep, setCurrentStep] = useState<TransferStep>("idle");
  const {
    logs,
    error,
    getBalance,
    reset,
    executeTransfer,
    executeApprove,
    currentStep,
    resumeTransfer,
    resumeStep,
    resumeLogs,
    resumeError,
    resumeElapsedSeconds,
    setResumeElapsedSeconds,
    isResuming,
    showResumeFinalTime,
    resetResume
  } = useCrossChainTransfer();
  const [sourceChain, setSourceChain] = useState<SupportedChainId>(SupportedChainId.AVAX_MAINNET);
  const [destinationChain, setDestinationChain] = useState<SupportedChainId>(SupportedChainId.ETH_MAINNET);
  const [amount, setAmount] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showFinalTime, setShowFinalTime] = useState(false);
  const [transferType, setTransferType] = useState<'fast' | 'standard'>('fast');
  const [balance, setBalance] = useState('0');
  const [resumeChain, setResumeChain] = useState<SupportedChainId>(SupportedChainId.ETH_MAINNET);
  const [resumeTxId, setResumeTxId] = useState('');
  const [approvalAmount, setApprovalAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const { data: gas } = useEstimateGas();

  const { writeContract, isSuccess, data: hash } = useWriteContract();

  useEffect(() => {
    if (hash) {
      console.log(`Transfer Tx: ${hash}`);
    }
  }, [hash]);

  const { address, isConnected } = useAppKitAccount();

  const handleStartTransfer = async () => {
    setIsTransferring(true);
    setShowFinalTime(false);
    setElapsedSeconds(0);

    // const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as any;
    if (!isConnected) {
      console.error('Wallet is not connected');
      return;
    }

    await executeTransfer(address as `0x${string}`, sourceChain, destinationChain, amount, transferType);

    // await handleApproveUSDC(address as `0x${string}`, sourceChain, destinationChain, amount, transferType);
    // setCurrentStep("approving");
    // await handleBurnUSDC(address as `0x${string}`, sourceChain, destinationChain, amount, transferType);
    // setCurrentStep("burning");

    setIsTransferring(false);
    setShowFinalTime(true);
  };

  const handleReset = () => {
    reset();
    setIsTransferring(false);
    setShowFinalTime(false);
    setElapsedSeconds(0);
  };

  const handleResumeTransfer = () => {
    resumeTransfer(resumeTxId, resumeChain, transferType);
  }

  useEffect(() => {
    if (!isConnected) return;
    const wrapper = async () => {
      const balance = await getBalance(address as `0x${string}`, sourceChain)
      setBalance(balance);
    }
    wrapper()
  }, [isConnected, getBalance, address, sourceChain]);

  useEffect(() => {

    // Only set a default destination chain when sourceChain changes
    // and only if the current destination is the same as the source (invalid state)
    if (destinationChain === sourceChain) {
      const newDestinationChain = SUPPORTED_CHAINS_V2.find((chainId) => chainId !== sourceChain)
      if (newDestinationChain) {
        setDestinationChain(newDestinationChain)
      }
    }

  }, [sourceChain, showFinalTime, destinationChain])


  // const queryClient = new QueryClient()

  // const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  // const [signedMsg, setSignedMsg] = useState('');
  // const [balanceT, setBalanceT] = useState('');


  // const receiveHash = (hash: `0x${string}`) => {
  //   setTransactionHash(hash); // Update the state with the transaction hash
  // };

  // const receiveSignedMsg = (signedMsg: string) => {
  //   setSignedMsg(signedMsg); // Update the state with the transaction hash
  // };

  // const receivebalance = (balanceT: string) => {
  //   setBalanceT(balanceT)
  // }

  const handleApprove = async () => {
    setIsApproving(true);
    await executeApprove(address as `0x${string}`, sourceChain, destinationChain, approvalAmount, transferType);
    setIsApproving(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex justify-center">
              <appkit-button />
            </div>
            <CardTitle className="text-center">Cross-Chain USDC Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Transfer Type</Label>
              <TransferTypeSelector value={transferType} onChange={setTransferType} />
              <p className="text-sm text-muted-foreground">
                {
                  transferType === 'fast'
                    ? 'Fast transfer with CCTP V2'//'Faster transfers with lower finality threshold (1000 blocks)'
                    : 'Standard transfer with CCTP V1'//'Standard transfers with higher finality (2000 blocks)'
                }
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Chain</Label>
                <Select
                  value={String(sourceChain)}
                  onValueChange={(value) => setSourceChain(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {(transferType === 'standard' ? SUPPORTED_CHAINS_V1 : SUPPORTED_CHAINS_V2).map((chainId: SupportedChainId) => (
                      <SelectItem key={chainId} value={String(chainId)}>
                        {transferType === 'standard' ? CHAIN_TO_CHAIN_NAME_V1[chainId] : CHAIN_TO_CHAIN_NAME_V2[chainId]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destination Chain</Label>
                <Select
                  value={String(destinationChain)}
                  onValueChange={(value) => setDestinationChain(Number(value))}
                  disabled={!sourceChain}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {(transferType === 'standard' ? SUPPORTED_CHAINS_V1 : SUPPORTED_CHAINS_V2)
                      .filter((chainId: SupportedChainId) => chainId !== sourceChain)
                      .map((chainId: SupportedChainId) => (
                        <SelectItem key={chainId} value={String(chainId)}>
                          {transferType === 'standard' ? CHAIN_TO_CHAIN_NAME_V1[chainId] : CHAIN_TO_CHAIN_NAME_V2[chainId]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (USDC)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  max={parseFloat(balance)}
                  step="any"
                />
                <p className="text-sm text-muted-foreground">
                  {balance} available
                </p>
              </div>

              <div className="space-y-2">
                <Label>Approval Amount (USDC)</Label>
                <Input
                  type="number"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  placeholder="Enter approval amount"
                  min="0"
                  step="any"
                />
                <p className="text-sm text-muted-foreground">
                  {/* Enter the amount you want to approve for future transfers */}
                </p>
              </div>
            </div>

            <div className="text-center">
              {showFinalTime ? (
                <div className="text-2xl font-mono">
                  <span>{Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}</span>:
                  <span>{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
              ) : (
                <Timer
                  isRunning={isTransferring}
                  initialSeconds={elapsedSeconds}
                  onTick={setElapsedSeconds}
                />
              )}
            </div>

            <ProgressSteps
              currentStep={currentStep}
              type="transfer"
            />

            <TransferLog logs={logs} />

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleApprove}
                disabled={!approvalAmount || isApproving}
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>

              <Button
                onClick={handleStartTransfer}
                disabled={isTransferring || currentStep === 'completed'}
              >
                {currentStep === 'completed' ? 'Transfer Complete' : 'Start Transfer'}
              </Button>

              {(currentStep === 'completed' || currentStep === 'error') && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Resume Transaction</CardTitle>
            <CardDescription className="text-center">
              Enter the transaction hash and select the chain to resume a pending transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chain</Label>
              <Select
                value={String(resumeChain)}
                onValueChange={(value) => setResumeChain(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {(transferType === 'standard' ? SUPPORTED_CHAINS_V1 : SUPPORTED_CHAINS_V2).map((chainId) => (
                    <SelectItem key={chainId} value={String(chainId)}>
                      {transferType === 'standard' ? CHAIN_TO_CHAIN_NAME_V1[chainId] : CHAIN_TO_CHAIN_NAME_V2[chainId]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Hash</Label>
              <Input
                value={resumeTxId}
                onChange={(e) => setResumeTxId(e.target.value)}
                placeholder="Enter transaction hash"
              />
            </div>

            <div className="text-center">
              {showResumeFinalTime ? (
                <div className="text-2xl font-mono">
                  <span>{Math.floor(resumeElapsedSeconds / 60).toString().padStart(2, '0')}</span>:
                  <span>{(resumeElapsedSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
              ) : (
                <Timer
                  isRunning={isResuming}
                  initialSeconds={resumeElapsedSeconds}
                  onTick={setResumeElapsedSeconds}
                />
              )}
            </div>

            <ProgressSteps
              currentStep={resumeStep}
              type="resume"
            />

            <TransferLog logs={resumeLogs} />

            {resumeError && (
              <div className="text-red-500 text-center">
                {resumeError}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleResumeTransfer}
                disabled={!resumeTxId || isResuming || resumeStep === 'completed'}
              >
                {resumeStep === 'completed' ? 'Transfer Complete' : 'Resume Transfer'}
              </Button>

              {(resumeStep === 'completed' || resumeStep === 'error') && (
                <Button variant="outline" onClick={resetResume}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
