import { Users, Star, Clock, Award, TrendingUp, Utensils } from "lucide-react";
import { useCountUp } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";

const StatsDashboard = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const element = document.getElementById("stats-section");
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) {
                    setIsVisible(true);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const stats = [
        { icon: Users, label: "Happy Customers", value: useCountUp(15000, 2000, isVisible), suffix: "+" },
        { icon: Star, label: "Average Rating", value: useCountUp(49, 2000, isVisible) / 10, suffix: "", isRating: true },
        { icon: Clock, label: "Hours Open", value: useCountUp(24, 1500, isVisible), suffix: "/7" },
        { icon: Award, label: "Years Experience", value: useCountUp(5, 2000, isVisible), suffix: "+" },
        { icon: TrendingUp, label: "Orders Delivered", value: useCountUp(45000, 2000, isVisible), suffix: "+" },
        { icon: Utensils, label: "Dishes Served", value: useCountUp(200, 2000, isVisible), suffix: "K+" },
    ];

    return (
        <section id="stats-section" className="py-16 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold text-secondary-foreground mb-2">
                        Our Achievements
                    </h2>
                    <p className="text-secondary-foreground/70">Numbers that speak for themselves</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="text-center p-4 rounded-lg bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-colors"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <stat.icon className="mx-auto mb-3 text-primary" size={28} />
                            <div className="font-display text-3xl font-bold text-secondary-foreground">
                                {stat.isRating ? stat.value.toFixed(1) : stat.value}{stat.suffix}
                            </div>
                            <div className="text-sm text-secondary-foreground/70 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsDashboard;
