const CookiePolicyPage = () => {
    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
                    <p className="text-muted-foreground">How we use cookies and similar technologies</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">1. What Are Cookies?</h2>
                        <p>
                            Cookies are small text files that are stored on your computer or mobile device
                            when you visit a website. They help the website remember your preferences and
                            provide a better user experience.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">2. Types of Cookies We Use</h2>

                        <h3 className="font-semibold text-card-foreground mt-4 mb-2">Essential Cookies</h3>
                        <p>
                            These cookies are necessary for the website to function properly. They enable
                            basic features like page navigation, secure areas access, and remembering your
                            cart items. The website cannot function without these cookies.
                        </p>

                        <h3 className="font-semibold text-card-foreground mt-4 mb-2">Analytics Cookies</h3>
                        <p>
                            These cookies help us understand how visitors interact with our website by
                            collecting and reporting information anonymously. This helps us improve our
                            website and services.
                        </p>

                        <h3 className="font-semibold text-card-foreground mt-4 mb-2">Marketing Cookies</h3>
                        <p>
                            These cookies are used to track visitors across websites. The intention is to
                            display ads that are relevant and engaging for the individual user.
                        </p>

                        <h3 className="font-semibold text-card-foreground mt-4 mb-2">Functional Cookies</h3>
                        <p>
                            These cookies allow the website to remember choices you make (like language
                            or region) and provide enhanced, personalized features.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">3. Specific Cookies We Use</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Session cookies:</strong> To keep you logged in during your visit</li>
                            <li><strong>Cart cookies:</strong> To remember items in your shopping cart</li>
                            <li><strong>Preference cookies:</strong> To remember your language and location settings</li>
                            <li><strong>Analytics cookies:</strong> To analyze website traffic and performance</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">4. Managing Cookies</h2>
                        <p className="mb-2">
                            You have the right to decide whether to accept or reject cookies. You can manage
                            your cookie preferences in the following ways:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Browser settings:</strong> Most web browsers allow you to control cookies through settings</li>
                            <li><strong>Cookie consent banner:</strong> You can change your preferences via our cookie consent tool</li>
                            <li><strong>Third-party tools:</strong> You can opt out of specific third-party cookies</li>
                        </ul>
                        <p className="mt-4">
                            Please note that blocking essential cookies may impact your experience on our website.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">5. Cookie Categories</h2>
                        <table className="w-full mt-4 border-collapse">
                            <thead>
                                <tr className="border-b border-primary/10">
                                    <th className="text-left py-2 text-card-foreground">Cookie Type</th>
                                    <th className="text-left py-2 text-card-foreground">Purpose</th>
                                    <th className="text-left py-2 text-card-foreground">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-primary/10">
                                    <td className="py-2">Essential</td>
                                    <td className="py-2">Website functionality</td>
                                    <td className="py-2">Session</td>
                                </tr>
                                <tr className="border-b border-primary/10">
                                    <td className="py-2">Analytics</td>
                                    <td className="py-2">Website improvement</td>
                                    <td className="py-2">Up to 1 year</td>
                                </tr>
                                <tr className="border-b border-primary/10">
                                    <td className="py-2">Marketing</td>
                                    <td className="py-2">Personalized advertising</td>
                                    <td className="py-2">Up to 1 year</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">6. Third-Party Cookies</h2>
                        <p>
                            Some cookies are placed by third-party services that appear on our pages.
                            We do not control these cookies. Please review the third-party privacy policies
                            for more information.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">7. Updates to This Policy</h2>
                        <p>
                            We may update this Cookie Policy from time to time. Any changes will be
                            posted on this page with an updated revision date.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">8. Contact Us</h2>
                        <p>
                            If you have questions about our Cookie Policy, please contact us:
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

export default CookiePolicyPage;
