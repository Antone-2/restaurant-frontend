import { Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Contact & Location</h1>
          <p className="text-muted-foreground">We'd love to hear from you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <Card className="border-primary/10 bg-card">
              <CardContent className="p-5 space-y-4">
                <a href="tel:0113857846" className="flex items-center gap-3 text-card-foreground hover:text-primary transition-colors">
                  <Phone className="text-primary" size={20} /> <span className="font-semibold">0113 857846</span>
                </a>
                <div className="flex items-center gap-3 text-card-foreground">
                  <MapPin className="text-primary" size={20} /> <span>B1, C4XP+MH Korinda</span>
                </div>
                <div className="flex items-center gap-3 text-card-foreground">
                  <Clock className="text-primary" size={20} /> <span>Open 24 Hours — Every Day</span>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg overflow-hidden border border-primary/10 h-64">
              <iframe
                title="The Quill Restaurant Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0!2d36.8!3d-1.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQ0RYUCNNSCBLB3JpbmRh!5e0!3m2!1sen!2ske!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <Card className="border-primary/20 bg-card">
            <CardContent className="p-6">
              <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-background" />
                <Input type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-background" />
                <Textarea placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="bg-background" rows={5} />
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
