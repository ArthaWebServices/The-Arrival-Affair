import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dateStart: z.string().min(1, 'Start date is required'),
  dateEnd: z.string().optional(),
  reportingTime: z.string().min(1, 'Reporting time is required'),
  eventHours: z.string().min(1, 'Event hours is required'),
  location: z.string().min(3, 'Location is required'),
  mapLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  role: z.string().min(3, 'Role is required'),
  payment: z.string().min(1, 'Payment is required'),
  perks: z.string().optional(),
  genderReq: z.string().min(1, 'Gender requirement is required'),
  slotsNeeded: z.coerce.number().min(1, 'At least 1 slot needed'),
  contact: z.string().min(10, 'Contact number is required'),
  imageUrl: z.string().optional(),
  eventType: z.string().optional(),
  tagline: z.string().optional(),
  destination: z.string().optional(),
  upiId: z.string().optional(),
  paymentQrCode: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'CLOSED', 'FILLED']),
});

export const interestSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gender: z.string().optional(),
  foodPreference: z.string().optional(),
  transactionId: z.string().optional(),
  paymentScreenshot: z.string().optional(),
});

export const adminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const settingsSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
  maskContact: z.boolean().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type EventInput = z.infer<typeof eventSchema>;
export type InterestInput = z.infer<typeof interestSchema>;
export type AdminInput = z.infer<typeof adminSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;