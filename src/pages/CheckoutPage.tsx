import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCartPersistence } from "@/hooks/useCartPersistence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, paymentApi } from "@/services/api";
import { Trash2, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentStatusModal from "@/components/PaymentStatusModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutInput } from "@/lib/validation";

const CheckoutPage = () => {
    const { items, total, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const {
        cart: persistedCart,
        updateCartMetadata,
        clearCart: clearPersistedCart
    } = useCartPersistence();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [orderType, setOrderType] = useState<"delivery" | "takeaway" | "dine-in">("delivery");
    const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash">("mpesa");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState<{
        orderId: string;
        amount: number;
        phoneNumber: string;
        customerEmail?: string;
        customerName?: string;
        mpesaRequestId?: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CheckoutInput>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: user?.name || "",
            email: user?.email || "",
            phone: "",
            address: "",
            notes: "",
            orderType: "delivery",
            paymentMethod: "mpesa",
        },
    });

    const watchedOrderType = watch("orderType");

    if (items.length === 0) {
        return (
            <main className="pt-20 pb-16 min-h-screen bg-background">
                <div className="container mx-auto px-4 text-center py-12">
                    <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
                    <p className="text-muted-foreground mb-8">Add items from the menu to get started</p>
                    <Button onClick={() => navigate("/menu")}>Continue Shopping</Button>
                </div>
            </main>
        );
    }

    const onSubmit = async (data: CheckoutInput) => {
        if (data.paymentMethod === "mpesa") {
            await handleMpesaPayment(data);
        } else {
            await handleCashPayment(data);
        }
    };

    const handleMpesaPayment = async (data: CheckoutInput) => {
        if (!data.phone) {
            toast({
                title: "Phone Number Required",
                description: "Enter your phone number for M-Pesa payment",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // Sync cart metadata to database if authenticated
            if (isAuthenticated) {
                await updateCartMetadata({
                    orderType: data.orderType as "dinein" | "takeaway" | "delivery",
                    selectedAddress: data.address,
                    notes: data.notes
                });
            }

            const orderData = {
                customerName: data.customerName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                notes: data.notes,
                items: items.map((item) => ({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                })),
                total: total,
                orderType: data.orderType,
                paymentMethod: "mpesa",
                status: "pending",
                paymentStatus: "pending"
            };

            const orderResponse = await ordersApi.create(orderData);
            const orderId = orderResponse.orderId;

            let formattedPhone = data.phone.replace(/\D/g, '');
            if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
                formattedPhone = '254' + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('254')) {
                formattedPhone = '254' + formattedPhone;
            }

            const paymentResponse = await paymentApi.initiateMpesa({
                orderId: orderId,
                phoneNumber: formattedPhone,
                amount: total,
                customerEmail: data.email,
                customerName: data.customerName
            });

            if (paymentResponse.success) {
                setPaymentData({
                    orderId: orderId,
                    amount: total,
                    phoneNumber: formattedPhone,
                    customerEmail: data.email,
                    customerName: data.customerName,
                    mpesaRequestId: paymentResponse.mpesaRequestId
                });
                setShowPaymentModal(true);

                // Clear both local and persisted carts after successful order
                clearCart();
                if (isAuthenticated) {
                    await clearPersistedCart();
                }
            } else {
                toast({
                    title: "Payment Failed",
                    description: paymentResponse.error || "Could not initiate payment",
                    variant: "destructive"
                });
            }
        } catch (err: any) {
            toast({
                title: "Payment Failed",
                description: err.message || "Could not initiate payment",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCashPayment = async (data: CheckoutInput) => {
        setLoading(true);
        try {
            // Sync cart metadata to database if authenticated
            if (isAuthenticated) {
                await updateCartMetadata({
                    orderType: data.orderType as "dinein" | "takeaway" | "delivery",
                    selectedAddress: data.address,
                    notes: data.notes
                });
            }

            const orderData = {
                customerName: data.customerName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                notes: data.notes,
                items: items.map((item) => ({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                })),
                total: total,
                orderType: data.orderType,
                paymentMethod: "cash",
                status: "pending"
            };

            const order = await ordersApi.create(orderData);

            toast({
                title: "Order Confirmed",
                description: "Your order has been placed successfully",
            });

            // Clear both local and persisted carts
            clearCart();
            if (isAuthenticated) {
                await clearPersistedCart();
            }

            setTimeout(() => {
                navigate(`/orders/${order._id}`);
            }, 2000);
        } catch (err: any) {
            toast({
                title: "Order Failed",
                description: err.message || "Could not create order",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <PaymentStatusModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    navigate(`/orders/${paymentData?.orderId}`);
                }}
                orderId={paymentData?.orderId || ""}
                amount={paymentData?.amount || 0}
                phoneNumber={paymentData?.phoneNumber || ""}
                customerEmail={paymentData?.customerEmail}
                customerName={paymentData?.customerName}
                mpesaRequestId={paymentData?.mpesaRequestId}
            />

            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="font-display text-4xl font-bold mb-10">Checkout</h1>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center pb-3 border-b">
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                                    <span>Total:</span>
                                    <span className="text-primary">Ksh {total.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Order Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {(["delivery", "takeaway", "dine-in"] as const).map((type) => (
                                        <Button
                                            key={type}
                                            variant={watchedOrderType === type ? "default" : "outline"}
                                            onClick={() => {
                                                setOrderType(type);
                                                setValue("orderType", type);
                                            }}
                                            className="capitalize"
                                            type="button"
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Your Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label htmlFor="customerName" className="block text-sm font-medium mb-2">Full Name *</label>
                                        <Input
                                            id="customerName"
                                            placeholder="Full Name *"
                                            {...register("customerName")}
                                            aria-invalid={!!errors.customerName}
                                        />
                                        {errors.customerName && (
                                            <p className="text-sm text-red-500 mt-1" role="alert">
                                                {errors.customerName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email *</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Email *"
                                            {...register("email")}
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500 mt-1" role="alert">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone *</label>
                                        <div className="flex gap-2">
                                            <span className="flex items-center text-muted-foreground">+254</span>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="Phone Number *"
                                                {...register("phone")}
                                                aria-invalid={!!errors.phone}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-500 mt-1" role="alert">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    {watchedOrderType === "delivery" && (
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium mb-2">Delivery Address *</label>
                                            <Input
                                                id="address"
                                                placeholder="Delivery Address *"
                                                {...register("address")}
                                                aria-invalid={!!errors.address}
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-500 mt-1" role="alert">
                                                    {errors.address.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <Textarea
                                        placeholder="Special instructions (optional)"
                                        {...register("notes")}
                                        rows={3}
                                    />

                                    <div className="pt-4 border-t">
                                        <p className="font-semibold mb-3">Payment Method</p>
                                        <div className="space-y-2">
                                            <label
                                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted ${paymentMethod === "mpesa" ? "border-primary bg-primary/10" : ""}`}
                                                onClick={() => {
                                                    setPaymentMethod("mpesa");
                                                    setValue("paymentMethod", "mpesa");
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={paymentMethod === "mpesa"}
                                                    onChange={() => {
                                                        setPaymentMethod("mpesa");
                                                        setValue("paymentMethod", "mpesa");
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-semibold">M-Pesa STK Push</p>
                                                    <p className="text-sm text-muted-foreground">Enter your M-Pesa PIN on your phone</p>
                                                </div>
                                            </label>
                                            <label
                                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted ${paymentMethod === "cash" ? "border-primary bg-primary/10" : ""}`}
                                                onClick={() => {
                                                    setPaymentMethod("cash");
                                                    setValue("paymentMethod", "cash");
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={paymentMethod === "cash"}
                                                    onChange={() => {
                                                        setPaymentMethod("cash");
                                                        setValue("paymentMethod", "cash");
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-semibold">Pay on {watchedOrderType === "delivery" ? "Delivery" : "Pickup"}</p>
                                                    <p className="text-sm text-muted-foreground">Cash or M-Pesa</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        {loading ? "Processing..." : `Pay Ksh ${total.toLocaleString()}`}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Items</p>
                                    <p className="text-lg font-bold">{items.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Subtotal</p>
                                    <p className="text-lg font-bold">Ksh {total.toLocaleString()}</p>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-2">Estimated Time</p>
                                    <p className="text-sm">
                                        {watchedOrderType === "delivery" ? "30-45 mins" : watchedOrderType === "takeaway" ? "15-20 mins" : "Immediate"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;
