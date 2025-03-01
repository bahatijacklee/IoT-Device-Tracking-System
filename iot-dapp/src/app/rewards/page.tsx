'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWatchContractEvent } from 'wagmi';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import tokenRewardsAbi from '@/abis/TokenRewards.json';
import { formatUnits, keccak256, stringToHex } from 'viem';

// Updated with new deployment address (replace if redeployed)
const TOKEN_REWARDS = "0xca276186Eb9f3a58FCdfc4adA247Cbe8d935778a"; // Update if redeployed

export default function Rewards() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();

  // Fetch balance (available rewards)
  const { data: balance, isLoading: balanceLoading, isError: balanceError } = useContractRead({
    address: TOKEN_REWARDS as `0x${string}`,
    abi: tokenRewardsAbi.abi,
    functionName: 'getUserBalance',
    args: [address],
    enabled: isConnected && !!address,
  });

  // Track claimed rewards via events
  const [claimedRewards, setClaimedRewards] = useState<bigint>(0n);
  const [claimHistory, setClaimHistory] = useState<{ timestamp: number; amount: bigint }[]>([]);

  useWatchContractEvent({
    address: TOKEN_REWARDS as `0x${string}`,
    abi: tokenRewardsAbi.abi,
    eventName: 'RewardsClaimed',
    onLogs(logs) {
      logs.forEach((log) => {
        const [operator, amount] = log.args as [string, bigint];
        if (operator === address) {
          setClaimedRewards((prev) => prev + amount);
          setClaimHistory((prev) => [
            ...prev,
            { timestamp: Date.now(), amount },
          ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)); // Keep last 5 claims
          toast({
            title: `Claimed ${formatUnits(amount, 6)} IDC for ${operator}`,
            variant: 'success',
          });
        }
      });
    },
  });

  // Claim rewards
  const { writeAsync: claimRewards, isPending: isClaimLoading } = useContractWrite({
    address: TOKEN_REWARDS as `0x${string}`,
    abi: tokenRewardsAbi.abi,
    functionName: 'claimRewards',
  });

  const handleClaimRewards = async () => {
    if (!balance || balance === 0n) {
      toast({
        title: 'No rewards available to claim',
        variant: 'destructive',
      });
      return;
    }
    try {
      const deviceHash = keccak256(stringToHex("device1")); // Example deviceHash
      const tx = await claimRewards({ args: [deviceHash] });
      toast({
        title: 'Claiming rewards...',
        variant: 'default',
      });
      
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({
          title: 'Rewards claimed successfully!',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Transaction failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to claim rewards',
        variant: 'destructive',
      });
      console.error('Error claiming rewards:', error);
    }
  };

  // Check balance validity on mount
  useEffect(() => {
    if (balanceError) {
      toast({
        title: 'Error fetching balance',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }, [balanceError]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Please connect your wallet to view and claim rewards</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background transition-all smooth-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 animate-fadeIn transition-all smooth-transition text-center"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center text-foreground transition-all smooth-transition">
          <Gift className="mr-4 h-8 w-8 sm:h-10 sm:w-10 text-primary transition-all smooth-transition" /> IoT Rewards
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all smooth-transition">
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all smooth-transition">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center transition-all smooth-transition">Available Rewards</h2>
            <p className="text-3xl font-bold text-primary transition-all smooth-transition text-center">
              {balanceLoading ? '...' : formatUnits(balance || 0n, 6)} IDC
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all smooth-transition">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center transition-all smooth-transition">Total Rewards</h2>
            <p className="text-3xl font-bold text-purple-500 transition-all smooth-transition text-center">
              {balanceLoading ? '...' : formatUnits((balance || 0n) + (claimedRewards || 0n), 6)} IDC
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all smooth-transition">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center transition-all smooth-transition">Claimed Rewards</h2>
            <p className="text-3xl font-bold text-green-500 transition-all smooth-transition text-center">
              {balanceLoading ? '...' : formatUnits(claimedRewards || 0n, 6)} IDC
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleClaimRewards}
            disabled={isClaimLoading || balanceLoading || (balance && balance === 0n)}
            className="btn-modern transition-all smooth-transition"
          >
            {isClaimLoading ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </div>

        {/* Claim History Table */}
        <div className="max-w-4xl mx-auto mt-12 transition-all smooth-transition">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center transition-all smooth-transition">Claim History</h2>
          {claimHistory.length > 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg transition-all smooth-transition">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-foreground text-center">Timestamp</TableHead>
                    <TableHead className="text-foreground text-center">Amount (IDC)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimHistory.map((claim, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-all smooth-transition">
                      <TableCell className="text-foreground text-center">
                        {new Date(claim.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-foreground text-center">
                        {formatUnits(claim.amount, 6)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No claim history yet</p>
          )}
        </div>
      </motion.div>
    </main>
  );
}