import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Check, Clock, Calendar, User, Phone, Mail, MapPin } from "lucide-react";
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;
import { useToast } from "@/components/ui/use-toast";

const vehicleTypes = [
    { id: "sedan", label: "Sedan", icon: "🚗" },
    { id: "suv", label: "SUV", icon: "🚙" },
    { id: "van", label: "Van", icon: "🚐" },
    { id: "motorcycle", label: "Motorcycle", icon: "🏍️" },
];

const timeSlots = [
    "06:00", "08:00", "10:00", "12:00",
    "14:00", "16:00", "18:00", "20:00", "22:00"
];

const durations = [1, 2, 3, 4, 5, 6, 8, 12, 24];

const ParkingReservation = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        vehicle: "",
        date: "",
        time: "",
        hours: 2,
        name: "",
        phone: "",
        email: "",
        plate: ""
    });
    const [reserved, setReserved] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!form.vehicle || !form.date || !form.time || !form.name || !form.phone || !form.email || !form.plate) {
            toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
            return;
        }

        setLoading(true);
        const data = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            vehicleType: vehicleTypes.find(v => v.id === form.vehicle)?.label || form.vehicle,
            vehiclePlate: form.plate,
            date: form.date,
            time: form.time,
            duration: form.hours
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/parking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setReserved(result);
                toast({ title: "Success!", description: "Parking reserved! Check your email & SMS." });
            } else {
                toast({ title: "Booking Failed", description: result.error || "Please try again", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Connection Error", description: e.message || "Could not connect to server", variant: "destructive" });
        }
        setLoading(false);
    };

    if (reserved) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-24 pb-12 px-4">
                <div className="max-w-md mx-auto">
                    <Card className="border-2 border-green-500/30 shadow-2xl">
                        <CardContent className="pt-8 pb-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Parking Reserved! </h2>
                            <p className="text-muted-foreground mb-6">Confirmation sent to {reserved.email}</p>

                            <div className="bg-muted/50 rounded-xl p-6 mb-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Slot</span>
                                    <span className="font-bold text-primary">{reserved.slotNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-semibold">{new Date(reserved.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-semibold">{reserved.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-semibold">{reserved.duration} hour{reserved.duration > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vehicle</span>
                                    <span className="font-semibold">{reserved.vehicleType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Plate</span>
                                    <span className="font-semibold">{reserved.vehiclePlate}</span>
                                </div>
                            </div>

                            <Button onClick={() => { setReserved(null); setForm({ vehicle: "", date: "", time: "", hours: 2, name: "", phone: "", email: "", plate: "" }); setStep(1); }} className="w-full">
                                Book Another Space
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-24 pb-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Car className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Reserve Parking</h1>
                    <p className="text-muted-foreground">Secure your parking spot in seconds</p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-6 space-y-6">
                        {/* Step 1: Vehicle & Time */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Car className="w-4 h-4" /> Select Vehicle
                            </Label>
                            <div className="grid grid-cols-4 gap-3">
                                {vehicleTypes.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setForm({ ...form, vehicle: v.id })}
                                        className={`p-4 rounded-xl border-2 transition-all ${form.vehicle === v.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <span className="text-2xl block mb-1">{v.icon}</span>
                                        <span className="text-xs font-medium">{v.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</Label>
                                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={form.time}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                >
                                    <option value="">Select time</option>
                                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Duration: {form.hours} hour{form.hours > 1 ? 's' : ''}</Label>
                            <div className="flex gap-2 flex-wrap">
                                {durations.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => setForm({ ...form, hours: h })}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.hours === h ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-border" />

                        {/* Step 2: Contact Details */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <User className="w-4 h-4" /> Your Details
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input placeholder="Enter Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input placeholder="Enter phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="Enter Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle Plate</Label>
                                <Input placeholder="KAA 123A" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} />
                            </div>
                        </div>

                        {/* Summary */}
                        {form.vehicle && form.date && form.time && (
                            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                                <p className="font-semibold text-sm">Booking Summary</p>
                                <p className="text-sm text-muted-foreground">
                                    {vehicleTypes.find(v => v.id === form.vehicle)?.label} • {form.date} at {form.time} • {form.hours} hour{form.hours > 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !form.vehicle || !form.date || !form.time || !form.name || !form.phone || !form.email || !form.plate}
                            className="w-full h-12 text-base"
                        >
                            {loading ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ParkingReservation;
