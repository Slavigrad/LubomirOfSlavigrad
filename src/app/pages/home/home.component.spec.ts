import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render all section components', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-hero')).toBeTruthy();
    expect(el.querySelector('app-stats')).toBeTruthy();
    expect(el.querySelector('app-skills')).toBeTruthy();
    expect(el.querySelector('app-experience')).toBeTruthy();
    expect(el.querySelector('app-projects')).toBeTruthy();
    expect(el.querySelector('app-contact')).toBeTruthy();
  });
});
