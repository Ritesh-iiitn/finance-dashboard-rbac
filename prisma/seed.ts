import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const viewerPassword = await bcrypt.hash('viewer123', 10)
  const analystPassword = await bcrypt.hash('analyst123', 10)
  const adminPassword = await bcrypt.hash('admin123', 10)

  // Clean DB
  await prisma.financialRecord.deleteMany()
  await prisma.user.deleteMany()

  // Seed Users
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE'
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: {},
    create: {
      name: 'Analyst User',
      email: 'analyst@example.com',
      password: analystPassword,
      role: 'ANALYST',
      status: 'ACTIVE'
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    },
  })

  console.log({ viewer, analyst, admin })

  // Seed Financial Records
  const categories = ['Salary', 'Rent', 'Utilities', 'Food', 'Freelance']
  
  for (let i = 0; i < 20; i++) {
    const isIncome = i % 2 === 0
    const type = isIncome ? 'INCOME' : 'EXPENSE'
    const category = categories[i % categories.length]
    const amount = isIncome ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 1000) + 100

    // Random date within the last 12 months
    const date = new Date()
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 12))
    date.setDate(Math.floor(Math.random() * 28) + 1)

    await prisma.financialRecord.create({
      data: {
        amount,
        type,
        category,
        date,
        description: `Sample ${category} - ${type}`,
        createdById: admin.id
      }
    })
  }

  console.log('Seeded 20 records')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
