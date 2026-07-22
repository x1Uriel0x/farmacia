'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import ProductSearchPanel from './ProductSearchPanel';
import CartPanel from './CartPanel';
import InvoiceSummaryPanel from './InvoiceSummaryPanel';
import InvoicePreviewModal from './InvoicePreviewModal';
import { type CartItem, type ClienteInfo, type FormaPago, IVA_RATE } from './salesData';


import { formatCurrency } from '../../../lib/currency';

let invoiceCounter = 893;

function generateInvoiceNumber(): string {
  invoiceCounter += 1;
  return `F-2026-0${invoiceCounter}`;
}

type CurrentUser = {
  id: string | null;
  nombre: string;
  rol: string;
};

function getCurrentUser(): CurrentUser {
  try {
    const data = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Record<string, unknown>;

    return {
      id: data.id || data.id_usuario || data.usuario_id
        ? String(data.id ?? data.id_usuario ?? data.usuario_id)
        : null,
      nombre: String(data.nombre ?? data.name ?? data.usuario ?? 'Usuario'),
      rol: String(data.rol ?? data.role ?? ''),
    };
  } catch {
    return {
      id: null,
      nombre: 'Usuario',
      rol: '',
    };
  }
}

async function readVentaResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text) as {
      success?: boolean;
      message?: string;
      error?: string;
    };
  } catch {
    return {
      success: false,
      message: text || `Error del servidor (${response.status})`,
    };
  }
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

  const nuevaCantidad = existing.cantidad + item.cantidad;

      if (nuevaCantidad > item.stockActual) {

        toast.error(
          `Stock insuficiente para ${item.nombre}. Solo hay ${item.stockActual} unidades disponibles.`
        );

        return prev;
      }

      return prev.map((c) =>
        c.productoId === item.productoId
          ? { ...c, cantidad: nuevaCantidad }
          : c
      );
    }

    if (item.cantidad > item.stockActual) {

  toast.error(
    `Stock insuficiente para ${item.nombre}.`
  );

  return prev;
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

  // Calcular
  const subtotalBruto = cart.reduce((sum, item) => {
    const lineTotal = item.precioUnitario * item.cantidad;
    const lineDiscount = lineTotal * (item.descuento / 100);
    return sum + lineTotal - lineDiscount;
  }, 0);

  const descuentoGlobalAmount = subtotalBruto * (descuentoGlobal / 100);
  const subtotalNeto = subtotalBruto - descuentoGlobalAmount;
  const ivaAmount = subtotalNeto * IVA_RATE;
  const total = subtotalNeto + ivaAmount;

  // Backend integracios ventas — crear venta + invoice, update stock
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

  try {
    setIsEmitting(true);
    const usuarioActual = getCurrentUser();

    const response = await fetch(
      'http://localhost/farmacia-api/crear_venta.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cliente: cliente.nombre,
          identificacion: cliente.identificacion,
          subtotal: subtotalNeto,
          iva: ivaAmount,
          total: total,
          forma_pago: formaPago,
          productos: cart,
          usuario_id: usuarioActual.id,
          usuario: usuarioActual.nombre,
          usuario_nombre: usuarioActual.nombre,
          usuario_rol: usuarioActual.rol,
        })
      }
    );

    const result = await readVentaResponse(response);

    if (!response.ok || !result.success) {
      toast.error(result.message || result.error || 'Error al registrar la venta');
      return;
    }

    const num = generateInvoiceNumber();

    setInvoiceNumber(num);
    setIsInvoiceOpen(true);

  } catch (error) {

    console.error(error);
    toast.error('Error de conexión con el servidor');

  } finally {

    setIsEmitting(false);

  }
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
        usuario={getCurrentUser()}
      />
    </div>
  );
}
