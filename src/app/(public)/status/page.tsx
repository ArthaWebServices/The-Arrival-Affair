'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkApplicationStatus } from '@/actions/status';
import { Loader2, Search, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function CheckStatusPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await checkApplicationStatus(phone);
      if (res.success) {
        setApplications(res.applications || []);
      } else {
        setError(res.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError('An error occurred while checking status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1"/> Under Review</Badge>;
      case 'CONTACTED':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><AlertCircle className="w-3 h-3 mr-1"/> Action Required</Badge>;
      case 'SELECTED':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Selected</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Not Selected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        
        <div className="mb-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
            ← Back to Home
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Check Application Status</h1>
          <p className="text-muted-foreground">Enter your phone number to see the status of your bookings.</p>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  className="pl-9 h-12 text-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Check Status'}
              </Button>
            </form>
            {error && <p className="text-sm text-destructive mt-3 text-center">{error}</p>}
          </CardContent>
        </Card>

        {hasSearched && !loading && applications.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Applications Found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">We couldn't find any bookings matching this phone number.</p>
            <Link href="/">
              <Button variant="outline">Browse Upcoming Events</Button>
            </Link>
          </div>
        )}

        {hasSearched && !loading && applications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium px-1">Your Applications ({applications.length})</h3>
            {applications.map((app) => (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg">{app.event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3.5 w-3.5" /> 
                        {formatDate(app.event.dateStart)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>Applied On: <span className="text-foreground font-medium">{new Date(app.submittedAt).toLocaleDateString()}</span></div>
                    <div>Event Type: <span className="text-foreground font-medium">{app.event.eventType}</span></div>
                    {app.transactionId && <div className="col-span-2">UTR/Transaction: <span className="text-foreground font-mono">{app.transactionId}</span></div>}
                  </div>
                  
                  {app.status === 'SELECTED' && (
                    <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100 flex gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm">Congratulations! Your booking is confirmed. The organizer will share further details via WhatsApp soon.</p>
                    </div>
                  )}
                  {app.status === 'NEW' && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-100 flex gap-2">
                      <Clock className="h-5 w-5 shrink-0 text-blue-600" />
                      <p className="text-sm">Your application has been received and is currently under review by the organizer.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
