const CancellationPolicyPage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Cancellation Policy</h1>
                    <p className="text-muted-foreground">Our cancellation and refund terms</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Order Cancellation</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Orders can be cancelled within 10 minutes of placing the order without any charges.</li>
                            <li>After 10 minutes, the order may have already been prepared and cannot be cancelled.</li>
                            <li>To cancel an order, please call us at 0113 857846 or contact us via WhatsApp.</li>
                            <li>Please provide your order number when requesting cancellation.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Reservation Cancellation</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Table reservations can be cancelled up to 2 hours before the scheduled time without any penalty.</li>
                            <li>Cancellations made less than 2 hours before may incur a small fee.</li>
                            <li>No-shows without prior cancellation may affect future reservation privileges.</li>
                            <li>To cancel a reservation, please call us or use our online reservation system.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Refund Policy</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Refunds are available for orders that have not been prepared or delivered.</li>
                            <li>If you receive an incorrect or unsatisfactory order, please contact us within 24 hours.</li>
                            <li>Refund requests will be reviewed on a case-by-case basis.</li>
                            <li>Refunds will be processed within 5-7 business days to the original payment method.</li>
                            <li>For cash payments, refunds will be provided in cash or M-Pesa transfer.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Event Catering Cancellation</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Event catering orders require a 50% deposit to confirm booking.</li>
                            <li>Cancellation more than 7 days before the event: Full refund of deposit.</li>
                            <li>Cancellation 3-7 days before the event: 50% refund of deposit.</li>
                            <li>Cancellation less than 3 days before the event: No refund of deposit.</li>
                            <li>Date changes may be accommodated subject to availability.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Contact Us</h2>
                        <p>
                            If you need to cancel an order or request a refund, please contact us:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>Phone: 0113 857846</li>
                            <li>WhatsApp: Available on our website</li>
                            <li>Email: thequillrestaurant@gmail.com</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default CancellationPolicyPage;
