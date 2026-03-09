import { Clock, MapPin, Phone, Truck } from "lucide-react";

const DeliveryInformationPage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Delivery Information</h1>
                    <p className="text-muted-foreground">Everything you need to know about our delivery service</p>
                </div>

                <div className="space-y-6">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">Delivery Areas</h2>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            We deliver to Korinda and surrounding areas. Our delivery coverage includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Korinda town and immediate surroundings</li>
                            <li>Busia town and nearby areas</li>
                            <li>Kisumu-Busia road corridor</li>
                            <li>Nambale area</li>
                            <li>Other areas may be available upon request - contact us to confirm</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">Delivery Times</h2>
                        </div>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Standard delivery: 30-60 minutes</li>
                            <li>Express delivery (when available): 20-30 minutes</li>
                            <li>Large orders may take additional time</li>
                            <li>Delivery times may vary during peak hours</li>
                            <li>We deliver 24 hours a day, 7 days a week</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Delivery Fees</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Orders within Korinda town: KES 100-200</li>
                            <li>Orders to surrounding areas: KES 200-500</li>
                            <li>Free delivery for orders over KES 3,000</li>
                            <li>Delivery fees will be calculated at checkout</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">How to Order for Delivery</h2>
                        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Browse our menu and add items to your cart</li>
                            <li>Proceed to checkout and enter your delivery address</li>
                            <li>Select your preferred payment method</li>
                            <li>Place your order and receive confirmation</li>
                            <li>Track your order in real-time</li>
                            <li>Receive your order at your doorstep</li>
                        </ol>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Delivery Tips</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Provide accurate delivery address and contact number</li>
                            <li>Be available to receive the order</li>
                            <li>Include landmarks in your address for easier location</li>
                            <li>Tip your delivery person for excellent service (optional)</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">Contact Us for Delivery</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Have questions about delivery? Contact us:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
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

export default DeliveryInformationPage;
