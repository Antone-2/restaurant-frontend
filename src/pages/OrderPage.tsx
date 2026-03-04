import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2 } from "lucide-react";
import TableReservation from "@/components/TableReservation";
import { ordersApi } from "@/services/api";

const OrderPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubmit = (type: string) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(type);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const orderData = {
      orderType: type.toLowerCase(),
      customerName: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      items: (type === 'Delivery' || type === 'Takeaway Order' || type === 'takeaway' || type === 'delivery')
        ? [{ name: formData.get('items') as string, quantity: 1, price: 0 }]
        : [],
      total: 0, // Will be calculated by backend
      subtotal: 0,
      notes: type === 'Delivery' || type === 'delivery'
        ? formData.get('instructions') as string
        : formData.get('pickupTime') as string,
      address: type === 'Delivery' || type === 'delivery' ? formData.get('address') as string : '',
    };

    ordersApi.create(orderData)
      .then((response) => {
        toast({
          title: `${type} Confirmed!`,
          description: response.orderId
            ? `Order ID: ${response.orderId}. We'll contact you shortly.`
            : "Your order has been received. We'll contact you shortly.",
        });
        form.reset();
      })
      .catch((error: any) => {
        toast({
          title: "Order Failed",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(null);
      });
  };

  return (
    <main className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Order Online</h1>
          <p className="text-muted-foreground">Reserve, order takeaway, or request delivery</p>
        </div>

        <Tabs defaultValue="dinein">
          <TabsList className="w-full bg-muted grid grid-cols-3">
            <TabsTrigger value="dinein" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dine-in</TabsTrigger>
            <TabsTrigger value="takeaway" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Takeaway</TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="dinein">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Table Reservation</h2>
                <p className="text-muted-foreground mb-6">Book your table with our interactive reservation system</p>
                <TableReservation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="takeaway">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Takeaway Order</h2>
                <form onSubmit={handleSubmit("Takeaway Order")} className="space-y-4">
                  <Input name="name" placeholder="Full name" required className="bg-background" />
                  <Input name="email" type="email" placeholder="Email Address" required className="bg-background" />
                  <Input name="phone" type="tel" placeholder="Phone Number" required className="bg-background" />
                  <Textarea name="items" placeholder="List your order items (e.g., 2x Grilled Chicken, 1x Mango Juice)" required className="bg-background" rows={4} />
                  <Input name="pickupTime" type="time" placeholder="Preferred pickup time" required className="bg-background" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <DollarSign size={16} className="text-primary" />
                    <span>Pay on pickup</span>
                  </div>
                  <Button type="submit" disabled={loading === "Takeaway Order"} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading === "Takeaway Order" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Takeaway Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card className="border-primary/20 bg-card mt-4">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-card-foreground mb-4">Delivery Request</h2>
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg mb-4 flex items-center gap-2">
                  <DollarSign className="text-primary" size={20} />
                  <span className="text-sm font-medium text-primary">Pay on Delivery - Cash or M-Pesa</span>
                </div>
                <form onSubmit={handleSubmit("Delivery")} className="space-y-4">
                  <Input name="name" placeholder="Full name" required className="bg-background" />
                  <Input name="email" type="email" placeholder="Email Address" required className="bg-background" />
                  <Input name="phone" type="tel" placeholder="Phone Number" required className="bg-background" />
                  <Input name="address" placeholder="Delivery address" required className="bg-background" />
                  <Textarea name="items" placeholder="List your order items" required className="bg-background" rows={4} />
                  <Textarea name="instructions" placeholder="Delivery instructions (optional)" className="bg-background" />
                  <Button type="submit" disabled={loading === "Delivery"} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading === "Delivery" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Request Delivery
                  </Button>
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
