import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    "id": "1",
    "name": "Small Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 95.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737566948/ET5B7665-7_gkdh2p.jpg",
    "rating": 4.5
  },
  {
    "id": "2",
    "name": "Medium Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 120.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737566948/ET5B7665-7_gkdh2p.jpg",
    "rating": 4.5
  },
  {
    "id": "3",
    "name": "Large Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 170.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737566948/ET5B7665-7_gkdh2p.jpg",
    "rating": 4.5
  },
  {
    "id": "4",
    "name": "Cooler of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 450.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1737566948/ET5B7665-7_gkdh2p.jpg",
    "rating": 4.5
  },
  {
    "id": "5",
    "name": "Plate of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 17.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1733724254/klqs9febcryea2owf1ae.jpg",
    "rating": 4.7
  },
  {
    "id": "6",
    "name": "Small Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 80.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1733724254/klqs9febcryea2owf1ae.jpg",
    "rating": 4.7
  },
  {
    "id": "7",
    "name": "Medium Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 100.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1733724254/klqs9febcryea2owf1ae.jpg",
    "rating": 4.7
  },
  {
    "id": "8",
    "name": "Large Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 150.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1733724254/klqs9febcryea2owf1ae.jpg",
    "rating": 4.7
  },
  {
    "id": "9",
    "name": "Cooler of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 420.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1733724254/klqs9febcryea2owf1ae.jpg",
    "rating": 4.7
  },
  {
    "id": "10",
    "name": "Small Tray of Ofada Sauce",
    "description": "Spicy and rich Ofada sauce",
    "price": 95.00,
    "category": "Sauces",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "11",
    "name": "Medium Tray of Ofada Sauce",
    "description": "Spicy and rich Ofada sauce",
    "price": 120.00,
    "category": "Sauces",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "12",
    "name": "Small Tray of Local Ata Dindin (Fried Stew)",
    "description": "Spicy fried stew",
    "price": 85.00,
    "category": "Sauces",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "13",
    "name": "Medium Tray of Local Ata Dindin (Fried Stew)",
    "description": "Spicy fried stew",
    "price": 105.00,
    "category": "Sauces",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "14",
    "name": "Beef",
    "description": "Tender and flavorful beef",
    "price": 130.00,
    "category": "Proteins",
    "image": "",
    "rating": 4.4
  },
  {
    "id": "15",
    "name": "Small Tray of Chicken",
    "description": "Juicy and well-seasoned chicken",
    "price": 80.00,
    "category": "Proteins",
    "image": "",
    "rating": 4.4
  },
  {
    "id": "16",
    "name": "Large Tray of Chicken",
    "description": "Juicy and well-seasoned chicken",
    "price": 130.00,
    "category": "Proteins",
    "image": "",
    "rating": 4.4
  },
  {
    "id": "17",
    "name": "Whitening Fish",
    "description": "Delicately prepared whitening fish",
    "price": 150.00,
    "category": "Proteins",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "18",
    "name": "Small Efo Riro",
    "description": "Traditional Nigerian vegetable soup",
    "price": 100.00,
    "category": "Soups",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "19",
    "name": "Medium Efo Riro",
    "description": "Traditional Nigerian vegetable soup",
    "price": 130.00,
    "category": "Soups",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "20",
    "name": "Small Egusi",
    "description": "Rich and flavorful egusi soup",
    "price": 125.00,
    "category": "Soups",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "21",
    "name": "Large Egusi",
    "description": "Rich and flavorful egusi soup",
    "price": 150.00,
    "category": "Soups",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "22",
    "name": "Buka Stew",
    "description": "Traditional Nigerian buka stew",
    "price": 90.00,
    "category": "Soups",
    "image": "",
    "rating": 4.4
  },
  {
    "id": "23",
    "name": "Ewedu",
    "description": "Smooth and nutritious ewedu soup",
    "price": 40.00,
    "category": "Soups",
    "image": "",
    "rating": 4.3
  },
  {
    "id": "24",
    "name": "Gbegiri",
    "description": "Traditional Nigerian bean soup",
    "price": 60.00,
    "category": "Soups",
    "image": "",
    "rating": 4.3
  },
  {
    "id": "25",
    "name": "Gizdodo",
    "description": "Spicy and savory gizzard and plantain dish",
    "price": 120.00,
    "category": "Finger Foods",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "26",
    "name": "Peppered Ponmo",
    "description": "Spicy and flavorful peppered ponmo",
    "price": 220.00,
    "category": "Finger Foods",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "27",
    "name": "Peppered Gizzard",
    "description": "Spicy and savory peppered gizzard",
    "price": 100.00,
    "category": "Finger Foods",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "28",
    "name": "Suya",
    "description": "Grilled spicy meat skewers",
    "price": 90.00,
    "category": "Finger Foods",
    "image": "",
    "rating": 4.7
  },
  {
    "id": "29",
    "name": "Puffpuff",
    "description": "Sweet and fluffy Nigerian puffpuff",
    "price": 80.00,
    "category": "Finger Foods",
    "image": "",
    "rating": 4.4
  },
  {
    "id": "30",
    "name": "Zobo",
    "description": "Refreshing hibiscus drink",
    "price": 6.50,
    "category": "Drinks",
    "image": "",
    "rating": 4.5
  },
  {
    "id": "31",
    "name": "Chapman",
    "description": "Classic Nigerian cocktail",
    "price": 8.00,
    "category": "Drinks",
    "image": "",
    "rating": 4.6
  },
  {
    "id": "32",
    "name": "Yogurt Parfait",
    "description": "Creamy yogurt with granola and fruits",
    "price": 7.00,
    "category": "Other",
    "image": "",
    "rating": 4.3
  },
  {
    "id": "33",
    "name": "Chicken Shawarma",
    "description": "Grilled chicken wrapped in pita bread",
    "price": 15.00,
    "category": "Other",
    "image": "",
    "rating": 4.5
  }
];

// const invoices = [
//   {
//     id: "1",
//     invoiceNumber: "INV001",
//     customerName: "John Doe",
//     customerEmail: "john.doe@example.com",
//     customerPhone: "123-456-7890",
//     amount: 0.0,
//     discountPercentage: 0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-06-01",
//     status: "UNPAID",
//   },
//   {
//     id: "2",
//     invoiceNumber: "INV002",
//     customerName: "Jane Smith",
//     customerEmail: "jane.smith@example.com",
//     customerPhone: "987-654-3210",
//     amount: 0.0,
//     discountPercentage: 0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-06-15",
//     status: "PAID",
//   },
//   {
//     id: "3",
//     invoiceNumber: "INV003",
//     customerName: "Bob Johnson",
//     customerEmail: "bob.johnson@example.com",
//     customerPhone: "789-456-1230",
//     amount: 0.0,
//     discountPercentage: 0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-10-28",
//     status: "DUE",
//   },
//   {
//     id: "4",
//     invoiceNumber: "INV004",
//     customerName: "Alice Brown",
//     customerEmail: "alice.brown@example.com",
//     customerPhone: "456-789-0123",
//     amount: 0.0,
//     discountPercentage: 0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-11-05",
//     status: "PAID",
//   },
//   {
//     id: "5",
//     invoiceNumber: "INV005",
//     customerName: "Charlie Davis",
//     customerEmail: "charlie.davis@example.com",
//     customerPhone: "321-098-7654",
//     amount: 0.0,
//     discountPercentage: 0,
//     dateCreated: "2023-05-28",
//     dueDate: "2023-11-07",
//     status: "PENDING",
//   },
// ];

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, ...restOfProduct} = product
    const result = await prisma.product.create({
      data: restOfProduct,
    });
    console.log(`Created product with id: ${result.id}`);
  }

  // Seed invoices
  // for (const invoice of invoices) {
  //   const result = await prisma.invoice.create({
  //     data: invoice,
  //   });
  //   console.log(
  //     `Created invoice with id: ${result.id} and number: ${result.invoiceNumber}`
  //   );
  // }

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
