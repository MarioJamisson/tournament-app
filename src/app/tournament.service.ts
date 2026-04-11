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

    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
    
    const paddedPlayers: (Player | null)[] = [...players];
    while(paddedPlayers.length < bracketSize) {
      paddedPlayers.push(null);
    }

    const numRounds = Math.log2(bracketSize) || 1;
    const generatedRounds: BracketRound[] = [];
    
    const wRounds: Match[][] = [];
    for(let r=0; r<numRounds; r++) {
      const wMatches: Match[] = [];
      const matchCount = bracketSize / Math.pow(2, r+1);
      for(let i=0; i<matchCount; i++) {
        wMatches.push({ id: `wm_${r}_${i}`, player1: null, player2: null, status: 'upcoming', time: `Winners R${r+1}`, bracket: 'winners' });
      }
      wRounds.push(wMatches);
    }
    
    for (let i = 0; i < bracketSize; i += 2) {
      wRounds[0][i/2].player1 = paddedPlayers[i];
      wRounds[0][i/2].player2 = paddedPlayers[i+1];
      if (wRounds[0][i/2].player1 && !wRounds[0][i/2].player2) {
         wRounds[0][i/2].status = 'finished';
         wRounds[0][i/2].winnerId = wRounds[0][i/2].player1!.id;
      } else if (!wRounds[0][i/2].player1 && wRounds[0][i/2].player2) {
         wRounds[0][i/2].status = 'finished';
         wRounds[0][i/2].winnerId = wRounds[0][i/2].player2!.id;
      }
    }

    const lRounds: Match[][] = [];
    if (numRounds > 1) { 
      const numLRounds = (numRounds - 1) * 2;
      let matchCount = bracketSize / 4; 
      for(let r=0; r<numLRounds; r++) {
         const lMatches: Match[] = [];
         for(let i=0; i<matchCount; i++) {
            lMatches.push({ id: `lm_${r}_${i}`, player1: null, player2: null, status: 'upcoming', time: `Losers R${r+1}`, bracket: 'losers' });
         }
         lRounds.push(lMatches);
         if (r % 2 !== 0 && r > 0) matchCount = matchCount / 2;
      }
    }

    const gfMatch: Match = { id: `gf_1`, player1: null, player2: null, status: 'upcoming', time: 'Grand Finals', bracket: 'grand-finals' };

    for(let r=0; r<numRounds-1; r++) {
      for(let i=0; i<wRounds[r].length; i++) {
        wRounds[r][i].nextMatchId = wRounds[r+1][Math.floor(i/2)].id;
      }
    }
    wRounds[numRounds-1][0].nextMatchId = gfMatch.id;

    for(let r=0; r<lRounds.length-1; r++) {
       for(let i=0; i<lRounds[r].length; i++) {
          if (r % 2 === 0) {
             lRounds[r][i].nextMatchId = lRounds[r+1][i].id;
          } else {
             lRounds[r][i].nextMatchId = lRounds[r+1][Math.floor(i/2)].id;
          }
       }
    }
    if (lRounds.length > 0) {
      lRounds[lRounds.length-1][0].nextMatchId = gfMatch.id;
    }

    for(let w_r=0; w_r<numRounds; w_r++) {
       if (w_r === 0 && lRounds.length > 0) {
         for(let i=0; i<wRounds[w_r].length; i++) {
            wRounds[w_r][i].loserNextMatchId = lRounds[0][Math.floor(i/2)].id;
         }
       } else if (w_r > 0 && lRounds.length > 0) {
         const l_idx = (w_r - 1) * 2 + 1;
         if (l_idx < lRounds.length) {
            for(let i=0; i<wRounds[w_r].length; i++) {
              wRounds[w_r][i].loserNextMatchId = lRounds[l_idx][wRounds[w_r].length - 1 - i].id; 
            }
         }
       }
    }

    for(let r=0; r<wRounds.length; r++) generatedRounds.push({ title: `Winners R${r+1}`, matches: wRounds[r], type: 'winners' });
    for(let r=0; r<lRounds.length; r++) generatedRounds.push({ title: `Losers R${r+1}`, matches: lRounds[r], type: 'losers' });
    generatedRounds.push({ title: 'Grand Finals', matches: [gfMatch], type: 'grand-finals' });

    // Handle initial auto-wins for BYE matches in W_R1 by pushing them forward
    for (let i = 0; i < wRounds[0].length; i++) {
      if (wRounds[0][i].status === 'finished' && wRounds[0][i].winnerId) {
          this.rounds.set(generatedRounds); // Temporarily set so setWinner works
          this.setWinner(wRounds[0][i].id, wRounds[0][i].winnerId!);
      }
    }

    this.rounds.set(generatedRounds);
    this.currentView.set('bracket');
  }

  setWinner(matchId: string, winnerId: string) {
     const allRounds = [...this.rounds()];
     let foundMatch: Match | null = null;
     
     for (const r of allRounds) {
       const m = r.matches.find(x => x.id === matchId);
       if (m) {
         m.winnerId = winnerId;
         m.status = 'finished';
         m.justDroppedToLosers = false;
         foundMatch = m;
         break;
       }
     }

     if (!foundMatch) return;

     const winnerPlayer = foundMatch.player1?.id === winnerId ? foundMatch.player1 : foundMatch.player2;
     const loserPlayer = foundMatch.player1?.id === winnerId ? foundMatch.player2 : foundMatch.player1;

     if (foundMatch.nextMatchId) {
        for (const r of allRounds) {
           const nextM = r.matches.find(x => x.id === foundMatch!.nextMatchId);
           if (nextM) {
             if (!nextM.player1) nextM.player1 = winnerPlayer;
             else if (!nextM.player2) nextM.player2 = winnerPlayer;
             break;
           }
        }
     }

     if (foundMatch.loserNextMatchId && loserPlayer) {
        for (const r of allRounds) {
           const nextLoserM = r.matches.find(x => x.id === foundMatch!.loserNextMatchId);
           if (nextLoserM) {
             if (!nextLoserM.player1) nextLoserM.player1 = loserPlayer;
             else if (!nextLoserM.player2) nextLoserM.player2 = loserPlayer;
             
             // Trigger animation flag
             nextLoserM.justDroppedToLosers = true;
             setTimeout(() => {
                 nextLoserM.justDroppedToLosers = false;
                 this.rounds.set([...this.rounds()]);
             }, 3000);
             break;
           }
        }
     }

     if (foundMatch.id === 'gf_1') {
         if (foundMatch.winnerId === foundMatch.player2?.id) {
             let gfRound = allRounds.find(r => r.type === 'grand-finals');
             if (gfRound) {
                 const resetMatch: Match = {
                     id: 'gf_reset',
                     player1: foundMatch.player1,
                     player2: foundMatch.player2,
                     status: 'upcoming',
                     time: 'Bracket Reset',
                     bracket: 'grand-finals',
                     isResetMatch: true
                 };
                 if (!gfRound.matches.find(m => m.id === 'gf_reset')) {
                     gfRound.matches.push(resetMatch);
                 }
             }
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
