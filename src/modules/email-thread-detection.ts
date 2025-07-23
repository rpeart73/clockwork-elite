/**
 * Email Thread Detection Algorithms
 * Intelligently groups emails into conversation threads
 */

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  date: Date;
  content: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
}

export interface EmailThread {
  id: string;
  subject: string; // Normalized subject without RE:/FW:
  participants: Set<string>;
  messages: EmailMessage[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  summary?: string;
}

/**
 * Main thread detection function
 */
export function detectEmailThreads(emails: EmailMessage[]): EmailThread[] {
  const threads: Map<string, EmailThread> = new Map();
  
  // Sort emails by date
  const sortedEmails = [...emails].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (const email of sortedEmails) {
    const threadKey = findBestThreadMatch(email, threads);
    
    if (threadKey) {
      // Add to existing thread
      const thread = threads.get(threadKey)!;
      addEmailToThread(thread, email);
    } else {
      // Create new thread
      const newThread = createNewThread(email);
      threads.set(newThread.id, newThread);
    }
  }
  
  // Post-process threads
  return Array.from(threads.values()).map(thread => {
    thread.isActive = isThreadActive(thread);
    thread.summary = generateThreadSummary(thread);
    return thread;
  });
}

/**
 * Find the best matching thread for an email
 */
function findBestThreadMatch(
  email: EmailMessage, 
  threads: Map<string, EmailThread>
): string | null {
  let bestMatch: { threadId: string; score: number } | null = null;
  
  for (const [threadId, thread] of threads) {
    const score = calculateThreadMatchScore(email, thread);
    
    if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { threadId, score };
    }
  }
  
  return bestMatch?.threadId || null;
}

/**
 * Calculate how well an email matches a thread
 */
function calculateThreadMatchScore(email: EmailMessage, thread: EmailThread): number {
  let score = 0;
  const weights = {
    subject: 0.4,
    participants: 0.3,
    references: 0.2,
    timing: 0.1
  };
  
  // Subject similarity
  const normalizedEmailSubject = normalizeSubject(email.subject);
  if (normalizedEmailSubject === thread.subject) {
    score += weights.subject;
  } else if (thread.subject.includes(normalizedEmailSubject) || 
             normalizedEmailSubject.includes(thread.subject)) {
    score += weights.subject * 0.5;
  }
  
  // Participant overlap
  const emailParticipants = new Set([
    email.from,
    ...email.to,
    ...(email.cc || [])
  ]);
  
  const overlap = calculateSetOverlap(emailParticipants, thread.participants);
  score += weights.participants * overlap;
  
  // Reference/Reply-To headers
  if (email.inReplyTo || email.references?.length) {
    const threadMessageIds = thread.messages
      .map(m => m.messageId)
      .filter(Boolean);
    
    if (email.inReplyTo && threadMessageIds.includes(email.inReplyTo)) {
      score += weights.references;
    } else if (email.references?.some(ref => threadMessageIds.includes(ref))) {
      score += weights.references * 0.5;
    }
  }
  
  // Timing - emails close in time are more likely to be related
  const lastThreadMessage = thread.messages[thread.messages.length - 1];
  if (!lastThreadMessage) return score;
  
  const timeDiff = Math.abs(email.date.getTime() - lastThreadMessage.date.getTime());
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 1) {
    score += weights.timing;
  } else if (daysDiff < 7) {
    score += weights.timing * (1 - daysDiff / 7);
  }
  
  return score;
}

/**
 * Normalize email subject by removing prefixes
 */
function normalizeSubject(subject: string): string {
  return subject
    .replace(/^(RE:|FW:|Fwd:|Re:|Fw:)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Calculate overlap between two sets
 */
function calculateSetOverlap<T>(set1: Set<T>, set2: Set<T>): number {
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let overlap = 0;
  for (const item of set1) {
    if (set2.has(item)) overlap++;
  }
  
  return overlap / Math.max(set1.size, set2.size);
}

/**
 * Create a new thread from an email
 */
function createNewThread(email: EmailMessage): EmailThread {
  const participants = new Set([
    email.from,
    ...email.to,
    ...(email.cc || [])
  ]);
  
  return {
    id: generateThreadId(),
    subject: normalizeSubject(email.subject),
    participants,
    messages: [email],
    startDate: email.date,
    endDate: email.date,
    isActive: true
  };
}

/**
 * Add an email to an existing thread
 */
function addEmailToThread(thread: EmailThread, email: EmailMessage): void {
  thread.messages.push(email);
  
  // Update participants
  thread.participants.add(email.from);
  email.to.forEach(to => thread.participants.add(to));
  email.cc?.forEach(cc => thread.participants.add(cc));
  
  // Update dates
  if (email.date < thread.startDate) {
    thread.startDate = email.date;
  }
  if (email.date > thread.endDate) {
    thread.endDate = email.date;
  }
}

/**
 * Check if a thread is still active
 */
function isThreadActive(thread: EmailThread): boolean {
  const daysSinceLastMessage = 
    (Date.now() - thread.endDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceLastMessage < 30;
}

/**
 * Generate a summary of the thread
 */
function generateThreadSummary(thread: EmailThread): string {
  const messageCount = thread.messages.length;
  const duration = Math.ceil(
    (thread.endDate.getTime() - thread.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Extract key topics from messages
  const topics = extractKeyTopics(thread.messages);
  
  let summary = `Thread with ${messageCount} messages over ${duration} day${duration !== 1 ? 's' : ''}.`;
  
  if (topics.length > 0) {
    summary += ` Key topics: ${topics.slice(0, 3).join(', ')}.`;
  }
  
  return summary;
}

/**
 * Extract key topics from email messages
 */
function extractKeyTopics(messages: EmailMessage[]): string[] {
  const topicPatterns = [
    { pattern: /meeting|appointment|schedule/gi, topic: 'scheduling' },
    { pattern: /accommodation|disability|support/gi, topic: 'accommodations' },
    { pattern: /exam|test|quiz|assignment/gi, topic: 'assessments' },
    { pattern: /deadline|extension|due date/gi, topic: 'deadlines' },
    { pattern: /grade|mark|score|feedback/gi, topic: 'grades' },
    { pattern: /course|class|lecture|tutorial/gi, topic: 'courses' },
    { pattern: /registration|enroll|drop|add/gi, topic: 'registration' },
    { pattern: /stress|anxiety|mental health|wellness/gi, topic: 'mental health' }
  ];
  
  const topicCounts: Map<string, number> = new Map();
  
  for (const message of messages) {
    const combinedText = `${message.subject} ${message.content}`;
    
    for (const { pattern, topic } of topicPatterns) {
      const matches = combinedText.match(pattern);
      if (matches) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + matches.length);
      }
    }
  }
  
  // Sort topics by frequency
  return Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
}

/**
 * Generate a unique thread ID
 */
function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Merge similar threads
 */
export function mergeSimilarThreads(threads: EmailThread[]): EmailThread[] {
  const merged: EmailThread[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    if (!thread || processed.has(thread.id)) continue;
    
    const currentThread = { ...thread };
    processed.add(currentThread.id);
    
    for (let j = i + 1; j < threads.length; j++) {
      const otherThread = threads[j];
      if (!otherThread || processed.has(otherThread.id)) continue;
      
      if (shouldMergeThreads(currentThread, otherThread)) {
        mergeThreads(currentThread, otherThread);
        processed.add(otherThread.id);
      }
    }
    
    merged.push(currentThread);
  }
  
  return merged;
}

/**
 * Determine if two threads should be merged
 */
function shouldMergeThreads(thread1: EmailThread, thread2: EmailThread): boolean {
  // Similar subjects
  if (thread1.subject === thread2.subject) return true;
  
  // High participant overlap
  const participantOverlap = calculateSetOverlap(thread1.participants, thread2.participants);
  if (participantOverlap > 0.8) return true;
  
  // Time proximity
  const timeDiff = Math.abs(thread1.startDate.getTime() - thread2.startDate.getTime());
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  return daysDiff < 2 && participantOverlap > 0.5;
}

/**
 * Merge two threads
 */
function mergeThreads(target: EmailThread, source: EmailThread): void {
  // Merge messages
  target.messages.push(...source.messages);
  target.messages.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Merge participants
  source.participants.forEach(p => target.participants.add(p));
  
  // Update dates
  if (source.startDate < target.startDate) {
    target.startDate = source.startDate;
  }
  if (source.endDate > target.endDate) {
    target.endDate = source.endDate;
  }
  
  // Update activity status
  target.isActive = target.isActive || source.isActive;
}