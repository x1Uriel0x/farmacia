export interface ProductoCatalogo {
  id: string;
  sku: string;
  nombre: string;
  laboratorio: string;
  categoria: string;
  precioVenta: number;
  stockActual: number;
  status: string;
}

export const catalogoProductos: ProductoCatalogo[] = [
  { id: 'prod-001', sku: 'MED-0042', nombre: 'Paracetamol 500mg x 20 tab', laboratorio: 'Pharmabrand', categoria: 'Analgésicos', precioVenta: 2.50, stockActual: 342, status: 'disponible' },
  { id: 'prod-002', sku: 'MED-0091', nombre: 'Amoxicilina 500mg x 21 cap', laboratorio: 'MediLab', categoria: 'Antibióticos', precioVenta: 6.80, stockActual: 187, status: 'disponible' },
  { id: 'prod-003', sku: 'MED-0154', nombre: 'Metformina 850mg x 30 tab', laboratorio: 'GenFarma', categoria: 'Antidiabéticos', precioVenta: 5.40, stockActual: 12, status: 'bajo-stock' },
  { id: 'prod-004', sku: 'MED-0203', nombre: 'Losartán 50mg x 30 tab', laboratorio: 'Pharmabrand', categoria: 'Antihipertensivos', precioVenta: 8.20, stockActual: 63, status: 'disponible' },
  { id: 'prod-005', sku: 'MED-0267', nombre: 'Ibuprofeno 400mg x 20 tab', laboratorio: 'MediLab', categoria: 'Analgésicos', precioVenta: 3.20, stockActual: 521, status: 'disponible' },
  { id: 'prod-007', sku: 'MED-0388', nombre: 'Atorvastatina 20mg x 30 tab', laboratorio: 'GenFarma', categoria: 'Antihipertensivos', precioVenta: 10.40, stockActual: 94, status: 'disponible' },
  { id: 'prod-008', sku: 'MED-0421', nombre: 'Omeprazol 20mg x 28 cap', laboratorio: 'Pharmabrand', categoria: 'Antiácidos', precioVenta: 4.60, stockActual: 228, status: 'disponible' },
  { id: 'prod-009', sku: 'MED-0499', nombre: 'Loratadina 10mg x 10 tab', laboratorio: 'MediLab', categoria: 'Antihistamínicos', precioVenta: 3.60, stockActual: 34, status: 'bajo-stock' },
  { id: 'prod-010', sku: 'MED-0542', nombre: 'Clotrimazol Crema 1% 20g', laboratorio: 'DermaLab', categoria: 'Dermatología', precioVenta: 6.20, stockActual: 76, status: 'disponible' },
  { id: 'prod-011', sku: 'MED-0601', nombre: 'Tramadol 50mg x 10 cap', laboratorio: 'GenFarma', categoria: 'Analgésicos', precioVenta: 9.00, stockActual: 28, status: 'disponible' },
];

export type FormaPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface CartItem {
  id: string;
  productoId: string;
  sku: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  descuento: number;
}

export interface ClienteInfo {
  nombre: string;
  identificacion: string;
  tipoIdentificacion: 'cedula' | 'ruc' | 'pasaporte';
  email: string;
  telefono: string;
}

export const IVA_RATE = 0.12;