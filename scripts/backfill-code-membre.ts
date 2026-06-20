// Script one-shot : backfill codeMembre pour les membres existants
// Usage: npx tsx scripts/backfill-code-membre.ts
import prisma from '../src/prisma.js'
import { generateUniqueCodeMembre } from '../src/utils/codeMembre.js'

async function main() {
  const membres = await prisma.membre.findMany({ where: { codeMembre: null } })
  console.log(`[backfill] ${membres.length} membre(s) à traiter`)

  for (const membre of membres) {
    const codeMembre = await generateUniqueCodeMembre()
    await prisma.membre.update({
      where: { idMembre: membre.idMembre },
      data: { codeMembre },
    })
    console.log(`[backfill] Membre ${membre.idMembre} (${membre.pseudoMembre}) -> ${codeMembre}`)
  }

  console.log('[backfill] Terminé')
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[backfill] Erreur:', error)
  process.exit(1)
})
