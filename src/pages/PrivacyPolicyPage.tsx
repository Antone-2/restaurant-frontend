const PrivacyPolicyPage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground">How we protect and handle your personal information</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">1. Introduction</h2>
                        <p>
                            At The Quill, we value your privacy and are committed to protecting your personal information.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                            you visit our website or use our services.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">2. Information We Collect</h2>
                        <p className="mb-2">We may collect the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, delivery address</li>
                            <li><strong>Payment Information:</strong> Credit card details, M-Pesa number (processed securely)</li>
                            <li><strong>Order Information:</strong> Food preferences, order history, special instructions</li>
                            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                            <li><strong>Location Information:</strong> Delivery address for order fulfillment</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">3. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Process and deliver your orders</li>
                            <li>Communicate with you about your orders</li>
                            <li>Improve our services and customer experience</li>
                            <li>Send promotional offers and updates (with your consent)</li>
                            <li>Comply with legal obligations</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">4. Information Sharing</h2>
                        <p className="mb-2">We may share your information with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Service providers who assist in our operations (payment processors, delivery partners)</li>
                            <li>Legal authorities when required by law</li>
                            <li>Business partners with your consent</li>
                        </ul>
                        <p className="mt-4">
                            We do <strong>not</strong> sell or rent your personal information to third parties.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">5. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your personal information.
                            This includes encryption, secure servers, and regular security audits.
                            However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">6. Your Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your information</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request data portability</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">7. Cookies</h2>
                        <p>
                            We use cookies to enhance your browsing experience. You can control cookies
                            through your browser settings. For more information, see our Cookie Policy.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">8. Children's Privacy</h2>
                        <p>
                            Our services are not intended for children under 13. We do not knowingly
                            collect personal information from children.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. We will notify you of any
                            material changes by posting the new policy on our website.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">10. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy, please contact us:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>Email: thequillrestaurant@gmail.com</li>
                            <li>Phone: 0113 857846</li>
                        </ul>
                    </section>

                    <p className="text-sm text-muted-foreground">
                        Last updated: March 2026
                    </p>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicyPage;
