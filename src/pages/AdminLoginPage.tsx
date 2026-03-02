import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

const ADMIN_EMAILS = ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'];

export function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('pomraningrichard@gmail.com');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate admin email
            if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
                setError('❌ Not an admin account. Only admin users can access this panel.');
                setIsLoading(false);
                return;
            }

            console.log('Attempting admin login...');

            // Attempt login
            const response = await login(email, password);
            console.log('Login response:', response);

            // Check if user is actually admin
            if (!response?.user || !['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'].includes(response.user.email)) {
                setError('❌ Not authorized as admin. Please use an admin account.');
                setIsLoading(false);
                return;
            }

            console.log('Admin verified, redirecting to /admin');
            // Success - redirect to admin dashboard
            // Add a small delay to ensure state updates are applied
            setTimeout(() => {
                navigate('/admin');
            }, 100);
        } catch (err: any) {
            const message = err?.message || 'Login failed';
            console.error('Admin login error:', message);

            if (message.includes('invalid') || message.includes('incorrect') || message.includes('401') || message.includes('Unauthorized')) {
                setError('❌ Invalid email or password');
            } else if (message.includes('not found') || message.includes('404')) {
                setError('❌ Admin account not found. Please register first.');
            } else {
                setError(`❌ ${message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-md">
                    {/* Header */}
                    <CardHeader className="text-center border-b border-slate-700/50">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-600 rounded-full">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
                        <CardDescription className="text-slate-400">
                            Authorized personnel only
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/20 border-red-600/30 text-red-300">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="admin-email" className="block text-sm font-medium text-white">
                                    Admin Email
                                </label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    placeholder="admin@thequill.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="admin-password" className="block text-sm font-medium text-white">
                                    Password
                                </label>
                                <Input
                                    id="admin-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                    required
                                />
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                onClick={handleLogin}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                {isLoading ? 'Authenticating...' : 'Login to Admin Panel'}
                            </Button>

                            {/* Info Box */}
                            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                <p className="text-xs text-blue-300">
                                    <strong>Demo Admin:</strong><br />
                                    Email: pomraningrichard@gmail.com<br />
                                    Password: Texas99$
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Text */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    🔒 This panel is restricted to authorized administrators only
                </p>
            </div>
        </div>
    );
}

export default AdminLoginPage;
