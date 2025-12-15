import { CatalogItem } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
    product: CatalogItem;
    onEdit?: (product: CatalogItem) => void;
    onDelete?: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="secondary" onClick={() => onEdit?.(product)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete?.(product.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <Badge className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white">
                    {product.category}
                </Badge>
            </div>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold truncate">{product.name}</CardTitle>
                    <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Estoque: {product.stock !== undefined ? product.stock : 'N/A'}</span>
                    <Badge variant={product.available ? 'default' : 'secondary'}>
                        {product.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
