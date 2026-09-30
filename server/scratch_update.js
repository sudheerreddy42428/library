const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: '25211A0586@bvrit.ac.in' },
    data: { email: '25211a0586@bvrit.ac.in' }
  });
  console.log('Updated to lowercase');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
