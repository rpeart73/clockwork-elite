/**
 * POC Documentation Guide for Disability Offices (Ontario)
 * This module implements the comprehensive guide for Points of Contact documentation
 * in the context of disability services at Ontario post-secondary institutions.
 */

export interface POCCategory {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  requiresPOC: boolean;
}

export interface POCTemplate {
  purposeOfContact: string;
  clientReport: string;
  staffObservations: string;
  assessment: string;
  actionsTaken: string;
  nextSteps: string;
  attachments?: string;
}

export const POC_CATEGORIES: POCCategory[] = [
  {
    id: 'direct-student-contact',
    name: 'Direct Student Contact',
    definition: 'Live or asynchronous engagement with the student.',
    examples: [
      'In-person meetings',
      'Phone calls',
      'Email threads',
      'Zoom sessions'
    ],
    requiresPOC: true
  },
  {
    id: 'third-party-communication',
    name: 'Third-Party Communication',
    definition: 'Communication with individuals other than the student, relevant to the student\'s case.',
    examples: [
      'Faculty consults',
      'SAS coordination',
      'Parent communication (with consent)',
      'Interdepartmental memos'
    ],
    requiresPOC: true
  },
  {
    id: 'internal-file-actions',
    name: 'Internal File Actions',
    definition: 'Work on the student\'s file that affects service but does not involve the student directly.',
    examples: [
      'Reviewing documentation',
      'Preparing letters',
      'Adding or removing flags',
      'Confirming registration status'
    ],
    requiresPOC: true
  },
  {
    id: 'observational-insight',
    name: 'Observational Insight',
    definition: 'Noticing behaviour, performance, or needs in other contexts relevant to support.',
    examples: [
      'Observing student distress during group programming',
      'Noting lack of engagement in campus life'
    ],
    requiresPOC: true
  },
  {
    id: 'administrative-system-logs',
    name: 'Administrative & System Logs',
    definition: 'Logistics or scheduling actions that directly affect service access.',
    examples: [
      'Scheduling appointments',
      'Sending reminders',
      'Coordinating referrals',
      'Logging document receipt'
    ],
    requiresPOC: true
  }
];

export const POC_CRITERIA = {
  requiresPOC: [
    'Email from student requesting appointment',
    'Internal review of student documentation',
    'Discussing student case with instructor (with consent)',
    'Seeing a student upset during hallway interaction'
  ],
  mayRequirePOC: [
    'Student cancels appointment (only if pattern or affects service)'
  ],
  noPOCRequired: [
    'CC\'d on generic all-staff email',
    'Quick "thank you" emails with no next steps',
    'Unrelated personal chatter'
  ]
};

export const LANGUAGE_RULES = {
  perspective: 'third-person',
  tone: 'professional',
  avoid: [
    'medical jargon (unless authorized)',
    'speculation on motives',
    'character judgments',
    'stigmatizing language'
  ],
  use: [
    'neutral descriptive language',
    'direct quotes when necessary',
    'plain language',
    'past tense'
  ]
};

export const CONFIDENTIALITY_PRINCIPLES = [
  'Never document another student\'s name',
  'Avoid storing sensitive third-party info without consent',
  'Comply with PHIPA and FIPPA',
  'Collect only what is needed',
  'Do not forward or store screenshots unless necessary'
];

export function generatePOCTemplate(
  category: string,
  emailContent: string,
  studentName: string
): POCTemplate {
  // Extract key information from email
  // const lines = emailContent.split('\\n').filter(line => line.trim());
  
  // Analyze email for key elements
  const hasAppointmentRequest = /appointment|meeting|meet|schedule/i.test(emailContent);
  const hasSASMention = /SAS|Student Accessibility Services/i.test(emailContent);
  const hasDocumentMention = /document|documentation|form|letter/i.test(emailContent);
  const hasUrgency = /urgent|asap|immediately|emergency/i.test(emailContent);
  
  // Generate template based on content
  const template: POCTemplate = {
    purposeOfContact: generatePurpose(category, emailContent, hasAppointmentRequest, hasSASMention, hasDocumentMention),
    clientReport: generateClientReport(emailContent, studentName),
    staffObservations: generateObservations(emailContent, hasUrgency),
    assessment: generateAssessment(emailContent, hasAppointmentRequest, hasSASMention, hasDocumentMention),
    actionsTaken: generateActions(category, hasAppointmentRequest, hasSASMention, hasDocumentMention),
    nextSteps: generateNextSteps(hasAppointmentRequest, hasSASMention, hasDocumentMention),
    attachments: 'Full email thread included below.'
  };
  
  return template;
}

function generatePurpose(
  category: string,
  _content: string,
  hasAppointment: boolean,
  hasSAS: boolean,
  hasDocument: boolean
): string {
  if (category === 'direct-student-contact') {
    if (hasAppointment && hasSAS) {
      return 'Student emailed to follow up on SAS registration and book a meeting.';
    } else if (hasAppointment) {
      return 'Student emailed to request appointment.';
    } else if (hasSAS) {
      return 'Student emailed regarding SAS services.';
    } else if (hasDocument) {
      return 'Student emailed regarding documentation.';
    }
    return 'Student initiated email contact.';
  }
  return 'Email communication received.';
}

function generateClientReport(content: string, _studentName: string): string {
  // Extract actual content from email, avoiding headers and signatures
  const contentLines = content.split('\\n')
    .filter(line => line.trim() && !line.includes('From:') && !line.includes('Date:'))
    .slice(0, 5); // Get first 5 meaningful lines
  
  const report = contentLines.join(' ').trim();
  
  if (report.length > 200) {
    return `Student reported: "${report.substring(0, 200)}..." [see full email below]`;
  }
  
  return `Student reported: "${report}"`;
}

function generateObservations(content: string, hasUrgency: boolean): string {
  const observations = [];
  
  if (hasUrgency) {
    observations.push('Student expressed urgency in communication');
  }
  
  if (content.length < 100) {
    observations.push('Student communication was brief and direct');
  } else {
    observations.push('Student provided detailed information');
  }
  
  if (/thank|appreciate|grateful/i.test(content)) {
    observations.push('Student expressed appreciation');
  }
  
  if (/sorry|apologize/i.test(content)) {
    observations.push('Student apologized in communication');
  }
  
  return observations.length > 0 
    ? observations.join('. ') + '.'
    : 'Student was clear and professional in communication.';
}

function generateAssessment(
  content: string,
  hasAppointment: boolean,
  hasSAS: boolean,
  hasDocument: boolean
): string {
  const assessments = [];
  
  if (hasAppointment) {
    assessments.push('Student is actively seeking support');
  }
  
  if (hasSAS && hasDocument) {
    assessments.push('Student appears to be progressing with accessibility registration requirements');
  }
  
  if (/struggling|difficult|challenge|help/i.test(content)) {
    assessments.push('Student may be experiencing challenges requiring additional support');
  }
  
  if (/progress|update|completed/i.test(content)) {
    assessments.push('Student is demonstrating progress and self-advocacy');
  }
  
  return assessments.length > 0
    ? assessments.join('. ') + '.'
    : 'Student appears engaged and communicative regarding their support needs.';
}

function generateActions(
  _category: string,
  hasAppointment: boolean,
  hasSAS: boolean,
  hasDocument: boolean
): string {
  const actions = [];
  
  if (hasAppointment) {
    actions.push('Reviewed calendar and proposed available meeting times');
  }
  
  if (hasSAS) {
    actions.push('Reviewed SAS registration status');
  }
  
  if (hasDocument) {
    actions.push('Confirmed documentation requirements');
  }
  
  actions.push('Responded to student email');
  
  return actions.join('. ') + '.';
}

function generateNextSteps(
  hasAppointment: boolean,
  hasSAS: boolean,
  hasDocument: boolean
): string {
  const steps = [];
  
  if (hasAppointment) {
    steps.push('Awaiting student confirmation of meeting time');
  }
  
  if (hasSAS) {
    steps.push('Monitor SAS registration progress');
  }
  
  if (hasDocument) {
    steps.push('Follow up on documentation submission');
  }
  
  if (steps.length === 0) {
    steps.push('Continue to monitor student progress and provide support as needed');
  }
  
  return steps.join('. ') + '.';
}

export function formatPOCNote(template: POCTemplate): string {
  const sections = [
    `Purpose of Contact:\\n${template.purposeOfContact}`,
    `\\nClient Report (Subjective):\\n${template.clientReport}`,
    `\\nStaff Observations (Objective):\\n${template.staffObservations}`,
    `\\nAssessment / Analysis:\\n${template.assessment}`,
    `\\nActions Taken / Intervention:\\n${template.actionsTaken}`,
    `\\nNext Steps / Plan:\\n${template.nextSteps}`
  ];
  
  if (template.attachments) {
    sections.push(`\\nAttachments / Notes:\\n${template.attachments}`);
  }
  
  return sections.join('\\n');
}

export function shouldLogPOC(action: string): 'yes' | 'no' | 'maybe' {
  if (POC_CRITERIA.requiresPOC.some(criteria => action.toLowerCase().includes(criteria.toLowerCase()))) {
    return 'yes';
  }
  
  if (POC_CRITERIA.noPOCRequired.some(criteria => action.toLowerCase().includes(criteria.toLowerCase()))) {
    return 'no';
  }
  
  if (POC_CRITERIA.mayRequirePOC.some(criteria => action.toLowerCase().includes(criteria.toLowerCase()))) {
    return 'maybe';
  }
  
  // Default to yes if unsure
  return 'yes';
}

export function applyProfessionalTone(text: string): string {
  // Convert first person to third person
  let professional = text
    .replace(/\\bI\\s+/g, 'This writer ')
    .replace(/\\bme\\b/g, 'this writer')
    .replace(/\\bmy\\b/g, "this writer's")
    .replace(/\\bwe\\b/g, 'staff');
  
  // Remove casual language
  professional = professional
    .replace(/\\bgonna\\b/g, 'going to')
    .replace(/\\bwanna\\b/g, 'want to')
    .replace(/\\bgotta\\b/g, 'have to')
    .replace(/\\byeah\\b/g, 'yes')
    .replace(/\\bnope\\b/g, 'no');
  
  return professional;
}