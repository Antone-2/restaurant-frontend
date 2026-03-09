import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi, reservationsApi } from "@/services/api";
import {
    Table as TableIcon,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    RefreshCw,
    Plus,
    Pencil,
    Trash2,
    Calendar
} from "lucide-react";

const SECTIONS = [
    { id: "window", name: "Window", color: "bg-blue-100" },
    { id: "main", name: "Main Dining", color: "bg-green-100" },
    { id: "bar", name: "Bar Area", color: "bg-yellow-100" },
    { id: "private", name: "Private Room", color: "bg-purple-100" },
    { id: "vip", name: "VIP Room", color: "bg-amber-100" },
];

const TABLE_STATUSES = [
    { id: "available", name: "Available", color: "bg-green-500" },
    { id: "occupied", name: "Occupied", color: "bg-red-500" },
    { id: "reserved", name: "Reserved", color: "bg-blue-500" },
    { id: "maintenance", name: "Maintenance", color: "bg-yellow-500" },
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

interface Reservation {
    _id?: string;
    name: string;
    date: string;
    time: string;
    guests: number;
    tableName?: string;
}

interface TableFormData {
    tableNumber: string;
    capacity: number;
    section: string;
    status: string;
}

const TableManagement = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<TableFormData>({
        tableNumber: "",
        capacity: 4,
        section: "main",
        status: "available",
    });

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
            // Handle different API response formats
            const reservationsArray = Array.isArray(data)
                ? data
                : (data as any)?.reservations || (data as any)?.data || [];
            setReservations(reservationsArray as Reservation[]);
        } catch (err) {
            console.error("Failed to load reservations:", err);
            setReservations([]);
        }
    };

    const handleAddTable = async () => {
        setIsSubmitting(true);
        try {
            const newTable = await adminApi.createTable({
                tableNumber: formData.tableNumber,
                capacity: formData.capacity,
                section: formData.section,
                status: formData.status,
            });
            setTables([...tables, newTable.table || newTable]);
            setIsAddModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error creating table:', err);
            alert('Failed to create table. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTable = async () => {
        if (!selectedTable) return;
        setIsSubmitting(true);
        try {
            const updatedTable = await adminApi.updateTable(selectedTable._id, {
                tableNumber: formData.tableNumber,
                capacity: formData.capacity,
                section: formData.section,
                status: formData.status,
            });
            setTables(tables.map(t => t._id === selectedTable._id ? { ...t, ...updatedTable.table || updatedTable } : t));
            setIsEditModalOpen(false);
            setSelectedTable(null);
            resetForm();
        } catch (err) {
            console.error('Error updating table:', err);
            alert('Failed to update table. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTable = async () => {
        if (!selectedTable) return;
        setIsSubmitting(true);
        try {
            await adminApi.deleteTable(selectedTable._id);
            setTables(tables.filter(t => t._id !== selectedTable._id));
            setIsDeleteDialogOpen(false);
            setSelectedTable(null);
        } catch (err) {
            console.error('Error deleting table:', err);
            alert('Failed to delete table. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReserveTable = async () => {
        if (!selectedTable) return;
        setIsSubmitting(true);
        try {
            await adminApi.updateTable(selectedTable._id, {
                status: "reserved",
            });
            setTables(tables.map(t => t._id === selectedTable._id ? { ...t, status: "reserved" as const } : t));
            setIsReserveDialogOpen(false);
            setSelectedTable(null);
        } catch (err) {
            console.error('Error reserving table:', err);
            alert('Failed to reserve table. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (table: Table) => {
        setSelectedTable(table);
        setFormData({
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            section: table.section,
            status: table.status,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (table: Table) => {
        setSelectedTable(table);
        setIsDeleteDialogOpen(true);
    };

    const openReserveDialog = (table: Table) => {
        setSelectedTable(table);
        setIsReserveDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            tableNumber: "",
            capacity: 4,
            section: "main",
            status: "available",
        });
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

            {/* Stats and Add Button Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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

                {/* Add New Table Button */}
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Table
                </Button>
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
                        <CardContent className="pt-4">
                            <div className="flex justify-center mb-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${SECTIONS.find(s => s.id === table.section)?.color || "bg-gray-100"}`}>
                                    <TableIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-center">Table {table.tableNumber}</h3>
                            <p className="text-sm text-muted-foreground text-center">{table.capacity} seats</p>
                            <div className="mt-2 flex justify-center">
                                {getStatusBadge(table.status)}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-3 flex justify-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(table);
                                    }}
                                    title="Edit Table"
                                >
                                    <Pencil className="w-3 h-3" />
                                </Button>
                                {table.status === "available" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openReserveDialog(table);
                                        }}
                                        title="Reserve Table"
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <Calendar className="w-3 h-3" />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(table);
                                    }}
                                    title="Delete Table"
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>

                            {table.currentReservation && (
                                <div className="mt-2 text-xs text-center">
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

            {/* Add Table Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Table</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new table.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tableNumber">Table Number</Label>
                            <Input
                                id="tableNumber"
                                value={formData.tableNumber}
                                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                placeholder="e.g., 11, VIP-1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Capacity (seats)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min={1}
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Select
                                value={formData.section}
                                onValueChange={(value) => setFormData({ ...formData, section: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTIONS.map(section => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TABLE_STATUSES.map(status => (
                                        <SelectItem key={status.id} value={status.id}>
                                            {status.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTable}
                            disabled={isSubmitting || !formData.tableNumber || !formData.capacity}
                        >
                            {isSubmitting ? "Adding..." : "Add Table"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Table Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Table</DialogTitle>
                        <DialogDescription>
                            Update the details for Table {selectedTable?.tableNumber}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editTableNumber">Table Number</Label>
                            <Input
                                id="editTableNumber"
                                value={formData.tableNumber}
                                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editCapacity">Capacity (seats)</Label>
                            <Input
                                id="editCapacity"
                                type="number"
                                min={1}
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editSection">Section</Label>
                            <Select
                                value={formData.section}
                                onValueChange={(value) => setFormData({ ...formData, section: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTIONS.map(section => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editStatus">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TABLE_STATUSES.map(status => (
                                        <SelectItem key={status.id} value={status.id}>
                                            {status.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateTable}
                            disabled={isSubmitting || !formData.tableNumber || !formData.capacity}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Table</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete Table {selectedTable?.tableNumber}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTable}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting ? "Deleting..." : "Delete Table"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reserve Table Dialog */}
            <AlertDialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reserve Table</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark Table {selectedTable?.tableNumber} as reserved?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReserveTable}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? "Reserving..." : "Reserve Table"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TableManagement;

