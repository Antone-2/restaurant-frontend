import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validation';
import { useState } from 'react';

const ADMIN_EMAILS = ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'];

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string>('');
    const registeredEmail = searchParams.get('registered');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: registeredEmail || '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginInput) => {
        try {
            setError('');
            const response = await login(data.email, data.password);

            // Check if user is admin and redirect accordingly
            if (response?.user?.email && ADMIN_EMAILS.includes(response.user.email)) {
                console.log('Admin user detected, redirecting to /admin');
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const message = err?.message || 'Login failed';
            // Check if it's a verification error (403)
            if (message.includes('verify') || message.includes('verified') || message.includes('403')) {
                setError('📧 Please verify your email first. Check your inbox for the verification link.');
            } else {
                setError(message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login to The Quill</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {registeredEmail && (
                            <Alert className="bg-blue-900/20 border-blue-600/30 text-blue-300">
                                <AlertDescription>
                                    📧 Welcome! Please check your email to verify your account before logging in.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {errors.root && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.root.message}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Your email address"
                                {...register('email')}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {errors.email && (
                                <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                            <PasswordInput
                                id="password"
                                placeholder="Enter your password"
                                {...register('password')}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                            {errors.password && (
                                <p id="password-error" className="text-sm text-red-500 mt-1" role="alert">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 hover:underline">
                                    Register here
                                </Link>
                            </p>
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
