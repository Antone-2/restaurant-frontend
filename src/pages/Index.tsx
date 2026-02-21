import { Link } from "react-router-dom";
import { Star, Clock, Utensils, ShoppingBag, Truck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { menuItems } from "@/data/menuData";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-restaurant.jpg";
import StarRating from "@/components/StarRating";
import { useState } from "react";

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const featured = menuItems.filter((m) => m.popular).slice(0, 4);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: "Subscribed!", description: "You'll receive our latest updates." });
      setEmail("");
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <img src={heroImage} alt="The Quill Restaurant interior" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-brown-dark/70" />
        <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cream mb-4">
            Experience Flavor Without Limits
          </h1>
          <p className="text-cream/80 text-lg md:text-xl mb-2 font-body">Open 24 Hours — The Quill, Korinda</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <StarRating rating={4} size={20} />
            <span className="text-cream/70 text-sm">3.9 ⭐ (143 reviews)</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
              <Link to="/menu">View Menu</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary bg-transparent hover:bg-primary/10 text-base">
              <Link to="/order">Order Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Highlights */}
      <section className="bg-secondary py-6">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 md:gap-12 px-4 text-secondary-foreground/80 text-sm">
          <div className="flex items-center gap-2"><Star size={16} className="text-primary" /> 3.9 ⭐ · 143 reviews</div>
          <div className="flex items-center gap-2"><span className="text-primary font-semibold">Ksh</span> 500 – 1,000</div>
          <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> Open 24 Hours</div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Utensils, label: "Dine-in" },
              { icon: ShoppingBag, label: "Takeaway" },
              { icon: Truck, label: "Delivery" },
            ].map(({ icon: Icon, label }) => (
              <Card key={label} className="text-center border-primary/20 bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <Icon size={40} className="mx-auto text-primary mb-3" />
                  <p className="font-semibold text-card-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Featured Dishes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item) => (
              <Card key={item.id} className="overflow-hidden border-primary/10 bg-card hover:shadow-xl transition-shadow group">
                <div className="relative overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">Popular</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display font-semibold text-lg text-card-foreground">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-primary font-bold mt-2">Ksh {item.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link to="/menu">See Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Food Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-10">Food Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.slice(0, 6).map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg">
                <img src={item.image} alt={item.name} className="w-full h-48 md:h-56 object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <Mail size={40} className="mx-auto text-primary mb-4" />
          <h2 className="font-display text-3xl font-bold text-secondary-foreground mb-3">Stay Updated</h2>
          <p className="text-secondary-foreground/70 mb-6">Subscribe for exclusive offers and menu updates.</p>
          <form onSubmit={handleNewsletter} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary-foreground/10 border-primary/30 text-secondary-foreground placeholder:text-secondary-foreground/40"
            />
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Subscribe</Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Index;
