import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, Edit, Trash2, Check } from 'lucide-react';
import { reservationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

interface Reservation {
    _id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    partySize?: number;
    tableName?: string;
    tableId?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    specialRequests?: string;
    createdAt: string;
}

export default function MyReservations() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch reservations for authenticated users
    useEffect(() => {
        const fetchReservations = async () => {
            if (!isAuthenticated || !user?.email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch reservations by email for the authenticated user
                const result = await reservationsApi.getByEmail(user.email);
                if (result.reservations) {
                    setReservations(result.reservations);
                } else {
                    setReservations([]);
                }
            } catch (err: any) {
                console.error('Error fetching reservations:', err);
                setError('Failed to load reservations');
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [isAuthenticated, user?.email]);

    // Lookup state
    const [lookupId, setLookupId] = useState('');
    const [lookupEmail, setLookupEmail] = useState('');
    const [lookupPhone, setLookupPhone] = useState('');
    const [lookupMode, setLookupMode] = useState<'id' | 'email'>('id');
    const [lookupLoading, setLookupLoading] = useState(false);

    // Modify state
    const [modifyDialog, setModifyDialog] = useState<{ open: boolean; reservation: Reservation | null }>({ open: false, reservation: null });
    const [modifyDate, setModifyDate] = useState('');
    const [modifyTime, setModifyTime] = useState('');
    const [modifyGuests, setModifyGuests] = useState(2);
    const [modifyRequests, setModifyRequests] = useState('');
    const [modifyLoading, setModifyLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<{ id: string; label: string; available: boolean }[]>([]);

    // Cancel state
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean; reservation: Reservation | null }>({ open: false, reservation: null });
    const [cancelEmail, setCancelEmail] = useState('');
    const [cancelPhone, setCancelPhone] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    // Success message
    const [successMessage, setSuccessMessage] = useState('');

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const handleLookup = async () => {
        if (lookupMode === 'id') {
            if (!lookupId.trim()) {
                setError('Please enter your reservation ID');
                return;
            }
            setLookupLoading(true);
            setError('');
            try {
                const result = await reservationsApi.getById(lookupId);
                if (result.reservation) {
                    setReservations([result.reservation]);
                } else {
                    setReservations([]);
                    setError('Reservation not found');
                }
            } catch (err: any) {
                setError(err.message || 'Reservation not found');
                setReservations([]);
            } finally {
                setLookupLoading(false);
            }
        } else {
            if (!lookupEmail.trim()) {
                setError('Please enter your email');
                return;
            }
            setLookupLoading(true);
            setError('');
            // Email lookup requires admin access, redirect to ID lookup
            setError('Please use your reservation ID to look up your booking. Check your email for the confirmation ID.');
            setLookupMode('id');
            setLookupLoading(false);
        }
    };

    const loadAvailableSlots = async (date: string) => {
        if (!date) return;
        try {
            const result = await reservationsApi.getAvailableTimeSlots(date);
            setAvailableSlots(result.timeSlots || []);
        } catch (err) {
            console.error('Error loading slots:', err);
        }
    };

    const handleModifyOpen = (reservation: Reservation) => {
        setModifyDialog({ open: true, reservation });
        setModifyDate(reservation.date);
        setModifyTime(reservation.time);
        setModifyGuests(reservation.guests || reservation.partySize || 2);
        setModifyRequests(reservation.specialRequests || '');
        loadAvailableSlots(reservation.date);
    };

    const handleModify = async () => {
        if (!modifyDialog.reservation) return;

        setModifyLoading(true);
        try {
            await reservationsApi.modifyReservation(modifyDialog.reservation._id, {
                email: modifyDialog.reservation.email,
                phone: modifyDialog.reservation.phone,
                date: modifyDate,
                time: modifyTime,
                guests: modifyGuests,
                specialRequests: modifyRequests
            });
            showSuccess('Reservation modified successfully!');
            setModifyDialog({ open: false, reservation: null });
            // Refresh
            handleLookup();
        } catch (err: any) {
            setError(err.message || 'Failed to modify reservation');
        } finally {
            setModifyLoading(false);
        }
    };

    const handleCancelOpen = (reservation: Reservation) => {
        setCancelDialog({ open: true, reservation });
        setCancelEmail(reservation.email);
        setCancelPhone(reservation.phone);
    };

    const handleCancel = async () => {
        if (!cancelDialog.reservation) return;

        setCancelLoading(true);
        try {
            await reservationsApi.cancelReservation(
                cancelDialog.reservation._id,
                cancelEmail,
                cancelPhone
            );
            showSuccess('Reservation cancelled successfully!');
            setCancelDialog({ open: false, reservation: null });
            // Refresh
            handleLookup();
        } catch (err: any) {
            setError(err.message || 'Failed to cancel reservation');
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            case 'completed': return 'bg-blue-500';
            case 'no-show': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
                <p className="text-gray-600 mb-8">View, modify or cancel your table reservations</p>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Lookup Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Find Your Reservation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => { setLookupMode('id'); setReservations([]); setError(''); }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${lookupMode === 'id'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                By Reservation ID
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLookupMode('email'); setReservations([]); setError(''); }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${lookupMode === 'email'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                By Email
                            </button>
                        </div>

                        <div className="flex gap-4">
                            {lookupMode === 'id' ? (
                                <Input
                                    placeholder="Enter reservation ID (e.g., RES-XXXXXXXX)"
                                    value={lookupId}
                                    onChange={(e) => setLookupId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                    className="flex-1"
                                />
                            ) : (
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={lookupEmail}
                                    onChange={(e) => setLookupEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                    className="flex-1"
                                />
                            )}
                            <Button
                                onClick={handleLookup}
                                disabled={lookupLoading}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                {lookupLoading ? 'Searching...' : 'Find'}
                            </Button>
                        </div>

                        <p className="text-sm text-gray-500 mt-3">
                            {lookupMode === 'id'
                                ? 'Your reservation ID was sent to your email after booking'
                                : 'Enter the email you used when making the reservation'
                            }
                        </p>
                    </CardContent>
                </Card>

                {/* Reservations List */}
                {reservations.length > 0 && (
                    <div className="space-y-6">
                        {reservations.map((reservation) => (
                            <Card key={reservation._id} className="overflow-hidden">
                                <div className={`h-2 ${getStatusColor(reservation.status)}`} />
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold">{reservation.name}</h3>
                                                <Badge className={getStatusColor(reservation.status)}>
                                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">ID: {reservation._id}</p>
                                        </div>
                                        {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleModifyOpen(reservation)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Modify
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelOpen(reservation)}
                                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Calendar className="w-5 h-5 text-amber-600" />
                                            <span>{formatDate(reservation.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                            <span>{reservation.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Users className="w-5 h-5 text-amber-600" />
                                            <span>{reservation.guests || reservation.partySize} guests</span>
                                        </div>
                                        {reservation.tableName && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <MapPin className="w-5 h-5 text-amber-600" />
                                                <span>{reservation.tableName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Mail className="w-5 h-5 text-amber-600" />
                                            <span>{reservation.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Phone className="w-5 h-5 text-amber-600" />
                                            <span>{reservation.phone}</span>
                                        </div>
                                    </div>

                                    {reservation.specialRequests && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                                            <p className="text-sm text-gray-600">{reservation.specialRequests}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modify Dialog */}
                <Dialog open={modifyDialog.open} onOpenChange={(open) => setModifyDialog({ open, reservation: null })}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modify Reservation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="modifyDate">Date</Label>
                                <Input
                                    id="modifyDate"
                                    type="date"
                                    value={modifyDate}
                                    onChange={(e) => { setModifyDate(e.target.value); loadAvailableSlots(e.target.value); }}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <Label htmlFor="modifyTime">Time</Label>
                                <select
                                    id="modifyTime"
                                    value={modifyTime}
                                    onChange={(e) => setModifyTime(e.target.value)}
                                    className="w-full h-10 px-3 border rounded-md"
                                >
                                    <option value="">Select time</option>
                                    {availableSlots.map((slot) => (
                                        <option key={slot.id} value={slot.id} disabled={!slot.available}>
                                            {slot.label} {!slot.available && '(Full)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="modifyGuests">Number of Guests</Label>
                                <Input
                                    id="modifyGuests"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={modifyGuests}
                                    onChange={(e) => setModifyGuests(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="modifyRequests">Special Requests</Label>
                                <Textarea
                                    id="modifyRequests"
                                    placeholder="Any special requirements..."
                                    value={modifyRequests}
                                    onChange={(e) => setModifyRequests(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModifyDialog({ open: false, reservation: null })}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleModify}
                                disabled={modifyLoading || !modifyDate || !modifyTime}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                {modifyLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Cancel Dialog */}
                <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, reservation: null })}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cancel Reservation</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel your reservation for{' '}
                                <strong>{cancelDialog.reservation && formatDate(cancelDialog.reservation.date)}</strong> at{' '}
                                <strong>{cancelDialog.reservation?.time}</strong>?
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    Please verify your identity to cancel:
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="cancelEmail">Email</Label>
                                    <Input
                                        id="cancelEmail"
                                        type="email"
                                        value={cancelEmail}
                                        onChange={(e) => setCancelEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cancelPhone">Phone</Label>
                                    <Input
                                        id="cancelPhone"
                                        type="tel"
                                        value={cancelPhone}
                                        onChange={(e) => setCancelPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCancelDialog({ open: false, reservation: null })}>
                                Keep Reservation
                            </Button>
                            <Button
                                onClick={handleCancel}
                                disabled={cancelLoading || !cancelEmail || !cancelPhone}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
