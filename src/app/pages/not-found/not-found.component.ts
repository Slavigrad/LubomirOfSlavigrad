import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-pulse-glow animate-float"></div>
        <div class="absolute top-40 right-32 w-3 h-3 bg-accent rounded-full animate-pulse-glow animate-float-delay"></div>
        <div class="absolute bottom-32 left-1/4 w-1 h-1 bg-secondary rounded-full animate-pulse-glow animate-float"></div>
        <div class="absolute bottom-20 right-20 w-2 h-2 bg-primary rounded-full animate-pulse-glow animate-float-delay"></div>
      </div>

      <div class="text-center relative z-10 max-w-2xl mx-auto px-6">
        <div class="glass-card p-12 rounded-2xl">
          <!-- 404 Number -->
          <div class="mb-8">
            <h1 class="text-9xl font-bold gradient-text mb-4 animate-slide-in-up">404</h1>
            <h2 class="text-3xl font-semibold text-foreground mb-4 animate-slide-in-up">
              Lost in the Digital Realm
            </h2>
            <p class="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed animate-slide-in-up">
              The path you seek does not exist in the Chronicles of Slavigrad. 
              Perhaps the Oracle can guide you back to familiar territory.
            </p>
          </div>
          
          <!-- Navigation Options -->
          <div class="space-y-6 animate-slide-in-up">
            <a 
              routerLink="/" 
              class="inline-block px-8 py-3 bg-gradient-primary text-primary-foreground font-semibold rounded-lg btn-glow transition-all duration-300 hover:scale-105">
              🏰 Return to the Citadel
            </a>
            
            <div class="text-sm text-muted-foreground">
              <p class="mb-4">Or explore these mystical realms:</p>
              <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <a 
                  routerLink="/" 
                  fragment="skills" 
                  class="glass-card p-3 rounded-lg hover:glow-primary transition-all duration-300 hover:scale-105 group">
                  <div class="text-primary group-hover:text-primary-glow transition-colors">📜 The Codex</div>
                  <div class="text-xs text-muted-foreground">Skills & Arsenal</div>
                </a>
                
                <a 
                  routerLink="/" 
                  fragment="experience" 
                  class="glass-card p-3 rounded-lg hover:glow-primary transition-all duration-300 hover:scale-105 group">
                  <div class="text-secondary group-hover:text-secondary-glow transition-colors">🏛️ Hall of Records</div>
                  <div class="text-xs text-muted-foreground">Career Journey</div>
                </a>
                
                <a 
                  routerLink="/" 
                  fragment="projects" 
                  class="glass-card p-3 rounded-lg hover:glow-primary transition-all duration-300 hover:scale-105 group">
                  <div class="text-accent group-hover:text-accent-glow transition-colors">🏪 Marketplace</div>
                  <div class="text-xs text-muted-foreground">Projects & Demos</div>
                </a>
                
                <a 
                  routerLink="/" 
                  fragment="contact" 
                  class="glass-card p-3 rounded-lg hover:glow-primary transition-all duration-300 hover:scale-105 group">
                  <div class="text-primary group-hover:text-primary-glow transition-colors">🔮 Oracle's Chamber</div>
                  <div class="text-xs text-muted-foreground">Get in Touch</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .animate-slide-in-up {
      animation: slideInUp 0.6s ease-out;
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class NotFoundComponent {
  constructor() {}
}
