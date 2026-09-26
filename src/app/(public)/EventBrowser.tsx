'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, DollarSign, Users, Clock, Search, RotateCcw, SlidersHorizontal, ChevronDown, Mountain } from 'lucide-react';
import { formatDate, getEventBadges } from '@/lib/utils';

interface EventCardProps {
  event: any;
}

function EventCard({ event }: EventCardProps) {
  const badges = getEventBadges(event);
  const interestCount = event._count?.interests || 0;
  const slotsLeft = event.slotsNeeded - interestCount;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
      {/* Banner Image */}
      {event.imageUrl && (
        <div className="rounded-t-xl overflow-hidden aspect-video w-full">
          <img
            src={event.imageUrl}
            alt={`${event.title} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="flex-1 flex flex-col p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          <div className="flex gap-1 flex-wrap justify-end">
            {badges.map((badge) => (
              <Badge
                key={badge}
                variant={
                  badge === 'High Pay'
                    ? 'default'
                    : badge === 'Urgent'
                    ? 'destructive'
                    : badge === 'Today'
                    ? 'secondary'
                    : 'outline'
                }
                className="text-xs"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{event.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(event.dateStart)}</span>
            {event.dateEnd && <span> - {formatDate(event.dateEnd)}</span>}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{event.payment}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{event.genderReq} • {event.role}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Reporting: {event.reportingTime} ({event.eventHours})</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {slotsLeft > 0 ? (
                <>
                  <span className="font-semibold text-green-600">{slotsLeft}</span> slots left
                </>
              ) : (
                <span className="font-semibold text-red-600">Filled</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button className="w-full" variant={slotsLeft > 0 ? 'default' : 'outline'} disabled={slotsLeft <= 0}>
            {slotsLeft > 0 ? 'View Details & Apply' : 'Slots Filled'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function EventBrowser({ initialEvents }: { initialEvents: any[] }) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('all');
  const [gender, setGender] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Extract unique roles from events for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    initialEvents.forEach(e => {
      if (e.role) roles.add(e.role);
    });
    return Array.from(roles);
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter(event => {
      // Search query (title, description, location, role)
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(query);
        const matchesDesc = event.description?.toLowerCase().includes(query);
        const matchesLoc = event.location?.toLowerCase().includes(query);
        const matchesRole = event.role?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesRole) return false;
      }

      // City filter
      if (city) {
        const queryCity = city.toLowerCase();
        if (!event.location?.toLowerCase().includes(queryCity)) return false;
      }

      // Role filter
      if (role !== 'all') {
        if (event.role?.toLowerCase() !== role.toLowerCase()) return false;
      }

      // Gender filter
      if (gender !== 'all') {
        if (gender === 'Male' && event.genderReq === 'Female') return false;
        if (gender === 'Female' && event.genderReq === 'Male') return false;
      }

      // Date range filter
      if (dateFrom) {
        const from = new Date(dateFrom);
        const eventDate = new Date(event.dateStart);
        if (eventDate < from) return false;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const eventDate = new Date(event.dateStart);
        if (eventDate > to) return false;
      }

      return true;
    });
  }, [initialEvents, search, city, role, gender, dateFrom, dateTo]);

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setRole('all');
    setGender('all');
    setDateFrom('');
    setDateTo('');
  };

  const isFiltered = search || city || role !== 'all' || gender !== 'all' || dateFrom || dateTo;

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full flex items-center justify-between"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {isFiltered && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Active</Badge>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filters Sidebar */}
      <aside className={`lg:w-64 xl:w-72 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="sticky top-24 space-y-4 bg-card border rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg">Filters</h3>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Title, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">City / Location</label>
              <Input
                placeholder="e.g., Mumbai, Delhi..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {availableRoles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Gender Requirement</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">From</span>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">To</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {isFiltered && (
              <Button variant="outline" className="w-full text-sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Events Grid */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Available Events</h2>
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card border rounded-xl p-6 sm:p-8">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No matching events</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-4 text-sm">
              {isFiltered
                ? 'Try adjusting or clearing your filters to see more opportunities.'
                : 'No events are currently listed. Please check back soon!'}
            </p>
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
