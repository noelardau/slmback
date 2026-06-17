// ============= STATISTIQUES PAR PARTICIPANT DANS UN TOURNOI =============

export interface NoteObjet {
  valeur: number;
  retenu: boolean;
}

export interface PerformanceDetailed {
  idPerfo: number;
  noteFinale: number | null;
  duree: string;
  etat: string;
  notes: NoteObjet[];
  penalites: number[];
  nombreNotesTotal: number;
  nombreNotesRetenues: number;
  nombrePenalites: number;
}

export interface ParticipantTournamentStats {
  participantId: number;
  participantName: string;
  participantPhoto?: string;
  participantType: 'membre' | 'guest';
  participantPseudo?: string;
  
  // Stats générales
  nombrePerformances: number;
  totalPoints: number;
  moyennePoints: number;
  
  // Performance extrêmes
  meilleurePerformance?: number;
  pirePerformance?: number;
  
  // Détails par performance (POUR GRAPHIQUES)
  performances: PerformanceDetailed[];
  
  // Stats détaillées du jury
  totalNotesDonnees: number;
  moyenneNotesMoyenne: number;
  
  // Stats de pénalités
  totalPenalites: number;
  nombrePerformancesAvecPenalites: number;
}

export interface AllParticipantsTournamentStatsResponse {
  tournoiId: number;
  tournoiNom: string;
  participantsStats: ParticipantTournamentStats[];
  dateCalcul: Date;
}

// ============= STATISTIQUES GLOBALES POUR MEMBRES =============

export interface TournamentPerformanceSummary {
  idTournoi: number;
  nomTournoi: string;
  dateTournoi: Date;
  nombrePerformances: number;
  totalPoints: number;
  moyennePoints: number;
  meilleurePerformance?: number;
  pirePerformance?: number;
}

export interface MemberGlobalStats {
  memberId: number;
  memberName: string;
  memberPseudo: string;
  memberPhoto?: string;
  
  // Stats globales
  nombreTournois: number;
  nombrePerformancesTotal: number;
  totalPointsAccumules: number;
  moyennePointsGlobal: number;
  
  // Performance extrêmes
  meilleurePerformanceGlobale?: number;
  pirePerformanceGlobale?: number;
  
  // Stats par tournoi (POUR GRAPHIQUES)
  tournoisPerformances: TournamentPerformanceSummary[];
  
  // Progression temporelle
  progressionMoyennes: number[];
  
  // Stats de régularité
  ecartTypePoints: number;
  tauxConsistance: number;
}