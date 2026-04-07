import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentService } from './tournament.service';
import { Player, Character } from './models';
import { tekkenRoster, mk11Roster, gh3Roster } from './rosters';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="registration-container">
      <div class="header">
        <h1>Tournament Setup</h1>
        <p>Register your competitors, upload avatars, and select their fighters.</p>
      </div>

      <div class="content">
        <!-- FORM PANEL -->
        <div class="form-panel">
          <h2>Add New Challenger</h2>
          
          <div class="form-group">
            <label>Player Name</label>
            <input type="text" [(ngModel)]="playerName" placeholder="e.g. Aranha">
          </div>
          
          <div class="form-group">
            <label>Player Avatar (From Computer)</label>
            <input type="file" accept="image/*" (change)="onAvatarSelected($event)">
            <div class="preview-avatar" *ngIf="playerAvatar">
              <img [src]="playerAvatar" alt="Preview">
            </div>
          </div>

          <div class="form-group">
            <div class="char-header">
              <label>Select Character</label>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search..." class="search-input">
            </div>
            <div class="character-grid">
              <div 
                *ngFor="let char of filteredRoster" 
                class="char-box"
                [class.selected]="selectedChar?.name === char.name"
                (click)="selectedChar = char">
                <img [src]="char.image" [alt]="char.name" (error)="char.image = 'https://placehold.co/150/111/fff?text=' + char.name">
                <span>{{ char.name }}</span>
              </div>
            </div>
          </div>

          <button class="btn-add" (click)="addParticipant()" [disabled]="!playerName || !selectedChar">Add Participant</button>
        </div>

        <!-- LIST PANEL -->
        <div class="list-panel">
          <h2>Registered ({{ ts.participants().length }})</h2>
          
          <div class="participants-list">
            <div *ngFor="let p of ts.participants()" class="participant-item">
              <img [src]="p.avatar" alt="avatar" class="sm-avatar">
              <div class="details">
                <strong>{{ p.name }}</strong>
                <span>{{ p.character.name }}</span>
              </div>
              <button class="btn-remove" (click)="ts.removeParticipant(p.id)">✖</button>
            </div>
            <div *ngIf="ts.participants().length === 0" class="empty-state">
              No participants yet. Enter at least 2.
            </div>
          </div>

          <button 
            class="btn-start" 
            [disabled]="ts.participants().length < 2"
            (click)="ts.generateBracket()">
            GENERATE BRACKET
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registration-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      color: #fff;
    }
    .header h1 {
      font-size: 4rem;
      text-transform: uppercase;
      color: var(--theme-primary);
      margin-bottom: -10px;
    }
    .content {
      display: flex;
      gap: 40px;
      margin-top: 30px;
    }
    .form-panel { flex: 2; }
    .list-panel { flex: 1; }
    
    .form-panel, .list-panel {
      background: rgba(20,20,25,0.9);
      padding: 30px;
      border: 1px solid #333;
      border-radius: 8px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    label {
      font-family: var(--font-secondary);
      font-size: 1.2rem;
      margin-bottom: 5px;
      color: #aaa;
      text-transform: uppercase;
    }
    input[type="text"], input[type="file"] {
      padding: 12px;
      background: #111;
      border: 1px solid #444;
      color: #fff;
      font-family: inherit;
      font-size: 1.1rem;
      transition: border 0.3s;
    }
    input[type="file"] { cursor: pointer; }
    input:focus {
      outline: none;
      border-color: var(--theme-secondary);
    }
    
    .char-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 5px;
    }
    .char-header label {
      margin-bottom: 0;
    }
    .search-input {
      width: 150px;
      padding: 6px 10px !important;
      font-size: 0.9rem !important;
    }
    .preview-avatar {
      margin-top: 10px;
      width: 80px; height: 80px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid var(--theme-secondary);
    }
    .preview-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 10px;
      margin-top: 10px;
      max-height: 250px;
      overflow-y: auto;
      padding-right: 5px;
    }
    .character-grid::-webkit-scrollbar { width: 6px; }
    .character-grid::-webkit-scrollbar-track { background: #111; border-radius: 4px; }
    .character-grid::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
    .character-grid::-webkit-scrollbar-thumb:hover { background: var(--neon-red); }
    .char-box {
      background: #000;
      border: 2px solid #333;
      border-radius: 5px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      overflow: hidden;
    }
    .char-box img { width: 100%; height: 60px; object-fit: cover; border-bottom: 1px solid #333; }
    .char-box span { display: block; font-size: 0.8rem; padding: 5px 0; font-family: var(--font-secondary); color: #ccc;}
    
    .char-box:hover { border-color: #888; transform: translateY(-2px); }
    .char-box.selected { border-color: var(--theme-primary); box-shadow: 0 0 15px var(--theme-primary); }
    .char-box.selected span { color: var(--theme-primary); font-weight: bold; }

    button {
      cursor: pointer;
      font-family: var(--font-primary);
      text-transform: uppercase;
      font-size: 1.5rem;
      padding: 10px 20px;
      border: none;
      transition: all 0.2s;
    }
    .btn-add {
      background: #222; color: #fff; border: 1px solid #444; width: 100%; margin-top: 10px;
    }
    .btn-add:not(:disabled):hover { background: #333; border-color: var(--text-light); }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .participant-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: rgba(0,0,0,0.4);
      margin-bottom: 10px;
      border-left: 3px solid var(--theme-secondary);
    }
    .sm-avatar {
      width: 40px; height: 40px;
      border-radius: 5px;
      object-fit: cover;
      margin-right: 15px;
    }
    .details { flex: 1; display: flex; flex-direction: column; }
    .details strong { font-size: 1.2rem; }
    .details span { font-size: 0.9rem; color: #888; font-family: var(--font-secondary); }
    .btn-remove { background: transparent; color: var(--theme-primary); font-size: 1.2rem; padding: 5px; border: none; }
    
    .participants-list { height: 420px; overflow-y: auto; margin-bottom: 20px; }
    .btn-start { width: 100%; background: var(--theme-primary); color: #fff; font-size: 2rem; border: none; }
    .btn-start:disabled { background: #333; color: #555; cursor: not-allowed; }
  `]
})
export class RegistrationComponent {
  ts = inject(TournamentService);

  playerName = '';
  playerAvatar = ''; // Now holds Base64 data URL
  selectedChar: Character | null = null;
  searchQuery = '';

  get currentRoster(): Character[] {
    const game = this.ts.selectedGame();
    if (game === 'mk11') return mk11Roster;
    if (game === 'gh3') return gh3Roster;
    return tekkenRoster;
  }

  get filteredRoster(): Character[] {
    const roster = this.currentRoster;
    if (!this.searchQuery) return roster;
    return roster.filter(c => c.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  /* Handlers */
  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.playerAvatar = e.target.result; // Data URL matching photo
      };
      reader.readAsDataURL(file);
    }
  }

  addParticipant() {
    if (!this.playerName || !this.selectedChar) return;

    // Fallback if no avatar uploaded: generated placeholder
    const finalAvatar = this.playerAvatar || ('https://placehold.co/150/222/fff?text=' + encodeURIComponent(this.playerName));

    const p: Player = {
      id: 'p' + Date.now(),
      name: this.playerName,
      avatar: finalAvatar,
      character: { ...this.selectedChar }
    };

    this.ts.addParticipant(p);

    this.playerName = '';
    this.playerAvatar = '';
    this.selectedChar = null;
  }
}
