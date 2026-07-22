'use client';

import { formatCurrency } from '../../../lib/currency';

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
  rol: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

type SortKey = keyof Producto;

type Column = {
  key: SortKey;
  label: string;
  sortable?: boolean;
  hiddenForConsulta?: boolean;
};

const statusLabel: Record<StockStatus, string> = {
  disponible: 'Disponible',
  'bajo-stock': 'Bajo Stock',
  agotado: 'Agotado',
  'por-vencer': 'Por Vencer',
  vencido: 'Vencido',
  descontinuado: 'Descontinuado',
};

const columns: Column[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'nombre', label: 'Medicamento', sortable: true },
  { key: 'laboratorio', label: 'Laboratorio', sortable: true },
  { key: 'categoria', label: 'Categoría', sortable: true },

  { key: 'stockActual', label: 'Stock', sortable: true, hiddenForConsulta: true },
  { key: 'precioCompra', label: 'P. Compra', sortable: true, hiddenForConsulta: true },
  { key: 'precioVenta', label: 'P. Venta', sortable: true, hiddenForConsulta: true },
  { key: 'fechaVencimiento', label: 'Vencimiento', sortable: true, hiddenForConsulta: true },

  { key: 'status', label: 'Estado', sortable: true },
];

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
  const isAdmin = rol === 'admin';
  const isConsultation = rol === 'consulta';
  const visibleColumns = columns.filter((column) => !(isConsultation && column.hiddenForConsulta));
  const tableColSpan = visibleColumns.length + (isConsultation ? 0 : 1) + (isAdmin ? 1 : 0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
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

  const renderCell = (product: Producto, key: SortKey) => {
    if (key === 'sku') {
      return <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>;
    }

    if (key === 'nombre') {
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground max-w-[240px] truncate">{product.nombre}</span>
            {product.controlado && <Shield size={12} className="text-warning flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">Lote: {product.lote}</p>
        </div>
      );
    }

    if (key === 'laboratorio') {
      return <span className="text-muted-foreground">{product.laboratorio}</span>;
    }

    if (key === 'categoria') {
      return <span className="text-xs text-muted-foreground">{product.categoria}</span>;
    }

    if (key === 'stockActual') {
      return (
        <div>
          <div className="tabular-nums">
            <span className={`font-semibold ${product.stockActual === 0 ? 'text-danger' : product.stockActual < product.stockMinimo ? 'text-warning' : 'text-foreground'}`}>
              {product.stockActual}
            </span>
            <span className="text-xs text-muted-foreground"> / {product.stockMinimo} mín</span>
          </div>
          {product.stockActual < product.stockMinimo && product.stockActual > 0 && (
            <div className="w-full bg-muted rounded-full h-1 mt-1">
              <div
                className="bg-warning rounded-full h-1"
                style={{ width: `${Math.min(100, (product.stockActual / product.stockMinimo) * 100)}%` }}
              />
            </div>
          )}
        </div>
      );
    }

    if (key === 'precioCompra') {
      return <span className="tabular-nums text-muted-foreground">{formatCurrency(product.precioCompra)}</span>;
    }

    if (key === 'precioVenta') {
      return <span className="tabular-nums font-medium text-foreground">{formatCurrency(product.precioVenta)}</span>;
    }

    if (key === 'fechaVencimiento') {
      return (
        <span className={`text-xs tabular-nums ${
          product.status === 'por-vencer' ? 'text-accent font-semibold' :
          product.status === 'agotado' ? 'text-danger' : 'text-muted-foreground'
        }`}>
          {product.fechaVencimiento.split('-').reverse().join('/')}
        </span>
      );
    }

    return <Badge variant={product.status as BadgeVariant} label={statusLabel[product.status]} />;
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              {!isConsultation && (
                <th className="table-header w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                    aria-label="Seleccionar todos"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={`th-${column.key}`}
                  className={`table-header ${column.sortable ? 'cursor-pointer hover:bg-muted select-none' : ''}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <span className="flex items-center">
                    {column.label}
                    {column.sortable && <SortIcon col={column.key} />}
                  </span>
                </th>
              ))}
              {isAdmin && <th className="table-header text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={tableColSpan}>
                  <EmptyState entity="producto" />
                </td>
              </tr>
            ) : (
              sorted.map((product) => (
                <tr
                  key={product.id}
                  className={`group table-row ${selectedIds.has(product.id) ? 'bg-primary/5' : ''}`}
                >
                  {!isConsultation && (
                    <td className="table-cell w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => onToggleSelect(product.id)}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                        aria-label={`Seleccionar ${product.nombre}`}
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td key={`${product.id}-${column.key}`} className="table-cell">
                      {renderCell(product, column.key)}
                    </td>
                  ))}
                  {isAdmin && (
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-info/10 text-muted-foreground hover:text-info transition-colors"
                          title={`Editar ${product.nombre}`}
                          aria-label={`Editar ${product.nombre}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors"
                          title={`Eliminar ${product.nombre}`}
                          aria-label={`Eliminar ${product.nombre}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

