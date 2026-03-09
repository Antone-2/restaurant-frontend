import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Star, Users, Mail, MessageSquare, Gift, TrendingUp,
    TrendingDown, AlertCircle, CheckCircle, Send, Filter,
    Search, Plus, Edit, Trash2, RefreshCw, BarChart3,
    ThumbsUp, ThumbsDown, DollarSign, Calendar, Clock,
    Target, Zap, Eye, MousePointer, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, PageLoader } from '@/components/ui/LoadingSpinner';

// API helper
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    email: string;
    phone: string;
    orderId: string;
    status: string;
    isVisible: boolean;
    isComplaint: boolean;
    createdAt: string;
}

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    segment: string;
    totalOrders: number;
    totalSpent: number;
    lastActive: string;
    birthday?: string;
    tags: string[];
}

interface Campaign {
    _id: string;
    name: string;
    type: string;
    category: string;
    status: string;
    sentCount: number;
    openedCount: number;
    clickedCount: number;
    openRate: number;
    clickRate: number;
    subject?: string;
    message?: string;
}

interface LoyaltyStats {
    totalMembers: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    pointsEarned: number;
    pointsRedeemed: number;
}

interface Analytics {
    summary: {
        totalCustomers: number;
        activeCustomers: number;
        avgOrderValue: number;
        totalReviews: number;
        positiveReviewRate: string;
        emailCampaigns: {
            sent: number;
            opened: number;
            clicked: number;
        };
    };
    analytics: any[];
}

export default function CustomerEngagementDashboard() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats | null>(null);

    // Filters
    const [reviewFilter, setReviewFilter] = useState('all');
    const [customerSegment, setCustomerSegment] = useState('all');
    const [campaignStatus, setCampaignStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [analyticsPeriod, setAnalyticsPeriod] = useState('month');

    // Dialogs
    const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Campaign form
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'email',
        category: 'promotional',
        subject: '',
        message: '',
        audience: 'all'
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'reviews') loadReviews();
        if (activeTab === 'customers') loadCustomers();
        if (activeTab === 'campaigns') loadCampaigns();
        if (activeTab === 'analytics') {
            loadAnalytics();
            loadLoyaltyStats();
        }
    }, [activeTab]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    };

    const loadData = async () => {
        await Promise.all([
            loadAnalytics(),
            loadReviews(),
            loadCustomers(),
            loadCampaigns()
        ]);
    };

    const loadReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/api/engagement/reviews?status=${reviewFilter}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/api/engagement/customers?segment=${customerSegment}&search=${searchQuery}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers || []);
            }
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/api/engagement/campaigns?status=${campaignStatus}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns || []);
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/api/engagement/analytics?period=${analyticsPeriod}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadLoyaltyStats = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiBaseUrl}/api/engagement/loyalty`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                // Transform loyalty members data into stats
                const members = data.members || [];
                const stats = {
                    totalMembers: members.length,
                    bronze: members.filter((m: any) => m.tier === 'bronze').length,
                    silver: members.filter((m: any) => m.tier === 'silver').length,
                    gold: members.filter((m: any) => m.tier === 'gold').length,
                    platinum: members.filter((m: any) => m.tier === 'platinum').length,
                    pointsEarned: members.reduce((sum: number, m: any) => sum + (m.lifetimePoints || 0), 0),
                    pointsRedeemed: members.reduce((sum: number, m: any) => {
                        const redeemed = m.pointsHistory?.filter((h: any) => h.action === 'redeemed') || [];
                        return sum + redeemed.reduce((s: number, h: any) => s + (h.points || 0), 0);
                    }, 0)
                };
                setLoyaltyStats(stats);
            }
        } catch (err) {
            console.error('Failed to load loyalty stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateReviewStatus = async (reviewId: string, status: string) => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/engagement/reviews/${reviewId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast({ title: 'Review updated', description: `Review status changed to ${status}` });
                loadReviews();
            }
        } catch (err) {
            console.error('Failed to update review:', err);
            toast({ title: 'Error', description: 'Failed to update review', variant: 'destructive' });
        }
    };

    const createCampaign = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/engagement/campaigns`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...campaignForm,
                    status: 'draft',
                    htmlContent: campaignForm.message
                })
            });
            if (res.ok) {
                toast({ title: 'Campaign created', description: 'Your campaign has been created' });
                setCampaignDialogOpen(false);
                setCampaignForm({ name: '', type: 'email', category: 'promotional', subject: '', message: '', audience: 'all' });
                loadCampaigns();
            }
        } catch (err) {
            console.error('Failed to create campaign:', err);
            toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' });
        }
    };

    const sendCampaign = async (campaignId: string) => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/engagement/campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const result = await res.json();
                toast({ title: 'Campaign sent', description: `Sent to ${result.sentCount} recipients` });
                loadCampaigns();
            }
        } catch (err) {
            console.error('Failed to send campaign:', err);
            toast({ title: 'Error', description: 'Failed to send campaign', variant: 'destructive' });
        }
    };

    const updateCustomerSegment = async (customerId: string, segment: string) => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/engagement/customers/${customerId}/segment`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ segment })
            });
            if (res.ok) {
                toast({ title: 'Segment updated', description: `Customer moved to ${segment}` });
                loadCustomers();
            }
        } catch (err) {
            console.error('Failed to update segment:', err);
            toast({ title: 'Error', description: 'Failed to update segment', variant: 'destructive' });
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-500';
        if (rating >= 3) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getSegmentColor = (segment: string) => {
        const colors: Record<string, string> = {
            'new': 'bg-blue-100 text-blue-800',
            'regular': 'bg-green-100 text-green-800',
            'vip': 'bg-purple-100 text-purple-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'at-risk': 'bg-red-100 text-red-800'
        };
        return colors[segment] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'draft': 'bg-gray-100 text-gray-800',
            'active': 'bg-green-100 text-green-800',
            'scheduled': 'bg-blue-100 text-blue-800',
            'completed': 'bg-purple-100 text-purple-800',
            'cancelled': 'bg-red-100 text-red-800',
            'approved': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Total Customers</p>
                                <p className="text-3xl font-bold">{analytics?.summary?.totalCustomers || 0}</p>
                            </div>
                            <Users className="w-10 h-10 text-blue-200" />
                        </div>
                        <p className="text-blue-100 text-sm mt-2">
                            {analytics?.summary?.activeCustomers || 0} active this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Positive Reviews</p>
                                <p className="text-3xl font-bold">{analytics?.summary?.positiveReviewRate || 0}%</p>
                            </div>
                            <ThumbsUp className="w-10 h-10 text-green-200" />
                        </div>
                        <p className="text-green-100 text-sm mt-2">
                            {reviews.filter(r => r.rating >= 4).length} positive out of {reviews.length} total
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Campaigns Sent</p>
                                <p className="text-3xl font-bold">{analytics?.summary?.emailCampaigns?.sent || 0}</p>
                            </div>
                            <Mail className="w-10 h-10 text-purple-200" />
                        </div>
                        <p className="text-purple-100 text-sm mt-2">
                            {analytics?.summary?.emailCampaigns?.opened || 0} opened
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100">Avg Order Value</p>
                                <p className="text-3xl font-bold">KES {analytics?.summary?.avgOrderValue?.toFixed(0) || 0}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-amber-200" />
                        </div>
                        <p className="text-amber-100 text-sm mt-2">
                            Per customer
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Recent Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reviews.slice(0, 5).map(review => (
                            <div key={review._id} className="flex items-start gap-4 p-4 border rounded-lg">
                                <div className={`p-2 rounded-full ${review.rating >= 4 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {review.rating >= 4 ? (
                                        <ThumbsUp className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ThumbsDown className="w-5 h-5 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{review.name}</span>
                                        <span className={`text-lg ${getRatingColor(review.rating)}`}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                        <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                                    </div>
                                    <p className="text-gray-600 mt-1">{review.comment}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                        {review.orderId && ` • Order: ${review.orderId}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Campaigns */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-500" />
                        Active Campaigns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {campaigns.filter(c => c.status === 'active').slice(0, 5).map(campaign => (
                            <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{campaign.name}</span>
                                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">{campaign.subject || campaign.message?.substring(0, 50)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{campaign.sentCount} sent</p>
                                    <p className="text-sm text-gray-500">{campaign.openRate?.toFixed(1)}% open rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderReviews = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Select value={reviewFilter} onValueChange={(v) => { setReviewFilter(v); loadReviews(); }}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Reviews</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => loadReviews()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {reviews.map(review => (
                    <Card key={review._id} className={review.isComplaint ? 'border-red-300' : ''}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{review.name}</span>
                                        <span className={`text-xl ${getRatingColor(review.rating)}`}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                        <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                                        {review.isComplaint && (
                                            <Badge className="bg-red-100 text-red-800">Complaint</Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mt-2">{review.comment}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        <span>{review.email}</span>
                                        <span>{review.phone}</span>
                                        {review.orderId && <span>Order: {review.orderId}</span>}
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {review.status === 'pending' && (
                                        <>
                                            <Button size="sm" className="bg-green-600" onClick={() => updateReviewStatus(review._id, 'approved')}>
                                                <CheckCircle className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => updateReviewStatus(review._id, 'rejected')}>
                                                <ThumbsDown className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderCustomers = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                    />
                </div>
                <Select value={customerSegment} onValueChange={(v) => { setCustomerSegment(v); loadCustomers(); }}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Segment" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Segments</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="at-risk">At Risk</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => loadCustomers()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {customers.map(customer => (
                    <Card key={customer._id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {customer.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{customer.name || 'Unknown'}</span>
                                            <Badge className={getSegmentColor(customer.segment)}>{customer.segment}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">KES {customer.totalSpent?.toLocaleString() || 0}</p>
                                    <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                                    <p className="text-xs text-gray-400">
                                        Last active: {customer.lastActive ? new Date(customer.lastActive).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Select
                                    value={customer.segment}
                                    onValueChange={(v) => updateCustomerSegment(customer._id, v)}
                                >
                                    <SelectTrigger className="w-32 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                        <SelectItem value="at-risk">At Risk</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button size="sm" variant="outline" onClick={() => { setSelectedCustomer(customer); setCustomerDialogOpen(true); }}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderCampaigns = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={campaignStatus} onValueChange={(v) => { setCampaignStatus(v); loadCampaigns(); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => loadCampaigns()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
                <Button onClick={() => { setEditingCampaign(null); setCampaignDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            <div className="grid gap-4">
                {campaigns.map(campaign => (
                    <Card key={campaign._id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{campaign.name}</span>
                                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                                        <Badge variant="outline">{campaign.type}</Badge>
                                        <Badge variant="outline">{campaign.category}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {campaign.subject || campaign.message?.substring(0, 100)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{campaign.sentCount}</p>
                                        <p className="text-xs text-gray-500">Sent</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{campaign.openRate?.toFixed(1) || 0}%</p>
                                        <p className="text-xs text-gray-500">Open Rate</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{campaign.clickRate?.toFixed(1) || 0}%</p>
                                        <p className="text-xs text-gray-500">Click Rate</p>
                                    </div>
                                    {campaign.status === 'draft' && (
                                        <Button size="sm" className="bg-green-600" onClick={() => sendCampaign(campaign._id)}>
                                            <Send className="w-4 h-4 mr-1" />
                                            Send Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={analyticsPeriod} onValueChange={(v) => { setAnalyticsPeriod(v); loadAnalytics(); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Last 7 Days</SelectItem>
                            <SelectItem value="week">Last 28 Days</SelectItem>
                            <SelectItem value="month">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { loadAnalytics(); loadLoyaltyStats(); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Email Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Sent</span>
                                <span className="font-bold text-2xl">{analytics?.summary?.emailCampaigns?.sent || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Opened</span>
                                <span className="font-bold text-2xl text-green-600">{analytics?.summary?.emailCampaigns?.opened || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Clicked</span>
                                <span className="font-bold text-2xl text-blue-600">{analytics?.summary?.emailCampaigns?.clicked || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customer Segments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Total Customers</span>
                                <span className="font-bold">{analytics?.summary?.totalCustomers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Active</span>
                                <span className="font-bold text-green-600">{analytics?.summary?.activeCustomers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Avg Order Value</span>
                                <span className="font-bold text-amber-600">KES {analytics?.summary?.avgOrderValue?.toFixed(0) || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Total Reviews</span>
                                <span className="font-bold">{analytics?.summary?.totalReviews || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Positive Rate</span>
                                <span className="font-bold text-green-600">{analytics?.summary?.positiveReviewRate || 0}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Loyalty Stats Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-500" />
                        Loyalty Program Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600">{loyaltyStats?.totalMembers || 0}</p>
                            <p className="text-sm text-gray-600">Total Members</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <p className="text-3xl font-bold text-amber-600">{loyaltyStats?.bronze || 0}</p>
                            <p className="text-sm text-gray-600">Bronze</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-3xl font-bold text-gray-600">{loyaltyStats?.silver || 0}</p>
                            <p className="text-sm text-gray-600">Silver</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-600">{loyaltyStats?.gold || 0}</p>
                            <p className="text-sm text-gray-600">Gold</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                            <p className="text-3xl font-bold text-indigo-600">{loyaltyStats?.platinum || 0}</p>
                            <p className="text-sm text-gray-600">Platinum</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600">{loyaltyStats?.pointsEarned?.toLocaleString() || 0}</p>
                            <p className="text-sm text-gray-600">Points Earned</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600">{loyaltyStats?.pointsRedeemed?.toLocaleString() || 0}</p>
                            <p className="text-sm text-gray-600">Points Redeemed</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Customer Engagement</h2>
                    <p className="text-gray-500">Manage reviews, loyalty, and marketing campaigns</p>
                </div>
            </div>

            {loading && <PageLoader text="Loading engagement data..." />}

            {!loading && (

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="customers">Customers</TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        {renderOverview()}
                    </TabsContent>

                    <TabsContent value="reviews">
                        {renderReviews()}
                    </TabsContent>

                    <TabsContent value="customers">
                        {renderCustomers()}
                    </TabsContent>

                    <TabsContent value="campaigns">
                        {renderCampaigns()}
                    </TabsContent>

                    <TabsContent value="analytics">
                        {renderAnalytics()}
                    </TabsContent>
                </Tabs>
            )}

            {/* Campaign Creation Dialog */}
            <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Campaign</DialogTitle>
                        <DialogDescription>Create a new email or SMS campaign</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Campaign Name</Label>
                            <Input
                                value={campaignForm.name}
                                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                placeholder="e.g., Weekend Special Offer"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={campaignForm.type}
                                    onValueChange={(v) => setCampaignForm({ ...campaignForm, type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={campaignForm.category}
                                    onValueChange={(v) => setCampaignForm({ ...campaignForm, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="promotional">Promotional</SelectItem>
                                        <SelectItem value="welcome">Welcome</SelectItem>
                                        <SelectItem value="winback">Win-back</SelectItem>
                                        <SelectItem value="reorder">Reorder</SelectItem>
                                        <SelectItem value="birthday">Birthday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {campaignForm.type === 'email' && (
                            <div className="space-y-2">
                                <Label>Subject Line</Label>
                                <Input
                                    value={campaignForm.subject}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                                    placeholder="e.g., You deserve a treat! 🎉"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={campaignForm.message}
                                onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                placeholder="Write your message here..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={createCampaign}>Create Campaign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Customer Detail Dialog */}
            <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedCustomer.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedCustomer.name || 'Unknown'}</h3>
                                    <Badge className={getSegmentColor(selectedCustomer.segment)}>{selectedCustomer.segment}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email</Label>
                                    <p className="text-gray-700">{selectedCustomer.email}</p>
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <p className="text-gray-700">{selectedCustomer.phone}</p>
                                </div>
                                <div>
                                    <Label>Total Orders</Label>
                                    <p className="text-gray-700">{selectedCustomer.totalOrders}</p>
                                </div>
                                <div>
                                    <Label>Total Spent</Label>
                                    <p className="text-gray-700">KES {selectedCustomer.totalSpent?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <Label>Birthday</Label>
                                    <p className="text-gray-700">{selectedCustomer.birthday || 'Not set'}</p>
                                </div>
                                <div>
                                    <Label>Last Active</Label>
                                    <p className="text-gray-700">
                                        {selectedCustomer.lastActive ? new Date(selectedCustomer.lastActive).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                            {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                                <div>
                                    <Label>Tags</Label>
                                    <div className="flex gap-2 mt-2">
                                        {selectedCustomer.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
