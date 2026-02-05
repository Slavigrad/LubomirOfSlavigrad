import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-glass-list-card',
  imports: [],
  template: `
    <div class="p-4 md:p-5 rounded-xl border border-border/20 bg-background/60 glass-card">
      <h4 class="text-base md:text-lg font-semibold mb-1 text-foreground">{{ title }}</h4>
      @if (subtitle) {
        <div class="text-xs md:text-sm text-muted-foreground mb-2">{{ subtitle }}</div>
      }
      <ul class="space-y-1 max-h-64 overflow-auto pr-1">
        @for (item of items; track item) {
          <li class="text-sm md:text-base text-foreground">{{ item }}</li>
        }
      </ul>
    </div>
  `,
})
export class GlassListCardComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() items: string[] = [];
}

