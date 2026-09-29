export interface ColumnMapping {
  revenueKey?: string;
  orderKey?: string;
  customerKey?: string;
  dateKey?: string;
  categoryKey?: string;
  productKey?: string;
  locationKey?: string;
  quantityKey?: string;
}

export interface AuditStats {
  totalRawRows: number;
  cleanRowsCount: number;
  duplicatesPurged: number;
  nullValuesResolved: number;
  columnsDetected: string[];
}

export interface ProcessedRow {
  [key: string]: any;
}

export interface KpiMetrics {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  totalUnitsSold?: number;
}

export type CategoryType = 'grocery' | 'fashion' | 'electronics' | 'general';

export interface DatasetMeta {
  fileName: string;
  sanitizedTitle: string;
  categoryType: CategoryType;
  uploadedAt: string;
}

export interface ParsedDataset {
  meta: DatasetMeta;
  mapping: ColumnMapping;
  audit: AuditStats;
  rows: ProcessedRow[];
  kpis: KpiMetrics;
  headers: string[];
}
