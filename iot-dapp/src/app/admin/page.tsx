'use client';

import { useAdminAccess } from '@/hooks/useAdminAccess';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWatchContractEvent } from 'wagmi';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import accessManagerAbi from '@/abis/AccessManager.json';
import oracleIntegrationAbi from '@/abis/OracleIntegration.json';
import { formatUnits, keccak256, stringToHex } from 'viem';

// Updated with new deployment addresses
const ACCESS_MANAGER = "0x18C792C368279C490042E85fb4DCC2FB650CE44e"; // Replace with actual address if changed
const ORACLE_INTEGRATION = "0x48C20882E61Ca563E064376480D886870d1d695e"; // Updated from redeployment

export default function Admin() {
  const { isAdmin, isLoading, isConnected } = useAdminAccess();
  const { toast } = useToast();
  const [newAdmin, setNewAdmin] = useState('');
  const [oracleAddress, setOracleAddress] = useState('');
  const [dataFeedId, setDataFeedId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Check if current user is admin
  const { data: isAdminCheck } = useContractRead({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    functionName: 'isAdmin',
    args: [useAccount().address],
    enabled: isConnected && !!useAccount().address,
  });

  // Add new admin
  const { writeAsync: addAdmin, isPending: addingAdmin } = useContractWrite({
    address: ACCESS_MANAGER as `0x${string}`,
    abi: accessManagerAbi.abi,
    functionName: 'addAdmin',
  });

  // Set oracle address
  const { writeAsync: setOracle, isPending: settingOracle } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'setOracleAddress',
  });

  // Set data feed ID
  const { writeAsync: setFeed, isPending: settingFeed } = useContractWrite({
    address: ORACLE_INTEGRATION as `0x${string}`,
    abi: oracleIntegrationAbi.abi,
    functionName: 'setDataFeedId',
  });

  // Watch for AdminAdded events
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin) return;

    try {
      const tx = await addAdmin({
        args: [newAdmin],
      });
      
      toast({
        title: 'Adding new admin...',
        variant: 'default',
      });

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({
          title: 'Successfully added new admin',
          variant: 'success',
        });
        setNewAdmin('');
      } else {
        toast({
          title: 'Failed to add admin',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding admin',
        description: 'Please check the address and try again',
        variant: 'destructive',
      });
      console.error('Error adding admin:', error);
    }
  };

  const handleSetOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleAddress) return;

    try {
      const tx = await setOracle({
        args: [oracleAddress],
      });
      
      toast({
        title: 'Setting oracle address...',
        variant: 'default',
      });

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({
          title: 'Successfully set oracle address',
          variant: 'success',
        });
        setOracleAddress('');
      } else {
        toast({
          title: 'Failed to set oracle address',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error setting oracle address',
        description: 'Please check the address and try again',
        variant: 'destructive',
      });
      console.error('Error setting oracle:', error);
    }
  };

  const handleSetDataFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataFeedId) return;

    try {
      const tx = await setFeed({
        args: [stringToHex(dataFeedId)],
      });
      
      toast({
        title: 'Setting data feed ID...',
        variant: 'default',
      });

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast({
          title: 'Successfully set data feed ID',
          variant: 'success',
        });
        setDataFeedId('');
      } else {
        toast({
          title: 'Failed to set data feed ID',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error setting data feed ID',
        description: 'Please try again',
        variant: 'destructive',
      });
      console.error('Error setting data feed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Please connect your wallet to access admin features</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking admin access</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdminCheck) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto border-destructive">
          <CardHeader>
            <Shield className="w-12 h-12 mx-auto text-destructive" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>You do not have admin privileges</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage your IoT device tracking system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add Admin Form */}
          <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-secondary/30 transition-all smooth-transition">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center transition-all smooth-transition">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-6">
              <div>
                <Label htmlFor="newAdmin" className="text-foreground">Admin Address</Label>
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
        </CardContent>
      </Card>
    </div>
  );
}