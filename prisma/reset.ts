import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetData() {
  console.log("Resetting database...");

  // Reset all the tables in the correct order to avoid foreign key issues
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();

  console.log("Finished resetting database.");
}

resetData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
