'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Mountain } from 'lucide-react';
import VolunteerEventForm from '@/components/VolunteerEventForm';
import AdventureEventForm from '@/components/AdventureEventForm';

export default function CreateEventPage() {
  const router = useRouter();
  const [eventType, setEventType] = useState<'volunteer' | 'adventure'>('volunteer');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">Select the type of event you want to create</p>
        </div>
      </div>

      <Tabs value={eventType} onValueChange={(val: any) => setEventType(val)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="volunteer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Volunteer Event
          </TabsTrigger>
          <TabsTrigger value="adventure" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Adventure / Trek
          </TabsTrigger>
        </TabsList>
        <TabsContent value="volunteer">
          <VolunteerEventForm />
        </TabsContent>
        <TabsContent value="adventure">
          <AdventureEventForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
