const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Crear empresa de prueba
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'Empresa de Prueba S.L.',
      nif: 'B12345678',
      direccion: 'Calle de Prueba, 123',
    },
  })

  // Crear usuario de prueba
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Usuario de Prueba',
      role: 'ADMIN',
      empresaId: empresa.id,
    },
  })

  console.log({ empresa, user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 