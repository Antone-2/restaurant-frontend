
import { Bed, Users, Wifi, Car, Coffee, Utensils, Star, MapPin, Phone, Mail, Calendar, Check, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection } from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-restaurant.jpg";
import { adminApi, contactApi } from "@/services/api";

// Room types from admin-managed data
interface RoomTypeData {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    capacity: number;
    maxAdults: number;
    maxChildren: number;
    bedType: string;
    amenities: string[];
    photos: string[];
    isActive: boolean;
}

// Room types for display
interface Room {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    type: 'standard' | 'deluxe' | 'suite' | 'family';
    pricePerNight: number;
    capacity: number;
    amenities: string[];
    images: string[];
    available: boolean;
    roomNumber?: string;
}

const roomTypes = [
    {
        icon: Bed,
        title: "Standard Room",
        description: "Comfortable room with essential amenities for a pleasant stay.",
        capacity: "1-2 guests",
        price: "KES 8,000/night"
    },
    {
        icon: Star,
        title: "Deluxe Room",
        description: "Spacious room with premium amenities and scenic views.",
        capacity: "2-3 guests",
        price: "KES 12,000/night"
    },
    {
        icon: Star,
        title: "Suite",
        description: "Luxurious suite with separate living area and premium facilities.",
        capacity: "2-4 guests",
        price: "KES 18,000/night"
    },
    {
        icon: Users,
        title: "Family Room",
        description: "Large room perfect for families, with connecting rooms available.",
        capacity: "4-6 guests",
        price: "KES 25,000/night"
    }
];

const amenitiesList = [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Coffee, name: "Breakfast Included" },
    { icon: Utensils, name: "Room Service" },
    { icon: Car, name: "Free Parking" },
    { icon: Bed, name: "King/Queen Beds" },
    { icon: Star, name: "Air Conditioning" }
];

const sampleRooms: Room[] = [
    {
        id: '1',
        name: 'Deluxe Lake View Room',
        description: 'Spacious room with stunning views of Lake Victoria. Features a queen bed, work desk, and private balcony.',
        type: 'deluxe',
        pricePerNight: 12000,
        capacity: 2,
        amenities: ['Free WiFi', 'Breakfast Included', 'Room Service', 'Lake View', 'Air Conditioning', 'Private Balcony'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'],
        available: true,
        roomNumber: '101'
    },
    {
        id: '2',
        name: 'Standard Garden Room',
        description: 'Comfortable room with garden views. Perfect for business travelers or couples.',
        type: 'standard',
        pricePerNight: 8000,
        capacity: 2,
        amenities: ['Free WiFi', 'Breakfast Included', 'Air Conditioning', 'Garden View'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'],
        available: true,
        roomNumber: '205'
    },
    {
        id: '3',
        name: 'Executive Suite',
        description: 'Luxurious suite with separate living area, king bed, and panoramic views. Includes access to executive lounge.',
        type: 'suite',
        pricePerNight: 18000,
        capacity: 3,
        amenities: ['Free WiFi', 'Breakfast Included', 'Room Service', 'Executive Lounge Access', 'King Bed', 'Living Room', 'Panoramic View'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'],
        available: true,
        roomNumber: '301'
    },
    {
        id: '4',
        name: 'Family Deluxe Room',
        description: 'Spacious family room with two queen beds and connecting options available. Perfect for families.',
        type: 'family',
        pricePerNight: 25000,
        capacity: 5,
        amenities: ['Free WiFi', 'Breakfast Included', 'Room Service', 'Two Queen Beds', 'Family Friendly', 'Extra Space'],
        images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400'],
        available: true,
        roomNumber: '401'
    }
];

const AccommodationPage = () => {
    const { toast } = useToast();
    const [roomTypesData, setRoomTypesData] = useState<RoomTypeData[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [bookingForm, setBookingForm] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        roomType: '',
        guests: '1',
        specialRequests: ''
    });
    const [sending, setSending] = useState(false);

    // Fetch room types from admin API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await adminApi.getPublicRoomTypes();
                const data = response?.roomTypes || [];
                setRoomTypesData(data);

                // Transform room types to rooms format
                const transformedRooms: Room[] = data.map((rt: RoomTypeData) => ({
                    id: rt._id,
                    name: rt.name,
                    description: rt.description || '',
                    type: getRoomTypeFromBedType(rt.bedType),
                    pricePerNight: rt.basePrice || 0,
                    capacity: rt.capacity || 2,
                    amenities: rt.amenities || [],
                    images: rt.photos && rt.photos.length > 0 ? rt.photos : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'],
                    available: rt.isActive !== false,
                    roomNumber: ''
                }));

                setRooms(transformedRooms);
            } catch (err) {
                console.error('Failed to fetch room types:', err);
                // Fallback to sample data on error
                setRooms(sampleRooms);
            } finally {
                setRoomsLoading(false);
            }
        };

        fetchRoomTypes();
    }, []);

    const getRoomTypeFromBedType = (bedType: string): 'standard' | 'deluxe' | 'suite' | 'family' => {
        const bt = bedType?.toLowerCase() || '';
        if (bt.includes('suite')) return 'suite';
        if (bt.includes('king') || bt.includes('queen')) return 'deluxe';
        if (bt.includes('family')) return 'family';
        return 'standard';
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            // Submit booking to API
            const response = await contactApi.bookAccommodation({
                name: bookingForm.name,
                email: bookingForm.email,
                phone: bookingForm.phone,
                checkInDate: bookingForm.checkIn,
                checkOutDate: bookingForm.checkOut,
                roomType: bookingForm.roomType,
                guests: bookingForm.guests,
                specialRequests: bookingForm.specialRequests
            });

            toast({
                title: "Booking Request Received! 🏨",
                description: response.confirmationNumber
                    ? `Confirmation: ${response.confirmationNumber}. Our team will contact you within 24 hours.`
                    : "Our accommodation team will contact you within 24 hours to confirm your reservation.",
            });
            setBookingForm({
                name: '',
                email: '',
                phone: '',
                checkIn: '',
                checkOut: '',
                roomType: '',
                guests: '1',
                specialRequests: ''
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not submit booking. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const getRoomTypeColor = (type: Room['type']) => {
        switch (type) {
            case 'standard': return 'bg-blue-500';
            case 'deluxe': return 'bg-purple-500';
            case 'suite': return 'bg-amber-500';
            case 'family': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-24 bg-secondary">
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/70" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Accommodation at The Quill
                    </h1>
                    <p className="text-secondary-foreground/80 max-w-2xl mx-auto text-lg">
                        Experience comfort and luxury during your stay with us.
                        Perfectly located in Busia, Kenya.
                    </p>
                </div>
            </section>

            {/* Amenities Section */}
            <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                    <AnimatedSection>
                        <div className="text-center mb-10">
                            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                Our Amenities
                            </h2>
                            <p className="text-muted-foreground">
                                Everything you need for a comfortable stay
                            </p>
                        </div>
                    </AnimatedSection>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {amenitiesList.map((amenity, index) => (
                            <AnimatedSection key={amenity.name} delay={index * 100}>
                                <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-0">
                                        <amenity.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                                        <p className="text-sm font-medium">{amenity.name}</p>
                                    </CardContent>
                                </Card>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Room Types */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <AnimatedSection>
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                Room Types
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Choose from a variety of comfortable accommodations to suit your needs
                            </p>
                        </div>
                    </AnimatedSection>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roomTypesData.length > 0 ? (
                            roomTypesData.slice(0, 4).map((roomType, index) => (
                                <AnimatedSection key={roomType._id} delay={index * 100}>
                                    <Card className="h-full hover:shadow-xl transition-all">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Bed className="text-primary" size={28} />
                                            </div>
                                            <h3 className="font-display font-semibold text-lg mb-2">{roomType.name}</h3>
                                            <p className="text-muted-foreground text-sm mb-4">{roomType.description || 'Comfortable accommodation for your stay'}</p>
                                            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium mb-2">
                                                <Users size={14} /> {roomType.capacity || 2} guests
                                            </div>
                                            <p className="text-lg font-bold text-primary">KES {roomType.basePrice?.toLocaleString() || '0'}/night</p>
                                        </CardContent>
                                    </Card>
                                </AnimatedSection>
                            ))
                        ) : (
                            roomTypes.map((roomType, index) => (
                                <AnimatedSection key={roomType.title} delay={index * 100}>
                                    <Card className="h-full hover:shadow-xl transition-all">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                <roomType.icon className="text-primary" size={28} />
                                            </div>
                                            <h3 className="font-display font-semibold text-lg mb-2">{roomType.title}</h3>
                                            <p className="text-muted-foreground text-sm mb-4">{roomType.description}</p>
                                            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium mb-2">
                                                <Users size={14} /> {roomType.capacity}
                                            </div>
                                            <p className="text-lg font-bold text-primary">{roomType.price}</p>
                                        </CardContent>
                                    </Card>
                                </AnimatedSection>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Available Rooms */}
            <section className="py-16 bg-muted">
                <div className="container mx-auto px-4">
                    <AnimatedSection>
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                Available Rooms
                            </h2>
                            <p className="text-muted-foreground">
                                Book your perfect stay with us
                            </p>
                        </div>
                    </AnimatedSection>

                    {roomsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {rooms.map((room, index) => (
                                <AnimatedSection key={room.id || index} delay={index * 100}>
                                    <Card className="overflow-hidden hover:shadow-xl transition-all">
                                        <div className="md:flex">
                                            <div className="md:w-2/5">
                                                <img
                                                    src={room.images[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'}
                                                    alt={room.name}
                                                    className="w-full h-48 md:h-full object-cover"
                                                />
                                            </div>
                                            <CardContent className="p-6 md:w-3/5">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-display font-bold text-lg">{room.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getRoomTypeColor(room.type)}`}>
                                                        {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                    {room.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {room.amenities.slice(0, 4).map((amenity) => (
                                                        <span key={amenity} className="text-xs bg-muted px-2 py-1 rounded-full">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                    {room.amenities.length > 4 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{room.amenities.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-bold text-primary">KES {room.pricePerNight.toLocaleString()}</span>
                                                        <span className="text-muted-foreground text-sm">/night</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setBookingForm({ ...bookingForm, roomType: room.type, guests: room.capacity.toString() });
                                                            setTimeout(() => {
                                                                document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                                                            }, 100);
                                                        }}
                                                    >
                                                        Book Now
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </Card>
                                </AnimatedSection>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Booking Form */}
            <section className="py-16" id="booking-form">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <AnimatedSection>
                            <div className="text-center mb-10">
                                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                    Book Your Stay
                                </h2>
                                <p className="text-muted-foreground">
                                    Fill out the form below and we'll get back to you within 24 hours
                                </p>
                            </div>
                        </AnimatedSection>

                        <Card className="border-primary/20">
                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="booking-name" className="block text-sm font-medium text-foreground mb-1">
                                                👤 Full Name
                                            </label>
                                            <Input
                                                id="booking-name"
                                                placeholder="Enter your full name"
                                                value={bookingForm.name}
                                                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="booking-email" className="block text-sm font-medium text-foreground mb-1">
                                                📧 Email Address
                                            </label>
                                            <Input
                                                id="booking-email"
                                                type="email"
                                                placeholder="Email Address"
                                                value={bookingForm.email}
                                                onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="booking-phone" className="block text-sm font-medium text-foreground mb-1">
                                                📞 Phone Number
                                            </label>
                                            <Input
                                                id="booking-phone"
                                                type="tel"
                                                placeholder="e.g., 0712 345678"
                                                value={bookingForm.phone}
                                                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="room-type" className="block text-sm font-medium text-foreground mb-1">
                                                🛏️ Room Type
                                            </label>
                                            <select
                                                id="room-type"
                                                value={bookingForm.roomType}
                                                onChange={(e) => setBookingForm({ ...bookingForm, roomType: e.target.value })}
                                                required
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">Select a room</option>
                                                {roomTypesData.length > 0 ? (
                                                    roomTypesData.map((rt) => (
                                                        <option key={rt._id} value={rt.name}>{rt.name} - KES {rt.basePrice?.toLocaleString()}/night</option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="standard">Standard Room - KES 8,000/night</option>
                                                        <option value="deluxe">Deluxe Room - KES 12,000/night</option>
                                                        <option value="suite">Executive Suite - KES 18,000/night</option>
                                                        <option value="family">Family Room - KES 25,000/night</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="check-in" className="block text-sm font-medium text-foreground mb-1">
                                                📅 Check-in Date
                                            </label>
                                            <Input
                                                id="check-in"
                                                type="date"
                                                placeholder="When will you arrive?"
                                                value={bookingForm.checkIn}
                                                onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="check-out" className="block text-sm font-medium text-foreground mb-1">
                                                📅 Check-out Date
                                            </label>
                                            <Input
                                                id="check-out"
                                                type="date"
                                                placeholder="When will you leave?"
                                                value={bookingForm.checkOut}
                                                onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="guests" className="block text-sm font-medium text-foreground mb-1">
                                                👥 Number of Guests
                                            </label>
                                            <Input
                                                id="guests"
                                                type="number"
                                                placeholder="How many people?"
                                                value={bookingForm.guests}
                                                onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                                                min={1}
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="special-requests" className="block text-sm font-medium text-foreground mb-1">
                                            📝 Special Requests (Optional)
                                        </label>
                                        <textarea
                                            id="special-requests"
                                            placeholder="Any special requests? E.g., extra bed, dietary requirements, early check-in..."
                                            value={bookingForm.specialRequests}
                                            onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                                        />
                                    </div>
                                    <Button type="submit" disabled={sending} className="w-full bg-primary text-primary-foreground">
                                        {sending ? 'Submitting...' : 'Submit Booking Request'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="py-16 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <AnimatedSection>
                            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                                Our Location
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">The Quill Restaurant & Accommodation</p>
                                        <p className="text-muted-foreground">Nambale, Kisumu - Busia Road</p>
                                        <p className="text-muted-foreground">Busia, Kenya</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-muted-foreground">0113 857846</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-muted-foreground">pomraningrichard@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                        <AnimatedSection delay={200}>
                            <Card className="overflow-hidden">
                                <iframe
                                    title="The Quill Restaurant Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d510.8547224932006!2d34.1069!3d0.0618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sC4XP%2BVH%20Busia!5e0!3m2!1sen!2ske!4v1708960000000!5m2!1sen!2ske"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '300px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </Card>
                        </AnimatedSection>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AccommodationPage;
