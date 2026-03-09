const TermsOfServicePage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground">The rules and guidelines for using our services</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using The Quill's website and services, you accept and agree
                            to be bound by the terms and provision of this agreement. If you do not agree
                            to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">2. Use License</h2>
                        <p className="mb-2">
                            Permission is granted to temporarily use The Quill's website for personal,
                            non-commercial use only. This is the grant of a license, not a transfer of title.
                        </p>
                        <p>
                            You may not: modify or copy the materials, use the materials for any commercial
                            purpose, transfer the materials to another person, or attempt to reverse engineer
                            any software contained on the website.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">3. Ordering Terms</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All orders are subject to availability and confirmation</li>
                            <li>Prices are subject to change without notice</li>
                            <li>We reserve the right to refuse or cancel any order</li>
                            <li>You must provide accurate and complete information</li>
                            <li>Orders placed constitute an offer to purchase</li>
                            <li>We reserve the right to limit quantities or discontinue products</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">4. Payment Terms</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Payment is required at the time of order</li>
                            <li>We accept various payment methods as listed on our website</li>
                            <li>All payments are processed securely</li>
                            <li>Refunds are subject to our Refund Policy</li>
                            <li>You are responsible for any payment processing fees</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">5. Delivery and Takeaway</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Delivery times are estimates and not guaranteed</li>
                            <li>Risk of loss passes to you upon delivery</li>
                            <li>You must provide accurate delivery details</li>
                            <li>Failed deliveries due to incorrect information are your responsibility</li>
                            <li>Takeaway orders must be collected within specified timeframes</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">6. User Account</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You may need to create an account to use certain features</li>
                            <li>You are responsible for maintaining account confidentiality</li>
                            <li>You must provide accurate and current information</li>
                            <li>You agree to accept responsibility for all activities under your account</li>
                            <li>We reserve the right to suspend or terminate accounts</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">7. Intellectual Property</h2>
                        <p>
                            The content, design, logos, and materials on this website are the intellectual
                            property of The Quill. Unauthorized reproduction, distribution, or modification
                            is prohibited.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">8. Limitation of Liability</h2>
                        <p>
                            The Quill shall not be liable for any indirect, incidental, special, or consequential
                            damages arising out of the use or inability to use our services. Our liability is
                            limited to the maximum extent permitted by law.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">9. Disclaimer</h2>
                        <p>
                            Our services and website are provided "as is" without any representations or
                            warranties, express or implied. We make no warranties regarding the accuracy,
                            reliability, or completeness of any content.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">10. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by the laws of Kenya. Any disputes
                            arising from these terms shall be subject to the exclusive jurisdiction of
                            Kenyan courts.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">11. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfServicePage;
