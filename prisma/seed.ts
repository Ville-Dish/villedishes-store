import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    "id": "1",
    "name": "Small Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 95.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Nigerian_Fried_Rice_u1izk7.jpg",
    "rating": 4.5
  },
  {
    "id": "2",
    "name": "Medium Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 120.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Nigerian_Fried_Rice_u1izk7.jpg",
    "rating": 4.5
  },
  {
    "id": "3",
    "name": "Large Tray of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 170.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Nigerian_Fried_Rice_u1izk7.jpg",
    "rating": 4.5
  },
  {
    "id": "4",
    "name": "48 qts Cooler of Naija Fried Rice",
    "description": "Spicy and flavorful fried rice dish",
    "price": 450.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Nigerian_Fried_Rice_u1izk7.jpg",
    "rating": 4.5
  },
  {
    "id": "5",
    "name": "Plate of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 17.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/Jollof_rice_yrey0a.jpg",
    "rating": 4.7
  },
  {
    "id": "6",
    "name": "Small Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 80.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136078/Tray_of_Smokey_Party_Jollof_Rice_fx3v0v.jpg",
    "rating": 4.7
  },
  {
    "id": "7",
    "name": "Medium Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 100.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136078/Tray_of_Smokey_Party_Jollof_Rice_fx3v0v.jpg",
    "rating": 4.7
  },
  {
    "id": "8",
    "name": "Large Tray of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 150.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136078/Tray_of_Smokey_Party_Jollof_Rice_fx3v0v.jpg",
    "rating": 4.7
  },
  {
    "id": "9",
    "name": "48 qts Cooler of Smoky Nigerian Jollof",
    "description": "Traditional Nigerian jollof rice with a smoky flavor",
    "price": 420.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136078/Tray_of_Smokey_Party_Jollof_Rice_fx3v0v.jpg",
    "rating": 4.7
  },
  {
    "id": "10",
    "name": "Tray of Porridge",
    "description": "Traditional Nigerian porridge",
    "price": 100.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200024/Porridge_aaw5a3.jpg",
    "rating": 4.4
  },
  {
    "id": "11",
    "name": "Tray of Palm Oil Beans",
    "description": "Beans cooked in palm oil",
    "price": 90.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200024/Palm_Oil_Bean_kinv1c.jpg",
    "rating": 4.3
  },
  {
    "id": "12",
    "name": "Tray of Agoyin Beans with Stew",
    "description": "Agoyin beans served with stew",
    "price": 120.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200024/Ewa_agoyin_heuyl3.jpg",
    "rating": 4.5
  },
  {
    "id": "13",
    "name": "Tray of Moinmoin",
    "description": "Steamed bean pudding",
    "price": 120.00,
    "category": "Main Dishes",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200024/moimoi_btccss.jpg",
    "rating": 4.6
  },
  {
    "id": "14",
    "name": "Small Tray of Ofada Sauce",
    "description": "Spicy and rich Ofada sauce",
    "price": 95.00,
    "category": "Sauces",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/Ofada_Sauce_hfsw9b.jpg",
    "rating": 4.6
  },
  {
    "id": "15",
    "name": "Medium Tray of Ofada Sauce",
    "description": "Spicy and rich Ofada sauce",
    "price": 120.00,
    "category": "Sauces",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/Ofada_Sauce_hfsw9b.jpg",
    "rating": 4.6
  },
  {
    "id": "16",
    "name": "Small Tray of Local Ata Dindin (Fried Stew)",
    "description": "Spicy fried stew",
    "price": 85.00,
    "category": "Sauces",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136075/ata_dindin_mszfjq.jpg",
    "rating": 4.5
  },
  {
    "id": "17",
    "name": "Medium Tray of Local Ata Dindin (Fried Stew)",
    "description": "Spicy fried stew",
    "price": 105.00,
    "category": "Sauces",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136075/ata_dindin_mszfjq.jpg",
    "rating": 4.5
  },
  {
    "id": "18",
    "name": "Medium Tray of Beef",
    "description": "Tender and flavorful beef",
    "price": 130.00,
    "category": "Proteins",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200024/Beef_vwfgyi.jpg",
    "rating": 4.4
  },
  {
    "id": "19",
    "name": "Small Tray of Chicken (Drumstick)",
    "description": "Juicy and well-seasoned chicken drumsticks",
    "price": 80.00,
    "category": "Proteins",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/chicken_w9mahw.jpg",
    "rating": 4.4
  },
  {
    "id": "20",
    "name": "Large Tray of Chicken (Drumstick)",
    "description": "Juicy and well-seasoned chicken drumsticks",
    "price": 150.00,
    "category": "Proteins",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/chicken_w9mahw.jpg",
    "rating": 4.4
  },
  {
    "id": "21",
    "name": "Large Tray of Chicken (Hard Chicken)",
    "description": "Juicy and well-seasoned hard chicken",
    "price": 180.00,
    "category": "Proteins",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200289/hard-chicken_pasi8a.jpg",
    "rating": 4.4
  },
  {
    "id": "22",
    "name": "Medium Tray of Whitening Fish",
    "description": "Delicately prepared whitening fish",
    "price": 150.00,
    "category": "Proteins",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/fried_fish_m7paxv.jpg",
    "rating": 4.6
  },
  {
    "id": "23",
    "name": "Small Efo Riro (2.2L)",
    "description": "Traditional Nigerian vegetable soup",
    "price": 100.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/efo_riro_r2ctiy.jpg",
    "rating": 4.5
  },
  {
    "id": "24",
    "name": "Medium Efo Riro (3.1L)",
    "description": "Traditional Nigerian vegetable soup",
    "price": 135.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/efo_riro_r2ctiy.jpg",
    "rating": 4.5
  },
  {
    "id": "25",
    "name": "Small Egusi (2.2L)",
    "description": "Rich and flavorful egusi soup",
    "price": 125.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Egusi_soup_jruaed.jpg",
    "rating": 4.6
  },
  {
    "id": "26",
    "name": "Large Egusi (2.8L)",
    "description": "Rich and flavorful egusi soup",
    "price": 150.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/Egusi_soup_jruaed.jpg",
    "rating": 4.6
  },
  {
    "id": "27",
    "name": "Buka Stew (2L)",
    "description": "Traditional Nigerian buka stew",
    "price": 90.00,
    "category": "Sauces",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200163/Buka_stew_tsgmb7.jpg",
    "rating": 4.4
  },
  {
    "id": "28",
    "name": "Ewedu (2L)",
    "description": "Smooth and nutritious ewedu soup",
    "price": 40.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136075/ewedu_iysof8.jpg",
    "rating": 4.3
  },
  {
    "id": "29",
    "name": "Gbegiri (1.5L)",
    "description": "Traditional Nigerian bean soup",
    "price": 60.00,
    "category": "Soups",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/gbegiri_fnrims.jpg",
    "rating": 4.3
  },
  {
    "id": "30",
    "name": "Tray of Gizdodo",
    "description": "Spicy and savory gizzard and plantain dish",
    "price": 120.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/gizdodo_xh36f4.jpg",
    "rating": 4.5
  },
  {
    "id": "31",
    "name": "Tray of Peppered Ponmo",
    "description": "Spicy and flavorful peppered ponmo",
    "price": 220.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/ponmo_v26znq.jpg",
    "rating": 4.6
  },
  {
    "id": "32",
    "name": "Tray of Peppered Gizzard",
    "description": "Spicy and savory peppered gizzard",
    "price": 100.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/Peppered_gizzard_eq0ser.jpg",
    "rating": 4.5
  },
  {
    "id": "33",
    "name": "Tray of Suya",
    "description": "Grilled spicy meat skewers",
    "price": 90.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/suya_qv9ono.jpg",
    "rating": 4.7
  },
  {
    "id": "34",
    "name": "Tray of Puffpuff",
    "description": "Sweet and fluffy Nigerian puffpuff",
    "price": 80.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/puffpuff_lizfkl.jpg",
    "rating": 4.4
  },
  {
    "id": "35",
    "name": "350g Chin-Chin",
    "description": "Crispy and crunchy Nigerian snack",
    "price": 8.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200560/chinchin_wi0czs.jpg",
    "rating": 4.5
  },
  {
    "id": "36",
    "name": "700g Chin-Chin",
    "description": "Crispy and crunchy Nigerian snack",
    "price": 16.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200560/chinchin_wi0czs.jpg",
    "rating": 4.5
  },
  {
    "id": "37",
    "name": "1kg Chin-Chin",
    "description": "Crispy and crunchy Nigerian snack",
    "price": 22.00,
    "category": "Finger Foods",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741200560/chinchin_wi0czs.jpg",
    "rating": 4.5
  },
  {
    "id": "38",
    "name": "16oz Zobo",
    "description": "Refreshing hibiscus drink",
    "price": 6.50,
    "category": "Drinks",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/zobo_c5ynov.jpg",
    "rating": 4.5
  },
  {
    "id": "39",
    "name": "16oz Chapman",
    "description": "Classic Nigerian cocktail",
    "price": 8.00,
    "category": "Drinks",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/chapman_dvoauq.jpg",
    "rating": 4.6
  },
  {
    "id": "40",
    "name": "Yogurt Parfait",
    "description": "Creamy yogurt with granola and fruits",
    "price": 7.00,
    "category": "Other",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136077/Yogurt_Parfait_zwcqze.jpg",
    "rating": 4.3
  },
  {
    "id": "41",
    "name": "Chicken Shawarma",
    "description": "Grilled chicken wrapped in pita bread",
    "price": 15.00,
    "category": "Other",
    "image": "https://res.cloudinary.com/dxt7vk5dg/image/upload/v1741136076/chicken_sharwama_gkyemt.jpg",
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
