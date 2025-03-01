import { useContractRead, useContractWrite } from 'wagmi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface VerificationRequest {
  deviceHash: string;
  timestamp: number;
  resolved: boolean;
  result: boolean;
}

export function useOracleIntegration(contractAddress: string, contractAbi: any) {
  const [pendingDisputes, setPendingDisputes] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Read pending disputes
  const { data: disputesData, isLoading: disputesLoading } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: contractAbi.abi,
    functionName: 'getPendingDisputes',
    watch: true,
  });

  // Contract write functions
  const { writeAsync: setOracleWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: contractAbi.abi,
    functionName: 'setOracle',
  });

  const { writeAsync: setDataFeedWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: contractAbi.abi,
    functionName: 'setDataFeed',
  });

  const setOracle = async (oracleAddress: string) => {
    try {
      setLoading(true);
      const tx = await setOracleWrite({
        args: [oracleAddress],
      });
      await tx.wait();
      toast.success('Oracle address updated successfully');
    } catch (error) {
      console.error('Error setting oracle:', error);
      toast.error('Failed to update oracle address');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setDataFeed = async (feedId: string) => {
    try {
      setLoading(true);
      const tx = await setDataFeedWrite({
        args: [feedId],
      });
      await tx.wait();
      toast.success('Data feed updated successfully');
    } catch (error) {
      console.error('Error setting data feed:', error);
      toast.error('Failed to update data feed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update disputes state when data changes
  useEffect(() => {
    if (disputesData) {
      setPendingDisputes(disputesData as VerificationRequest[]);
    }
  }, [disputesData]);

  return {
    pendingDisputes,
    disputesLoading,
    loading,
    setOracle,
    setDataFeed,
  };
}
