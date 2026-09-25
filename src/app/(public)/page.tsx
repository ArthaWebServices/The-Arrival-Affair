import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getEvents } from '@/actions/events';
import EventBrowser from './EventBrowser';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const events = await getEvents();

  const totalEvents = events.length;
  const totalApplications = events.reduce((acc, e) => acc + (e._count?.interests || 0), 0);
  const totalSlots = events.reduce((acc, e) => acc + e.slotsNeeded, 0);
  const activeEvents = events.filter((e) => e.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <span>The Arrival Affairs</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="#events" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Events
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Admin Portal
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Ultimate Gen-Z Youth Community · @the.arrival.affairs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            We Don't Just Host Events,{' '}
            <span className="text-primary">We Build Culture</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The Arrival Affairs connects premium brands with the dynamic student demographic (Gen-Z).
            Browse volunteer openings across our mega events and apply in seconds — no account required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#events">
              <Button size="lg" className="w-full sm:w-auto px-8 shadow-md">
                Browse Opportunities <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="py-10 border-y bg-muted/30">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2">
            <div className="text-3xl lg:text-4xl font-extrabold text-primary">{totalEvents}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Total Events</div>
          </div>
          <div className="p-2">
            <div className="text-3xl lg:text-4xl font-extrabold text-primary">{activeEvents}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Open Now</div>
          </div>
          <div className="p-2">
            <div className="text-3xl lg:text-4xl font-extrabold text-primary">{totalSlots}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Total Slots</div>
          </div>
          <div className="p-2">
            <div className="text-3xl lg:text-4xl font-extrabold text-primary">{totalApplications}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Applications Received</div>
          </div>
        </div>
      </section>

      {/* Events Browser Section */}
      <section id="events" className="py-16">
        <div className="container mx-auto px-4">
          <EventBrowser initialEvents={events} />
        </div>
      </section>

      {/* Admin Callout */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold mb-4">The Arrival Affairs — Admin Portal</h2>
          <p className="text-lg opacity-90 mb-8">
            Manage event listings, review volunteer leads, and coordinate all mega events from one streamlined dashboard.
          </p>
          <Link href="/admin/login">
            <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
              Organizer & Admin Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card text-card-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">The Arrival Affairs</span>
            <span>— Event Management</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-foreground">About & FAQ</Link>
            <a href="https://www.instagram.com/the.arrival.affairs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              @the.arrival.affairs
            </a>
            <Link href="/admin/login" className="hover:text-foreground">Admin Sign In</Link>
          </div>
          <p>© {new Date().getFullYear()} The Arrival Affairs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}