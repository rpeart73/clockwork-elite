import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { differenceInBusinessDays, isValid, parseISO } from 'date-fns';

/**
 * Enterprise-grade Case Note entity with comprehensive validation
 * This entity is immutable and self-validating
 */

// Validation schemas
// const EmailHeaderSchema = z.object({
//   from: z.string().email('Invalid email format'),
//   to: z.string().email('Invalid email format'),
//   subject: z.string().min(1, 'Subject cannot be empty'),
//   date: z.string().datetime('Invalid date format'),
//   messageId: z.string().optional(),
//   inReplyTo: z.string().optional()
// });

const PointOfContactSchema = z.object({
  id: z.string().uuid('Invalid POC ID'),
  date: z.string().datetime('Invalid date format'),
  type: z.enum(['email', 'meeting', 'call', 'chat', 'other']),
  exchangeCount: z.number().int().positive('Exchange count must be positive'),
  duration: z.number().optional(), // in minutes
  participants: z.array(z.string()).min(1, 'At least one participant required'),
  context: z.string().min(1, 'Context cannot be empty'),
  metadata: z.record(z.unknown()).optional()
});

const CaseNoteContextSchema = z.object({
  topics: z.array(z.string()).min(1, 'At least one topic required'),
  questions: z.array(z.string()).default([]),
  actions: z.array(z.string()).default([]),
  followUp: z.array(z.string()).default([]),
  additionalDetails: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'urgent']).default('neutral'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

const CaseNoteSchema = z.object({
  id: z.string().uuid('Invalid case note ID'),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  createdAt: z.string().datetime('Invalid creation date'),
  updatedAt: z.string().datetime('Invalid update date'),
  serviceType: z.enum([
    'email_support',
    'academic_support',
    'technical_support',
    'research_assistance',
    'project_work',
    'consultation',
    'other'
  ]),
  pointsOfContact: z.array(PointOfContactSchema).min(1, 'At least one POC required'),
  context: CaseNoteContextSchema,
  noteStyle: z.enum(['natural', 'bullets', 'concise']).default('natural'),
  detailLevel: z.enum(['basic', 'standard', 'enhanced', 'comprehensive']).default('standard'),
  language: z.enum(['en-CA', 'en-GB', 'en-US', 'fr-CA']).default('en-CA'),
  originalContent: z.string().optional(),
  generatedNotes: z.string().optional(),
  version: z.number().int().positive().default(1),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().positive(),
    url: z.string().url()
  })).default([]),
  audit: z.object({
    createdBy: z.string(),
    updatedBy: z.string(),
    department: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional()
  })
});

export type CaseNoteData = z.infer<typeof CaseNoteSchema>;
export type PointOfContact = z.infer<typeof PointOfContactSchema>;
export type CaseNoteContext = z.infer<typeof CaseNoteContextSchema>;

export class CaseNote {
  private readonly data: Readonly<CaseNoteData>;
  
  private constructor(data: CaseNoteData) {
    // Validate and freeze the data to ensure immutability
    this.data = Object.freeze(CaseNoteSchema.parse(data));
  }
  
  /**
   * Factory method to create a new CaseNote with validation
   */
  static create(params: {
    studentId: string;
    studentName: string;
    serviceType: CaseNoteData['serviceType'];
    pointsOfContact: Array<Omit<PointOfContact, 'id'>>;
    context: CaseNoteContext;
    noteStyle?: CaseNoteData['noteStyle'];
    detailLevel?: CaseNoteData['detailLevel'];
    language?: CaseNoteData['language'];
    originalContent?: string;
    createdBy: string;
    department?: string;
  }): CaseNote {
    const now = new Date().toISOString();
    
    // Generate IDs for POCs
    const pointsOfContact = params.pointsOfContact.map(poc => ({
      ...poc,
      id: uuidv4()
    }));
    
    // Validate POC dates are not in the future
    const hasValidDates = pointsOfContact.every(poc => {
      const pocDate = parseISO(poc.date);
      return isValid(pocDate) && pocDate <= new Date();
    });
    
    if (!hasValidDates) {
      throw new Error('POC dates cannot be in the future');
    }
    
    // Sort POCs by date
    pointsOfContact.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const caseNoteData: CaseNoteData = {
      id: uuidv4(),
      studentId: params.studentId,
      studentName: params.studentName,
      createdAt: now,
      updatedAt: now,
      serviceType: params.serviceType,
      pointsOfContact,
      context: params.context,
      noteStyle: params.noteStyle || 'natural',
      detailLevel: params.detailLevel || 'standard',
      language: params.language || 'en-CA',
      originalContent: params.originalContent,
      generatedNotes: undefined,
      version: 1,
      tags: this.generateTags(params.context, params.serviceType),
      attachments: [],
      audit: {
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
        department: params.department,
        ipAddress: undefined, // Set by API
        userAgent: undefined  // Set by API
      }
    };
    
    return new CaseNote(caseNoteData);
  }
  
  /**
   * Creates a new version of the case note with updates
   */
  update(params: {
    context?: Partial<CaseNoteContext>;
    noteStyle?: CaseNoteData['noteStyle'];
    detailLevel?: CaseNoteData['detailLevel'];
    updatedBy: string;
  }): CaseNote {
    const updatedData: CaseNoteData = {
      ...this.data,
      updatedAt: new Date().toISOString(),
      version: this.data.version + 1,
      audit: {
        ...this.data.audit,
        updatedBy: params.updatedBy
      }
    };
    
    if (params.context) {
      updatedData.context = {
        ...this.data.context,
        ...params.context
      };
      updatedData.tags = CaseNote.generateTags(updatedData.context, this.data.serviceType);
    }
    
    if (params.noteStyle) {
      updatedData.noteStyle = params.noteStyle;
    }
    
    if (params.detailLevel) {
      updatedData.detailLevel = params.detailLevel;
    }
    
    return new CaseNote(updatedData);
  }
  
  /**
   * Generates the case note text based on style and detail level
   */
  generateNotes(): string {
    switch (this.data.noteStyle) {
      case 'natural':
        return this.generateNaturalNotes();
      case 'bullets':
        return this.generateBulletNotes();
      case 'concise':
        return this.generateConciseNotes();
      default:
        return this.generateNaturalNotes();
    }
  }
  
  private generateNaturalNotes(): string {
    const notes: string[] = [];
    
    this.data.pointsOfContact.forEach((poc, index) => {
      const date = new Date(poc.date).toLocaleDateString('en-CA');
      const hours = poc.duration ? (poc.duration / 60).toFixed(1) : '1.0';
      
      // Header
      notes.push(`${date} | ${this.formatServiceType()} | ${hours} hours | Academic Support | ${this.data.studentName}`);
      notes.push('');
      
      // Objective section
      notes.push('OBJECTIVE:');
      if (this.data.context.topics.length > 0) {
        notes.push(`${this.data.studentName} contacted regarding ${this.formatList(this.data.context.topics)}.`);
      }
      if (this.data.context.questions.length > 0) {
        notes.push(`Student inquired about ${this.formatList(this.data.context.questions)}.`);
      }
      notes.push('');
      
      // What Transpired section
      notes.push('WHAT TRANSPIRED:');
      if (this.data.context.actions.length > 0) {
        notes.push(this.formatList(this.data.context.actions, '. '));
      } else {
        notes.push(`Reviewed the ${poc.type} and provided comprehensive assistance.`);
      }
      if (this.data.context.additionalDetails) {
        notes.push(this.data.context.additionalDetails);
      }
      notes.push('');
      
      // Outcome/Plan section
      notes.push('OUTCOME/PLAN:');
      if (this.data.context.followUp.length > 0) {
        notes.push(this.formatList(this.data.context.followUp, '. '));
      } else {
        notes.push('Issue resolved. Student satisfied with the assistance provided.');
      }
      
      // Add separator between POCs
      if (index < this.data.pointsOfContact.length - 1) {
        notes.push('');
        notes.push('='.repeat(80));
        notes.push('');
      }
    });
    
    // Add original content if email
    if (this.data.originalContent && this.data.serviceType === 'email_support') {
      notes.push('');
      notes.push('-'.repeat(80));
      notes.push('ORIGINAL EMAIL:');
      notes.push('');
      notes.push(this.data.originalContent);
      notes.push('-'.repeat(80));
    }
    
    return notes.join('\n');
  }
  
  private generateBulletNotes(): string {
    // Implementation for bullet-style notes
    // const bulletCount = this.getBulletCount();
    // ... bullet implementation
    return ''; // Placeholder
  }
  
  private generateConciseNotes(): string {
    // Implementation for concise notes
    // ... concise implementation
    return ''; // Placeholder
  }
  
  private formatServiceType(): string {
    return this.data.serviceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  private formatList(items: string[], separator = ', '): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0] || '';
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    
    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return `${otherItems.join(separator)}${separator}and ${lastItem}`;
  }
  
  private static generateTags(
    context: CaseNoteContext,
    serviceType: string
  ): string[] {
    const tags = new Set<string>();
    
    // Add service type
    tags.add(serviceType);
    
    // Add priority
    tags.add(`priority:${context.priority}`);
    
    // Add sentiment
    if (context.sentiment !== 'neutral') {
      tags.add(`sentiment:${context.sentiment}`);
    }
    
    // Extract keywords from topics
    context.topics.forEach(topic => {
      const keywords = topic.toLowerCase().split(/\s+/);
      keywords.forEach(keyword => {
        if (keyword.length > 3) {
          tags.add(keyword);
        }
      });
    });
    
    return Array.from(tags);
  }
  
  // Getters for accessing data
  get id(): string { return this.data.id; }
  get studentId(): string { return this.data.studentId; }
  get studentName(): string { return this.data.studentName; }
  get createdAt(): Date { return new Date(this.data.createdAt); }
  get updatedAt(): Date { return new Date(this.data.updatedAt); }
  get serviceType(): string { return this.data.serviceType; }
  get pointsOfContact(): ReadonlyArray<PointOfContact> { return this.data.pointsOfContact; }
  get context(): Readonly<CaseNoteContext> { return this.data.context; }
  get tags(): ReadonlyArray<string> { return this.data.tags; }
  get version(): number { return this.data.version; }
  
  /**
   * Calculates business metrics
   */
  getMetrics() {
    const firstContact = new Date(this.data.pointsOfContact[0]?.date || new Date());
    const lastContact = new Date(this.data.pointsOfContact[this.data.pointsOfContact.length - 1]?.date || new Date());
    
    return {
      totalContacts: this.data.pointsOfContact.length,
      totalExchanges: this.data.pointsOfContact.reduce((sum, poc) => sum + poc.exchangeCount, 0),
      durationDays: differenceInBusinessDays(lastContact, firstContact) + 1,
      averageResponseTime: this.calculateAverageResponseTime(),
      complexity: this.calculateComplexity()
    };
  }
  
  private calculateAverageResponseTime(): number {
    // Implementation would calculate average time between exchanges
    return 0; // Placeholder
  }
  
  private calculateComplexity(): 'low' | 'medium' | 'high' {
    const factors = {
      exchanges: this.data.pointsOfContact.reduce((sum, poc) => sum + poc.exchangeCount, 0),
      topics: this.data.context.topics.length,
      questions: this.data.context.questions.length,
      priority: this.data.context.priority === 'critical' ? 3 : this.data.context.priority === 'high' ? 2 : 1
    };
    
    const score = factors.exchanges + factors.topics + factors.questions + factors.priority;
    
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }
  
  /**
   * Exports the case note to different formats
   */
  export(format: 'json' | 'text' | 'markdown' | 'pdf'): string | Blob {
    switch (format) {
      case 'json':
        return JSON.stringify(this.data, null, 2);
      case 'text':
        return this.generateNotes();
      case 'markdown':
        return this.exportAsMarkdown();
      case 'pdf':
        return this.exportAsPDF();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  private exportAsMarkdown(): string {
    // Markdown export implementation
    return ''; // Placeholder
  }
  
  private exportAsPDF(): Blob {
    // PDF export implementation
    return new Blob(); // Placeholder
  }
}