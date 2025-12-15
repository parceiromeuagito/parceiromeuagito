import { useState } from "react";
import { useCategoryStore } from "../../store/useCategoryStore";
import { Category } from "../../types/category";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FolderPlus, Trash2, Edit2 } from "lucide-react";
import { faker } from "@faker-js/faker";

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!newCategoryName.trim()) return;

    if (editingId) {
      updateCategory(editingId, { name: newCategoryName });
      setEditingId(null);
    } else {
      const newCategory: Category = {
        id: faker.string.uuid(),
        name: newCategoryName,
        icon: "Package", // Default icon
        order: categories.length,
        serviceType: "delivery", // Default type
      };
      addCategory(newCategory);
    }
    setNewCategoryName("");
  };

  const startEdit = (category: Category) => {
    setNewCategoryName(category.name);
    setEditingId(category.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="w-4 h-4 mr-2" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Categorias de Produtos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={handleSave}>
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
          </div>

          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria criada.
              </p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
              >
                <span className="font-medium">{cat.name}</span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => startEdit(cat)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
