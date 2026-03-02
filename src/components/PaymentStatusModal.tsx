import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Smartphone, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { paymentApi, ordersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PaymentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    amount: number;
    phoneNumber: string;
    customerEmail?: string;
    customerName?: string;
    mpesaRequestId?: string;
}

type PaymentStatus = "initiating" | "processing" | "success" | "failed" | "timeout";

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
    isOpen,
    onClose,
    orderId,
    amount,
    phoneNumber,
    customerEmail,
    customerName,
    mpesaRequestId
}) => {
    const [status, setStatus] = useState<PaymentStatus>("initiating");
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [checkoutRequestId, setCheckoutRequestId] = useState(mpesaRequestId || "");
    const { toast } = useToast();
    const navigate = useNavigate();

    // Polling interval for checking payment status
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_RETRIES = 40; // 2 minutes (40 * 3 seconds)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatus("initiating");
            setLoading(false);
            setRetryCount(0);
            setElapsedTime(0);
            setErrorMessage("");

            if (mpesaRequestId) {
                setCheckoutRequestId(mpesaRequestId);
                // Start polling immediately if we have a request ID
                setTimeout(() => setStatus("processing"), 500);
            }
        }
    }, [isOpen, mpesaRequestId]);

    // Timer for elapsed time
    useEffect(() => {
        if (status === "processing" && isOpen) {
            const timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, isOpen]);

    // Poll for payment status
    useEffect(() => {
        if (status !== "processing" || !checkoutRequestId || !isOpen) return;

        if (retryCount >= MAX_RETRIES) {
            setStatus("timeout");
            return;
        }

        const pollTimer = setTimeout(async () => {
            try {
                const response = await paymentApi.checkPaymentStatus(checkoutRequestId);

                if (response.paymentStatus === "completed") {
                    setStatus("success");
                    toast({
                        title: "Payment Successful!",
                        description: `Transaction confirmed. Order #${orderId}`,
                    });
                } else if (response.paymentStatus === "failed") {
                    setStatus("failed");
                    setErrorMessage("Payment was declined or failed");
                }
                // If still pending, continue polling
            } catch (error: any) {
                console.error("Payment status check error:", error);
                // Continue polling even on error
            }

            setRetryCount(prev => prev + 1);
        }, POLL_INTERVAL);

        return () => clearTimeout(pollTimer);
    }, [status, checkoutRequestId, retryCount, isOpen, orderId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRetry = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            // Re-initiate payment
            const response = await paymentApi.initiateMpesa({
                phoneNumber,
                amount,
                orderId,
                customerEmail,
                customerName
            });

            if (response.success) {
                setCheckoutRequestId(response.mpesaRequestId);
                setStatus("processing");
                setRetryCount(0);
                setElapsedTime(0);

                toast({
                    title: "Payment Re-initiated",
                    description: "Please check your phone for the M-Pesa prompt",
                });
            } else {
                setStatus("failed");
                setErrorMessage(response.error || "Failed to re-initiate payment");
            }
        } catch (error: any) {
            setStatus("failed");
            setErrorMessage(error.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = () => {
        onClose();
        navigate(`/orders/${orderId}`);
    };

    const handleClose = () => {
        // Don't allow closing during processing
        if (status === "processing" || status === "initiating") {
            toast({
                title: "Please Wait",
                description: "Please wait for payment to complete or timeout",
                variant: "destructive"
            });
            return;
        }
        onClose();
    };

    const handleTryCash = async () => {
        setLoading(true);
        try {
            // Update order to cash payment
            await ordersApi.update(orderId, {
                paymentMethod: "cash",
                paymentStatus: "pending",
                status: "pending"
            });

            onClose();
            navigate(`/orders/${orderId}`);

            toast({
                title: "Payment Method Changed",
                description: "You can pay with cash on delivery/pickup",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update payment method",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "initiating":
                return <Smartphone className="w-5 h-5 text-blue-500" />;
            case "processing":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "timeout":
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
        }
    };

    const getStatusDescription = () => {
        switch (status) {
            case "initiating":
                return "Initiating M-Pesa payment...";
            case "processing":
                return `Waiting for payment confirmation (${formatTime(elapsedTime)})`;
            case "success":
                return "Payment completed successfully!";
            case "failed":
                return "Payment could not be completed";
            case "timeout":
                return "Payment request timed out";
        }
    };

    const renderContent = () => {
        switch (status) {
            case "initiating":
                return (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                            Sending M-Pesa prompt to {phoneNumber}...
                        </p>
                    </div>
                );

            case "processing":
                return (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <Smartphone className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {retryCount + 1}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Check your phone!</p>
                            <p className="text-sm text-muted-foreground">
                                Enter your M-Pesa PIN to complete payment of <strong>Ksh {amount.toLocaleString()}</strong>
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Elapsed: {formatTime(elapsedTime)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Don't close this window. Polling for payment confirmation...
                        </p>
                    </div>
                );

            case "success":
                return (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-600">Payment Confirmed!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your order #{orderId} has been confirmed
                            </p>
                        </div>
                        <Button onClick={handleViewOrder} className="w-full">
                            View Order Details
                        </Button>
                    </div>
                );

            case "failed":
                return (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-red-600">Payment Failed</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {errorMessage || "The payment could not be completed"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Button onClick={handleRetry} disabled={loading} className="w-full">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleTryCash}
                                disabled={loading}
                                className="w-full"
                            >
                                Pay with Cash on Delivery
                            </Button>
                        </div>
                    </div>
                );

            case "timeout":
                return (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-orange-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-orange-600">Payment Request Timed Out</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You didn't complete the payment in time. Would you like to try again?
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Button onClick={handleRetry} disabled={loading} className="w-full">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleTryCash}
                                disabled={loading}
                                className="w-full"
                            >
                                Pay with Cash on Delivery
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon()}
                        Payment Status
                    </DialogTitle>
                    <DialogDescription>
                        {getStatusDescription()}
                    </DialogDescription>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardContent className="space-y-4 pt-4">
                        {/* Amount Display */}
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-3xl font-bold text-primary">Ksh {amount.toLocaleString()}</p>
                        </div>

                        {/* Status-specific content */}
                        {renderContent()}
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentStatusModal;
