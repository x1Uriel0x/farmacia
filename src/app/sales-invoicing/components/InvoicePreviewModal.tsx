'use client';

import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle } from 'lucide-react';
import { type CartItem, type ClienteInfo, type FormaPago, IVA_RATE } from './salesData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  cliente: ClienteInfo;
  cart: CartItem[];
  formaPago: FormaPago;
  subtotalBruto: number;
  descuentoGlobalAmount: number;
  subtotalNeto: number;
  ivaAmount: number;
  total: number;
}

const formaPagoLabel: Record<FormaPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta de crédito/débito',
  transferencia: 'Transferencia bancaria',
};

const tipoIdLabel: Record<string, string> = {
  cedula: 'Cédula',
  ruc: 'RUC',
  pasaporte: 'Pasaporte',
};

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}`;
}

export default function InvoicePreviewModal({
  open,
  onClose,
  invoiceNumber,
  cliente,
  cart,
  formaPago,
  subtotalBruto,
  descuentoGlobalAmount,
  subtotalNeto,
  ivaAmount,
  total,
}: InvoicePreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const issuedAt = formatDate(new Date());

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Factura ${invoiceNumber} — PharmaControl</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; margin: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { font-weight: 600; background: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .total-row { font-size: 16px; font-weight: 700; border-top: 2px solid #0d9488; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };
const handleDownloadPDF = () => {

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("FARMACIA CENTRAL", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.text("Sistema de Inventario y Facturación", 105, 22, { align: "center" });

  doc.setFontSize(10);

  doc.text(`Factura: ${invoiceNumber}`, 14, 35);
  doc.text(`Fecha: ${issuedAt}`, 14, 41);

  doc.text(`Cliente: ${cliente.nombre}`, 14, 49);
  doc.text(
    `${tipoIdLabel[cliente.tipoIdentificacion]}: ${cliente.identificacion}`,
    14,
    55
  );

  doc.text(
    `Forma de pago: ${formaPagoLabel[formaPago]}`,
    14,
    61
  );

  const usuario = JSON.parse(
    sessionStorage.getItem("usuario") || "{}"
  );

  doc.text(
    `Atendido por: ${usuario.nombre}`,
    14,
    67
  );

  autoTable(doc, {
    startY: 75,
    head: [[
      "Medicamento",
      "Cant.",
      "P. Unit.",
      "Desc.",
      "Subtotal"
    ]],

    body: cart.map((item) => {

      const totalLinea =
        item.precioUnitario * item.cantidad;

      const descuento =
        totalLinea * (item.descuento / 100);

      return [

        item.nombre,

        item.cantidad,

        `$${item.precioUnitario.toFixed(2)}`,

        `${item.descuento}%`,

        `$${(totalLinea - descuento).toFixed(2)}`

      ];

    })

  });

  let y = (doc as any).lastAutoTable.finalY + 12;

  doc.text(
    `Subtotal: $${subtotalBruto.toFixed(2)}`,
    140,
    y
  );

  y += 7;

  if (descuentoGlobalAmount > 0) {

    doc.text(
      `Descuento: -$${descuentoGlobalAmount.toFixed(2)}`,
      140,
      y
    );

    y += 7;

  }

  doc.text(
    `IVA: $${ivaAmount.toFixed(2)}`,
    140,
    y
  );

  y += 7;

  doc.setFontSize(13);

  doc.text(
    `TOTAL: $${total.toFixed(2)}`,
    140,
    y
  );

  y += 20;

  doc.setFontSize(10);

  doc.text(
    "¡Gracias por su compra!",
    105,
    y,
    {
      align: "center"
    }
  );

  doc.save(`${invoiceNumber}.pdf`);

};
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 fade-in overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-modal w-full max-w-2xl my-4 scale-enter">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle size={18} className="text-success" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Factura Emitida</h2>
              <p className="text-xs text-muted-foreground">{invoiceNumber} · {issuedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs btn-secondary py-1.5 px-3"
              title="Imprimir factura"
            >
              <Printer size={14} />
              Imprimir
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 text-xs btn-secondary py-1.5 px-3"
              title="Descargar PDF (función backend requerida)"
            >
              <Download size={14} />
              PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
              aria-label="Cerrar y nueva venta"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="overflow-y-auto max-h-[70vh] px-6 py-5">
          <div ref={printRef}>
            {/* Invoice header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14a1 1 0 01-1-1v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2h-3v3a1 1 0 01-1 1z" />
                    </svg>
                  </div>
                  <span className="font-bold text-foreground text-lg">PharmaControl</span>
                </div>
                <p className="text-xs text-muted-foreground">Farmacia Central</p>
                <p className="text-xs text-muted-foreground">RUC: 1790012345001</p>
                <p className="text-xs text-muted-foreground">Av. Amazonas N24-03, Quito</p>
                <p className="text-xs text-muted-foreground">Tel: (02) 234-5678</p>
              </div>
              <div className="text-right">
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Factura</p>
                  <p className="text-xl font-bold text-primary tabular-nums">{invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">{issuedAt}</p>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-success/10 border border-success/20 rounded-full px-3 py-1">
                  <CheckCircle size={12} className="text-success" />
                  <span className="text-xs font-semibold text-success">AUTORIZADA</span>
                </div>
              </div>
            </div>

            {/* Customer + Payment */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cliente</p>
                <p className="text-sm font-semibold text-foreground">{cliente.nombre || 'Consumidor Final'}</p>
                <p className="text-xs text-muted-foreground">
                  {tipoIdLabel[cliente.tipoIdentificacion]}: {cliente.identificacion || '9999999999'}
                </p>
                {cliente.email && <p className="text-xs text-muted-foreground">{cliente.email}</p>}
                {cliente.telefono && <p className="text-xs text-muted-foreground">{cliente.telefono}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pago</p>
                <p className="text-sm font-medium text-foreground">{formaPagoLabel[formaPago]}</p>
                <p className="text-xs text-muted-foreground">Vendedor: María Sánchez</p>
                <p className="text-xs text-muted-foreground">Caja: 01</p>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full mb-5 text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 px-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14">
                    Cant.
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    P. Unit.
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                    Desc.
                  </th>
                  <th className="text-right py-2 px-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const lineTotal = item.precioUnitario * item.cantidad;
                  const disc = lineTotal * (item.descuento / 100);
                  const sub = lineTotal - disc;
                  return (
                    <tr key={`inv-line-${item.id}`} className="border-b border-border/50">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-foreground">{item.nombre}</p>
                        <p className="text-xs font-mono text-muted-foreground">{item.sku}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-muted-foreground">
                        {item.cantidad}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-muted-foreground">
                        {item.descuento > 0 ? `${item.descuento}%` : '—'}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-medium text-foreground">
                        ${sub.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal bruto</span>
                  <span className="tabular-nums">${subtotalBruto.toFixed(2)}</span>
                </div>
                {descuentoGlobalAmount > 0 && (
                  <div className="flex justify-between text-danger">
                    <span>Descuento</span>
                    <span className="tabular-nums">-${descuentoGlobalAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal neto</span>
                  <span className="tabular-nums">${subtotalNeto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA ({(IVA_RATE * 100).toFixed(0)}%)</span>
                  <span className="tabular-nums">${ivaAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-foreground border-t-2 border-primary pt-2 mt-2">
                  <span>TOTAL</span>
                  <span className="tabular-nums text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Gracias por su compra — PharmaControl · Este documento es válido como comprobante de pago
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ambiente de pruebas — No válido como documento tributario oficial
              </p>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20 rounded-b-2xl">
          <p className="text-xs text-muted-foreground">
            Al cerrar se limpiará el carrito y se iniciará una nueva venta
          </p>
          <button
            onClick={onClose}
            className="btn-primary flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Confirmar y Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}