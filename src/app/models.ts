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
  winnerId?: string;
}

export interface BracketRound {
  title: string;
  matches: Match[];
}
