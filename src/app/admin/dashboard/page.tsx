import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Fix #13: DollarSign replaced with CheckCircle2 (capacity/completion, not money)
import { Plus, Calendar, Users, TrendingUp, ArrowRight, CheckCircle2, Download, FileText } from 'lucide-react';
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
      // Fix #13: CheckCircle2 clearly signals capacity-filled, not revenue
      title: 'Filled Events',
      value: stats.filledEvents,
      icon: CheckCircle2,
      href: '/admin/events',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">The Arrival Affairs — Event Management</p>
        </div>
        {/* Fix #11: Create Event lives only here; removed from Quick Actions below */}
        <Link href="/admin/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Brand Banner
           Fix #4/#6: reduced py-6→py-4 and text-lg→text-base to shrink visual weight
           Fix #7: added mt-2 for breathing room below the page header
           Fix #8: gap-8→gap-4 and removed justify-between so stats sit close to copy */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-4 mt-2 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-0">
          <p className="text-primary text-xs tracking-widest font-bold mb-0.5">The Arrival Affairs</p>
          <p className="text-foreground font-bold text-base leading-snug">Sponsorship Proposal 2025–2026</p>
          <p className="text-muted-foreground text-xs mt-0.5">Connecting premium brands with the ultimate Gen-Z youth community</p>
        </div>
        <div className="flex gap-6 flex-wrap">
          {[
            { v: '4', l: 'Mega Events/Year' },
            { v: '1,280+', l: 'Youth Participants' },
            { v: '₹9.9L+', l: 'Event Economy' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-primary font-bold text-xl leading-none">{s.v}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid — Fix #5/#12: shares same <main> padding; no extra mx- needed */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Fix #14: mt-0.5 (was mt-1) tightens label↔value spacing */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-0.5">{stat.value}</p>
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

      {/* Recent Events & Leads — Fix #5/#12: same outer edge as stat cards above */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            {/* Fix #1: h2→h3 so heading chain is H1(Dashboard)→H3(section)→H4(item)
                avoiding the H2→H4 skip that was reported */}
            <h3 className="text-lg font-semibold leading-none tracking-tight">Recent Events</h3>
            <Link href="/admin/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No events yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => {
                  const badge = getEventStatusBadge(event.status);
                  return (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}/edit`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Fix #15: gap-4→gap-2 pulls badge closer to the name */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* h4 is now properly under h3, fixing the H2→H4 skip */}
                          <h4 className="font-medium truncate text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(event.dateStart)} • {event._count.interests}/{event.slotsNeeded} applicants
                          </p>
                        </div>
                        <Badge variant={badge.variant as any} className="flex-shrink-0 text-xs">
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
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            {/* Fix #2: same h3 correction */}
            <h3 className="text-lg font-semibold leading-none tracking-tight">Recent Applications</h3>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No applications yet.</p>
            ) : (
              <div className="space-y-3">
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
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Fix #15: gap-4→gap-2 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate text-sm">{lead.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {lead.event.title} • {formatDate(lead.submittedAt)}
                          </p>
                        </div>
                        <Badge variant={statusBadge.variant} className="flex-shrink-0 text-xs">
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions
           Fix #3:  replaced sidebar-duplicate links (Events/Leads/Settings) with
                    genuinely unique deep-link tasks that aren't in the sidebar.
           Fix #11: removed 'Create New Event' card (duplicate of header button).
           Fix #16: all cards now share the same outlined hover style — no solid-blue outlier.
           Fix #17: all icons are Lucide, same size (h-8 w-8) and same text-primary colour. */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/admin/leads?status=NEW"
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center group"
            >
              <FileText className="h-8 w-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-sm">Review New Applications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Action uncontacted leads</p>
            </Link>
            <Link
              href="/admin/events?status=FILLED"
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center group"
            >
              <CheckCircle2 className="h-8 w-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-sm">View Filled Events</p>
              <p className="text-xs text-muted-foreground mt-0.5">See capacity-reached events</p>
            </Link>
            <Link
              href="/admin/leads?export=csv"
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-center group"
            >
              <Download className="h-8 w-8 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-sm">Export Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Download leads as CSV</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}