import { describe, it, expect } from 'vitest';
import {
  calculateTotalExperience,
  computeOverallExperienceDates,
  groupSkillsByCategory,
  extractAllTechnologies,
  generateComputedStats,
} from './cv-data.utils';
import type { Skill, SkillCategory, Experience, Project, Position } from './cv-data.interface';

describe('computeOverallExperienceDates', () => {
  it('returns dates from legacy fields when no positions', () => {
    const exp = {
      startDate: new Date('2020-01-01'),
      endDate: new Date('2022-12-31'),
    } as unknown as Experience;
    const result = computeOverallExperienceDates(exp);
    expect(result.startDate).toEqual(new Date('2020-01-01'));
    expect(result.endDate).toEqual(new Date('2022-12-31'));
  });

  it('computes dates from positions when present', () => {
    const exp = {
      positions: [
        {
          startDate: new Date('2019-06-01'),
          endDate: new Date('2021-03-01'),
        } as unknown as Position,
        {
          startDate: new Date('2021-04-01'),
          endDate: new Date('2023-01-01'),
        } as unknown as Position,
      ],
    } as unknown as Experience;
    const result = computeOverallExperienceDates(exp);
    expect(result.startDate).toEqual(new Date('2019-06-01'));
    expect(result.endDate).toEqual(new Date('2023-01-01'));
  });

  it('returns null endDate when any position is current', () => {
    const exp = {
      positions: [{ startDate: new Date('2020-01-01'), endDate: null } as unknown as Position],
    } as unknown as Experience;
    const result = computeOverallExperienceDates(exp);
    expect(result.endDate).toBeNull();
  });

  it('returns default startDate for empty positions', () => {
    const exp = { positions: [] } as unknown as Experience;
    const result = computeOverallExperienceDates(exp);
    expect(result.startDate).toBeInstanceOf(Date);
  });
});

describe('calculateTotalExperience', () => {
  it('returns 0 for empty array', () => {
    expect(calculateTotalExperience([])).toBe(0);
  });

  it('calculates single experience correctly', () => {
    const experiences = [
      {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-12-31'),
      } as unknown as Experience,
    ];
    expect(calculateTotalExperience(experiences)).toBeCloseTo(3, 0);
  });

  it('merges overlapping periods', () => {
    const experiences = [
      {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-01'),
      } as unknown as Experience,
      {
        startDate: new Date('2021-01-01'),
        endDate: new Date('2023-01-01'),
      } as unknown as Experience,
    ];
    // overlap: 2020-01-01 to 2023-01-01 = 3 years
    expect(calculateTotalExperience(experiences)).toBe(3);
  });

  it('merges overlapping periods', () => {
    const experiences = [
      {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-06-01'),
      } as unknown as Experience,
      {
        startDate: new Date('2021-01-01'),
        endDate: new Date('2023-01-01'),
      } as unknown as Experience,
    ];
    // overlap: 2020-01-01 to 2023-01-01 = 3 years
    expect(calculateTotalExperience(experiences)).toBe(3);
  });

  it('sums non-overlapping periods', () => {
    const experiences = [
      {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2021-01-01'),
      } as unknown as Experience,
      {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-01-01'),
      } as unknown as Experience,
    ];
    // 12 months + 12 months = 24 months / 12 = 2 years
    expect(calculateTotalExperience(experiences)).toBe(2);
  });

  it('handles current (ongoing) experience', () => {
    const experiences = [
      { startDate: new Date('2020-01-01'), endDate: null } as unknown as Experience,
    ];
    const result = calculateTotalExperience(experiences);
    expect(result).toBeGreaterThan(0);
  });
});

describe('groupSkillsByCategory', () => {
  const skills: Skill[] = [
    {
      id: '1',
      name: 'Angular',
      level: 'expert',
      category: 'Frontend',
      years: 6,
    } as unknown as Skill,
    {
      id: '2',
      name: 'React',
      level: 'advanced',
      category: 'Frontend',
      years: 4,
    } as unknown as Skill,
    {
      id: '3',
      name: 'Node.js',
      level: 'expert',
      category: 'Backend',
      years: 8,
    } as unknown as Skill,
    {
      id: '4',
      name: 'TypeScript',
      level: 'master',
      category: 'Frontend',
      years: 7,
    } as unknown as Skill,
  ];

  it('groups skills by category', () => {
    const result = groupSkillsByCategory(skills);
    expect(result).toHaveLength(2);
    expect(result.find((c) => c.category === 'Frontend')).toBeDefined();
    expect(result.find((c) => c.category === 'Backend')).toBeDefined();
  });

  it('sorts skills by level descending then years descending', () => {
    const frontend = groupSkillsByCategory(skills).find((c) => c.category === 'Frontend')!;
    // master > expert > advanced
    expect(frontend.skills[0].name).toBe('TypeScript'); // master, 7y
    expect(frontend.skills[1].name).toBe('Angular'); // expert, 6y
    expect(frontend.skills[2].name).toBe('React'); // advanced, 4y
  });

  it('assigns cyclic colors', () => {
    const result = groupSkillsByCategory(skills);
    expect(result[0].color).toBe('primary');
    expect(result[1].color).toBe('secondary');
  });

  it('generates category id from name', () => {
    const result = groupSkillsByCategory(skills);
    expect(result[0].id).toBe('category-frontend');
    expect(result[1].id).toBe('category-backend');
  });

  it('sets display_order by index', () => {
    const result = groupSkillsByCategory(skills);
    expect(result[0].display_order).toBe(0);
    expect(result[1].display_order).toBe(1);
  });

  it('returns empty array for no skills', () => {
    expect(groupSkillsByCategory([])).toEqual([]);
  });
});

describe('extractAllTechnologies', () => {
  it('extracts from experience technologies field', () => {
    const data = {
      experiences: [{ technologies: ['Angular', 'TypeScript'] }] as unknown as Experience[],
      projects: [],
    } as unknown as Parameters<typeof extractAllTechnologies>[0];
    const result = extractAllTechnologies(data);
    expect(result).toContain('Angular');
    expect(result).toContain('TypeScript');
  });

  it('extracts from position technologies', () => {
    const data = {
      experiences: [
        {
          positions: [{ technologies: ['Node.js', 'PostgreSQL'] } as unknown as Position],
        },
      ] as unknown as Experience[],
      projects: [],
    } as unknown as Parameters<typeof extractAllTechnologies>[0];
    const result = extractAllTechnologies(data);
    expect(result).toContain('Node.js');
    expect(result).toContain('PostgreSQL');
  });

  it('extracts from project technologies', () => {
    const data = {
      experiences: [],
      projects: [{ technologies: ['Docker', 'Kubernetes'] }] as unknown as Project[],
    } as unknown as Parameters<typeof extractAllTechnologies>[0];
    const result = extractAllTechnologies(data);
    expect(result).toContain('Docker');
    expect(result).toContain('Kubernetes');
  });

  it('deduplicates across sources', () => {
    const data = {
      experiences: [
        {
          technologies: ['Angular'],
          positions: [{ technologies: ['Angular', 'Node.js'] } as unknown as Position],
        } as unknown as Experience,
      ],
      projects: [{ technologies: ['Angular', 'TypeScript'] }] as unknown as Project[],
    } as unknown as Parameters<typeof extractAllTechnologies>[0];
    const result = extractAllTechnologies(data);
    expect(result.filter((t) => t === 'Angular')).toHaveLength(1);
  });

  it('returns sorted array', () => {
    const data = {
      experiences: [{ technologies: ['Zebra', 'Alpha'] }] as unknown as Experience[],
      projects: [],
    } as unknown as Parameters<typeof extractAllTechnologies>[0];
    const result = extractAllTechnologies(data);
    expect(result).toEqual(['Alpha', 'Zebra']);
  });

  it('returns empty array when no technologies', () => {
    const data = { experiences: [], projects: [] } as unknown as Parameters<
      typeof extractAllTechnologies
    >[0];
    expect(extractAllTechnologies(data)).toEqual([]);
  });
});

describe('generateComputedStats', () => {
  const mockData = {
    experiences: [
      {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      } as unknown as Experience,
      { startDate: new Date('2024-01-01'), endDate: null } as unknown as Experience,
    ],
    projects: [
      { technologies: ['A'], featured: true, status: 'completed' } as unknown as Project,
      { technologies: ['B'], featured: false, status: 'in-progress' } as unknown as Project,
    ],
    skills: [
      { level: 'expert' } as unknown as Skill,
      { level: 'master' } as unknown as Skill,
      { level: 'beginner' } as unknown as Skill,
    ],
  } as unknown as Parameters<typeof generateComputedStats>[0];

  it('computes totalExperienceYears from experiences', () => {
    const stats = generateComputedStats(mockData);
    expect(stats.totalExperienceYears).toBeGreaterThan(0);
  });

  it('counts total projects', () => {
    const stats = generateComputedStats(mockData);
    expect(stats.totalProjects).toBe(2);
  });

  it('counts total skills', () => {
    const stats = generateComputedStats(mockData);
    expect(stats.totalSkills).toBe(3);
  });

  it('counts expert + master skills', () => {
    const stats = generateComputedStats(mockData);
    expect(stats.expertSkills).toBe(2);
  });
});
