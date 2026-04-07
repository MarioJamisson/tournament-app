import { Injectable, signal, computed } from '@angular/core';
import { Player, Match, BracketRound } from './models';

export type GameType = 'tekken' | 'mk11' | 'gh3';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  currentView = signal<'game-select' | 'register' | 'bracket' | 'vs'>('game-select');
  selectedGame = signal<GameType | null>(null);
  
  participants = signal<Player[]>([]);
  rounds = signal<BracketRound[]>([]);
  activeMatch = signal<Match | null>(null);

  addParticipant(player: Player) {
    this.participants.update(p => [...p, player]);
  }

  removeParticipant(id: string) {
    this.participants.update(p => p.filter(x => x.id !== id));
  }

  generateBracket() {
    const players = [...this.participants()];
    if (players.length < 2) return;

    // Sorteia a ordem dos participantes de forma aleatória (Fisher-Yates)
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // determine next power of 2 for a clean bracket
    // For simplicity if not a power of 2, we should include BYEs, but let's do a strict binary tree
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
    
    // Fill missing slots with nulls (BYEs)
    const paddedPlayers: (Player | null)[] = [...players];
    while(paddedPlayers.length < bracketSize) {
      paddedPlayers.push(null);
    }

    const numRounds = Math.log2(bracketSize);
    const generatedRounds: BracketRound[] = [];
    
    let currentRoundMatches: Match[] = [];
    let matchCounter = 1;

    // Round 1
    for (let i = 0; i < bracketSize; i += 2) {
      const p1 = paddedPlayers[i];
      const p2 = paddedPlayers[i+1];
      
      const m: Match = {
        id: `m_${matchCounter++}`,
        player1: p1,
        player2: p2,
        status: p1 && p2 ? 'upcoming' : 'finished', // if one is null, it's a BYE, handled logically later
        time: `Round 1`,
        winnerId: p1 && !p2 ? p1.id : (!p1 && p2 ? p2.id : undefined)
      };
      currentRoundMatches.push(m);
    }
    
    generatedRounds.push({ title: 'Round 1', matches: currentRoundMatches });

    // Subsequent rounds
    let previousRoundMatches = currentRoundMatches;
    for (let r = 1; r < numRounds; r++) {
      const nextRoundMatches: Match[] = [];
      const isFinal = r === numRounds - 1;
      
      for (let i = 0; i < previousRoundMatches.length; i += 2) {
        const nextMatchObj: Match = {
          id: `m_${matchCounter++}`,
          player1: null,
          player2: null,
          status: 'upcoming',
          time: isFinal ? 'Grand Finals' : `Round ${r + 1}`
        };
        nextRoundMatches.push(nextMatchObj);
        previousRoundMatches[i].nextMatchId = nextMatchObj.id;
        previousRoundMatches[i+1].nextMatchId = nextMatchObj.id;
      }
      
      generatedRounds.push({ 
        title: isFinal ? 'Finals' : `Round ${r + 1}`, 
        matches: nextRoundMatches 
      });
      previousRoundMatches = nextRoundMatches;
    }

    this.rounds.set(generatedRounds);
    this.currentView.set('bracket');
  }

  setWinner(matchId: string, winnerId: string) {
     const allRounds = [...this.rounds()];
     let foundMatch: Match | null = null;
     
     // Find the match and update winner
     for (const r of allRounds) {
       const m = r.matches.find(x => x.id === matchId);
       if (m) {
         m.winnerId = winnerId;
         m.status = 'finished';
         foundMatch = m;
         break;
       }
     }

     if (!foundMatch || !foundMatch.nextMatchId) {
        this.rounds.set(allRounds);
        return;
     }

     const winnerPlayer = foundMatch.player1?.id === winnerId ? foundMatch.player1 : foundMatch.player2;

     // Propagate to next match
     for (const r of allRounds) {
        const nextM = r.matches.find(x => x.id === foundMatch!.nextMatchId);
        if (nextM) {
          if (!nextM.player1) nextM.player1 = winnerPlayer;
          else if (!nextM.player2) nextM.player2 = winnerPlayer;
          break;
        }
     }

     this.rounds.set(allRounds);
  }

  playMatch(match: Match) {
    if (match.player1 && match.player2) {
      this.activeMatch.set(match);
      this.currentView.set('vs');
    } else {
      alert("Match is not ready yet! Waiting for previous results.");
    }
  }

  goBack() {
    this.currentView.set('bracket');
  }
}
