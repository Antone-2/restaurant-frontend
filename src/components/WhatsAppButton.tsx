import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/254113857846"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle size={28} />
  </a>
);

export default WhatsAppButton;
