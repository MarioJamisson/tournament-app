import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from './tournament.service';
import { Match, BracketRound } from './models';

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bracket-container">
      <div class="header">
        <h1>Tournament Bracket</h1>
        <button class="back-btn" (click)="ts.currentView.set('register')">Back to Setup</button>
      </div>

      <div class="tabs">
        <button 
          [class.active]="activeTab === 'winners'" 
          (click)="activeTab = 'winners'">
          Winners
        </button>
        <button 
          *ngIf="losersRounds.length > 0"
          [class.active]="activeTab === 'losers'" 
          (click)="activeTab = 'losers'">
          Losers
        </button>
        <button 
          [class.active]="activeTab === 'finals'" 
          (click)="activeTab = 'finals'">
          Grand Finals
        </button>
      </div>
      
      <div class="scroll-wrapper">
        <!-- Winners Bracket -->
        <div class="bracket-tree" *ngIf="activeTab === 'winners'">
          <div class="round-col" *ngFor="let round of winnersRounds; let isFirst = first; let isLast = last">
            <h3 class="round-title">{{ round.title }}</h3>
            
            <div class="match-nodes">
              <div 
                [ngClass]="getMatchClasses(m, isFirst, isLast)"
                *ngFor="let m of round.matches" 
                (click)="openMatch(m)">
                
                <div class="fighter-slot top-slot" [class.winner]="m.winnerId === m.player1?.id">
                  <span class="seed" *ngIf="m.player1">{{ m.player1.name }}</span>
                  <span class="seed tbd" *ngIf="!m.player1">TBD</span>
                </div>
                <div class="fighter-slot bottom-slot" [class.winner]="m.winnerId === m.player2?.id">
                  <span class="seed" *ngIf="m.player2">{{ m.player2.name }}</span>
                  <span class="seed tbd" *ngIf="!m.player2">TBD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Losers Bracket -->
        <div class="bracket-tree" *ngIf="activeTab === 'losers' && losersRounds.length > 0">
          <div class="round-col" *ngFor="let round of losersRounds; let isFirst = first; let isLast = last">
            <h3 class="round-title">{{ round.title }}</h3>
            
            <div class="match-nodes">
              <div 
                [ngClass]="getMatchClasses(m, isFirst, isLast)"
                *ngFor="let m of round.matches" 
                (click)="openMatch(m)">
                
                <div class="fighter-slot top-slot" [class.winner]="m.winnerId === m.player1?.id">
                  <span class="seed" *ngIf="m.player1">{{ m.player1.name }}</span>
                  <span class="seed tbd" *ngIf="!m.player1">TBD</span>
                </div>
                <div class="fighter-slot bottom-slot" [class.winner]="m.winnerId === m.player2?.id">
                  <span class="seed" *ngIf="m.player2">{{ m.player2.name }}</span>
                  <span class="seed tbd" *ngIf="!m.player2">TBD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grand Finals -->
        <div class="bracket-tree finals-tree" *ngIf="activeTab === 'finals'">
          <div class="round-col" *ngFor="let round of finalsRounds; let isFirst = first; let isLast = last">
            <h3 class="round-title" [class.glitch]="round.matches.length > 1">{{ round.title }}</h3>
            
            <div class="match-nodes">
              <div 
                [ngClass]="getMatchClasses(m, isFirst, isLast)"
                *ngFor="let m of round.matches" 
                (click)="openMatch(m)">
                
                <div class="reset-badge" *ngIf="m.isResetMatch">BRACKET RESET</div>

                <div class="fighter-slot top-slot" 
                     [class.winner]="m.winnerId === m.player1?.id"
                     [class.grand-champion]="isGrandChampion(m, m.player1?.id)">
                  <span class="seed" *ngIf="m.player1">{{ m.player1.name }} <span *ngIf="m.player1 && !m.isResetMatch && m.bracket === 'grand-finals'" class="bracket-origin">(W)</span></span>
                  <span class="seed tbd" *ngIf="!m.player1">TBD</span>
                </div>
                <div class="fighter-slot bottom-slot" 
                     [class.winner]="m.winnerId === m.player2?.id"
                     [class.grand-champion]="isGrandChampion(m, m.player2?.id)">
                  <span class="seed" *ngIf="m.player2">{{ m.player2.name }} <span *ngIf="m.player2 && !m.isResetMatch && m.bracket === 'grand-finals'" class="bracket-origin">(L)</span></span>
                  <span class="seed tbd" *ngIf="!m.player2">TBD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bracket-container {
      padding: 40px;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 3rem;
      color: var(--theme-secondary, #ff00ff);
      margin: 0;
      text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
    }
    .back-btn {
      background: transparent;
      border: 1px solid var(--theme-secondary, #ff00ff);
      color: var(--theme-secondary, #ff00ff);
      padding: 10px 20px;
      cursor: pointer;
      font-family: inherit;
      font-size: 1.2rem;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    .back-btn:hover { background: var(--theme-secondary, #ff00ff); color: #000; box-shadow: 0 0 15px var(--theme-secondary, #ff00ff); }
    
    .tabs {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    .tabs button {
      background: transparent;
      border: 1px solid #555;
      color: #aaa;
      padding: 12px 30px;
      cursor: pointer;
      font-family: inherit;
      font-size: 1.2rem;
      text-transform: uppercase;
      transition: all 0.2s;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .tabs button.active {
      border-color: #00ffff;
      color: #00ffff;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
      background: rgba(0, 255, 255, 0.05);
    }
    .tabs button:hover:not(.active) {
      border-color: #fff;
      color: #fff;
    }

    .scroll-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 50px;
    }

    .bracket-tree {
      display: flex;
      gap: 50px;
      overflow-x: auto;
      align-items: stretch;
      padding: 20px 0;
      justify-content: center;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .round-col {
      display: flex;
      flex-direction: column;
      min-width: 250px;
      position: relative;
    }
    .round-title {
      text-align: center;
      color: #aaa;
      margin-bottom: 20px;
      text-transform: uppercase;
      font-family: var(--font-secondary, 'Arial');
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }
    .match-nodes {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-around;
      gap: 30px;
    }
    .match-card {
      background: #151515;
      border: 1px solid #333;
      border-radius: 4px;
      position: relative;
      transition: all 0.2s;
      z-index: 2;
    }
    
    /* Horizontal Stems logic for brackets */
    .has-next::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -25px;
      width: 25px;
      border-top: 2px solid #555;
      z-index: -1;
    }
    .has-prev::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -25px;
      width: 25px;
      border-top: 2px solid #555;
      z-index: -1;
    }

    .clickable {
      cursor: pointer;
      border-color: #555;
    }
    .clickable:hover {
      border-color: #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
      transform: scale(1.02);
      z-index: 10;
    }
    .clickable:hover::after, .clickable:hover::before {
      border-color: #00ffff;
    }
    .finished { opacity: 0.5; }
    .finished:hover { opacity: 1; }
    
    .fighter-slot {
      padding: 12px;
      border-bottom: 1px solid #222;
      font-size: 1.3rem;
      display: flex;
      justify-content: space-between;
      position: relative;
    }
    .fighter-slot.bottom-slot { border-bottom: none; }
    
    /* WINNER STYLING */
    .fighter-slot.winner {
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%);
      color: #fff;
      font-weight: bold;
      border-left: 4px solid #00ffff;
    }
    .losers .fighter-slot.winner { border-left-color: #ff3366; }
    
    /* WINNER INDIVIDUAL ANIMATIONS */
    @keyframes winnerFlashCyan {
      0% { background: rgba(0, 255, 255, 0.6); color: white; border-left-width: 15px; }
      100% { background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%); border-left-width: 4px; }
    }
    @keyframes winnerFlashRed {
      0% { background: rgba(255, 51, 102, 0.6); color: white; border-left-width: 15px; }
      100% { background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%); border-left-width: 4px; }
    }
    .winners .fighter-slot.winner, .grand-finals .fighter-slot.winner {
      animation: winnerFlashCyan 0.6s ease-out forwards;
    }
    .losers .fighter-slot.winner {
      animation: winnerFlashRed 0.6s ease-out forwards;
    }

    /* GRAND CHAMPION STYLING */
    @keyframes championPulsate {
      0% { box-shadow: 0 0 15px gold, inset 0 0 10px gold; border-color: gold; text-shadow: 0 0 10px gold; }
      50% { box-shadow: 0 0 40px #ffcc00, inset 0 0 25px #ffcc00; border-color: #ffaa00; text-shadow: 0 0 20px white, 0 0 30px gold; transform: scale(1.05); background: linear-gradient(90deg, rgba(255, 215, 0, 0.3) 0%, transparent 100%); }
      100% { box-shadow: 0 0 15px gold, inset 0 0 10px gold; border-color: gold; text-shadow: 0 0 10px gold; }
    }
    @keyframes championBounce {
      from { transform: translateY(-50%) rotate(-5deg) scale(1.1); }
      to { transform: translateY(-50%) rotate(5deg) scale(1.3); }
    }

    .fighter-slot.grand-champion {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.3) 0%, transparent 100%);
      border-left: 6px solid gold;
      border-top: 1px solid gold;
      border-bottom: 1px solid gold;
      border-radius: 4px;
      animation: championPulsate 2s infinite !important;
      z-index: 20;
    }
    .fighter-slot.grand-champion::after {
      content: '👑 CHAMPION';
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: gold;
      font-weight: 900;
      font-size: 0.9rem;
      text-shadow: 2px 2px 0px #000, 0 0 10px gold;
      animation: championBounce 1s infinite alternate;
      letter-spacing: 1px;
    }

    .tbd { color: #555; font-style: italic; }

    .bracket-origin {
      font-size: 0.8rem;
      color: #888;
      margin-left: 5px;
    }

    /* ANIMATIONS */
    @keyframes dropInRed {
      0% { transform: translateY(-30px) scale(1.1); box-shadow: 0 0 40px #ff0000; background: rgba(255,0,0,0.2); border-color: #ff0000; }
      100% { transform: translateY(0) scale(1); box-shadow: 0 0 0px transparent; }
    }
    .dropped-to-losers {
      animation: dropInRed 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      border-color: #ff3366 !important;
    }

    @keyframes resetSiren {
      0% { box-shadow: 0 0 10px #ff00ff; border-color: #ff00ff; }
      50% { box-shadow: 0 0 40px #00ffff; border-color: #00ffff; transform: scale(1.05); }
      100% { box-shadow: 0 0 10px #ff00ff; border-color: #ff00ff; }
    }
    .reset-match {
      animation: resetSiren 1.5s infinite;
      border-width: 2px;
    }

    .reset-badge {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff00ff;
      color: #000;
      font-size: 0.8rem;
      font-weight: bold;
      padding: 3px 10px;
      border-radius: 10px;
      z-index: 5;
      text-shadow: none;
      box-shadow: 0 0 10px #ff00ff;
    }
  `]
})
export class BracketComponent {
  ts = inject(TournamentService);
  activeTab: 'winners' | 'losers' | 'finals' = 'winners';

  get winnersRounds() { return this.ts.rounds().filter((r: BracketRound) => r.type === 'winners'); }
  get losersRounds() { return this.ts.rounds().filter((r: BracketRound) => r.type === 'losers'); }
  get finalsRounds() { return this.ts.rounds().filter((r: BracketRound) => r.type === 'grand-finals'); }

  getMatchClasses(m: Match, isFirst: boolean, isLast: boolean) {
    return {
      'match-card': true,
      [m.bracket]: true, // adds 'winners', 'losers', 'grand-finals' for styling
      'clickable': m.player1 && m.player2,
      'finished': m.status === 'finished',
      'has-next': !isLast && m.bracket !== 'grand-finals',
      'has-prev': !isFirst && m.bracket !== 'grand-finals',
      'dropped-to-losers': m.justDroppedToLosers,
      'reset-match': m.isResetMatch
    };
  }

  isGrandChampion(m: Match, playerId?: string): boolean {
    if (!playerId || m.winnerId !== playerId) return false;
    if (m.bracket !== 'grand-finals') return false;
    
    const finalsRound = this.finalsRounds[0];
    if (!finalsRound) return false;

    const hasReset = finalsRound.matches.some(match => match.id === 'gf_reset');
    
    if (hasReset) {
      return m.id === 'gf_reset';
    } else {
      return m.id === 'gf_1';
    }
  }

  openMatch(m: Match) {
    this.ts.playMatch(m);
  }
}
