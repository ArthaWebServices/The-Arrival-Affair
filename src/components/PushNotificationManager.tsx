'use client';

import { useEffect } from 'react';
import { useToast } from './ui/use-toast';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    async function setupPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Ask for permission if not already granted
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) return;
          
          const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
          
          // Save subscription to database
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          });
          
          toast({
            title: "Notifications Enabled",
            description: "You will now receive alerts for new leads.",
          });
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    }

    setupPush();
  }, []);

  return null;
}
