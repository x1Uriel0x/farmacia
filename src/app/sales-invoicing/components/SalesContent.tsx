'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import ProductSearchPanel from './ProductSearchPanel';
import CartPanel from './CartPanel';
import InvoiceSummaryPanel from './InvoiceSummaryPanel';
import InvoicePreviewModal from './InvoicePreviewModal';
import { type CartItem, type ClienteInfo, type FormaPago, IVA_RATE } from './salesData';

let invoiceCounter = 893;

function generateInvoiceNumber(): string {
  invoiceCounter += 1;
  return `F-2026-0${invoiceCounter}`;
}

export default function SalesContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cliente, setCliente] = useState<ClienteInfo>({
    nombre: '',
    identificacion: '',
    tipoIdentificacion: 'cedula',
    email: '',
    telefono: '',
  });
  const [formaPago, setFormaPago] = useState<FormaPago>('efectivo');
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isEmitting, setIsEmitting] = useState(false);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productoId === item.productoId);
      if (existing) {
        return prev.map((c) =>
          c.productoId === item.productoId
            ? { ...c, cantidad: c.cantidad + item.cantidad }
            : c
        );
      }
      return [...prev, { ...item, id: `cart-${item.productoId}-${Date.now()}` }];
    });
    toast.success(`${item.nombre} agregado al carrito`);
  }, []);

  const updateCartItem = useCallback((id: string, field: 'cantidad' | 'descuento', value: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: Math.max(0, value) } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCliente({ nombre: '', identificacion: '', tipoIdentificacion: 'cedula', email: '', telefono: '' });
    setDescuentoGlobal(0);
    setFormaPago('efectivo');
  }, []);

  // Calculations
  const subtotalBruto = cart.reduce((sum, item) => {
    const lineTotal = item.precioUnitario * item.cantidad;
    const lineDiscount = lineTotal * (item.descuento / 100);
    return sum + lineTotal - lineDiscount;
  }, 0);

  const descuentoGlobalAmount = subtotalBruto * (descuentoGlobal / 100);
  const subtotalNeto = subtotalBruto - descuentoGlobalAmount;
  const ivaAmount = subtotalNeto * IVA_RATE;
  const total = subtotalNeto + ivaAmount;

  // Backend integration point: POST /api/ventas — create sale + invoice, update stock
  const handleEmitirFactura = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío — agrega productos antes de emitir la factura');
      return;
    }
    if (!cliente.nombre.trim()) {
      toast.error('El nombre del cliente es requerido para emitir la factura');
      return;
    }
    if (!cliente.identificacion.trim()) {
      toast.error('La identificación del cliente es requerida');
      return;
    }
    setIsEmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const num = generateInvoiceNumber();
    setInvoiceNumber(num);
    setIsEmitting(false);
    setIsInvoiceOpen(true);
  };

  const handleInvoiceClose = () => {
    setIsInvoiceOpen(false);
    clearCart();
    toast.success(`Factura ${invoiceNumber} emitida y registrada correctamente`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ventas y Facturación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Nueva venta — {cart.length} producto(s) en carrito
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="btn-secondary self-start sm:self-auto text-danger hover:bg-danger-bg hover:border-danger/20 flex items-center gap-2"
          >
            Limpiar carrito
          </button>
        )}
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 2xl:grid-cols-5 gap-5">
        {/* Left: Product search + Cart */}
        <div className="xl:col-span-3 space-y-4">
          <ProductSearchPanel onAddToCart={addToCart} cartItems={cart} />
          <CartPanel
            items={cart}
            onUpdateItem={updateCartItem}
            onRemoveItem={removeFromCart}
          />
        </div>

        {/* Right: Invoice summary */}
        <div className="xl:col-span-2">
          <InvoiceSummaryPanel
            cliente={cliente}
            onClienteChange={setCliente}
            formaPago={formaPago}
            onFormaPagoChange={setFormaPago}
            descuentoGlobal={descuentoGlobal}
            onDescuentoGlobalChange={setDescuentoGlobal}
            subtotalBruto={subtotalBruto}
            descuentoGlobalAmount={descuentoGlobalAmount}
            subtotalNeto={subtotalNeto}
            ivaAmount={ivaAmount}
            total={total}
            cartEmpty={cart.length === 0}
            isEmitting={isEmitting}
            onEmitir={handleEmitirFactura}
          />
        </div>
      </div>

      {/* Invoice preview modal */}
      <InvoicePreviewModal
        open={isInvoiceOpen}
        onClose={handleInvoiceClose}
        invoiceNumber={invoiceNumber}
        cliente={cliente}
        cart={cart}
        formaPago={formaPago}
        subtotalBruto={subtotalBruto}
        descuentoGlobalAmount={descuentoGlobalAmount}
        subtotalNeto={subtotalNeto}
        ivaAmount={ivaAmount}
        total={total}
      />
    </div>
  );
}