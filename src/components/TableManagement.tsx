import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, reservationsApi } from "@/services/api";
import {
    Table as TableIcon,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Plus,
    Pencil,
    RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
    { id: "window", name: "Window", color: "bg-blue-100" },
    { id: "main", name: "Main Dining", color: "bg-green-100" },
    { id: "bar", name: "Bar Area", color: "bg-yellow-100" },
    { id: "private", name: "Private Room", color: "bg-purple-100" },
    { id: "vip", name: "VIP Room", color: "bg-amber-100" },
];

// Fallback demo tables when API is not available
const DEMO_TABLES = [
    { _id: "t1", tableNumber: "1", capacity: 2, section: "window", status: "available", isActive: true },
    { _id: "t2", tableNumber: "2", capacity: 2, section: "window", status: "occupied", isActive: true },
    { _id: "t3", tableNumber: "3", capacity: 4, section: "main", status: "reserved", isActive: true },
    { _id: "t4", tableNumber: "4", capacity: 4, section: "main", status: "available", isActive: true },
    { _id: "t5", tableNumber: "5", capacity: 6, section: "main", status: "occupied", isActive: true },
    { _id: "t6", tableNumber: "6", capacity: 6, section: "private", status: "available", isActive: true },
    { _id: "t7", tableNumber: "7", capacity: 8, section: "private", status: "reserved", isActive: true },
    { _id: "t8", tableNumber: "8", capacity: 4, section: "bar", status: "occupied", isActive: true },
    { _id: "t9", tableNumber: "9", capacity: 2, section: "bar", status: "available", isActive: true },
    { _id: "t10", tableNumber: "VIP", capacity: 12, section: "vip", status: "available", isActive: true },
];

interface Table {
    _id: string;
    tableNumber: string;
    capacity: number;
    section: string;
    status: "available" | "occupied" | "reserved" | "maintenance";
    isActive?: boolean;
    position?: string;
    currentReservation?: {
        name: string;
        time: string;
        guests: number;
    };
}

const TableManagement = () => {
    const { toast } = useToast();
    const [tables, setTables] = useState<Table[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTables();
        loadReservations();
    }, []);

    const loadTables = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await adminApi.getTables();
            setTables(data?.tables || data || []);
        } catch (err) {
            console.error('Error loading tables:', err);
            // Use demo data on error
            setTables(DEMO_TABLES as Table[]);
            setError('Using offline data');
        } finally {
            setLoading(false);
        }
    };

    const loadReservations = async () => {
        try {
            const data = await reservationsApi.getAll();
            setReservations(data);
        } catch (err) {
            console.error("Failed to load reservations:", err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Available</Badge>;
            case "occupied":
                return <Badge className="bg-red-500"><Users className="w-3 h-3 mr-1" /> Occupied</Badge>;
            case "reserved":
                return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" /> Reserved</Badge>;
            case "maintenance":
                return <Badge className="bg-yellow-500"><AlertCircle className="w-3 h-3 mr-1" /> Maintenance</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "border-green-500 bg-green-50";
            case "occupied":
                return "border-red-500 bg-red-50";
            case "reserved":
                return "border-blue-500 bg-blue-50";
            case "maintenance":
                return "border-yellow-500 bg-yellow-50";
            default:
                return "border-gray-300";
        }
    };

    const filteredTables = tables.filter(table => {
        const matchesSection = selectedSection === "all" || table.section === selectedSection;
        const tableName = `Table ${table.tableNumber}`.toLowerCase();
        const matchesSearch = tableName.includes(searchTerm.toLowerCase()) ||
            table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSection && matchesSearch;
    });

    const stats = {
        total: tables.length,
        available: tables.filter(t => t.status === "available").length,
        occupied: tables.filter(t => t.status === "occupied").length,
        reserved: tables.filter(t => t.status === "reserved").length,
        totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    };

    const getTodayReservations = () => {
        const today = new Date().toISOString().split("T")[0];
        return reservations.filter(r => r.date?.includes(today) || r.date === today);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading tables...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="main" aria-label="Table Management">
            {/* Error Banner */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">{error}</span>
                    <Button variant="ghost" size="sm" onClick={loadTables} className="ml-auto">
                        <RefreshCw className="w-4 h-4 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="region" aria-label="Table Statistics">
                <Card aria-label="Total tables count">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Tables</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                        <p className="text-sm text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
                <Card className="border-red-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
                        <p className="text-sm text-muted-foreground">Occupied</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.reserved}</div>
                        <p className="text-sm text-muted-foreground">Reserved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.totalCapacity}</div>
                        <p className="text-sm text-muted-foreground">Total Seats</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedSection === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSection("all")}
                    >
                        All Sections
                    </Button>
                    {SECTIONS.map(section => (
                        <Button
                            key={section.id}
                            variant={selectedSection === section.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSection(section.id)}
                            className="capitalize"
                        >
                            {section.name}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-48"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={loadTables}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Today's Reservations */}
            {getTodayReservations().length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Today's Reservations ({getTodayReservations().length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {getTodayReservations().slice(0, 5).map((res, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-muted rounded-lg p-3 min-w-[150px]">
                                    <p className="font-semibold text-sm">{res.name}</p>
                                    <p className="text-xs text-muted-foreground">{res.time} • {res.guests} guests</p>
                                    <p className="text-xs text-muted-foreground">{res.tableName || "No table"}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredTables.map(table => (
                    <Card
                        key={table._id}
                        className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getStatusColor(table.status)}`}
                    >
                        <CardContent className="pt-4 text-center">
                            <div className="flex justify-center mb-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${SECTIONS.find(s => s.id === table.section)?.color || "bg-gray-100"}`}>
                                    <TableIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold">Table {table.tableNumber}</h3>
                            <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                            <div className="mt-2">
                                {getStatusBadge(table.status)}
                            </div>
                            {table.currentReservation && (
                                <div className="mt-2 text-xs">
                                    <p className="font-medium">{table.currentReservation.name}</p>
                                    <p className="text-muted-foreground">{table.currentReservation.time}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTables.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tables found</p>
                </div>
            )}
        </div>
    );
};

export default TableManagement;
