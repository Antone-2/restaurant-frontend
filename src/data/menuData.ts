import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import dish4 from "@/assets/dish-4.jpg";
import dish5 from "@/assets/dish-5.jpg";
import dish6 from "@/assets/dish-6.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "starters" | "mains" | "drinks" | "specials";
  popular?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Crispy Samosas",
    description: "Golden fried pastry filled with spiced potatoes and peas, served with tangy chutneys",
    price: 350,
    image: dish5,
    category: "starters",
    popular: true,
  },
  {
    id: "2",
    name: "Garlic Prawns",
    description: "Succulent prawns sautéed in garlic butter with fresh herbs and lemon",
    price: 650,
    image: dish3,
    category: "starters",
  },
  {
    id: "3",
    name: "Grilled Chicken Supreme",
    description: "Tender grilled chicken breast with herb marinade, served with seasonal vegetables",
    price: 850,
    image: dish1,
    category: "mains",
    popular: true,
  },
  {
    id: "4",
    name: "Pepper Steak",
    description: "Premium beef steak with rich pepper sauce, roasted vegetables and mashed potatoes",
    price: 950,
    image: dish2,
    category: "mains",
    popular: true,
  },
  {
    id: "5",
    name: "Seafood Pasta",
    description: "Fresh linguine with prawns, calamari, and mussels in a creamy garlic sauce",
    price: 800,
    image: dish3,
    category: "mains",
  },
  {
    id: "6",
    name: "Tropical Sunset Cocktail",
    description: "A vibrant blend of fresh tropical fruits with a splash of passion fruit",
    price: 450,
    image: dish4,
    category: "drinks",
    popular: true,
  },
  {
    id: "7",
    name: "Fresh Mango Juice",
    description: "Freshly squeezed mango juice served chilled with a hint of lime",
    price: 250,
    image: dish4,
    category: "drinks",
  },
  {
    id: "8",
    name: "Chef's Special Tiramisu",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
    price: 500,
    image: dish6,
    category: "specials",
    popular: true,
  },
  {
    id: "9",
    name: "Nyama Choma Platter",
    description: "Traditional Kenyan roasted meat platter with ugali, kachumbari and sukuma wiki",
    price: 900,
    image: dish2,
    category: "specials",
  },
];

export const categories = [
  { value: "starters", label: "Starters" },
  { value: "mains", label: "Main Dishes" },
  { value: "drinks", label: "Drinks" },
  { value: "specials", label: "Specials" },
] as const;
