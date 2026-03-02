import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;
import { useToast } from "@/components/ui/use-toast";

const TIME_SLOTS = [
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

const TABLES = [
    { id: "t1", name: "Table 1", capacity: 2, section: "window" },
    { id: "t2", name: "Table 2", capacity: 2, section: "window" },
    { id: "t3", name: "Table 3", capacity: 4, section: "main" },
    { id: "t4", name: "Table 4", capacity: 4, section: "main" },
    { id: "t5", name: "Table 5", capacity: 6, section: "main" },
    { id: "t6", name: "Table 6", capacity: 6, section: "private" },
    { id: "t7", name: "Table 7", capacity: 8, section: "private" },
    { id: "t8", name: "Table 8", capacity: 4, section: "bar" },
    { id: "t9", name: "Table 9", capacity: 2, section: "bar" },
    { id: "t10", name: "VIP Room", capacity: 12, section: "vip" },
];

const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    return dates;
};

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
    const { toast } = useToast();

    const availableTables = useMemo(() => {
        return TABLES.filter(table => table.capacity >= guests);
    }, [guests]);

    const isTimeAvailable = (timeId: string) => {
        const slot = TIME_SLOTS.find(s => s.id === timeId);
        return slot?.available || false;
    };

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

        setIsSubmitting(true);

        try {
            const table = TABLES.find(t => t.id === selectedTable);
            const reservationData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: selectedDate.toISOString(),
                time: selectedTime,
                guests: guests,
                tableName: table?.name || "Best Available",
                specialRequests: formData.specialRequests
            };

            const response = await fetch('${API_BASE_URL}/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });

            if (response.ok) {
                const result = await response.json();
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
                toast({
                    title: "Success!",
                    description: `Reservation confirmed! Confirmation sent to ${formData.email} and ${formData.phone}`
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
        const table = TABLES.find(t => t.id === reservation.tableId);
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
                                <Label className="mb-2 block">Select Time</Label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                    {TIME_SLOTS.map((slot) => (
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
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id)}
                                    className={`p-4 border rounded-lg text-center transition-all ${selectedTable === table.id
                                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                        }`}
                                >
                                    <p className="font-semibold">{table.name}</p>
                                    <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                                    <Badge variant="outline" className="mt-2 text-xs capitalize">{table.section}</Badge>
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
                                <p>Table:</p><p>{TABLES.find(t => t.id === selectedTable)?.name}</p>
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
