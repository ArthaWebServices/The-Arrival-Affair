'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Calendar, MapPin, DollarSign, Users, Clock, Phone, Share2,
  MessageSquare, AlertCircle, CheckCircle, X, Loader2, Mountain,
  UtensilsCrossed, Mail, UserCheck,
} from 'lucide-react';
import { formatDate, maskPhone, getWhatsAppLink } from '@/lib/utils';
import { createInterest } from '@/actions/interests';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function EventDetailClient({ event }: { event: any }) {
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    foodPreference: '',
    transactionId: '',
    paymentScreenshot: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    transactionId: '',
    paymentScreenshot: '',
  });

  const isAdventure = event.eventType === 'ADVENTURE';
  const hasPayment = !!(event.upiId || event.paymentQrCode);

  const interestCount = event._count?.interests || event.interests?.length || 0;
  const slotsLeft = event.slotsNeeded - interestCount;
  const isFilled = slotsLeft <= 0 || event.status === 'FILLED' || event.status === 'CLOSED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { name: '', phone: '', email: '', gender: '', transactionId: '', paymentScreenshot: '' };
    let hasError = false;

    if (!formData.name.trim()) { newErrors.name = 'Name is required'; hasError = true; }
    if (!formData.phone.trim() || formData.phone.length < 10) { newErrors.phone = 'Valid phone number required'; hasError = true; }

    if (isAdventure) {
      if (!formData.gender) { newErrors.gender = 'Please select your gender'; hasError = true; }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'; hasError = true;
      }
    }

    if (hasPayment) {
      if (!formData.transactionId.trim()) { newErrors.transactionId = 'Transaction ID is required'; hasError = true; }
      if (!formData.paymentScreenshot) { newErrors.paymentScreenshot = 'Payment screenshot is required'; hasError = true; }
    }

    if (hasError) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      await createInterest({
        eventId: event.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        gender: formData.gender || undefined,
        foodPreference: formData.foodPreference || undefined,
        transactionId: formData.transactionId || undefined,
        paymentScreenshot: formData.paymentScreenshot || undefined,
      });
      toast({ title: 'Registration submitted! 🎉', description: "We'll contact you soon." });
      setFormData({ name: '', phone: '', email: '', gender: '', foodPreference: '', transactionId: '', paymentScreenshot: '' });
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
    const message = `Check out this ${isAdventure ? 'trek/adventure' : 'volunteer opportunity'}: ${event.title} on ${formatDate(event.dateStart)} at ${event.location}`;
    window.open(getWhatsAppLink(event.contact, message), '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Back Link */}
        <div className="mb-5">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
            ← Back to Events
          </a>
        </div>

        {/* Event Banner Image */}
        {event.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden border shadow-sm w-full" style={{ maxHeight: '420px' }}>
            <img
              src={event.imageUrl}
              alt={`${event.title} banner`}
              className="w-full object-cover"
              style={{ maxHeight: '420px' }}
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {isAdventure && (
              <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                <Mountain className="h-3 w-3" /> Adventure / Trek
              </Badge>
            )}
            {event.status === 'FILLED' && <Badge variant="outline">Filled</Badge>}
            {event.status === 'ACTIVE' && new Date(event.dateStart) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
              <Badge variant="destructive">Urgent</Badge>
            )}
            {new Date(event.dateStart).toDateString() === new Date().toDateString() && (
              <Badge variant="secondary">Today</Badge>
            )}
            {!isAdventure && parseFloat(event.payment.replace(/[^0-9.]/g, '')) > 1000 && <Badge>High Pay</Badge>}
            <Badge variant="secondary">{event.status}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
          {event.tagline && (
            <p className="text-base sm:text-lg text-emerald-700 dark:text-emerald-400 font-medium mb-2 italic">
              "{event.tagline}"
            </p>
          )}
          <p className="text-muted-foreground text-base sm:text-lg">{event.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Date & Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-5 w-5" /> Date &amp; Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Event Date</label>
                    <p className="text-sm sm:text-base font-medium">{formatDate(event.dateStart)}</p>
                    {event.dateEnd && (
                      <p className="text-xs text-muted-foreground">Ends: {formatDate(event.dateEnd)}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {isAdventure ? 'Assembly Time' : 'Reporting Time'}
                    </label>
                    <p className="text-sm sm:text-base flex items-center gap-1 font-medium">
                      <Clock className="h-4 w-4 inline" /> {event.reportingTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {isAdventure ? 'Trek Duration' : 'Event Duration'}
                    </label>
                    <p className="text-sm sm:text-base font-medium">{event.eventHours}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Slots Available</label>
                    <p className="text-sm sm:text-base font-semibold">
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
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="h-5 w-5" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.destination && (
                  <p className="text-sm text-muted-foreground mb-1">
                    🏔️ <span className="font-medium text-foreground">Destination:</span> {event.destination}
                  </p>
                )}
                <p className="mb-2 font-medium text-sm sm:text-base">📍 {event.location}</p>
                {event.mapLink && (
                  <a
                    href={event.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <MapPin className="h-4 w-4" /> View on Google Maps
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Role & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    {isAdventure ? 'Eligibility' : 'Role & Requirements'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isAdventure && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Role</label>
                      <p className="text-sm sm:text-base">{event.role}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Open To</label>
                    <p className="text-sm sm:text-base">{event.genderReq}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-5 w-5" />
                    {isAdventure ? 'Price & Inclusions' : 'Payment & Perks'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {isAdventure ? 'Price per Person' : 'Payment'}
                    </label>
                    <p className="text-base sm:text-lg font-semibold">
                      {isAdventure ? `₹${event.payment}` : event.payment}
                    </p>
                  </div>
                  {event.perks && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {isAdventure ? "What's Included" : 'Perks'}
                      </label>
                      {isAdventure ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {event.perks.split(',').map((perk: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              ✓ {perk.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base">{event.perks}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Registration / Interest Form */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {isAdventure ? 'Book Your Spot' : 'Express Interest'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isFilled ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">This event is filled</h3>
                    <p className="text-muted-foreground text-sm">All slots have been taken. Check out other events!</p>
                    <a href="/" className="mt-4 inline-block">
                      <Button variant="outline">Browse Other Events</Button>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
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
                        <Label htmlFor="phone">Phone Number *</Label>
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
                    </div>

                    {/* Adventure-specific Fields */}
                    {isAdventure && (
                      <div className="space-y-4 border-t pt-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Trek Registration Details</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Email */}
                          <div>
                            <Label htmlFor="email" className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" /> Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="you@example.com"
                              className={errors.email ? 'border-destructive' : ''}
                              disabled={isSubmitting}
                            />
                            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                          </div>

                          {/* Gender */}
                          <div>
                            <Label htmlFor="gender" className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5" /> Gender *
                            </Label>
                            <Select
                              value={formData.gender}
                              onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger id="gender" className={errors.gender ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Non-binary">Non-binary</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                          </div>
                        </div>

                        {/* Food Preference */}
                        <div>
                          <Label htmlFor="foodPreference" className="flex items-center gap-1">
                            <UtensilsCrossed className="h-3.5 w-3.5" /> Food Preference
                          </Label>
                          <Select
                            value={formData.foodPreference}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, foodPreference: v }))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger id="foodPreference">
                              <SelectValue placeholder="Select food preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vegetarian">🥦 Vegetarian</SelectItem>
                              <SelectItem value="Non-Vegetarian">🍗 Non-Vegetarian</SelectItem>
                              <SelectItem value="Vegan">🌱 Vegan</SelectItem>
                              <SelectItem value="Jain">🙏 Jain</SelectItem>
                              <SelectItem value="No Preference">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Payment Section */}
                    {hasPayment && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <p className="text-sm font-semibold">Pay to Confirm Your Booking</p>
                          {event.upiId && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">UPI ID</p>
                              <p className="font-mono text-sm bg-background px-3 py-1.5 rounded border mt-1 select-all">{event.upiId}</p>
                            </div>
                          )}
                          {event.paymentQrCode && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Scan to Pay</p>
                              <img src={event.paymentQrCode} alt="Payment QR Code" className="max-w-[180px] sm:max-w-[200px] rounded-lg shadow-sm" />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="transactionId">Transaction ID / UTR *</Label>
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

                    <p className="text-xs text-muted-foreground pt-1">
                      By submitting, you agree to be contacted by the organizer regarding this {isAdventure ? 'trek' : 'event'}.
                    </p>
                    <Button type="submit" className={`w-full ${isAdventure ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                      ) : isAdventure ? (
                        <><Mountain className="mr-2 h-4 w-4" /> Book My Spot</>
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
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Organizer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-lg font-mono font-medium">
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
                    className="w-full justify-start text-sm"
                    onClick={() => window.open(`tel:${event.contact.replace(/\D/g, '')}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm"
                    onClick={() => window.open(getWhatsAppLink(event.contact))}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Share This Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" onClick={copyLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={shareWhatsApp}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Share on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
