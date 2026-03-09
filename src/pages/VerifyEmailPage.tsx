import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                if (!token) {
                    setStatus('error');
                    setMessage('❌ No verification token provided. Please check your email link.');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify email. Please try again.');
                    return;
                }

                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'An error occurred during verification. Please try again.');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>Verifying your email address</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'loading' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                            <p className="text-gray-600">Verifying your email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <Alert className="bg-green-900/20 border-green-600/30 text-green-300">
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                            <p className="text-sm text-gray-600">Redirecting to login...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <Alert variant="destructive">
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Go to Login
                                </Button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Register Again
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default VerifyEmailPage;