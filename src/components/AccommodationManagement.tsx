import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialogStandalone } from '@/components/ConfirmDialog';
import {
    Bed, Calendar, Users, Wrench, Plus, Edit, Trash2,
    DollarSign, Star, Clock, CheckCircle, XCircle,
    AlertCircle, User, Phone
} from 'lucide-react';

interface Accommodation {
    _id: string;
    name: string;
    type: string;
    address: { city: string; area: string };
    starRating?: number;
    priceRange?: { min: number; max: number };
    status: string;
    distanceFromVenue?: number;
}

interface RoomType {
    _id: string;
    accommodationId: string;
    name: string;
    description?: string;
    basePrice: number;
    capacity: number;
    maxAdults: number;
    maxChildren: number;
    bedType: string;
    roomSize?: number;
    amenities: string[];
    photos: string[];
    seasonalPricing: Array<{
        seasonName: string;
        startDate: Date;
        endDate: Date;
        price: number;
        minStay: number;
    }>;
    minimumStay: number;
    maximumStay: number;
    totalRooms: number;
    isActive: boolean;
}

interface Room {
    _id: string;
    accommodationId: string;
    roomTypeId: string;
    roomNumber: string;
    floor: number;
    status: string;
    lastCleaned?: Date;
    notes?: string;
}

interface RoomBooking {
    _id: string;
    accommodationId: string;
    roomTypeId: string;
    roomId?: string;
    guestId?: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfAdults: number;
    numberOfChildren: number;
    roomPrice: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    bookingStatus: string;
    specialRequests?: string;
    dietaryRequirements?: string;
    confirmationNumber: string;
    blockedDates?: Array<{
        startDate: Date;
        endDate: Date;
        reason: string;
    }>;
}

interface HousekeepingTask {
    _id: string;
    accommodationId: string;
    roomId: string;
    roomNumber: string;
    taskType: string;
    status: string;
    priority: string;
    assignedTo?: { staffId: string; staffName: string };
    scheduledDate: Date;
    scheduledTime?: string;
    completedAt?: Date;
    inspectedAt?: Date;
    inspectionNotes?: string;
    notes?: string;
}

interface GuestHistory {
    _id: string;
    guestId?: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    accommodations: Array<{
        accommodationId: string;
        accommodationName: string;
        bookingId: string;
        checkInDate: Date;
        checkOutDate: Date;
        roomType: string;
        roomNumber: string;
        totalSpent: number;
        rating?: number;
        notes?: string;
    }>;
    preferences: {
        preferredRoomType?: string;
        floorPreference?: string;
        dietaryNeeds: string[];
        specialRequests: string[];
    };
    allergies: string[];
    vipStatus: boolean;
    vipNotes?: string;
    specialNotes?: string;
    blacklisted: boolean;
    totalStays: number;
    totalNights: number;
    totalSpent: number;
    lastStayDate?: Date;
}

interface AccommodationStaff {
    _id: string;
    accommodationId: string;
    name: string;
    role: string;
    email?: string;
    phone: string;
    isActive: boolean;
}

const COMMON_AMENITIES = [
    'WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Balcony',
    'Ocean View', 'Mountain View', 'Room Service', 'Breakfast Included',
    'Parking', 'Gym', 'Pool', 'Spa', 'Restaurant', 'Bar'
];

const BED_TYPES = ['single', 'double', 'twin', 'king', 'queen', 'suite'];
const TASK_TYPES = ['checkout', 'stayover', 'deep-cleaning', 'turnover', 'inspection'];
const ROOM_STATUS = ['available', 'occupied', 'maintenance', 'blocked', 'cleaning'];
const BOOKING_STATUS = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'];
const _HOUSEKEEPING_STATUS = ['pending', 'in-progress', 'completed', 'inspected', 'skipped'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function AccommodationManagement() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    // Get saved accommodation from localStorage
    const getSavedAccommodation = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedAccommodation') || '';
        }
        return '';
    };

    const [selectedAccommodation, setSelectedAccommodation] = useState<string>(getSavedAccommodation());
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<RoomBooking[]>([]);
    const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
    const [guests, setGuests] = useState<GuestHistory[]>([]);
    const [staff, setStaff] = useState<AccommodationStaff[]>([]);

    // Get saved tab from localStorage or default to 'rooms'
    const getSavedTab = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('accommodationActiveTab');
            if (saved && ['rooms', 'bookings', 'housekeeping', 'guests'].includes(saved)) {
                return saved;
            }
        }
        return 'rooms';
    };

    const [activeTab, setActiveTab] = useState(getSavedTab());
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter] = useState('all');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Dialog states
    const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [housekeepingDialogOpen, setHousekeepingDialogOpen] = useState(false);
    const [guestDialogOpen, setGuestDialogOpen] = useState(false);
    const [blockDatesDialogOpen, setBlockDatesDialogOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string>('');

    // Delete confirmation dialogs
    const [deleteRoomTypeOpen, setDeleteRoomTypeOpen] = useState(false);
    const [deletingRoomTypeId, setDeletingRoomTypeId] = useState<string | null>(null);
    const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [deleteBookingOpen, setDeleteBookingOpen] = useState(false);
    const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
    const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    // Form states
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);
    const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
    const [editingGuest, setEditingGuest] = useState<GuestHistory | null>(null);

    // Form data
    const [roomTypeForm, setRoomTypeForm] = useState({
        name: '', description: '', basePrice: '', capacity: '2', maxAdults: '2', maxChildren: '1',
        bedType: 'double', roomSize: '', amenities: [] as string[], photos: [] as string[],
        seasonalPricing: [] as Array<{ seasonName: string; startDate: string; endDate: string; price: string; minStay: string }>,
        minimumStay: '1', maximumStay: '30', totalRooms: '1'
    });

    const [roomForm, setRoomForm] = useState({
        roomNumber: '', floor: '1', status: 'available', notes: ''
    });

    const [bookingForm, setBookingForm] = useState({
        guestName: '', guestEmail: '', guestPhone: '', checkInDate: '', checkOutDate: '',
        numberOfAdults: '1', numberOfChildren: '0', roomPrice: '', totalAmount: '',
        paymentStatus: 'pending', bookingStatus: 'pending', specialRequests: '', dietaryRequirements: ''
    });

    const [taskForm, setTaskForm] = useState({
        roomId: '', roomNumber: '', taskType: 'checkout', priority: 'medium',
        scheduledDate: '', scheduledTime: '', assignedTo: '', notes: ''
    });

    const [guestForm, setGuestForm] = useState({
        guestName: '', guestEmail: '', guestPhone: '', vipStatus: false,
        preferences: { preferredRoomType: '', floorPreference: '', dietaryNeeds: [] as string[], specialRequests: [] as string[] },
        allergies: [] as string[], specialNotes: ''
    });

    const [blockDatesForm, setBlockDatesForm] = useState({
        startDate: '', endDate: '', reason: 'maintenance'
    });

    useEffect(() => {
        loadAccommodations();
    }, []);

    useEffect(() => {
        if (selectedAccommodation) {
            loadRoomTypes();
            loadRooms();
            loadBookings();
            loadHousekeepingTasks();
            loadGuests();
            loadStaff();
        }
    }, [selectedAccommodation]);

    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && activeTab) {
            localStorage.setItem('accommodationActiveTab', activeTab);
        }
    }, [activeTab]);

    // Save selectedAccommodation to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedAccommodation) {
            localStorage.setItem('selectedAccommodation', selectedAccommodation);
        }
    }, [selectedAccommodation]);

    const loadAccommodations = async () => {
        try {
            const response = await adminApi.getAccommodations();
            const data = response?.accommodations || response?.data || [];
            setAccommodations(Array.isArray(data) ? data : []);
            if (data.length > 0 && !selectedAccommodation) {
                // Find The Quill Restaurant & Accommodation or use first one
                const quillAcc = data.find((acc: any) =>
                    acc.name && acc.name.toLowerCase().includes('quill')
                );
                setSelectedAccommodation(quillAcc?._id || data[0]._id);
            } else if (data.length > 0 && selectedAccommodation) {
                // Check if saved accommodation still exists, otherwise use first one
                const exists = data.find((acc: any) => acc._id === selectedAccommodation);
                if (!exists) {
                    const quillAcc = data.find((acc: any) =>
                        acc.name && acc.name.toLowerCase().includes('quill')
                    );
                    setSelectedAccommodation(quillAcc?._id || data[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to load accommodations:', err);
            // Demo data with The Quill - matching backend demo data IDs
            setAccommodations([
                { _id: 'acc1', name: 'The Quill Restaurant & Accommodation', type: 'hotel', address: { city: 'Busia', area: 'Nambale' }, starRating: 4, priceRange: { min: 8000, max: 25000 }, status: 'active', distanceFromVenue: 0 }
            ]);
            if (!selectedAccommodation) setSelectedAccommodation('acc1');
        }
    };

    const loadRoomTypes = async () => {
        try {
            const response = await adminApi.getRoomTypes(selectedAccommodation);
            const data = response?.roomTypes || [];

            // If no data from API, use demo data for The Quill
            if (data.length === 0) {
                setRoomTypes([
                    { _id: 'rt1', accommodationId: selectedAccommodation, name: 'Standard Room', description: 'Comfortable room with essential amenities', basePrice: 8000, capacity: 2, maxAdults: 2, maxChildren: 1, bedType: 'double', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Breakfast Included'], photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 5, isActive: true },
                    { _id: 'rt2', accommodationId: selectedAccommodation, name: 'Deluxe Room', description: 'Spacious room with premium amenities', basePrice: 12000, capacity: 3, maxAdults: 2, maxChildren: 1, bedType: 'king', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service'], photos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 3, isActive: true },
                    { _id: 'rt3', accommodationId: selectedAccommodation, name: 'Executive Suite', description: 'Luxurious suite with separate living area', basePrice: 18000, capacity: 4, maxAdults: 2, maxChildren: 2, bedType: 'king', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service', 'Spa Access'], photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 2, isActive: true }
                ]);
            } else {
                setRoomTypes(data);
            }
        } catch (err) {
            console.error('Failed to load room types:', err);
            // Use demo data on error
            setRoomTypes([
                { _id: 'rt1', accommodationId: selectedAccommodation, name: 'Standard Room', description: 'Comfortable room with essential amenities', basePrice: 8000, capacity: 2, maxAdults: 2, maxChildren: 1, bedType: 'double', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Breakfast Included'], photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 5, isActive: true },
                { _id: 'rt2', accommodationId: selectedAccommodation, name: 'Deluxe Room', description: 'Spacious room with premium amenities', basePrice: 12000, capacity: 3, maxAdults: 2, maxChildren: 1, bedType: 'king', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service'], photos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 3, isActive: true },
                { _id: 'rt3', accommodationId: selectedAccommodation, name: 'Executive Suite', description: 'Luxurious suite with separate living area', basePrice: 18000, capacity: 4, maxAdults: 2, maxChildren: 2, bedType: 'king', amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service', 'Spa Access'], photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'], seasonalPricing: [], minimumStay: 1, maximumStay: 30, totalRooms: 2, isActive: true }
            ]);
        }
    };

    const loadRooms = async () => {
        try {
            const response = await adminApi.getRooms(selectedAccommodation, statusFilter);
            setRooms(response?.rooms || []);
        } catch (err) {
            console.error('Failed to load rooms:', err);
            setRooms([]);
        }
    };

    const loadBookings = async () => {
        try {
            const response = await adminApi.getRoomBookings(selectedAccommodation, statusFilter);
            setBookings(response?.bookings || []);
        } catch (err) {
            console.error('Failed to load bookings:', err);
            setBookings([]);
        }
    };

    const loadHousekeepingTasks = async () => {
        try {
            const response = await adminApi.getHousekeepingTasks(selectedAccommodation, statusFilter);
            setHousekeepingTasks(response?.tasks || []);
        } catch (err) {
            console.error('Failed to load housekeeping tasks:', err);
            setHousekeepingTasks([]);
        }
    };

    const loadGuests = async () => {
        try {
            const response = await adminApi.getGuestHistory(searchQuery);
            setGuests(response?.guests || []);
        } catch (err) {
            console.error('Failed to load guests:', err);
            setGuests([]);
        }
    };

    const loadStaff = async () => {
        try {
            const response = await adminApi.getAccommodationStaff(selectedAccommodation);
            setStaff(response?.staff || []);
        } catch (err) {
            console.error('Failed to load staff:', err);
            setStaff([]);
        }
    };

    // Room Type CRUD
    const handleSaveRoomType = async () => {
        try {
            // Validate required fields
            if (!selectedAccommodation) {
                setError('Please select an accommodation first');
                return;
            }

            if (!roomTypeForm.name || !roomTypeForm.name.trim()) {
                setError('Room type name is required');
                return;
            }

            if (!roomTypeForm.basePrice || parseInt(roomTypeForm.basePrice) <= 0) {
                setError('Please enter a valid base price');
                return;
            }

            const data = {
                accommodationId: selectedAccommodation,
                name: roomTypeForm.name.trim(),
                description: roomTypeForm.description,
                basePrice: parseInt(roomTypeForm.basePrice),
                capacity: parseInt(roomTypeForm.capacity),
                maxAdults: parseInt(roomTypeForm.maxAdults),
                maxChildren: parseInt(roomTypeForm.maxChildren),
                bedType: roomTypeForm.bedType,
                roomSize: roomTypeForm.roomSize ? parseInt(roomTypeForm.roomSize) : undefined,
                amenities: roomTypeForm.amenities,
                photos: roomTypeForm.photos,
                seasonalPricing: roomTypeForm.seasonalPricing.map(sp => ({
                    seasonName: sp.seasonName,
                    startDate: new Date(sp.startDate),
                    endDate: new Date(sp.endDate),
                    price: parseInt(sp.price),
                    minStay: parseInt(sp.minStay)
                })),
                minimumStay: parseInt(roomTypeForm.minimumStay),
                maximumStay: parseInt(roomTypeForm.maximumStay),
                totalRooms: parseInt(roomTypeForm.totalRooms)
            };

            if (editingRoomType) {
                await adminApi.updateRoomType(editingRoomType._id, data);
                setSuccessMsg('Room type updated successfully');
            } else {
                await adminApi.createRoomType(data);
                setSuccessMsg('Room type created successfully');
            }
            setRoomTypeDialogOpen(false);
            resetRoomTypeForm();
            loadRoomTypes();
        } catch (err: any) {
            setError(err.message || 'Failed to save room type');
        }
    };

    const handleDeleteRoomType = async (id: string) => {
        setDeletingRoomTypeId(id);
        setDeleteRoomTypeOpen(true);
    };

    const confirmDeleteRoomType = async () => {
        if (!deletingRoomTypeId) return;
        try {
            await adminApi.deleteRoomType(deletingRoomTypeId);
            setSuccessMsg('Room type deleted');
            setDeleteRoomTypeOpen(false);
            setDeletingRoomTypeId(null);
            loadRoomTypes();
        } catch (err: any) {
            setError(err.message || 'Failed to delete room type');
        }
    };

    // Room CRUD
    const handleSaveRoom = async () => {
        try {
            // Validate required fields
            if (!selectedAccommodation) {
                setError('Please select an accommodation first');
                return;
            }

            const roomTypeId = editingRoom?.roomTypeId || roomTypes[0]?._id;
            if (!roomTypeId) {
                setError('Please create a room type first before adding rooms');
                return;
            }

            if (!roomForm.roomNumber || !roomForm.roomNumber.trim()) {
                setError('Room number is required');
                return;
            }

            const data = {
                accommodationId: selectedAccommodation,
                roomTypeId: roomTypeId,
                roomNumber: roomForm.roomNumber,
                floor: parseInt(roomForm.floor),
                status: roomForm.status,
                notes: roomForm.notes
            };

            if (editingRoom) {
                await adminApi.updateRoom(editingRoom._id, data);
                setSuccessMsg('Room updated successfully');
            } else {
                await adminApi.createRoom(data);
                setSuccessMsg('Room created successfully');
            }
            setRoomDialogOpen(false);
            resetRoomForm();
            loadRooms();
        } catch (err: any) {
            setError(err.message || 'Failed to save room');
        }
    };

    const handleDeleteRoom = async (id: string) => {
        setDeletingRoomId(id);
        setDeleteRoomOpen(true);
    };

    const confirmDeleteRoom = async () => {
        if (!deletingRoomId) return;
        try {
            await adminApi.deleteRoom(deletingRoomId);
            setSuccessMsg('Room deleted');
            setDeleteRoomOpen(false);
            setDeletingRoomId(null);
            loadRooms();
        } catch (err: any) {
            setError(err.message || 'Failed to delete room');
        }
    };

    // Booking CRUD
    const handleSaveBooking = async () => {
        try {
            // Validate required fields
            if (!selectedAccommodation) {
                setError('Please select an accommodation first');
                return;
            }

            if (!roomTypes[0]?._id) {
                setError('Please create a room type first before making bookings');
                return;
            }

            if (!bookingForm.guestName || !bookingForm.guestName.trim()) {
                setError('Guest name is required');
                return;
            }

            if (!bookingForm.guestEmail || !bookingForm.guestEmail.trim()) {
                setError('Guest email is required');
                return;
            }

            if (!bookingForm.guestPhone || !bookingForm.guestPhone.trim()) {
                setError('Guest phone is required');
                return;
            }

            if (!bookingForm.checkInDate) {
                setError('Check-in date is required');
                return;
            }

            if (!bookingForm.checkOutDate) {
                setError('Check-out date is required');
                return;
            }

            if (!bookingForm.roomPrice || parseInt(bookingForm.roomPrice) <= 0) {
                setError('Room price is required and must be positive');
                return;
            }

            const checkIn = new Date(bookingForm.checkInDate);
            const checkOut = new Date(bookingForm.checkOutDate);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

            if (nights <= 0) {
                setError('Check-out date must be after check-in date');
                return;
            }

            const data = {
                accommodationId: selectedAccommodation,
                roomTypeId: roomTypes[0]?._id,
                guestName: bookingForm.guestName.trim(),
                guestEmail: bookingForm.guestEmail.trim(),
                guestPhone: bookingForm.guestPhone.trim(),
                checkInDate: checkIn,
                checkOutDate: checkOut,
                numberOfAdults: parseInt(bookingForm.numberOfAdults) || 1,
                numberOfChildren: parseInt(bookingForm.numberOfChildren) || 0,
                roomPrice: parseInt(bookingForm.roomPrice),
                totalAmount: parseInt(bookingForm.totalAmount) || (parseInt(bookingForm.roomPrice) * nights),
                paymentStatus: bookingForm.paymentStatus,
                bookingStatus: bookingForm.bookingStatus,
                specialRequests: bookingForm.specialRequests,
                dietaryRequirements: bookingForm.dietaryRequirements
            };

            if (editingBooking) {
                await adminApi.updateRoomBooking(editingBooking._id, data);
                setSuccessMsg('Booking updated successfully');
            } else {
                await adminApi.createRoomBooking(data);
                setSuccessMsg('Booking created successfully');
            }
            setBookingDialogOpen(false);
            resetBookingForm();
            loadBookings();
        } catch (err: any) {
            setError(err.message || 'Failed to save booking');
        }
    };

    const handleDeleteBooking = async (id: string) => {
        setDeletingBookingId(id);
        setDeleteBookingOpen(true);
    };

    const confirmDeleteBooking = async () => {
        if (!deletingBookingId) return;
        try {
            await adminApi.deleteRoomBooking(deletingBookingId);
            setSuccessMsg('Booking deleted');
            setDeleteBookingOpen(false);
            setDeletingBookingId(null);
            loadBookings();
        } catch (err: any) {
            setError(err.message || 'Failed to delete booking');
        }
    };

    const handleBlockDates = async () => {
        try {
            await adminApi.blockRoomDates(selectedBookingId, {
                startDate: blockDatesForm.startDate,
                endDate: blockDatesForm.endDate,
                reason: blockDatesForm.reason
            });
            setSuccessMsg('Dates blocked for maintenance');
            setBlockDatesDialogOpen(false);
            loadBookings();
        } catch (err: any) {
            setError(err.message || 'Failed to block dates');
        }
    };

    // Housekeeping CRUD
    const handleSaveTask = async () => {
        try {
            const assignedStaff = staff.find(s => s._id === taskForm.assignedTo);
            const data = {
                accommodationId: selectedAccommodation,
                roomId: taskForm.roomId,
                roomNumber: taskForm.roomNumber,
                taskType: taskForm.taskType,
                priority: taskForm.priority,
                scheduledDate: new Date(taskForm.scheduledDate),
                scheduledTime: taskForm.scheduledTime || undefined,
                assignedTo: assignedStaff ? { staffId: assignedStaff._id, staffName: assignedStaff.name } : undefined,
                notes: taskForm.notes
            };

            if (editingTask) {
                await adminApi.updateHousekeepingTask(editingTask._id, data);
                setSuccessMsg('Task updated successfully');
            } else {
                await adminApi.createHousekeepingTask(data);
                setSuccessMsg('Task created successfully');
            }
            setHousekeepingDialogOpen(false);
            resetTaskForm();
            loadHousekeepingTasks();
        } catch (err: any) {
            setError(err.message || 'Failed to save task');
        }
    };

    const handleDeleteTask = async (id: string) => {
        setDeletingTaskId(id);
        setDeleteTaskOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!deletingTaskId) return;
        try {
            await adminApi.deleteHousekeepingTask(deletingTaskId);
            setSuccessMsg('Task deleted');
            setDeleteTaskOpen(false);
            setDeletingTaskId(null);
            loadHousekeepingTasks();
        } catch (err: any) {
            setError(err.message || 'Failed to delete task');
        }
    };

    // Guest CRUD
    const handleSaveGuest = async () => {
        try {
            const data = {
                guestName: guestForm.guestName,
                guestEmail: guestForm.guestEmail,
                guestPhone: guestForm.guestPhone,
                vipStatus: guestForm.vipStatus,
                preferences: guestForm.preferences,
                allergies: guestForm.allergies,
                specialNotes: guestForm.specialNotes
            };

            if (editingGuest) {
                await adminApi.updateGuestHistory(editingGuest._id, data);
                setSuccessMsg('Guest updated successfully');
            } else {
                await adminApi.createGuestHistory(data);
                setSuccessMsg('Guest created successfully');
            }
            setGuestDialogOpen(false);
            resetGuestForm();
            loadGuests();
        } catch (err: any) {
            setError(err.message || 'Failed to save guest');
        }
    };

    // Reset forms
    const resetRoomTypeForm = () => {
        setEditingRoomType(null);
        setRoomTypeForm({
            name: '', description: '', basePrice: '', capacity: '2', maxAdults: '2', maxChildren: '1',
            bedType: 'double', roomSize: '', amenities: [], photos: [],
            seasonalPricing: [], minimumStay: '1', maximumStay: '30', totalRooms: '1'
        });
    };

    const resetRoomForm = () => {
        setEditingRoom(null);
        setRoomForm({ roomNumber: '', floor: '1', status: 'available', notes: '' });
    };

    const resetBookingForm = () => {
        setEditingBooking(null);
        setBookingForm({
            guestName: '', guestEmail: '', guestPhone: '', checkInDate: '', checkOutDate: '',
            numberOfAdults: '1', numberOfChildren: '0', roomPrice: '', totalAmount: '',
            paymentStatus: 'pending', bookingStatus: 'pending', specialRequests: '', dietaryRequirements: ''
        });
    };

    const resetTaskForm = () => {
        setEditingTask(null);
        setTaskForm({
            roomId: '', roomNumber: '', taskType: 'checkout', priority: 'medium',
            scheduledDate: '', scheduledTime: '', assignedTo: '', notes: ''
        });
    };

    const resetGuestForm = () => {
        setEditingGuest(null);
        setGuestForm({
            guestName: '', guestEmail: '', guestPhone: '', vipStatus: false,
            preferences: { preferredRoomType: '', floorPreference: '', dietaryNeeds: [], specialRequests: [] },
            allergies: [], specialNotes: ''
        });
    };

    const openEditRoomType = (roomType: RoomType) => {
        setEditingRoomType(roomType);
        setRoomTypeForm({
            name: roomType.name,
            description: roomType.description || '',
            basePrice: roomType.basePrice.toString(),
            capacity: roomType.capacity.toString(),
            maxAdults: roomType.maxAdults.toString(),
            maxChildren: roomType.maxChildren.toString(),
            bedType: roomType.bedType,
            roomSize: roomType.roomSize?.toString() || '',
            amenities: roomType.amenities || [],
            photos: roomType.photos || [],
            seasonalPricing: roomType.seasonalPricing?.map(sp => ({
                seasonName: sp.seasonName,
                startDate: new Date(sp.startDate).toISOString().split('T')[0],
                endDate: new Date(sp.endDate).toISOString().split('T')[0],
                price: sp.price.toString(),
                minStay: sp.minStay.toString()
            })) || [],
            minimumStay: roomType.minimumStay.toString(),
            maximumStay: roomType.maximumStay.toString(),
            totalRooms: roomType.totalRooms.toString()
        });
        setRoomTypeDialogOpen(true);
    };

    const openEditRoom = (room: Room) => {
        setEditingRoom(room);
        setRoomForm({
            roomNumber: room.roomNumber,
            floor: room.floor.toString(),
            status: room.status,
            notes: room.notes || ''
        });
        setRoomDialogOpen(true);
    };

    const openEditBooking = (booking: RoomBooking) => {
        setEditingBooking(booking);
        setBookingForm({
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone,
            checkInDate: new Date(booking.checkInDate).toISOString().split('T')[0],
            checkOutDate: new Date(booking.checkOutDate).toISOString().split('T')[0],
            numberOfAdults: booking.numberOfAdults.toString(),
            numberOfChildren: booking.numberOfChildren.toString(),
            roomPrice: booking.roomPrice.toString(),
            totalAmount: booking.totalAmount.toString(),
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            specialRequests: booking.specialRequests || '',
            dietaryRequirements: booking.dietaryRequirements || ''
        });
        setBookingDialogOpen(true);
    };

    const openEditTask = (task: HousekeepingTask) => {
        setEditingTask(task);
        setTaskForm({
            roomId: task.roomId,
            roomNumber: task.roomNumber,
            taskType: task.taskType,
            priority: task.priority,
            scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
            scheduledTime: task.scheduledTime || '',
            assignedTo: task.assignedTo?.staffId || '',
            notes: task.notes || ''
        });
        setHousekeepingDialogOpen(true);
    };

    const openEditGuest = (guest: GuestHistory) => {
        setEditingGuest(guest);
        setGuestForm({
            guestName: guest.guestName,
            guestEmail: guest.guestEmail || '',
            guestPhone: guest.guestPhone || '',
            vipStatus: guest.vipStatus,
            preferences: {
                preferredRoomType: guest.preferences?.preferredRoomType || '',
                floorPreference: guest.preferences?.floorPreference || '',
                dietaryNeeds: guest.preferences?.dietaryNeeds || [],
                specialRequests: guest.preferences?.specialRequests || []
            },
            allergies: guest.allergies || [],
            specialNotes: guest.specialNotes || ''
        });
        setGuestDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            available: 'bg-green-100 text-green-800',
            occupied: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-red-100 text-red-800',
            blocked: 'bg-gray-100 text-gray-800',
            cleaning: 'bg-yellow-100 text-yellow-800',
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            'checked-in': 'bg-purple-100 text-purple-800',
            'checked-out': 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            inspected: 'bg-emerald-100 text-emerald-800',
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    // Clear messages
    useEffect(() => {
        if (error || successMsg) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessMsg('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successMsg]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Accommodation Management</h2>
                    <p className="text-gray-500">Manage rooms, bookings, housekeeping, and guest history</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={selectedAccommodation} onValueChange={setSelectedAccommodation}>
                        <SelectTrigger className="w-80">
                            <SelectValue placeholder="Select accommodation" />
                        </SelectTrigger>
                        <SelectContent className="w-80">
                            {accommodations.length > 0 ? (
                                accommodations.map(acc => (
                                    <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                                ))
                            ) : (
                                <>
                                    <SelectItem value="acc1">The Quill Restaurant & Accommodation</SelectItem>
                                    <SelectItem value="acc2">Grand Plaza Hotel</SelectItem>
                                    <SelectItem value="acc3">Seaside Resort</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
                    {successMsg}
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="rooms" className="flex items-center gap-2">
                        <Bed className="w-4 h-4" /> Rooms
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Bookings
                    </TabsTrigger>
                    <TabsTrigger value="housekeeping" className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> Housekeeping
                    </TabsTrigger>
                    <TabsTrigger value="guests" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Guests
                    </TabsTrigger>
                </TabsList>

                {/* Rooms Tab */}
                <TabsContent value="rooms" className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={() => { resetRoomTypeForm(); setRoomTypeDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> Add Room Type
                        </Button>
                        <Button onClick={() => { resetRoomForm(); setRoomDialogOpen(true); }} variant="outline">
                            <Plus className="w-4 h-4 mr-1" /> Add Room
                        </Button>
                    </div>

                    {/* Room Types */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roomTypes.map(rt => (
                            <Card key={rt._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{rt.name}</CardTitle>
                                            <CardDescription>{rt.description || 'No description'}</CardDescription>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => openEditRoomType(rt)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteRoomType(rt._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold">{formatCurrency(rt.basePrice)}/night</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span>Up to {rt.capacity} guests</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Bed className="w-4 h-4 text-purple-600" />
                                            <span className="capitalize">{rt.bedType} bed</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {rt.amenities?.slice(0, 4).map((am, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{am}</Badge>
                                            ))}
                                            {rt.amenities?.length > 4 && (
                                                <Badge variant="outline" className="text-xs">+{rt.amenities.length - 4}</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                            <span className="text-xs text-gray-500">{rt.totalRooms} rooms available</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {roomTypes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Bed className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No room types yet</p>
                            <p className="text-sm">Add room types to get started</p>
                        </div>
                    )}

                    {/* Individual Rooms */}
                    <h3 className="text-lg font-semibold mt-6">Individual Rooms</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Room</th>
                                    <th className="text-left p-2">Floor</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Last Cleaned</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">Room {room.roomNumber}</td>
                                        <td className="p-2">Floor {room.floor}</td>
                                        <td className="p-2">
                                            <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                                        </td>
                                        <td className="p-2">{room.lastCleaned ? new Date(room.lastCleaned).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-2">
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => openEditRoom(room)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteRoom(room._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={() => { resetBookingForm(); setBookingDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> New Booking
                        </Button>
                        <Input
                            placeholder="Search bookings..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Guest</th>
                                    <th className="text-left p-2">Check-in</th>
                                    <th className="text-left p-2">Check-out</th>
                                    <th className="text-left p-2">Amount</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <div>
                                                <p className="font-medium">{booking.guestName}</p>
                                                <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                                            </div>
                                        </td>
                                        <td className="p-2">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                        <td className="p-2">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                        <td className="p-2 font-medium">{formatCurrency(booking.totalAmount)}</td>
                                        <td className="p-2">
                                            <Badge className={getStatusColor(booking.bookingStatus)}>{booking.bookingStatus}</Badge>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => openEditBooking(booking)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setSelectedBookingId(booking._id); setBlockDatesDialogOpen(true); }}>
                                                    <Calendar className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteBooking(booking._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {bookings.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No bookings yet</p>
                        </div>
                    )}
                </TabsContent>

                {/* Housekeeping Tab */}
                <TabsContent value="housekeeping" className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={() => { resetTaskForm(); setHousekeepingDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> Assign Task
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {housekeepingTasks.map(task => (
                            <Card key={task._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Room {task.roomNumber}</CardTitle>
                                            <CardDescription className="capitalize">{task.taskType.replace('-', ' ')}</CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className={`w-4 h-4 ${task.priority === 'urgent' ? 'text-red-500' : task.priority === 'high' ? 'text-orange-500' : 'text-gray-500'}`} />
                                            <span className="capitalize">{task.priority} priority</span>
                                        </div>
                                        {task.assignedTo && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                                <span>{task.assignedTo.staffName}</span>
                                            </div>
                                        )}
                                        {task.completedAt && (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-1 mt-2 pt-2 border-t">
                                            <Button size="sm" variant="outline" onClick={() => openEditTask(task)}>Edit</Button>
                                            <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteTask(task._id)}>Delete</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {housekeepingTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No housekeeping tasks</p>
                            <p className="text-sm">Assign tasks to cleaning staff</p>
                        </div>
                    )}
                </TabsContent>

                {/* Guests Tab */}
                <TabsContent value="guests" className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={() => { resetGuestForm(); setGuestDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-1" /> Add Guest
                        </Button>
                        <Input
                            placeholder="Search guests..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); loadGuests(); }}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {guests.map(guest => (
                            <Card key={guest._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {guest.guestName}
                                                {guest.vipStatus && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                            </CardTitle>
                                            <CardDescription>{guest.guestEmail}</CardDescription>
                                        </div>
                                        {guest.blacklisted && (
                                            <Badge variant="destructive">Blacklisted</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span>{guest.guestPhone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            <span>{guest.totalStays} stays ({guest.totalNights} nights)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-medium">{formatCurrency(guest.totalSpent)} total</span>
                                        </div>
                                        {guest.preferences?.dietaryNeeds?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {guest.preferences.dietaryNeeds.map((d, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-1 mt-2 pt-2 border-t">
                                            <Button size="sm" variant="outline" onClick={() => openEditGuest(guest)}>Edit</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {guests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No guest history</p>
                            <p className="text-sm">Guests will appear here after their first stay</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Room Type Dialog */}
            <Dialog open={roomTypeDialogOpen} onOpenChange={setRoomTypeDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRoomType ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={roomTypeForm.name} onChange={e => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })} placeholder="e.g., Deluxe King Suite" />
                            </div>
                            <div className="space-y-2">
                                <Label>Base Price (KES) *</Label>
                                <Input type="number" value={roomTypeForm.basePrice} onChange={e => setRoomTypeForm({ ...roomTypeForm, basePrice: e.target.value })} placeholder="15000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={roomTypeForm.description} onChange={e => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })} placeholder="Room description..." />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input type="number" value={roomTypeForm.capacity} onChange={e => setRoomTypeForm({ ...roomTypeForm, capacity: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Adults</Label>
                                <Input type="number" value={roomTypeForm.maxAdults} onChange={e => setRoomTypeForm({ ...roomTypeForm, maxAdults: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Children</Label>
                                <Input type="number" value={roomTypeForm.maxChildren} onChange={e => setRoomTypeForm({ ...roomTypeForm, maxChildren: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bed Type</Label>
                                <Select value={roomTypeForm.bedType} onValueChange={v => setRoomTypeForm({ ...roomTypeForm, bedType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BED_TYPES.map(bt => <SelectItem key={bt} value={bt} className="capitalize">{bt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Room Size (sq m)</Label>
                                <Input type="number" value={roomTypeForm.roomSize} onChange={e => setRoomTypeForm({ ...roomTypeForm, roomSize: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Min Stay (nights)</Label>
                                <Input type="number" value={roomTypeForm.minimumStay} onChange={e => setRoomTypeForm({ ...roomTypeForm, minimumStay: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Stay (nights)</Label>
                                <Input type="number" value={roomTypeForm.maximumStay} onChange={e => setRoomTypeForm({ ...roomTypeForm, maximumStay: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Rooms</Label>
                                <Input type="number" value={roomTypeForm.totalRooms} onChange={e => setRoomTypeForm({ ...roomTypeForm, totalRooms: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Amenities</Label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_AMENITIES.map(am => (
                                    <div key={am} className="flex items-center gap-1">
                                        <Checkbox
                                            checked={roomTypeForm.amenities.includes(am)}
                                            onCheckedChange={checked => {
                                                if (checked) {
                                                    setRoomTypeForm({ ...roomTypeForm, amenities: [...roomTypeForm.amenities, am] });
                                                } else {
                                                    setRoomTypeForm({ ...roomTypeForm, amenities: roomTypeForm.amenities.filter(a => a !== am) });
                                                }
                                            }}
                                        />
                                        <Label className="text-sm font-normal">{am}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Photo URLs (one per line)</Label>
                            <Textarea
                                value={roomTypeForm.photos.join('\n')}
                                onChange={e => setRoomTypeForm({ ...roomTypeForm, photos: e.target.value.split('\n').filter(p => p.trim()) })}
                                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Seasonal Pricing</Label>
                            {roomTypeForm.seasonalPricing.map((sp, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <Input placeholder="Season name" value={sp.seasonName} onChange={e => {
                                        const newSp = [...roomTypeForm.seasonalPricing];
                                        newSp[i].seasonName = e.target.value;
                                        setRoomTypeForm({ ...roomTypeForm, seasonalPricing: newSp });
                                    }} className="flex-1" />
                                    <Input type="date" value={sp.startDate} onChange={e => {
                                        const newSp = [...roomTypeForm.seasonalPricing];
                                        newSp[i].startDate = e.target.value;
                                        setRoomTypeForm({ ...roomTypeForm, seasonalPricing: newSp });
                                    }} className="w-32" />
                                    <Input type="date" value={sp.endDate} onChange={e => {
                                        const newSp = [...roomTypeForm.seasonalPricing];
                                        newSp[i].endDate = e.target.value;
                                        setRoomTypeForm({ ...roomTypeForm, seasonalPricing: newSp });
                                    }} className="w-32" />
                                    <Input type="number" placeholder="Price" value={sp.price} onChange={e => {
                                        const newSp = [...roomTypeForm.seasonalPricing];
                                        newSp[i].price = e.target.value;
                                        setRoomTypeForm({ ...roomTypeForm, seasonalPricing: newSp });
                                    }} className="w-24" />
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setRoomTypeForm({ ...roomTypeForm, seasonalPricing: roomTypeForm.seasonalPricing.filter((_, idx) => idx !== i) });
                                    }}><XCircle className="w-4 h-4" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                                setRoomTypeForm({
                                    ...roomTypeForm,
                                    seasonalPricing: [...roomTypeForm.seasonalPricing, { seasonName: '', startDate: '', endDate: '', price: '', minStay: '1' }]
                                });
                            }}>Add Season</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoomTypeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRoomType}>{editingRoomType ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Room Dialog */}
            <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number *</Label>
                                <Input value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} placeholder="101" />
                            </div>
                            <div className="space-y-2">
                                <Label>Floor</Label>
                                <Input type="number" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={roomForm.status} onValueChange={v => setRoomForm({ ...roomForm, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ROOM_STATUS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={roomForm.notes} onChange={e => setRoomForm({ ...roomForm, notes: e.target.value })} placeholder="Any notes about this room..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRoom}>{editingRoom ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Booking Dialog */}
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBooking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Guest Name *</Label>
                                <Input value={bookingForm.guestName} onChange={e => setBookingForm({ ...bookingForm, guestName: e.target.value })} placeholder="Enter guest full name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={bookingForm.guestEmail} onChange={e => setBookingForm({ ...bookingForm, guestEmail: e.target.value })} placeholder="guest@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input value={bookingForm.guestPhone} onChange={e => setBookingForm({ ...bookingForm, guestPhone: e.target.value })} placeholder="+254 700 000 000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Booking Status</Label>
                                <Select value={bookingForm.bookingStatus} onValueChange={v => setBookingForm({ ...bookingForm, bookingStatus: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BOOKING_STATUS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Check-in Date *</Label>
                                <Input type="date" value={bookingForm.checkInDate} onChange={e => setBookingForm({ ...bookingForm, checkInDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Check-out Date *</Label>
                                <Input type="date" value={bookingForm.checkOutDate} onChange={e => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Number of Adults</Label>
                                <Input type="number" value={bookingForm.numberOfAdults} onChange={e => setBookingForm({ ...bookingForm, numberOfAdults: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Number of Children</Label>
                                <Input type="number" value={bookingForm.numberOfChildren} onChange={e => setBookingForm({ ...bookingForm, numberOfChildren: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Price (KES) *</Label>
                                <Input type="number" value={bookingForm.roomPrice} onChange={e => setBookingForm({ ...bookingForm, roomPrice: e.target.value })} placeholder="15000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <Select value={bookingForm.paymentStatus} onValueChange={v => setBookingForm({ ...bookingForm, paymentStatus: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Special Requests</Label>
                            <Textarea value={bookingForm.specialRequests} onChange={e => setBookingForm({ ...bookingForm, specialRequests: e.target.value })} placeholder="Any special requests..." rows={3} />
                        </div>
                        <div className="space-y-2">
                            <Label>Dietary Requirements</Label>
                            <Input value={bookingForm.dietaryRequirements} onChange={e => setBookingForm({ ...bookingForm, dietaryRequirements: e.target.value })} placeholder="e.g., Vegetarian, Gluten-free" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBooking}>{editingBooking ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Housekeeping Dialog */}
            <Dialog open={housekeepingDialogOpen} onOpenChange={setHousekeepingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Assign Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number *</Label>
                                <Input value={taskForm.roomNumber} onChange={e => setTaskForm({ ...taskForm, roomNumber: e.target.value })} placeholder="101" />
                            </div>
                            <div className="space-y-2">
                                <Label>Task Type</Label>
                                <Select value={taskForm.taskType} onValueChange={v => setTaskForm({ ...taskForm, taskType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TASK_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('-', ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={taskForm.priority} onValueChange={v => setTaskForm({ ...taskForm, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Scheduled Date *</Label>
                                <Input type="date" value={taskForm.scheduledDate} onChange={e => setTaskForm({ ...taskForm, scheduledDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={taskForm.assignedTo} onValueChange={v => setTaskForm({ ...taskForm, assignedTo: v })}>
                                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                                <SelectContent>
                                    {staff.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={taskForm.notes} onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })} placeholder="Any special instructions..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setHousekeepingDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTask}>{editingTask ? 'Update' : 'Assign'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Guest Dialog */}
            <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Guest Name *</Label>
                                <Input value={guestForm.guestName} onChange={e => setGuestForm({ ...guestForm, guestName: e.target.value })} placeholder="Enter guest full name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={guestForm.guestEmail} onChange={e => setGuestForm({ ...guestForm, guestEmail: e.target.value })} placeholder="guest@email.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={guestForm.guestPhone} onChange={e => setGuestForm({ ...guestForm, guestPhone: e.target.value })} placeholder="+254 700 000 000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Preferred Room Type</Label>
                                <Input value={guestForm.preferences.preferredRoomType} onChange={e => setGuestForm({
                                    ...guestForm, preferences: { ...guestForm.preferences, preferredRoomType: e.target.value }
                                })} placeholder="e.g., King Suite" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <Checkbox
                                checked={guestForm.vipStatus}
                                onCheckedChange={c => setGuestForm({ ...guestForm, vipStatus: !!c })}
                            />
                            <Label className="font-medium">VIP Guest</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Dietary Needs</Label>
                            <Input value={guestForm.preferences.dietaryNeeds.join(', ')} onChange={e => setGuestForm({
                                ...guestForm, preferences: { ...guestForm.preferences, dietaryNeeds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                            })} placeholder="Vegetarian, Gluten-free (comma separated)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Special Requests</Label>
                            <Input value={guestForm.preferences.specialRequests.join(', ')} onChange={e => setGuestForm({
                                ...guestForm, preferences: { ...guestForm.preferences, specialRequests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                            })} placeholder="Extra pillows, Early check-in (comma separated)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Allergies</Label>
                            <Input value={guestForm.allergies.join(', ')} onChange={e => setGuestForm({
                                ...guestForm, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })} placeholder="Peanuts, Shellfish (comma separated)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Special Notes</Label>
                            <Textarea value={guestForm.specialNotes} onChange={e => setGuestForm({ ...guestForm, specialNotes: e.target.value })} placeholder="Any other notes about this guest..." rows={4} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGuestDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveGuest}>{editingGuest ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Block Dates Dialog */}
            <Dialog open={blockDatesDialogOpen} onOpenChange={setBlockDatesDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block Dates for Maintenance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={blockDatesForm.startDate} onChange={e => setBlockDatesForm({ ...blockDatesForm, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={blockDatesForm.endDate} onChange={e => setBlockDatesForm({ ...blockDatesForm, endDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select value={blockDatesForm.reason} onValueChange={v => setBlockDatesForm({ ...blockDatesForm, reason: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="renovation">Renovation</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBlockDatesDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBlockDates}>Block Dates</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialogs */}
            <ConfirmDialogStandalone
                open={deleteRoomTypeOpen}
                onOpenChange={setDeleteRoomTypeOpen}
                title="Delete Room Type"
                description="Are you sure you want to delete this room type? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteRoomType}
            />

            <ConfirmDialogStandalone
                open={deleteRoomOpen}
                onOpenChange={setDeleteRoomOpen}
                title="Delete Room"
                description="Are you sure you want to delete this room? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteRoom}
            />

            <ConfirmDialogStandalone
                open={deleteBookingOpen}
                onOpenChange={setDeleteBookingOpen}
                title="Delete Booking"
                description="Are you sure you want to delete this booking? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteBooking}
            />

            <ConfirmDialogStandalone
                open={deleteTaskOpen}
                onOpenChange={setDeleteTaskOpen}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDeleteTask}
            />
        </div>
    );
}
