import { Link } from "react-router-dom";
import { Star, Clock, Utensils, ShoppingBag, Truck, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { menuItems } from "@/data/menuData";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-restaurant.jpg";
import StarRating from "@/components/StarRating";
import { useState } from "react";
import { AnimatedSection, FadeIn, SlideInLeft, SlideInRight } from "@/components/AnimatedSection";
import StatsDashboard from "@/components/StatsDashboard";
import { useCart } from "@/context/CartContext";
import PromotionBanner from "@/components/PromotionBanner";
import NewsletterSignup from "@/components/NewsletterSignup";
import SeasonalMenuHighlights from "@/components/SeasonalMenuHighlights";

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const featured = menuItems.filter((m) => m.popular).slice(0, 4);
  const { addToCart } = useCart();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: "Subscribed!", description: "You'll receive our latest updates." });
      setEmail("");
    }
  };

  return (
    <main>
      {/* Promotion Banner - Time-based offers */}
      <PromotionBanner />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="The Quill Restaurant interior" className="w-full h-full object-cover" loading="eager" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/60 via-brown-dark/50 to-brown-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary/20 rounded-full animate-pulse delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary/25 rounded-full animate-pulse delay-200" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="text-primary" size={16} />
              <span className="text-primary-foreground text-sm font-medium">Open 24/7 • Fresh Ingredients</span>
            </div>
          </FadeIn>

          <AnimatedSection>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-6 leading-tight">
              Experience Flavor <br />
              <span className="text-primary">Without Limits</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <p className="text-cream/80 text-lg md:text-xl mb-4 font-body max-w-2xl mx-auto">
              Open 24 Hours — The Quill, Korinda. Where every dish tells a story and every visit becomes a cherished memory.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <StarRating rating={4} size={20} />
              <span className="text-cream/70 text-sm">4.9 ⭐ (143 reviews)</span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                <Link to="/menu"><span className="flex items-center">View Menu<ArrowRight className="ml-2" size={18} /></span></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary bg-transparent hover:bg-primary/10 text-base px-8">
                <Link to="/order">Order Now</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cream/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-cream/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <StatsDashboard />

      {/* Quick Highlights */}
      <section className="bg-secondary py-6">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 md:gap-12 px-4 text-secondary-foreground/80 text-sm">
          <div className="flex items-center gap-2"><Star size={16} className="text-primary" /> 4.9 ⭐ · 143 reviews</div>
          <div className="flex items-center gap-2"><span className="text-primary font-semibold">Ksh</span> 500 – 1,000</div>
          <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> Open 24 Hours</div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4">Our Services</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">We offer multiple ways to enjoy our delicious meals, whichever suits your preference.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <SlideInLeft delay={0}>
              <Card className="text-center border-primary/20 bg-card hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Utensils className="text-primary" size={32} />
                  </div>
                  <p className="font-semibold text-card-foreground text-lg">Dine-in</p>
                  <p className="text-muted-foreground text-sm mt-2">Experience our warm ambiance</p>
                </CardContent>
              </Card>
            </SlideInLeft>

            <FadeIn delay={100}>
              <Card className="text-center border-primary/20 bg-card hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingBag className="text-primary" size={32} />
                  </div>
                  <p className="font-semibold text-card-foreground text-lg">Takeaway</p>
                  <p className="text-muted-foreground text-sm mt-2">Quick & convenient pickup</p>
                </CardContent>
              </Card>
            </FadeIn>

            <SlideInRight delay={200}>
              <Card className="text-center border-primary/20 bg-card hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Truck className="text-primary" size={32} />
                  </div>
                  <p className="font-semibold text-card-foreground text-lg">Delivery</p>
                  <p className="text-muted-foreground text-sm mt-2">Delivered to your door</p>
                </CardContent>
              </Card>
            </SlideInRight>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Featured Dishes</h2>
                <p className="text-muted-foreground mt-2">Chef's recommendations this week</p>
              </div>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Link to="/menu">
                  See Full Menu
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item, index) => (
              <AnimatedSection key={item.id} delay={index * 100}>
                <Card className="overflow-hidden border-primary/10 bg-card hover:shadow-2xl transition-all group hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">Popular</span>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button className="w-full bg-primary" onClick={() => addToCart(item)}>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display font-semibold text-lg text-card-foreground">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-primary font-bold text-lg">Ksh {item.price}</p>
                      <StarRating rating={4} size={14} />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Food Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4">Food Gallery</h2>
            <p className="text-center text-muted-foreground mb-12">A visual feast of our culinary creations</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {menuItems.slice(0, 6).map((item, index) => (
              <AnimatedSection key={item.id} delay={index * 50}>
                <div className="group relative overflow-hidden rounded-lg aspect-square">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-semibold text-center px-2">{item.name}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Taste the Difference?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Book a table today or order online for delivery. Experience exceptional dining at The Quill.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base px-8">
                <Link to="/order">Reserve a Table</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                <Link to="/menu"><span>View Menu</span></Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Newsletter - Full signup with name, phone, birthday */}
      <NewsletterSignup />

      {/* Seasonal Menu Highlights */}
      <SeasonalMenuHighlights />
    </main>
  );
};

export default Index;
