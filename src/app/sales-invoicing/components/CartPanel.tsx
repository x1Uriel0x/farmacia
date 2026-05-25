'use client';

import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';
import { type CartItem } from './salesData';

interface CartPanelProps {
  items: CartItem[];
  onUpdateItem: (id: string, field: 'cantidad' | 'descuento', value: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartPanel({ items, onUpdateItem, onRemoveItem }: CartPanelProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="section-header">Carrito de Venta</h2>
        <span className="text-xs text-muted-foreground">
          {items.length} ítem{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState entity="venta" message="El carrito está vacío. Busca medicamentos arriba para agregarlos." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="table-header">Medicamento</th>
                <th className="table-header text-center w-28">Cantidad</th>
                <th className="table-header text-right w-24">P. Unitario</th>
                <th className="table-header text-center w-24">Desc. %</th>
                <th className="table-header text-right w-24">Subtotal</th>
                <th className="table-header w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const lineTotal = item.precioUnitario * item.cantidad;
                const discountAmount = lineTotal * (item.descuento / 100);
                const subtotal = lineTotal - discountAmount;

                return (
                  <tr key={item.id} className="table-row group">
                    <td className="table-cell">
                      <p className="font-medium text-foreground text-sm leading-tight">{item.nombre}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.sku}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onUpdateItem(item.id, 'cantidad', item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={10} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => onUpdateItem(item.id, 'cantidad', Number(e.target.value))}
                          className="w-12 text-center input-field py-1 px-1 text-sm tabular-nums"
                          aria-label="Cantidad"
                        />
                        <button
                          onClick={() => onUpdateItem(item.id, 'cantidad', item.cantidad + 1)}
                          className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell text-right tabular-nums text-muted-foreground text-sm">
                      ${item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center">
                        <div className="relative w-16">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={item.descuento}
                            onChange={(e) => onUpdateItem(item.id, 'descuento', Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="input-field py-1 px-2 text-sm text-center tabular-nums w-full"
                            aria-label="Descuento porcentaje"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div>
                        <p className="font-semibold text-foreground tabular-nums text-sm">${subtotal.toFixed(2)}</p>
                        {item.descuento > 0 && (
                          <p className="text-xs text-danger tabular-nums">-${discountAmount.toFixed(2)}</p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger-bg transition-colors opacity-0 group-hover:opacity-100"
                        title={`Eliminar ${item.nombre} del carrito`}
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}