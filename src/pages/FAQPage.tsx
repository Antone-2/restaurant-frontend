import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQPage = () => {
    const faqs = [
        {
            question: "What are your operating hours?",
            answer: "The Quill is open 24 hours a day, 7 days a week, including holidays. We never close!"
        },
        {
            question: "How can I place an order?",
            answer: "You can place an order through our website, by calling us at 0113 857846, or by using our WhatsApp ordering service. We offer both delivery and takeaway options."
        },
        {
            question: "What is the delivery area?",
            answer: "We deliver within Korinda and surrounding areas. Delivery fees may vary based on your location. Contact us for specific delivery information to your area."
        },
        {
            question: "How long does delivery take?",
            answer: "Delivery times typically range from 30-60 minutes depending on your location and order volume. You can track your order in real-time through our system."
        },
        {
            question: "Do you offer vegetarian or vegan options?",
            answer: "Yes! Our menu includes a variety of vegetarian and vegan dishes. Please check our menu or contact us for specific dietary requirements."
        },
        {
            question: "Can I make a reservation?",
            answer: "Yes, you can make reservations through our website or by calling us. We recommend booking in advance for large groups."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept cash, M-Pesa, credit/debit cards, and mobile money payments. Online payments are also supported through our secure checkout."
        },
        {
            question: "Do you cater for events?",
            answer: "Yes, we offer catering services for events of all sizes. Please contact us to discuss your requirements and get a customized quote."
        },
        {
            question: "How can I leave feedback or a review?",
            answer: "We value your feedback! You can leave a review on our website, Google, or social media pages. You can also contact us directly with any concerns."
        },
        {
            question: "What is your refund policy?",
            answer: "If you're not satisfied with your order, please contact us within 24 hours. We'll work to resolve any issues and may offer a refund or replacement at our discretion."
        }
    ];

    return (
        <main className="pt-20 pb-16 min-h-screen bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground">Find answers to common questions about The Quill</p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border border-primary/10 rounded-lg px-4 bg-card">
                            <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-10 p-6 bg-card rounded-lg border border-primary/10">
                    <h3 className="font-display text-xl font-bold text-card-foreground mb-3">Still have questions?</h3>
                    <p className="text-muted-foreground mb-4">
                        If you can't find the answer you're looking for, please don't hesitate to contact us.
                    </p>
                    <a href="/contact" className="text-primary hover:underline font-semibold">
                        Contact Us →
                    </a>
                </div>
            </div>
        </main>
    );
};

export default FAQPage;
