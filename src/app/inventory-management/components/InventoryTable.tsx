'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import Badge, { type BadgeVariant } from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { type Producto, type StockStatus } from './inventoryData';

interface InventoryTableProps {
  productos: Producto[];
  allSelected: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (p: Producto) => void;
  onDelete: (p: Producto) => void;
  totalItems: number;
  rol : string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

type SortKey = keyof Producto;

const statusLabel: Record<StockStatus, string> = {
  disponible: 'Disponible',
  'bajo-stock': 'Bajo Stock',
  agotado: 'Agotado',
  'por-vencer': 'Por Vencer',
  vencido: 'Vencido',
  descontinuado: 'Descontinuado',

};

export default function InventoryTable({
  productos,
  allSelected,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  rol,
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: InventoryTableProps) {

  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...productos].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return 0;
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp size={10} className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/40'} />
      <ChevronDown size={10} className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/40'} />
    </span>
  );

  const cols: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'nombre', label: 'Medicamento', sortable: true },
    { key: 'laboratorio', label: 'Laboratorio', sortable: true },
    { key: 'categoria', label: 'Categoría', sortable: true },
    { key: 'stockActual', label: 'Stock', sortable: true },
    { key: 'precioCompra', label: 'P. Compra', sortable: true },
    { key: 'precioVenta', label: 'P. Venta', sortable: true },
    { key: 'fechaVencimiento', label: 'Vencimiento', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="table-header w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                  aria-label="Seleccionar todos"
                />
              </th>
              {cols.map((col) => (
                <th
                  key={`th-${col.key}`}
                  className={`table-header ${col.sortable ? 'cursor-pointer hover:bg-muted select-none' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
              <th className="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <EmptyState entity="producto" />
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr
                key={p.id}
                  className={`group table-row ${selectedIds.has(p.id) ? 'bg-primary/5' : ''}`}
                  >  
                  <td className="table-cell w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => onToggleSelect(p.id)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                      aria-label={`Seleccionar ${p.nombre}`}
                    />
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground max-w-[200px] truncate">{p.nombre}</span>
                      {p.controlado && (
                        <Shield size={12} className="text-warning flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Lote: {p.lote}</p>
                  </td>
                  <td className="table-cell text-muted-foreground">{p.laboratorio}</td>
                  <td className="table-cell text-muted-foreground text-xs">{p.categoria}</td>
                  <td className="table-cell">
                    <div className="tabular-nums">
                      <span className={`font-semibold ${p.stockActual === 0 ? 'text-danger' : p.stockActual < p.stockMinimo ? 'text-warning' : 'text-foreground'}`}>
                        {p.stockActual}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {p.stockMinimo} mín</span>
                    </div>
                    {p.stockActual < p.stockMinimo && p.stockActual > 0 && (
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div
                          className="bg-warning rounded-full h-1"
                          style={{ width: `${Math.min(100, (p.stockActual / p.stockMinimo) * 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="table-cell tabular-nums text-muted-foreground">
                    ${p.precioCompra.toFixed(2)}
                  </td>
                  <td className="table-cell tabular-nums font-medium text-foreground">
                    ${p.precioVenta.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    <span className={`text-xs tabular-nums ${
                      p.status === 'por-vencer' ? 'text-accent font-semibold' :
                      p.status === 'agotado' ? 'text-danger' : 'text-muted-foreground'
                    }`}>
                      {p.fechaVencimiento.split('-').reverse().join('/')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <Badge variant={p.status as BadgeVariant} label={statusLabel[p.status]} />
                  </td>
                  <td className="table-cell">
                    {rol === 'admin' && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-info/10 text-muted-foreground hover:text-info transition-colors"
                        title={`Editar ${p.nombre}`}
                        aria-label={`Editar ${p.nombre}`}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => onDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors"
                        title={`Eliminar ${p.nombre}`}
                        aria-label={`Eliminar ${p.nombre}`}
                      >
                    <Trash2 size={14} />
                      </button>
                      </div>
                    )}
                    {/* Fallback always-visible actions for non-hover devices */}
                    {rol === 'admin' && (
                  <div className="flex items-center justify-end gap-1 sm:hidden">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-info/10 text-muted-foreground hover:text-info transition-colors"
                      >
                    <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors"
                      >
                    <Trash2 size={14} />
                    </button>
                  </div>
                )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="input-field py-1 px-2 w-16 text-xs"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={`ipp-${n}`} value={n}>{n}</option>
              ))}
            </select>
            <span>de {totalItems} productos</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              if (page > totalPages) return null;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}