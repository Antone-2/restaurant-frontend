import { z } from 'zod';
const kenyanPhoneRegex = /^(\+254|254|0)(7|1)\d{8}$/;
const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});
export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number (e.g., +254712345678)'
        ),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .refine(
            (val) => passwordStrengthRegex.test(val),
            'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
        ),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
});
export const checkoutSchema = z.object({
    customerName: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .refine(
            (val) => kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number (e.g., +254712345678)'
        ),
    address: z.string().optional(),
    notes: z.string().optional(),
    orderType: z.enum(['delivery', 'takeaway', 'dine-in']),
    paymentMethod: z.enum(['mpesa', 'cash']),
}).refine(
    (data) => {
        if (data.orderType === 'delivery' && !data.address) {
            return false;
        }
        return true;
    },
    {
        message: 'Delivery address is required for delivery orders',
        path: ['address'],
    }
);
export const tableReservationSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .refine(
            (val) => kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number (e.g., +254712345678)'
        ),
    date: z.date({
        required_error: 'Please select a date',
        invalid_type_error: 'Invalid date',
    }),
    time: z.string().min(1, 'Please select a time slot'),
    guests: z
        .number()
        .min(1, 'At least 1 guest is required')
        .max(20, 'Maximum 20 guests per reservation'),
    tableId: z.string().min(1, 'Please select a table'),
    specialRequests: z.string().optional(),
});
export const parkingReservationSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .refine(
            (val) => kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number (e.g., +254712345678)'
        ),
    vehiclePlate: z
        .string()
        .min(1, 'Vehicle plate number is required')
        .min(5, 'Please enter a valid plate number'),
    entryTime: z.date({
        required_error: 'Entry time is required',
        invalid_type_error: 'Invalid entry time',
    }),
    exitTime: z.date({
        required_error: 'Exit time is required',
        invalid_type_error: 'Invalid exit time',
    }),
}).refine((data) => data.exitTime > data.entryTime, {
    message: 'Exit time must be after entry time',
    path: ['exitTime'],
});
export const contactSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number'
        ),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .min(5, 'Subject must be at least 5 characters')
        .max(200, 'Subject must be less than 200 characters'),
    message: z
        .string()
        .min(1, 'Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be less than 2000 characters'),
});
export const reviewSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    rating: z
        .number()
        .min(1, 'Please select a rating')
        .max(5, 'Rating must be between 1 and 5'),
    comment: z
        .string()
        .min(1, 'Please write a review')
        .min(10, 'Review must be at least 10 characters')
        .max(500, 'Review must be less than 500 characters'),
    orderId: z.string().optional(),
});
export const eventSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .refine(
            (val) => kenyanPhoneRegex.test(val),
            'Please enter a valid Kenyan phone number'
        ),
    eventType: z
        .string()
        .min(1, 'Event type is required'),
    eventDate: z.date({
        required_error: 'Event date is required',
        invalid_type_error: 'Invalid event date',
    }),
    guestCount: z
        .number()
        .min(1, 'At least 1 guest is required')
        .max(500, 'Maximum 500 guests'),
    message: z
        .string()
        .min(1, 'Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters'),
});
export const subscriptionSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type TableReservationInput = z.infer<typeof tableReservationSchema>;
export type ParkingReservationInput = z.infer<typeof parkingReservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export function formatZodError(error: z.ZodError): string {
    return error.errors
        .map((err) => {
            const path = err.path.join('.');
            return `${path ? path + ': ' : ''}${err.message}`;
        })
        .join('\n');
}
