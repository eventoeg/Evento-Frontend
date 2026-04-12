'use client';

import { useEffect, useState, useCallback } from 'react';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { User, UserRole, CreateUserDto, UpdateUserDto } from '@/types';
import { getInitials, formatDate, getRoleDisplayName } from '@/lib/utils';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
  Mail,
  Shield,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function UsersPage() {
  const { success, error } = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateUserDto>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.STUDENT,
  });

  const fetchUsers = useCallback(async (page: number, role: UserRole | 'all', search: string) => {
    try {
      setLoading(true);
      const res = await usersService.findAll(
        page,
        10,
        role === 'all' ? undefined : role,
        search,
      );

      if (res.success && res.data) {
        setUsers(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      }
    } catch {
      error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(currentPage, roleFilter, debouncedSearch);
  }, [currentPage, roleFilter, debouncedSearch, fetchUsers]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (selectedUser) {
        await usersService.update(selectedUser.id, formData as UpdateUserDto);
        success('User account updated');
      } else {
        await usersService.create(formData as CreateUserDto);
        success('User account created');
      }
      setIsModalOpen(false);
      fetchUsers(currentPage, roleFilter, debouncedSearch);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      await usersService.delete(userToDelete.id);
      success('User account deactivated');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(currentPage, roleFilter, debouncedSearch);
    } catch {
      error('Failed to deactivate user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 rounded-sm">
            Identity Management
          </div>
          <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-4">
            System <span className="font-black text-primary">Users</span>
          </h2>
          <p className="text-on-surface-variant text-base font-medium">
            Manage global accounts, roles, and access permissions across the ITI EMS infrastructure.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4" />
          Provision Account
        </button>
      </section>

      {/* Filters & Table */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-glass border border-outline/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input 
              className="w-full bg-surface border border-outline/50 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
              placeholder="SEARCH IDENTITIES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['all', ...Object.values(UserRole)].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  roleFilter === role 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-surface text-on-surface-variant hover:bg-outline/30'
                }`}
              >
                {role === 'all' ? 'All Roles' : getRoleDisplayName(role as UserRole)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-glass border border-outline/30 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Syncing Directory...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface/50 border-b border-outline/30">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Identity</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Authorization</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Association</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Creation Date</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {users.length > 0 ? users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-outline/50 text-primary flex items-center justify-center font-black text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight">{user.firstName} {user.lastName}</div>
                            <div className="text-[10px] text-on-surface-variant font-medium lowercase flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                         <RoleBadge role={user.role} />
                      </td>
                      <td className="p-6">
                        <div className="text-sm text-on-surface font-medium flex items-center gap-2">
                           {user.role === UserRole.STUDENT ? (
                             <GraduationCap className="w-4 h-4 text-on-surface-variant" />
                           ) : user.role === UserRole.COMPANY_REP ? (
                             <Briefcase className="w-4 h-4 text-on-surface-variant" />
                           ) : (
                             <Shield className="w-4 h-4 text-on-surface-variant" />
                           )}
                           {user.role === UserRole.STUDENT ? user.student?.track?.name || 'Unassigned Track' : 
                            user.role === UserRole.COMPANY_REP ? user.company?.companyName || 'Unassigned Entity' : 
                            'Global System'}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openModal(user)}
                            className="p-2 text-on-surface-variant hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(user)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="text-sm font-medium text-on-surface-variant">No identities match the current query.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-outline/30 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} of {totalItems} accounts
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-4 text-[10px] font-black uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-2 border border-outline/50 rounded-lg text-on-surface-variant hover:bg-surface disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-slide-in max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-outline/30 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black tracking-tighter text-on-surface">
                  {selectedUser ? 'Update' : 'Provision'} <span className="text-primary text-2xl">Account</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1">Global Registry Provisioning</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Given Name</label>
                  <input 
                    required
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Family Name</label>
                  <input 
                    required
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Email Address</label>
                <input 
                  required
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                />
              </div>

              {!selectedUser && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Access Password</label>
                  <input 
                    required
                    className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    type="password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">System Authorization Role</label>
                <select 
                  className="w-full bg-surface border border-outline/50 rounded-lg py-3.5 px-4 text-sm font-medium focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-outline text-on-surface-variant py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={formLoading}
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {selectedUser ? 'Commit Changes' : 'Execute Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen && !!userToDelete}
        title="Deactivate this account?"
        message={`This will deactivate ${userToDelete?.firstName || 'the selected'} ${userToDelete?.lastName || 'user'} account.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
          }
        }}
      />
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  let styles = "";
  switch (role) {
    case UserRole.ADMIN:
      styles = "bg-violet-50 text-violet-600 border-violet-100";
      break;
    case UserRole.STAFF:
      styles = "bg-blue-50 text-blue-600 border-blue-100";
      break;
    case UserRole.STUDENT:
      styles = "bg-emerald-50 text-emerald-600 border-emerald-100";
      break;
    case UserRole.COMPANY_REP:
      styles = "bg-amber-50 text-amber-600 border-amber-100";
      break;
    case UserRole.SECURITY:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5 w-fit ${styles}`}>
      <span className={`w-1 h-1 rounded-full ${styles.split(' ')[1].replace('text-', 'bg-')}`}></span>
      {getRoleDisplayName(role)}
    </span>
  );
}
