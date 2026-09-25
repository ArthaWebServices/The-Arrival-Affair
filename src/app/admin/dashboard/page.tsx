import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { formatDate, getEventStatusBadge } from '@/lib/utils';
import { getAdminEvents } from '@/actions/events';
import { getInterests } from '@/actions/interests';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [events, allLeads] = await Promise.all([
    getAdminEvents(),
    getInterests(),
  ]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    activeEvents: events.filter(e => e.status === 'ACTIVE').length,
    totalLeads: allLeads.length,
    recentApplications: allLeads.filter(l => new Date(l.submittedAt) >= sevenDaysAgo).length,
    filledEvents: events.filter(e => e.status === 'FILLED').length,
  };

  const recentEvents = events.slice(0, 5);
  const recentLeads = allLeads.slice(0, 5);

  const statCards = [
    {
      title: 'Active Events',
      value: stats.activeEvents,
      icon: Calendar,
      href: '/admin/events',
    },
    {
      title: 'Total Applications',
      value: stats.totalLeads,
      icon: Users,
      href: '/admin/leads',
    },
    {
      title: 'Recent Applications (7d)',
      value: stats.recentApplications,
      icon: TrendingUp,
      href: '/admin/leads',
    },
    {
      title: 'Filled Events',
      value: stats.filledEvents,
      icon: DollarSign,
      href: '/admin/events',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">The Arrival Affairs — Event Management</p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Brand Banner */}
      <div style={{ background: 'linear-gradient(135deg,#1a1200 0%,#09090b 100%)', borderRadius: '0.75rem', padding: '1.5rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #27272a' }}>
        <div>
          <p style={{ color: '#f59e0b', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>The Arrival Affairs</p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Sponsorship Proposal 2025–2026</p>
          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.25rem' }}>Connecting premium brands with the ultimate Gen-Z youth community</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { v: '4', l: 'Mega Events/Year' },
            { v: '1,280+', l: 'Youth Participants' },
            { v: '₹9.9L+', l: 'Event Economy' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{s.v}</p>
              <p style={{ color: '#71717a', fontSize: '0.7rem', marginTop: '0.2rem' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Events & Leads */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Link href="/admin/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No events yet.</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => {
                  const badge = getEventStatusBadge(event.status);
                  return (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}/edit`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(event.dateStart)} • {event._count.interests}/{event.slotsNeeded} applicants
                          </p>
                        </div>
                        <Badge variant={badge.variant as any} className="flex-shrink-0">
                          {badge.label}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => {
                  const statusBadge = {
                    NEW: { label: 'New', variant: 'default' as const },
                    CONTACTED: { label: 'Contacted', variant: 'secondary' as const },
                    SELECTED: { label: 'Selected', variant: 'default' as const },
                    REJECTED: { label: 'Rejected', variant: 'destructive' as const },
                  }[lead.status as string] ?? { label: lead.status, variant: 'default' as const };

                  return (
                    <Link
                      key={lead.id}
                      href="/admin/leads"
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{lead.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lead.event.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {formatDate(lead.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/events/new" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center">
              <Plus className="h-10 w-10 mx-auto text-primary mb-2" />
              <p className="font-medium">Create New Event</p>
              <p className="text-sm text-muted-foreground">Post a volunteer opportunity</p>
            </Link>
            <Link href="/admin/events" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center">
              <Calendar className="h-10 w-10 mx-auto text-blue-600 mb-2" />
              <p className="font-medium">Manage Events</p>
              <p className="text-sm text-muted-foreground">Edit, duplicate, or archive events</p>
            </Link>
            <Link href="/admin/leads" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center">
              <Users className="h-10 w-10 mx-auto text-green-600 mb-2" />
              <p className="font-medium">Review Applications</p>
              <p className="text-sm text-muted-foreground">Contact and manage leads</p>
            </Link>
            <Link href="/admin/settings" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center">
              <TrendingUp className="h-10 w-10 mx-auto text-purple-600 mb-2" />
              <p className="font-medium">Settings</p>
              <p className="text-sm text-muted-foreground">Configure platform settings</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}