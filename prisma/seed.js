const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path  = require('path');
const prisma = new PrismaClient()

async function main() {
  const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, './seed.json'), 'utf8'));

  for (const type_ of ['user', 'drama', 'watched', 'link', 'tag', 'activity']) {
    if (jsonData[type_]?.length && prisma[type_]) {
      const response = await prisma[type_].createMany({ data: jsonData[type_]});
      console.log(`created ${response.count} ${type_} records created.`);
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    // eslint-disable-next-line no-undef
    process.exit(1)
  })