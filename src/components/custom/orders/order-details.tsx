"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderDetailsProps {
  data: OrderDetails;
}

export const OrderDetails = ({ data }: OrderDetailsProps) => {
  return (
    <>
      <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Order Receipt</h2>
          <p className="text-gray-600">Order #{data.orderNumber}</p>
          <p className="text-gray-600">{data.orderDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold mb-2">Bill To:</h4>
            <p>
              {data.shippingInfo.firstName} {data.shippingInfo.lastName}
            </p>
            <p>{data.shippingInfo.address}</p>
            <p>
              {data.shippingInfo.city}, {data.shippingInfo.postalCode}
            </p>
            <p>Email: {data.shippingInfo.email}</p>
            <p>Phone: {data.shippingInfo.phoneNumber}</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Ship To:</h4>
            <p>
              {data.shippingInfo.firstName} {data.shippingInfo.lastName}
            </p>
            <p>{data.shippingInfo.address}</p>
            <p>
              {data.shippingInfo.city}, {data.shippingInfo.postalCode}
            </p>
          </div>
        </div>

        <h4 className="font-medium mt-4 mb-2">Products</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.product.name}</TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                <TableCell className="text-right">
                  ${product.product.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${product.quantity * product.product.price}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${data.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Shipping:</span>
              <span>${data.shippingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Total:</span>
              <span>${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {data.shippingInfo.orderNotes && (
          <div className="mt-6">
            <h4 className="font-bold mb-2">Order Notes:</h4>
            <p className="text-gray-700">{data.shippingInfo.orderNotes}</p>
          </div>
        )}
      </div>
    </>
  );
};
