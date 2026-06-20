-- CreateTable
CREATE TABLE "performance" (
    "idPerfo" SERIAL NOT NULL,
    "duree" TEXT,
    "noteFinale" DOUBLE PRECISION,
    "etat" TEXT,
    "idTournoi" INTEGER NOT NULL,
    "idMembre" INTEGER,
    "idGuest" INTEGER,
    "idParticipant" INTEGER NOT NULL,

    CONSTRAINT "performance_pkey" PRIMARY KEY ("idPerfo")
);

-- CreateTable
CREATE TABLE "collectif" (
    "idCollectif" SERIAL NOT NULL,
    "nomCollectif" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photoCollectif" TEXT,
    "prefLang" TEXT NOT NULL DEFAULT 'en',
    "prefTheme" TEXT NOT NULL DEFAULT 'dark',

    CONSTRAINT "collectif_pkey" PRIMARY KEY ("idCollectif")
);

-- CreateTable
CREATE TABLE "membre" (
    "idMembre" SERIAL NOT NULL,
    "nomMembre" TEXT NOT NULL,
    "prenomMembre" TEXT NOT NULL,
    "pseudoMembre" TEXT NOT NULL,
    "emailMembre" TEXT NOT NULL,
    "photoMembre" TEXT,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "adresse" TEXT NOT NULL,
    "idCollectif" INTEGER NOT NULL,

    CONSTRAINT "membre_pkey" PRIMARY KEY ("idMembre")
);

-- CreateTable
CREATE TABLE "tournoi" (
    "idTournoi" SERIAL NOT NULL,
    "LieuTournoi" TEXT NOT NULL,
    "dateTournoi" TIMESTAMP(3) NOT NULL,
    "heureTournoi" TEXT NOT NULL,
    "nomTournoi" TEXT NOT NULL,
    "nbJury" INTEGER NOT NULL,
    "afficheTournoi" TEXT,
    "dureePerfo" TEXT,
    "tirageAuSort" BOOLEAN NOT NULL DEFAULT false,
    "idCollectif" INTEGER NOT NULL,

    CONSTRAINT "tournoi_pkey" PRIMARY KEY ("idTournoi")
);

-- CreateTable
CREATE TABLE "guest" (
    "idGuest" SERIAL NOT NULL,
    "pseudo" TEXT NOT NULL,

    CONSTRAINT "guest_pkey" PRIMARY KEY ("idGuest")
);

-- CreateTable
CREATE TABLE "tournament_participants" (
    "idParticipant" SERIAL NOT NULL,
    "idMembre" INTEGER,
    "idTournoi" INTEGER NOT NULL,
    "idGuest" INTEGER,
    "totalNote" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("idParticipant")
);

-- CreateTable
CREATE TABLE "blacklistedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklistedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "idInvitation" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "idCollectif" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "maxUsages" INTEGER,
    "usagesCount" INTEGER NOT NULL DEFAULT 0,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("idInvitation")
);

-- CreateTable
CREATE TABLE "penalite" (
    "idPenalite" SERIAL NOT NULL,
    "idPerfo" INTEGER NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "penalite_pkey" PRIMARY KEY ("idPenalite")
);

-- CreateTable
CREATE TABLE "note" (
    "idNote" SERIAL NOT NULL,
    "idPerfo" INTEGER NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "retenu" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "note_pkey" PRIMARY KEY ("idNote")
);

-- CreateIndex
CREATE INDEX "performance_idTournoi_idx" ON "performance"("idTournoi");

-- CreateIndex
CREATE INDEX "performance_idMembre_idx" ON "performance"("idMembre");

-- CreateIndex
CREATE INDEX "performance_idGuest_idx" ON "performance"("idGuest");

-- CreateIndex
CREATE UNIQUE INDEX "collectif_email_key" ON "collectif"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membre_pseudoMembre_key" ON "membre"("pseudoMembre");

-- CreateIndex
CREATE UNIQUE INDEX "membre_emailMembre_key" ON "membre"("emailMembre");

-- CreateIndex
CREATE UNIQUE INDEX "guest_pseudo_key" ON "guest"("pseudo");

-- CreateIndex
CREATE INDEX "tournament_participants_idTournoi_idx" ON "tournament_participants"("idTournoi");

-- CreateIndex
CREATE INDEX "tournament_participants_idMembre_idx" ON "tournament_participants"("idMembre");

-- CreateIndex
CREATE INDEX "tournament_participants_idGuest_idx" ON "tournament_participants"("idGuest");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_idMembre_idTournoi_key" ON "tournament_participants"("idMembre", "idTournoi");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_idGuest_idTournoi_key" ON "tournament_participants"("idGuest", "idTournoi");

-- CreateIndex
CREATE UNIQUE INDEX "blacklistedToken_token_key" ON "blacklistedToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_idCollectif_idx" ON "invitation"("idCollectif");

-- CreateIndex
CREATE INDEX "penalite_idPerfo_idx" ON "penalite"("idPerfo");

-- CreateIndex
CREATE INDEX "note_idPerfo_idx" ON "note"("idPerfo");

-- AddForeignKey
ALTER TABLE "performance" ADD CONSTRAINT "performance_idTournoi_fkey" FOREIGN KEY ("idTournoi") REFERENCES "tournoi"("idTournoi") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance" ADD CONSTRAINT "performance_idMembre_fkey" FOREIGN KEY ("idMembre") REFERENCES "membre"("idMembre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance" ADD CONSTRAINT "performance_idGuest_fkey" FOREIGN KEY ("idGuest") REFERENCES "guest"("idGuest") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance" ADD CONSTRAINT "performance_idParticipant_fkey" FOREIGN KEY ("idParticipant") REFERENCES "tournament_participants"("idParticipant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_idCollectif_fkey" FOREIGN KEY ("idCollectif") REFERENCES "collectif"("idCollectif") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournoi" ADD CONSTRAINT "tournoi_idCollectif_fkey" FOREIGN KEY ("idCollectif") REFERENCES "collectif"("idCollectif") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_idMembre_fkey" FOREIGN KEY ("idMembre") REFERENCES "membre"("idMembre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_idTournoi_fkey" FOREIGN KEY ("idTournoi") REFERENCES "tournoi"("idTournoi") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_idGuest_fkey" FOREIGN KEY ("idGuest") REFERENCES "guest"("idGuest") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklistedToken" ADD CONSTRAINT "blacklistedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "collectif"("idCollectif") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_idCollectif_fkey" FOREIGN KEY ("idCollectif") REFERENCES "collectif"("idCollectif") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalite" ADD CONSTRAINT "penalite_idPerfo_fkey" FOREIGN KEY ("idPerfo") REFERENCES "performance"("idPerfo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_idPerfo_fkey" FOREIGN KEY ("idPerfo") REFERENCES "performance"("idPerfo") ON DELETE CASCADE ON UPDATE CASCADE;
