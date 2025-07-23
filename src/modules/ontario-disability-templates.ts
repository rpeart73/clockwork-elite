/**
 * Ontario Disability Office Quick Fills and Templates
 * Based on professional standards for disability documentation
 */

export const ONTARIO_QUICK_FILLS = {
  // Stress/Mental Health Levels
  stressLevels: [
    'feeling overwhelmed',
    'experiencing moderate stress',
    'managing well',
    'high anxiety levels',
    'improved mood',
    'stable mental health'
  ],
  
  // Emotional States
  emotionalStates: [
    'engaged and communicative',
    'somewhat withdrawn',
    'anxious but cooperative',
    'calm and focused',
    'frustrated but willing to collaborate',
    'positive and motivated'
  ],
  
  // Assessment Factors
  assessmentFactors: [
    'Student demonstrates strong self-advocacy skills',
    'Current support strategies appear effective',
    'Additional accommodations may be beneficial',
    'Progress aligns with established goals',
    'Barriers to success have been identified',
    'Student shows resilience and adaptability'
  ],
  
  // Resources Commonly Reviewed
  resources: [
    'accommodation letter',
    'course schedule',
    'disability documentation',
    'support services available',
    'academic policies',
    'assistive technology options'
  ],
  
  // Common Client Actions/Next Steps
  clientActions: [
    'follow up with instructor regarding accommodations',
    'submit documentation to SAS',
    'schedule regular check-ins',
    'practice self-advocacy strategies',
    'utilize campus resources',
    'monitor progress and report challenges'
  ],
  
  // Professional Phrases
  professionalPhrases: {
    purposeOfContact: [
      'Student initiated contact to discuss',
      'Scheduled meeting to review',
      'Follow-up appointment regarding',
      'Student requested assistance with',
      'Proactive check-in about'
    ],
    
    clientReport: [
      'Student reported feeling',
      'Student expressed concerns about',
      'Student shared that they',
      'Student indicated satisfaction with',
      'Student described challenges with'
    ],
    
    staffObservations: [
      'Student appeared',
      'Noted that student',
      'Observed student demonstrating',
      'Student engagement level was',
      'Body language suggested'
    ],
    
    assessment: [
      'Current approach appears to be',
      'Analysis suggests that',
      'Evidence indicates',
      'Pattern of interaction shows',
      'Professional assessment reveals'
    ],
    
    actionsTaken: [
      'Reviewed and discussed',
      'Provided information about',
      'Collaborated to develop',
      'Facilitated connection with',
      'Documented and updated'
    ],
    
    nextSteps: [
      'Student will',
      'Plan to follow up',
      'Scheduled next meeting for',
      'Will monitor progress',
      'Agreed to reconvene'
    ]
  }
};

/**
 * Common POC scenarios with pre-filled templates
 */
export const POC_SCENARIO_TEMPLATES = {
  'accommodation-discussion': {
    purpose: 'Student initiated contact to discuss accommodation implementation for upcoming semester.',
    clientReport: 'Student reported feeling anxious about upcoming courses and wanted to ensure accommodations were properly communicated.',
    observations: 'Student appeared engaged and demonstrated good self-advocacy skills.',
    assessment: 'Student is proactively managing their academic needs and shows understanding of accommodation processes.',
    actions: 'Reviewed accommodation letter, discussed communication strategies with professors, and provided template email.',
    nextSteps: 'Student will email professors within first week of classes. Follow-up scheduled for two weeks into semester.'
  },
  
  'mental-health-checkin': {
    purpose: 'Regular mental health check-in as part of ongoing support plan.',
    clientReport: 'Student reported moderate stress levels related to academic workload but managing with current strategies.',
    observations: 'Student appeared calm and was using effective coping strategies discussed in previous sessions.',
    assessment: 'Current support plan remains appropriate. Student demonstrating improved resilience.',
    actions: 'Reviewed stress management techniques and validated student\'s progress.',
    nextSteps: 'Continue with monthly check-ins. Student will reach out if stress levels increase.'
  },
  
  'crisis-support': {
    purpose: 'Student contacted office in distress regarding academic challenges.',
    clientReport: 'Student reported feeling overwhelmed by multiple deadlines and recent personal circumstances.',
    observations: 'Student appeared visibly distressed but was receptive to support and problem-solving.',
    assessment: 'Immediate intervention needed to address acute stress and prevent academic impact.',
    actions: 'Provided crisis support, helped prioritize tasks, facilitated extensions with instructors.',
    nextSteps: 'Follow-up appointment tomorrow. Referred to counselling services for additional support.'
  },
  
  'technology-assistance': {
    purpose: 'Student requested assistance with assistive technology for note-taking.',
    clientReport: 'Student expressed frustration with current note-taking methods and sought alternatives.',
    observations: 'Student demonstrated willingness to try new approaches and quick technology adoption.',
    assessment: 'Assistive technology could significantly improve student\'s academic experience.',
    actions: 'Demonstrated three different note-taking applications and helped configure preferred option.',
    nextSteps: 'Student will trial software for two weeks. Follow-up scheduled to assess effectiveness.'
  }
};