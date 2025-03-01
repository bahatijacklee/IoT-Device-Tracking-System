import { Web3Storage } from 'web3.storage';

const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

interface DeviceMetadata {
  name: string;
  type: string;
  location: string;
  owner: string;
  registeredAt: string;
  status: string;
  additionalInfo?: Record<string, any>;
}

export class IPFSStorage {
  private client: Web3Storage;

  constructor() {
    if (!token) {
      throw new Error('Web3Storage token not found in environment variables');
    }
    this.client = new Web3Storage({ token });
  }

  async storeDeviceMetadata(metadata: DeviceMetadata): Promise<string> {
    try {
      // Convert metadata to JSON and create a File object
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const files = [
        new File([blob], `${metadata.name.replace(/\s+/g, '-')}.json`)
      ];

      // Upload to IPFS
      const cid = await this.client.put(files);
      return cid;
    } catch (error) {
      console.error('Error storing device metadata:', error);
      throw error;
    }
  }

  async retrieveDeviceMetadata(cid: string): Promise<DeviceMetadata> {
    try {
      const res = await this.client.get(cid);
      if (!res || !res.ok) {
        throw new Error('Failed to retrieve device metadata');
      }

      const files = await res.files();
      if (!files || files.length === 0) {
        throw new Error('No files found');
      }

      const content = await files[0].text();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error retrieving device metadata:', error);
      throw error;
    }
  }

  async storeDeviceData(deviceId: string, data: any): Promise<string> {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const files = [
        new File([blob], `device-${deviceId}-${Date.now()}.json`)
      ];

      const cid = await this.client.put(files);
      return cid;
    } catch (error) {
      console.error('Error storing device data:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const ipfsStorage = new IPFSStorage();
