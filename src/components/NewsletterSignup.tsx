import React, { useState } from 'react';
import { Mail, Gift, Cake, Calendar, Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { subscribersApi } from '../services/api';

interface NewsletterSignupProps {
    variant?: 'inline' | 'modal' | 'footer';
    onSuccess?: () => void;
    showBenefits?: boolean;
}

const benefits = [
    { icon: Gift, text: 'Exclusive deals & discounts' },
    { icon: Cake, text: 'Special birthday offers' },
    { icon: Calendar, text: 'Seasonal menu announcements' },
    { icon: Bell, text: 'Event invitations' }
];

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
    variant = 'inline',
    onSuccess,
    showBenefits = true
}) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus('error');
            setMessage('Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Subscribe the user with all collected data
            await subscribersApi.subscribe({
                email,
                name: name || undefined,
                birthday: birthday || undefined,
                phone: phone || undefined
            });

            setStatus('success');
            setMessage('Welcome to The Quill! Check your email for your special offer 🎉');
            setEmail('');
            setName('');
            setBirthday('');
            setPhone('');

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to subscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyles = {
        inline: 'bg-white rounded-lg shadow-md p-6',
        modal: 'bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white',
        footer: 'bg-transparent'
    };

    const inputStyles = {
        inline: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors',
        modal: 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors backdrop-blur-sm',
        footer: 'w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-800 text-white'
    };

    return (
        <div className={containerStyles[variant]}>
            {variant === 'modal' && (
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
                        <Mail className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Stay Updated!</h3>
                    <p className="text-gray-300">
                        Subscribe to receive exclusive offers, seasonal menus, and event invitations
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {variant !== 'modal' && (
                    <div>
                        <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name (Optional)
                        </label>
                        <div className="relative">
                            <input
                                id="newsletter-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className={inputStyles[variant]}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="newsletter-email" className={`block text-sm font-medium mb-1 ${variant === 'modal' ? 'text-white' : 'text-gray-700'}`}>
                        Email Address *
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 ${variant === 'modal' ? 'text-gray-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                            id="newsletter-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                            className={`${inputStyles[variant]} pl-10`}
                        />
                    </div>
                </div>

                {variant === 'modal' && (
                    <>
                        <div>
                            <label htmlFor="newsletter-name-modal" className="block text-sm font-medium text-white mb-1">
                                Name (Optional)
                            </label>
                            <input
                                id="newsletter-name-modal"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className={inputStyles[variant]}
                            />
                        </div>

                        <div>
                            <label htmlFor="newsletter-birthday" className="block text-sm font-medium text-white mb-1">
                                🎂 Birthday (Optional)
                            </label>
                            <p className="text-xs text-gray-400 mb-2">Get a special birthday discount!</p>
                            <input
                                id="newsletter-birthday"
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className={inputStyles[variant]}
                            />
                        </div>
                    </>
                )}

                {!variant.includes('footer') && showBenefits && (
                    <div className={`rounded-lg p-4 ${variant === 'modal' ? 'bg-white/5' : 'bg-orange-50'}`}>
                        <h4 className={`text-sm font-semibold mb-3 ${variant === 'modal' ? 'text-orange-400' : 'text-orange-800'}`}>
                            What you'll get:
                        </h4>
                        <div className="space-y-2">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <benefit.icon className={`w-4 h-4 ${variant === 'modal' ? 'text-orange-400' : 'text-orange-600'}`} />
                                    <span className={`text-sm ${variant === 'modal' ? 'text-gray-300' : 'text-orange-700'}`}>
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${variant === 'modal'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subscribing...
                        </>
                    ) : (
                        <>
                            <Gift className="w-5 h-5" />
                            Subscribe & Get 10% Off
                        </>
                    )}
                </button>

                <p className={`text-xs text-center ${variant === 'modal' ? 'text-gray-400' : 'text-gray-500'}`}>
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </form>
        </div>
    );
};

// Compact footer version
export const NewsletterSignupCompact: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setIsLoading(true);
        setStatus('idle');

        try {
            await subscribersApi.subscribe({
                email,
                name: undefined,
                birthday: undefined,
                phone: undefined
            });
            setStatus('success');
            setMessage('Thanks for subscribing!');
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to subscribe');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isLoading ? '...' : 'Subscribe'}
            </button>
        </form>
    );
};

export default NewsletterSignup;
