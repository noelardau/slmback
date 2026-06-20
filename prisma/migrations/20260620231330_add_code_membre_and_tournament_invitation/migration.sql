-- Add column codeMembre as nullable first (for backfill)
ALTER TABLE "membre" ADD COLUMN "codeMembre" TEXT;

-- Backfill: generate a unique code 'SLM-XXXXXX' for each existing row
-- Using alphabet without ambiguous chars (no 0/O, 1/I/L)
UPDATE "membre" SET "codeMembre" = (
  'SLM-' || (
    SELECT string_agg(
      substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ',
             floor(random() * 31 + 1)::int, 1),
      ''
    )
    FROM generate_series(1, 6)
  )
)
WHERE "codeMembre" IS NULL;

-- Make codeMembre NOT NULL
ALTER TABLE "membre" ALTER COLUMN "codeMembre" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "membre_codeMembre_key" ON "membre"("codeMembre");

-- CreateTable
CREATE TABLE "tournament_invitation" (
    "idTournamentInvitation" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "idTournoi" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "maxUsages" INTEGER,
    "usagesCount" INTEGER NOT NULL DEFAULT 0,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_invitation_pkey" PRIMARY KEY ("idTournamentInvitation")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_invitation_token_key" ON "tournament_invitation"("token");

-- CreateIndex
CREATE INDEX "tournament_invitation_idTournoi_idx" ON "tournament_invitation"("idTournoi");

-- AddForeignKey
ALTER TABLE "tournament_invitation" ADD CONSTRAINT "tournament_invitation_idTournoi_fkey" FOREIGN KEY ("idTournoi") REFERENCES "tournoi"("idTournoi") ON DELETE CASCADE ON UPDATE CASCADE;
