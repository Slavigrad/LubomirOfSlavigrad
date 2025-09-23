import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PDFTemplateGalleryComponent } from '../../components/pdf/pdf-template-gallery.component';

@Component({
  selector: 'app-pdf-test',
  standalone: true,
  imports: [CommonModule, PDFTemplateGalleryComponent],
  template: `
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-foreground mb-8">PDF Template Gallery Test</h1>
        <p class="text-lg text-muted-foreground mb-8">
          This page tests the PDF template gallery component and preview functionality.
        </p>
        
        <!-- PDF Template Gallery Component -->
        <app-pdf-template-gallery></app-pdf-template-gallery>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PDFTestComponent {
  constructor() {
    console.log('PDF Test Component initialized');
  }
}
