"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ShoppingBag, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProductsByTheme, getProductCategories, type Product } from "@/lib/products";
import ProductCard from "@/components/features/ProductCard";
import CartDrawer, { type CartItem } from "@/components/features/CartDrawer";

export default function ShopPageClient() {
  const { currentTheme } = useTheme();
  const c = currentTheme.colors;
  const isDark = currentTheme.isDark;
  const searchParams = useSearchParams();
  const themeFilter = searchParams.get("theme") || "all";

  const [products] = useState(() => getProductsByTheme(themeFilter));
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mystic-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save cart to localStorage
  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("mystic-cart", JSON.stringify(newCart));
  }, []);

  const categories = ["All", ...getProductCategories()];
  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const activeTextColor = isDark ? c.bg : "#FFFFFF";

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((i) => i.product.id === product.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    saveCart(newCart);
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(""), 2000);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
      )
      .filter((i) => i.quantity > 0);
    saveCart(newCart);
  };

  const handleRemove = (productId: string) => {
    saveCart(cart.filter((i) => i.product.id !== productId));
  };

  const handleCheckout = () => {
    // In a real app, this would redirect to PayPal checkout
    alert("PayPal checkout coming soon! Your cart total: $" +
      cart.reduce((s, i) => s + i.product.price * i.quantity, 0).toFixed(2));
  };

  return (
    <main className="min-h-screen">
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.primary}08 0%, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-sm mb-8 animate-fade-in"
            style={{ color: c.textMuted }}
          >
            <Link href="/" className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
              <Home size={14} />
              Home
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: c.primary }}>Shop</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: c.primary }} />
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShoppingBag size={24} style={{ color: c.primary }} />
              <h1
                className="text-3xl md:text-4xl font-bold tracking-wider"
                style={{ color: c.primary }}
              >
                Mystical Shop
              </h1>
            </div>
            <p className="text-sm" style={{ color: c.textMuted }}>
              Curated tools, crystals, and treasures for your spiritual journey.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-slide-up">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: activeCategory === cat ? c.primary : "transparent",
                  color: activeCategory === cat ? activeTextColor : c.textMuted,
                  border: `1px solid ${c.primary}33`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cart button (floating) */}
          <button
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all animate-fade-in"
            style={{
              backgroundColor: c.primary,
              color: isDark ? c.bg : "#FFFFFF",
              boxShadow: `0 4px 20px ${currentTheme.glow}`,
            }}
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: "#E74C3C",
                  color: "#FFFFFF",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, i) => (
              <div
                key={product.id}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: c.textMuted }}>
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />

      {/* Added to cart toast */}
      {addedToast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-full text-sm font-medium animate-slide-down"
          style={{
            backgroundColor: c.primary,
            color: isDark ? c.bg : "#FFFFFF",
            boxShadow: `0 4px 20px ${currentTheme.glow}`,
          }}
        >
          ✓ Added to cart
        </div>
      )}
    </main>
  );
}
