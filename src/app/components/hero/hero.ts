import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';

import { HERO_CONFIG } from './hero.configuration';
import { UI_TEXT } from './hero.constants';

@Component({
  selector: 'app-hero',
  imports: [LazyImageDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly cvDataService = inject(CvDataService);

  protected readonly personalInfo = this.cvDataService.personalInfo;
  protected readonly profileImageUrl = computed(
    () => 'assets/images/lubomir_dobrovodsky.jpg',
  );

  protected readonly features = HERO_CONFIG.features;
  protected readonly text = UI_TEXT;

  protected scrollToContact(): void {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  protected scrollToNextSection(): void {
    document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' });
  }
}
