import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { Users, Ban, CheckCircle2, KeyRound, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [resetTarget, setResetTarget] = useState(null); // { id, username }
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDisableUser = async (id) => {
    if (!window.confirm('Are you sure you want to disable this user?')) return;
    setIsProcessing(id);
    try {
      await api.patch(`/admin/users/${id}/disable`);
      toast.success('User disabled successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to disable user');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleEnableUser = async (id) => {
    setIsProcessing(id);
    try {
      await api.patch(`/admin/users/${id}/enable`);
      toast.success('User enabled successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enable user');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsResetting(true);
    try {
      await api.patch(`/admin/users/${resetTarget.id}/password`, { newPassword });
      toast.success(`Password updated for ${resetTarget.username}`);
      setResetTarget(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-6">
      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Reset Password</h2>
              <button onClick={() => { setResetTarget(null); setNewPassword(''); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Set a new password for <strong>{resetTarget.username}</strong>.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={6}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" type="button" onClick={() => { setResetTarget(null); setNewPassword(''); }}>Cancel</Button>
                <Button size="sm" type="submit" isLoading={isResetting}>Save Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            All Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-slate-500">#{u.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'MEDECIN' ? 'primary' : 'default'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.enabled ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <Ban className="w-4 h-4 mr-1" /> Disabled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setResetTarget({ id: u.id, username: u.username }); setNewPassword(''); }}
                      >
                        <KeyRound className="h-3.5 w-3.5 mr-1" /> Password
                      </Button>
                      {u.enabled ? (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isProcessing === u.id || u.role === 'ADMIN'}
                          onClick={() => handleDisableUser(u.id)}
                        >
                          {isProcessing === u.id ? 'Processing...' : 'Disable'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing === u.id}
                          onClick={() => handleEnableUser(u.id)}
                        >
                          {isProcessing === u.id ? 'Processing...' : 'Enable'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
