import { useState } from 'react';
import { storeDeviceData, retrieveDeviceData } from '@/utils/web3storage';

interface DeviceData {
  deviceHash: string;
  deviceType: string;
  location: string;
  metadata?: any;
}

export function useDeviceStorage() {
  const [isStoring, setIsStoring] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeDevice = async (deviceData: DeviceData) => {
    setIsStoring(true);
    setError(null);
    try {
      const cid = await storeDeviceData({
        ...deviceData,
        timestamp: Date.now(),
      });
      return cid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store device data');
      throw err;
    } finally {
      setIsStoring(false);
    }
  };

  const retrieveDevice = async (cid: string) => {
    setIsRetrieving(true);
    setError(null);
    try {
      const data = await retrieveDeviceData(cid);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve device data');
      throw err;
    } finally {
      setIsRetrieving(false);
    }
  };

  return {
    storeDevice,
    retrieveDevice,
    isStoring,
    isRetrieving,
    error,
  };
}
