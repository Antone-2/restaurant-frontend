import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import { Calendar as CalendarIcon, Clock, Users, Phone, Mail, User, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";

const ReservationPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        guests: "2",
        date: "",
        time: "",
        specialRequests: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Date picker state
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Get today's date for min date
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 60);

    // Time slots
    const timeSlots = [
        { time: "09:00", label: "9:00 AM" },
        { time: "10:00", label: "10:00 AM" },
        { time: "11:00", label: "11:00 AM" },
        { time: "12:00", label: "12:00 PM" },
        { time: "13:00", label: "1:00 PM" },
        { time: "14:00", label: "2:00 PM" },
        { time: "15:00", label: "3:00 PM" },
        { time: "16:00", label: "4:00 PM" },
        { time: "17:00", label: "5:00 PM" },
        { time: "18:00", label: "6:00 PM" },
        { time: "19:00", label: "7:00 PM" },
        { time: "20:00", label: "8:00 PM" },
        { time: "21:00", label: "9:00 PM" },
    ];

    // Validate a single field
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case "name":
                if (!value.trim()) return "Name is required";
                if (value.trim().length < 2) return "Name must be at least 2 characters";
                return "";
            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
                return "";
            case "phone":
                if (!value.trim()) return "Phone number is required";
                if (!/^[\d\s\-\+\(\)]{10,}$/.test(value)) return "Please enter a valid phone number";
                return "";
            case "date":
                if (!value) return "Please select a date";
                return "";
            case "time":
                if (!value) return "Please select a time";
                return "";
            case "guests":
                if (!value) return "Please select number of guests";
                const guestsNum = parseInt(value);
                if (isNaN(guestsNum) || guestsNum < 1) return "Minimum 1 guest required";
                if (guestsNum > 20) return "For groups larger than 20, please contact us directly";
                return "";
            default:
                return "";
        }
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        Object.keys(formData).forEach((key) => {
            if (key !== "specialRequests") {
                const error = validateField(key, formData[key as keyof typeof formData]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name !== "specialRequests") {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    // Handle select change
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Handle date selection
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const dateStr = format(date, "yyyy-MM-dd");
            setFormData(prev => ({ ...prev, date: dateStr, time: "" }));
            setErrors(prev => ({ ...prev, date: "" }));
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Reservation Confirmed!",
                    description: "Your table has been reserved. Confirmation will be sent to your email.",
                });
                navigate("/reservation-confirmation?id=" + (data.reservationId || "unknown"));
            } else {
                toast({
                    title: "Reservation Failed",
                    description: data.error || "Something went wrong. Please try again.",
                    variant: "destructive"
                });
            }
        } catch (err) {
            toast({
                title: "Connection Error",
                description: "Could not connect to server. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Book a Table</h1>
                    <p className="text-muted-foreground">Reserve your spot at The Quill</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <Card className="border-primary/10">
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <User size={16} /> Your Name *
                                        </label>
                                        <Input
                                            name="name"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={errors.name ? "border-red-500" : ""}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle size={14} /> {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Mail size={16} /> Email *
                                            </label>
                                            <Input
                                                type="email"
                                                name="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle size={14} /> {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Phone size={16} /> Phone *
                                            </label>
                                            <Input
                                                type="tel"
                                                name="phone"
                                                placeholder="+254..."
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={errors.phone ? "border-red-500" : ""}
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle size={14} /> {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Users size={16} /> Number of Guests *
                                        </label>
                                        <Select
                                            value={formData.guests}
                                            onValueChange={(value) => handleSelectChange("guests", value)}
                                        >
                                            <SelectTrigger className={errors.guests ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select number of guests" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(20)].map((_, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1)}>
                                                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.guests && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle size={14} /> {errors.guests}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <CalendarIcon size={16} /> Date *
                                            </label>
                                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={"w-full justify-start text-left " + (errors.date ? "border-red-500" : "")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={handleDateSelect}
                                                        disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle size={14} /> {errors.date}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Clock size={16} /> Time *
                                            </label>
                                            <Select
                                                value={formData.time}
                                                onValueChange={(value) => handleSelectChange("time", value)}
                                                disabled={!formData.date}
                                            >
                                                <SelectTrigger className={errors.time ? "border-red-500" : ""}>
                                                    <SelectValue placeholder={formData.date ? "Select time" : "Select date first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((slot) => (
                                                        <SelectItem key={slot.time} value={slot.time}>
                                                            {slot.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.time && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle size={14} /> {errors.time}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Special Requests */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <MessageSquare size={16} /> Special Requests (Optional)
                                        </label>
                                        <Textarea
                                            name="specialRequests"
                                            placeholder="Any dietary requirements, celebrations, or seating preferences..."
                                            value={formData.specialRequests}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Confirm Reservation
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-4">
                        <Card className="border-primary/10 bg-primary/5">
                            <CardContent className="p-6">
                                <h3 className="font-display text-lg font-bold mb-4">Reservation Info</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <Clock className="text-primary mt-0.5" size={16} />
                                        <span>Open 24 Hours</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Users className="text-primary mt-0.5" size={16} />
                                        <span>Maximum 20 guests per booking</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="text-primary mt-0.5" size={16} />
                                        <span>For groups 20+, please contact us directly</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/10">
                            <CardContent className="p-6">
                                <h3 className="font-display text-lg font-bold mb-4">Contact Us</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Have questions? Get in touch with us directly.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p>📞 0113 857846</p>
                                    <p>📍 B1, C4XP+MH Korinda</p>
                                    <a
                                        href="/contact"
                                        className="inline-block mt-2 text-primary hover:underline"
                                    >
                                        Send us a message →
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ReservationPage;
