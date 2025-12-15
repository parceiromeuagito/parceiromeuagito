import { useState, useMemo } from "react";
import { useCatalogStore } from "../../store/useCatalogStore";
import { PRODUCT_CATEGORIES } from "../../types/category";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  Search,
  Package,
  UtensilsCrossed,
  Bed,
  Ticket,
  Calendar,
  Armchair,
  ShoppingBag,
} from "lucide-react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";

const ICONS: Record<string, any> = {
  UtensilsCrossed,
  Bed,
  Ticket,
  Calendar,
  Armchair,
  ShoppingBag,
};

export function ProductsView() {
  const { catalog } = useCatalogStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [catalog, selectedCategory, searchTerm]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catalog.length };
    Object.keys(PRODUCT_CATEGORIES).forEach((cat) => {
      counts[cat] = catalog.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [catalog]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="flex gap-2">
            Todos
            <Badge variant="secondary" className="ml-1">
              {productCounts.all}
            </Badge>
          </TabsTrigger>
          {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => {
            const Icon = ICONS[cat.icon] || Package;
            return (
              <TabsTrigger key={key} value={key} className="flex gap-2">
                <Icon className="w-4 h-4" />
                {cat.name}
                <Badge variant="secondary" className="ml-1">
                  {productCounts[key] || 0}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(p) => console.log("Edit", p)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="Nenhum produto encontrado"
                description={
                  searchTerm
                    ? `Não encontramos produtos correspondentes a "${searchTerm}" nesta categoria.`
                    : "Não há produtos cadastrados nesta categoria."
                }
                action={{
                  label: "Adicionar Produto",
                  onClick: () =>
                    console.log("Abrir modal de adicionar produto"), // Placeholder
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
