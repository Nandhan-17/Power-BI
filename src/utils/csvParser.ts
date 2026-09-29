import Papa from 'papaparse';
import type { ParsedDataset, ColumnMapping, AuditStats, ProcessedRow, KpiMetrics, CategoryType } from '../types';

// Regex patterns for dynamic column detection
const PATTERNS = {
  revenue: [
    /^(sales|revenue|total|amount|grand_total|net_sales|total_amount|order_value|sales_amount)$/i,
    /revenue/i,
    /sales/i,
    /amount/i,
    /price/i,
    /total/i
  ],
  order: [
    /^(order_id|transaction_id|invoice_id|orders|order_number|transaction)$/i,
    /order_id/i,
    /transaction_id/i,
    /invoice/i,
    /order/i,
    /^id$/i
  ],
  customer: [
    /^(customer_id|customer_name|client_id|user_id|buyer|customer|client)$/i,
    /customer/i,
    /client/i,
    /user_id/i,
    /buyer/i
  ],
  date: [
    /^(date|order_date|created_at|timestamp|invoice_date|purchase_date|day|time)$/i,
    /date/i,
    /time/i,
    /timestamp/i
  ],
  category: [
    /^(category|department|product_type|segment|product_category|cat)$/i,
    /category/i,
    /department/i,
    /segment/i,
    /type/i
  ],
  product: [
    /^(product|product_name|item|sku|title|item_name|product_title)$/i,
    /product/i,
    /item/i,
    /sku/i,
    /title/i
  ],
  location: [
    /^(city|state|region|zone|country|location|place)$/i,
    /city/i,
    /state/i,
    /region/i,
    /country/i,
    /location/i
  ],
  quantity: [
    /^(quantity|qty|units|items_count|volume|count|unit_count)$/i,
    /quantity/i,
    /qty/i,
    /units/i,
    /count/i
  ]
};

function matchColumn(headers: string[], patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const found = headers.find(h => pattern.test(h.trim()));
    if (found) return found;
  }
  return undefined;
}

export function detectColumnMappings(headers: string[]): ColumnMapping {
  return {
    revenueKey: matchColumn(headers, PATTERNS.revenue),
    orderKey: matchColumn(headers, PATTERNS.order),
    customerKey: matchColumn(headers, PATTERNS.customer),
    dateKey: matchColumn(headers, PATTERNS.date),
    categoryKey: matchColumn(headers, PATTERNS.category),
    productKey: matchColumn(headers, PATTERNS.product),
    locationKey: matchColumn(headers, PATTERNS.location),
    quantityKey: matchColumn(headers, PATTERNS.quantity)
  };
}

export function sanitizeNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleanStr = String(val)
    .replace(/[₹$€£,]/g, '')
    .trim();
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

export function sanitizeString(val: any, fallback = 'Uncategorized'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (
    !str ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'n/a' ||
    str.toLowerCase() === 'na' ||
    str.toLowerCase() === 'undefined'
  ) {
    return fallback;
  }
  return str;
}

export function sanitizeDate(val: any): string {
  if (!val) return '';
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'n/a') return '';

  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    if (p1.length === 4) {
      const mm = p2.padStart(2, '0');
      const dd = p3.padStart(2, '0');
      return `${p1}-${mm}-${dd}`;
    } else if (p3.length === 4) {
      const mm = p1.padStart(2, '0');
      const dd = p2.padStart(2, '0');
      return `${p3}-${mm}-${dd}`;
    }
  }
  return str;
}

export function detectCategoryType(fileName: string, rows: ProcessedRow[]): CategoryType {
  const combinedText = (
    fileName +
    ' ' +
    rows.slice(0, 10).map(r => Object.values(r).join(' ')).join(' ')
  ).toLowerCase();

  if (/(grocery|food|fruit|vegetable|milk|dairy|blinkit|zepto|instamart|bread|snack)/i.test(combinedText)) {
    return 'grocery';
  }
  if (/(fashion|apparel|shirt|tshirt|jeans|dress|shoes|wear|clothing|zara)/i.test(combinedText)) {
    return 'fashion';
  }
  if (/(electronic|tech|phone|mobile|laptop|gadget|headphone|cpu|apple|samsung)/i.test(combinedText)) {
    return 'electronics';
  }
  return 'general';
}

export function processCsvContent(
  fileContent: string,
  fileName: string
): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const rawRows = (results.data as any[]) || [];
          const headers = results.meta.fields || (rawRows[0] ? Object.keys(rawRows[0]) : []);

          if (rawRows.length === 0 || headers.length === 0) {
            throw new Error('CSV file contains no valid rows or columns.');
          }

          const mapping = detectColumnMappings(headers);

          let duplicatesCount = 0;
          let nullsResolvedCount = 0;

          const seenRowHashes = new Set<string>();
          const seenOrderIds = new Set<string>();

          const cleanedRows: ProcessedRow[] = [];

          for (const rawRow of rawRows) {
            const values = Object.values(rawRow).map(v => String(v ?? '').trim());
            if (values.every(v => v === '' || v.toLowerCase() === 'null')) {
              nullsResolvedCount++;
              continue;
            }

            const rowHash = JSON.stringify(rawRow);
            if (seenRowHashes.has(rowHash)) {
              duplicatesCount++;
              continue;
            }
            seenRowHashes.add(rowHash);

            if (mapping.orderKey && rawRow[mapping.orderKey]) {
              const orderId = String(rawRow[mapping.orderKey]).trim();
              if (orderId && orderId.toLowerCase() !== 'null' && orderId.toLowerCase() !== 'n/a') {
                if (seenOrderIds.has(orderId)) {
                  duplicatesCount++;
                  continue;
                }
                seenOrderIds.add(orderId);
              }
            }

            const cleanedRow: ProcessedRow = {};
            for (const header of headers) {
              const rawVal = rawRow[header];
              
              if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
                nullsResolvedCount++;
              }

              if (header === mapping.revenueKey || header === mapping.quantityKey) {
                cleanedRow[header] = sanitizeNumber(rawVal);
              } else if (header === mapping.dateKey) {
                cleanedRow[header] = sanitizeDate(rawVal);
              } else {
                cleanedRow[header] = sanitizeString(rawVal, 'Uncategorized');
              }
            }

            cleanedRows.push(cleanedRow);
          }

          const kpis: KpiMetrics = {};

          if (mapping.revenueKey) {
            kpis.totalRevenue = cleanedRows.reduce((acc, row) => acc + (Number(row[mapping.revenueKey!]) || 0), 0);
          }

          kpis.totalOrders = cleanedRows.length;

          if (mapping.customerKey) {
            const uniqueCustomers = new Set(
              cleanedRows
                .map(r => r[mapping.customerKey!])
                .filter(val => val && val !== 'Uncategorized' && val !== 'Unknown')
            );
            kpis.totalCustomers = uniqueCustomers.size > 0 ? uniqueCustomers.size : cleanedRows.length;
          }

          if (kpis.totalRevenue !== undefined && kpis.totalOrders && kpis.totalOrders > 0) {
            kpis.averageOrderValue = kpis.totalRevenue / kpis.totalOrders;
          }

          if (mapping.quantityKey) {
            kpis.totalUnitsSold = cleanedRows.reduce((acc, row) => acc + (Number(row[mapping.quantityKey!]) || 0), 0);
          }

          const sanitizedTitle = fileName
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          const categoryType = detectCategoryType(fileName, cleanedRows);

          const audit: AuditStats = {
            totalRawRows: rawRows.length,
            cleanRowsCount: cleanedRows.length,
            duplicatesPurged: duplicatesCount,
            nullValuesResolved: nullsResolvedCount,
            columnsDetected: Object.entries(mapping)
              .filter(([_, val]) => !!val)
              .map(([key, val]) => `${key} -> "${val}"`)
          };

          resolve({
            meta: {
              fileName,
              sanitizedTitle,
              categoryType,
              uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            mapping,
            audit,
            rows: cleanedRows,
            kpis,
            headers
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (err: any) => reject(err)
    });
  });
}
