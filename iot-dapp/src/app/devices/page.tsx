'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeviceRegistry } from '@/hooks/useDeviceRegistry';
import { useIPFSStorage } from '@/hooks/useIPFSStorage';
import { toast } from 'sonner';

// Updated contract address
const DEVICE_REGISTRY = "0xE851a734e8f310951e6d27C3B087FE939E371Fbd";

export default function DevicesPage() {
  const { isConnected, address } = useAccount();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('');
  const [registering, setRegistering] = useState(false);
  
  const { registerDevice, devices, devicesLoading } = useDeviceRegistry(DEVICE_REGISTRY);
  const { storeDeviceMetadata, isUploading } = useIPFSStorage();

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !deviceType || !deviceLocation) {
      toast.error('Please fill in all fields');
      return;
    }

    setRegistering(true);
    try {
      // First store metadata on IPFS
      const cid = await storeDeviceMetadata({
        name: deviceName,
        type: deviceType,
        location: deviceLocation,
        owner: address || '',
        status: 'active',
        additionalInfo: {
          registeredAt: new Date().toISOString(),
        }
      });

      if (!cid) throw new Error('Failed to get IPFS CID');

      // Register device on-chain with IPFS CID
      await registerDevice({
        deviceType,
        location: deviceLocation,
        ipfsCid: cid
      });

      // Reset form
      setDeviceName('');
      setDeviceType('');
      setDeviceLocation('');

    } catch (error) {
      console.error('Error registering device:', error);
      toast.error('Failed to register device. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Please connect your wallet to manage devices</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background transition-all smooth-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 animate-fadeIn transition-all smooth-transition text-center"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center text-foreground transition-all smooth-transition">
          <HardDrive className="mr-4 h-8 w-8 sm:h-10 sm:w-10 text-primary transition-all smooth-transition" /> Device Management
        </h1>

        {/* Registration Form */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all smooth-transition">
          <form onSubmit={handleRegisterDevice} className="space-y-6">
            <div>
              <Label htmlFor="deviceName" className="text-foreground">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Enter device name"
                className="w-full bg-background text-foreground border-border transition-all smooth-transition"
              />
            </div>
            <div>
              <Label htmlFor="deviceType" className="text-foreground">Device Type</Label>
              <Input
                id="deviceType"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                placeholder="Enter device type"
                className="w-full bg-background text-foreground border-border transition-all smooth-transition"
              />
            </div>
            <div>
              <Label htmlFor="deviceLocation" className="text-foreground">Location</Label>
              <Input
                id="deviceLocation"
                value={deviceLocation}
                onChange={(e) => setDeviceLocation(e.target.value)}
                placeholder="Enter device location"
                className="w-full bg-background text-foreground border-border transition-all smooth-transition"
              />
            </div>
            <Button 
              type="submit" 
              className="btn-modern w-full transition-all smooth-transition" 
              disabled={registering || isUploading}
            >
              {registering || isUploading ? 'Registering...' : 'Register Device'}
            </Button>
          </form>
        </div>

        {/* Devices Table */}
        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="text-2xl font-semibold text-foreground mb-6 transition-all smooth-transition text-center">Your Devices</h2>
          {devicesLoading ? (
            <p className="text-muted-foreground text-center">Loading devices...</p>
          ) : devices && devices.length > 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-lg transition-all smooth-transition">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-foreground text-center">Hash</TableHead>
                    <TableHead className="text-foreground text-center">IPFS CID</TableHead>
                    <TableHead className="text-foreground text-center">Status</TableHead>
                    <TableHead className="text-foreground text-center">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device: any, index: number) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-all smooth-transition">
                      <TableCell className="text-foreground text-center">{device.deviceHash}</TableCell>
                      <TableCell className="text-foreground text-center">{device.ipfsCid}</TableCell>
                      <TableCell className="text-foreground text-center">
                        {['Inactive', 'Active', 'Suspended', 'Retired'][device.status]}
                      </TableCell>
                      <TableCell className="text-foreground text-center">
                        {new Date(Number(device.registrationDate) * 1000).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No devices registered yet</p>
          )}
        </div>
      </motion.div>
    </main>
  );
}