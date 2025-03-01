import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { formatUnits, keccak256, stringToHex } from 'viem';
import { toast } from 'sonner';
import deviceRegistryAbi from '@/abis/DeviceRegistry.json';

interface Device {
  deviceHash: string;
  status: number;
  registrationDate: number;
  lastUpdated: number;
  ipfsCid: string;
}

export function useDeviceRegistry(contractAddress: string) {
  const { address } = useAccount();
  const [devices, setDevices] = useState<Device[]>([]);

  // Read devices from contract
  const { data: deviceData, isLoading: devicesLoading } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: deviceRegistryAbi.abi,
    functionName: 'getDevicesByOwnerPaginated',
    args: [address, 0, 10], // Pagination parameters
    watch: true,
  });

  // Write function for device registration
  const { writeAsync: registerDeviceWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: deviceRegistryAbi.abi,
    functionName: 'registerDevice',
  });

  // Register a new device
  const registerDevice = async ({ deviceType, location, ipfsCid }: { deviceType: string; location: string; ipfsCid: string }) => {
    try {
      // Generate device hash from IPFS CID to ensure uniqueness
      const deviceHash = keccak256(stringToHex(ipfsCid));

      // Call the contract with new structure
      const tx = await registerDeviceWrite({
        args: [
          deviceHash,
          ipfsCid,
          '0x' // Empty signature for now
        ],
      });

      await tx.wait();
      toast.success('Device registered successfully!');
      return tx;
    } catch (error) {
      console.error('Error registering device:', error);
      toast.error('Failed to register device');
      throw error;
    }
  };

  // Update devices state when data changes
  useEffect(() => {
    if (deviceData) {
      setDevices(deviceData as Device[]);
    }
  }, [deviceData]);

  return {
    devices,
    devicesLoading,
    registerDevice,
  };
}
