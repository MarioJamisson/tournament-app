import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService, GameType } from './tournament.service';

@Component({
  selector: 'app-game-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-select-container">
      <div class="header">
        <h1>Select Tournament Game</h1>
        <p>Choose the game you are hosting to configure rosters and themes.</p>
      </div>

      <div class="games-grid">
        <div class="game-card tekken" (click)="selectGame('tekken')">
          <div class="overlay"></div>
          <h2>Tekken 8</h2>
          <span class="btn">Select</span>
        </div>
        
        <div class="game-card mk11" (click)="selectGame('mk11')">
          <div class="overlay"></div>
          <h2>Mortal Kombat 11</h2>
          <span class="btn">Select</span>
        </div>
        
        <div class="game-card gh3" (click)="selectGame('gh3')">
          <div class="overlay"></div>
          <h2>Guitar Hero III</h2>
          <span class="btn">Select</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-select-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 40px;
      color: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 50px;
    }
    .header h1 {
      font-size: 4rem;
      text-transform: uppercase;
      color: var(--theme-primary, #ff003c);
      margin-bottom: -10px;
    }
    .header p {
      font-size: 1.2rem;
      color: #aaa;
      font-family: var(--font-secondary);
    }
    
    .games-grid {
      display: flex;
      gap: 30px;
      max-width: 1200px;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .game-card {
      position: relative;
      flex: 1;
      min-width: 280px;
      max-width: 350px;
      height: 400px;
      background: #111;
      border: 2px solid #333;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s;
    }
    
    .game-card h2 {
      font-size: 3rem;
      text-transform: uppercase;
      z-index: 2;
      text-align: center;
      padding: 20px;
      text-shadow: 2px 2px 5px rgba(0,0,0,0.8);
    }
    
    .btn {
      z-index: 2;
      font-family: var(--font-primary);
      text-transform: uppercase;
      font-size: 1.5rem;
      padding: 10px 20px;
      background: rgba(0,0,0,0.6);
      border: 1px solid #fff;
      transition: all 0.2s;
      opacity: 0;
      transform: translateY(20px);
    }
    
    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 100%);
      transition: all 0.3s;
      z-index: 1;
    }

    /* Specific Game Card styling */
    .game-card.tekken { border-color: #ff003c; }
    .game-card.tekken h2 { color: #00e5ff; }
    
    .game-card.mk11 { border-color: #ffd700; }
    .game-card.mk11 h2 { color: #ffd700; }
    
    .game-card.gh3 { border-color: #32cd32; }
    .game-card.gh3 h2 { color: #ff4500; }

    /* Hover effects */
    .game-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .game-card:hover .btn {
      opacity: 1;
      transform: translateY(0);
    }
    .game-card.tekken:hover { box-shadow: 0 0 30px rgba(255, 0, 60, 0.4); }
    .game-card.mk11:hover { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4); }
    .game-card.gh3:hover { box-shadow: 0 0 30px rgba(50, 205, 50, 0.4); }
    
    .game-card.tekken:hover .btn { background: #ff003c; border-color: #ff003c; }
    .game-card.mk11:hover .btn { background: #b8860b; border-color: #b8860b; }
    .game-card.gh3:hover .btn { background: #ff4500; border-color: #ff4500; }
  `]
})
export class GameSelectComponent {
  ts = inject(TournamentService);

  selectGame(game: GameType) {
    this.ts.selectedGame.set(game);
    this.ts.currentView.set('register');
  }
}
