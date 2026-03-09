import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    Phone,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    CalendarDays,
    List,
    Ban
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns";

interface Reservation {
    _id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    tableName?: string;
    status: string;
    specialRequests?: string;
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    "no-show": "bg-gray-500",
};

const ReservationCalendar = () => {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        loadReservations();
    }, [currentDate, statusFilter]);

    const loadReservations = async () => {
        setLoading(true);
        try {
            const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
            const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

            let url = `/api/reservations?startDate=${startDate}&endDate=${endDate}`;
            if (statusFilter !== "all") {
                url += `&status=${statusFilter}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.reservations) {
                setReservations(data.reservations);
            }
        } catch (err) {
            console.error("Error loading reservations:", err);
            toast({
                title: "Error",
                description: "Failed to load reservations",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Get reservations for a specific day
    const getReservationsForDay = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return reservations.filter(r => r.date === dateStr);
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Add padding for days before month starts
        const startDay = monthStart.getDay();
        const paddingDays = Array(startDay).fill(null);

        return [...paddingDays, ...days];
    };

    // Handle status change
    const handleStatusChange = async (reservationId: string, newStatus: string) => {
        try {
            const response = await fetch(
                `/api/reservations/${reservationId}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                toast({
                    title: "Status Updated",
                    description: `Reservation marked as ${newStatus}`
                });
                loadReservations();
                setDetailsOpen(false);
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            });
        }
    };

    // Add to blacklist
    const handleBlacklist = async (reservation: Reservation) => {
        try {
            const response = await fetch(
                `/api/reservations/blacklist`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: reservation.name,
                        email: reservation.email,
                        phone: reservation.phone,
                        reason: "Marked as no-show"
                    })
                }
            );

            if (response.ok) {
                toast({
                    title: "Blacklisted",
                    description: `${reservation.name} has been added to the blacklist`
                });
                // Also mark as no-show
                await handleStatusChange(reservation._id, "no-show");
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to add to blacklist",
                variant: "destructive"
            });
        }
    };

    // Filter reservations
    const filteredReservations = reservations.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm)
    );

    // Stats
    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === "pending").length,
        confirmed: reservations.filter(r => r.status === "confirmed").length,
        completed: reservations.filter(r => r.status === "completed").length,
        noShow: reservations.filter(r => r.status === "no-show").length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Reservations Calendar</h2>
                    <p className="text-muted-foreground">Manage table bookings</p>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                            {format(currentDate, "MMMM yyyy")}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>

                    <div className="flex gap-1">
                        <Button
                            variant={viewMode === "calendar" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("calendar")}
                        >
                            <CalendarDays className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                        <p className="text-sm text-muted-foreground">Confirmed</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-600">{stats.noShow}</div>
                        <p className="text-sm text-muted-foreground">No Shows</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Calendar View */}
            {viewMode === "calendar" && (
                <Card>
                    <CardContent className="p-4">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="h-24" />;
                                }

                                const dayReservations = getReservationsForDay(day);

                                return (
                                    <div
                                        key={day.toString()}
                                        className={`min-h-[100px] border rounded-lg p-2 ${isToday(day) ? "border-primary bg-primary/5" : "border-input"
                                            }`}
                                    >
                                        <div className={`text-sm font-medium mb-1 ${!isSameMonth(day, currentDate) ? "text-muted-foreground" : ""
                                            }`}>
                                            {format(day, "d")}
                                        </div>
                                        <div className="space-y-1">
                                            {dayReservations.slice(0, 3).map(res => (
                                                <div
                                                    key={res._id}
                                                    onClick={() => {
                                                        setSelectedReservation(res);
                                                        setDetailsOpen(true);
                                                    }}
                                                    className={`text-xs p-1 rounded cursor-pointer truncate ${STATUS_COLORS[res.status]} text-white`}
                                                >
                                                    {res.time} - {res.name}
                                                </div>
                                            ))}
                                            {dayReservations.length > 3 && (
                                                <div className="text-xs text-muted-foreground text-center">
                                                    +{dayReservations.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Date & Time</th>
                                        <th className="text-left p-4 font-medium">Guest</th>
                                        <th className="text-left p-4 font-medium">Party Size</th>
                                        <th className="text-left p-4 font-medium">Table</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservations.map(reservation => (
                                        <tr
                                            key={reservation._id}
                                            className="border-b hover:bg-muted/50 cursor-pointer"
                                            onClick={() => {
                                                setSelectedReservation(reservation);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{reservation.date}</div>
                                                        <div className="text-sm text-muted-foreground">{reservation.time}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>{reservation.name}</div>
                                                <div className="text-sm text-muted-foreground">{reservation.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    {reservation.guests}
                                                </div>
                                            </td>
                                            <td className="p-4">{reservation.tableName || "—"}</td>
                                            <td className="p-4">
                                                <Badge className={STATUS_COLORS[reservation.status]}>
                                                    {reservation.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">View</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reservation Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reservation Details</DialogTitle>
                    </DialogHeader>

                    {selectedReservation && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge className={STATUS_COLORS[selectedReservation.status]}>
                                    {selectedReservation.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {selectedReservation._id}
                                </span>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{selectedReservation.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedReservation.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedReservation.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedReservation.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedReservation.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedReservation.guests} guests</span>
                                </div>
                                {selectedReservation.tableName && (
                                    <div className="flex items-center gap-2">
                                        <span>Table:</span>
                                        <span>{selectedReservation.tableName}</span>
                                    </div>
                                )}
                                {selectedReservation.specialRequests && (
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{selectedReservation.specialRequests}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {selectedReservation.status === "pending" && (
                                    <Button onClick={() => handleStatusChange(selectedReservation._id, "confirmed")}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Confirm
                                    </Button>
                                )}
                                {(selectedReservation.status === "pending" || selectedReservation.status === "confirmed") && (
                                    <>
                                        <Button variant="outline" onClick={() => handleStatusChange(selectedReservation._id, "completed")}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Mark Completed
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleStatusChange(selectedReservation._id, "no-show")}>
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            No Show
                                        </Button>
                                        <Button variant="outline" onClick={() => handleStatusChange(selectedReservation._id, "cancelled")}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                    onClick={() => handleBlacklist(selectedReservation)}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Blacklist
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReservationCalendar;
