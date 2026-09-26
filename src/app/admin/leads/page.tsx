'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Download, MoreHorizontal, Phone, MessageSquare, Mail, Loader2, Check, X, CreditCard, ImageIcon } from 'lucide-react';
import { formatDate, getWhatsAppLink, maskPhone } from '@/lib/utils';
import { getInterests, updateInterestStatus, exportInterestsToCSV } from '@/actions/interests';
import { useToast } from '@/components/ui/use-toast';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  NEW: { label: 'New', variant: 'default' },
  CONTACTED: { label: 'Contacted', variant: 'secondary' },
  SELECTED: { label: 'Selected', variant: 'outline' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
};

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [showPhone, setShowPhone] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLead, setPaymentLead] = useState<any>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getInterests();
      setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.event.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesEvent = !eventFilter || lead.eventId === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  // Unique events from leads for the filter dropdown
  const uniqueEvents = Array.from(
    new Map(leads.map(l => [l.eventId, { id: l.eventId, title: l.event.title }])).values()
  );

  const handleStatusChange = async () => {
    if (!selectedLead || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateInterestStatus(selectedLead.id, newStatus);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: newStatus } : l));
      toast({ title: 'Status updated', description: `${selectedLead.name} marked as ${newStatus.toLowerCase()}.` });
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportInterestsToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Export successful', description: 'CSV file downloaded.' });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage volunteer applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Events</SelectItem>
                {uniqueEvents.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
                      <p className="text-muted-foreground">Loading applications...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-muted-foreground">No applications found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const status = statusConfig[lead.status as string] ?? { label: lead.status, variant: 'default' as const };

                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{lead.event.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {showPhone[lead.id] ? lead.phone : maskPhone(lead.phone)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => setShowPhone(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))}
                            >
                              {showPhone[lead.id] ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(lead.submittedAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => window.open(`tel:${lead.phone.replace(/\D/g, '')}`)}
                              >
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const msg = `Hi ${lead.name}, this is regarding your application for the event "${lead.event.title}".`;
                                  window.open(getWhatsAppLink(lead.phone, msg), '_blank');
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                WhatsApp
                              </DropdownMenuItem>
                              {(lead.transactionId || lead.paymentScreenshot) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPaymentLead(lead);
                                    setPaymentDialogOpen(true);
                                  }}
                                >
                                  <CreditCard className="mr-2 h-4 w-4 text-emerald-600" />
                                  View Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {['CONTACTED', 'SELECTED', 'REJECTED'].map(status => (
                                <DropdownMenuItem
                                  key={status}
                                  className={status === 'REJECTED' ? 'text-destructive focus:text-destructive' : ''}
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setNewStatus(status);
                                    setDialogOpen(true);
                                  }}
                                >
                                  Mark as {status.charAt(0) + status.slice(1).toLowerCase()}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <p className="text-muted-foreground">
                Update status for <strong>{selectedLead?.name}</strong> ({selectedLead?.event?.title})
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={newStatus === key ? 'default' : 'outline'}
                    className={config.variant === 'destructive' ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
                    onClick={() => setNewStatus(key)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            {newStatus && newStatus !== selectedLead?.status && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Notify {selectedLead?.name} via WhatsApp?</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => {
                    let msg = '';
                    if (newStatus === 'SELECTED') {
                      msg = `Hi ${selectedLead.name}, great news! Your application for "${selectedLead.event.title}" has been selected. We will share further details shortly.`;
                    } else if (newStatus === 'REJECTED') {
                      msg = `Hi ${selectedLead.name}, thank you for your interest in "${selectedLead.event.title}". Unfortunately, we are unable to move forward with your application at this time.`;
                    } else {
                      msg = `Hi ${selectedLead.name}, this is regarding your application for "${selectedLead.event.title}".`;
                    }
                    window.open(getWhatsAppLink(selectedLead.phone, msg), '_blank');
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Status Update on WhatsApp
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus || updatingStatus}>
              {updatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {paymentLead && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applicant</p>
                    <p className="font-medium">{paymentLead.name}</p>
                  </div>
                  {paymentLead.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm break-all">{paymentLead.email}</p>
                    </div>
                  )}
                  {paymentLead.gender && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-sm">{paymentLead.gender}</p>
                    </div>
                  )}
                  {paymentLead.foodPreference && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Food Preference</p>
                      <p className="text-sm">{paymentLead.foodPreference}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="font-mono bg-muted p-2 rounded inline-block mt-1 text-sm">{paymentLead.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Screenshot</p>
                  {paymentLead.paymentScreenshot ? (
                    <div className="mt-2 border rounded-lg overflow-hidden relative group">
                      <img src={paymentLead.paymentScreenshot} alt="Payment Screenshot" className="w-full object-contain max-h-[400px]" />
                      <a href={paymentLead.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="h-8 w-8 text-white mr-2" />
                        <span className="text-white font-medium">Open Original</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1 text-sm">No screenshot provided</p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}