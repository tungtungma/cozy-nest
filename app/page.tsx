import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <ProductGrid />
      <footer className="border-t border-border/60 mt-12">
        <div className="mx-auto max-w-7xl px-8 py-12 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span>© {new Date().getFullYear()} Cozy Nest</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </main>
  );
}
