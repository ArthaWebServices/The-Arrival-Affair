'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createEvent } from '@/actions/events';
import { eventSchema } from '@/lib/validations';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function VolunteerEventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateStart: '',
    dateEnd: '',
    reportingTime: '',
    eventHours: '',
    location: '',
    mapLink: '',
    role: '',
    payment: '',
    perks: '',
    genderReq: 'Any',
    slotsNeeded: 1,
    contact: '',
    imageUrl: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dateStart) newErrors.dateStart = 'Start date is required';
    if (!formData.reportingTime.trim()) newErrors.reportingTime = 'Reporting time is required';
    if (!formData.eventHours.trim()) newErrors.eventHours = 'Event hours is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.payment.trim()) newErrors.payment = 'Payment is required';
    if (!formData.genderReq) newErrors.genderReq = 'Gender requirement is required';
    if (!formData.slotsNeeded || formData.slotsNeeded < 1) newErrors.slotsNeeded = 'At least 1 slot required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.contact)) newErrors.contact = 'Valid phone number required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const event = await createEvent({
        ...formData,
        slotsNeeded: Number(formData.slotsNeeded),
        status: 'DRAFT',
      });
      router.push(`/admin/events/${event.id}/edit`);
      router.refresh();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* form only */}

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Marathon Volunteer Crew"
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event, volunteer roles, and what to expect..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Event Banner Image</Label>
              <CloudinaryUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Upload a poster or banner for this event (optional)</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateStart">Start Date & Time *</Label>
                <Input
                  id="dateStart"
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateStart: e.target.value }))}
                  className={errors.dateStart ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.dateStart && <p className="text-sm text-destructive">{errors.dateStart}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEnd">End Date & Time</Label>
                <Input
                  id="dateEnd"
                  type="datetime-local"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportingTime">Reporting Time *</Label>
                <Input
                  id="reportingTime"
                  value={formData.reportingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportingTime: e.target.value }))}
                  placeholder="e.g., 5:30 AM"
                  className={errors.reportingTime ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.reportingTime && <p className="text-sm text-destructive">{errors.reportingTime}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventHours">Event Hours *</Label>
                <Input
                  id="eventHours"
                  value={formData.eventHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventHours: e.target.value }))}
                  placeholder="e.g., 8 hours"
                  className={errors.eventHours ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.eventHours && <p className="text-sm text-destructive">{errors.eventHours}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slotsNeeded">Slots Needed *</Label>
                <Input
                  id="slotsNeeded"
                  type="number"
                  min="1"
                  value={formData.slotsNeeded}
                  onChange={(e) => setFormData(prev => ({ ...prev, slotsNeeded: parseInt(e.target.value, 10) || 0 }))}
                  className={errors.slotsNeeded ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.slotsNeeded && <p className="text-sm text-destructive">{errors.slotsNeeded}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., City Center Park, Main Street"
                className={errors.location ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapLink">Google Maps Link</Label>
              <Input
                id="mapLink"
                type="url"
                value={formData.mapLink}
                onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
                placeholder="https://maps.google.com/?q=..."
                disabled={isLoading}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Route Marshal / Water Station"
                  className={errors.role ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="genderReq">Gender Requirement *</Label>
                <Select
                  value={formData.genderReq}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genderReq: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.genderReq ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genderReq && <p className="text-sm text-destructive">{errors.genderReq}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment / Compensation *</Label>
              <Input
                id="payment"
                value={formData.payment}
                onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value }))}
                placeholder="e.g., ₹500 + Lunch + Certificate"
                className={errors.payment ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.payment && <p className="text-sm text-destructive">{errors.payment}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perks">Perks & Benefits</Label>
              <Textarea
                id="perks"
                value={formData.perks}
                onChange={(e) => setFormData(prev => ({ ...prev, perks: e.target.value }))}
                placeholder="e.g., Free lunch, event t-shirt, volunteer certificate, transport reimbursement"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="e.g., +91 98765 43210"
                className={errors.contact ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
              <p className="text-xs text-muted-foreground">This will be shown to volunteers (masked until clicked)</p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1" disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}