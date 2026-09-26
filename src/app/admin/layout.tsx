'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PushNotificationManager from '@/components/PushNotificationManager';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.replace('/');
    }
  }, [status, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PushNotificationManager />
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm block">The Arrival Affairs</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <Separator className="mb-4" />
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">The Arrival Affairs</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-0 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:border-none">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Optional actions or profile icon can go here */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}