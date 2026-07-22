export type DashboardMetricas = {
  ventasTotales: number;
  ventasDia: number;
  facturasHoy: number;
  unidadesVendidas: number;
  bajoStock: number;
  stockAgotado: number;
  porVencer: number;
  vencidos: number;
  valorInventario: number;
};

export type VentaDiaria = {
  dia: string;
  ventas: number;
};

export type CategoriaStock = {
  categoria: string;
  stock: number;
};

export type Actividad = {
  id: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  usuario: string;
  fecha: string;
};

const emptyMetricas: DashboardMetricas = {
  ventasTotales: 0,
  ventasDia: 0,
  facturasHoy: 0,
  unidadesVendidas: 0,
  bajoStock: 0,
  stockAgotado: 0,
  porVencer: 0,
  vencidos: 0,
  valorInventario: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapPayload(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return value.data ?? value.datos ?? value.metricas ?? value.resultado ?? value;
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

export function normalizeMetricas(payload: unknown): DashboardMetricas {
  const data = unwrapPayload(payload);
  if (!isRecord(data)) return emptyMetricas;

  return {
    ventasTotales: toNumber(data.ventasTotales ?? data.ventas_totales ?? data.total_ventas),
    ventasDia: toNumber(data.ventasDia ?? data.ventas_dia ?? data.ventas_hoy ?? data.total_ventas_hoy),
    facturasHoy: toNumber(data.facturasHoy ?? data.facturas_hoy ?? data.ventas_count ?? data.total_facturas_hoy),
    unidadesVendidas: toNumber(data.unidadesVendidas ?? data.unidades_vendidas ?? data.productos_vendidos),
    bajoStock: toNumber(data.bajoStock ?? data.bajo_stock),
    stockAgotado: toNumber(data.stockAgotado ?? data.stock_agotado ?? data.agotados),
    porVencer: toNumber(data.porVencer ?? data.por_vencer),
    vencidos: toNumber(data.vencidos ?? data.productos_vencidos),
    valorInventario: toNumber(data.valorInventario ?? data.valor_inventario ?? data.total_inventario),
  };
}

export function normalizeVentasDiarias(payload: unknown): VentaDiaria[] {
  const data = unwrapPayload(payload);
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    const row = isRecord(item) ? item : {};
    return {
      dia: toStringValue(row.dia ?? row.fecha ?? row.label, `Dia ${index + 1}`),
      ventas: toNumber(row.ventas ?? row.total ?? row.total_ventas ?? row.monto),
    };
  });
}

export function normalizeStockCategorias(payload: unknown): CategoriaStock[] {
  const data = unwrapPayload(payload);
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const row = isRecord(item) ? item : {};
    return {
      categoria: toStringValue(row.categoria ?? row.nombre ?? row.category, 'Sin categoria'),
      stock: toNumber(row.stock ?? row.total ?? row.unidades ?? row.stockActual ?? row.stock_actual),
    };
  });
}

export function normalizeActividades(payload: unknown): Actividad[] {
  const data = unwrapPayload(payload);
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    const row = isRecord(item) ? item : {};
    return {
      id: toNumber(row.id ?? index + 1),
      tipo: toStringValue(row.tipo ?? row.type, 'actividad'),
      titulo: toStringValue(row.titulo ?? row.title, 'Actividad registrada'),
      descripcion: toStringValue(row.descripcion ?? row.description, ''),
      usuario: toStringValue(row.usuario ?? row.usuario_nombre ?? row.user, 'Sistema'),
      fecha: toStringValue(row.fecha ?? row.created_at ?? row.fecha_registro, new Date().toISOString()),
    };
  });
}
