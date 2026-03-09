import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, Users, Mail, Phone, ArrowRight, Home } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiBaseUrl";

const ReservationConfirmationPage = () => {
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get("id");

    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
        }
    }, [reservationId]);

    const fetchReservation = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/reservations/${reservationId}`
            );
            const data = await response.json();
            if (data.reservation) {
                setReservation(data.reservation);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="pt-20 pb-16 min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading reservation details...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-2xl">
                <Card className="border-primary/10">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                            Reservation Confirmed!
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            Thank you for booking with The Quill. A confirmation email has been sent to your inbox.
                        </p>

                        {reservation ? (
                            <div className="bg-muted rounded-lg p-6 text-left mb-6">
                                <h2 className="font-semibold mb-4">Reservation Details</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-primary" size={18} />
                                        <span>{reservation.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-primary" size={18} />
                                        <span>{reservation.time}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="text-primary" size={18} />
                                        <span>{reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}</span>
                                    </div>
                                    {reservation.tableName && (
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">Table:</span>
                                            <span>{reservation.tableName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">Reservation ID:</span>
                                        <span className="font-mono text-sm">{reservation._id}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mb-6">
                                Reservation ID: {reservationId}
                            </p>
                        )}

                        <div className="space-y-3">
                            <Link to="/">
                                <Button className="w-full">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Link to="/menu">
                                <Button variant="outline" className="w-full">
                                    View Our Menu
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
};

export default ReservationConfirmationPage;
