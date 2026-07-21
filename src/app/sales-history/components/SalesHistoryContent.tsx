'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  FileText,
  Loader2,
  ReceiptText,
  RotateCcw,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

type FormaPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';

type VentaHistorial = {
  id: string;
  usuarioId: string;
  factura: string;
  fecha: string;
  cliente: string;
  identificacion: string;
  vendedor: string;
  formaPago: FormaPago;
  productos: number;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'facturada' | 'anulada' | 'borrador';
};

type CurrentUser = {
  id: string;
  nombre: string;
  rol: string;
};

const API_URL = 'http://localhost/farmacia-api/ventas_historial.php';

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

function normalizeFormaPago(value: unknown): FormaPago {
  const forma = String(value ?? '').toLowerCase();
  if (forma === 'efectivo' || forma === 'tarjeta' || forma === 'transferencia') return forma;
  return 'otro';
}

function normalizeEstado(value: unknown): VentaHistorial['estado'] {
  const estado = String(value ?? '').toLowerCase();
  if (estado === 'anulada') return 'anulada';
  if (estado === 'borrador') return 'borrador';
  return 'facturada';
}

function normalizeVenta(row: unknown, index: number): VentaHistorial {
  const item = isRecord(row) ? row : {};

  return {
    id: toStringValue(item.id ?? item.venta_id ?? item.id_venta, String(index + 1)),
    usuarioId: toStringValue(item.usuario_id ?? item.id_usuario ?? item.vendedor_id, ''),
    factura: toStringValue(item.factura ?? item.numero_factura ?? item.invoiceNumber ?? item.invoice_number, `F-${index + 1}`),
    fecha: toStringValue(item.fecha ?? item.created_at ?? item.fecha_venta, ''),
    cliente: toStringValue(item.cliente ?? item.cliente_nombre ?? item.nombre_cliente, 'Consumidor Final'),
    identificacion: toStringValue(item.identificacion ?? item.cliente_identificacion ?? item.documento, ''),
    vendedor: toStringValue(item.vendedor ?? item.usuario ?? item.usuario_nombre, 'Sistema'),
    formaPago: normalizeFormaPago(item.formaPago ?? item.forma_pago),
    productos: toNumber(item.productos ?? item.productos_count ?? item.total_productos ?? item.unidades),
    subtotal: toNumber(item.subtotal ?? item.subtotal_neto),
    iva: toNumber(item.iva),
    total: toNumber(item.total),
    estado: normalizeEstado(item.estado ?? item.status),
  };
}

function getCurrentUser(): CurrentUser {
  try {
    const data = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Record<string, unknown>;

    return {
      id: toStringValue(data.id ?? data.id_usuario ?? data.usuario_id, ''),
      nombre: toStringValue(data.nombre ?? data.usuario ?? data.email ?? data.correo, ''),
      rol: toStringValue(data.rol ?? data.role, '').toLowerCase(),
    };
  } catch {
    return {
      id: '',
      nombre: '',
      rol: '',
    };
  }
}

function isOwnSale(venta: VentaHistorial, user: CurrentUser): boolean {
  if (user.rol !== 'vendedor') return true;
  if (user.id && venta.usuarioId) return venta.usuarioId === user.id;
  return venta.vendedor.trim().toLowerCase() === user.nombre.trim().toLowerCase();
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDate(value: string): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getYearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => current - index);
}

export default function SalesHistoryContent() {
  const [ventas, setVentas] = useState<VentaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fecha, setFecha] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: '',
    nombre: '',
    rol: '',
  });

  useEffect(() => {
    const cargarVentas = async () => {
      setLoading(true);
      try {
        const sessionUser = getCurrentUser();
        setCurrentUser(sessionUser);

        const params = new URLSearchParams();
        if (fecha) params.set('fecha', fecha);
        if (!fecha && mes) params.set('mes', mes);
        if (!fecha && anio) params.set('anio', anio);
        if (sessionUser.rol === 'vendedor') {
          if (sessionUser.id) params.set('usuario_id', sessionUser.id);
          if (sessionUser.nombre) params.set('usuario', sessionUser.nombre);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const data = await response.json();
        const rows = unwrapRows(data)
          .map(normalizeVenta)
          .filter((venta) => isOwnSale(venta, sessionUser));
        setVentas(rows);
      } catch (error) {
        console.error('Error al cargar historial de ventas:', error);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };

    void cargarVentas();
  }, [fecha, mes, anio]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ventas.filter((venta) => {
      const ventaDate = venta.fecha ? new Date(venta.fecha.includes('T') ? venta.fecha : venta.fecha.replace(' ', 'T')) : null;
      const matchSearch =
        query === '' ||
        venta.factura.toLowerCase().includes(query) ||
        venta.cliente.toLowerCase().includes(query) ||
        venta.identificacion.toLowerCase().includes(query) ||
        venta.vendedor.toLowerCase().includes(query);
      const matchFecha =
        !fecha ||
        (ventaDate && ventaDate.toISOString().slice(0, 10) === fecha);
      const matchMes =
        fecha ||
        !mes ||
        (ventaDate && String(ventaDate.getMonth() + 1).padStart(2, '0') === mes);
      const matchAnio =
        fecha ||
        !anio ||
        (ventaDate && String(ventaDate.getFullYear()) === anio);

      return matchSearch && matchFecha && matchMes && matchAnio;
    });
  }, [ventas, search, fecha, mes, anio]);

  const resumen = useMemo(() => {
    return filtered.reduce(
      (acc, venta) => ({
        ventas: acc.ventas + 1,
        productos: acc.productos + venta.productos,
        total: acc.total + venta.total,
      }),
      { ventas: 0, productos: 0, total: 0 }
    );
  }, [filtered]);

  const clearFilters = () => {
    setSearch('');
    setFecha('');
    setMes('');
    setAnio(String(new Date().getFullYear()));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Historial de Ventas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {currentUser.rol === 'vendedor'
              ? 'Consulta tus ventas por fecha, mes y año'
              : 'Consulta ventas por fecha, mes y año'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard icon={<ReceiptText size={18} />} label="Ventas" value={String(resumen.ventas)} />
        <MetricCard icon={<ShoppingBag size={18} />} label="Productos vendidos" value={String(resumen.productos)} />
        <MetricCard icon={<FileText size={18} />} label="Total facturado" value={formatMoney(resumen.total)} />
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_160px_140px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-9"
              placeholder="Buscar por factura, cliente, ID o vendedor..."
            />
          </div>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select
            value={mes}
            onChange={(event) => setMes(event.target.value)}
            className="input-field"
            disabled={fecha !== ''}
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
            disabled={fecha !== ''}
          >
            <option value="">Todos los años</option>
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="table-header">Factura</th>
                <th className="table-header">Fecha</th>
                <th className="table-header">Cliente</th>
                <th className="table-header">Vendedor</th>
                <th className="table-header">Pago</th>
                <th className="table-header text-right">Productos</th>
                <th className="table-header text-right">Total</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Cargando historial...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      entity="factura"
                      message="No se encontraron ventas con los filtros seleccionados."
                    />
                  </td>
                </tr>
              )}

              {!loading && filtered.map((venta) => (
                <tr key={venta.id} className="table-row">
                  <td className="table-cell font-semibold text-primary">{venta.factura}</td>
                  <td className="table-cell text-muted-foreground">{formatDate(venta.fecha)}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{venta.cliente}</p>
                      {venta.identificacion && (
                        <p className="text-xs text-muted-foreground">{venta.identificacion}</p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-2">
                      <User size={14} className="text-muted-foreground" />
                      {venta.vendedor}
                    </span>
                  </td>
                  <td className="table-cell capitalize text-muted-foreground">{venta.formaPago}</td>
                  <td className="table-cell text-right tabular-nums">{venta.productos}</td>
                  <td className="table-cell text-right font-semibold tabular-nums">{formatMoney(venta.total)}</td>
                  <td className="table-cell">
                    <Badge
                      variant={venta.estado}
                      label={venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
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
      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}
