import { useContractWrite, useContractRead } from 'wagmi';
import { waitForTransaction } from '@wagmi/core';
import { useToast } from '@/components/ui/use-toast';
import OracleIntegrationABI from '@/abis/OracleIntegration.json';
import { useState } from 'react';

const ORACLE_CONTRACT_ADDRESS = '0x48C20882E61Ca563E064376480D886870d1d695e';

export function useIoTDataLedger() {
  const { toast } = useToast();
  const [isWaitingForSubmit, setIsWaitingForSubmit] = useState(false);

  const { data: pendingRequests, isLoading: isLoadingRequests } = useContractRead({
    address: ORACLE_CONTRACT_ADDRESS,
    abi: OracleIntegrationABI,
    functionName: 'getPendingDisputes',
    watch: true,
  });

  const { 
    data: submitTxData,
    write: submitData,
    isLoading: isSubmitting 
  } = useContractWrite({
    address: ORACLE_CONTRACT_ADDRESS,
    abi: OracleIntegrationABI,
    functionName: 'submitData',
  });

  const handleSubmitData = async (deviceId: string, dataValue: string, timestamp: number) => {
    try {
      await submitData({
        args: [deviceId, dataValue, BigInt(timestamp)],
      });

      if (submitTxData?.hash) {
        setIsWaitingForSubmit(true);
        await waitForTransaction({
          hash: submitTxData.hash,
        });
        setIsWaitingForSubmit(false);
        
        toast({
          title: 'Success',
          description: 'Data submitted successfully',
        });
      }
    } catch (error: any) {
      setIsWaitingForSubmit(false);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to submit data',
        variant: 'destructive',
      });
    }
  };

  return {
    pendingRequests,
    isLoadingRequests,
    handleSubmitData,
    isSubmitting: isSubmitting || isWaitingForSubmit,
  };
}
