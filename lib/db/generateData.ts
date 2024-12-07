import { faker } from "@faker-js/faker";

import { PrismaClient } from "@prisma/client";
import {
  generateInvoiceNumber,
  generateOrderNumber,
} from "../helper-generateFunction";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
  rating?: number;
  reviews?: { id: string; rating: number; comment: string; author: string }[];
};

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: MenuItem & {
    invoiceId: string | null;
  };
}

const prisma = new PrismaClient();

// Function to get a random number between 1 and 10
const getRandomNumber = () => {
  return faker.number.int({ min: 1, max: 10 });
};

// Function to get a generate order number for unverified orders
const generateTempOrderNumber = () => {
  return `TEMP_ORD-${Math.floor(Math.random() * 1000000)}`;
};

const fetchExistingProducts = async () => {
  // Fetch products from the database
  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.error("No products found in the database.");
    process.exit(1);
  }
  return products;
};

const generateShippingInfo = async () => {
  return await prisma.shippingInfo.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      city: faker.helpers.arrayElement(["airdrie", "calgary"]),
      postalCode: faker.helpers.replaceSymbols("?#? #?#"),
      orderNotes: Math.random() > 0.5 ? faker.lorem.sentence() : undefined,
    },
  });
};

const generateInvoiceData = async (length: number, products: Product[]) => {
  for (let i = 0; i < length; i++) {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      // console.log("New Invoice Number: ", invoiceNumber);

      const invoice = await prisma.invoice.update({
        where: { invoiceNumber: invoiceNumber },
        data: {
          customerName: faker.person.fullName(),
          customerEmail: faker.internet.email(),
          customerPhone: faker.phone.number(),
          amount: 0,
          amountPaid: 0,
          amountDue: 0,
          discountPercentage: faker.number.float({
            multipleOf: 0.5,
            min: 0,
            max: 10,
          }),
          status: faker.helpers.arrayElement([
            "UNPAID",
            "PAID",
            "DUE",
            "PENDING",
          ]),
          dateCreated: faker.date
            .between({
              from: "2020-01-01T00:00:00.000Z",
              to: "2025-01-01T00:00:00.000Z",
            })
            .toISOString()
            .split("T")[0],
          dueDate: faker.date
            .between({
              from: "2020-01-01T00:00:00.000Z",
              to: "2025-01-01T00:00:00.000Z",
            })
            .toISOString()
            .split("T")[0],
        },
      });

      // Add related invoice data
      let totalAmount = 0 + invoice.discountPercentage;
      const invoiceProducts = Array.from({ length: getRandomNumber() }).map(
        () => {
          const product = faker.helpers.arrayElement(products); //Randomly select  from products
          const quantity = faker.number.int({ min: 1, max: 5 });
          const discount = faker.number.float({
            multipleOf: 0.05,
            min: 10,
            max: 100,
          });
          const price = product.price * quantity * discount;
          totalAmount += price;

          return {
            basePrice: product.price,
            quantity,
            price,
            invoiceId: invoice.id,
            productId: product.id,
          };
        }
      );

      await prisma.invoiceProducts.createMany({ data: invoiceProducts });

      const amountsPaid = faker.number.float({
        multipleOf: 0.05,
        min: 0,
        max: totalAmount,
      });

      //Update the total amount for the invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amount: totalAmount,
          amountPaid: amountsPaid,
          amountDue: totalAmount - amountsPaid,
        },
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  }
};

const generateOrderData = async (length: number, products: Product[]) => {
  for (let i = 0; i < length; i++) {
    try {
      const status = faker.helpers.arrayElement([
        "UNVERIFIED",
        "PENDING",
        "CANCELLED",
        "FULFILLED",
      ]);

      const orderNumber =
        status === "UNVERIFIED"
          ? generateTempOrderNumber()
          : await generateOrderNumber();
      // console.log("New Order Number: ", orderNumber);

      //insert shipping data
      const shippingInfo = await generateShippingInfo();

      const order = await prisma.order.create({
        data: {
          orderId: Date.now().toString(),
          orderNumber: orderNumber,
          subtotal: 0,
          tax: 0,
          shippingFee: faker.number.float({
            multipleOf: 0.25,
            min: 0,
            max: 10,
          }),
          total: 0,
          referenceNumber: faker.string.alpha(10),
          paymentDate: faker.date
            .between({
              from: "2020-01-01T00:00:00.000Z",
              to: "2025-01-01T00:00:00.000Z",
            })
            .toISOString()
            .split("T")[0],
          verificationCode: faker.string.numeric(6),
          orderDate: faker.date
            .between({
              from: "2020-01-01T00:00:00.000Z",
              to: "2025-01-01T00:00:00.000Z",
            })
            .toISOString()
            .split("T")[0],
          status: status,
          shippingInfoId: shippingInfo.id,
        },
      });

      // Add related OrderProducts
      let subtotal = 0;
      const orderProducts = Array.from({ length: getRandomNumber() }).map(
        () => {
          const product = faker.helpers.arrayElement(products); //Randomly select  from products
          const quantity = faker.number.int({ min: 1, max: 5 });
          const price = product.price * quantity;
          subtotal += price;

          return {
            quantity,
            orderId: order.id,
            productId: product.id,
          };
        }
      );

      await prisma.orderProduct.createMany({ data: orderProducts });

      // Calculate totals and update order

      const tax = subtotal * faker.number.int({ min: 0, max: 5 });
      const total = subtotal + tax + order.shippingFee;

      await prisma.order.update({
        where: { id: order.id },
        data: { subtotal, tax, total },
      });
    } catch (error) {
      console.error("Error generating order:", error);
    }
  }
};
const main = async () => {
  console.log("Generating mock data...");

  console.log("Fetching existing products...");

  const products = await fetchExistingProducts();
  // console.log("Existing products fetched successfully", { products });

  // Transform `products` to match the `Product` interface
  const allProducts: Product[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 0, // Default quantity
    product: {
      ...product, // Spread the existing product fields
      category: product.category ?? "Uncategorized", // Default value for null
      rating: product.rating ?? 0, // Default value for
      invoiceId: null, // Add `invoiceId` explicitly
    },
  }));

  console.log("Generating invoice data...");
  await generateInvoiceData(10, allProducts);
  console.log("Generated invoice data successfully");

  console.log("Generating order data...");
  await generateOrderData(10, allProducts);
  console.log("Generated order data successfully");

  console.log("Mock data generation complete.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
