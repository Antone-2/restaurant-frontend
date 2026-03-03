import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-display text-2xl font-bold text-primary mb-4">The Quill</h3>
        <p className="text-secondary-foreground/70 text-sm leading-relaxed">
          Experience Flavor Without Limits. Your favorite 24-hour restaurant in Korinda, serving delicious meals at affordable prices.
        </p>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold text-primary mb-4">Quick Links</h4>
        <div className="flex flex-col gap-2">
          {[
            { to: "/", label: "Home" },
            { to: "/menu", label: "Menu" },
            { to: "/about", label: "About Us" },
            { to: "/reviews", label: "Reviews" },
            { to: "/contact", label: "Contact" },
            { to: "/order", label: "Order Online" },
          ].map((link) => (
            <Link key={link.to} to={link.to} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-lg font-semibold text-primary mb-4">Contact Info</h4>
        <div className="flex flex-col gap-3 text-sm text-secondary-foreground/70">
          <a href="tel:0113857846" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone size={16} /> 0113 857846
          </a>
          <div className="flex items-center gap-2">
            <MapPin size={16} /> B1, C4XP+MH Korinda
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} /> Open 24 Hours
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors"><Facebook size={20} /></a>
          <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors"><Instagram size={20} /></a>
          <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors"><Twitter size={20} /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-primary/10 text-center py-4 text-xs text-secondary-foreground/50">
      © 2026 The Quill – Restaurant. All rights reserved.
    </div>
  </footer>
);

export default Footer;
