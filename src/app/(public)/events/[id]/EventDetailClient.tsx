'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

import { Calendar, MapPin, DollarSign, Users, Clock, Phone, Share2, MessageSquare, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { formatDate, maskPhone, getWhatsAppLink } from '@/lib/utils';
import { createInterest } from '@/actions/interests';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function EventDetailClient({ event }: { event: any }) {
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', transactionId: '', paymentScreenshot: '' });
  const [errors, setErrors] = useState({ name: '', phone: '', transactionId: '', paymentScreenshot: '' });

  const hasPayment = !!(event.upiId || event.paymentQrCode);

  const interestCount = event._count?.interests || event.interests?.length || 0;
  const slotsLeft = event.slotsNeeded - interestCount;
  const isFilled = slotsLeft <= 0 || event.status === 'FILLED' || event.status === 'CLOSED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: '', phone: '', transactionId: '', paymentScreenshot: '' });

    let hasError = false;
    const newErrors = { name: '', phone: '', transactionId: '', paymentScreenshot: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      hasError = true;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'Valid phone number required';
      hasError = true;
    }
    
    if (hasPayment) {
      if (!formData.transactionId.trim()) {
        newErrors.transactionId = 'Transaction ID is required';
        hasError = true;
      }
      if (!formData.paymentScreenshot) {
        newErrors.paymentScreenshot = 'Payment screenshot is required';
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createInterest({ 
        eventId: event.id, 
        name: formData.name, 
        phone: formData.phone,
        transactionId: formData.transactionId || undefined,
        paymentScreenshot: formData.paymentScreenshot || undefined
      });
      toast({ title: 'Interest submitted!', description: "We'll contact you soon." });
      setFormData({ name: '', phone: '', transactionId: '', paymentScreenshot: '' });
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const message = `Check out this volunteer opportunity: ${event.title} on ${formatDate(event.dateStart)} at ${event.location}`;
    window.open(getWhatsAppLink(event.contact, message), '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <div className="mb-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back to Events
          </a>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.status === 'FILLED' && <Badge variant="outline">Filled</Badge>}
            {event.status === 'ACTIVE' && new Date(event.dateStart) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && <Badge variant="destructive">Urgent</Badge>}
            {new Date(event.dateStart).toDateString() === new Date().toDateString() && <Badge variant="secondary">Today</Badge>}
            {parseFloat(event.payment.replace(/[^0-9.]/g, '')) > 1000 && <Badge>High Pay</Badge>}
            <Badge variant="secondary">{event.status}</Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground text-lg">{event.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event Date</label>
                    <p className="text-lg">{formatDate(event.dateStart)}</p>
                    {event.dateEnd && (
                      <p className="text-sm text-muted-foreground">Ends: {formatDate(event.dateEnd)}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reporting Time</label>
                    <p className="text-lg flex items-center gap-1">
                      <Clock className="h-5 w-5 inline" />
                      {event.reportingTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event Duration</label>
                    <p className="text-lg">{event.eventHours}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Slots Available</label>
                    <p className="text-lg font-semibold">
                      {isFilled ? (
                        <span className="text-red-600">Filled</span>
                      ) : (
                        <span className="text-green-600">{slotsLeft} of {event.slotsNeeded}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{event.location}</p>
                {event.mapLink && (
                  <a
                    href={event.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    View on Google Maps
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Role & Payment */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Role & Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p>{event.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender Requirement</label>
                    <p>{event.genderReq}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment</label>
                    <p className="text-lg font-semibold">{event.payment}</p>
                  </div>
                  {event.perks && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Perks</label>
                      <p>{event.perks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Apply Section */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Express Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isFilled ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">This event is filled</h3>
                    <p className="text-muted-foreground">All volunteer slots have been taken. Check out other events!</p>
                    <a href="/" className="mt-4 inline-block">
                      <Button variant="outline">Browse Other Events</Button>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        className={errors.phone ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    {hasPayment && (
                      <div className="space-y-4 border-t pt-4 mt-4">
                        <div className="space-y-2">
                          <Label>Payment Options</Label>
                          <div className="bg-muted p-4 rounded-lg space-y-4">
                            {event.upiId && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">UPI ID</p>
                                <p className="font-mono">{event.upiId}</p>
                              </div>
                            )}
                            {event.paymentQrCode && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Scan to Pay</p>
                                <img src={event.paymentQrCode} alt="Payment QR Code" className="max-w-[200px] rounded-lg shadow-sm" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="transactionId">Transaction ID *</Label>
                          <Input
                            id="transactionId"
                            value={formData.transactionId}
                            onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                            placeholder="Enter Transaction / UTR number"
                            className={errors.transactionId ? 'border-destructive' : ''}
                            disabled={isSubmitting}
                          />
                          {errors.transactionId && <p className="text-sm text-destructive mt-1">{errors.transactionId}</p>}
                        </div>

                        <div>
                          <Label>Payment Screenshot *</Label>
                          <CloudinaryUpload
                            value={formData.paymentScreenshot}
                            onChange={(url) => setFormData(prev => ({ ...prev, paymentScreenshot: url }))}
                            disabled={isSubmitting}
                          />
                          {errors.paymentScreenshot && <p className="text-sm text-destructive mt-1">{errors.paymentScreenshot}</p>}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground pt-2">
                      By submitting, you agree to be contacted by the event organizer regarding this opportunity.
                    </p>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "I'm Interested"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Contact Organizer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-xl font-mono font-medium">
                      {showPhone ? event.contact : maskPhone(event.contact)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPhone(!showPhone)}
                    aria-label={showPhone ? 'Hide phone' : 'Show phone'}
                  >
                    {showPhone ? <X className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${event.contact.replace(/\D/g, '')}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(getWhatsAppLink(event.contact))}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="sticky top-24 mt-4">
              <CardHeader>
                <CardTitle>Share This Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={copyLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={shareWhatsApp}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
