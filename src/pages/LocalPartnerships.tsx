import React, { useState, useEffect } from 'react';
import {
    Building2, Users, GraduationCap, Heart, Music, Calendar,
    ChevronRight, CheckCircle, Star, Phone, Mail, MapPin,
    Clock, PartyPopper, Gift, HandHeart, Briefcase, UtensilsCrossed
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiBaseUrl';
import { adminApi } from '@/services/api';

// Partnership types
export interface PartnershipType {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    benefits: string[];
    minPeople: number;
    maxPeople: number;
    priceRange: string;
    color: string;
}

// Partnership data from database
interface DbPartnership {
    _id: string;
    name: string;
    organization: string;
    type: string;
    category: string;
    status: string;
    yearsActive: number;
    minPeople: number;
    maxPeople: number;
    email: string;
    phone: string;
    contactPerson: string;
    description: string;
    benefits?: string[];
    priceRange?: string;
}

// Event types with categories
export interface EventCategory {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    features: string[];
}

// Partnership types available
const partnershipTypes: PartnershipType[] = [
    {
        id: 'corporate',
        name: 'Corporate Office Catering',
        icon: Building2,
        description: 'Professional catering solutions for offices, meetings, and corporate events',
        benefits: [
            'Dedicated account manager',
            'Flexible delivery schedules',
            'Corporate menu options',
            'Monthly billing available',
            'Staff training sessions',
            'Board meeting packages'
        ],
        minPeople: 10,
        maxPeople: 500,
        priceRange: 'KES 800 - KES 5,000/person',
        color: 'blue'
    },
    {
        id: 'schools',
        name: 'School & Institution Catering',
        icon: GraduationCap,
        description: 'Nutritious meals for schools, universities, and educational institutions',
        benefits: [
            'Nutritional planning',
            'Student-friendly menus',
            'Cafeteria management',
            'Event catering',
            'Sports day catering',
            'Parent-teacher events'
        ],
        minPeople: 20,
        maxPeople: 1000,
        priceRange: 'KES 500 - KES 2,500/person',
        color: 'green'
    },
    {
        id: 'events',
        name: 'Event Catering',
        icon: PartyPopper,
        description: 'Full-service catering for weddings, birthdays, and special occasions',
        benefits: [
            'Custom menu planning',
            'Full service staff',
            'Equipment rental',
            'Bar services',
            'Cake service',
            'Photography coordination'
        ],
        minPeople: 30,
        maxPeople: 500,
        priceRange: 'KES 1,500 - KES 10,000/person',
        color: 'purple'
    },
    {
        id: 'fundraiser',
        name: 'Fundraiser Support',
        icon: Heart,
        description: 'Support for charity events, fundraisers, and community causes',
        benefits: [
            'Discounted rates',
            'Community support',
            'Silent auction items',
            'Volunteer feeding',
            'Flexible payment',
            'Promotion support'
        ],
        minPeople: 25,
        maxPeople: 300,
        priceRange: 'KES 700 - KES 3,000/person',
        color: 'red'
    }
];

// Event categories
const eventCategories: EventCategory[] = [
    {
        id: 'fundraiser',
        name: 'Fundraiser Nights',
        icon: HandHeart,
        description: 'Host your charity event and make a difference in the community',
        features: [
            'Percentage of sales donated',
            'Live auction support',
            'Live entertainment',
            'Media promotion',
            'Custom decorations',
            'Dedicated staff'
        ]
    },
    {
        id: 'live-music',
        name: 'Live Music Nights',
        icon: Music,
        description: 'Enjoy local talent while dining with us',
        features: [
            'Local band performances',
            'Jazz nights',
            'Acoustic sessions',
            'Themed music nights',
            'Special menu items',
            'Reserved seating'
        ]
    },
    {
        id: 'private-dining',
        name: 'Private Dining',
        icon: UtensilsCrossed,
        description: 'Exclusive use of our venue for your special occasions',
        features: [
            'Private room access',
            'Customizable menu',
            'Dedicated service team',
            'AV equipment',
            'Flexible timing',
            'Custom decorations'
        ]
    }
];

// Local partnership showcase
const localPartners = [
    { name: 'Kisumu General Hospital', type: 'Healthcare', years: 3 },
    { name: 'St. Mary\'s Primary School', type: 'Education', years: 5 },
    { name: 'Busia County Government', type: 'Government', years: 2 },
    { name: 'Kisumu Chamber of Commerce', type: 'Business', years: 4 },
    { name: 'St. Jude\'s Orphanage', type: 'Charity', years: 3 }
];

interface LocalPartnershipsProps {
    variant?: 'full' | 'compact';
}

export const LocalPartnerships: React.FC<LocalPartnershipsProps> = ({ variant = 'full' }) => {
    const { toast } = useToast();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [sending, setSending] = useState(false);
    const [partnerships, setPartnerships] = useState<DbPartnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        eventType: '',
        guests: '',
        date: '',
        message: ''
    });

    const selectedPartnership = partnershipTypes.find(p => p.id === selectedType);

    // Fetch partnerships from API on mount
    useEffect(() => {
        const fetchPartnerships = async () => {
            try {
                const data = await adminApi.getPublicPartnerships();
                if (data.partnerships && Array.isArray(data.partnerships)) {
                    setPartnerships(data.partnerships);
                }
            } catch (error) {
                console.error('Failed to fetch partnerships:', error);
                // Fall back to hardcoded data on error
            } finally {
                setLoading(false);
            }
        };
        fetchPartnerships();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const res = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    eventType: formData.eventType,
                    date: formData.date,
                    guests: parseInt(formData.guests),
                    message: `${formData.message}\n\nOrganization: ${formData.organization}\nPartnership Type: ${selectedPartnership?.name || 'Not selected'}`
                })
            });

            if (res.ok) {
                toast({
                    title: "Quote Request Received!",
                    description: "Our events team will contact you within 24 hours.",
                });
                setFormData({ name: '', email: '', phone: '', organization: '', eventType: '', guests: '', date: '', message: '' });
                setShowForm(false);
                setSelectedType(null);
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

    if (variant === 'compact') {
        return (
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Business Partnerships</h3>
                        <p className="text-white/80 text-sm">Catering & events</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {partnershipTypes.slice(0, 3).map((type) => (
                        <Link
                            key={type.id}
                            to={`/partnerships?type=${type.id}`}
                            className="flex items-center justify-between p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <span className="text-sm">{type.name}</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ))}
                </div>

                <Link
                    to="/partnerships"
                    className="block w-full text-center py-2 bg-white text-orange-600 rounded-lg font-medium"
                >
                    Learn More
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Local Partnerships & Business Catering
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Partner with The Quill for exceptional catering services. From corporate events
                    to school functions, we bring quality dining to every occasion.
                </p>
            </div>

            {/* Partnership Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {partnershipTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-6 rounded-xl text-left transition-all hover:shadow-lg ${selectedType === type.id
                            ? 'bg-orange-600 text-white shadow-lg'
                            : 'bg-white border border-gray-200 hover:border-orange-300'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${selectedType === type.id ? 'bg-white/20' : 'bg-orange-100'
                            }`}>
                            <type.icon className={`w-6 h-6 ${selectedType === type.id ? 'text-white' : 'text-orange-600'}`} />
                        </div>
                        <h3 className={`font-bold mb-2 ${selectedType === type.id ? 'text-white' : 'text-gray-900'}`}>
                            {type.name}
                        </h3>
                        <p className={`text-sm ${selectedType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {type.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Selected Partnership Details */}
            {selectedPartnership && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 animate-fadeIn">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {selectedPartnership.name}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {selectedPartnership.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Minimum</p>
                                    <p className="font-bold text-gray-900">{selectedPartnership.minPeople}+ guests</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Maximum</p>
                                    <p className="font-bold text-gray-900">{selectedPartnership.maxPeople}+ guests</p>
                                </div>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4">
                                <p className="text-sm text-orange-600 mb-1">Starting from</p>
                                <p className="text-2xl font-bold text-orange-600">{selectedPartnership.priceRange}</p>
                            </div>
                        </div>

                        <div className="lg:w-1/3">
                            <h3 className="font-bold text-gray-900 mb-4">What's Included</h3>
                            <ul className="space-y-3">
                                {selectedPartnership.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600">{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    setFormData({ ...formData, eventType: selectedPartnership?.id || '' });
                                    setShowForm(true);
                                }}
                                className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Request Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Request Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Request a Quote</h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                                        <Input
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                        <Input
                                            placeholder="Company/School Name"
                                            value={formData.organization}
                                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <Input
                                            type="email"
                                            placeholder="john@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                        <Input
                                            type="tel"
                                            placeholder="0113 857846"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Type</label>
                                        <select
                                            value={formData.eventType}
                                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Select type</option>
                                            <option value="corporate">Corporate Office Catering</option>
                                            <option value="schools">School & Institution Catering</option>
                                            <option value="events">Event Catering</option>
                                            <option value="fundraiser">Fundraiser Support</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Guests *</label>
                                        <Input
                                            type="number"
                                            placeholder="50"
                                            value={formData.guests}
                                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requirements</label>
                                    <Textarea
                                        placeholder="Tell us about your event needs, dietary requirements, budget, etc."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                >
                                    {sending ? 'Submitting...' : 'Submit Quote Request'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Categories */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Special Event Nights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {eventCategories.map((category) => (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                                <category.icon className="w-10 h-10 mb-3" />
                                <h3 className="text-xl font-bold">{category.name}</h3>
                                <p className="text-white/80 text-sm mt-2">{category.description}</p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-2">
                                    {category.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Star className="w-4 h-4 text-orange-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Local Partners Showcase */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Trusted by Local Organizations
                </h2>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-gray-200 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : partnerships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {partnerships.slice(0, 6).map((partner) => (
                            <div key={partner._id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{partner.name}</p>
                                    <p className="text-sm text-gray-500">{partner.category || partner.type} • {partner.yearsActive || 1}+ years</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {localPartners.map((partner, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{partner.name}</p>
                                    <p className="text-sm text-gray-500">{partner.type} • {partner.years}+ years</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 md:p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to Partner With Us?</h3>
                        <p className="text-white/80">Contact our events team for a customized quote</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a
                            href="tel:+254700000000"
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                            Call Us
                        </a>
                        <a
                            href="mailto:events@thequill.com"
                            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            Email Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocalPartnerships;
