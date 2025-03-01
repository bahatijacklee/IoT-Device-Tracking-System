NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_hereimport { Web3Storage } from 'web3.storage';

// Your web3.storage API token
const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;

if (!token) {
  console.error('A token is needed. You can create one on https://web3.storage');
}

export function getWeb3StorageClient() {
  if (!token) throw new Error('Web3Storage token not configured');
  return new Web3Storage({ token });
}

export async function storeDeviceData(data: any) {
  const client = getWeb3StorageClient();
  
  // Convert the data to a JSON string
  const jsonString = JSON.stringify(data);
  
  // Create a File object
  const files = [
    new File([jsonString], 'device.json', { type: 'application/json' })
  ];
  
  try {
    // Upload to IPFS through web3.storage
    const cid = await client.put(files);
    console.log('Stored files with CID:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading to web3.storage:', error);
    throw error;
  }
}

export async function retrieveDeviceData(cid: string) {
  const client = getWeb3StorageClient();
  
  try {
    const res = await client.get(cid);
    if (!res) throw new Error('No response from web3.storage');
    
    const files = await res.files();
    if (!files || !files.length) throw new Error('No files found');
    
    // Get the data from the first file
    const file = files[0];
    const text = await file.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error retrieving from web3.storage:', error);
    throw error;
  }
}
