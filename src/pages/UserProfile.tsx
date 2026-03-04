import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Lock, LogOut, ArrowLeft, CreditCard, Trash2, Check, Plus, Download } from "lucide-react";
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;

const UserProfile = () => {
    const { user, logout, isAuthenticated, updateProfile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || ""
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Payment Methods State
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        type: "card",
        label: "",
        last4: "",
        expiryMonth: "",
        expiryYear: "",
        cardholderName: "",
        mobileNumber: ""
    });

    // Account Deletion State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            fetchPaymentMethods();
        }
    }, [isAuthenticated, navigate]);

    const fetchPaymentMethods = async () => {
        setLoadingPayments(true);
        try {
            const response = await fetch("${API_BASE_URL}/auth/payment-methods", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch payment methods");
            }

            const data = await response.json();
            setPaymentMethods(data.paymentMethods || []);
        } catch (err: any) {
            console.error(err);
            // Don't show error if payment methods not set up yet
        } finally {
            setLoadingPayments(false);
        }
    };

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = paymentForm.type === "card"
                ? {
                    type: "card",
                    label: paymentForm.label,
                    last4: paymentForm.last4,
                    expiryMonth: parseInt(paymentForm.expiryMonth),
                    expiryYear: parseInt(paymentForm.expiryYear),
                    cardholderName: paymentForm.cardholderName
                }
                : {
                    type: "mpesa",
                    label: paymentForm.label,
                    mobileNumber: paymentForm.mobileNumber
                };

            const response = await fetch("${API_BASE_URL}/auth/payment-methods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to add payment method");
            }

            toast({
                title: "Success",
                description: "Payment method added successfully"
            });

            setPaymentForm({
                type: "card",
                label: "",
                last4: "",
                expiryMonth: "",
                expiryYear: "",
                cardholderName: "",
                mobileNumber: ""
            });
            setShowAddPayment(false);
            fetchPaymentMethods();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to add payment method",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePaymentMethod = async (methodId: string) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/payment-methods/${methodId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete payment method");
            }

            toast({
                title: "Success",
                description: "Payment method deleted"
            });

            fetchPaymentMethods();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete payment method",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefaultPayment = async (methodId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/payment-methods/${methodId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ isDefault: true })
            });

            if (!response.ok) {
                throw new Error("Failed to set default payment method");
            }

            toast({
                title: "Success",
                description: "Default payment method updated"
            });

            fetchPaymentMethods();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update default",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadData = async () => {
        setLoading(true);
        try {
            const response = await fetch("${API_BASE_URL}/auth/download-data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to download data");
            }

            const data = await response.json();
            const element = document.createElement("a");
            element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)));
            element.setAttribute("download", `user-data-${new Date().toISOString().split('T')[0]}.json`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            toast({
                title: "Success",
                description: "Your data has been downloaded"
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to download data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deletePassword) {
            toast({
                title: "Error",
                description: "Please enter your password",
                variant: "destructive"
            });
            return;
        }

        setDeletingAccount(true);
        try {
            const response = await fetch("${API_BASE_URL}/auth/account", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ password: deletePassword })
            });

            if (!response.ok) {
                throw new Error("Failed to delete account");
            }

            toast({
                title: "Account Deleted",
                description: "Your account has been permanently deleted"
            });

            logout();
            navigate("/");
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete account",
                variant: "destructive"
            });
        } finally {
            setDeletingAccount(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile(form);
            toast({
                title: "Success",
                description: "Profile updated successfully"
            });
            setEditMode(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive"
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // Assuming there's a password change endpoint
            const response = await fetch("${API_BASE_URL}/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (!response.ok) {
                throw new Error("Failed to change password");
            }

            toast({
                title: "Success",
                description: "Password changed successfully"
            });
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not change password",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        toast({
            title: "Logged Out",
            description: "You have been logged out successfully"
        });
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="addresses">Addresses</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Profile</CardTitle>
                                <Button
                                    variant={editMode ? "outline" : "default"}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? "Cancel" : "Edit Profile"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {editMode ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-5 h-5 text-muted-foreground" />
                                                <div className="flex gap-1 w-full">
                                                    <span className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                                                        +254
                                                    </span>
                                                    <Input
                                                        value={form.phone}
                                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                                <Input
                                                    value={form.address}
                                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                    placeholder="Your address"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} className="w-full">
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                            <User className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Full Name</p>
                                                <p className="font-semibold">{user.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                            <Mail className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-semibold">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                            <Phone className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-semibold">{user.phone || "Not added"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Address</p>
                                                <p className="font-semibold">{user.address || "Not added"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Methods Tab */}
                    <TabsContent value="payments">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Payment Methods</CardTitle>
                                <Button onClick={() => setShowAddPayment(!showAddPayment)} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Payment Method
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {showAddPayment && (
                                    <div className="mb-6 p-4 bg-muted rounded-lg">
                                        <h3 className="font-semibold mb-4">Add New Payment Method</h3>
                                        <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Payment Type</label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            value="card"
                                                            checked={paymentForm.type === "card"}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                                        />
                                                        <span>Credit/Debit Card</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            value="mpesa"
                                                            checked={paymentForm.type === "mpesa"}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                                        />
                                                        <span>M-Pesa Mobile Money</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <Input
                                                placeholder="Label (e.g., My Visa, Work Card)"
                                                value={paymentForm.label}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, label: e.target.value })}
                                                required
                                            />

                                            {paymentForm.type === "card" ? (
                                                <>
                                                    <Input
                                                        placeholder="Cardholder Name"
                                                        value={paymentForm.cardholderName}
                                                        onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                                                        required
                                                    />
                                                    <Input
                                                        placeholder="Last 4 Digits"
                                                        maxLength={4}
                                                        value={paymentForm.last4}
                                                        onChange={(e) => setPaymentForm({ ...paymentForm, last4: e.target.value })}
                                                        required
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input
                                                            placeholder="Month (MM)"
                                                            maxLength={2}
                                                            value={paymentForm.expiryMonth}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                                                            required
                                                        />
                                                        <Input
                                                            placeholder="Year (YYYY)"
                                                            maxLength={4}
                                                            value={paymentForm.expiryYear}
                                                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <Input
                                                    placeholder="M-Pesa Number (e.g., 0712345678)"
                                                    value={paymentForm.mobileNumber}
                                                    onChange={(e) => setPaymentForm({ ...paymentForm, mobileNumber: e.target.value })}
                                                    required
                                                />
                                            )}

                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={loading} className="flex-1">
                                                    {loading ? "Adding..." : "Add Payment Method"}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {loadingPayments ? (
                                    <p className="text-center py-8 text-muted-foreground">Loading payment methods...</p>
                                ) : paymentMethods.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No payment methods saved yet. Add one to get started!</p>
                                ) : (
                                    <div className="space-y-3">
                                        {paymentMethods.map((method: any) => (
                                            <div key={method._id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <CreditCard className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {method.type === "card"
                                                                ? `${method.label} (•••• ${method.last4})`
                                                                : `${method.label} (${method.mobileNumber.slice(-4)})`
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {method.type === "card"
                                                                ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                                                                : "M-Pesa Mobile Money"
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {method.isDefault ? (
                                                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Default
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSetDefaultPayment(method._id)}
                                                            disabled={loading}
                                                        >
                                                            Set Default
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePaymentMethod(method._id)}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Addresses Tab */}
                    <TabsContent value="addresses">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Saved Addresses</CardTitle>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Address
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground mb-4">Manage your delivery addresses for faster checkout</p>
                                    <p className="text-sm text-muted-foreground">Address management feature coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Visit the Orders page to view your complete order history</p>
                                    <Button onClick={() => navigate("/order-history")} className="mt-4">
                                        View Order History
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div>
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <Lock className="w-5 h-5" />
                                            Change Password
                                        </h3>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <PasswordInput
                                                placeholder="Current password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                required
                                            />
                                            <PasswordInput
                                                placeholder="New password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                required
                                            />
                                            <PasswordInput
                                                placeholder="Confirm new password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                required
                                            />
                                            <Button type="submit" disabled={loading}>
                                                {loading ? "Updating..." : "Update Password"}
                                            </Button>
                                        </form>
                                    </div>

                                    {/* Data Privacy */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <Download className="w-5 h-5" />
                                            Your Data
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Download a complete copy of your personal data in JSON format, including profile, orders, and preferences.
                                        </p>
                                        <Button onClick={handleDownloadData} disabled={loading} variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            {loading ? "Downloading..." : "Download My Data"}
                                        </Button>
                                    </div>

                                    {/* Account Deletion */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
                                            <Trash2 className="w-5 h-5" />
                                            Delete Account
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        {showDeleteConfirm ? (
                                            <form onSubmit={handleDeleteAccount} className="bg-destructive/10 p-4 rounded-lg space-y-4">
                                                <div className="bg-destructive/20 p-3 rounded border border-destructive/30">
                                                    <p className="text-sm font-semibold text-destructive">
                                                        ⚠️ Warning: This will permanently delete your account, all orders, and personal data.
                                                    </p>
                                                </div>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your password to confirm"
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        disabled={deletingAccount}
                                                    >
                                                        {deletingAccount ? "Deleting..." : "Yes, Delete My Account"}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowDeleteConfirm(false);
                                                            setDeletePassword("");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowDeleteConfirm(true)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Account
                                            </Button>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <LogOut className="w-5 h-5" />
                                            Session
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Click below to log out from this device
                                        </p>
                                        <Button variant="secondary" onClick={handleLogout}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
};

export default UserProfile;
