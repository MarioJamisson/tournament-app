import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from './tournament.service';
import { Match } from './models';

@Component({
  selector: 'app-vs-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container" *ngIf="ts.activeMatch() as match; else noMatch">
      <!-- MAIN VS SCREEN -->
      <div class="vs-screen" [style.background-image]="'url(' + stageBg + ')'">
        <button class="back-btn-overlay" (click)="ts.goBack()">← Back to Bracket</button>
        <div class="overlay"></div>

        <!-- PLAYER 1 SIDE -->
        <div class="fighter-side p1-side" [class.animating]="animating()">
          <img 
            [src]="match.player1!.character.image" 
            class="character-render" 
            alt="P1 Character">
          
          <div class="player-info">
            <img [src]="match.player1!.avatar" class="avatar" alt="P1 Avatar">
            <div class="names">
              <p class="real-name">{{ match.player1!.name }}</p>
              <h2 class="char-name">{{ match.player1!.character.name }}</h2>
            </div>
            <button class="win-btn" (click)="declareWinner(match.id, match.player1!.id)">P1 WINS</button>
          </div>
        </div>

        <!-- VS LOGO IN CENTER -->
        <div class="vs-logo-container">
          <img [src]="vsLogo" class="vs-logo" alt="VS">
        </div>

        <!-- PLAYER 2 SIDE -->
        <div class="fighter-side p2-side" [class.animating]="animating()">
          <img 
            [src]="match.player2!.character.image" 
            class="character-render no-flip" 
            alt="P2 Character">
            
          <div class="player-info">
            <button class="win-btn" (click)="declareWinner(match.id, match.player2!.id)">P2 WINS</button>
            <div class="names">
              <p class="real-name">{{ match.player2!.name }}</p>
              <h2 class="char-name">{{ match.player2!.character.name }}</h2>
            </div>
            <img [src]="match.player2!.avatar" class="avatar" alt="P2 Avatar">
          </div>
        </div>
      </div>
    </div>
    
    <ng-template #noMatch>
      <div class="error-state">
        <h2>No Match Selected.</h2>
        <button (click)="ts.goBack()">Back to Bracket</button>
      </div>
    </ng-template>
  `,
  styleUrls: ['./app.css']
})
export class VsScreenComponent {
  ts = inject(TournamentService);

  stageBg = '/stage_bg_1775495087176.png';
  vsLogo = '/vs_logo_1775495070725.png';

  animating = signal(false);

  declareWinner(matchId: string, winnerId: string) {
    this.ts.setWinner(matchId, winnerId);
    this.ts.goBack(); // Return to bracket after declaring winner
  }
}
