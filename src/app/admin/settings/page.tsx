'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, UserPlus, Users, Key, Shield, Bell, CheckCircle, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updateAdminPassword, getAdmins, createAdmin, deleteAdmin } from '@/actions/admin';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUserEmail = (session?.user as any)?.email ?? '';
  const currentUserId = (session?.user as any)?.id ?? '';

  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  // Account settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Platform settings
  const [maskContact, setMaskContact] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoFillEvents, setAutoFillEvents] = useState(true);

  // Admin users
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    getAdmins().then(setAdminUsers).catch(() => {});
  }, []);

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setIsLoading(true);
    setSuccess('');
    try {
      await updateAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your password has been changed.' });
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    setAddingAdmin(true);
    try {
      const newAdmin = await createAdmin({ email: adminEmail, password: adminPassword });
      setAdminUsers(prev => [{ ...newAdmin, createdAt: new Date() }, ...prev]);
      setAdminEmail('');
      setAdminPassword('');
      setShowAddAdmin(false);
      toast({ title: 'Admin added', description: `${newAdmin.email} has been added.` });
    } catch (error: any) {
      toast({ title: 'Failed to add admin', description: error.message, variant: 'destructive' });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin "${email}"? This cannot be undone.`)) return;
    try {
      await deleteAdmin(id);
      setAdminUsers(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Admin removed', description: `${email} has been removed.` });
    } catch (error: any) {
      toast({ title: 'Failed to remove admin', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">
            <Key className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Shield className="mr-2 h-4 w-4" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Users className="mr-2 h-4 w-4" />
            Admin Users
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">
                    {success}
                  </div>
                )}
                {(errors.submit) && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 font-mono">{currentUserEmail || 'Loading...'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                  <dd className="mt-1">Admin</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mask Contact Numbers</h4>
                  <p className="text-sm text-muted-foreground">Hide phone numbers on public event pages until clicked</p>
                </div>
                <Switch
                  checked={maskContact}
                  onCheckedChange={setMaskContact}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email notifications for new applications</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Fill Events</h4>
                  <p className="text-sm text-muted-foreground">Automatically mark events as Filled when slots are full</p>
                </div>
                <Switch
                  checked={autoFillEvents}
                  onCheckedChange={setAutoFillEvents}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New volunteer applications', description: 'Get notified when someone applies to your events' },
                { label: 'Event status changes', description: 'Notifications when events are filled or closed' },
                { label: 'Weekly summary', description: 'Receive a weekly digest of all activity' },
                { label: 'System updates', description: 'Important platform announcements and updates' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={i < 2}
                    onCheckedChange={() => {}}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Users
                </CardTitle>
                <CardDescription>Manage administrator accounts</CardDescription>
              </div>
              <Button onClick={() => setShowAddAdmin(!showAddAdmin)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </CardHeader>
            <CardContent>
              {showAddAdmin && (
                <form onSubmit={handleAddAdmin} className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4">
                  <h4 className="font-medium">Add New Admin</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addingAdmin}>
                      {addingAdmin ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Admin'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)}>Cancel</Button>
                  </div>
                </form>
              )}
              <div className="space-y-4">
                {adminUsers.map((admin) => {
                  const isCurrent = admin.id === currentUserId;
                  return (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{admin.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDate(admin.createdAt)}
                            {isCurrent && ' • You'}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteAdmin(admin.id, admin.email)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Manage Events</TableHead>
                    <TableHead>View Leads</TableHead>
                    <TableHead>Export Data</TableHead>
                    <TableHead>Manage Admins</TableHead>
                    <TableHead>Platform Settings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { role: 'Super Admin', events: true, leads: true, export: true, admins: true, settings: true },
                    { role: 'Organizer', events: true, leads: true, export: true, admins: false, settings: false },
                    { role: 'Manager', events: true, leads: true, export: false, admins: false, settings: false },
                  ].map((role, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{role.role}</TableCell>
                      <TableCell>{role.events ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                      <TableCell>{role.leads ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                      <TableCell>{role.export ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                      <TableCell>{role.admins ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                      <TableCell>{role.settings ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}