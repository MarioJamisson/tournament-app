export interface Character {
  name: string;
  image: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  character: Character;
}

export interface Match {
  id: string;
  player1: Player | null; // null if TBD (waiting for winner of previous match)
  player2: Player | null; // null if TBD
  status: 'upcoming' | 'live' | 'finished';
  time: string;
  nextMatchId?: string; // id of the match the winner goes to
  loserNextMatchId?: string; // id of the match the loser drops down to
  bracket: 'winners' | 'losers' | 'grand-finals';
  winnerId?: string;
  
  // Visual flags for animations
  isResetMatch?: boolean; // Flag if this is the reset match
  justDroppedToLosers?: boolean; // UI flag when a player drops here
}

export interface BracketRound {
  title: string;
  matches: Match[];
  type: 'winners' | 'losers' | 'grand-finals';
}
