'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Calendar, MapPin, Users, AlertCircle, ImageIcon } from 'lucide-react';
import { updateEvent, deleteEvent, getEventById } from '@/actions/events';
import CloudinaryUpload from '@/components/CloudinaryUpload';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active - Published and accepting applications' },
  { value: 'DRAFT', label: 'Draft - Not visible to public' },
  { value: 'CLOSED', label: 'Closed - No longer accepting applications' },
  { value: 'FILLED', label: 'Filled - All slots taken' },
];

const genderOptions = [
  { value: 'Any', label: 'Any Gender' },
  { value: 'Male', label: 'Male Only' },
  { value: 'Female', label: 'Female Only' },
];

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    status: 'DRAFT',
    imageUrl: '',
  });

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        const event = await getEventById(id);
        if (!event) {
          router.push('/admin/events');
          return;
        }
        setFormData({
          title: event.title,
          description: event.description,
          dateStart: toDateInputValue(event.dateStart),
          dateEnd: toDateInputValue(event.dateEnd),
          reportingTime: event.reportingTime,
          eventHours: event.eventHours,
          location: event.location,
          mapLink: event.mapLink ?? '',
          role: event.role,
          payment: event.payment,
          perks: event.perks ?? '',
          genderReq: event.genderReq,
          slotsNeeded: event.slotsNeeded,
          contact: event.contact,
          status: event.status,
          imageUrl: (event as any).imageUrl ?? '',
        });
      } catch (error) {
        console.error('Failed to load event', error);
        router.push('/admin/events');
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.dateStart) newErrors.dateStart = 'Start date is required';
    if (!formData.reportingTime.trim()) newErrors.reportingTime = 'Reporting time is required';
    if (!formData.eventHours.trim()) newErrors.eventHours = 'Event hours is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.mapLink && !formData.mapLink.startsWith('http')) newErrors.mapLink = 'Must be a valid URL';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.payment.trim()) newErrors.payment = 'Payment is required';
    if (!formData.genderReq) newErrors.genderReq = 'Gender requirement is required';
    if (!formData.slotsNeeded || formData.slotsNeeded < 1) newErrors.slotsNeeded = 'At least 1 slot needed';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    else if (formData.contact.length < 10) newErrors.contact = 'Valid contact number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'publish') => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await updateEvent(id, {
        ...formData,
        status: action === 'publish' ? 'ACTIVE' : formData.status as any,
        slotsNeeded: Number(formData.slotsNeeded),
      });
      router.push('/admin/events');
      router.refresh();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update event. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteEvent(id);
      router.push('/admin/events');
      router.refresh();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to delete event.' });
      setDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-2 sm:mb-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground mt-1">Update the event details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/events/${id}`)}>
            View Public Page
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-6">
        {errors.submit && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Marathon Volunteer Crew"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the event, responsibilities, and what volunteers will be doing..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Event Banner Image
              </Label>
              <CloudinaryUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              />
              <p className="text-xs text-muted-foreground">Upload the event poster or banner (optional)</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateStart">Start Date *</Label>
                <Input
                  id="dateStart"
                  name="dateStart"
                  type="date"
                  value={formData.dateStart}
                  onChange={handleChange}
                  className={errors.dateStart ? 'border-destructive' : ''}
                />
                {errors.dateStart && <p className="text-sm text-destructive">{errors.dateStart}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEnd">End Date (Optional)</Label>
                <Input
                  id="dateEnd"
                  name="dateEnd"
                  type="date"
                  value={formData.dateEnd}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportingTime">Reporting Time *</Label>
                <Input
                  id="reportingTime"
                  name="reportingTime"
                  type="time"
                  value={formData.reportingTime}
                  onChange={handleChange}
                  className={errors.reportingTime ? 'border-destructive' : ''}
                />
                {errors.reportingTime && <p className="text-sm text-destructive">{errors.reportingTime}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventHours">Event Hours *</Label>
                <Input
                  id="eventHours"
                  name="eventHours"
                  value={formData.eventHours}
                  onChange={handleChange}
                  placeholder="e.g., 8 hours"
                  className={errors.eventHours ? 'border-destructive' : ''}
                />
                {errors.eventHours && <p className="text-sm text-destructive">{errors.eventHours}</p>}
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., City Center Park, Main Street"
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapLink">Google Maps Link (Optional)</Label>
              <Input
                id="mapLink"
                name="mapLink"
                value={formData.mapLink}
                onChange={handleChange}
                placeholder="https://maps.google.com/?q=..."
                className={errors.mapLink ? 'border-destructive' : ''}
              />
              {errors.mapLink && <p className="text-sm text-destructive">{errors.mapLink}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Role & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Role & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role / Responsibility *</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Route Marshal / Water Station Attendant"
                className={errors.role ? 'border-destructive' : ''}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment">Payment *</Label>
                <Input
                  id="payment"
                  name="payment"
                  value={formData.payment}
                  onChange={handleChange}
                  placeholder="e.g., ₹500 + Lunch + Certificate"
                  className={errors.payment ? 'border-destructive' : ''}
                />
                {errors.payment && <p className="text-sm text-destructive">{errors.payment}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="genderReq">Gender Requirement *</Label>
                <Select
                  value={formData.genderReq}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, genderReq: v }))}
                >
                  <SelectTrigger className={errors.genderReq ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genderReq && <p className="text-sm text-destructive">{errors.genderReq}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slotsNeeded">Volunteers Needed *</Label>
                <Input
                  id="slotsNeeded"
                  name="slotsNeeded"
                  type="number"
                  min="1"
                  value={formData.slotsNeeded}
                  onChange={handleChange}
                  className={errors.slotsNeeded ? 'border-destructive' : ''}
                />
                {errors.slotsNeeded && <p className="text-sm text-destructive">{errors.slotsNeeded}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="e.g., 9876543210"
                  className={errors.contact ? 'border-destructive' : ''}
                />
                {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perks">Perks (Optional)</Label>
              <Textarea
                id="perks"
                name="perks"
                value={formData.perks}
                onChange={handleChange}
                placeholder="e.g., Free lunch, event t-shirt, volunteer certificate, transport reimbursement"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Event Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Draft:</strong> Only visible to admins. <strong>Active:</strong> Published and accepting applications.
              <strong>Filled:</strong> Automatically set when slots are full. <strong>Closed:</strong> Manually closed, no longer accepting applications.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once deleted, this event and all its applications cannot be recovered.
            </p>
            <Button variant="destructive" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, 'publish')} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Event'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}