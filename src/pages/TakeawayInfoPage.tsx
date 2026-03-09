import { Clock, Phone, ShoppingBag } from "lucide-react";

const TakeawayInfoPage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Takeaway Information</h1>
                    <p className="text-muted-foreground">Order for pickup and enjoy The Quill at home</p>
                </div>

                <div className="space-y-6">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingBag className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">How Takeaway Works</h2>
                        </div>
                        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                            <li>Browse our menu and select your desired items</li>
                            <li>Add items to your cart</li>
                            <li>At checkout, select "Takeaway" as your order type</li>
                            <li>Complete your payment</li>
                            <li>Receive a confirmation with estimated pickup time</li>
                            <li>Visit us at our location to collect your order</li>
                        </ol>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">Pickup Times</h2>
                        </div>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Standard orders: Ready in 15-30 minutes</li>
                            <li>Large orders: May take 30-45 minutes</li>
                            <li>You will receive a notification when your order is ready</li>
                            <li>We prepare orders fresh, so please allow adequate time</li>
                            <li>Pickup available 24 hours a day, 7 days a week</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Benefits of Takeaway</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>No delivery fees - save on delivery costs</li>
                            <li>Pick up on your way home or to work</li>
                            <li>Fresh food - collect and eat when you want</li>
                            <li>Flexible timing - order ahead and pick up when convenient</li>
                            <li>Support local - reduce packaging waste by bringing your own containers</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">When You Arrive</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Park in our designated pickup area</li>
                            <li>Call us or use WhatsApp to let us know you've arrived</li>
                            <li>Provide your order number or name</li>
                            <li>Our staff will bring your order to your vehicle</li>
                            <li>Or you can pick up inside at the counter</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Packaging</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>We use eco-friendly packaging whenever possible</li>
                            <li>Hot items are packaged in insulated containers</li>
                            <li>Special instructions for packaging can be noted at checkout</li>
                            <li>Bring your own reusable container and get a small discount!</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="text-primary" size={28} />
                            <h2 className="font-display text-2xl font-bold text-card-foreground">Order Takeaway</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Place your takeaway order through:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>Online: thequill.co.ke</li>
                            <li>Phone: 0113 857846</li>
                            <li>WhatsApp: Available on our website</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default TakeawayInfoPage;
