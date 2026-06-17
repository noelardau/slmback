import prisma from '../prisma.js';
import {
  ParticipantTournamentStats,
  AllParticipantsTournamentStatsResponse,
  PerformanceDetailed,
  MemberGlobalStats,
  TournamentPerformanceSummary,
  NoteObjet
} from '../types/statistics.js';

export class StatisticsService {
  
  /**
   * Obtenir les stats de TOUS les participants d'un tournoi (PUBLIQUE)
   * OPTIMISÉ: Requête groupée pour éviter N+1 queries
   */
  async getAllParticipantsTournamentStats(
    tournamentId: number
  ): Promise<AllParticipantsTournamentStatsResponse> {
    
    const tournoi = await prisma.tournoi.findUnique({
      where: { idTournoi: tournamentId },
      select: { idTournoi: true, nomTournoi: true }
    });

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    const participants = await prisma.tournament_participants.findMany({
      where: { idTournoi: tournamentId },
      include: {
        membre: {
          select: {
            idMembre: true,
            nomMembre: true,
            prenomMembre: true,
            pseudoMembre: true,
            photoMembre: true
          }
        },
        guest: {
          select: { idGuest: true, pseudo: true }
        }
      },
      orderBy: { totalNote: 'desc' }
    });

    const participantIds = participants.map(p => p.idParticipant);
    
    const allPerformances = await prisma.performance.findMany({
      where: { idParticipant: { in: participantIds }, idTournoi: tournamentId },
      include: {
        notes: { select: { idNote: true, valeur: true, retenu: true }, orderBy: { idNote: 'asc' } },
        penalites: { select: { idPenalite: true, valeur: true }, orderBy: { idPenalite: 'asc' } }
      },
      orderBy: { idPerfo: 'asc' }
    });

    const performancesByParticipant = new Map<number, typeof allPerformances>();
    for (const perf of allPerformances) {
      const existing = performancesByParticipant.get(perf.idParticipant) || [];
      existing.push(perf);
      performancesByParticipant.set(perf.idParticipant, existing);
    }

    const participantsStats = await Promise.all(
      participants.map(async (participant) => {
        const performances = performancesByParticipant.get(participant.idParticipant) || [];
        
        const performancesDetailed: PerformanceDetailed[] = performances.map(perf => {
          const notesObjets: NoteObjet[] = perf.notes.map(n => ({
            valeur: n.valeur,
            retenu: n.retenu
          }));
          
          return {
            idPerfo: perf.idPerfo,
            noteFinale: perf.noteFinale,
            duree: perf.duree || '00:00',
            etat: perf.etat || 'prêt',
            notes: notesObjets,
            penalites: perf.penalites.map(p => p.valeur),
            nombreNotesTotal: perf.notes.length,
            nombreNotesRetenues: perf.notes.filter(n => n.retenu).length,
            nombrePenalites: perf.penalites.length
          };
        });

        const performancesNotées = performancesDetailed.filter(p => p.noteFinale !== null);
        const nombrePerformances = performancesNotées.length;
        const totalPoints = performancesNotées.reduce((sum, p) => sum + (p.noteFinale || 0), 0);
        const moyennePoints = nombrePerformances > 0 ? totalPoints / nombrePerformances : 0;

        const notesFinale = performancesNotées.map(p => p.noteFinale!);
        const meilleurePerformance = notesFinale.length > 0 ? Math.max(...notesFinale) : undefined;
        const pirePerformance = notesFinale.length > 0 ? Math.min(...notesFinale) : undefined;

        const totalNotesDonnees = performancesDetailed.reduce((sum, p) => sum + p.nombreNotesTotal, 0);
        const moyennesNotesMoyenne = performancesDetailed.length > 0 
          ? performancesDetailed.reduce((sum, p) => {
              const moyenne = p.nombreNotesTotal > 0 ? p.notes.reduce((s, n) => s + n.valeur, 0) / p.nombreNotesTotal : 0;
              return sum + moyenne;
            }, 0) / performancesDetailed.length
          : 0;

        const totalPenalites = performancesDetailed.reduce((sum, p) => sum + p.penalites.reduce((s, pe) => s + pe, 0), 0);
        const nombrePerformancesAvecPenalites = performancesDetailed.filter(p => p.nombrePenalites > 0).length;

        const isMembre = !!participant.membre;
        const participantName = isMembre 
          ? `${participant.membre.prenomMembre} ${participant.membre.nomMembre}`
          : participant.guest?.pseudo || 'Inconnu';
        const participantPhoto = isMembre ? participant.membre.photoMembre : undefined;
        const participantPseudo = isMembre ? participant.membre.pseudoMembre : participant.guest?.pseudo;

        return {
          participantId: participant.idParticipant,
          participantName,
          participantPhoto,
          participantType: isMembre ? 'membre' : 'guest',
          participantPseudo,
          nombrePerformances,
          totalPoints: parseFloat(totalPoints.toFixed(2)),
          moyennePoints: parseFloat(moyennePoints.toFixed(2)),
          meilleurePerformance,
          pirePerformance,
          performances: performancesDetailed,
          totalNotesDonnees,
          moyenneNotesMoyenne: parseFloat(moyennesNotesMoyenne.toFixed(2)),
          totalPenalites: parseFloat(totalPenalites.toFixed(2)),
          nombrePerformancesAvecPenalites
        };
      })
    );

    return {
      tournoiId: tournoi.idTournoi,
      tournoiNom: tournoi.nomTournoi,
      participantsStats,
      dateCalcul: new Date()
    };
  }

  /**
   * Obtenir les stats globales d'un membre (PROTECTED)
   */
  async getMemberGlobalStats(memberId: number): Promise<MemberGlobalStats> {
    
    const membre = await prisma.membre.findUnique({
      where: { idMembre: memberId },
      select: {
        idMembre: true,
        nomMembre: true,
        prenomMembre: true,
        pseudoMembre: true,
        photoMembre: true
      }
    });

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    const participants = await prisma.tournament_participants.findMany({
      where: { idMembre: memberId },
      include: {
        tournoi: {
          select: { idTournoi: true, nomTournoi: true, dateTournoi: true }
        }
      },
      orderBy: { idTournoi: 'asc' }
    });

    const nombreTournois = participants.length;
    const participantIds = participants.map(p => p.idParticipant);

    const allPerformances = await prisma.performance.findMany({
      where: { idParticipant: { in: participantIds }, noteFinale: { not: null } },
      include: {
        tournoi: {
          select: { idTournoi: true, nomTournoi: true, dateTournoi: true }
        },
        penalites: {
          select: { idPenalite: true, valeur: true }
        }
      },
      orderBy: { idPerfo: 'asc' }
    });

    const nombrePerformancesTotal = allPerformances.length;
    const totalPointsAccumules = allPerformances.reduce((sum, p) => sum + (p.noteFinale || 0), 0);
    const moyennePointsGlobal = nombrePerformancesTotal > 0 ? totalPointsAccumules / nombrePerformancesTotal : 0;

    const notesFinale = allPerformances.map(p => p.noteFinale!);
    const meilleurePerformanceGlobale = notesFinale.length > 0 ? Math.max(...notesFinale) : undefined;
    const pirePerformanceGlobale = notesFinale.length > 0 ? Math.min(...notesFinale) : undefined;

    const performancesByTournament = new Map<number, typeof allPerformances>();
    for (const perf of allPerformances) {
      const existing = performancesByTournament.get(perf.idTournoi) || [];
      existing.push(perf);
      performancesByTournament.set(perf.idTournoi, existing);
    }

    const tournoisPerformances: TournamentPerformanceSummary[] = participants.map(participant => {
      const tournamentPerformances = performancesByTournament.get(participant.idTournoi) || [];
      const notes = tournamentPerformances.map(p => p.noteFinale!);
      
      return {
        idTournoi: participant.tournoi.idTournoi,
        nomTournoi: participant.tournoi.nomTournoi,
        dateTournoi: participant.tournoi.dateTournoi,
        nombrePerformances: tournamentPerformances.length,
        totalPoints: participant.totalNote,
        moyennePoints: tournamentPerformances.length > 0 
          ? participant.totalNote / tournamentPerformances.length 
          : 0,
        meilleurePerformance: notes.length > 0 ? Math.max(...notes) : undefined,
        pirePerformance: notes.length > 0 ? Math.min(...notes) : undefined
      };
    });

    const progressionMoyennes = tournoisPerformances.map(t => t.moyennePoints);

    const moyenneDesMoyennes = progressionMoyennes.length > 0 
      ? progressionMoyennes.reduce((sum, m) => sum + m, 0) / progressionMoyennes.length 
      : 0;
    
    const variance = progressionMoyennes.length > 0
      ? progressionMoyennes.reduce((sum, m) => sum + Math.pow(m - moyenneDesMoyennes, 2), 0) / progressionMoyennes.length
      : 0;
    
    const ecartTypePoints = Math.sqrt(variance);
    const tauxConsistance = moyenneDesMoyennes > 0 
      ? Math.max(0, 1 - (ecartTypePoints / moyenneDesMoyennes))
      : 0;

    return {
      memberId: membre.idMembre,
      memberName: `${membre.prenomMembre} ${membre.nomMembre}`,
      memberPseudo: membre.pseudoMembre,
      memberPhoto: membre.photoMembre || undefined,
      nombreTournois,
      nombrePerformancesTotal,
      totalPointsAccumules: parseFloat(totalPointsAccumules.toFixed(2)),
      moyennePointsGlobal: parseFloat(moyennePointsGlobal.toFixed(2)),
      meilleurePerformanceGlobale,
      pirePerformanceGlobale,
      tournoisPerformances: tournoisPerformances.map(t => ({
        ...t,
        moyennePoints: parseFloat(t.moyennePoints.toFixed(2))
      })),
      progressionMoyennes: progressionMoyennes.map(m => parseFloat(m.toFixed(2))),
      ecartTypePoints: parseFloat(ecartTypePoints.toFixed(2)),
      tauxConsistance: parseFloat(tauxConsistance.toFixed(2))
    };
  }
}

export const statisticsService = new StatisticsService();