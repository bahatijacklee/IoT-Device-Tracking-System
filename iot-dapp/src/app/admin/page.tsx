'use client';

import React, { useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useWatchContractEvent } from 'wagmi';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import accessManagerAbi from '@/abis/AccessManager.json';
import oracleIntegrationAbi from '@/abis/OracleIntegration.json';
import { formatUnits, keccak256, stringToHex } from 'viem';

const ACCESS_MANAGER = "0x18C792C368279C490042E85fb4DCC2FB650CE44e";
const ORACLE_INTEGRATION = "0x48C20882E61Ca563E064376480D886870d1d695e";

export default function Admin() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [newAdmin, setNewAdmin] = useState('');
  const [removeAdminAddress, setRemoveAdminAddress] = useState('');
  const [oracleAddress, setOracleAddress] = useState('');
  const [resetOracleAddr, setResetOracleAddr] = useState('');
  const [resetJobId, setResetJobId] = useState('');
  const [resetFee, setResetFee] = useState('');
  const [dataFeedId, setDataFeedId] = useState('');
  const [resolveDeviceHash, setResolveDeviceHash] = useState('');
  const [resolveRecordIndex, setResolveRecordIndex] = useState('');
  const [resolveValidity, setResolveValidity] = useState(false);

  // Check if current user is admin with debugging
  const { data: isAdmin } = useContractRead({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    functionName: 'isAdmin',
    args: [address],
    enabled: isConnected && !!address,
  });
  console.log("isConnected:", isConnected, "isAdmin:", isAdmin, "address:", address);

  // Fetch pending disputes
  const { data: pendingDisputes, isLoading: disputesLoading } = useContractRead({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'getPendingDisputes',
    enabled: isConnected && isAdmin,
  });

  // Add new admin
  const { writeAsync: addAdmin, isPending: addingAdmin } = useContractWrite({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    functionName: 'addAdmin',
  });

  // Remove admin
  const { writeAsync: removeAdmin, isPending: removingAdmin } = useContractWrite({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    functionName: 'removeAdmin',
  });

  // Set oracle address
  const { writeAsync: setOracle, isPending: settingOracle } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'setOracleAddress',
  });

  // Reset oracle config
  const { writeAsync: resetOracleConfig, isPending: resettingOracle } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'resetOracleConfig',
  });

  // Set data feed ID
  const { writeAsync: setFeed, isPending: settingFeed } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'setDataFeedId',
  });

  // Resolve dispute
  const { writeAsync: resolveDispute, isPending: resolvingDispute } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'resolveDispute',
  });

  // Watch for AdminAdded and AdminRemoved events
  useWatchContractEvent({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    eventName: 'AdminAdded',
    onLogs(logs) {
      logs.forEach((log) => {
        const [newAdminAddress] = log.args as [string];
        toast({
          title: 'New Admin Added',
          description: `Address: ${newAdminAddress}`,
          variant: 'success',
        });
      });
    },
  });

  useWatchContractEvent({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    eventName: 'AdminRemoved',
    onLogs(logs) {
      logs.forEach((log) => {
        const [adminAddress] = log.args as [string];
        toast({
          title: 'Admin Removed',
          description: `Address: ${adminAddress}`,
          variant: 'warning',
        });
      });
    },
  });

  useWatchContractEvent({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    eventName: 'DisputeResolved',
    onLogs(logs) {
      logs.forEach((log) => {
        const [deviceHash, recordIndex, finalValidity] = log.args as [string, bigint, boolean];
        toast({
          title: 'Dispute Resolved',
          description: `Device: ${deviceHash}, Index: ${recordIndex}, Validity: ${finalValidity}`,
          variant: 'success',
        });
      });
    },
  });

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin) return;
    try {
      const tx = await addAdmin({ args: [newAdmin] });
      toast({ title: 'Adding new admin...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Successfully added new admin', variant: 'success' });
        setNewAdmin('');
      } else {
        toast({ title: 'Failed to add admin', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error adding admin', description: 'Please check the address and try again', variant: 'destructive' });
      console.error('Error adding admin:', error);
    }
  };

  const handleRemoveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeAdminAddress) return;
    try {
      const tx = await removeAdmin({ args: [removeAdminAddress] });
      toast({ title: 'Removing admin...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Successfully removed admin', variant: 'success' });
        setRemoveAdminAddress('');
      } else {
        toast({ title: 'Failed to remove admin', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error removing admin', description: 'Please check the address and try again', variant: 'destructive' });
      console.error('Error removing admin:', error);
    }
  };

  const handleSetOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleAddress) return;
    try {
      const tx = await setOracle({ args: [oracleAddress] });
      toast({ title: 'Setting oracle address...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Successfully set oracle address', variant: 'success' });
        setOracleAddress('');
      } else {
        toast({ title: 'Failed to set oracle address', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error setting oracle address', description: 'Please check the address and try again', variant: 'destructive' });
      console.error('Error setting oracle:', error);
    }
  };

  const handleResetOracleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOracleAddr || !resetJobId || !resetFee) return;
    try {
      const tx = await resetOracleConfig({ args: [resetOracleAddr, stringToHex(resetJobId), BigInt(resetFee)] });
      toast({ title: 'Resetting oracle config...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Successfully reset oracle config', variant: 'success' });
        setResetOracleAddr('');
        setResetJobId('');
        setResetFee('');
      } else {
        toast({ title: 'Failed to reset oracle config', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error resetting oracle config', description: 'Please check inputs and try again', variant: 'destructive' });
      console.error('Error resetting oracle:', error);
    }
  };

  const handleSetDataFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataFeedId) return;
    try {
      const tx = await setFeed({ args: [stringToHex(dataFeedId)] });
      toast({ title: 'Setting data feed ID...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Successfully set data feed ID', variant: 'success' });
        setDataFeedId('');
      } else {
        toast({ title: 'Failed to set data feed ID', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error setting data feed ID', description: 'Please try again', variant: 'destructive' });
      console.error('Error setting data feed:', error);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveDeviceHash || !resolveRecordIndex) return;
    try {
      const tx = await resolveDispute({ args: [resolveDeviceHash, BigInt(resolveRecordIndex), resolveValidity] });
      toast({ title: 'Resolving dispute...', variant: 'default' });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({ title: 'Dispute resolved successfully', variant: 'success' });
        setResolveDeviceHash('');
        setResolveRecordIndex('');
        setResolveValidity(false);
      } else {
        toast({ title: 'Failed to resolve dispute', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error resolving dispute', description: 'Please check inputs and try again', variant: 'destructive' });
      console.error('Error resolving dispute:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Please connect your wallet to access admin features</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-foreground">Access denied. Admin privileges required.</p>
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
          <Shield className="mr-4 h-8 w-8 sm:h-10 sm:w-10 text-secondary transition-all smooth-transition" /> Admin Dashboard
        </h1>

        {/* Manage Admins */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-secondary/30 transition-all smooth-transition">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center transition-all smooth-transition">Manage Admins</h2>
          <form onSubmit={handleAddAdmin} className="space-y-6 mb-6">
            <div>
              <Label htmlFor="newAdmin" className="text-foreground">Add Admin Address</Label>
              <Input
                id="newAdmin"
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                placeholder="0x..."
                className="w-full bg-background text-foreground border-border transition-all smooth-transition"
              />
            </div>
            <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={addingAdmin}>
              {addingAdmin ? 'Adding...' : 'Add Admin'}
            </Button>
          </form>
          <form onSubmit={handleRemoveAdmin} className="space-y-6">
            <div>
              <Label htmlFor="removeAdminAddress" className="text-foreground">Remove Admin Address</Label>
              <Input
                id="removeAdminAddress"
                value={removeAdminAddress}
                onChange={(e) => setRemoveAdminAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-background text-foreground border-border transition-all smooth-transition"
              />
            </div>
            <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={removingAdmin}>
              {removingAdmin ? 'Removing...' : 'Remove Admin'}
            </Button>
          </form>
        </div>

        {/* Oracle Settings */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-secondary/30 transition-all smooth-transition">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center transition-all smooth-transition">Oracle Settings</h2>
          <div className="space-y-8">
            <form onSubmit={handleSetOracle} className="space-y-6">
              <div>
                <Label htmlFor="oracleAddress" className="text-foreground">Oracle Address</Label>
                <Input
                  id="oracleAddress"
                  value={oracleAddress}
                  onChange={(e) => setOracleAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={settingOracle}>
                {settingOracle ? 'Setting...' : 'Set Oracle Address'}
              </Button>
            </form>

            <form onSubmit={handleResetOracleConfig} className="space-y-6">
              <div>
                <Label htmlFor="resetOracleAddr" className="text-foreground">Reset Oracle Address</Label>
                <Input
                  id="resetOracleAddr"
                  value={resetOracleAddr}
                  onChange={(e) => setResetOracleAddr(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <div>
                <Label htmlFor="resetJobId" className="text-foreground">Reset Job ID</Label>
                <Input
                  id="resetJobId"
                  value={resetJobId}
                  onChange={(e) => setResetJobId(e.target.value)}
                  placeholder="Enter Job ID"
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <div>
                <Label htmlFor="resetFee" className="text-foreground">Reset Fee (in wei)</Label>
                <Input
                  id="resetFee"
                  value={resetFee}
                  onChange={(e) => setResetFee(e.target.value)}
                  placeholder="Enter fee"
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={resettingOracle}>
                {resettingOracle ? 'Resetting...' : 'Reset Oracle Config'}
              </Button>
            </form>

            <form onSubmit={handleSetDataFeed} className="space-y-6">
              <div>
                <Label htmlFor="dataFeedId" className="text-foreground">Data Feed ID</Label>
                <Input
                  id="dataFeedId"
                  value={dataFeedId}
                  onChange={(e) => setDataFeedId(e.target.value)}
                  placeholder="Enter data feed ID"
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={settingFeed}>
                {settingFeed ? 'Setting...' : 'Set Data Feed ID'}
              </Button>
            </form>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-secondary/30 transition-all smooth-transition">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center transition-all smooth-transition">Dispute Resolution</h2>
          {disputesLoading ? (
            <p className="text-muted-foreground text-center">Loading disputes...</p>
          ) : pendingDisputes && pendingDisputes.length > 0 ? (
            <div>
              <Table className="mb-6">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-foreground text-center">Device Hash</TableHead>
                    <TableHead className="text-foreground text-center">Record Index</TableHead>
                    <TableHead className="text-foreground text-center">Disputer</TableHead>
                    <TableHead className="text-foreground text-center">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDisputes.map((request: any, index: number) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-all smooth-transition">
                      <TableCell className="text-foreground text-center">{request.deviceHash}</TableCell>
                      <TableCell className="text-foreground text-center">{request.recordIndex.toString()}</TableCell>
                      <TableCell className="text-foreground text-center">{request.disputer}</TableCell>
                      <TableCell className="text-foreground text-center">
                        {new Date(Number(request.timestamp) * 1000).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <form onSubmit={handleResolveDispute} className="space-y-6">
                <div>
                  <Label htmlFor="resolveDeviceHash" className="text-foreground">Device Hash</Label>
                  <Input
                    id="resolveDeviceHash"
                    value={resolveDeviceHash}
                    onChange={(e) => setResolveDeviceHash(e.target.value)}
                    placeholder="Enter device hash"
                    className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                  />
                </div>
                <div>
                  <Label htmlFor="resolveRecordIndex" className="text-foreground">Record Index</Label>
                  <Input
                    id="resolveRecordIndex"
                    value={resolveRecordIndex}
                    onChange={(e) => setResolveRecordIndex(e.target.value)}
                    placeholder="Enter record index"
                    className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolveValidity" className="text-foreground">Validity</Label>
                  <select
                    id="resolveValidity"
                    value={resolveValidity ? 'true' : 'false'}
                    onChange={(e) => setResolveValidity(e.target.value === 'true')}
                    className="w-full bg-background text-foreground border-border rounded-md p-2 transition-all smooth-transition"
                  >
                    <option value="true">Valid</option>
                    <option value="false">Invalid</option>
                  </select>
                </div>
                <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={resolvingDispute}>
                  {resolvingDispute ? 'Resolving...' : 'Resolve Dispute'}
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No pending disputes</p>
          )}
        </div>
      </motion.div>
    </main>
  );
}