import { useContractRead } from 'wagmi';
import { useAccount } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import accessManagerAbi from '@/abis/AccessManager.json';

const ACCESS_MANAGER = '0x18C792C368279C490042E85fb4DCC2FB650CE44e';
const GLOBAL_ADMIN_ROLE = keccak256(toBytes('GLOBAL_ADMIN'));

export function useAdminAccess() {
  const { address, isConnected } = useAccount();
  
  const { data: isAdmin, isLoading, error } = useContractRead({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi,
    functionName: 'hasRole',
    args: [GLOBAL_ADMIN_ROLE, address || '0x0'],
    enabled: isConnected && !!address,
  });

  return {
    isAdmin: Boolean(isAdmin),
    isLoading: isLoading || !isConnected,
    error,
    address,
    isConnected,
  };
}
