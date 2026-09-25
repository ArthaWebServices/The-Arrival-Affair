'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Mountain,
  MapPin,
  Users,
  Clock,
  IndianRupee,
  Package,
  CalendarDays,
  Phone,
  Image as ImageIcon,
  Navigation,
} from 'lucide-react';
import { createEvent } from '@/actions/events';
import CloudinaryUpload from '@/components/CloudinaryUpload';

const INCLUSION_PRESETS = [
  'Breakfast & Lunch',
  'Travel',
  'Trek Guide',
  'First Aid Kit',
  'Dinner',
  'Accommodation',
  'Photography',
  'Equipment',
  'Water & Snacks',
  'Certificate',
];

export default function AdventureEventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [inclusions, setInclusions] = useState<string[]>([
    'Breakfast & Lunch',
    'Travel',
    'Trek Guide',
    'First Aid Kit',
  ]);
  const [newInclusion, setNewInclusion] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    dateStart: '',
    dateEnd: '',
    reportingTime: '',
    eventHours: '',
    location: '',
    destination: '',
    mapLink: '',
    price: '',
    genderReq: 'Any',
    slotsNeeded: 20,
    contact: '',
    imageUrl: '',
    upiId: '',
    paymentQrCode: '',
  });

  const set = (field: string, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ── Inclusions helpers ──────────────────────────────────────────────────────
  const addInclusion = (text?: string) => {
    const val = (text ?? newInclusion).trim();
    if (val && !inclusions.includes(val)) {
      setInclusions((prev) => [...prev, val]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (idx: number) =>
    setInclusions((prev) => prev.filter((_, i) => i !== idx));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Event name is required';
    if (!formData.dateStart) e.dateStart = 'Event date is required';
    if (!formData.reportingTime.trim()) e.reportingTime = 'Assembly time is required';
    if (!formData.eventHours.trim()) e.eventHours = 'Trek duration is required';
    if (!formData.location.trim()) e.location = 'Meeting point is required';
    if (!formData.price.trim()) e.price = 'Price per person is required';
    if (!formData.slotsNeeded || formData.slotsNeeded < 1)
      e.slotsNeeded = 'At least 1 seat is required';
    if (!formData.contact.trim()) e.contact = 'Contact number is required';
    else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.contact))
      e.contact = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const perksText = inclusions.join(', ');

      const event = await createEvent({
        title: formData.title,
        description:
          formData.description.trim() ||
          formData.tagline.trim() ||
          'Adventure & trekking event',
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd || undefined,
        reportingTime: formData.reportingTime,
        eventHours: formData.eventHours,
        location: formData.location,
        mapLink: formData.mapLink || undefined,
        role: 'Participant',
        payment: formData.price,
        perks: perksText || undefined,
        genderReq: formData.genderReq,
        slotsNeeded: Number(formData.slotsNeeded),
        contact: formData.contact,
        imageUrl: formData.imageUrl || undefined,
        eventType: 'ADVENTURE',
        tagline: formData.tagline || undefined,
        destination: formData.destination || undefined,
        upiId: formData.upiId || undefined,
        paymentQrCode: formData.paymentQrCode || undefined,
        status: 'DRAFT',
      });

      router.push(`/admin/events/${event.id}/edit`);
      router.refresh();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.submit && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* ── Basic Info ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mountain className="h-4 w-4 text-emerald-600" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="adv-title">Event Name *</Label>
              <Input
                id="adv-title"
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g., Tandul Trails 2.0"
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="adv-tagline">Tagline / Subtitle</Label>
              <Input
                id="adv-tagline"
                value={formData.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g., A Trail. A Story. A Memory Forever."
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="adv-description">Description</Label>
              <Textarea
                id="adv-description"
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the trek, what participants can expect, difficulty level..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Banner Image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> Event Poster / Banner
              </Label>
              <CloudinaryUpload
                value={formData.imageUrl}
                onChange={(url) => set('imageUrl', url)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Upload the event poster (PNG, JPG, WEBP — up to 10 MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Date & Timing ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Date &amp; Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adv-dateStart">Event Date *</Label>
                <Input
                  id="adv-dateStart"
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={(e) => set('dateStart', e.target.value)}
                  className={errors.dateStart ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.dateStart && (
                  <p className="text-sm text-destructive">{errors.dateStart}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv-dateEnd">Return Date (optional)</Label>
                <Input
                  id="adv-dateEnd"
                  type="datetime-local"
                  value={formData.dateEnd}
                  onChange={(e) => set('dateEnd', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adv-reportingTime" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Assembly Time *
                </Label>
                <Input
                  id="adv-reportingTime"
                  value={formData.reportingTime}
                  onChange={(e) => set('reportingTime', e.target.value)}
                  placeholder="e.g., 5:30 AM"
                  className={errors.reportingTime ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.reportingTime && (
                  <p className="text-sm text-destructive">{errors.reportingTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv-eventHours" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Trek Duration *
                </Label>
                <Input
                  id="adv-eventHours"
                  value={formData.eventHours}
                  onChange={(e) => set('eventHours', e.target.value)}
                  placeholder="e.g., 6 hours / Full day"
                  className={errors.eventHours ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.eventHours && (
                  <p className="text-sm text-destructive">{errors.eventHours}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Location ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adv-location" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Meeting Point *
                </Label>
                <Input
                  id="adv-location"
                  value={formData.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g., Saphale Station"
                  className={errors.location ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv-destination" className="flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" /> Trek Destination
                </Label>
                <Input
                  id="adv-destination"
                  value={formData.destination}
                  onChange={(e) => set('destination', e.target.value)}
                  placeholder="e.g., Tandulwaki"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adv-mapLink">Google Maps Link</Label>
              <Input
                id="adv-mapLink"
                type="url"
                value={formData.mapLink}
                onChange={(e) => set('mapLink', e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Pricing & Inclusions ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Pricing &amp; Inclusions
            </CardTitle>
            <CardDescription>What participants pay and what's covered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="adv-price">Price Per Person *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ₹
                </span>
                <Input
                  id="adv-price"
                  value={formData.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="e.g., 599"
                  className={`pl-7 ${errors.price ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            {/* Payment Options (UPI ID and QR Code) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adv-upiId">UPI ID (Optional)</Label>
                <Input
                  id="adv-upiId"
                  value={formData.upiId}
                  onChange={(e) => set('upiId', e.target.value)}
                  placeholder="e.g., example@upi"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> Payment QR Code
                </Label>
                <CloudinaryUpload
                  value={formData.paymentQrCode}
                  onChange={(url) => set('paymentQrCode', url)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a QR code for users to scan and pay
                </p>
              </div>
            </div>

            {/* Inclusions */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" /> What's Included
              </Label>

              {/* Current inclusions */}
              <div className="flex flex-wrap gap-2">
                {inclusions.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeInclusion(idx)}
                      className="hover:text-red-500 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick presets */}
              <div className="flex flex-wrap gap-1.5">
                {INCLUSION_PRESETS.filter((p) => !inclusions.includes(p)).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addInclusion(preset)}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-full border border-dashed border-muted-foreground/40 text-xs text-muted-foreground hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom inclusion */}
              <div className="flex gap-2">
                <Input
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  placeholder="Add custom inclusion..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInclusion();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addInclusion()}
                  disabled={isLoading || !newInclusion.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Capacity & Eligibility ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              Capacity &amp; Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adv-slotsNeeded">Total Seats *</Label>
                <Input
                  id="adv-slotsNeeded"
                  type="number"
                  min="1"
                  value={formData.slotsNeeded}
                  onChange={(e) => set('slotsNeeded', parseInt(e.target.value, 10) || 0)}
                  className={errors.slotsNeeded ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.slotsNeeded && (
                  <p className="text-sm text-destructive">{errors.slotsNeeded}</p>
                )}
                <p className="text-xs text-muted-foreground">Limited seats — first come, first served</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv-genderReq">Open To</Label>
                <Select
                  value={formData.genderReq}
                  onValueChange={(v) => set('genderReq', v)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="adv-genderReq">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Everyone</SelectItem>
                    <SelectItem value="Male">Male only</SelectItem>
                    <SelectItem value="Female">Female only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Contact ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="adv-contact">Contact Number *</Label>
              <Input
                id="adv-contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => set('contact', e.target.value)}
                placeholder="e.g., +91 84249 35816"
                className={errors.contact ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.contact && (
                <p className="text-sm text-destructive">{errors.contact}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This number will be shown to participants for bookings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Mountain className="mr-2 h-4 w-4" />
                Create Adventure Event
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
