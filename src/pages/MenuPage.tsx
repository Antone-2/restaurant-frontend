import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuItems, categories } from "@/data/menuData";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("starters");

  const filtered = menuItems.filter((item) => item.category === activeCategory);

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Crafted with passion, served with love</p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="max-w-4xl mx-auto">
          <TabsList className="flex flex-wrap w-full bg-muted">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {menuItems
                  .filter((item) => item.category === cat.value)
                  .map((item) => (
                    <Card key={item.id} className="overflow-hidden border-primary/10 bg-card hover:shadow-xl transition-shadow group">
                      <div className="relative overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {item.popular && (
                          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">Popular</span>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-display font-semibold text-lg text-card-foreground">{item.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                        <p className="text-primary font-bold mt-3 text-lg">Ksh {item.price}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
};

export default MenuPage;
