// invoiceUtils.ts
// invoiceStatus.ts
export enum InvoiceStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  PENDING = "PENDING",
  OVERDUE = "DUE",
}

export function isValidInvoiceStatus(status: string): status is InvoiceStatus {
  return Object.values(InvoiceStatus).includes(status as InvoiceStatus);
}
