import { type DashboardMetricas, type VentaDiaria } from '../app/components/dashboardData';
import { type SessionUser } from './session';

type SaleRow = {
  usuarioId: string;
  vendedor: string;
  fecha: string;
  productos: number;
  total: number;
  estado: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  const rows = value.data ?? value.ventas ?? value.historial ?? value.resultado;
  return Array.isArray(rows) ? rows : [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function parseSaleDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeSale(row: unknown): SaleRow {
  const item = isRecord(row) ? row : {};

  return {
    usuarioId: toStringValue(item.usuario_id ?? item.id_usuario ?? item.vendedor_id),
    vendedor: toStringValue(item.vendedor ?? item.usuario ?? item.usuario_nombre),
    fecha: toStringValue(item.fecha ?? item.created_at ?? item.fecha_venta),
    productos: toNumber(item.productos ?? item.productos_count ?? item.total_productos ?? item.unidades),
    total: toNumber(item.total),
    estado: toStringValue(item.estado ?? item.status, 'facturada').toLowerCase(),
  };
}

function isOwnSale(sale: SaleRow, user: SessionUser): boolean {
  if (user.id && sale.usuarioId) return sale.usuarioId === user.id;
  return sale.vendedor.trim().toLowerCase() === user.nombre.trim().toLowerCase();
}

function isToday(value: string): boolean {
  const date = parseSaleDate(value);
  if (!date) return false;
  return date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function getDayLabel(value: string): string {
  const date = parseSaleDate(value);
  if (!date) return 'Sin fecha';
  return new Intl.DateTimeFormat('es', { weekday: 'short', day: '2-digit' }).format(date);
}

export function buildSalesParams(user: SessionUser): URLSearchParams {
  const params = new URLSearchParams();
  if (user.rol === 'vendedor') {
    if (user.id) params.set('usuario_id', user.id);
    if (user.nombre) params.set('usuario', user.nombre);
  }
  return params;
}

export function buildSellerMetrics(payload: unknown, user: SessionUser): DashboardMetricas {
  const ventas = unwrapRows(payload)
    .map(normalizeSale)
    .filter((sale) => sale.estado !== 'anulada')
    .filter((sale) => isOwnSale(sale, user));

  return {
    ventasTotales: ventas.reduce((sum, sale) => sum + sale.total, 0),
    ventasDia: ventas.filter((sale) => isToday(sale.fecha)).reduce((sum, sale) => sum + sale.total, 0),
    facturasHoy: ventas.length,
    unidadesVendidas: ventas.reduce((sum, sale) => sum + sale.productos, 0),
    bajoStock: 0,
    stockAgotado: 0,
    porVencer: 0,
    vencidos: 0,
    valorInventario: 0,
  };
}

export function buildSellerDailySales(payload: unknown, user: SessionUser): VentaDiaria[] {
  const grouped = new Map<string, VentaDiaria>();

  unwrapRows(payload)
    .map(normalizeSale)
    .filter((sale) => sale.estado !== 'anulada')
    .filter((sale) => isOwnSale(sale, user))
    .forEach((sale) => {
      const date = parseSaleDate(sale.fecha);
      const key = date ? date.toISOString().slice(0, 10) : sale.fecha || 'sin-fecha';
      const current = grouped.get(key) ?? { dia: getDayLabel(sale.fecha), ventas: 0 };
      grouped.set(key, { ...current, ventas: current.ventas + sale.total });
    });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, value]) => value);
}

