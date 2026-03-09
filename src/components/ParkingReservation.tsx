import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Car, Check, Clock, Calendar, User, Phone, Mail, MapPin, CarFront, Bike, Bus, Building2, ArrowRight, CheckCircle2, AlertCircle, Sparkles, CreditCard, Smartphone } from "lucide-react";
import { API_BASE_URL } from '@/lib/apiBaseUrl';
import { useToast } from "@/components/ui/use-toast";

const vehicleTypes = [
    { id: "sedan", label: "Sedan", icon: CarFront, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", basePrice: 200 },
    { id: "suv", label: "SUV", icon: Car, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", basePrice: 250 },
    { id: "van", label: "Van", icon: Bus, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200", basePrice: 300 },
    { id: "motorcycle", label: "Motorcycle", icon: Bike, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", basePrice: 150 },
];

const timeSlots = [
    { value: "00:00", label: "12:00 AM" },
    { value: "02:00", label: "2:00 AM" },
    { value: "04:00", label: "4:00 AM" },
    { value: "06:00", label: "6:00 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "22:00", label: "10:00 PM" },
];

const durations = [
    { value: 1, label: "1hr", discount: 1 },
    { value: 2, label: "2hrs", discount: 1 },
    { value: 3, label: "3hrs", discount: 1 },
    { value: 4, label: "4hrs", discount: 1 },
    { value: 6, label: "6hrs", discount: 0.9 },
    { value: 12, label: "12hrs", discount: 0.85 },
    { value: 24, label: "24hrs", discount: 0.7 },
];

// Calculate price based on vehicle type and duration
const calculatePrice = (vehicleId: string, duration: number) => {
    const vehicle = vehicleTypes.find(v => v.id === vehicleId);
    if (!vehicle) return 0;
    const dur = durations.find(d => d.value === duration);
    const discount = dur ? dur.discount : 1;
    return Math.round(vehicle.basePrice * duration * discount);
};

const PaymentModal = ({ price, onClose, onSuccess }: { price: number; onClose: () => void; onSuccess: () => void }) => {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleMpesaPayment = async () => {
        if (!phone || phone.length < 10) {
            toast({ title: "Invalid Phone", description: "Please enter a valid phone number", variant: "destructive" });
            return;
        }

        setLoading(true);
        // Store phone for later use - the actual payment will be processed with the booking
        localStorage.setItem('parking_payment_phone', phone);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-green-600" />
                        Pay with M-Pesa
                    </h3>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="text-sm text-green-700 mb-2">Amount to pay:</div>
                        <div className="text-3xl font-bold text-green-700">KES {price.toLocaleString()}</div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Phone Number</Label>
                            <Input
                                placeholder="254712345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                maxLength={12}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter the phone number that will receive the STK push</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-2">How to pay:</p>
                            <ol className="list-decimal list-inside text-gray-600 space-y-1">
                                <li>Enter your M-Pesa phone number</li>
                                <li>Click "Pay Now"</li>
                                <li>Enter your M-Pesa PIN on your phone</li>
                                <li>Wait for confirmation SMS</li>
                            </ol>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleMpesaPayment} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                            {loading ? "Processing..." : "Pay Now"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const ParkingReservation = () => {
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [form, setForm] = useState({
        vehicle: "",
        date: "",
        time: "",
        hours: 2,
        name: "",
        phone: "",
        email: "",
        plate: "",
        paymentMethod: "" as "" | "mpesa" | "cash",
        phoneNumber: ""
    });
    const [reserved, setReserved] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSubmit = async (paymentMethod: "mpesa" | "cash" = "cash") => {
        if (!form.vehicle || !form.date || !form.time || !form.name || !form.phone || !form.email || !form.plate) {
            toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
            return;
        }

        setLoading(true);

        // Get phone number for M-Pesa if stored
        const mpesaPhone = localStorage.getItem('parking_payment_phone') || form.phoneNumber;

        const data = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            vehicleType: vehicleTypes.find(v => v.id === form.vehicle)?.label || form.vehicle,
            vehiclePlate: form.plate,
            date: form.date,
            time: form.time,
            duration: form.hours,
            paymentMethod: paymentMethod,
            phoneNumber: paymentMethod === 'mpesa' ? mpesaPhone : undefined
        };

        try {
            const res = await fetch(`${API_BASE_URL}/parking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setReserved(result);
                localStorage.removeItem('parking_payment_phone');

                if (paymentMethod === 'mpesa' && result.requiresPaymentConfirmation) {
                    toast({
                        title: "Payment Initiated!",
                        description: `Please check your phone (${mpesaPhone}) for M-Pesa prompt. Confirmation: ${result.checkoutRequestId}`
                    });
                } else if (paymentMethod === 'cash') {
                    toast({ title: "Success!", description: "Parking reserved! Please pay KES " + result.price + " at the venue." });
                } else {
                    toast({ title: "Success!", description: "Parking reserved! Check your email & SMS." });
                }
            } else {
                toast({ title: "Booking Failed", description: result.error || "Please try again", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Connection Error", description: e.message || "Could not connect to server", variant: "destructive" });
        }
        setLoading(false);
    };

    const selectedVehicle = vehicleTypes.find(v => v.id === form.vehicle);
    const selectedDuration = durations.find(d => d.value === form.hours);
    const totalPrice = selectedVehicle ? calculatePrice(form.vehicle, form.hours) : 0;

    if (reserved) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 px-4">
                {/* Background Effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl"></div>
                </div>

                <div className={`max-w-lg mx-auto relative z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Parking Reserved!</h2>
                            <p className="text-emerald-100">Confirmation sent to {reserved.email}</p>
                        </div>

                        <CardContent className="p-8">
                            {/* Slot Card */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-slate-500">Parking Slot</span>
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-lg font-bold">
                                        {reserved.slotNumber}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">Date</div>
                                            <div className="font-semibold text-slate-800">{new Date(reserved.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">Time</div>
                                            <div className="font-semibold text-slate-800">{reserved.time}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                                    <span className="font-semibold text-slate-800">{reserved.duration} hour{reserved.duration > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Car className="w-4 h-4" /> Vehicle</span>
                                    <span className="font-semibold text-slate-800">{reserved.vehicleType}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Plate</span>
                                    <span className="font-semibold text-slate-800 uppercase">{reserved.vehiclePlate}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Total</span>
                                    <span className="font-bold text-amber-600">KES {reserved.price?.toLocaleString() || '0'}</span>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {reserved.paymentStatus === 'unpaid' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-800">Pay at Entrance</p>
                                            <p className="text-sm text-amber-700">
                                                Please pay KES {reserved.price?.toLocaleString()} at the parking entrance when you arrive.
                                                Show this confirmation to the attendant.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reserved.paymentStatus === 'pending' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-800">Payment Pending</p>
                                            <p className="text-sm text-blue-700">
                                                Please complete your M-Pesa payment. Check your phone for the payment prompt.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reserved.paymentStatus === 'paid' && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-green-800">Payment Complete</p>
                                            <p className="text-sm text-green-700">
                                                Your payment has been confirmed. See you at slot {reserved.slotNumber}!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={() => {
                                    setReserved(null);
                                    setForm({ vehicle: "", date: "", time: "", hours: 2, name: "", phone: "", email: "", plate: "", paymentMethod: "", phoneNumber: "" });
                                    setStep(1);
                                }}
                                className="w-full h-14 text-base bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                            >
                                Book Another Space
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl"></div>
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-white/90 text-sm font-medium">Secure Parking</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Reserve Your
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
                            Parking Spot
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg">Secure your parking space in seconds</p>
                </div>

                {/* Progress Steps */}
                <div className={`flex items-center justify-center gap-4 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {[
                        { num: 1, label: "Vehicle" },
                        { num: 2, label: "Details" },
                    ].map((s) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.num
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                                }`}>
                                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                {s.label}
                            </span>
                            {s.num < 2 && (
                                <div className={`w-12 h-0.5 ${step > s.num ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-700'}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8 space-y-6">
                        {/* Step 1: Vehicle & Time */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Vehicle Selection */}
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Car className="w-5 h-5 text-slate-600" /> Select Vehicle Type
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {vehicleTypes.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setForm({ ...form, vehicle: v.id })}
                                                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${form.vehicle === v.id
                                                    ? `border-${v.color.split(' ')[1]} bg-${v.bgColor} shadow-lg scale-105`
                                                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                    }`}
                                                style={{
                                                    borderColor: form.vehicle === v.id ? (v.id === 'sedan' ? '#3b82f6' : v.id === 'suv' ? '#10b981' : v.id === 'van' ? '#8b5cf6' : '#f97316') : '#e2e8f0',
                                                    backgroundColor: form.vehicle === v.id ? (v.id === 'sedan' ? '#eff6ff' : v.id === 'suv' ? '#ecfdf5' : v.id === 'van' ? '#f5f3ff' : '#fff7ed') : 'white'
                                                }}
                                            >
                                                <v.icon className={`w-8 h-8 mx-auto mb-2 ${form.vehicle === v.id
                                                    ? `text-${v.color.split(' ')[1]}`
                                                    : 'text-slate-400'
                                                    }`}
                                                    style={{ color: form.vehicle === v.id ? (v.id === 'sedan' ? '#3b82f6' : v.id === 'suv' ? '#10b981' : v.id === 'van' ? '#8b5cf6' : '#f97316') : '#94a3b8' }}
                                                />
                                                <span className={`text-sm font-medium block ${form.vehicle === v.id ? 'text-slate-800' : 'text-slate-500'}`}>{v.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-slate-700">
                                            <Calendar className="w-4 h-4" /> Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-slate-700">
                                            <Clock className="w-4 h-4" /> Time
                                        </Label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:ring-amber-500"
                                            value={form.time}
                                            onChange={e => setForm({ ...form, time: e.target.value })}
                                        >
                                            <option value="">Select time</option>
                                            {timeSlots.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-3">
                                    <Label className="flex items-center justify-between text-slate-700">
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                                        {selectedDuration && selectedVehicle && (
                                            <Badge className="bg-amber-100 text-amber-700">
                                                KES {calculatePrice(form.vehicle, form.hours).toLocaleString()}
                                            </Badge>
                                        )}
                                    </Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {durations.map(h => (
                                            <button
                                                key={h.value}
                                                onClick={() => setForm({ ...form, hours: h.value })}
                                                className={`flex-1 min-w-[60px] px-3 py-3 rounded-xl text-sm font-medium transition-all ${form.hours === h.value
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {h.label}
                                                {h.discount < 1 && (
                                                    <span className="block text-xs opacity-80">-{Math.round((1 - h.discount) * 100)}%</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!form.vehicle || !form.date || !form.time}
                                    className="w-full h-14 text-base bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Contact Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <User className="w-5 h-5 text-slate-600" /> Your Details
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setStep(1)}
                                        className="text-slate-500 hover:text-slate-700"
                                    >
                                        Back
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Full Name</Label>
                                        <Input
                                            placeholder="Enter Your Name"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Phone Number</Label>
                                        <Input
                                            placeholder="Phone number"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Vehicle Plate Number</Label>
                                    <Input
                                        placeholder="KAA 123A"
                                        value={form.plate}
                                        onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                                        className="h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 uppercase"
                                    />
                                </div>

                                {/* Summary Card */}
                                {form.vehicle && form.date && form.time && (
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 space-y-3 border border-slate-200">
                                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Booking Summary
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            <Badge variant="outline" className="bg-white">
                                                {selectedVehicle?.label}
                                            </Badge>
                                            <Badge variant="outline" className="bg-white">
                                                {form.date}
                                            </Badge>
                                            <Badge variant="outline" className="bg-white">
                                                {timeSlots.find(t => t.value === form.time)?.label}
                                            </Badge>
                                            <Badge variant="outline" className="bg-white">
                                                {form.hours} hour{form.hours > 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        {selectedDuration && (
                                            <div className="pt-2 border-t border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Total</span>
                                                    <span className="text-2xl font-bold text-amber-600">KES {totalPrice.toLocaleString()}</span>
                                                </div>
                                                {form.hours >= 24 && (
                                                    <div className="text-xs text-green-600 mt-1">30% discount applied for daily parking</div>
                                                )}
                                                {form.hours >= 12 && form.hours < 24 && (
                                                    <div className="text-xs text-green-600 mt-1">15% discount applied for 12+ hours</div>
                                                )}
                                                {form.hours >= 6 && form.hours < 12 && (
                                                    <div className="text-xs text-green-600 mt-1">10% discount applied for 6+ hours</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-slate-700 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" /> Payment Method
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setForm({ ...form, paymentMethod: 'mpesa' })}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${form.paymentMethod === 'mpesa'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <Smartphone className="w-5 h-5" />
                                            <span className="font-medium">M-Pesa</span>
                                        </button>
                                        <button
                                            onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${form.paymentMethod === 'cash'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            <span className="font-medium">Pay at Venue</span>
                                        </button>
                                    </div>
                                    {!form.paymentMethod && (
                                        <p className="text-xs text-amber-600">Please select a payment method</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 h-12 rounded-xl"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmit(form.paymentMethod || 'cash')}
                                        disabled={loading || !form.name || !form.phone || !form.email || !form.plate || !form.paymentMethod}
                                        className="flex-1 h-12 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Booking...
                                            </span>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5 mr-2" />
                                                {form.paymentMethod === 'mpesa' ? 'Pay & Book' : 'Confirm Booking'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className={`mt-8 grid md:grid-cols-3 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-white font-medium text-sm">Location</div>
                            <div className="text-slate-400 text-xs">B1, Korinda</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-white font-medium text-sm">Support</div>
                            <div className="text-slate-400 text-xs">0113 857846</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-white font-medium text-sm">Spaces</div>
                            <div className="text-slate-400 text-xs">50+ Available</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingReservation;
