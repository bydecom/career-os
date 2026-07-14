export enum NodeType {
  Technology = 'technology',
  Project = 'project',
  Experience = 'experience',
  Company = 'company',
  Decision = 'decision',
  Achievement = 'achievement',
  Pattern = 'pattern',
  Metric = 'metric',
  Evidence = 'evidence',
  Concept = 'concept',
  Research = 'research',
  Book = 'book',
  Article = 'article',
  Certificate = 'certificate',
  Person = 'person',
  /** Presentation node for resume/portfolio header. May merge into Person in v2. */
  Profile = 'profile',
  Organization = 'organization',
  Award = 'award',
  Presentation = 'presentation',
  Publication = 'publication',
  Patent = 'patent',
  Course = 'course',
  Event = 'event',
  Repository = 'repository',
}

export enum EdgeType {
  // Structural
  CONTAINS = 'CONTAINS',
  BELONGS_TO = 'BELONGS_TO',
  PART_OF = 'PART_OF',

  // Semantic
  USES = 'USES',
  IMPLEMENTS = 'IMPLEMENTS',
  SOLVES = 'SOLVES',
  DEPENDS_ON = 'DEPENDS_ON',
  INSPIRED_BY = 'INSPIRED_BY',
  RELATED_TO = 'RELATED_TO',
  ENABLES = 'ENABLES',

  // Evidence
  PROVES = 'PROVES',
  VALIDATES = 'VALIDATES',
  REFERENCES = 'REFERENCES',
  MEASURED_BY = 'MEASURED_BY',
  PRODUCED = 'PRODUCED',

  // Temporal
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  PRECEDES = 'PRECEDES',

  // Inheritance
  IS_A = 'IS_A',
}
