import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, CheckCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from '@/lib/apiBaseUrl';
import { useToast } from "@/components/ui/use-toast";

interface Table {
    _id: string;
    tableNumber: string;
    capacity: number;
    location: string;
    section: string;
    status: string;
    isActive: boolean;
    name?: string;
}

interface TimeSlot {
    id: string;
    label: string;
    available: boolean;
    maxBookings?: number;
    currentBookings?: number;
}

const DEFAULT_TIME_SLOTS = [
    { id: "11:00", label: "11:00 AM", available: true },
    { id: "11:30", label: "11:30 AM", available: true },
    { id: "12:00", label: "12:00 PM", available: false },
    { id: "12:30", label: "12:30 PM", available: true },
    { id: "13:00", label: "1:00 PM", available: true },
    { id: "13:30", label: "1:30 PM", available: false },
    { id: "14:00", label: "2:00 PM", available: true },
    { id: "14:30", label: "2:30 PM", available: true },
    { id: "18:00", label: "6:00 PM", available: true },
    { id: "18:30", label: "6:30 PM", available: true },
    { id: "19:00", label: "7:00 PM", available: false },
    { id: "19:30", label: "7:30 PM", available: true },
    { id: "20:00", label: "8:00 PM", available: true },
    { id: "20:30", label: "8:30 PM", available: true },
    { id: "21:00", label: "9:00 PM", available: true },
];

const DEFAULT_TABLES: Table[] = [
    { _id: "t1", tableNumber: "1", capacity: 2, location: "window", section: "indoor", status: "available", isActive: true },
    { _id: "t2", tableNumber: "2", capacity: 2, location: "window", section: "indoor", status: "available", isActive: true },
    { _id: "t3", tableNumber: "3", capacity: 4, location: "main", section: "indoor", status: "available", isActive: true },
    { _id: "t4", tableNumber: "4", capacity: 4, location: "main", section: "indoor", status: "available", isActive: true },
    { _id: "t5", tableNumber: "5", capacity: 6, location: "main", section: "indoor", status: "available", isActive: true },
    { _id: "t6", tableNumber: "6", capacity: 6, location: "private", section: "private", status: "available", isActive: true },
    { _id: "t7", tableNumber: "7", capacity: 8, location: "private", section: "private", status: "available", isActive: true },
    { _id: "t8", tableNumber: "8", capacity: 4, location: "bar", section: "bar", status: "available", isActive: true },
    { _id: "t9", tableNumber: "9", capacity: 2, location: "bar", section: "bar", status: "available", isActive: true },
    { _id: "t10", tableNumber: "VIP", capacity: 12, location: "vip", section: "vip", status: "available", isActive: true },
];

interface Reservation {
    date: Date;
    time: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
    tableId?: string;
    specialRequests?: string;
}

const TableReservation = () => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [selectedTable, setSelectedTable] = useState<string>("");
    const [guests, setGuests] = useState(2);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialRequests: ""
    });
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isBlacklisted, setIsBlacklisted] = useState(false);
    const [blacklistWarning, setBlacklistWarning] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
    const [tables, setTables] = useState<Table[]>(DEFAULT_TABLES as Table[]);
    const { toast } = useToast();

    // Fetch available time slots when date changes
    useEffect(() => {
        const fetchTimeSlots = async () => {
            if (!selectedDate) return;

            setIsLoadingSlots(true);
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const response = await fetch(`${API_BASE_URL}/timeslots/available?date=${dateStr}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.timeSlots && data.timeSlots.length > 0) {
                        setTimeSlots(data.timeSlots);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch time slots:', err);
                setTimeSlots(DEFAULT_TIME_SLOTS);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchTimeSlots();
    }, [selectedDate]);

    // Fetch tables
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/tables`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.tables && data.tables.length > 0) {
                        const formattedTables = data.tables.map((t: any) => ({
                            _id: t._id,
                            tableNumber: t.tableNumber,
                            capacity: t.capacity,
                            location: t.location || 'indoor',
                            section: t.section || 'main',
                            status: t.status,
                            isActive: t.isActive
                        }));
                        setTables(formattedTables);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch tables:', err);
            }
        };

        fetchTables();
    }, []);

    // Check blacklist when phone or email changes
    useEffect(() => {
        const checkBlacklist = async () => {
            if (!formData.phone && !formData.email) return;

            try {
                const params = new URLSearchParams();
                if (formData.phone) params.append('phone', formData.phone);
                if (formData.email) params.append('email', formData.email);

                const response = await fetch(`${API_BASE_URL}/reservations/check-blacklist?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsBlacklisted(data.isBlacklisted);
                    setBlacklistWarning(data.requiresManualApproval ?
                        'Your reservation requires manual approval due to previous no-shows.' :
                        data.reason || '');
                }
            } catch (err) {
                console.error('Failed to check blacklist:', err);
            }
        };

        const debounce = setTimeout(checkBlacklist, 500);
        return () => clearTimeout(debounce);
    }, [formData.phone, formData.email]);

    const availableTables = useMemo(() => {
        return tables.filter(table => table.capacity >= guests && table.isActive !== false);
    }, [tables, guests]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedTime("");
        setSelectedTable("");
    };

    const handleTimeSelect = (timeId: string) => {
        setSelectedTime(timeId);
        setSelectedTable("");
    };
    const handleTableSelect = (tableId: string) => {
        setSelectedTable(tableId);
    };
    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        // Check if blacklisted
        if (isBlacklisted) {
            toast({
                title: "Reservation Limited",
                description: blacklistWarning || "Your account has restrictions. Please contact us directly to make a reservation.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const table = tables.find(t => t._id === selectedTable);
            const reservationData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: selectedDate.toISOString(),
                time: selectedTime,
                guests: guests,
                tableId: selectedTable,
                tableName: table?.tableNumber ? `Table ${table.tableNumber}` : "Best Available",
                specialRequests: formData.specialRequests
            };

            const response = await fetch(`${API_BASE_URL}/reservations/auto-confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });

            if (response.ok) {
                setReservation({
                    date: selectedDate,
                    time: selectedTime,
                    guests,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    tableId: selectedTable,
                    specialRequests: formData.specialRequests
                });
                setStep(4);
                const result = await response.json();
                toast({
                    title: result.confirmed ? "Success!" : "Pending Approval",
                    description: result.confirmed
                        ? `Reservation confirmed! Confirmation sent to ${formData.email}`
                        : `Your reservation is pending approval. We'll notify you at ${formData.email}`
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Reservation Failed",
                    description: errorData.error || "Please try again later",
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            toast({
                title: "Connection Error",
                description: err.message || "Could not connect to server",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setStep(1);
        setSelectedDate(undefined);
        setSelectedTime("");
        setSelectedTable("");
        setFormData({ name: "", email: "", phone: "", specialRequests: "" });
        setReservation(null);
    };
    if (step === 4 && reservation) {
        const table = tables.find(t => t._id === reservation.tableId);
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
                    <p className="text-muted-foreground mb-6">We've sent a confirmation to {reservation.email} and {reservation.phone}</p>

                    <div className="bg-muted rounded-lg p-6 text-left mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-semibold">{reservation.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{reservation.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-semibold">{reservation.date.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-semibold">{reservation.time}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Guests</p>
                                <p className="font-semibold">{reservation.guests} people</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Table</p>
                                <p className="font-semibold">{table?.name || "Best Available"}</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleReset} className="w-full">Make Another Reservation</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            { }
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>

            { }
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="w-5 h-5" />
                            Select Date & Time
                        </CardTitle>
                        <CardDescription>Choose your preferred date and time slot</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        { }
                        <div>
                            <Label className="mb-2 block">Number of Guests</Label>
                            <div className="flex gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <Button
                                        key={num}
                                        variant={guests === num ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setGuests(num)}
                                        className="w-12"
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        { }
                        <div>
                            <Label className="mb-2 block">Select Date</Label>
                            <div className="border rounded-lg p-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date() || date.getDay() === 0}
                                    className="rounded-md"
                                />
                            </div>
                        </div>

                        {/* Time Selection */}
                        {selectedDate && (
                            <div>
                                <Label className="mb-2 block">
                                    Select Time
                                    {isLoadingSlots && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
                                </Label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                    {timeSlots.map((slot: TimeSlot) => (
                                        <Button
                                            key={slot.id}
                                            variant={selectedTime === slot.id ? "default" : "outline"}
                                            disabled={!slot.available}
                                            onClick={() => handleTimeSelect(slot.id)}
                                            className="text-sm"
                                        >
                                            {slot.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedDate && selectedTime && (
                            <Button onClick={() => setStep(2)} className="w-full">
                                Continue to Table Selection
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Select Table */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Select Your Table
                        </CardTitle>
                        <CardDescription>Choose your preferred seating area (accommodates {guests} guests)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Table Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {availableTables.map((table) => (
                                <button
                                    key={table._id}
                                    onClick={() => handleTableSelect(table._id)}
                                    className={`p-4 border rounded-lg text-center transition-all ${selectedTable === table._id
                                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                        }`}
                                >
                                    <p className="font-semibold">{table.tableNumber === 'VIP' ? 'VIP Room' : `Table ${table.tableNumber}`}</p>
                                    <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                                    <Badge variant="outline" className="mt-2 text-xs capitalize">{table.location}</Badge>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)} className="flex-1" disabled={!selectedTable}>
                                Continue to Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contact Details */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Your Details
                        </CardTitle>
                        <CardDescription>
                            Reservation for {selectedDate?.toLocaleDateString()} at {selectedTime} - {guests} guests
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter Your Name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter Email Address"
                            />
                        </div>
                        {isBlacklisted && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                <p className="font-semibold">Reservation Limited</p>
                                <p>{blacklistWarning || 'Your account has restrictions. Please contact us directly to make a reservation.'}</p>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="requests">Special Requests (optional)</Label>
                            <Textarea
                                id="requests"
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                placeholder="Birthday celebration, dietary requirements, etc."
                                rows={3}
                            />
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Reservation Summary</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p>Date:</p><p>{selectedDate?.toLocaleDateString()}</p>
                                <p>Time:</p><p>{selectedTime}</p>
                                <p>Guests:</p><p>{guests} people</p>
                                <p>Table:</p><p>{tables.find((t: Table) => t._id === selectedTable)?.tableNumber === 'VIP' ? 'VIP Room' : `Table ${tables.find((t: Table) => t._id === selectedTable)?.tableNumber}`}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? "Confirming..." : "Confirm Reservation"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TableReservation;
