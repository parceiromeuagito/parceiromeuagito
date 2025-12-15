// Tipos para gestão de inventário/estoque

/**
 * Tipo de controle de inventário
 * - stock: Estoque tradicional (produtos físicos)
 * - capacity: Capacidade limitada (eventos, ingressos)
 */
export type InventoryType = "stock" | "capacity";

/**
 * Severidade do alerta de estoque
 * - low: Estoque baixo (entre minAlert e minAlert/2)
 * - critical: Estoque crítico (< minAlert/2)
 * - out: Sem estoque (= 0)
 */
export type AlertSeverity = "low" | "critical" | "out";

/**
 * Configuração de controle de inventário
 */
export interface InventoryControl {
  /** Se o controle de inventário está ativado */
  enabled: boolean;

  /** Tipo de controle (estoque ou capacidade) */
  type: InventoryType;

  /** Quantidade atual disponível */
  quantity: number;

  /** Quantidade mínima para alerta (padrão: 10) */
  minAlert: number;

  /** Se deve controlar variações (tamanhos, cores, etc) */
  trackVariations: boolean;

  /** Variações de estoque (opcional) */
  variations?: InventoryVariation[];
}

/**
 * Variação de estoque (ex: tamanhos, cores)
 */
export interface InventoryVariation {
  id: string;
  name: string; // Ex: "Tamanho 40", "Cor Azul"
  quantity: number;
}

/**
 * Alerta de estoque baixo
 */
export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minAlert: number;
  severity: AlertSeverity;
}

/**
 * Tipo de movimentação de estoque
 */
export type MovementType = "sale" | "replenish" | "adjustment" | "return";

/**
 * Registro de movimentação de estoque
 */
export interface InventoryMovement {
  id: string;
  productId: number;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  userId?: string;
  createdAt: Date;
}
