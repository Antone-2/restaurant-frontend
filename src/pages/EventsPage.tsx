import { Calendar, Users, Gift, Music, Cake, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection } from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-restaurant.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import aboutImage from "@/assets/about-restaurant.jpg";

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
            const res = await fetch('http://localhost:3001/api/events', {
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
                        Create unforgettable memories at The Quill.
                    </p>
                </div>
            </section>

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
                        <AnimatedSection delay={200}>
                            <Card className="border-primary/20">
                                <CardContent className="p-8">
                                    <h3 className="font-display text-2xl font-bold text-card-foreground mb-6 text-center">Request a Quote</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background" />
                                            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-background" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="bg-background" />
                                            <Input type="number" placeholder="Guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} required className="bg-background" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option value="">Select type</option>
                                                <option value="birthday">Birthday</option>
                                                <option value="wedding">Wedding</option>
                                                <option value="corporate">Corporate</option>
                                                <option value="private">Private</option>
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
        </main>
    );
};

export default EventsPage;
