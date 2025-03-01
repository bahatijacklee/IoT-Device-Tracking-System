'use client';

import { useEffect, useState } from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdmin, isLoading, error, isConnected } = useAdminAccess();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
        <ConnectButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Access Denied: You do not have admin privileges</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <ConnectButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Device Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add New Device
            </button>
            <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
              View All Devices
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Access</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Manage Permissions
            </button>
            <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
              View Access Logs
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Active Devices</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Users</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Network Status</span>
              <span className="text-green-500">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
