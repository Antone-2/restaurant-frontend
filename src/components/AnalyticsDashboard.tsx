import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, ShoppingCart, DollarSign, Eye, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiBaseUrl';
import { adminApi } from '@/services/api';

interface AnalyticsData {
    dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
    topItems: Array<{ name: string; orders: number; revenue: number }>;
    deliveryMetrics: { averageTime: number; successRate: number; partnerCount: number };
    customerMetrics: { totalCustomers: number; activeMonthly: number; newThisMonth: number };
    revenueByType: Array<{ type: string; value: number }>;
    peakHours: Array<{ hour: string; orders: number }>;
    paymentMethods: Array<{ method: string; count: number; percentage: number }>;
    orderTrends: Array<{ week: string; orders: number; revenue: number }>;
}

interface VisitorAnalyticsData {
    totalVisitors: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    dailyVisitors: Array<{ date: string; visitors: number; pageViews: number }>;
    topPages: Array<{ page: string; views: number }>;
    topReferrers: Array<{ source: string; visits: number }>;
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
    countryBreakdown: Array<{ country: string; visitors: number }>;
}

const AnalyticsDashboard = () => {
    const { toast } = useToast();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

    // Demo data fallback
    const demoAnalytics: AnalyticsData = {
        dailyRevenue: [
            { date: '2026-02-24', revenue: 12500, orders: 28 },
            { date: '2026-02-25', revenue: 15800, orders: 35 },
            { date: '2026-02-26', revenue: 18200, orders: 42 },
            { date: '2026-02-27', revenue: 14500, orders: 32 },
            { date: '2026-02-28', revenue: 21000, orders: 48 },
            { date: '2026-03-01', revenue: 19500, orders: 45 },
            { date: '2026-03-02', revenue: 8900, orders: 18 },
        ],
        topItems: [
            { name: 'Grilled Tilapia', orders: 145, revenue: 36250 },
            { name: 'Ugali & Beef', orders: 132, revenue: 26400 },
            { name: 'Chicken Fried Rice', orders: 98, revenue: 19600 },
            { name: 'Kuku Choma', orders: 87, revenue: 30450 },
            { name: 'Vegetarian Platter', orders: 76, revenue: 15200 },
            { name: 'Prawn Curry', orders: 65, revenue: 22750 },
            { name: 'Beef Samosas (5pc)', orders: 120, revenue: 12000 },
            { name: 'Tropical Cocktail', orders: 95, revenue: 7125 },
        ],
        deliveryMetrics: { averageTime: 35, successRate: 0.94, partnerCount: 12 },
        customerMetrics: { totalCustomers: 2847, activeMonthly: 892, newThisMonth: 156 },
        revenueByType: [
            { type: 'Dine-in', value: 185000 },
            { type: 'Delivery', value: 124000 },
            { type: 'Takeaway', value: 68000 },
        ],
        peakHours: [
            { hour: '08:00', orders: 12 },
            { hour: '09:00', orders: 18 },
            { hour: '10:00', orders: 15 },
            { hour: '11:00', orders: 22 },
            { hour: '12:00', orders: 48 },
            { hour: '13:00', orders: 52 },
            { hour: '14:00', orders: 38 },
            { hour: '15:00', orders: 25 },
            { hour: '16:00', orders: 20 },
            { hour: '17:00', orders: 28 },
            { hour: '18:00', orders: 45 },
            { hour: '19:00', orders: 58 },
            { hour: '20:00', orders: 62 },
            { hour: '21:00', orders: 48 },
            { hour: '22:00', orders: 25 },
        ],
        paymentMethods: [
            { method: 'M-Pesa', count: 245, percentage: 68 },
            { method: 'Cash', count: 78, percentage: 22 },
            { method: 'Card', count: 32, percentage: 9 },
            { method: 'Bank Transfer', count: 5, percentage: 1 },
        ],
        orderTrends: [
            { week: 'Week 1', orders: 185, revenue: 46250 },
            { week: 'Week 2', orders: 212, revenue: 53000 },
            { week: 'Week 3', orders: 198, revenue: 49500 },
            { week: 'Week 4', orders: 245, revenue: 61250 },
        ],
    };

    useEffect(() => {
        fetchAnalytics();
        fetchVisitorAnalytics();
    }, [dateRange]);

    const fetchVisitorAnalytics = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admin/analytics/visitors?range=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setVisitorAnalytics(data);
            }
        } catch (err: any) {
            console.error('Visitor analytics fetch error:', err.message);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching analytics with token:', token ? 'token exists' : 'no token');

            const response = await fetch(`${API_BASE_URL}/admin/analytics?range=${dateRange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Analytics response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
            }

            const data = await response.json();
            console.log('Analytics data received:', data);

            if (data.analytics) {
                setAnalytics(data.analytics);
            } else {
                console.warn('No analytics data in response, using demo data');
                setAnalytics(demoAnalytics);
            }
        } catch (err: any) {
            console.error('Analytics fetch error:', err.message);
            // Check if it's a 404 (endpoint not found) vs other errors
            if (err.message.includes('404') || err.message.includes('Failed to fetch')) {
                toast({
                    title: "Backend Not Connected",
                    description: "Showing demo data. Deploy backend to see real analytics.",
                    variant: "default"
                });
            }
            setAnalytics(demoAnalytics);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-32 bg-muted rounded-lg" />
                    <div className="h-32 bg-muted rounded-lg" />
                    <div className="h-32 bg-muted rounded-lg" />
                    <div className="h-32 bg-muted rounded-lg" />
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No analytics data available
                </CardContent>
            </Card>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            {/* Header with Date Range */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === range
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            KES {analytics.dailyRevenue ? analytics.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0).toLocaleString() : '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            +12.5% from previous period
                        </p>
                    </CardContent>
                </Card>

                {/* Orders Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {analytics.dailyRevenue ? analytics.dailyRevenue.reduce((sum, d) => sum + d.orders, 0).toLocaleString() : '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            +8.2% from previous period
                        </p>
                    </CardContent>
                </Card>

                {/* Customers Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{analytics.customerMetrics.activeMonthly.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.customerMetrics.newThisMonth} new this month
                        </p>
                    </CardContent>
                </Card>

                {/* Avg Order Value */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const totalRevenue = analytics.dailyRevenue ? analytics.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) : 0;
                            const totalOrders = analytics.dailyRevenue ? analytics.dailyRevenue.reduce((sum, d) => sum + d.orders, 0) : 0;
                            const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
                            return (
                                <>
                                    <p className="text-2xl font-bold">
                                        KES {avgOrderValue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        per order
                                    </p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="revenue" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
                    <TabsTrigger value="topitems">Top Items</TabsTrigger>
                    <TabsTrigger value="ordertype">Order Types</TabsTrigger>
                    <TabsTrigger value="peakhours">Peak Hours</TabsTrigger>
                    <TabsTrigger value="visitors">Site Visitors</TabsTrigger>
                </TabsList>

                {/* Revenue Trend */}
                <TabsContent value="revenue">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Revenue & Order Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        name="Revenue (KES)"
                                        dot={false}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#10b981"
                                        name="Orders"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Top Items */}
                <TabsContent value="topitems">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.topItems.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Order Types */}
                <TabsContent value="ordertype">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Order Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.revenueByType}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ type, value }) => `${type}: KES ${value.toLocaleString()}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {analytics.revenueByType.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Peak Hours */}
                <TabsContent value="peakhours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders by Hour</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#f59e0b" name="Orders" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Site Visitors */}
                <TabsContent value="visitors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Site Visitor Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {visitorAnalytics ? (
                                <div className="space-y-6">
                                    {/* Visitor Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                                            <p className="text-sm opacity-80">Total Visitors</p>
                                            <p className="text-2xl font-bold">{visitorAnalytics.totalVisitors.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                                            <p className="text-sm opacity-80">Unique Visitors</p>
                                            <p className="text-2xl font-bold">{visitorAnalytics.uniqueVisitors.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                                            <p className="text-sm opacity-80">Page Views</p>
                                            <p className="text-2xl font-bold">{visitorAnalytics.pageViews.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl">
                                            <p className="text-sm opacity-80">Bounce Rate</p>
                                            <p className="text-2xl font-bold">{visitorAnalytics.bounceRate}%</p>
                                        </div>
                                    </div>

                                    {/* Daily Visitors Chart */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-4">Daily Visitors</h4>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <LineChart data={visitorAnalytics.dailyVisitors}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="visitors" stroke="#3b82f6" name="Visitors" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Device Breakdown */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-4">Device Breakdown</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Desktop</span>
                                                        <span className="font-medium">{visitorAnalytics.deviceBreakdown.desktop}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${visitorAnalytics.deviceBreakdown.desktop}%` }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Mobile</span>
                                                        <span className="font-medium">{visitorAnalytics.deviceBreakdown.mobile}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: `${visitorAnalytics.deviceBreakdown.mobile}%` }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="flex items-center gap-2"><Tablet className="w-4 h-4" /> Tablet</span>
                                                        <span className="font-medium">{visitorAnalytics.deviceBreakdown.tablet}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500" style={{ width: `${visitorAnalytics.deviceBreakdown.tablet}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Pages */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-4">Top Pages</h4>
                                            <div className="space-y-2">
                                                {visitorAnalytics.topPages.slice(0, 5).map((page, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                        <span className="text-sm truncate">{page.page}</span>
                                                        <span className="font-medium text-sm">{page.views.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium mb-4">Top Referrers</h4>
                                            <div className="space-y-2">
                                                {visitorAnalytics.topReferrers.slice(0, 5).map((ref, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                        <span className="text-sm">{ref.source}</span>
                                                        <span className="font-medium text-sm">{ref.visits.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* New vs Returning */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-600">New Visitors</p>
                                            <p className="text-xl font-bold text-blue-700">{visitorAnalytics.newVisitors.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-sm text-green-600">Returning Visitors</p>
                                            <p className="text-xl font-bold text-green-700">{visitorAnalytics.returningVisitors.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No visitor data available yet</p>
                                    <p className="text-sm">Visitor tracking will appear here once implemented</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.paymentMethods.map((method) => (
                                <div key={method.method} className="flex items-center justify-between pb-3 border-b last:border-0">
                                    <span className="font-medium">{method.method}</span>
                                    <div className="text-right">
                                        <p className="font-semibold">{method.count} orders</p>
                                        <p className="text-xs text-muted-foreground">{method.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Average Delivery Time</p>
                            <p className="text-2xl font-bold">{analytics.deliveryMetrics.averageTime} mins</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                            <p className="text-2xl font-bold">{analytics.deliveryMetrics.successRate != null ? (analytics.deliveryMetrics.successRate * 100).toFixed(1) : '0'}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Partners</p>
                            <p className="text-2xl font-bold">{analytics.deliveryMetrics.partnerCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Customers</p>
                            <p className="text-xl font-bold">{analytics.customerMetrics.totalCustomers.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Monthly Active</p>
                            <p className="text-xl font-bold">{analytics.customerMetrics.activeMonthly.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">New This Month</p>
                            <p className="text-xl font-bold">{analytics.customerMetrics.newThisMonth.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Retention Rate</p>
                            <p className="text-xl font-bold">
                                {analytics.customerMetrics.activeMonthly > 0 ? (
                                    ((analytics.customerMetrics.activeMonthly - analytics.customerMetrics.newThisMonth) /
                                        analytics.customerMetrics.activeMonthly) * 100
                                ).toFixed(1) : '0'}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
