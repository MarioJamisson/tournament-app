import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from './tournament.service';
import { RegistrationComponent } from './registration.component';
import { BracketComponent } from './bracket.component';
import { VsScreenComponent } from './vs-screen.component';
import { GameSelectComponent } from './game-select.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameSelectComponent, RegistrationComponent, BracketComponent, VsScreenComponent],
  template: `
    <!-- MAIN WRAPPER WITH THEME APPLIED -->
    <div [ngClass]="getThemeClass()" class="app-wrapper">
      
      <!-- Top-Level State Router -->
      <ng-container [ngSwitch]="ts.currentView()">
        <!-- GAME SELECT VIEW -->
        <app-game-select *ngSwitchCase="'game-select'"></app-game-select>
      <!-- SETUP VIEW -->
      <app-registration *ngSwitchCase="'register'"></app-registration>

      <!-- COLLAPSED/FULL BRACKET VIEW -->
      <app-bracket *ngSwitchCase="'bracket'"></app-bracket>

      <!-- THE VERSUS MATCH SCREEN -->
      <app-vs-screen *ngSwitchCase="'vs'"></app-vs-screen>
      </ng-container>

    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      background-color: var(--bg-dark);
      transition: background-color 0.3s;
      color: var(--text-light);
    }
  `]
})
export class App {
  ts = inject(TournamentService);

  getThemeClass() {
    const game = this.ts.selectedGame();
    if (!game) return '';
    return 'theme-' + game;
  }
}
