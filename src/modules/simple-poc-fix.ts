/**
 * Simple fix for POC generation - YOUR personal tool
 * Prevents duplicate content and extracts date-specific information
 * Now follows Ontario Disability Office POC Methodology
 */

import { shouldConsolidatePOCs, generateProfessionalPOC, formatPOCForClockwork } from './ontario-poc-methodology';

export interface DateSpecificContent {
  date: string;
  objective: string;
  whatTranspired: string;
  outcomePlan: string;
}

export function extractDateSpecificContent(
  emailContent: string,
  detectedDates: string[]
): DateSpecificContent[] {
  const results: DateSpecificContent[] = [];
  const lines = emailContent.split('\n');
  
  // Group content by dates
  const contentByDate: Record<string, string[]> = {};
  let currentDate = '';
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line contains a date header
    let foundDate = false;
    for (const date of detectedDates) {
      if (line && line.includes(date)) {
        // Save previous content
        if (currentDate && currentContent.length > 0) {
          contentByDate[currentDate] = currentContent;
        }
        // Start new section
        currentDate = date;
        currentContent = [];
        foundDate = true;
        break;
      }
    }
    
    if (!foundDate && currentDate) {
      if (line !== undefined) {
        currentContent.push(line);
      }
    }
  }
  
  // Don't forget last section
  if (currentDate && currentContent.length > 0) {
    contentByDate[currentDate] = currentContent;
  }
  
  // Generate unique content for each date
  for (const date of detectedDates) {
    const content = contentByDate[date] || [];
    const contentText = (content || []).join('\n');
    
    // Extract unique information for this date
    const objective = extractObjective(contentText, date);
    const whatTranspired = extractWhatTranspired(contentText);
    const outcomePlan = extractOutcomePlan(contentText);
    
    results.push({
      date,
      objective,
      whatTranspired,
      outcomePlan
    });
  }
  
  return results;
}

function extractObjective(content: string, _date: string): string {
  // Look for the actual topic in this specific email exchange
  const topicPatterns = [
    /regarding\s+([^.]+)/i,
    /about\s+([^.]+)/i,
    /re:\s*([^.]+)/i,
    /inquired?\s+about\s+([^.]+)/i,
    /asked\s+about\s+([^.]+)/i,
    /question\s+about\s+([^.]+)/i
  ];
  
  for (const pattern of topicPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const topic = match[1].trim();
      
      // Look for questions in the content
      const questions = content.match(/[^.?!]*\?/g) || [];
      const relevantQuestion = questions.find(q => q.length > 10 && q.length < 200);
      
      if (relevantQuestion) {
        return `Student contacted regarding ${topic}. Student inquired about ${relevantQuestion.replace('?', '').trim()}.`;
      }
      
      return `Student contacted regarding ${topic}.`;
    }
  }
  
  // Fallback - try to be more specific based on content
  if (content.includes('meeting') || content.includes('meet')) {
    return 'Student contacted to schedule/discuss meeting arrangements.';
  }
  
  if (content.includes('follow') || content.includes('update')) {
    return 'Follow-up contact regarding previous discussion.';
  }
  
  if (content.includes('confirm')) {
    return 'Student confirmed information from previous correspondence.';
  }
  
  return 'Student reached out for academic support.';
}

function extractWhatTranspired(content: string): string {
  // Look for actions and responses
  const actionPatterns = [
    /I\s+(?:suggested|provided|offered|explained|reviewed)\s+([^.]+)/i,
    /discussed\s+([^.]+)/i,
    /clarified\s+([^.]+)/i,
    /confirmed\s+([^.]+)/i
  ];
  
  const transpired: string[] = [];
  
  for (const pattern of actionPatterns) {
    const matches = content.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      if (match[1]) {
        transpired.push(match[0].trim());
      }
    }
  }
  
  if (transpired.length > 0) {
    return transpired.slice(0, 2).join('. ') + '.';
  }
  
  // Look for specific scenarios
  if (content.includes('Thursday') && content.includes('Monday')) {
    return 'I suggested Thursday as an alternative meeting time.';
  }
  
  if (content.includes('confirmed') || content.includes('yes')) {
    return 'Confirmed details discussed in previous communication.';
  }
  
  return 'Discussed student\'s inquiry and provided appropriate guidance.';
}

function extractOutcomePlan(content: string): string {
  // Look for future actions
  const futurePatterns = [
    /will\s+([^.]+)/i,
    /plan(?:ned)?\s+to\s+([^.]+)/i,
    /scheduled\s+(?:for|to)\s+([^.]+)/i,
    /next\s+(?:step|meeting|session)\s+([^.]+)/i,
    /follow.?up\s+([^.]+)/i
  ];
  
  for (const pattern of futurePatterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      // Clean up and format
      let outcome = match[0].trim();
      outcome = outcome.charAt(0).toUpperCase() + outcome.slice(1);
      
      // Add period if missing
      if (!outcome.endsWith('.')) {
        outcome += '.';
      }
      
      return outcome;
    }
  }
  
  // Look for specific dates mentioned
  const datePattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i;
  const dateMatch = content.match(datePattern);
  
  if (dateMatch) {
    return `Planned to meet on ${dateMatch[0]}.`;
  }
  
  // Fallbacks based on content
  if (content.includes('meet')) {
    return 'Will schedule follow-up meeting as discussed.';
  }
  
  if (content.includes('confirm')) {
    return 'No further action required; confirmation noted.';
  }
  
  return 'Will monitor for any follow-up needs.';
}

// Helper to update the store's generateCaseNotes function
export function generateUniqueNotes(
  universalInput: string,
  detectedPOCs: any[],
  studentName: string,
  serviceType: string,
  selectedDates?: string[]
): string {
  // Parse emails from the universal input
  const emails = parseEmailThread(universalInput);
  
  // Check if we should consolidate into one POC
  if (emails.length > 0 && shouldConsolidatePOCs(emails)) {
    // Generate a single professional POC for the entire thread
    const structuredPOC = generateProfessionalPOC(emails, studentName);
    const formattedPOC = formatPOCForClockwork(structuredPOC, studentName);
    
    // Add email verbatim at the end
    return formattedPOC + '\n\n' + '-'.repeat(80) + '\n' + 
           'ORIGINAL EMAIL:\n\n' + universalInput;
  }
  
  // Fallback to original logic if not consolidating
  // Extract all detected dates
  const allDates = detectedPOCs
    .filter(poc => poc.type !== 'pending')
    .map(poc => poc.dateStr);
  
  // Use selected dates if provided, otherwise use all
  const datesToUse = selectedDates && selectedDates.length > 0 ? selectedDates : allDates;
  
  // Get unique content for each date
  const dateContents = extractDateSpecificContent(universalInput, datesToUse);
  
  let output = '';
  
  // Header if multiple POCs
  if (dateContents.length > 1) {
    output += `// ${dateContents.length} Points of Contact Detected\n`;
    output += `// Student: ${studentName}\n`;
    output += `// Service: ${serviceType}\n`;
    output += '='.repeat(80) + '\n\n';
  }
  
  // Generate each POC with unique content
  dateContents.forEach((content, index) => {
    output += `${content.date} | ${serviceType} | 1 hour | Academic Support | ${studentName}\n\n`;
    
    output += 'OBJECTIVE:\n';
    output += content.objective + '\n\n';
    
    output += 'WHAT TRANSPIRED:\n';
    output += content.whatTranspired + '\n\n';
    
    output += 'OUTCOME/PLAN:\n';
    output += content.outcomePlan;
    
    if (index < dateContents.length - 1) {
      output += '\n\n' + '='.repeat(80) + '\n\n';
    }
  });
  
  // Add email verbatim at the end
  if (universalInput && dateContents.length > 0) {
    output += '\n\n' + '-'.repeat(80) + '\n';
    output += 'ORIGINAL EMAIL:\n\n';
    output += universalInput;
  }
  
  return output;
}

/**
 * Parse email thread into structured format
 */
function parseEmailThread(content: string): Array<{
  date: Date;
  subject: string;
  content: string;
  from: string;
  to: string;
}> {
  const emails: Array<{
    date: Date;
    subject: string;
    content: string;
    from: string;
    to: string;
  }> = [];
  
  // Split by common email headers
  const emailSections = content.split(/(?=From:|Sent:|Date:)/gi);
  
  emailSections.forEach(section => {
    if (!section.trim()) return;
    
    // Extract email metadata
    const fromMatch = section.match(/From:\s*([^\n]+)/i);
    const toMatch = section.match(/To:\s*([^\n]+)/i);
    const subjectMatch = section.match(/Subject:\s*([^\n]+)/i);
    const dateMatch = section.match(/(?:Sent|Date):\s*([^\n]+)/i);
    
    if (fromMatch && dateMatch) {
      const emailContent = section
        .replace(/From:[^\n]+/i, '')
        .replace(/To:[^\n]+/i, '')
        .replace(/Subject:[^\n]+/i, '')
        .replace(/Sent:[^\n]+/i, '')
        .replace(/Date:[^\n]+/i, '')
        .trim();
      
      const dateStr = dateMatch[1];
      if (!dateStr) return;
      
      const parsedDate = new Date(dateStr);
      
      if (!isNaN(parsedDate.getTime())) {
        emails.push({
          date: parsedDate,
          subject: subjectMatch?.[1] || 'No Subject',
          content: emailContent,
          from: fromMatch[1] || '',
          to: toMatch?.[1] || ''
        });
      }
    }
  });
  
  return emails.sort((a, b) => a.date.getTime() - b.date.getTime());
}