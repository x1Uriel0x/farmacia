'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  Loader2,
  ReceiptText,
  RotateCcw,
  Search,
} from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';

type ReportType =
  | 'factura-detalle'
  | 'ventas-fecha'
  | 'ventas-vendedor'
  | 'inventario-actual'
  | 'bajo-stock'
  | 'vencimientos'
  | 'productos-vendidos'
  | 'utilidad'
  | 'forma-pago';

type ReportColumn = {
  key: string;
  label: string;
  align?: 'left' | 'right';
};

type ReportRow = Record<string, string | number>;

type ReportResult = {
  columns: ReportColumn[];
  rows: ReportRow[];
};

type VentaDetalle = {
  productoId: string;
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  costoUnitario: number;
};

type Venta = {
  id: string;
  factura: string;
  fecha: string;
  cliente: string;
  identificacion: string;
  vendedor: string;
  usuarioId: string;
  formaPago: string;
  productos: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
  detalle: VentaDetalle[];
};

type Producto = {
  id: string;
  sku: string;
  nombre: string;
  laboratorio: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  fechaVencimiento: string;
  lote: string;
  status: string;
};

const VENTAS_URL = 'http://localhost/farmacia-api/ventas_historial.php';
const PRODUCTOS_URL = 'http://localhost/farmacia-api/productos.php';

const reportOptions: { id: ReportType; title: string; description: string }[] = [
  {
    id: 'factura-detalle',
    title: 'Detalle de factura',
    description: 'Factura, cliente y detalle de productos vendidos.',
  },
  {
    id: 'ventas-fecha',
    title: 'Ventas por fecha',
    description: 'Totales de ventas, IVA y facturas por periodo.',
  },
  {
    id: 'ventas-vendedor',
    title: 'Ventas por vendedor',
    description: 'Rendimiento y facturación por usuario vendedor.',
  },
  {
    id: 'inventario-actual',
    title: 'Inventario actual',
    description: 'Stock, precios y valor total por producto.',
  },
  {
    id: 'bajo-stock',
    title: 'Productos bajo stock',
    description: 'Productos que requieren reposición.',
  },
  {
    id: 'vencimientos',
    title: 'Vencidos y por vencer',
    description: 'Productos filtrados por fecha de vencimiento.',
  },
  {
    id: 'productos-vendidos',
    title: 'Productos más vendidos',
    description: 'Unidades vendidas e ingresos por medicamento.',
  },
  {
    id: 'utilidad',
    title: 'Utilidad estimada',
    description: 'Ganancia aproximada según costo y precio de venta.',
  },
  {
    id: 'forma-pago',
    title: 'Ventas por forma de pago',
    description: 'Totales cobrados en efectivo, tarjeta y transferencia.',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapRows(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  for (const key of keys) {
    const rows = value[key];
    if (Array.isArray(rows)) return rows;
  }

  return [];
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

function normalizeDetalle(value: unknown): VentaDetalle[] {
  const rows = Array.isArray(value) ? value : [];

  return rows.map((row) => {
    const item = isRecord(row) ? row : {};
    const cantidad = toNumber(item.cantidad ?? item.qty);
    const precioUnitario = toNumber(item.precioUnitario ?? item.precio_unitario ?? item.precio);
    const descuento = toNumber(item.descuento);
    const subtotal = toNumber(item.subtotal ?? item.total) || precioUnitario * cantidad;

    return {
      productoId: toStringValue(item.productoId ?? item.producto_id ?? item.id_producto),
      sku: toStringValue(item.sku ?? item.codigo),
      nombre: toStringValue(item.nombre ?? item.producto ?? item.descripcion, 'Producto'),
      cantidad,
      precioUnitario,
      descuento,
      subtotal,
      costoUnitario: toNumber(item.costoUnitario ?? item.costo_unitario ?? item.precioCompra ?? item.precio_compra),
    };
  });
}

function normalizeVenta(row: unknown, index: number): Venta {
  const item = isRecord(row) ? row : {};
  const detalleSource = item.detalle ?? item.productos_detalle ?? item.items ?? item.productos;
  const detalle = normalizeDetalle(detalleSource);

  return {
    id: toStringValue(item.id ?? item.venta_id ?? item.id_venta, String(index + 1)),
    factura: toStringValue(item.factura ?? item.numero_factura ?? item.invoiceNumber ?? item.invoice_number, `F-${index + 1}`),
    fecha: toStringValue(item.fecha ?? item.created_at ?? item.fecha_venta, ''),
    cliente: toStringValue(item.cliente ?? item.cliente_nombre ?? item.nombre_cliente, 'Consumidor Final'),
    identificacion: toStringValue(item.identificacion ?? item.cliente_identificacion ?? item.documento, ''),
    vendedor: toStringValue(item.vendedor ?? item.usuario ?? item.usuario_nombre, 'Sistema'),
    usuarioId: toStringValue(item.usuario_id ?? item.id_usuario ?? item.vendedor_id, ''),
    formaPago: toStringValue(item.formaPago ?? item.forma_pago, 'otro').toLowerCase(),
    productos: toNumber(item.productos_count ?? item.total_productos ?? item.unidades) || detalle.reduce((sum, d) => sum + d.cantidad, 0),
    subtotal: toNumber(item.subtotal ?? item.subtotal_neto),
    iva: toNumber(item.iva),
    total: toNumber(item.total),
    estado: toStringValue(item.estado ?? item.status, 'facturada'),
    detalle,
  };
}

function normalizeProducto(row: unknown): Producto {
  const item = isRecord(row) ? row : {};

  return {
    id: toStringValue(item.id ?? item.producto_id),
    sku: toStringValue(item.sku ?? item.codigo),
    nombre: toStringValue(item.nombre ?? item.producto, 'Producto'),
    laboratorio: toStringValue(item.laboratorio),
    categoria: toStringValue(item.categoria, 'Sin categoria'),
    stockActual: toNumber(item.stockActual ?? item.stock_actual),
    stockMinimo: toNumber(item.stockMinimo ?? item.stock_minimo),
    precioCompra: toNumber(item.precioCompra ?? item.precio_compra),
    precioVenta: toNumber(item.precioVenta ?? item.precio_venta),
    fechaVencimiento: toStringValue(item.fechaVencimiento ?? item.fecha_vencimiento),
    lote: toStringValue(item.lote),
    status: toStringValue(item.status ?? item.estado, 'disponible'),
  };
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value || 'Sin fecha';
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function getYearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => current - index);
}

function groupKeyByDate(value: string): string {
  const date = parseDate(value);
  if (!date) return 'Sin fecha';
  return date.toISOString().slice(0, 10);
}

function matchesDateFilters(value: string, filters: { desde: string; hasta: string; mes: string; anio: string }) {
  const date = parseDate(value);
  if (!date) return false;

  if (filters.desde && date < new Date(`${filters.desde}T00:00:00`)) return false;
  if (filters.hasta && date > new Date(`${filters.hasta}T23:59:59`)) return false;
  if (!filters.desde && !filters.hasta && filters.mes && String(date.getMonth() + 1).padStart(2, '0') !== filters.mes) return false;
  if (!filters.desde && !filters.hasta && filters.anio && String(date.getFullYear()) !== filters.anio) return false;

  return true;
}

function tableToExcel(filename: string, columns: ReportColumn[], rows: ReportRow[]) {
  const tableRows = rows.map((row) => (
    `<tr>${columns.map((column) => `<td>${String(row[column.key] ?? '')}</td>`).join('')}</tr>`
  )).join('');
  const tableHead = `<tr>${columns.map((column) => `<th>${column.label}</th>`).join('')}</tr>`;
  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead>${tableHead}</thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildReport(reportType: ReportType, ventas: Venta[], productos: Producto[]): ReportResult {
  switch (reportType) {
    case 'factura-detalle': {
      const columns: ReportColumn[] = [
        { key: 'factura', label: 'Factura' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'producto', label: 'Producto' },
        { key: 'cantidad', label: 'Cantidad', align: 'right' },
        { key: 'precioUnitario', label: 'P. Unitario', align: 'right' },
        { key: 'subtotal', label: 'Subtotal', align: 'right' },
      ];
      const rows = ventas.flatMap((venta) => {
        if (venta.detalle.length === 0) {
          return [{
            factura: venta.factura,
            fecha: formatDate(venta.fecha),
            cliente: venta.cliente,
            vendedor: venta.vendedor,
            producto: 'Detalle no disponible',
            cantidad: venta.productos,
            precioUnitario: '',
            subtotal: money(venta.total),
          }];
        }

        return venta.detalle.map((item) => ({
          factura: venta.factura,
          fecha: formatDate(venta.fecha),
          cliente: venta.cliente,
          vendedor: venta.vendedor,
          producto: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: money(item.precioUnitario),
          subtotal: money(item.subtotal),
        }));
      });
      return { columns, rows };
    }

    case 'ventas-fecha': {
      const grouped = new Map<string, { facturas: number; subtotal: number; iva: number; total: number }>();
      ventas.forEach((venta) => {
        const key = groupKeyByDate(venta.fecha);
        const current = grouped.get(key) ?? { facturas: 0, subtotal: 0, iva: 0, total: 0 };
        grouped.set(key, {
          facturas: current.facturas + 1,
          subtotal: current.subtotal + venta.subtotal,
          iva: current.iva + venta.iva,
          total: current.total + venta.total,
        });
      });

      const columns: ReportColumn[] = [
        { key: 'fecha', label: 'Fecha' },
        { key: 'facturas', label: 'Facturas', align: 'right' },
        { key: 'subtotal', label: 'Subtotal', align: 'right' },
        { key: 'iva', label: 'IVA', align: 'right' },
        { key: 'total', label: 'Total', align: 'right' },
      ];
      const rows = Array.from(grouped.entries()).map(([fecha, item]) => ({
        fecha,
        facturas: item.facturas,
        subtotal: money(item.subtotal),
        iva: money(item.iva),
        total: money(item.total),
      }));
      return { columns, rows };
    }

    case 'ventas-vendedor': {
      const grouped = new Map<string, { facturas: number; productos: number; total: number }>();
      ventas.forEach((venta) => {
        const current = grouped.get(venta.vendedor) ?? { facturas: 0, productos: 0, total: 0 };
        grouped.set(venta.vendedor, {
          facturas: current.facturas + 1,
          productos: current.productos + venta.productos,
          total: current.total + venta.total,
        });
      });

      const columns: ReportColumn[] = [
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'facturas', label: 'Facturas', align: 'right' },
        { key: 'productos', label: 'Productos', align: 'right' },
        { key: 'total', label: 'Total vendido', align: 'right' },
      ];
      const rows = Array.from(grouped.entries()).map(([vendedor, item]) => ({
        vendedor,
        facturas: item.facturas,
        productos: item.productos,
        total: money(item.total),
      }));
      return { columns, rows };
    }

    case 'inventario-actual': {
      const columns: ReportColumn[] = [
        { key: 'sku', label: 'SKU' },
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'laboratorio', label: 'Laboratorio' },
        { key: 'stock', label: 'Stock', align: 'right' },
        { key: 'precioCompra', label: 'P. Compra', align: 'right' },
        { key: 'precioVenta', label: 'P. Venta', align: 'right' },
        { key: 'valorInventario', label: 'Valor inventario', align: 'right' },
      ];
      const rows = productos.map((producto) => ({
        sku: producto.sku,
        producto: producto.nombre,
        categoria: producto.categoria,
        laboratorio: producto.laboratorio,
        stock: producto.stockActual,
        precioCompra: money(producto.precioCompra),
        precioVenta: money(producto.precioVenta),
        valorInventario: money(producto.stockActual * producto.precioCompra),
      }));
      return { columns, rows };
    }

    case 'bajo-stock': {
      const columns: ReportColumn[] = [
        { key: 'sku', label: 'SKU' },
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'stockActual', label: 'Stock actual', align: 'right' },
        { key: 'stockMinimo', label: 'Stock minimo', align: 'right' },
        { key: 'faltante', label: 'Faltante', align: 'right' },
      ];
      const rows = productos
        .filter((producto) => producto.stockActual <= producto.stockMinimo)
        .map((producto) => ({
          sku: producto.sku,
          producto: producto.nombre,
          categoria: producto.categoria,
          stockActual: producto.stockActual,
          stockMinimo: producto.stockMinimo,
          faltante: Math.max(0, producto.stockMinimo - producto.stockActual),
        }));
      return { columns, rows };
    }

    case 'vencimientos': {
      const today = new Date(new Date().toDateString());
      const columns: ReportColumn[] = [
        { key: 'sku', label: 'SKU' },
        { key: 'producto', label: 'Producto' },
        { key: 'lote', label: 'Lote' },
        { key: 'vencimiento', label: 'Vencimiento' },
        { key: 'stock', label: 'Stock', align: 'right' },
        { key: 'estado', label: 'Estado' },
      ];
      const rows = productos
        .filter((producto) => {
          const expiration = parseDate(producto.fechaVencimiento);
          if (!expiration) return false;
          const days = Math.ceil((expiration.getTime() - today.getTime()) / 86400000);
          return days <= 30;
        })
        .map((producto) => {
          const expiration = parseDate(producto.fechaVencimiento);
          const days = expiration ? Math.ceil((expiration.getTime() - today.getTime()) / 86400000) : 0;
          return {
            sku: producto.sku,
            producto: producto.nombre,
            lote: producto.lote,
            vencimiento: formatDate(producto.fechaVencimiento),
            stock: producto.stockActual,
            estado: days < 0 ? 'Vencido' : 'Por vencer',
          };
        });
      return { columns, rows };
    }

    case 'productos-vendidos': {
      const grouped = new Map<string, { producto: string; unidades: number; total: number }>();
      ventas.flatMap((venta) => venta.detalle).forEach((item) => {
        const key = item.productoId || item.sku || item.nombre;
        const current = grouped.get(key) ?? { producto: item.nombre, unidades: 0, total: 0 };
        grouped.set(key, {
          producto: item.nombre,
          unidades: current.unidades + item.cantidad,
          total: current.total + item.subtotal,
        });
      });

      const columns: ReportColumn[] = [
        { key: 'producto', label: 'Producto' },
        { key: 'unidades', label: 'Unidades vendidas', align: 'right' },
        { key: 'total', label: 'Total generado', align: 'right' },
      ];
      const rows = Array.from(grouped.values())
        .sort((a, b) => b.unidades - a.unidades)
        .map((item) => ({
          producto: item.producto,
          unidades: item.unidades,
          total: money(item.total),
        }));
      return { columns, rows };
    }

    case 'utilidad': {
      const productCostById = new Map(productos.map((producto) => [producto.id, producto.precioCompra]));
      const grouped = new Map<string, { producto: string; unidades: number; ingresos: number; costo: number }>();

      ventas.flatMap((venta) => venta.detalle).forEach((item) => {
        const key = item.productoId || item.sku || item.nombre;
        const current = grouped.get(key) ?? { producto: item.nombre, unidades: 0, ingresos: 0, costo: 0 };
        const costoUnitario = item.costoUnitario || productCostById.get(item.productoId) || 0;

        grouped.set(key, {
          producto: item.nombre,
          unidades: current.unidades + item.cantidad,
          ingresos: current.ingresos + item.subtotal,
          costo: current.costo + costoUnitario * item.cantidad,
        });
      });

      const columns: ReportColumn[] = [
        { key: 'producto', label: 'Producto' },
        { key: 'unidades', label: 'Unidades', align: 'right' },
        { key: 'ingresos', label: 'Ingresos', align: 'right' },
        { key: 'costo', label: 'Costo estimado', align: 'right' },
        { key: 'utilidad', label: 'Utilidad', align: 'right' },
      ];
      const rows = Array.from(grouped.values()).map((item) => ({
        producto: item.producto,
        unidades: item.unidades,
        ingresos: money(item.ingresos),
        costo: money(item.costo),
        utilidad: money(item.ingresos - item.costo),
      }));
      return { columns, rows };
    }

    case 'forma-pago': {
      const grouped = new Map<string, { facturas: number; total: number }>();
      ventas.forEach((venta) => {
        const current = grouped.get(venta.formaPago) ?? { facturas: 0, total: 0 };
        grouped.set(venta.formaPago, {
          facturas: current.facturas + 1,
          total: current.total + venta.total,
        });
      });

      const columns: ReportColumn[] = [
        { key: 'formaPago', label: 'Forma de pago' },
        { key: 'facturas', label: 'Facturas', align: 'right' },
        { key: 'total', label: 'Total', align: 'right' },
      ];
      const rows = Array.from(grouped.entries()).map(([formaPago, item]) => ({
        formaPago,
        facturas: item.facturas,
        total: money(item.total),
      }));
      return { columns, rows };
    }
  }
}

export default function ReportsContent() {
  const [reportType, setReportType] = useState<ReportType>('factura-detalle');
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [ventasResponse, productosResponse] = await Promise.all([
          fetch(VENTAS_URL),
          fetch(PRODUCTOS_URL),
        ]);

        const [ventasData, productosData] = await Promise.all([
          ventasResponse.json(),
          productosResponse.json(),
        ]);

        setVentas(unwrapRows(ventasData, ['data', 'ventas', 'historial', 'resultado']).map(normalizeVenta));
        setProductos(unwrapRows(productosData, ['data', 'productos', 'resultado']).map(normalizeProducto));
      } catch (error) {
        console.error('Error al cargar datos de reportes:', error);
        setVentas([]);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredVentas = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ventas.filter((venta) => {
      const matchDate = matchesDateFilters(venta.fecha, { desde, hasta, mes, anio });
      const matchSearch =
        query === '' ||
        venta.factura.toLowerCase().includes(query) ||
        venta.cliente.toLowerCase().includes(query) ||
        venta.vendedor.toLowerCase().includes(query) ||
        venta.identificacion.toLowerCase().includes(query);

      return matchDate && matchSearch;
    });
  }, [ventas, search, desde, hasta, mes, anio]);

  const filteredProductos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return productos.filter((producto) => (
      query === '' ||
      producto.nombre.toLowerCase().includes(query) ||
      producto.sku.toLowerCase().includes(query) ||
      producto.categoria.toLowerCase().includes(query) ||
      producto.laboratorio.toLowerCase().includes(query)
    ));
  }, [productos, search]);

  const report = useMemo(() => {
    return buildReport(reportType, filteredVentas, filteredProductos);
  }, [reportType, filteredVentas, filteredProductos]);

  const selectedReport = reportOptions.find((reportOption) => reportOption.id === reportType) ?? reportOptions[0];
  const totalRows = report.rows.length;

  const clearFilters = () => {
    setSearch('');
    setDesde('');
    setHasta('');
    setMes('');
    setAnio(String(new Date().getFullYear()));
  };

  const handleExport = () => {
    tableToExcel(selectedReport.title.toLowerCase().replaceAll(' ', '-'), report.columns, report.rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Generacion de Reportes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Reportes parametrizados y exportables a Excel
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={totalRows === 0}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Download size={16} />
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard icon={<FileSpreadsheet size={18} />} label="Reporte seleccionado" value={selectedReport.title} />
        <SummaryCard icon={<ReceiptText size={18} />} label="Registros" value={String(totalRows)} />
        <SummaryCard icon={<BarChart3 size={18} />} label="Fuentes" value="Ventas e inventario" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Tipos de reporte</h2>
          </div>

          <div className="divide-y divide-border">
            {reportOptions.map((reportOption) => (
              <button
                key={reportOption.id}
                type="button"
                onClick={() => setReportType(reportOption.id)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  reportType === reportOption.id
                    ? 'bg-primary/5 text-primary'
                    : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                <p className="text-sm font-semibold">{reportOption.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{reportOption.description}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="card p-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_160px_150px_130px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="input-field pl-9"
                  placeholder="Buscar factura, cliente, vendedor o producto..."
                />
              </div>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={desde}
                  onChange={(event) => setDesde(event.target.value)}
                  className="input-field pl-9"
                />
              </div>

              <input
                type="date"
                value={hasta}
                onChange={(event) => setHasta(event.target.value)}
                className="input-field"
              />

              <select
                value={mes}
                onChange={(event) => setMes(event.target.value)}
                className="input-field"
                disabled={desde !== '' || hasta !== ''}
              >
                <option value="">Todos los meses</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>

              <select
                value={anio}
                onChange={(event) => setAnio(event.target.value)}
                className="input-field"
                disabled={desde !== '' || hasta !== ''}
              >
                <option value="">Todos</option>
                {getYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">{selectedReport.title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{selectedReport.description}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-muted/40">
                    {report.columns.map((column) => (
                      <th
                        key={column.key}
                        className={`table-header ${column.align === 'right' ? 'text-right' : ''}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={report.columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Cargando datos...
                        </span>
                      </td>
                    </tr>
                  )}

                  {!loading && report.rows.length === 0 && (
                    <tr>
                      <td colSpan={report.columns.length}>
                        <EmptyState
                          entity="factura"
                          message="No hay datos para el reporte y filtros seleccionados."
                        />
                      </td>
                    </tr>
                  )}

                  {!loading && report.rows.map((row, index) => (
                    <tr key={`report-row-${index}`} className="table-row">
                      {report.columns.map((column) => (
                        <td
                          key={`${index}-${column.key}`}
                          className={`table-cell ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                        >
                          {row[column.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
