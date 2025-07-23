import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// import { format } from 'date-fns'; // Now handled by task-decomposition module
import { DateExtractor } from '@/modules/date-extraction';
import { POCConsolidator, PointOfContact } from '@/modules/poc-consolidation';
import { generatePOCTemplate, formatPOCNote, applyProfessionalTone } from '@/modules/poc-documentation-guide';
import { 
  validateWorkDays, 
  getBusinessDays, 
  distributeWorkDays, 
  generateTaskSummary, 
  formatWorkLog, 
  formatTaskSummary,
  WorkloadBalanceStyle
} from '@/modules/task-decomposition';
import { InputSanitizer } from '@/modules/input-sanitization';
// import { generateUniqueNotes } from '@/modules/simple-poc-fix'; // Replaced with POC Documentation Guide
import { ManualPOC } from '@/presentation/components/ManualPOCEditor';

/**
 * Application state management - Single source of truth
 * Handles all state mutations with automatic persistence
 */

interface WorkflowState {
  state: 'idle' | 'analyzing' | 'ready' | 'generating' | 'complete';
  progress: number;
  message: string;
}

interface AppState {
  // Input state
  universalInput: string;
  detectedPOCs: PointOfContact[];
  selectedPOCDates: string[];
  
  // Output state
  generatedOutput: string;
  workflow: WorkflowState;
  
  // Settings - General
  currentMode: 'email' | 'task';
  
  // Settings - Email Mode
  studentName: string;
  serviceType: string;
  noteStyle: 'natural' | 'bullets' | 'concise';
  detailLevel: 'basic' | 'standard' | 'enhanced';
  noteContext: string;
  language: 'canadian' | 'british';
  
  // Settings - Task Mode
  startDate: string;
  endDate: string;
  totalDaysWorked: number;
  distributionPattern: string;
  timeOfDay: string;
  hoursPerDay: number;
  
  // Draft state
  lastSavedDraft: string;
  draftTimestamp: string;
  
  // Manual POCs
  manualPOCs: ManualPOC[];
  
  // Actions
  setUniversalInput: (input: string) => void;
  setStudentName: (name: string) => void;
  setServiceType: (type: string) => void;
  setNoteStyle: (style: 'natural' | 'bullets' | 'concise') => void;
  setDetailLevel: (level: 'basic' | 'standard' | 'enhanced') => void;
  setNoteContext: (context: string) => void;
  setLanguage: (lang: 'canadian' | 'british') => void;
  setCurrentMode: (mode: 'email' | 'task') => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setTotalDaysWorked: (days: number) => void;
  setDistributionPattern: (pattern: string) => void;
  setTimeOfDay: (time: string) => void;
  setHoursPerDay: (hours: number) => void;
  
  // Complex actions
  analyzeContent: () => Promise<void>;
  generateOutput: () => Promise<void>;
  analyzeUniversalInput: (input: string) => void;
  setDetectedPOCs: (pocs: PointOfContact[]) => void;
  setSelectedPOCDates: (dates: string[]) => void;
  copyToClipboard: () => Promise<void>;
  saveAsDraft: () => void;
  resetAll: () => void;
  clearAll: () => void;
  restoreDraft: (draft: Partial<AppState>) => void;
  updateWorkflow: (update: Partial<WorkflowState>) => void;
  addManualPOC: (poc: ManualPOC) => void;
  updateManualPOC: (pocId: string, poc: ManualPOC) => void;
  deleteManualPOC: (pocId: string) => void;
}

const initialState = {
  universalInput: '',
  detectedPOCs: [],
  selectedPOCDates: [],
  generatedOutput: '',
  workflow: {
    state: 'idle' as const,
    progress: 0,
    message: 'Ready'
  },
  currentMode: 'email' as const,
  studentName: '',
  serviceType: 'Email Support',
  noteStyle: 'natural' as const,
  detailLevel: 'standard' as const,
  noteContext: '',
  language: 'canadian' as const,
  startDate: new Date().toISOString().split('T')[0] || '',
  endDate: new Date().toISOString().split('T')[0] || '',
  totalDaysWorked: 1,
  distributionPattern: 'equal',
  timeOfDay: 'morning',
  hoursPerDay: 8,
  lastSavedDraft: '',
  draftTimestamp: '',
  manualPOCs: []
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Simple setters
      setUniversalInput: (universalInput) => set({ universalInput }),
      setStudentName: (studentName) => set({ studentName }),
      setServiceType: (serviceType) => set({ serviceType }),
      setNoteStyle: (noteStyle) => set({ noteStyle }),
      setDetailLevel: (detailLevel) => set({ detailLevel }),
      setNoteContext: (noteContext) => set({ noteContext }),
      setLanguage: (language) => set({ language }),
      setCurrentMode: (currentMode) => set({ currentMode }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setTotalDaysWorked: (totalDaysWorked) => set({ totalDaysWorked }),
      setDistributionPattern: (distributionPattern) => set({ distributionPattern }),
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      setHoursPerDay: (hoursPerDay) => set({ hoursPerDay }),
      
      // Complex actions
      analyzeContent: async () => {
        set({ 
          workflow: { 
            state: 'analyzing', 
            progress: 25, 
            message: 'Analyzing content...' 
          } 
        });
        
        const state = get();
        
        if (state.currentMode === 'email') {
          // Email analysis
          const { universalInput } = state;
          
          set({ 
            workflow: { 
              state: 'analyzing', 
              progress: 50, 
              message: 'Extracting dates...' 
            } 
          });
          
          // Sanitize input
          const sanitized = InputSanitizer.sanitizeEmailContent(universalInput);
          
          // Extract dates
          const dates = DateExtractor.extractDates(sanitized);
          
          set({ 
            workflow: { 
              state: 'analyzing', 
              progress: 75, 
              message: 'Consolidating POCs...' 
            } 
          });
          
          // Check if the last date might be incomplete
          const hasLastDate = DateExtractor.hasLastDateMarker(sanitized);
          
          // Consolidate POCs
          const pocs = POCConsolidator.consolidate(dates, universalInput, hasLastDate);
          
          set({ 
            workflow: { 
              state: 'ready', 
              progress: 100, 
              message: `Found ${pocs.length} POCs` 
            },
            detectedPOCs: pocs,
            // Auto-select all POCs by default
            selectedPOCDates: pocs.map(poc => poc.dateStr)
          });
        } else {
          // Task analysis
          set({ 
            workflow: { 
              state: 'ready', 
              progress: 100, 
              message: 'Ready to generate tasks' 
            } 
          });
        }
      },
      
      generateOutput: async () => {
        set({ 
          workflow: { 
            state: 'generating', 
            progress: 0, 
            message: 'Generating output...' 
          } 
        });
        
        const state = get();
        let output = '';
        
        try {
          if (state.currentMode === 'email') {
            output = generateCaseNotes(state);
          } else {
            output = generateTasks(state);
          }
          
          set({ 
            generatedOutput: output,
            workflow: { 
              state: 'complete', 
              progress: 100, 
              message: 'Generation complete!' 
            }
          });
        } catch (error) {
          set({
            workflow: {
              state: 'idle',
              progress: 0,
              message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          });
        }
      },
      
      analyzeUniversalInput: (input: string) => {
        const sanitized = InputSanitizer.sanitizeEmailContent(input);
        const dates = DateExtractor.extractDates(sanitized);
        const hasLastDate = DateExtractor.hasLastDateMarker(sanitized);
        const pocs = POCConsolidator.consolidate(dates, input, hasLastDate);
        
        set({ 
          detectedPOCs: pocs,
          selectedPOCDates: pocs.map(poc => poc.dateStr)
        });
      },
      
      setDetectedPOCs: (detectedPOCs) => set({ detectedPOCs }),
      setSelectedPOCDates: (selectedPOCDates) => set({ selectedPOCDates }),
      
      copyToClipboard: async () => {
        const { generatedOutput } = get();
        if (generatedOutput) {
          await navigator.clipboard.writeText(generatedOutput);
          set({
            workflow: {
              ...get().workflow,
              message: 'Copied to clipboard!'
            }
          });
        }
      },
      
      saveAsDraft: () => {
        const state = get();
        const draft = {
          universalInput: state.universalInput,
          currentMode: state.currentMode,
          studentName: state.studentName,
          serviceType: state.serviceType,
          noteStyle: state.noteStyle,
          detailLevel: state.detailLevel,
          language: state.language,
          startDate: state.startDate,
          endDate: state.endDate,
          totalDaysWorked: state.totalDaysWorked,
          distributionPattern: state.distributionPattern,
          generatedOutput: state.generatedOutput,
          timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('clockwork-elite-draft', JSON.stringify(draft));
        
        set({
          lastSavedDraft: state.generatedOutput || '',
          draftTimestamp: draft.timestamp,
          workflow: {
            ...state.workflow,
            message: 'Draft saved successfully',
            state: 'complete'
          }
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          set(state => ({
            workflow: {
              ...state.workflow,
              message: 'Ready',
              state: 'idle'
            }
          }));
        }, 3000);
      },
      
      resetAll: () => set(() => initialState),
      clearAll: () => set(() => initialState),

      restoreDraft: (draft) => set({ ...draft }),

      updateWorkflow: (update) => set(state => ({
        workflow: { ...state.workflow, ...update }
      })),
      
      addManualPOC: (poc) => set(state => ({
        manualPOCs: [...state.manualPOCs, { ...poc, id: Date.now().toString() }]
      })),
      
      updateManualPOC: (pocId, poc) => set(state => ({
        manualPOCs: state.manualPOCs.map(p => p.id === pocId ? poc : p)
      })),
      
      deleteManualPOC: (pocId) => set(state => ({
        manualPOCs: state.manualPOCs.filter(p => p.id !== pocId)
      }))
    }),
    {
      name: 'clockwork-elite-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// Note generation functions using POC Documentation Guide
function generateCaseNotes(state: AppState): string {
  const { 
    detectedPOCs, 
    studentName, 
    serviceType, 
    // noteStyle, 
    // detailLevel,
    // noteContext,
    universalInput,
    manualPOCs
  } = state;

  let output = '';

  // Calculate total POCs including manual ones
  const totalPOCs = detectedPOCs.length + manualPOCs.length;

  // Summary header if multiple POCs
  if (totalPOCs > 1) {
    output += `// ${totalPOCs} Points of Contact Detected\n`;
    output += `// Student: ${studentName}\n`;
    output += `// Service: ${serviceType}\n`;
    output += '='.repeat(80) + '\n\n';
  }

  // First, generate notes for detected POCs using POC Documentation Guide
  const selectedPOCs = state.selectedPOCDates.length > 0 
    ? detectedPOCs.filter(poc => state.selectedPOCDates.includes(poc.dateStr))
    : detectedPOCs;
    
  selectedPOCs.forEach((poc, index) => {
    if (index > 0) {
      output += '\n\n' + '='.repeat(80) + '\n\n';
    }
    
    // Generate POC template based on email content
    const template = generatePOCTemplate('direct-student-contact', universalInput, studentName);
    
    // Format header
    output += `${poc.dateStr} | ${serviceType} | Email Support | Direct Student Contact | ${studentName}\n\n`;
    
    // Format using professional template
    const formattedNote = formatPOCNote(template);
    const professionalNote = applyProfessionalTone(formattedNote);
    
    output += professionalNote;
    
    // Add email verbatim if exists
    if (poc.context) {
      output += '\n\n**Email Verbatim:**\n';
      output += '```\n' + poc.context + '\n```';
    }
  });

  // Then add manual POCs
  if (manualPOCs.length > 0) {
    if (detectedPOCs.length > 0) {
      output += '\n\n' + '='.repeat(80) + '\n\n';
    }
    
    manualPOCs.forEach((poc, index) => {
      if (index > 0) {
        output += '\n\n' + '='.repeat(80) + '\n\n';
      }
      
      output += `${poc.date} | ${poc.serviceType} | ${poc.duration} minutes | ${poc.category} | ${studentName}\n\n`;
      
      output += `**1. Purpose of Contact**\n${poc.purposeOfContact}\n\n`;
      output += `**2. Client Report (Subjective)**\n${poc.clientReport}\n\n`;
      output += `**3. Staff Observations (Objective)**\n${poc.staffObservations}\n\n`;
      output += `**4. Assessment / Analysis**\n${poc.assessment}\n\n`;
      output += `**5. Actions Taken / Intervention**\n${poc.actionsTaken}\n\n`;
      output += `**6. Plan / Next Steps**\n${poc.nextSteps}`;
    });
  }

  // Email verbatim at the end if single POC
  if (totalPOCs === 1 && universalInput) {
    output += '\n\n**Email Verbatim:**\n';
    output += '```\n' + universalInput + '\n```';
  }

  return output.trim();
}

function generateTasks(state: AppState): string {
  // Use new task decomposition system
  const config = {
    startDate: state.startDate,
    endDate: state.endDate,
    totalDaysWorked: state.totalDaysWorked,
    balanceStyle: mapDistributionPattern(state.distributionPattern)
  };
  
  // Validate workdays
  const validation = validateWorkDays(config);
  if (!validation.isValid) {
    return `ERROR: ${validation.error}`;
  }
  
  // Get business days and distribute work
  const businessDays = getBusinessDays(config.startDate, config.endDate);
  const workDays = distributeWorkDays(config, businessDays);
  
  // Generate work log
  let output = formatWorkLog(workDays, config.balanceStyle || 'balanced');
  
  // Generate task summary (default to standard tier)
  const summary = generateTaskSummary('standard', state.universalInput);
  output += '\n\n' + formatTaskSummary(summary);
  
  return output;
}

function mapDistributionPattern(pattern: string): WorkloadBalanceStyle {
  const mapping: { [key: string]: WorkloadBalanceStyle } = {
    'equal': 'balanced',
    'frontLoaded': 'front-loaded',
    'backLoaded': 'back-loaded',
    'ascending': 'ascending',
    'descending': 'descending',
    'balanced': 'balanced',
    'front-loaded': 'front-loaded',
    'back-loaded': 'back-loaded',
    'randomized': 'randomized'
  };
  return mapping[pattern] || 'balanced';
}

// Legacy functions removed - now using task-decomposition module