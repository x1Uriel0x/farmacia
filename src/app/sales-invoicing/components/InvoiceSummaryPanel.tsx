'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CreditCard, Banknote, ArrowLeftRight } from 'lucide-react';
import { type ClienteInfo, type FormaPago, IVA_RATE } from './salesData';

interface InvoiceSummaryPanelProps {
  cliente: ClienteInfo;
  onClienteChange: (c: ClienteInfo) => void;
  formaPago: FormaPago;
  onFormaPagoChange: (f: FormaPago) => void;
  descuentoGlobal: number;
  onDescuentoGlobalChange: (n: number) => void;
  subtotalBruto: number;
  descuentoGlobalAmount: number;
  subtotalNeto: number;
  ivaAmount: number;
  total: number;
  cartEmpty: boolean;
  isEmitting: boolean;
  onEmitir: () => void;
}

const formasPago: { value: FormaPago; label: string; icon: React.ReactNode }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: <Banknote size={16} /> },
  { value: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={16} /> },
  { value: 'transferencia', label: 'Transferencia', icon: <ArrowLeftRight size={16} /> },
];

export default function InvoiceSummaryPanel({
  cliente,
  onClienteChange,
  formaPago,
  onFormaPagoChange,
  descuentoGlobal,
  onDescuentoGlobalChange,
  subtotalBruto,
  descuentoGlobalAmount,
  subtotalNeto,
  ivaAmount,
  total,
  cartEmpty,
  isEmitting,
  onEmitir,
}: InvoiceSummaryPanelProps) {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<ClienteInfo>({
    defaultValues: cliente,
    mode: 'onChange',
  });

  const handleFieldChange = async (field: keyof ClienteInfo, value: string) => {
    onClienteChange({ ...cliente, [field]: value });
    await trigger(field);
  };

  const handleEmitir = async () => {
    const valid = await trigger();
    if (!valid) return;
    onEmitir();
  };

  return (
    <div className="space-y-4 sticky top-6">
      {/* Customer info */}
      <div className="card p-5">
        <h2 className="section-header mb-4">Datos del Cliente</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="cliente-nombre" className="label-text">Nombre completo *</label>
            <input
              id="cliente-nombre"
              type="text"
              placeholder="Juan Pérez García"
              className={`input-field ${errors.nombre ? 'border-danger' : ''}`}
              {...register('nombre', { required: 'El nombre es requerido' })}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
            />
            {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <label htmlFor="tipo-id" className="label-text">Tipo ID</label>
              <select
                id="tipo-id"
                className="input-field"
                value={cliente.tipoIdentificacion}
                onChange={(e) => onClienteChange({ ...cliente, tipoIdentificacion: e.target.value as ClienteInfo['tipoIdentificacion'] })}
              >
                <option value="cedula">Cédula</option>
                <option value="ruc">RUC</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className="col-span-3">
              <label htmlFor="identificacion" className="label-text">
                {cliente.tipoIdentificacion === 'ruc' ? 'RUC' : cliente.tipoIdentificacion === 'cedula' ? 'Cédula' : 'Pasaporte'} *
              </label>
              <input
                id="identificacion"
                type="text"
                placeholder={cliente.tipoIdentificacion === 'ruc' ? '1234567890001' : '0987654321'}
                className={`input-field ${errors.identificacion ? 'border-danger' : ''}`}
                {...register('identificacion', {
                  required: 'La identificación es requerida',
                  minLength: { value: 10, message: 'Mínimo 10 dígitos' },
                })}
                onChange={(e) => handleFieldChange('identificacion', e.target.value)}
              />
              {errors.identificacion && <p className="error-text">{errors.identificacion.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="cliente-email" className="label-text">Correo electrónico</label>
            <p className="helper-text">Opcional — para envío de factura</p>
            <input
              id="cliente-email"
              type="email"
              placeholder="cliente@correo.com"
              className="input-field"
              value={cliente.email}
              onChange={(e) => onClienteChange({ ...cliente, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cliente-telefono" className="label-text">Teléfono</label>
            <input
              id="cliente-telefono"
              type="tel"
              placeholder="0987654321"
              className="input-field"
              value={cliente.telefono}
              onChange={(e) => onClienteChange({ ...cliente, telefono: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="card p-5">
        <h2 className="section-header mb-3">Forma de Pago</h2>
        <div className="grid grid-cols-3 gap-2">
          {formasPago.map((fp) => (
            <button
              key={`fp-${fp.value}`}
              type="button"
              onClick={() => onFormaPagoChange(fp.value)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                formaPago === fp.value
                  ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              {fp.icon}
              <span className="text-xs">{fp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="card p-5">
        <h2 className="section-header mb-4">Resumen de Factura</h2>

        {/* Descuento global */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Descuento global</p>
            <p className="text-xs text-muted-foreground">Aplicado sobre el subtotal</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={descuentoGlobal}
              onChange={(e) => onDescuentoGlobalChange(Math.min(50, Math.max(0, Number(e.target.value))))}
              className="input-field w-16 py-1 px-2 text-sm text-center tabular-nums"
              aria-label="Descuento global porcentaje"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {/* Line items */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal bruto</span>
            <span className="tabular-nums">${subtotalBruto.toFixed(2)}</span>
          </div>
          {descuentoGlobalAmount > 0 && (
            <div className="flex justify-between text-danger">
              <span>Descuento ({descuentoGlobal}%)</span>
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
          <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
            <span>TOTAL</span>
            <span className="tabular-nums text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Emit button */}
        <button
          type="button"
          onClick={handleEmitir}
          disabled={cartEmpty || isEmitting}
          className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-3 text-base"
          style={{ minHeight: '48px' }}
        >
          {isEmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Emitiendo factura...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Emitir Factura
            </>
          )}
        </button>

        {cartEmpty && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Agrega productos al carrito para habilitar la facturación
          </p>
        )}
      </div>
    </div>
  );
}