import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4);
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const text = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleaned}${text ? `?text=${text}` : ''}`;
}

export function getEventStatusBadge(status: string): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', variant: 'default' };
    case 'DRAFT':
      return { label: 'Draft', variant: 'secondary' };
    case 'CLOSED':
      return { label: 'Closed', variant: 'destructive' };
    case 'FILLED':
      return { label: 'Filled', variant: 'outline' };
    default:
      return { label: status, variant: 'default' };
  }
}

export function getInterestStatusBadge(status: string): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' | 'success' } {
  switch (status) {
    case 'NEW':
      return { label: 'New', variant: 'default' };
    case 'CONTACTED':
      return { label: 'Contacted', variant: 'secondary' };
    case 'SELECTED':
      return { label: 'Selected', variant: 'default' };
    case 'REJECTED':
      return { label: 'Rejected', variant: 'destructive' };
    default:
      return { label: status, variant: 'default' };
  }
}

export function getEventBadges(event: {
  dateStart: Date | string;
  status: string;
  payment: string;
  slotsNeeded: number;
  interests?: { length: number };
}): string[] {
  const badges: string[] = [];
  const now = new Date();
  const start = new Date(event.dateStart);

  if (event.status === 'FILLED') {
    badges.push('Filled');
  }

  if (start.toDateString() === now.toDateString()) {
    badges.push('Today');
  }

  if (start < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) && event.status === 'ACTIVE') {
    badges.push('Urgent');
  }

  const paymentNum = parseFloat(event.payment.replace(/[^0-9.]/g, ''));
  if (paymentNum > 1000) {
    badges.push('High Pay');
  }

  if (event.interests && event.interests.length >= event.slotsNeeded) {
    badges.push('Filled');
  }

  return badges;
}