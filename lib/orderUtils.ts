// orderUtils.ts
// orderStatus.ts
export enum OrderStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  FULFILLED = "FULFILLED",
}

export function isValidOrderStatus(status: string): status is OrderStatus {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}
