import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Megaphone,
    Mail,
    MessageSquare,
    Bell,
    Calendar,
    Tag,
    Users,
    Send,
    Plus,
    TrendingUp,
    DollarSign,
    Clock,
    Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
    id: string;
    name: string;
    type: "email" | "sms" | "push" | "promotion";
    status: "draft" | "scheduled" | "active" | "completed";
    audience: string;
    sentCount: number;
    openRate?: number;
    clickRate?: number;
    startDate: string;
    endDate?: string;
    discount?: string;
    code?: string;
}

const DEMO_CAMPAIGNS: Campaign[] = [
    {
        id: "c1",
        name: "Weekend Brunch Special",
        type: "email",
        status: "completed",
        audience: "All Customers",
        sentCount: 1250,
        openRate: 32.5,
        clickRate: 8.2,
        startDate: "2026-02-15",
        endDate: "2026-02-16"
    },
    {
        id: "c2",
        name: "Happy Hour - 50% Off Drinks",
        type: "promotion",
        status: "active",
        audience: "Loyalty Members",
        sentCount: 450,
        openRate: 45.8,
        clickRate: 22.1,
        startDate: "2026-02-20",
        endDate: "2026-03-01",
        discount: "50%",
        code: "HAPPY50"
    },
    {
        id: "c3",
        name: "New Menu Launch",
        type: "push",
        status: "scheduled",
        audience: "App Users",
        sentCount: 0,
        startDate: "2026-03-05"
    },
    {
        id: "c4",
        name: "Valentine's Day Dinner",
        type: "sms",
        status: "active",
        audience: "VIP Customers",
        sentCount: 180,
        openRate: 98.2,
        clickRate: 15.5,
        startDate: "2026-02-10",
        endDate: "2026-02-14",
        discount: "20%",
        code: "VALENTINE20"
    },
    {
        id: "c5",
        name: "Birthday Rewards",
        type: "email",
        status: "draft",
        audience: "Birthday This Month",
        sentCount: 0,
        startDate: "2026-03-01"
    },
];

const MarketingPromotions = () => {
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
    const [selectedType, setSelectedType] = useState<string>("all");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "email": return <Mail className="w-4 h-4" />;
            case "sms": return <MessageSquare className="w-4 h-4" />;
            case "push": return <Bell className="w-4 h-4" />;
            case "promotion": return <Tag className="w-4 h-4" />;
            default: return <Megaphone className="w-4 h-4" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "email": return <Badge className="bg-blue-500"><Mail className="w-3 h-3 mr-1" /> Email</Badge>;
            case "sms": return <Badge className="bg-green-500"><MessageSquare className="w-3 h-3 mr-1" /> SMS</Badge>;
            case "push": return <Badge className="bg-purple-500"><Bell className="w-3 h-3 mr-1" /> Push</Badge>;
            case "promotion": return <Badge className="bg-orange-500"><Tag className="w-3 h-3 mr-1" /> Promotion</Badge>;
            default: return <Badge>{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft": return <Badge variant="outline">Draft</Badge>;
            case "scheduled": return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
            case "active": return <Badge className="bg-green-500">Active</Badge>;
            case "completed": return <Badge className="bg-gray-500">Completed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const filteredCampaigns = campaigns.filter(c =>
        selectedType === "all" || c.type === selectedType
    );

    const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === "active").length,
        totalRecipients: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
        avgOpenRate: campaigns.filter(c => c.openRate).reduce((sum, c, _, arr) => sum + (c.openRate || 0) / arr.length, 0).toFixed(1),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Marketing & Promotions</h2>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                        <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
                        <p className="text-sm text-muted-foreground">Active Now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Recipients</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
                        <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="pt-4 text-center">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                        <p className="font-medium">Email Campaign</p>
                        <p className="text-xs text-muted-foreground">Send to all customers</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="pt-4 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="font-medium">SMS Blast</p>
                        <p className="text-xs text-muted-foreground">Quick text message</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="pt-4 text-center">
                        <Tag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        <p className="font-medium">Create Promo</p>
                        <p className="text-xs text-muted-foreground">Discount or coupon</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="pt-4 text-center">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <p className="font-medium">Push Notification</p>
                        <p className="text-xs text-muted-foreground">App users only</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {["all", "email", "sms", "push", "promotion"].map(type => (
                    <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className="capitalize"
                    >
                        {type === "all" ? "All" : type}
                    </Button>
                ))}
            </div>

            {/* Campaigns List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredCampaigns.map(campaign => (
                            <div
                                key={campaign.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-muted">
                                        {getTypeIcon(campaign.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{campaign.name}</span>
                                            {getTypeBadge(campaign.type)}
                                            {getStatusBadge(campaign.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {campaign.audience}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {campaign.startDate}
                                                {campaign.endDate && ` - ${campaign.endDate}`}
                                            </span>
                                            {campaign.code && (
                                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                                                    {campaign.code}
                                                </span>
                                            )}
                                            {campaign.discount && (
                                                <span className="text-green-600 font-medium">
                                                    {campaign.discount} OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {campaign.sentCount > 0 && (
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{campaign.sentCount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Sent</p>
                                        </div>
                                        {campaign.openRate && (
                                            <>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold">{campaign.openRate}%</p>
                                                    <p className="text-xs text-muted-foreground">Open Rate</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold">{campaign.clickRate}%</p>
                                                    <p className="text-xs text-muted-foreground">Click Rate</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {filteredCampaigns.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No campaigns found</p>
                </div>
            )}
        </div>
    );
};

export default MarketingPromotions;
