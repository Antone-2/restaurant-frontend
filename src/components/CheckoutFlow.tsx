import { useState } from "react";
import { X, CheckCircle, Truck, ShoppingBag, CreditCard, MapPin, Phone, User, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label as RadioLabel } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useOrderNotifications } from "./NotificationSystem";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFlowProps {
    isOpen: boolean;
    onClose: () => void;
}

type CheckoutStep = "cart" | "details" | "payment" | "confirmation";

const CheckoutFlow = ({ isOpen, onClose }: CheckoutFlowProps) => {
    const { items, subtotal, clearCart } = useCart();
    const { notifyOrderPlaced } = useOrderNotifications();
    const { toast } = useToast();
    const orderTotal = subtotal; // No tax

    const [step, setStep] = useState<CheckoutStep>("cart");
    const [isProcessing, setIsProcessing] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        orderType: "takeaway",
        deliveryAddress: "",
        deliveryInstructions: "",
        reservationDate: "",
        reservationTime: "",
        numberOfGuests: 2,
        paymentMethod: "cash",
    });

    const handleInputChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        if (step === "cart") return items.length > 0;
        if (step === "details") {
            return formData.name && formData.phone && formData.email;
        }
        if (step === "payment") return true;
        return false;
    };

    const handleSubmit = async () => {
        setIsProcessing(true);

        try {
            const orderData = {
                customerName: formData.name,
                email: formData.email,
                phone: formData.phone,
                orderType: formData.orderType,
                items: items.map((item) => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                })),
                subtotal,
                tax: 0,
                total: orderTotal,
                paymentMethod: formData.paymentMethod,
                paymentStatus: "pending",
                deliveryAddress: formData.deliveryAddress,
                deliveryInstructions: formData.deliveryInstructions,
                reservationDate: formData.reservationDate ? new Date(formData.reservationDate) : undefined,
                reservationTime: formData.reservationTime,
                numberOfGuests: formData.numberOfGuests,
                status: "pending",
            };

            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData),
                });

                if (response.ok) {
                    const result = await response.json();
                    notifyOrderPlaced(result._id || "123", formData.orderType);
                } else {
                    const errorData = await response.json();
                    toast({
                        title: "Order Failed",
                        description: errorData.error || "Please try again",
                        variant: "destructive",
                    });
                    setIsProcessing(false);
                    return;
                }
            } catch (err: any) {
                toast({
                    title: "Connection Error",
                    description: err.message || "Could not connect to server",
                    variant: "destructive",
                });
                setIsProcessing(false);
                return;
            }

            setStep("confirmation");
            clearCart();

        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setStep("cart");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Checkout</h2>
                        {step !== "confirmation" && (
                            <div className="flex items-center gap-1 text-sm">
                                {["cart", "details", "payment"].map((s, i) => (
                                    <span key={s} className={`px-2 py-1 rounded ${step === s ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        {i + 1}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {step === "cart" && (
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Review Your Order
                        </h3>

                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-muted rounded-lg">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            {item.specialInstructions && (
                                                <p className="text-xs text-muted-foreground italic">{item.specialInstructions}</p>
                                            )}
                                        </div>
                                        <p className="font-semibold">Ksh {item.price * item.quantity}</p>
                                    </div>
                                ))}

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Ksh {subtotal}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>Ksh {subtotal}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button onClick={() => setStep("details")} disabled={items.length === 0} className="w-full">
                            Continue to Details <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                )}

                {step === "details" && (
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" /> Your Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Order Type</Label>
                                <RadioGroup value={formData.orderType} onValueChange={(v) => handleInputChange("orderType", v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="dinein" id="dinein" />
                                        <RadioLabel htmlFor="dinein" className="cursor-pointer">Dine-in</RadioLabel>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="takeaway" id="takeaway" />
                                        <RadioLabel htmlFor="takeaway" className="cursor-pointer">Takeaway</RadioLabel>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="delivery" id="delivery" />
                                        <RadioLabel htmlFor="delivery" className="cursor-pointer">Delivery</RadioLabel>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter Your Name" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="Enter phone number" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Enter Email Address" />
                            </div>

                            {formData.orderType === "delivery" && (
                                <>
                                    <div>
                                        <Label htmlFor="address">Delivery Address *</Label>
                                        <Textarea id="address" value={formData.deliveryAddress} onChange={(e) => handleInputChange("deliveryAddress", e.target.value)} placeholder="Full delivery address" rows={2} />
                                    </div>
                                    <div>
                                        <Label htmlFor="instructions">Delivery Instructions</Label>
                                        <Textarea id="instructions" value={formData.deliveryInstructions} onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)} placeholder="Gate code, landmark, etc." rows={2} />
                                    </div>
                                </>
                            )}

                            {formData.orderType === "dinein" && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input id="date" type="date" value={formData.reservationDate} onChange={(e) => handleInputChange("reservationDate", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="time">Time</Label>
                                        <Input id="time" type="time" value={formData.reservationTime} onChange={(e) => handleInputChange("reservationTime", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="guests">Guests</Label>
                                        <Input id="guests" type="number" min={1} max={20} value={formData.numberOfGuests} onChange={(e) => handleInputChange("numberOfGuests", Number(e.target.value))} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setStep("cart")} className="flex-1">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button onClick={() => setStep("payment")} disabled={!canProceed()} className="flex-1">
                                Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                )}

                {step === "payment" && (
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Payment Method
                        </h3>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-green-700">
                                <Truck className="w-5 h-5" />
                                <span className="font-medium">Pay on Delivery</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                                Pay with Cash or M-Pesa when your order arrives
                            </p>
                        </div>

                        <RadioGroup value={formData.paymentMethod} onValueChange={(v) => handleInputChange("paymentMethod", v)} className="space-y-3">
                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                                <RadioGroupItem value="cash" id="cash" />
                                <RadioLabel htmlFor="cash" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Cash</span>
                                    <p className="text-sm text-muted-foreground">Pay with cash on delivery</p>
                                </RadioLabel>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                                <RadioGroupItem value="mpesa" id="mpesa" />
                                <RadioLabel htmlFor="mpesa" className="flex-1 cursor-pointer">
                                    <span className="font-medium">M-Pesa</span>
                                    <p className="text-sm text-muted-foreground">Pay via M-Pesa on delivery</p>
                                </RadioLabel>
                            </div>
                        </RadioGroup>

                        <div className="bg-muted rounded-lg p-4 mt-6">
                            <h4 className="font-semibold mb-3">Order Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>{items.length} items</span>
                                    <span>Ksh {subtotal}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>Ksh {subtotal}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={isProcessing} className="flex-1">
                                {isProcessing ? "Processing..." : `Place Order - Ksh ${subtotal}`}
                            </Button>
                        </div>
                    </CardContent>
                )}

                {step === "confirmation" && (
                    <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Order Placed! </h2>
                        <p className="text-muted-foreground mb-6">
                            Thank you for your order. Confirmation sent to {formData.email} and {formData.phone}
                        </p>

                        <div className="bg-muted rounded-lg p-4 text-left mb-6">
                            <h4 className="font-semibold mb-2">Order Details</h4>
                            <div className="space-y-1 text-sm">
                                <p><strong>Name:</strong> {formData.name}</p>
                                <p><strong>Phone:</strong> {formData.phone}</p>
                                <p><strong>Type:</strong> {formData.orderType.charAt(0).toUpperCase() + formData.orderType.slice(1)}</p>
                                <p><strong>Payment:</strong> {formData.paymentMethod === "cash" ? "Cash" : "M-Pesa"} on delivery</p>
                                <p><strong>Total:</strong> Ksh {subtotal}</p>
                            </div>
                        </div>

                        {formData.orderType === "delivery" && formData.deliveryAddress && (
                            <div className="bg-muted rounded-lg p-4 text-left mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-semibold">Delivery Address</span>
                                </div>
                                <p className="text-sm">{formData.deliveryAddress}</p>
                            </div>
                        )}

                        <Button onClick={handleClose} className="w-full">
                            Continue Shopping
                        </Button>
                    </CardContent>
                )}
            </div>
        </div>
    );
};

export default CheckoutFlow;
