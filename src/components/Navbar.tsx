import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Sun, Moon, LogOut, User, History, Settings, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState as useStateLocal } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/accommodation", label: "Accommodation" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/partnerships", label: "Partnerships" },
  { to: "/parking", label: "Parking" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [theme, setTheme] = useStateLocal<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isAdmin = user?.email && ['admin@thequill.com', 'thequillrestaurant@gmail.com'].includes(user.email);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-2xl font-bold text-primary">
          The Quill
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-secondary-foreground/80"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" asChild={false} onClick={toggleTheme} className="rounded-full text-secondary-foreground">
            <div className="flex items-center justify-center">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
          </Button>

          {/* Cart - Using asChild={false} to avoid Slot issues */}
          <Button
            variant="ghost"
            size="icon"
            asChild={false}
            className="rounded-full relative text-secondary-foreground"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
          </Button>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              {isAdmin && (
                <Button asChild size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 rounded-full">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <User size={18} className="text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 border-b">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User size={14} className="mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings size={14} className="mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/order-history" className="cursor-pointer">
                      <History size={14} className="mr-2" />
                      Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reservations" className="cursor-pointer">
                      <Calendar size={14} className="mr-2" />
                      My Reservations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                    <LogOut size={14} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/order">Order Now</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" asChild={false} onClick={toggleTheme} className="rounded-full">
            <div className="flex items-center justify-center">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild={false}
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          </Button>
          <button className="text-secondary-foreground p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-secondary border-t border-primary/20 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-primary/10 transition-colors hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-secondary-foreground/80"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Auth */}
          {!isAuthenticated ? (
            <>
              <Button asChild size="sm" variant="outline" className="w-full mt-3">
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              </Button>
              <Button asChild size="sm" className="w-full mt-2 bg-primary text-primary-foreground">
                <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
              </Button>
            </>
          ) : (
            <>
              {isAdmin && (
                <Button asChild size="sm" className="w-full mt-3 bg-amber-600 text-white">
                  <Link to="/admin" onClick={() => setOpen(false)}>Admin Dashboard</Link>
                </Button>
              )}
              <div className="py-3 border-b border-primary/10">
                <p className="text-sm text-secondary-foreground mb-2">{user?.name || user?.email}</p>
                <Button size="sm" variant="destructive" className="w-full" onClick={() => { logout(); setOpen(false); }}>
                  Logout
                </Button>
              </div>
            </>
          )}

          <Button asChild size="sm" className="mt-3 w-full bg-primary text-primary-foreground">
            <Link to="/order" onClick={() => setOpen(false)}>Order Now</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
