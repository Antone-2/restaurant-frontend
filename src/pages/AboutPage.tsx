import { Clock, Heart, DollarSign } from "lucide-react";
import aboutImage from "@/assets/about-restaurant.jpg";

const AboutPage = () => (
  <main className="pt-20 pb-16 min-h-screen bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">About The Quill</h1>
        <p className="text-muted-foreground">Our story, our passion</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto mb-16">
        <img src={aboutImage} alt="Chef at The Quill" className="rounded-lg shadow-lg w-full h-80 object-cover" loading="lazy" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">A Culinary Journey</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Nestled in the heart of Korinda along the B1 corridor, The Quill – Restaurant was born from a simple belief: everyone deserves access to delicious, quality food at any hour of the day.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Since opening our doors, we've been committed to serving mouth-watering dishes that blend traditional Kenyan flavors with international cuisine. Our 24-hour service means that whether it's a late-night craving or an early morning breakfast, The Quill is always ready to welcome you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[
          { icon: Clock, title: "Always Open", desc: "24 hours a day, 7 days a week — we never close." },
          { icon: DollarSign, title: "Affordable", desc: "Quality meals from Ksh 500–1,000 per person." },
          { icon: Heart, title: "Made with Love", desc: "Every dish is crafted with care and fresh ingredients." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center p-6 bg-card rounded-lg border border-primary/10">
            <Icon size={36} className="mx-auto text-primary mb-3" />
            <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </main>
);

export default AboutPage;
