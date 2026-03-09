import { AlertTriangle, Info } from "lucide-react";

const AllergenDisclaimerPage = () => {
    const allergens = [
        { name: "Gluten", icon: "🌾", description: "Wheat, barley, rye, oats" },
        { name: "Milk", icon: "🥛", description: "Lactose, casein, whey" },
        { name: "Eggs", icon: "🥚", description: "Mayonnaise, meringue" },
        { name: "Fish", icon: "🐟", description: "All fish and fish products" },
        { name: "Shellfish", icon: "🦐", description: "Crab, lobster, shrimp, prawns" },
        { name: "Tree Nuts", icon: "🥜", description: "Almonds, walnuts, cashews, pistachios" },
        { name: "Peanuts", icon: "🥜", description: "Groundnuts, peanut butter" },
        { name: "Soy", icon: "🫘", description: "Tofu, soy sauce, edamame" },
        { name: "Sesame", icon: "🌱", description: "Tahini, sesame oil, hummus" },
        { name: "Celery", icon: "🥬", description: "Celery stalks, leaves, seeds" },
        { name: "Mustard", icon: "🟡", description: "Mustard seeds, powder, sauce" },
        { name: "Sulphites", icon: "⚪", description: "Dried fruits, wine, processed foods" },
    ];

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Allergen Information</h1>
                    <p className="text-muted-foreground">Important information about food allergens in our dishes</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-amber-800">Important Notice</h3>
                            <p className="text-amber-700 text-sm mt-1">
                                If you have any food allergies or intolerances, please inform our staff before ordering.
                                We cannot guarantee that any item is completely free from allergens due to the nature
                                of our kitchen operations.
                            </p>
                        </div>
                    </div>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Common Food Allergens</h2>
                        <p className="text-muted-foreground mb-4">
                            The following are the 14 major food allergens that we handle in our kitchen:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {allergens.map((allergen) => (
                                <div key={allergen.name} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                                    <span className="text-2xl">{allergen.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">{allergen.name}</h3>
                                        <p className="text-sm text-muted-foreground">{allergen.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">How We Handle Allergens</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>We maintain separate preparation areas for allergen-free items where possible</li>
                            <li>Our staff are trained to handle allergen-related queries</li>
                            <li>We label menu items with allergen information where applicable</li>
                            <li>Please inform us of any allergies when placing your order</li>
                            <li>Cross-contamination may occur despite our best efforts</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Your Responsibility</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Always inform our staff about your allergies before ordering</li>
                            <li>Check the allergen information on our menu</li>
                            <li>Ask about ingredients if you're unsure</li>
                            <li>Carry any necessary medication (e.g., EpiPen) if you have severe allergies</li>
                            <li>If you have multiple or severe allergies, consider contacting us in advance</li>
                        </ul>
                    </section>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-semibold text-blue-800">Cross-Contamination Warning</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Our kitchen handles a wide variety of ingredients. While we take precautions,
                                we cannot guarantee that our food is completely free from traces of any allergen.
                                If you have severe allergies, please exercise caution or contact us directly.
                            </p>
                        </div>
                    </div>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Special Dietary Requirements</h2>
                        <p className="text-muted-foreground mb-4">
                            We aim to accommodate various dietary requirements:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Vegetarian:</strong> We offer a selection of meat-free dishes</li>
                            <li><strong>Vegan:</strong> Many plant-based options are available</li>
                            <li><strong>Halal:</strong> Please ask our staff about available options</li>
                            <li><strong>Gluten-Free:</strong> Some dishes can be prepared without gluten - please ask</li>
                            <li><strong>Dairy-Free:</strong> We can prepare certain dishes without dairy</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Contact Us</h2>
                        <p className="text-muted-foreground">
                            For specific allergen information or to discuss your dietary requirements, please contact us:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                            <li>Phone: 0113 857846</li>
                            <li>Email: thequillrestaurant@gmail.com</li>
                            <li>WhatsApp: Available on our website</li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AllergenDisclaimerPage;
