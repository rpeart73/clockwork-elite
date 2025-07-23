/**
 * IndexedDB Schema for Email Chains and Student Interactions
 * Provides offline storage and fast retrieval of student communication history
 */

export interface DatabaseSchema {
  version: number;
  stores: {
    students: StudentStore;
    emailChains: EmailChainStore;
    pocs: POCStore;
    interactions: InteractionStore;
    attachments: AttachmentStore;
  };
}

// Student Profile Store
export interface StudentStore {
  keyPath: 'id';
  indexes: {
    email: { unique: true };
    name: { unique: false };
    createdAt: { unique: false };
  };
  schema: StudentRecord;
}

export interface StudentRecord {
  id: string; // UUID
  name: string;
  email: string;
  alternateEmails?: string[];
  studentNumber?: string; // Encrypted
  program?: string;
  year?: string;
  disabilities?: string[]; // General categories only
  accommodations?: string[]; // Types of accommodations
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  runningNotes?: string; // Encrypted
  lastContactDate?: Date;
  totalInteractions?: number;
}

// Email Chain Store
export interface EmailChainStore {
  keyPath: 'id';
  indexes: {
    studentId: { unique: false };
    subject: { unique: false };
    startDate: { unique: false };
    endDate: { unique: false };
    status: { unique: false };
  };
  schema: EmailChainRecord;
}

export interface EmailChainRecord {
  id: string; // UUID
  studentId: string;
  subject: string;
  originalSubject: string; // Without RE:/FW:
  participants: EmailParticipant[];
  emails: EmailMessage[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'resolved' | 'pending' | 'archived';
  category?: string;
  tags?: string[];
  summary?: string; // AI-generated summary
  keyTopics?: string[];
  pocIds?: string[]; // Related POCs
}

export interface EmailParticipant {
  email: string;
  name?: string;
  role: 'student' | 'staff' | 'faculty' | 'parent' | 'external';
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  date: Date;
  content: string; // Encrypted
  attachments?: string[]; // Attachment IDs
  isStudentEmail: boolean;
}

// POC Store
export interface POCStore {
  keyPath: 'id';
  indexes: {
    studentId: { unique: false };
    date: { unique: false };
    category: { unique: false };
    emailChainId: { unique: false };
  };
  schema: POCRecord;
}

export interface POCRecord {
  id: string; // UUID
  studentId: string;
  emailChainId?: string;
  date: Date;
  category: string;
  duration: number;
  serviceType: string;
  purposeOfContact: string;
  clientReport: string;
  staffObservations: string;
  assessment: string;
  actionsTaken: string;
  nextSteps: string;
  createdAt: Date;
  createdBy: string;
  isManual: boolean;
  privacyChecked: boolean;
  tags?: string[];
}

// Interaction Timeline Store
export interface InteractionStore {
  keyPath: 'id';
  indexes: {
    studentId: { unique: false };
    date: { unique: false };
    type: { unique: false };
  };
  schema: InteractionRecord;
}

export interface InteractionRecord {
  id: string; // UUID
  studentId: string;
  date: Date;
  type: 'email' | 'meeting' | 'phone' | 'chat' | 'note' | 'task';
  title: string;
  description?: string;
  duration?: number;
  outcome?: string;
  followUpDate?: Date;
  relatedPocId?: string;
  relatedEmailChainId?: string;
  metadata?: Record<string, any>;
}

// Attachment Store
export interface AttachmentStore {
  keyPath: 'id';
  indexes: {
    emailMessageId: { unique: false };
    uploadDate: { unique: false };
  };
  schema: AttachmentRecord;
}

export interface AttachmentRecord {
  id: string; // UUID
  emailMessageId: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  blob?: Blob; // Actual file data
  thumbnailUrl?: string; // For images
}

// Database Configuration
export const DB_CONFIG = {
  name: 'ClockworkEliteDB',
  version: 1,
  stores: [
    {
      name: 'students',
      keyPath: 'id',
      indexes: [
        { name: 'email', keyPath: 'email', options: { unique: true } },
        { name: 'name', keyPath: 'name', options: { unique: false } },
        { name: 'createdAt', keyPath: 'createdAt', options: { unique: false } }
      ]
    },
    {
      name: 'emailChains',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
        { name: 'subject', keyPath: 'subject', options: { unique: false } },
        { name: 'startDate', keyPath: 'startDate', options: { unique: false } },
        { name: 'endDate', keyPath: 'endDate', options: { unique: false } },
        { name: 'status', keyPath: 'status', options: { unique: false } }
      ]
    },
    {
      name: 'pocs',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
        { name: 'date', keyPath: 'date', options: { unique: false } },
        { name: 'category', keyPath: 'category', options: { unique: false } },
        { name: 'emailChainId', keyPath: 'emailChainId', options: { unique: false } }
      ]
    },
    {
      name: 'interactions',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', options: { unique: false } },
        { name: 'date', keyPath: 'date', options: { unique: false } },
        { name: 'type', keyPath: 'type', options: { unique: false } }
      ]
    },
    {
      name: 'attachments',
      keyPath: 'id',
      indexes: [
        { name: 'emailMessageId', keyPath: 'emailMessageId', options: { unique: false } },
        { name: 'uploadDate', keyPath: 'uploadDate', options: { unique: false } }
      ]
    }
  ]
};

// Migration functions for future schema updates
export interface Migration {
  version: number;
  migrate: (db: IDBDatabase) => void;
}

export const migrations: Migration[] = [
  // Version 1 is initial schema, no migration needed
];

// Utility function to open database
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      DB_CONFIG.stores.forEach(storeConfig => {
        if (!db.objectStoreNames.contains(storeConfig.name)) {
          const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
          
          // Create indexes
          storeConfig.indexes.forEach(index => {
            store.createIndex(index.name, index.keyPath, index.options);
          });
        }
      });
    };
  });
}