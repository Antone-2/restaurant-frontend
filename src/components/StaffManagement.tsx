import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialogStandalone } from '@/components/ConfirmDialog';
import { Plus, MoreVertical, Trash2, Edit2, Users, Clock, DollarSign } from 'lucide-react';

interface Staff {
    _id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    startDate: string;
    status: 'active' | 'inactive';
    shift: string;
    hourlyRate: number;
    yearsExperience: number;
}

export default function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        shift: 'morning',
        hourlyRate: 200,
        yearsExperience: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getStaff();
            setStaff(data?.staff || data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!formData.name || !formData.role || !formData.email || !formData.phone) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            await adminApi.createStaff(formData);

            toast({
                title: 'Success',
                description: 'Staff member added successfully',
            });

            setFormData({
                name: '',
                role: '',
                email: '',
                phone: '',
                shift: 'morning',
                hourlyRate: 200,
                yearsExperience: 0,
            });
            setOpenDialog(false);
            fetchStaff();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add staff member',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteStaff = async () => {
        if (!deletingStaffId) return;

        try {
            await adminApi.deleteStaff(deletingStaffId);

            toast({
                title: 'Success',
                description: 'Staff member deleted',
            });
            setDeleteDialogOpen(false);
            setDeletingStaffId(null);
            fetchStaff();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete staff member',
                variant: 'destructive',
            });
        }
    };

    const confirmDeleteStaff = (staffId: string) => {
        setDeletingStaffId(staffId);
        setDeleteDialogOpen(true);
    };

    const handleEditClick = (member: Staff) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            role: member.role,
            email: member.email,
            phone: member.phone,
            shift: member.shift || 'full-time',
            hourlyRate: member.hourlyRate || 200,
            yearsExperience: member.yearsExperience || 0,
        });
        setOpenDialog(true);
    };

    const handleUpdateStaff = async () => {
        if (!editingStaff) return;

        if (!formData.name || !formData.role || !formData.email || !formData.phone) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        try {
            await adminApi.updateStaff(editingStaff._id, formData);

            toast({
                title: 'Success',
                description: 'Staff member updated successfully',
            });

            setFormData({
                name: '',
                role: '',
                email: '',
                phone: '',
                shift: 'morning',
                hourlyRate: 200,
                yearsExperience: 0,
            });
            setEditingStaff(null);
            setOpenDialog(false);
            fetchStaff();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update staff member',
                variant: 'destructive',
            });
        }
    };

    const roleColors: Record<string, string> = {
        'Head Chef': 'bg-red-100 text-red-800',
        'Sous Chef': 'bg-orange-100 text-orange-800',
        'Kitchen Staff': 'bg-yellow-100 text-yellow-800',
        'Restaurant Manager': 'bg-blue-100 text-blue-800',
        'Accommodation Manager': 'bg-indigo-100 text-indigo-800',
        'Partnerships Manager': 'bg-teal-100 text-teal-800',
        'Waiter': 'bg-green-100 text-green-800',
        'Bartender': 'bg-purple-100 text-purple-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Staff Management
                </h2>
                <Dialog open={openDialog} onOpenChange={(open) => {
                    setOpenDialog(open);
                    if (!open) {
                        setEditingStaff(null);
                        setFormData({
                            name: '',
                            role: '',
                            email: '',
                            phone: '',
                            shift: 'morning',
                            hourlyRate: 200,
                            yearsExperience: 0,
                        });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-gray-800 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                            <DialogDescription>
                                {editingStaff ? 'Update the details for this staff member' : 'Fill in the details for the new staff member'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Name *</label>
                                <Input
                                    placeholder="Staff name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Role *</label>
                                <Input
                                    placeholder="e.g., Head Chef, Waiter"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email *</label>
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Phone *</label>
                                <Input
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Shift</label>
                                <Select
                                    value={formData.shift}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, shift: value })
                                    }
                                >
                                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                        <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                                        <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                                        <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Hourly Rate (KES)</label>
                                <Input
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            hourlyRate: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Years of Experience</label>
                                <Input
                                    type="number"
                                    value={formData.yearsExperience}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            yearsExperience: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <Button
                                onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                                className="w-full"
                            >
                                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : staff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No staff members registered. Add one to get started.
                </div>
            ) : (
                <div className="grid gap-4">
                    {staff.map((member) => (
                        <div
                            key={member._id}
                            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {member.name}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[member.role] ||
                                                'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {member.role}
                                        </span>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${member.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {member.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {member.email} • {member.phone}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {member.shift}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <DollarSign className="w-4 h-4" />
                                            KES {member.hourlyRate}/hr
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {member.yearsExperience} years experience
                                        </span>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <DropdownMenuItem
                                            onClick={() => handleEditClick(member)}
                                            className="dark:text-white"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => confirmDeleteStaff(member._id)}
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialogStandalone
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Staff Member"
                description="Are you sure you want to delete this staff member? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDeleteStaff}
            />
        </div>
    );
}
