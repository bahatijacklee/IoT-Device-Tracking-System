'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIoTDataLedger } from '@/hooks/useIoTDataLedger';
import { toast } from 'sonner';

export default function Data() {
  const [deviceId, setDeviceId] = useState('');
  const [dataValue, setDataValue] = useState('');
  
  const {
    handleSubmitData,
    isSubmitting,
    pendingRequests,
    isLoadingRequests
  } = useIoTDataLedger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !dataValue) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await handleSubmitData(deviceId, dataValue, Date.now());
      setDeviceId('');
      setDataValue('');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background transition-all smooth-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 animate-fadeIn transition-all smooth-transition text-center"
      >
        <h1 className="text-4xl font-bold flex items-center justify-center text-foreground transition-all smooth-transition">
          <Database className="mr-4 h-8 w-8 sm:h-10 sm:w-10 text-primary transition-all smooth-transition" /> IoT Data Management
        </h1>

        {/* Submit IoT Device Data Card */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all smooth-transition">
          <CardHeader>
            <CardTitle className="text-foreground transition-all smooth-transition">Submit IoT Device Data</CardTitle>
            <CardDescription className="text-muted-foreground transition-all smooth-transition">Record new data from your IoT device on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deviceId" className="text-foreground">Device ID</Label>
                <Input
                  id="deviceId"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter device ID"
                  required
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataValue" className="text-foreground">Data Value</Label>
                <Input
                  id="dataValue"
                  value={dataValue}
                  onChange={(e) => setDataValue(e.target.value)}
                  placeholder="Enter data value"
                  required
                  className="w-full bg-background text-foreground border-border transition-all smooth-transition"
                />
              </div>
              <Button type="submit" className="btn-modern w-full transition-all smooth-transition" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Data'}
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Pending Data Disputes Card */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all smooth-transition">
          <CardHeader>
            <CardTitle className="text-foreground transition-all smooth-transition">Pending Data Disputes</CardTitle>
            <CardDescription className="text-muted-foreground transition-all smooth-transition">View current pending data validation requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <p className="text-green-500">Loading disputes...</p> // Changed to green
            ) : pendingRequests && pendingRequests.length > 0 ? (
              <ul className="space-y-2">
                {pendingRequests.map((request: any, index: number) => (
                  <li key={index} className="p-2 border border-border rounded bg-background transition-all smooth-transition">
                    Device ID: {request.deviceId}<br />
                    Data Value: {request.value}<br />
                    Timestamp: {new Date(Number(request.timestamp)).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No pending disputes</p>
            )}
          </CardContent>
        </div>
      </motion.div>
    </main>
  );
}