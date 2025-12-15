import { create } from 'zustand';
import { CatalogItem } from '../types';
import { getMockCatalog } from '../data/mock';
import { loadData, saveData } from '../lib/persistence';

interface CatalogState {
    catalog: CatalogItem[];
    addItemToCatalog: (item: CatalogItem) => void;
    removeItemFromCatalog: (id: string) => void;
    updateItemStock: (id: string, quantityToAdd: number) => void;
}



export const useCatalogStore = create<CatalogState>((set) => ({
    catalog: loadData<CatalogItem[]>('businessCatalog', getMockCatalog(['delivery'])),

    addItemToCatalog: (item) => set((state) => {
        const newCatalog = [item, ...state.catalog];
        saveData('businessCatalog', newCatalog);
        return { catalog: newCatalog };
    }),

    removeItemFromCatalog: (id) => set((state) => {
        const newCatalog = state.catalog.filter(i => i.id !== id);
        saveData('businessCatalog', newCatalog);
        return { catalog: newCatalog };
    }),

    updateItemStock: (id, quantityToAdd) => set((state) => {
        const newCatalog = state.catalog.map(item => {
            if (item.id === id && item.stock !== undefined) {
                return { ...item, stock: item.stock + quantityToAdd };
            }
            return item;
        });
        saveData('businessCatalog', newCatalog);
        return { catalog: newCatalog };
    })
}));
