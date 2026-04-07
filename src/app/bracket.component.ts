import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from './tournament.service';
import { Match } from './models';

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
      
      <div class="bracket-tree">
        <div class="round-col" *ngFor="let round of ts.rounds(); let isFirst = first; let isLast = last">
          <h3 class="round-title">{{ round.title }}</h3>
          
          <div class="match-nodes">
            <div 
              class="match-card" 
              *ngFor="let m of round.matches" 
              [class.clickable]="m.player1 && m.player2"
              [class.finished]="m.status === 'finished'"
              [class.has-next]="!isLast"
              [class.has-prev]="!isFirst"
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
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 3rem;
      color: var(--theme-secondary);
      margin: 0;
    }
    .back-btn {
      background: transparent;
      border: 1px solid var(--theme-secondary);
      color: var(--theme-secondary);
      padding: 10px 20px;
      cursor: pointer;
      font-family: inherit;
      font-size: 1.2rem;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    .back-btn:hover { background: var(--theme-secondary); color: #000; }
    
    .bracket-tree {
      display: flex;
      flex: 1;
      gap: 50px;
      overflow-x: auto;
      align-items: stretch;
      justify-content: center;
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
      font-family: var(--font-secondary);
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }
    .match-nodes {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-around;
      gap: 20px;
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
    .match-card.has-next::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -25px;
      width: 25px;
      border-top: 2px solid #555;
      z-index: -1;
    }
    
    .match-card.has-prev::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -25px;
      width: 25px;
      border-top: 2px solid #555;
      z-index: -1;
    }

    .match-card.clickable {
      cursor: pointer;
      border-color: #555;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    .match-card.clickable:hover {
      border-color: var(--theme-primary);
      box-shadow: 0 0 10px var(--theme-primary);
      transform: scale(1.02);
    }
    .match-card.clickable:hover::after, .match-card.clickable:hover::before {
      border-color: var(--theme-primary);
    }
    .match-card.finished { opacity: 0.6; }
    
    .fighter-slot {
      padding: 10px;
      border-bottom: 1px solid #222;
      font-size: 1.2rem;
    }
    .fighter-slot.bottom-slot { border-bottom: none; }
    .fighter-slot.winner {
      background: rgba(255, 255, 255, 0.1);
      color: var(--theme-secondary);
      font-weight: bold;
    }
    .tbd { color: #555; font-style: italic; }
  `]
})
export class BracketComponent {
  ts = inject(TournamentService);

  openMatch(m: Match) {
    this.ts.playMatch(m);
  }
}
