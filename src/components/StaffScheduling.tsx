import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Clock,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
    Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
    id: string;
    name: string;
    role: string;
    color: string;
}

interface Shift {
    id: string;
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
}

const STAFF: StaffMember[] = [
    { id: "s1", name: "John Smith", role: "Head Chef", color: "bg-red-500" },
    { id: "s2", name: "Sarah Johnson", role: "Sous Chef", color: "bg-orange-500" },
    { id: "s3", name: "Mike Brown", role: "Line Cook", color: "bg-yellow-500" },
    { id: "s4", name: "Emily Davis", role: "Server", color: "bg-green-500" },
    { id: "s5", name: "David Wilson", role: "Server", color: "bg-teal-500" },
    { id: "s6", name: "Lisa Anderson", role: "Bartender", color: "bg-blue-500" },
    { id: "s7", name: "James Taylor", role: "Host", color: "bg-purple-500" },
    { id: "s8", name: "Maria Garcia", role: "Manager", color: "bg-pink-500" },
];

const DEMO_SHIFTS: Shift[] = [
    { id: "sh1", staffId: "s1", date: "2026-02-28", startTime: "09:00", endTime: "17:00", role: "Head Chef" },
    { id: "sh2", staffId: "s2", date: "2026-02-28", startTime: "10:00", endTime: "18:00", role: "Sous Chef" },
    { id: "sh3", staffId: "s3", date: "2026-02-28", startTime: "14:00", endTime: "22:00", role: "Line Cook" },
    { id: "sh4", staffId: "s4", date: "2026-02-28", startTime: "11:00", endTime: "19:00", role: "Server" },
    { id: "sh5", staffId: "s5", date: "2026-02-28", startTime: "16:00", endTime: "23:00", role: "Server" },
    { id: "sh6", staffId: "s6", date: "2026-02-28", startTime: "14:00", endTime: "22:00", role: "Bartender" },
    { id: "sh7", staffId: "s7", date: "2026-02-28", startTime: "10:00", endTime: "18:00", role: "Host" },
    { id: "sh8", staffId: "s8", date: "2026-02-28", startTime: "09:00", endTime: "17:00", role: "Manager" },
    // Next day
    { id: "sh9", staffId: "s1", date: "2026-03-01", startTime: "09:00", endTime: "17:00", role: "Head Chef" },
    { id: "sh10", staffId: "s2", date: "2026-03-01", startTime: "14:00", endTime: "22:00", role: "Sous Chef" },
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
const ROLES = ["Head Chef", "Sous Chef", "Line Cook", "Server", "Bartender", "Host", "Manager", "Dishwasher"];

const StaffScheduling = () => {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date("2026-02-28"));
    const [shifts, setShifts] = useState<Shift[]>(DEMO_SHIFTS);
    const [viewMode, setViewMode] = useState<"week" | "day">("week");
    const [selectedRole, setSelectedRole] = useState("all");

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const getWeekDates = (date: Date) => {
        const dates = [];
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const getShiftForStaffAndDate = (staffId: string, date: Date) => {
        const dateStr = formatDate(date);
        return shifts.find(s => s.staffId === staffId && s.date === dateStr);
    };

    const getStaffForRole = (role: string) => {
        if (role === "all") return STAFF;
        return STAFF.filter(s => s.role === role);
    };

    const navigateDate = (direction: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === "week") {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setDate(newDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const stats = {
        totalStaff: STAFF.length,
        workingToday: shifts.filter(s => s.date === formatDate(currentDate)).length,
        roles: ROLES.length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Staff Scheduling</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Request
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shift
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.totalStaff}</div>
                        <p className="text-sm text-muted-foreground">Total Staff</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500">
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.workingToday}</div>
                        <p className="text-sm text-muted-foreground">Working Today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.roles}</div>
                        <p className="text-sm text-muted-foreground">Roles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium min-w-[200px] text-center">
                        {viewMode === "week"
                            ? `Week of ${getWeekDates(currentDate)[0].toLocaleDateString()}`
                            : currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                        }
                    </span>
                    <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                </div>

                <div className="flex gap-2">
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === "day" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("day")}
                        >
                            Day
                        </Button>
                        <Button
                            variant={viewMode === "week" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("week")}
                        >
                            Week
                        </Button>
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All Roles</option>
                        {ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Schedule Grid */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 w-48">Staff</th>
                                    {viewMode === "week" ? (
                                        getWeekDates(currentDate).map(date => (
                                            <th
                                                key={date.toISOString()}
                                                className={`text-center p-3 ${formatDate(date) === formatDate(new Date()) ? "bg-blue-50" : ""}`}
                                            >
                                                <div className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                                                <div className="font-medium">{date.getDate()}</div>
                                            </th>
                                        ))
                                    ) : (
                                        <th className="text-center p-3">Schedule</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {getStaffForRole(selectedRole).map(staff => (
                                    <tr key={staff.id} className="border-b">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full ${staff.color} flex items-center justify-center text-white text-xs font-medium`}>
                                                    {staff.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{staff.name}</div>
                                                    <div className="text-xs text-muted-foreground">{staff.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {viewMode === "week" ? (
                                            getWeekDates(currentDate).map(date => {
                                                const shift = getShiftForStaffAndDate(staff.id, date);
                                                const isToday = formatDate(date) === formatDate(new Date());
                                                return (
                                                    <td
                                                        key={date.toISOString()}
                                                        className={`p-1 ${isToday ? "bg-blue-50" : ""}`}
                                                    >
                                                        {shift && (
                                                            <div className={`${staff.color} text-white text-xs rounded p-1 text-center`}>
                                                                <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })
                                        ) : (
                                            <td className="p-3">
                                                {getShiftForStaffAndDate(staff.id, currentDate) ? (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {getShiftForStaffAndDate(staff.id, currentDate)?.startTime} -
                                                            {getShiftForStaffAndDate(staff.id, currentDate)?.endTime}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No shift</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {STAFF.filter((s, i, arr) => arr.findIndex(x => x.role === s.role) === i).map(staff => (
                            <div key={staff.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${staff.color}`} />
                                <span className="text-sm">{staff.role}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffScheduling;
