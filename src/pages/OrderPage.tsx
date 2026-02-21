import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const OrderPage = () => {
  const { toast } = useToast();

  const handleSubmit = (type: string) => (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: `${type} Confirmed!`,
      description: `Your ${type.toLowerCase()} request has been received. We'll contact you shortly.`,
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Order Online</h1>
          <p className="text-muted-foreground">Reserve, order takeaway, or request delivery</p>
        </div>

        <Tabs defaultValue="dinein">
          <TabsList className="w-full bg-muted">
            <TabsTrigger value="dinein" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dine-in</TabsTrigger>
            <TabsTrigger value="takeaway" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Takeaway</TabsTrigger>
            <TabsTrigger value="delivery" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="dinein">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Dine-in Reservation</h2>
                <form onSubmit={handleSubmit("Reservation")} className="space-y-4">
                  <Input placeholder="Full name" required className="bg-background" />
                  <Input type="tel" placeholder="Phone number" required className="bg-background" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" required className="bg-background" />
                    <Input type="time" required className="bg-background" />
                  </div>
                  <Input type="number" placeholder="Number of guests" min={1} max={20} required className="bg-background" />
                  <Textarea placeholder="Special requests (optional)" className="bg-background" />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Reserve Table</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="takeaway">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Takeaway Order</h2>
                <form onSubmit={handleSubmit("Takeaway Order")} className="space-y-4">
                  <Input placeholder="Full name" required className="bg-background" />
                  <Input type="tel" placeholder="Phone number" required className="bg-background" />
                  <Textarea placeholder="List your order items (e.g., 2x Grilled Chicken, 1x Mango Juice)" required className="bg-background" rows={4} />
                  <Input type="time" placeholder="Preferred pickup time" required className="bg-background" />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Place Takeaway Order</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Delivery Request</h2>
                <form onSubmit={handleSubmit("Delivery")} className="space-y-4">
                  <Input placeholder="Full name" required className="bg-background" />
                  <Input type="tel" placeholder="Phone number" required className="bg-background" />
                  <Input placeholder="Delivery address" required className="bg-background" />
                  <Textarea placeholder="List your order items" required className="bg-background" rows={4} />
                  <Textarea placeholder="Delivery instructions (optional)" className="bg-background" />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Request Delivery</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default OrderPage;
