export function formatCurrency(valor: number | string): string {

  const numero = Number(valor) || 0;

  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);

}