// Script one-shot : crée (ou met à jour) le compte administrateur
// Usage: npx tsx scripts/seed-admin.ts
// Le mot de passe est lu depuis la variable d'environnement ADMIN_PASSWORD
import prisma from '../src/prisma.js'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'slamnetmada@protonmail.com'

async function main() {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('[seed-admin] Variable ADMIN_PASSWORD manquante dans l\'environnement')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await prisma.collectif.findUnique({ where: { email: ADMIN_EMAIL } })

  if (existing) {
    await prisma.collectif.update({
      where: { idCollectif: existing.idCollectif },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    })
    console.log(`[seed-admin] Admin mis à jour (id=${existing.idCollectif}, email=${ADMIN_EMAIL})`)
  } else {
    const created = await prisma.collectif.create({
      data: {
        nomCollectif: 'Admin',
        ville: 'N/A',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
      },
    })
    console.log(`[seed-admin] Admin créé (id=${created.idCollectif}, email=${ADMIN_EMAIL})`)
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[seed-admin] Erreur:', error)
  process.exit(1)
})
