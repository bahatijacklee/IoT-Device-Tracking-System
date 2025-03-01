import { useState } from 'react';
import { ipfsStorage } from '@/lib/ipfsStorage';
import { toast } from 'sonner';

export function useIPFSStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);

  const storeDeviceMetadata = async (metadata: {
    name: string;
    type: string;
    location: string;
    owner: string;
    status: string;
    additionalInfo?: Record<string, any>;
  }) => {
    setIsUploading(true);
    try {
      const cid = await ipfsStorage.storeDeviceMetadata({
        ...metadata,
        registeredAt: new Date().toISOString(),
      });
      toast.success('Device metadata stored successfully');
      return cid;
    } catch (error) {
      toast.error('Failed to store device metadata');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const retrieveDeviceMetadata = async (cid: string) => {
    setIsRetrieving(true);
    try {
      const metadata = await ipfsStorage.retrieveDeviceMetadata(cid);
      return metadata;
    } catch (error) {
      toast.error('Failed to retrieve device metadata');
      throw error;
    } finally {
      setIsRetrieving(false);
    }
  };

  const storeDeviceData = async (deviceId: string, data: any) => {
    setIsUploading(true);
    try {
      const cid = await ipfsStorage.storeDeviceData(deviceId, data);
      toast.success('Device data stored successfully');
      return cid;
    } catch (error) {
      toast.error('Failed to store device data');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    storeDeviceMetadata,
    retrieveDeviceMetadata,
    storeDeviceData,
    isUploading,
    isRetrieving,
  };
}
