import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import dish4 from "@/assets/dish-4.jpg";
import dish5 from "@/assets/dish-5.jpg";
import dish6 from "@/assets/dish-6.jpg";

// Dietary and allergen indicators
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'halal';
export type SpicyLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';
export type PopularTag = 'chef-special' | 'customer-favourite' | 'new' | 'limited-time';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "starters" | "mains" | "drinks" | "specials";
  popular?: boolean;
  // Dietary indicators
  dietaryTags?: DietaryTag[];
  // Spicy level (if applicable)
  spicy?: SpicyLevel;
  // Allergens (items that contain)
  allergens?: string[];
  // Popular/call-out tags
  popularTags?: PopularTag[];
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
    dietaryTags: ["vegetarian"],
    allergens: ["gluten"],
    popularTags: ["customer-favourite"],
  },
  {
    id: "2",
    name: "Garlic Prawns",
    description: "Succulent prawns sautéed in garlic butter with fresh herbs and lemon",
    price: 650,
    image: dish3,
    category: "starters",
    dietaryTags: ["gluten-free", "halal"],
    allergens: ["shellfish", "dairy"],
  },
  {
    id: "3",
    name: "Grilled Chicken Supreme",
    description: "Tender grilled chicken breast with herb marinade, served with seasonal vegetables",
    price: 850,
    image: dish1,
    category: "mains",
    popular: true,
    dietaryTags: ["gluten-free", "dairy-free", "halal"],
    popularTags: ["chef-special", "customer-favourite"],
  },
  {
    id: "4",
    name: "Pepper Steak",
    description: "Premium beef steak with rich pepper sauce, roasted vegetables and mashed potatoes",
    price: 950,
    image: dish2,
    category: "mains",
    popular: true,
    dietaryTags: ["gluten-free", "halal"],
    spicy: "medium",
    allergens: ["dairy"],
    popularTags: ["customer-favourite"],
  },
  {
    id: "5",
    name: "Seafood Pasta",
    description: "Fresh linguine with prawns, calamari, and mussels in a creamy garlic sauce",
    price: 800,
    image: dish3,
    category: "mains",
    dietaryTags: ["halal"],
    allergens: ["shellfish", "gluten", "dairy"],
    popularTags: ["chef-special"],
  },
  {
    id: "6",
    name: "Tropical Sunset Cocktail",
    description: "A vibrant blend of fresh tropical fruits with a splash of passion fruit",
    price: 450,
    image: dish4,
    category: "drinks",
    popular: true,
    dietaryTags: ["vegan", "gluten-free", "dairy-free"],
    popularTags: ["new"],
  },
  {
    id: "7",
    name: "Fresh Mango Juice",
    description: "Freshly squeezed mango juice served chilled with a hint of lime",
    price: 250,
    image: dish4,
    category: "drinks",
    dietaryTags: ["vegan", "gluten-free", "dairy-free", "halal"],
  },
  {
    id: "8",
    name: "Chef's Special Tiramisu",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
    price: 500,
    image: dish6,
    category: "specials",
    popular: true,
    dietaryTags: ["vegetarian"],
    allergens: ["gluten", "dairy", "eggs"],
    popularTags: ["chef-special", "customer-favourite"],
  },
  {
    id: "9",
    name: "Nyama Choma Platter",
    description: "Traditional Kenyan roasted meat platter with ugali, kachumbari and sukuma wiki",
    price: 900,
    image: dish2,
    category: "specials",
    dietaryTags: ["gluten-free", "dairy-free", "halal"],
    popularTags: ["limited-time"],
  },
  // Additional items with dietary info
  {
    id: "10",
    name: "Vegetable Stir Fry",
    description: "Fresh seasonal vegetables stir-fried in garlic ginger sauce with jasmine rice",
    price: 550,
    image: dish5,
    category: "mains",
    dietaryTags: ["vegan", "dairy-free", "gluten-free"],
    popularTags: ["new"],
  },
  {
    id: "11",
    name: "Spicy Chicken Wings",
    description: "Crispy wings tossed in our signature spicy sauce, served with blue cheese dip",
    price: 600,
    image: dish1,
    category: "starters",
    dietaryTags: ["halal"],
    spicy: "hot",
    allergens: ["dairy"],
    popularTags: ["customer-favourite"],
  },
  {
    id: "12",
    name: "Vegan Buddha Bowl",
    description: "Quinoa, roasted chickpeas, avocado, fresh greens with tahini dressing",
    price: 650,
    image: dish5,
    category: "mains",
    dietaryTags: ["vegan", "gluten-free", "dairy-free", "nut-free", "halal"],
    popularTags: ["chef-special", "new"],
  },
  {
    id: "13",
    name: "Thai Green Curry",
    description: "Aromatic coconut curry with vegetables and Thai basil, served with jasmine rice",
    price: 700,
    image: dish3,
    category: "mains",
    dietaryTags: ["vegan", "gluten-free", "dairy-free", "halal"],
    spicy: "medium",
    popularTags: ["customer-favourite"],
  },
  {
    id: "14",
    name: "Halaal Platter",
    description: "Assorted grilled meats, kofta, grilled vegetables with mint yogurt sauce",
    price: 1200,
    image: dish2,
    category: "specials",
    dietaryTags: ["gluten-free", "halal"],
    popularTags: ["chef-special", "limited-time"],
  },
  {
    id: "15",
    name: "Jamaican Jerk Chicken",
    description: "Authentic jerk-spiced chicken with pineapple salsa and fried plantains",
    price: 850,
    image: dish1,
    category: "mains",
    dietaryTags: ["gluten-free", "dairy-free", "halal"],
    spicy: "hot",
    popularTags: ["new"],
  },
];

export const categories = [
  { value: "starters", label: "Starters" },
  { value: "mains", label: "Main Dishes" },
  { value: "drinks", label: "Drinks" },
  { value: "specials", label: "Specials" },
] as const;

// Helper function to get display color for dietary tags
export const getDietaryColor = (tag: DietaryTag): string => {
  const colors: Record<DietaryTag, string> = {
    'vegetarian': 'bg-green-100 text-green-700',
    'vegan': 'bg-emerald-100 text-emerald-700',
    'gluten-free': 'bg-amber-100 text-amber-700',
    'dairy-free': 'bg-blue-100 text-blue-700',
    'nut-free': 'bg-orange-100 text-orange-700',
    'halal': 'bg-purple-100 text-purple-700',
  };
  return colors[tag] || 'bg-gray-100 text-gray-700';
};

// Helper function to get display color for spicy levels
export const getSpicyColor = (level: SpicyLevel): string => {
  const colors: Record<SpicyLevel, string> = {
    'mild': 'bg-yellow-100 text-yellow-700',
    'medium': 'bg-orange-100 text-orange-700',
    'hot': 'bg-red-100 text-red-700',
    'extra-hot': 'bg-red-200 text-red-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
};

// Helper function to get display color for popular tags
export const getPopularTagColor = (tag: PopularTag): string => {
  const colors: Record<PopularTag, string> = {
    'chef-special': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    'customer-favourite': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    'new': 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    'limited-time': 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
  };
  return colors[tag] || 'bg-gray-100 text-gray-700';
};

// Get icon component for dietary tag
export const getDietaryIcon = (tag: DietaryTag): string => {
  const icons: Record<DietaryTag, string> = {
    'vegetarian': '🥬',
    'vegan': '🌱',
    'gluten-free': '🌾',
    'dairy-free': '🥛',
    'nut-free': '🥜',
    'halal': '☪️',
  };
  return icons[tag] || '•';
};

// Get icon for spicy level
export const getSpicyIcon = (level: SpicyLevel): string => {
  const icons: Record<SpicyLevel, string> = {
    'mild': '🌶️',
    'medium': '🌶️🌶️',
    'hot': '🌶️🌶️🌶️',
    'extra-hot': '🔥',
  };
  return icons[level] || '';
};

// Get label for popular tag
export const getPopularTagLabel = (tag: PopularTag): string => {
  const labels: Record<PopularTag, string> = {
    'chef-special': 'Chef\'s Special',
    'customer-favourite': 'Customer Favourite',
    'new': 'New',
    'limited-time': 'Limited Time',
  };
  return labels[tag] || tag;
};
