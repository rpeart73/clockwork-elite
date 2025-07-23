/**
 * Ontario Disability Office POC Methodology Implementation
 * Professional standards for logging Points of Contact
 */

export type POCCategory = 
  | 'direct-student-contact'
  | 'third-party-communication'
  | 'internal-file-actions'
  | 'observation-based'
  | 'administrative-contact';

export interface POCMethodology {
  category: POCCategory;
  shouldLog: boolean;
  consolidationRule: 'per-issue' | 'per-action' | 'per-day';
}

export interface StructuredPOC {
  purposeOfContact: string;
  clientReport: string;
  staffObservations: string;
  assessment: string;
  actionsTaken: string;
  nextSteps: string;
  category: POCCategory;
  dateRange: string; // e.g., "July 10-14, 2025"
}

/**
 * Determine if interactions should be consolidated into one POC
 */
export function shouldConsolidatePOCs(
  emails: Array<{ date: Date; subject: string; content: string }>
): boolean {
  // Check if all emails are about the same issue
  const subjects = emails.map(e => normalizeSubject(e.subject));
  const uniqueSubjects = new Set(subjects);
  
  // If all emails have same subject (ignoring RE:/FW:), it's one issue
  if (uniqueSubjects.size === 1) {
    return true;
  }
  
  // Check for common topics across emails
  const commonTopics = [
    'meeting', 'appointment', 'schedule',
    'SAS', 'accommodation', 'registration',
    'degree', 'requirement', 'progress'
  ];
  
  const hasCommonTopic = emails.every(email => 
    commonTopics.some(topic => 
      email.content.toLowerCase().includes(topic)
    )
  );
  
  return hasCommonTopic;
}

/**
 * Generate a professional POC following Ontario standards
 */
export function generateProfessionalPOC(
  emails: Array<{ date: Date; subject: string; content: string; from: string; to: string }>,
  studentName: string
): StructuredPOC {
  // Sort emails chronologically
  const sortedEmails = [...emails].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sortedEmails.length === 0) {
    return {
      purposeOfContact: 'Student contacted regarding academic support.',
      clientReport: 'Student communication received.',
      staffObservations: 'Correspondence reviewed.',
      assessment: 'Ongoing support needs identified.',
      actionsTaken: 'Reviewed and responded to inquiry.',
      nextSteps: 'Continue monitoring student progress.',
      category: 'direct-student-contact',
      dateRange: new Date().toLocaleDateString('en-CA')
    };
  }
  
  const firstEmail = sortedEmails[0];
  const lastEmail = sortedEmails[sortedEmails.length - 1];
  
  // Determine category
  const category = determineCategory(emails);
  
  // Extract key information
  const topics = extractTopics(emails);
  const requests = extractRequests(emails);
  const outcomes = extractOutcomes(emails);
  
  // Generate date range
  const dateRange = firstEmail && lastEmail ? formatDateRange(firstEmail.date, lastEmail.date) : 'Unknown date';
  
  return {
    purposeOfContact: generatePurpose(topics, requests, emails.length),
    clientReport: generateClientReport(requests, emails),
    staffObservations: generateStaffObservations(emails, studentName),
    assessment: generateAssessment(emails, studentName),
    actionsTaken: generateActionsTaken(emails),
    nextSteps: generateNextSteps(outcomes, emails),
    category,
    dateRange
  };
}

// Helper functions

function normalizeSubject(subject: string): string {
  return subject
    .replace(/^(RE:|FW:|Fwd:|Re:)\s*/gi, '')
    .trim()
    .toLowerCase();
}

function determineCategory(emails: any[]): POCCategory {
  // Check if any emails mention third parties
  const hasThirdParty = emails.some(e => 
    /faculty|professor|instructor|parent|SAS staff/i.test(e.content)
  );
  
  if (hasThirdParty) return 'third-party-communication';
  
  // Check if administrative
  const isAdmin = emails.every(e => 
    /schedule|appointment|meeting|confirm|reschedule/i.test(e.content)
  );
  
  if (isAdmin) return 'administrative-contact';
  
  // Default to direct student contact
  return 'direct-student-contact';
}

function extractTopics(emails: any[]): string[] {
  const topics = new Set<string>();
  
  const topicPatterns = [
    /regarding\s+([^.]+)/gi,
    /about\s+([^.]+)/gi,
    /follow.?up\s+on\s+([^.]+)/gi,
    /discussed?\s+([^.]+)/gi
  ];
  
  emails.forEach(email => {
    topicPatterns.forEach(pattern => {
      const matches = email.content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          topics.add(match[1].trim().toLowerCase());
        }
      }
    });
  });
  
  return Array.from(topics);
}

function extractRequests(emails: any[]): string[] {
  const requests = new Set<string>();
  
  const requestPatterns = [
    /(?:I|we|student)\s+(?:need|want|would like|request)\s+([^.]+)/gi,
    /(?:can|could|would)\s+(?:I|we|you)\s+([^.?]+)\?/gi,
    /looking\s+(?:for|to)\s+([^.]+)/gi
  ];
  
  emails.forEach(email => {
    requestPatterns.forEach(pattern => {
      const matches = email.content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          requests.add(match[1].trim());
        }
      }
    });
  });
  
  return Array.from(requests);
}

function extractOutcomes(emails: any[]): string[] {
  const outcomes = new Set<string>();
  
  const outcomePatterns = [
    /(?:will|plan to|scheduled for|confirmed)\s+([^.]+)/gi,
    /(?:next|follow.?up|meeting)\s+(?:on|at|for)\s+([^.]+)/gi,
    /(?:Thursday|Monday|Tuesday|Wednesday|Friday)\s+(?:at|works|good)\s*([^.]*)/gi
  ];
  
  emails.forEach(email => {
    outcomePatterns.forEach(pattern => {
      const matches = email.content.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          outcomes.add(match[0].trim());
        }
      }
    });
  });
  
  return Array.from(outcomes);
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString('en-CA', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  
  if (startDate.toDateString() === endDate.toDateString()) {
    return start;
  }
  
  const end = endDate.toLocaleDateString('en-CA', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${start} - ${end}`;
}

// Generation functions following Ontario standards

function generatePurpose(topics: string[], requests: string[], emailCount: number): string {
  if (topics.length === 0 && requests.length === 0) {
    return 'Student contacted regarding academic support needs.';
  }
  
  const mainTopic = topics[0] || requests[0] || 'academic matters';
  const action = emailCount > 1 ? 'follow-up on' : 'regarding';
  
  return `Student emailed to ${action} ${mainTopic}; coordination of support services.`;
}

function generateClientReport(_requests: string[], emails: any[]): string {
  const reports: string[] = [];
  
  // Look for specific student statements
  emails.forEach(email => {
    if (email.from.includes('@my.yorku.ca')) { // Student email
      // Extract key information shared by student
      const infoShared = email.content.match(/I\s+(?:just|have|had)\s+([^.]+)/gi) || [];
      infoShared.forEach((info: string) => {
        reports.push(info.replace(/^I\s+/i, 'Student '));
      });
    }
  });
  
  if (reports.length === 0) {
    return 'Student communicated regarding ongoing academic support needs.';
  }
  
  return reports.slice(0, 2).join('. ') + '.';
}

function generateStaffObservations(emails: any[], _studentName: string): string {
  const observations: string[] = [];
  
  // Analyze communication patterns
  const responseTime = analyzeResponseTime(emails);
  const communicationStyle = analyzeCommunicationStyle(emails);
  
  observations.push(`Student ${communicationStyle} in communication.`);
  
  if (responseTime === 'prompt') {
    observations.push('Responded promptly to correspondence.');
  }
  
  return observations.join(' ');
}

function generateAssessment(emails: any[], _studentName: string): string {
  // Professional assessment based on email patterns
  const hasInitiative = emails.some(e => 
    /I (spoke|contacted|reached out|followed up)/i.test(e.content)
  );
  
  const isProactive = emails.some(e => 
    /I (will|plan to|have|just)/i.test(e.content)
  );
  
  if (hasInitiative && isProactive) {
    return 'Student is demonstrating initiative and self-advocacy. Appears motivated to stay on track with academic and accessibility requirements.';
  }
  
  if (isProactive) {
    return 'Student appears engaged with support process and following through on recommended actions.';
  }
  
  return 'Student maintaining appropriate contact regarding support needs.';
}

function generateActionsTaken(emails: any[]): string {
  const actions: string[] = [];
  
  // Look for staff actions
  emails.forEach(email => {
    if (!email.from.includes('@my.yorku.ca')) { // Staff email
      if (email.content.match(/(?:I|we)\s+(?:will|can|have|confirmed)/i)) {
        actions.push('Responded to student inquiry');
      }
      if (email.content.match(/Thursday|Monday|Tuesday|Wednesday|Friday/i)) {
        actions.push('Coordinated meeting time');
      }
    }
  });
  
  if (actions.length === 0) {
    return 'Reviewed correspondence and prepared appropriate response.';
  }
  
  return actions.join('. ') + '.';
}

function generateNextSteps(outcomes: string[], _emails: any[]): string {
  if (outcomes.length > 0) {
    const meetingInfo = outcomes.find(o => /meeting|appointment/i.test(o));
    if (meetingInfo) {
      return `${meetingInfo}. Agenda to include accommodation review and support planning.`;
    }
  }
  
  return 'Awaiting student confirmation. Will continue to monitor and support as needed.';
}

// Helper analysis functions

function analyzeResponseTime(emails: any[]): 'prompt' | 'delayed' | 'standard' {
  // Check time between emails
  if (emails.length < 2) return 'standard';
  
  const timeDiffs = [];
  for (let i = 1; i < emails.length; i++) {
    const diff = emails[i].date.getTime() - emails[i-1].date.getTime();
    timeDiffs.push(diff);
  }
  
  const avgResponseTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  const hoursToRespond = avgResponseTime / (1000 * 60 * 60);
  
  if (hoursToRespond < 24) return 'prompt';
  if (hoursToRespond > 72) return 'delayed';
  return 'standard';
}

function analyzeCommunicationStyle(emails: any[]): string {
  const studentEmails = emails.filter(e => e.from.includes('@my.yorku.ca'));
  
  if (studentEmails.length === 0) return 'participated appropriately';
  
  // Analyze clarity and professionalism
  const hasGreeting = studentEmails.some(e => /hello|hi|dear/i.test(e.content));
  const hasClosing = studentEmails.some(e => /thanks|regards|sincerely/i.test(e.content));
  const isDetailed = studentEmails.some(e => e.content.length > 200);
  
  if (hasGreeting && hasClosing && isDetailed) {
    return 'communicated clearly and professionally';
  }
  
  if (isDetailed) {
    return 'provided detailed information';
  }
  
  return 'was clear and concise';
}

/**
 * Format the final POC for Clockwork entry
 */
export function formatPOCForClockwork(poc: StructuredPOC, studentName: string): string {
  return `${poc.dateRange} | Email Support | 1 hour | Academic Support | ${studentName}

**1. Purpose of Contact**
${poc.purposeOfContact}

**2. Client Report (Subjective)**
${poc.clientReport}

**3. Staff Observations (Objective)**
${poc.staffObservations}

**4. Assessment / Analysis**
${poc.assessment}

**5. Actions Taken / Intervention**
${poc.actionsTaken}

**6. Plan / Next Steps**
${poc.nextSteps}`;
}