import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format } from 'date-fns';
import { DateExtractor } from '@/modules/date-extraction';
import { POCConsolidator, PointOfContact } from '@/modules/poc-consolidation';
import { InputSanitizer } from '@/modules/input-sanitization';

/**
 * Application state management - Single source of truth
 * Handles all state mutations with automatic persistence
 */

interface WorkflowState {
  state: 'idle' | 'analyzing' | 'ready' | 'generating' | 'complete';
  progress: number;
  message: string;
}

type AppStateData = {
  // Content
  universalInput: string;
  contentType: 'email' | 'task' | 'auto-detect';
  currentMode: 'auto-detect' | 'email' | 'task';
  
  // Email specific
  detectedPOCs: PointOfContact[];
  hasLastDate: boolean;
  
  // Form data
  studentName: string;
  serviceType: string;
  noteStyle: 'natural' | 'bullets' | 'concise';
  detailLevel: 'basic' | 'standard' | 'enhanced';
  language: 'canadian' | 'british';
  
  // Task specific
  startDate: string;
  endDate: string;
  totalDaysWorked: number;
  distributionPattern: 'equal' | 'frontLoaded' | 'backLoaded' | 'ascending' | 'descending';
  timeOfDay: string;
  hoursPerDay: number;
  
  // Workflow
  workflow: WorkflowState;
  
  // Context for note generation
  noteContext: {
    topics: string;
    questions: string;
    actions: string;
    followUp: string;
    additional: string;
  } | null;
  
  // Output
  generatedOutput: string;
  
  // Draft
  lastSavedDraft: string;
  draftTimestamp: string | null;
};

type AppStateActions = {
  setUniversalInput: (input: string) => void;
  setCurrentMode: (mode: 'auto-detect' | 'email' | 'task') => void;
  analyzeContent: () => void;
  setStudentName: (name: string) => void;
  setNoteContext: (context: AppStateData['noteContext']) => void;
  generateEntries: () => Promise<string>;
  generateOutput: () => string;
  setServiceType: (serviceType: string) => void;
  setNoteStyle: (noteStyle: 'natural' | 'bullets' | 'concise') => void;
  setDetailLevel: (detailLevel: 'basic' | 'standard' | 'enhanced') => void;
  setLanguage: (language: 'canadian' | 'british') => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setTotalDaysWorked: (totalDaysWorked: number) => void;
  setDistributionPattern: (distributionPattern: 'equal' | 'frontLoaded' | 'backLoaded' | 'ascending' | 'descending') => void;
  copyToClipboard: () => Promise<void>;
  saveAsDraft: () => void;
  resetAll: () => void;
  clearAll: () => void;
  restoreDraft: (draft: Partial<AppState>) => void;
  updateWorkflow: (update: Partial<WorkflowState>) => void;
};

type AppState = AppStateData & AppStateActions;

const initialState: AppStateData = {
  universalInput: '',
  contentType: 'auto-detect',
  currentMode: 'auto-detect',
  detectedPOCs: [],
  hasLastDate: false,
  studentName: '',
  serviceType: 'Email Support',
  noteStyle: 'natural',
  detailLevel: 'standard',
  language: 'canadian',
  startDate: new Date().toISOString().split('T')[0] as string,
  endDate: new Date().toISOString().split('T')[0] as string,
  totalDaysWorked: 0,
  distributionPattern: 'equal',
  timeOfDay: 'early_morning',
  hoursPerDay: 5,
  workflow: {
    state: 'idle',
    progress: 0,
    message: 'Ready for input'
  },
  noteContext: null,
  generatedOutput: '',
  lastSavedDraft: '',
  draftTimestamp: null
};


export const useAppStore = create<AppState>()(
  persist<AppState>(
    (set, get) => ({
      ...initialState,

      setUniversalInput: (input: string) => {
        const sanitized = InputSanitizer.sanitizeEmailContent(input);
        set({ 
          universalInput: sanitized,
          draftTimestamp: new Date().toISOString()
        });
        
        // Auto-analyze if content present
        if (sanitized.trim()) {
          get().analyzeContent();
        }
      },

      setCurrentMode: (mode) => set({ currentMode: mode }),

      analyzeContent: () => {
        const { universalInput, currentMode } = get();
        
        set({
          workflow: {
            state: 'analyzing',
            progress: 30,
            message: 'Analyzing content...'
          }
        });

        // Detect content type
        let contentType = currentMode;
        if (currentMode === 'auto-detect') {
          const detected = InputSanitizer.detectContentType(universalInput);
          contentType = detected === 'unknown' ? 'task' : detected;
        }

        if (contentType === 'email') {
          // Extract dates
          const dates = DateExtractor.extractDates(universalInput);
          const hasLastDate = DateExtractor.hasLastDateMarker(universalInput);
          
          // Consolidate POCs
          const pocs = POCConsolidator.consolidate(dates, universalInput, hasLastDate);
          
          // Extract student name from email
          const senderMatch = universalInput.match(/From:\s*([^<\n]+)/i);
          const studentName = senderMatch?.[1] ? 
            InputSanitizer.sanitizeStudentName(senderMatch[1].trim().split(' ')[0] || '') : '';

          set({
            contentType: 'email',
            detectedPOCs: pocs,
            hasLastDate,
            studentName,
            workflow: {
              state: 'ready',
              progress: 60,
              message: 'Ready to generate'
            }
          });
        } else {
          set({
            contentType: 'task',
            workflow: {
              state: 'ready',
              progress: 60,
              message: 'Ready to generate'
            }
          });
        }
      },

      setStudentName: (name: string) => {
        const sanitized = InputSanitizer.sanitizeStudentName(name);
        set({ studentName: sanitized });
      },

      setNoteContext: (context) => set({ noteContext: context }),

      generateEntries: async () => {
        const state = get();
        
        set({
          workflow: {
            state: 'generating',
            progress: 80,
            message: 'Generating entries...'
          }
        });

        let output = '';

        if (state.contentType === 'email') {
          output = generateCaseNotes(state);
        } else {
          output = generateTasks(state);
        }

        set({
          workflow: {
            state: 'complete',
            progress: 100,
            message: 'Generation complete'
          }
        });

        return output;
      },

      generateOutput: () => {
        const state = get();
        let output = '';

        if (state.contentType === 'email') {
          output = generateCaseNotes(state);
        } else if (state.currentMode === 'task') {
          output = generateTasks(state);
        }

        set({ generatedOutput: output });
        return output;
      },

      setServiceType: (serviceType: string) => set({ serviceType }),
      setNoteStyle: (noteStyle: 'natural' | 'bullets' | 'concise') => set({ noteStyle }),
      setDetailLevel: (detailLevel: 'basic' | 'standard' | 'enhanced') => set({ detailLevel }),
      setLanguage: (language: 'canadian' | 'british') => set({ language }),
      setStartDate: (startDate: string) => set({ startDate }),
      setEndDate: (endDate: string) => set({ endDate }),
      setTotalDaysWorked: (totalDaysWorked: number) => set({ totalDaysWorked }),
      setDistributionPattern: (distributionPattern: 'equal' | 'frontLoaded' | 'backLoaded' | 'ascending' | 'descending') => set({ distributionPattern }),
      
      copyToClipboard: async () => {
        const state = get();
        if (state.generatedOutput) {
          await navigator.clipboard.writeText(state.generatedOutput);
          set({
            workflow: {
              state: 'complete',
              progress: 100,
              message: 'Copied to clipboard!'
            }
          });
        }
      },
      
      saveAsDraft: () => {
        const state = get();
        set({
          lastSavedDraft: state.generatedOutput || '',
          draftTimestamp: new Date().toISOString()
        });
      },
      
      resetAll: () => set(() => initialState),
      clearAll: () => set(() => initialState),

      restoreDraft: (draft) => set({ ...draft }),

      updateWorkflow: (update) => set(state => ({
        workflow: { ...state.workflow, ...update }
      }))
    }),
    {
      name: 'clockwork-elite-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// Note generation functions (extracted from original)
function generateCaseNotes(state: AppState): string {
  const { 
    detectedPOCs, 
    studentName, 
    serviceType, 
    noteStyle, 
    // detailLevel,
    noteContext,
    universalInput
  } = state;

  let output = '';

  // Summary header if multiple POCs
  if (detectedPOCs.length > 1) {
    output += `// ${detectedPOCs.length} Points of Contact Detected\n`;
    output += `// Student: ${studentName}\n`;
    output += `// Service: ${serviceType}\n`;
    output += '='.repeat(80) + '\n\n';
  }

  detectedPOCs.forEach((poc, index) => {
    // Skip pending POCs
    if (poc.type === 'pending') return;

    const hours = '1 hour';
    output += `${poc.dateStr} | ${serviceType} | ${hours} | Academic Support | ${studentName}\n\n`;

    if (noteStyle === 'natural') {
      output += 'OBJECTIVE:\n';
      if (noteContext?.topics) {
        output += `${studentName} contacted regarding ${noteContext.topics}.`;
      } else {
        output += `${studentName} reached out for assistance.`;
      }
      if (noteContext?.questions) {
        output += ` Student inquired about ${noteContext.questions}.`;
      }
      output += '\n\n';

      output += 'WHAT TRANSPIRED:\n';
      if (noteContext?.actions) {
        output += noteContext.actions;
      } else {
        output += `Reviewed the ${poc.type} and provided appropriate response.`;
      }
      if (noteContext?.additional) {
        output += ` ${noteContext.additional}`;
      }
      output += '\n\n';

      output += 'OUTCOME/PLAN:\n';
      if (noteContext?.followUp) {
        output += noteContext.followUp;
      } else {
        output += 'Response provided. Will monitor for any follow-up questions.';
      }
      output += '\n';
    }

    if (index < detectedPOCs.length - 1) {
      output += '\n' + '='.repeat(80) + '\n\n';
    }
  });

  // Add email verbatim once at the end
  if (universalInput && detectedPOCs.length > 0) {
    output += '\n\n' + '-'.repeat(80) + '\n';
    output += 'ORIGINAL EMAIL:\n\n';
    output += universalInput.trim();
    output += '\n' + '-'.repeat(80);
  }

  return output;
}

function generateTasks(state: AppState): string {
  const { 
    startDate, 
    endDate, 
    totalDaysWorked, 
    distributionPattern,
    timeOfDay,
    hoursPerDay,
    universalInput,
    detailLevel
  } = state;

  const start = new Date(startDate);
  const end = new Date(endDate);
  let output = '';
  let currentDate = new Date(start);
  let daysGenerated = 0;

  // Extract task context from input
  const taskContext = extractTaskContext(universalInput);

  while (daysGenerated < totalDaysWorked && currentDate <= end) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const dateStr = format(currentDate, 'MMMM d, yyyy');
      const hours = calculateHoursForDay(daysGenerated, totalDaysWorked, hoursPerDay, distributionPattern);
      const timeRange = getTimeRange(timeOfDay, hours);
      
      output += `${dateStr} | ${timeRange} | ${hours} hours | ${taskContext.title} | ${taskContext.category}\n`;
      
      // Add bullets based on detail level
      const bulletCount = detailLevel === 'basic' ? 3 : detailLevel === 'enhanced' ? 7 : 5;
      const bullets = generateTaskBullets(taskContext, bulletCount);
      bullets.forEach(bullet => {
        output += `• ${bullet}\n`;
      });
      
      output += '\n';
      daysGenerated++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return output.trim();
}

function extractTaskContext(input: string) {
  const defaultContext = {
    title: 'Project Development',
    category: 'Development',
    activities: [
      'Analyzed requirements and specifications',
      'Implemented features according to design',
      'Conducted code review and testing',
      'Updated documentation'
    ]
  };

  if (!input) return defaultContext;

  // Extract project name
  const projectMatch = input.match(/project[:\s]+([^\n]+)/i);
  if (projectMatch && projectMatch[1]) {
    defaultContext.title = projectMatch[1].trim();
  }

  // Extract activities
  const activities: string[] = [];
  const actionWords = ['developed', 'created', 'implemented', 'designed', 'analyzed', 'reviewed'];
  actionWords.forEach(word => {
    const pattern = new RegExp(`${word}\\s+([^.]+)`, 'gi');
    const matches = input.matchAll(pattern);
    for (const match of matches) {
      activities.push(match[0]);
    }
  });

  if (activities.length > 0) {
    defaultContext.activities = activities;
  }

  return defaultContext;
}

function calculateHoursForDay(
  dayIndex: number, 
  totalDays: number, 
  baseHours: number, 
  pattern: string
): number {
  switch (pattern) {
    case 'frontLoaded':
      return dayIndex < totalDays / 2 ? baseHours + 1 : baseHours - 1;
    case 'backLoaded':
      return dayIndex >= totalDays / 2 ? baseHours + 1 : baseHours - 1;
    case 'ascending':
      return Math.min(baseHours + dayIndex * 0.5, 8);
    case 'descending':
      return Math.max(baseHours - dayIndex * 0.5, 1);
    default:
      return baseHours;
  }
}

function getTimeRange(timeOfDay: string, hours: number): string {
  const timeRanges = {
    'early_morning': { start: 6, name: '6:00 AM' },
    'morning': { start: 8, name: '8:00 AM' },
    'midday': { start: 11, name: '11:00 AM' },
    'afternoon': { start: 13, name: '1:00 PM' },
    'late_afternoon': { start: 16, name: '4:00 PM' },
    'evening': { start: 18, name: '6:00 PM' }
  };

  const range = timeRanges[timeOfDay as keyof typeof timeRanges] || timeRanges.morning;
  const endHour = range.start + hours;
  const endTime = endHour > 12 ? `${endHour - 12}:00 PM` : `${endHour}:00 AM`;
  
  return `${range.name} - ${endTime}`;
}

function generateTaskBullets(context: any, count: number): string[] {
  const bullets = [];
  const available = [...context.activities];
  
  // Use real activities first
  for (let i = 0; i < Math.min(count, available.length); i++) {
    bullets.push(available[i]);
  }
  
  // Fill with generic if needed
  const generic = [
    'Coordinated with team members on deliverables',
    'Ensured quality standards were met',
    'Documented progress and outcomes',
    'Prepared for upcoming milestones'
  ];
  
  while (bullets.length < count) {
    bullets.push(generic[bullets.length % generic.length]);
  }
  
  return bullets.slice(0, count);
}