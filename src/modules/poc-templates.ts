/**
 * POC Templates for Canadian Academic Support Contexts
 * All templates use Canadian English spelling and terminology
 */

export interface POCTemplate {
  id: string;
  name: string;
  category: 'initial' | 'follow-up' | 'resolution' | 'administrative' | 'referral' | 'progress';
  objective: string;
  whatTranspired: string;
  outcomePlan: string;
  variables: string[]; // Variables to be replaced in template
}

export const POC_TEMPLATES: POCTemplate[] = [
  // Initial Contact Templates
  {
    id: 'initial-inquiry',
    name: 'Initial Inquiry - Academic Support',
    category: 'initial',
    objective: '{{studentName}} contacted regarding {{topic}}. Student inquired about {{specific_question}}.',
    whatTranspired: 'Discussed {{main_points}}. Provided information about {{resources_mentioned}}. Student expressed {{concerns_or_goals}}.',
    outcomePlan: 'Advised student to {{next_steps}}. Scheduled follow-up for {{follow_up_date}}. Student will {{student_action}}.',
    variables: ['studentName', 'topic', 'specific_question', 'main_points', 'resources_mentioned', 'concerns_or_goals', 'next_steps', 'follow_up_date', 'student_action']
  },
  {
    id: 'initial-registration',
    name: 'Initial Contact - Registration Issues',
    category: 'initial',
    objective: '{{studentName}} reached out regarding registration challenges for {{term_or_course}}. Student is experiencing {{specific_issue}}.',
    whatTranspired: 'Reviewed student\'s registration status and identified {{root_cause}}. Discussed available options including {{options_discussed}}. Clarified {{policies_or_deadlines}}.',
    outcomePlan: 'Student will {{immediate_action}}. Referred to {{department_or_service}} for {{specific_support}}. Follow-up scheduled for {{date}} to ensure resolution.',
    variables: ['studentName', 'term_or_course', 'specific_issue', 'root_cause', 'options_discussed', 'policies_or_deadlines', 'immediate_action', 'department_or_service', 'specific_support', 'date']
  },

  // Follow-up Templates
  {
    id: 'follow-up-brief',
    name: 'Brief Follow-up Confirmation',
    category: 'follow-up',
    objective: 'Follow-up contact from {{studentName}} regarding our previous discussion about {{topic}}.',
    whatTranspired: 'Student confirmed {{what_was_confirmed}}. No additional concerns raised.',
    outcomePlan: 'Confirmation noted. {{any_minor_action}}.',
    variables: ['studentName', 'topic', 'what_was_confirmed', 'any_minor_action']
  },
  {
    id: 'follow-up-progress',
    name: 'Progress Update Follow-up',
    category: 'follow-up',
    objective: '{{studentName}} provided update on {{situation}} discussed on {{previous_date}}.',
    whatTranspired: 'Student reported {{progress_made}}. Current status: {{current_status}}. Challenges encountered: {{challenges_if_any}}.',
    outcomePlan: 'Acknowledged progress. {{additional_support_if_needed}}. Next check-in: {{next_date_if_applicable}}.',
    variables: ['studentName', 'situation', 'previous_date', 'progress_made', 'current_status', 'challenges_if_any', 'additional_support_if_needed', 'next_date_if_applicable']
  },

  // Administrative Templates
  {
    id: 'meeting-scheduling',
    name: 'Meeting Scheduling/Rescheduling',
    category: 'administrative',
    objective: '{{studentName}} contacted to {{schedule_or_reschedule}} our meeting regarding {{topic}}.',
    whatTranspired: 'Discussed availability. {{original_date_if_rescheduling}}. Confirmed mutual availability for {{new_date_time}}.',
    outcomePlan: 'Meeting confirmed for {{confirmed_date_time}}. {{meeting_format}} meeting. Student will {{preparation_if_any}}.',
    variables: ['studentName', 'schedule_or_reschedule', 'topic', 'original_date_if_rescheduling', 'new_date_time', 'confirmed_date_time', 'meeting_format', 'preparation_if_any']
  },
  {
    id: 'document-submission',
    name: 'Document Submission/Review',
    category: 'administrative',
    objective: '{{studentName}} submitted {{document_type}} for review as discussed.',
    whatTranspired: 'Received and acknowledged {{document_details}}. Initial review indicates {{initial_observations}}.',
    outcomePlan: 'Will complete detailed review by {{review_deadline}}. Student will receive feedback via {{communication_method}}.',
    variables: ['studentName', 'document_type', 'document_details', 'initial_observations', 'review_deadline', 'communication_method']
  },

  // Referral Templates
  {
    id: 'referral-internal',
    name: 'Internal Service Referral',
    category: 'referral',
    objective: '{{studentName}} requires specialized support for {{issue}} beyond current scope.',
    whatTranspired: 'Discussed student\'s needs regarding {{specific_needs}}. Explained services available through {{service_name}}. Student expressed {{student_comfort_level}} with referral.',
    outcomePlan: 'Referred to {{service_name}} with student\'s consent. Warm handoff to {{contact_person}} arranged for {{date}}. Will follow up after initial appointment.',
    variables: ['studentName', 'issue', 'specific_needs', 'service_name', 'student_comfort_level', 'contact_person', 'date']
  },
  {
    id: 'referral-external',
    name: 'External Resource Referral',
    category: 'referral',
    objective: '{{studentName}} seeking support for {{issue}} requiring external resources.',
    whatTranspired: 'Provided information about {{external_resources}}. Discussed {{access_process}}. Addressed concerns about {{student_concerns}}.',
    outcomePlan: 'Student will {{student_next_steps}}. Provided {{materials_or_contacts}}. Available for support during transition.',
    variables: ['studentName', 'issue', 'external_resources', 'access_process', 'student_concerns', 'student_next_steps', 'materials_or_contacts']
  },

  // Progress Templates
  {
    id: 'progress-positive',
    name: 'Positive Progress Report',
    category: 'progress',
    objective: '{{studentName}} shared positive developments regarding {{situation}}.',
    whatTranspired: 'Student reported {{achievements}}. {{specific_improvements}} noted since {{timeframe}}. Student expressed {{feelings_or_feedback}}.',
    outcomePlan: 'Celebrated progress. Encouraged continuation of {{successful_strategies}}. {{future_planning}}.',
    variables: ['studentName', 'situation', 'achievements', 'specific_improvements', 'timeframe', 'feelings_or_feedback', 'successful_strategies', 'future_planning']
  },
  {
    id: 'progress-challenges',
    name: 'Ongoing Challenges Update',
    category: 'progress',
    objective: '{{studentName}} reported continued challenges with {{situation}} despite interventions.',
    whatTranspired: 'Reviewed {{attempted_solutions}} implemented since {{timeframe}}. Identified {{persistent_barriers}}. Explored {{new_approaches}}.',
    outcomePlan: 'Adjusted support plan to include {{new_strategies}}. {{additional_referrals_if_any}}. Increased check-in frequency to {{frequency}}.',
    variables: ['studentName', 'situation', 'attempted_solutions', 'timeframe', 'persistent_barriers', 'new_approaches', 'new_strategies', 'additional_referrals_if_any', 'frequency']
  },

  // Resolution Templates
  {
    id: 'resolution-complete',
    name: 'Issue Resolved - Case Closure',
    category: 'resolution',
    objective: '{{studentName}} confirmed resolution of {{issue}} originally raised on {{original_date}}.',
    whatTranspired: 'Student reported {{resolution_details}}. Reviewed {{support_provided}} throughout process. Student expressed {{satisfaction_level}}.',
    outcomePlan: 'Case closed. Student aware of {{future_resources}} if needed. Open door for future support.',
    variables: ['studentName', 'issue', 'original_date', 'resolution_details', 'support_provided', 'satisfaction_level', 'future_resources']
  },
  {
    id: 'resolution-partial',
    name: 'Partial Resolution',
    category: 'resolution',
    objective: '{{studentName}} achieved partial resolution of {{issue}} with {{remaining_concerns}}.',
    whatTranspired: '{{resolved_aspects}} successfully addressed. {{unresolved_aspects}} require {{additional_time_or_resources}}. Student {{student_perspective}}.',
    outcomePlan: 'Continue monitoring {{ongoing_items}}. {{transition_plan}}. Re-evaluate in {{timeframe}}.',
    variables: ['studentName', 'issue', 'remaining_concerns', 'resolved_aspects', 'unresolved_aspects', 'additional_time_or_resources', 'student_perspective', 'ongoing_items', 'transition_plan', 'timeframe']
  }
];

// Template helper functions
export function getTemplatesByCategory(category: POCTemplate['category']): POCTemplate[] {
  return POC_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): POCTemplate | undefined {
  return POC_TEMPLATES.find(template => template.id === id);
}

export function applyTemplate(template: POCTemplate, values: Record<string, string>): {
  objective: string;
  whatTranspired: string;
  outcomePlan: string;
} {
  let objective = template.objective;
  let whatTranspired = template.whatTranspired;
  let outcomePlan = template.outcomePlan;

  // Replace all variables with their values
  template.variables.forEach(variable => {
    const value = values[variable] || `{{${variable}}}`;
    const regex = new RegExp(`{{${variable}}}`, 'g');
    objective = objective.replace(regex, value);
    whatTranspired = whatTranspired.replace(regex, value);
    outcomePlan = outcomePlan.replace(regex, value);
  });

  return {
    objective,
    whatTranspired,
    outcomePlan
  };
}

// Quick fill helpers for common scenarios
export const QUICK_FILLS = {
  confirmations: [
    "Confirmed receipt of required documents",
    "Confirmed meeting time and location",
    "Confirmed understanding of next steps",
    "Confirmed completion of requested action"
  ],
  commonIssues: [
    "course registration",
    "academic accommodation",
    "program requirements",
    "deadline extension",
    "course withdrawal",
    "grade appeal",
    "transfer credits",
    "graduation requirements"
  ],
  departments: [
    "Student Accessibility Services",
    "Faculty of Science",
    "Registrar's Office",
    "Academic Advising",
    "Financial Aid",
    "International Student Services",
    "Graduate Studies",
    "Student Success Centre"
  ],
  nextSteps: [
    "complete required forms",
    "submit documentation",
    "contact department directly",
    "attend scheduled appointment",
    "review provided resources",
    "follow up via email",
    "wait for department response"
  ]
};