import { prisma } from "../src/db"

export default async () => {
    // clear database
    console.log('clearing test db.')
    await prisma.user.deleteMany({})
    await prisma.category.deleteMany({});
}
