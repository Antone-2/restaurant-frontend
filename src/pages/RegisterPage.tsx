import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validation';
import { useState } from 'react';

const ADMIN_EMAILS = ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'];

export function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [apiError, setApiError] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            passwordConfirm: '',
        },
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            setApiError('');
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone
            });

            // Always redirect to login after registration
            // User must verify email first via the link sent to their email
            navigate(`/login?registered=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            const errorMessage = error?.message || 'Registration failed';
            console.error('Registration error:', errorMessage);

            // Handle duplicate email error specifically
            if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('409')) {
                setError('email', {
                    type: 'manual',
                    message: 'Email already registered. Please use another email or login.'
                });
                setApiError('This email is already registered. Please login or use a different email.');
            } else {
                setApiError(errorMessage);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Join The Quill restaurant</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {apiError && (
                            <Alert variant="destructive">
                                <AlertDescription>{apiError}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter Your Name"
                                {...register('name')}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                            />
                            {errors.name && (
                                <p id="name-error" className="text-sm text-red-500 mt-1" role="alert">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone (Optional)</label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Phone Number (optional)"
                                {...register('phone')}
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? 'phone-error' : undefined}
                            />
                            {errors.phone && (
                                <p id="phone-error" className="text-sm text-red-500 mt-1" role="alert">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                            <PasswordInput
                                id="password"
                                placeholder="Create a password"
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

                        <div>
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">Confirm Password</label>
                            <PasswordInput
                                id="passwordConfirm"
                                placeholder="Confirm your password"
                                {...register('passwordConfirm')}
                                aria-invalid={!!errors.passwordConfirm}
                                aria-describedby={errors.passwordConfirm ? 'passwordConfirm-error' : undefined}
                            />
                            {errors.passwordConfirm && (
                                <p id="passwordConfirm-error" className="text-sm text-red-500 mt-1" role="alert">
                                    {errors.passwordConfirm.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating account...' : 'Create Account'}
                        </Button>

                        <p className="text-sm text-center text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
