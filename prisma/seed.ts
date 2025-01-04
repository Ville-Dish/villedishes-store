import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: "1",
    name: "Jollof Rice",
    description: "Spicy and flavorful rice dish",
    price: 12.99,
    category: "Main Dishes",
    image: "/foods/Jollof.jpg",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Egusi Soup",
    description: "Rich soup with ground melon seeds",
    price: 14.99,
    category: "Soups",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.2,
  },
  {
    id: "3",
    name: "Puff Puff",
    description: "Sweet, deep-fried dough balls",
    price: 6.99,
    category: "Snacks",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Suya",
    description: "Spicy grilled meat skewers",
    price: 10.99,
    category: "Sides",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.5,
  },
  {
    id: "5",
    name: "Moi Moi",
    description: "Steamed bean pudding",
    price: 8.99,
    category: "Sides",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
  },
  {
    id: "6",
    name: "Chin Chin",
    description: "Crunchy, sweet fried snack",
    price: 5.99,
    category: "Snacks",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.3,
  },
  {
    id: "7",
    name: "Akara",
    description: "Deep-fried bean cakes",
    price: 7.99,
    category: "Snacks",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
  },
  {
    id: "8",
    name: "Efo Riro",
    description: "Rich vegetable soup",
    price: 13.99,
    category: "Soups",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.4,
  },
  {
    id: "9",
    name: "Dodo",
    description: "Fried plantains",
    price: 6.99,
    category: "Sides",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.1,
  },
  {
    id: "10",
    name: "Fried Rice",
    description: "Tasty and flavorful fried rice dish with vegs",
    price: 12.99,
    category: "Main Dishes",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
  },
  {
    id: "12",
    name: "Jollof Pasta",
    description: "Spicy and flavorful spaghetti dish",
    price: 12.99,
    category: "Main Dishes",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.1,
  },
  {
    id: "13",
    name: "Ewa Agoyin",
    description: "Delicious soft beans",
    price: 12.99,
    category: "Main Dishes",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
  },
  {
    id: "14",
    name: "Banana Bread",
    description: "Tasty banana bread",
    price: 12.99,
    category: "Bread",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.2,
  },
  {
    id: "15",
    name: "Nutty bread",
    description: "Spicy and flavorful rice dish",
    price: 12.99,
    category: "Bread",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.0,
  },
  {
    id: "16",
    name: "Chocolate Bread",
    description: "Spicy and flavorful rice dish",
    price: 12.99,
    category: "Bread",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.2,
  },
  {
    id: "17",
    name: "Okro Soup",
    description: "Rich okra soup with assorted",
    price: 13.99,
    category: "Soups",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.1,
  },
  {
    id: "18",
    name: "Pineapple Zobo",
    description: "Rich okra soup with assorted",
    price: 13.99,
    category: "Drinks",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
  },
  {
    id: "19",
    name: "Orange Zobo",
    description: "Rich okra soup with assorted",
    price: 13.99,
    category: "Drinks",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
  },
];

const invoices = [
  {
    id: "1",
    invoiceNumber: "INV001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerPhone: "123-456-7890",
    amount: 0.0,
    discountPercentage: 0,
    dateCreated: "2023-05-28",
    dueDate: "2023-06-01",
    status: "UNPAID",
  },
  {
    id: "2",
    invoiceNumber: "INV002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    customerPhone: "987-654-3210",
    amount: 0.0,
    discountPercentage: 0,
    dateCreated: "2023-05-28",
    dueDate: "2023-06-15",
    status: "PAID",
  },
  {
    id: "3",
    invoiceNumber: "INV003",
    customerName: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    customerPhone: "789-456-1230",
    amount: 0.0,
    discountPercentage: 0,
    dateCreated: "2023-05-28",
    dueDate: "2023-10-28",
    status: "DUE",
  },
  {
    id: "4",
    invoiceNumber: "INV004",
    customerName: "Alice Brown",
    customerEmail: "alice.brown@example.com",
    customerPhone: "456-789-0123",
    amount: 0.0,
    discountPercentage: 0,
    dateCreated: "2023-05-28",
    dueDate: "2023-11-05",
    status: "PAID",
  },
  {
    id: "5",
    invoiceNumber: "INV005",
    customerName: "Charlie Davis",
    customerEmail: "charlie.davis@example.com",
    customerPhone: "321-098-7654",
    amount: 0.0,
    discountPercentage: 0,
    dateCreated: "2023-05-28",
    dueDate: "2023-11-07",
    status: "PENDING",
  },
];

async function resetData() {
  console.log("Resetting database...");

  // Reset all the tables in the correct order to avoid foreign key issues
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();

  console.log("Finished resetting database.");
}

async function seedData() {
  console.log("Seeding...");

  // Seed products
  for (const product of products) {
    const result = await prisma.product.create({
      data: product,
    });
    console.log(`Created product with id: ${result.id}`);
  }

  // Seed invoices
  for (const invoice of invoices) {
    const result = await prisma.invoice.create({
      data: invoice,
    });
    console.log(
      `Created invoice with id: ${result.id} and number: ${result.invoiceNumber}`
    );
  }

  console.log("Finished seeding.");
}

async function main() {
  await resetData(); // Reset the data first
  await seedData(); // Then seed new data
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
