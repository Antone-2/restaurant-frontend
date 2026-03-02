import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Gift, Share2, TrendingUp, Zap } from "lucide-react";
import env from '@/lib/env';

const API_BASE_URL = `${env.VITE_API_URL}/api`;

interface LoyaltyData {
    points: number;
    tier: "bronze" | "silver" | "gold" | "platinum";
    referralCode: string;
    pointsHistory: any[];
    totalSpent: number;
    ordersCount: number;
    nextTierPoints?: number;
    nextTierName?: string;
}

interface ReferralStats {
    referralCode: string;
    totalReferrals: number;
    totalBonusEarned: number;
    nextTierPoints: number;
}

const LoyaltyDashboard = () => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [converting, setConverting] = useState(false);
    const [pointsToConvert, setPointsToConvert] = useState(100);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchLoyaltyData();
            fetchReferralStats();
        }
    }, [isAuthenticated]);

    const fetchLoyaltyData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/loyalty/points`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLoyaltyData(data);
            }
        } catch (err) {
            console.error("Failed to fetch loyalty data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReferralStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/loyalty/referral-stats`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReferralStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch referral stats:", err);
        }
    };

    const handleConvertPoints = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pointsToConvert < 100 || !loyaltyData || pointsToConvert > loyaltyData.points) {
            toast({
                title: "Invalid Amount",
                description: "Enter a multiple of 100 points, up to your available balance",
                variant: "destructive"
            });
            return;
        }

        setConverting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/loyalty/convert-to-discount`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ points: pointsToConvert })
            });

            if (!response.ok) {
                throw new Error("Failed to convert points");
            }

            const data = await response.json();
            toast({
                title: "Success!",
                description: `Coupon generated: ${data.couponCode}`
            });

            setPointsToConvert(100);
            fetchLoyaltyData();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to convert points",
                variant: "destructive"
            });
        } finally {
            setConverting(false);
        }
    };

    const handleGenerateReferral = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/loyalty/generate-referral`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to generate referral");
            }

            toast({
                title: "Referral Generated",
                description: "Share your unique referral code with friends!"
            });

            fetchReferralStats();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to generate referral",
                variant: "destructive"
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Referral code copied to clipboard"
        });
    };

    if (!isAuthenticated || !loyaltyData) {
        return null;
    }

    const tierColors: Record<string, string> = {
        bronze: "bg-amber-100 text-amber-900",
        silver: "bg-gray-100 text-gray-900",
        gold: "bg-yellow-100 text-yellow-900",
        platinum: "bg-blue-100 text-blue-900"
    };

    const tierPerks: Record<string, string[]> = {
        bronze: ["Basic member", "1 point per KES 10 spent"],
        silver: ["10K+ points", "Bonus on referrals", "Email about promotions"],
        gold: ["25K+ points", "Free delivery on orders > 5K", "Early access to new items"],
        platinum: ["50K+ points", "VIP status", "Personal concierge", "Special discounts"]
    };

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current Points
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loyaltyData.points.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            = KES {(loyaltyData.points / 100).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Your Tier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`inline-block px-4 py-2 rounded-full font-semibold capitalize ${tierColors[loyaltyData.tier]}`}>
                            {loyaltyData.tier}
                        </div>
                        {loyaltyData.nextTierPoints && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {loyaltyData.nextTierPoints.toLocaleString()} points to {loyaltyData.nextTierName}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="convert" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="convert">Convert Points</TabsTrigger>
                    <TabsTrigger value="referral">Referral Program</TabsTrigger>
                    <TabsTrigger value="history">Points History</TabsTrigger>
                </TabsList>

                {/* Convert Points Tab */}
                <TabsContent value="convert">
                    <Card>
                        <CardHeader>
                            <CardTitle>Convert Points to Discount</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong>100 points = KES 100 discount</strong> coupon valid for 30 days
                                </p>
                            </div>

                            <form onSubmit={handleConvertPoints} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Points to Convert (multiple of 100)
                                    </label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            type="number"
                                            min="100"
                                            max={loyaltyData.points}
                                            step="100"
                                            value={pointsToConvert}
                                            onChange={(e) => setPointsToConvert(parseInt(e.target.value))}
                                        />
                                        <span className="text-sm font-semibold whitespace-nowrap">
                                            = KES {(pointsToConvert / 100).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <span className="text-sm text-muted-foreground">Available Balance:</span>
                                    <span className="font-semibold">{loyaltyData.points.toLocaleString()} points</span>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={converting || pointsToConvert > loyaltyData.points}
                                    className="w-full"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    {converting ? "Converting..." : "Generate Discount Coupon"}
                                </Button>
                            </form>

                            {/* Tier Perks */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-4">Your Tier Perks</h3>
                                <ul className="space-y-2">
                                    {tierPerks[loyaltyData.tier]?.map((perk, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                            <span className={`w-2 h-2 rounded-full ${loyaltyData.tier === 'platinum' ? 'bg-blue-500' : loyaltyData.tier === 'gold' ? 'bg-yellow-500' : loyaltyData.tier === 'silver' ? 'bg-gray-500' : 'bg-amber-500'}`}></span>
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Referral Program Tab */}
                <TabsContent value="referral">
                    <Card>
                        <CardHeader>
                            <CardTitle>Referral Program</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-900">
                                    <strong>Earn 500 points</strong> when someone signs up with your code
                                </p>
                            </div>

                            {referralStats ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Total Referrals</p>
                                            <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-1">Bonus Earned</p>
                                            <p className="text-2xl font-bold">{referralStats.totalBonusEarned.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                        <p className="text-sm font-semibold">Your Referral Code</p>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                readOnly
                                                value={referralStats.referralCode}
                                                className="font-mono font-semibold"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(referralStats.referralCode)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Share this code with friends so they earn 500 bonus points on signup
                                        </p>
                                    </div>

                                    <Button onClick={() => {
                                        const referralLink = `${window.location.origin}/register?ref=${referralStats.referralCode}`;
                                        navigator.clipboard.writeText(referralLink);
                                        toast({
                                            title: "Link Copied!",
                                            description: "Referral link copied to clipboard"
                                        });
                                    }} className="w-full" variant="secondary">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Copy Referral Link
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleGenerateReferral} className="w-full">
                                    <Gift className="w-4 h-4 mr-2" />
                                    Generate Your Referral Code
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Points History Tab */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Points History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loyaltyData.pointsHistory && loyaltyData.pointsHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {loyaltyData.pointsHistory.map((entry: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium capitalize">{entry.type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(entry.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.amount > 0 ? '+' : ''}{entry.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No points history yet</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LoyaltyDashboard;
