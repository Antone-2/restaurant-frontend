import { Calendar, Users, Gift, Music, Cake, Sparkles, Heart, HandHeart, Mic2, Wine, PartyPopper, Star, Clock, Ticket, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection } from "@/components/AnimatedSection";
import { specialEventsApi } from "@/services/api";
import heroImage from "@/assets/hero-restaurant.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import aboutImage from "@/assets/about-restaurant.jpg";

const isDev = import.meta.env.DEV;

// In development, use relative URL to leverage Vite proxy
// In production, use the configured VITE_API_URL
const getApiBaseUrl = () => {
    if (isDev) {
        return '/api';
    }
    const envUrl = import.meta.env.VITE_API_URL || '';
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Special events types
interface SpecialEvent {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    type: 'fundraiser' | 'live-music' | 'themed-night' | 'wine-tasting' | 'other';
    price: string;
    capacity: number;
    image: string;
    isUpcoming: boolean;
    organizer?: string;
    donationPercent?: number;
    isActive?: boolean;
}

// Sample upcoming special events
const upcomingSpecialEvents: SpecialEvent[] = [
    {
        id: '1',
        title: 'Jazz Night with Local Artists',
        description: 'Enjoy an evening of smooth jazz with talented local musicians. Complimentary appetizer plate included.',
        date: '2026-03-15',
        time: '7:00 PM',
        type: 'live-music',
        price: 'KES 2,500/person',
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
        isUpcoming: true,
        organizer: 'The Quill & Kisumu Arts Council'
    },
    {
        id: '2',
        title: 'Charity Fundraiser Dinner',
        description: 'Support St. Jude\'s Orphanage with a gourmet dinner. 20% of proceeds go to the charity.',
        date: '2026-03-22',
        time: '6:30 PM',
        type: 'fundraiser',
        price: 'KES 3,500/person',
        capacity: 80,
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        isUpcoming: true,
        organizer: "St. Jude's Orphanage",
        donationPercent: 20
    },
    {
        id: '3',
        title: 'Wine & Dine Evening',
        description: 'Explore a curated selection of wines paired with exquisite dishes from our chef.',
        date: '2026-03-29',
        time: '6:00 PM',
        type: 'wine-tasting',
        price: 'KES 4,500/person',
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        isUpcoming: true,
        organizer: 'The Quill Sommelier Club'
    },
    {
        id: '4',
        title: '80s Retro Night',
        description: 'Travel back in time with 80s hits, classic cocktails, and retro vibes!',
        date: '2026-04-05',
        time: '8:00 PM',
        type: 'themed-night',
        price: 'KES 1,500/person',
        capacity: 60,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
        isUpcoming: true,
        organizer: 'The Quill Entertainment'
    },
    {
        id: '5',
        title: 'Mother\'s Day Brunch Fundraiser',
        description: 'Treat mom to a special brunch while supporting local women entrepreneurs.',
        date: '2026-05-10',
        time: '11:00 AM',
        type: 'fundraiser',
        price: 'KES 2,000/person',
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1529335764857-3f5164c3f1ac?w=400',
        isUpcoming: true,
        organizer: 'Busia Women Business League',
        donationPercent: 15
    },
    {
        id: '6',
        title: 'Afrobeat Live Night',
        description: 'Experience the best of Afrobeat music with live performances from renowned artists.',
        date: '2026-04-12',
        time: '7:30 PM',
        type: 'live-music',
        price: 'KES 3,000/person',
        capacity: 75,
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
        isUpcoming: true,
        organizer: 'Kisumu Music Festival'
    },
    {
        id: '7',
        title: 'Sunset Cocktail Party',
        description: 'Enjoy signature cocktails and canapés as the sun sets over Lake Victoria.',
        date: '2026-04-20',
        time: '5:00 PM',
        type: 'other',
        price: 'KES 2,000/person',
        capacity: 40,
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
        isUpcoming: true,
        organizer: 'The Quill Bar'
    },
    {
        id: '8',
        title: 'Kenyan Cuisine Masterclass',
        description: 'Learn to cook traditional Kenyan dishes with our executive chef. Includes recipe booklet.',
        date: '2026-05-03',
        time: '10:00 AM',
        type: 'other',
        price: 'KES 5,000/person',
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
        isUpcoming: true,
        organizer: 'The Quill Culinary School'
    },
    {
        id: '9',
        title: 'Romantic Valentine\'s Dinner',
        description: 'A special 5-course dinner for couples with live violin music and champagne.',
        date: '2026-06-14',
        time: '7:00 PM',
        type: 'themed-night',
        price: 'KES 8,000/couple',
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        isUpcoming: true,
        organizer: 'The Quill Restaurant'
    }
];

const EventsPage = () => {
    const { toast } = useToast();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        date: "",
        guests: "",
        message: "",
    });

    const [activeTab, setActiveTab] = useState<'events' | 'special'>('events');

    // Special events state
    const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
    const [specialEventsLoading, setSpecialEventsLoading] = useState(true);
    const [specialEventsError, setSpecialEventsError] = useState<string | null>(null);

    // Fetch special events from API
    const fetchSpecialEvents = async () => {
        setSpecialEventsLoading(true);
        setSpecialEventsError(null);
        try {
            const data = await specialEventsApi.getAll({ upcoming: true });
            // Use API data directly - if empty, show empty state (not sample data)
            setSpecialEvents(data || []);
        } catch (err) {
            console.error('Error fetching special events:', err);
            setSpecialEventsError('Could not load events. Please try again later.');
            setSpecialEvents([]);
        } finally {
            setSpecialEventsLoading(false);
        }
    };

    // Fetch special events - using API now
    useEffect(() => {
        if (activeTab === 'special') {
            fetchSpecialEvents();
        }
    }, [activeTab]);

    const eventTypes = [
        {
            icon: Cake,
            title: "Birthday Parties",
            description: "Celebrate your special day with delicious food and a memorable atmosphere.",
            capacity: "10-50 guests",
        },
        {
            icon: Gift,
            title: "Baby Showers & Weddings",
            description: "From intimate gatherings to grand celebrations, we create magical moments.",
            capacity: "20-100 guests",
        },
        {
            icon: Music,
            title: "Corporate Events",
            description: "Professional spaces for business meetings, team dinners, and celebrations.",
            capacity: "10-80 guests",
        },
        {
            icon: Calendar,
            title: "Private Dining",
            description: "Exclusive use of our private dining room for intimate gatherings.",
            capacity: "8-30 guests",
        },
    ];

    const eventSpaces = [
        { name: "Main Dining Hall", image: heroImage },
        { name: "Private Room", image: aboutImage },
        { name: "Outdoor Terrace", image: dish1 },
        { name: "VIP Section", image: dish2 },
    ];
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const res = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    eventType: form.eventType,
                    date: form.date,
                    guests: parseInt(form.guests),
                    message: form.message
                })
            });

            if (res.ok) {
                toast({
                    title: "Inquiry Received!",
                    description: "Our events team will contact you within 24 hours.",
                });
                setForm({ name: "", email: "", phone: "", eventType: "", date: "", guests: "", message: "" });
            } else {
                const data = await res.json();
                toast({ title: "Failed to Submit", description: data.error || "Please try again", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Connection Error", description: err.message || "Could not connect", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    // Get event icon based on type
    const getEventIcon = (type: SpecialEvent['type']) => {
        switch (type) {
            case 'fundraiser': return Heart;
            case 'live-music': return Mic2;
            case 'wine-tasting': return Wine;
            case 'themed-night': return PartyPopper;
            default: return Star;
        }
    };

    // Get event badge color
    const getEventBadge = (type: SpecialEvent['type']) => {
        switch (type) {
            case 'fundraiser': return 'bg-red-500';
            case 'live-music': return 'bg-purple-500';
            case 'wine-tasting': return 'bg-indigo-500';
            case 'themed-night': return 'bg-pink-500';
            default: return 'bg-orange-500';
        }
    };

    // Determine what to show in the events grid
    const renderEventsGrid = () => {
        if (specialEventsLoading) {
            return (
                <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        if (specialEventsError) {
            return (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>Unable to load events. Please try again later.</p>
                </div>
            );
        }
        if (specialEvents.length === 0) {
            return (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>No upcoming special events at the moment. Check back soon!</p>
                </div>
            );
        }
        return specialEvents.map((event, index) => (
            <AnimatedSection key={event.id} delay={index * 100}>
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold ${getEventBadge(event.type)}`}>
                            {event.type === 'fundraiser' && <><HandHeart className="inline w-3 h-3 mr-1" /> Fundraiser</>}
                            {event.type === 'live-music' && <><Mic2 className="inline w-3 h-3 mr-1" /> Live Music</>}
                            {event.type === 'wine-tasting' && <><Wine className="inline w-3 h-3 mr-1" /> Wine Tasting</>}
                            {event.type === 'themed-night' && <><PartyPopper className="inline w-3 h-3 mr-1" /> Themed Night</>}
                        </div>
                        {event.donationPercent && (
                            <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 rounded-full text-white text-xs font-bold flex items-center">
                                <Gift className="inline w-3 h-3 mr-1" /> {event.donationPercent}% to Charity
                            </div>
                        )}
                    </div>
                    <CardContent className="p-6">
                        <h3 className="font-display font-bold text-lg text-foreground mb-2">
                            {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {event.description}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {event.capacity} max
                            </span>
                        </div>

                        {event.organizer && (
                            <p className="text-xs text-muted-foreground mb-4">
                                Organized by: <span className="font-medium text-foreground">{event.organizer}</span>
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-4">
                            <div>
                                <span className="text-lg font-bold text-primary">{event.price}</span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    className="bg-primary flex-1 sm:flex-none"
                                    onClick={() => {
                                        setForm({
                                            ...form,
                                            eventType: event.type === 'fundraiser' ? 'fundraiser' :
                                                event.type === 'live-music' ? 'private' :
                                                    event.type === 'wine-tasting' ? 'private' : 'private',
                                            message: `I'm interested in booking: ${event.title} on ${new Date(event.date).toLocaleDateString('en-GB')} at ${event.time}`
                                        });
                                        setActiveTab('events');
                                        setTimeout(() => {
                                            document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }}
                                >
                                    <Ticket className="w-4 h-4 mr-1" /> Book Now
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedSection>
        ));
    };

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <section className="relative py-20 bg-secondary">
                <div className="absolute inset-0 opacity-10">
                    <Sparkles className="w-full h-full" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Events & Private Dining
                    </h1>
                    <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
                        Create unforgettable memories at The Quill - from special celebrations to unique experiences
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="py-8 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-4 sm:px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center ${activeTab === 'events'
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'bg-white text-muted-foreground hover:bg-gray-100'
                                }`}
                        >
                            <Calendar className="inline-block w-5 h-5 mr-2" />
                            Private Events
                        </button>
                        <button
                            onClick={() => setActiveTab('special')}
                            className={`px-4 sm:px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center ${activeTab === 'special'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                : 'bg-white text-muted-foreground hover:bg-gray-100'
                                }`}
                        >
                            <Star className="inline-block w-5 h-5 mr-2" />
                            Special Events
                        </button>
                    </div>
                </div>
            </section>

            {activeTab === 'special' ? (
                /* Special Events Section */
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <AnimatedSection>
                            <div className="text-center mb-12">
                                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                    Upcoming Special Events
                                </h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    Join us for unique experiences - from live music nights to charity fundraisers
                                </p>
                            </div>
                        </AnimatedSection>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderEventsGrid()}
                        </div>

                        {/* Fundraiser CTA */}
                        <div className="mt-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                        <Heart className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Host Your Fundraiser</h3>
                                        <p className="text-white/80">Partner with us to support your cause</p>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => {
                                        setActiveTab('events');
                                        setForm({ ...form, eventType: 'fundraiser' });
                                        setTimeout(() => {
                                            document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }}
                                >
                                    Start Planning
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    <section className="py-16">
                        <div className="container mx-auto px-4">
                            <AnimatedSection>
                                <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Our Event Services</h2>
                            </AnimatedSection>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {eventTypes.map((event, index) => (
                                    <AnimatedSection key={event.title} delay={index * 100}>
                                        <Card className="h-full border-primary/10 bg-card hover:shadow-xl transition-all">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <event.icon className="text-primary" size={28} />
                                                </div>
                                                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{event.title}</h3>
                                                <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
                                                <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
                                                    <Users size={14} /> {event.capacity}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-16 bg-muted">
                        <div className="container mx-auto px-4">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <AnimatedSection>
                                    <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Host With Us?</h2>
                                    <ul className="space-y-4">
                                        {["Customizable menu options", "Professional event planning", "Beautiful ambiance", "Flexible seating", "AV equipment available", "Ample parking"].map((item) => (
                                            <li key={item} className="flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AnimatedSection>
                                <AnimatedSection delay={200} id="event-form">
                                    <Card className="border-primary/20">
                                        <CardContent className="p-6 sm:p-8">
                                            <h3 className="font-display text-2xl font-bold text-card-foreground mb-6 text-center">Request a Quote</h3>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background" />
                                                    <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-background" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="bg-background" />
                                                    <Input type="number" placeholder="Guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} required className="bg-background" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                        <option value="">Select type</option>
                                                        <option value="birthday">Birthday</option>
                                                        <option value="wedding">Wedding</option>
                                                        <option value="corporate">Corporate</option>
                                                        <option value="private">Private</option>
                                                        <option value="fundraiser">Fundraiser</option>
                                                    </select>
                                                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="bg-background" />
                                                </div>
                                                <Textarea placeholder="Your requirements..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-background" rows={3} />
                                                <Button type="submit" disabled={sending} className="w-full bg-primary text-primary-foreground">{sending ? 'Submitting...' : 'Submit Inquiry'}</Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </AnimatedSection>
                            </div>
                        </div>
                    </section>

                    <section className="py-16">
                        <div className="container mx-auto px-4">
                            <AnimatedSection>
                                <h2 className="font-display text-3xl font-bold text-center text-foreground mb-4">Our Event Spaces</h2>
                                <p className="text-center text-muted-foreground mb-10">Versatile venues for any occasion</p>
                            </AnimatedSection>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {eventSpaces.map((space, index) => (
                                    <AnimatedSection key={space.name} delay={index * 100}>
                                        <div className="group relative aspect-square rounded-lg overflow-hidden">
                                            <img src={space.image} alt={space.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <p className="text-white font-semibold">{space.name}</p>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default EventsPage;
