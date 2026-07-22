'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, AlertTriangle, Package } from 'lucide-react';
import { type CartItem, type ProductoCatalogo } from './salesData';
import { formatCurrency } from '../../../lib/currency';

interface ProductSearchPanelProps {
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  cartItems: CartItem[];
}

type ProductoApi = {
  id: string | number;
  sku: string;
  nombre: string;
  laboratorio: string;
  categoria: string;
  precioVenta?: number | string;
  precio_venta?: number | string;
  stockActual?: number | string;
  stock_actual?: number | string;
  status: string;
};

export default function ProductSearchPanel({ onAddToCart, cartItems }: ProductSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [catalogoProductos, setCatalogoProductos] = useState<ProductoCatalogo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.trim().length < 2) {
      return [];
    }
    const q = query.toLowerCase();
    return catalogoProductos.filter(
      (p) =>
        p.status !== 'agotado' &&
        (p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.laboratorio.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q))
    );
  }, [query, catalogoProductos]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getQty = (id: string) => quantities[id] ?? 1;

  const handleAdd = (product: ProductoCatalogo) => {
    const qty = getQty(product.id);
    onAddToCart({
      productoId: product.id,
      sku: product.sku,
      nombre: product.nombre,
      precioUnitario: product.precioVenta,
      cantidad: qty,
      descuento: 0,
      stockActual: product.stockActual,
    });
    setQuery('');
    setShowDropdown(false);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

const cartProductIds = new Set(cartItems.map((c) => c.productoId));

useEffect(() => {
  const cargarProductos = async () => {
    try {
      const response = await fetch(
        'http://localhost/farmacia-api/productos.php'
      );

      const data = await response.json() as ProductoApi[];

      const productosFormateados = data.map((p) => ({
        id: String(p.id),
        sku: p.sku,
        nombre: p.nombre,
        laboratorio: p.laboratorio,
        categoria: p.categoria,
        precioVenta: Number(p.precioVenta ?? p.precio_venta),
        stockActual: Number(p.stockActual ?? p.stock_actual),
        status: p.status,
      }));

      console.log('PRODUCTOS CARGADOS:', productosFormateados);

      setCatalogoProductos(productosFormateados);
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  void cargarProductos();
}, []);
  return (
    <div className="card p-5">
      <h2 className="section-header mb-1">Buscar Medicamento</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Escribe el nombre, SKU o laboratorio para agregar productos al carrito
      </p>

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setShowDropdown(value.trim().length >= 2);
            }}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder="Buscar por nombre, SKU, laboratorio..."
            className="input-field pl-9"
            autoComplete="off"
          />
        </div>

        {/* Dropdown results */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-20 mt-1 bg-card border border-border rounded-xl shadow-dropdown overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
                <Package size={16} />
                No se encontraron medicamentos disponibles para &quot;{query}&quot;
              </div>
            ) : (
              results.map((product) => {
                const inCart = cartProductIds.has(product.id);
                const lowStock = product.stockActual <= 20;
                return (
                  <div
                    key={`search-${product.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{product.nombre}</p>
                        {lowStock && (
                          <AlertTriangle size={12} className="text-warning flex-shrink-0" />
                        )}
                        {inCart && (
                          <span className="text-xs text-primary font-medium flex-shrink-0">En carrito</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
                        <span className="text-xs text-muted-foreground">{product.laboratorio}</span>
                        <span className="text-xs text-muted-foreground">Stock: {product.stockActual}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(product.precioVenta)}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={product.stockActual}
                        value={getQty(product.id)}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Math.min(product.stockActual, Math.max(1, Number(e.target.value))),
                          }))
                        }
                        className="input-field w-14 py-1 px-2 text-xs text-center"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={() => handleAdd(product)}
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-150"
                        title={`Agregar ${product.nombre} al carrito`}
                        aria-label={`Agregar ${product.nombre}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick add grid — top products */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Productos frecuentes
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {catalogoProductos.slice(0, 6).map((product) => {
            const inCart = cartProductIds.has(product.id);
            const unavailable = product.status === 'agotado';
            return (
              <button
                key={`quick-${product.id}`}
                onClick={() => !unavailable && handleAdd(product)}
                disabled={unavailable}
                className={`text-left p-2.5 rounded-lg border transition-all duration-150 ${
                  unavailable
                    ? 'border-border opacity-50 cursor-not-allowed'
                    : inCart
                    ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' :'border-border hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                <p className="text-xs font-medium text-foreground leading-tight truncate">{product.nombre}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs tabular-nums font-semibold text-primary">{formatCurrency(product.precioVenta)}</span>
                  {inCart && <span className="text-xs text-primary">✓</span>}
                  {unavailable && <span className="text-xs text-danger">Agotado</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
