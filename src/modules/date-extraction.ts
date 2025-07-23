import { format, isValid, addDays, addMonths, startOfDay } from 'date-fns';

/**
 * Date extraction module - REAL WORKING CODE from the original implementation
 * This handles all the date parsing logic that was proven to work
 */

export interface ExtractedDate {
  date: Date;
  formatted: string;
  context: string;
  isLastDate?: boolean;
}

export class DateExtractor {
  private static readonly HEADER_PATTERNS = [
    /(?:Sent|Date):\s*(\w+,\s+\w+\s+\d{1,2},\s+\d{4})/gi,
    /(?:Sent|Date):\s*(\w+\s+\d{1,2},\s+\d{4})/gi,
    /(?:Sent|Date):\s*(\w+,\s+\d{1,2}[/-]\d{1,2}[/-]\d{4})/gi,
    /(?:Sent|Date):\s*(\w+,\s+\w+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2})/gi,
    /(?:On|From).*?(?:Sent|Date):\s*(\w+,\s+\w+\s+\d{1,2},\s+\d{4})/gi
  ];

  /**
   * Extracts dates ONLY from email headers - exactly as working in original
   */
  static extractDates(content: string): ExtractedDate[] {
    const dates: ExtractedDate[] = [];
    const uniqueDates = new Set<string>();

    // First check for manually entered last date
    const lastDateMatch = content.match(/\[Last date in response:\s*([^\]]+)\]/i);
    if (lastDateMatch) {
      const dateStr = lastDateMatch[1]?.trim() || '';
      const parsed = this.parseDate(dateStr);
      if (parsed) {
        dates.push({
          date: parsed,
          formatted: this.formatDate(parsed),
          context: `Last response: ${dateStr}`,
          isLastDate: true
        });
        console.log('Parsed last date:', dateStr, '→', this.formatDate(parsed));
      } else {
        console.log('Failed to parse last date:', dateStr);
      }
    }

    // Extract from email headers only
    this.HEADER_PATTERNS.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const dateStr = match[1] || '';
        const parsed = this.parseDate(dateStr);
        if (parsed) {
          const dateKey = this.formatDate(parsed);
          if (!uniqueDates.has(dateKey)) {
            uniqueDates.add(dateKey);
            dates.push({
              date: parsed,
              formatted: dateKey,
              context: `Email header: ${dateStr}`
            });
            console.log('Added header date:', dateStr, '→', dateKey);
          }
        }
      }
    });

    return dates;
  }

  /**
   * Parse date with all the flexibility from the original implementation
   */
  static parseDate(dateStr: string): Date | null {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Handle relative dates
    const lowerStr = dateStr.toLowerCase().trim();
    if (lowerStr === 'today') return today;
    if (lowerStr === 'yesterday') {
      return addDays(today, -1);
    }
    if (lowerStr === 'tomorrow') {
      return addDays(today, 1);
    }
    
    // Handle day names (Monday, Tuesday, etc.)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = dayNames.indexOf(lowerStr);
    if (dayIndex >= 0) {
      const todayDay = today.getDay();
      let daysToAdd = dayIndex - todayDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      return addDays(today, daysToAdd);
    }
    
    // Handle "next Monday", "last Friday"
    const nextLastMatch = dateStr.match(/^(next|last)\s+(\w+day)$/i);
    if (nextLastMatch && nextLastMatch[1] && nextLastMatch[2]) {
      const day = nextLastMatch[2].toLowerCase();
      const dayIdx = dayNames.indexOf(day);
      if (dayIdx >= 0) {
        const todayDay = today.getDay();
        if (nextLastMatch[1].toLowerCase() === 'next') {
          const daysToAdd = (dayIdx - todayDay + 7) % 7 || 7;
          return addDays(today, daysToAdd);
        } else { // last
          const daysToSubtract = (todayDay - dayIdx + 7) % 7 || 7;
          return addDays(today, -daysToSubtract);
        }
      }
    }
    
    // Handle "the 15th", "the 3rd"
    const ordinalMatch = dateStr.match(/^(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?$/i);
    if (ordinalMatch) {
      const day = parseInt(ordinalMatch[1] || '0');
      if (day >= 1 && day <= 31) {
        let result = new Date(currentYear, currentMonth, day);
        // If the day has already passed this month, assume next month
        if (result < today) {
          result = addMonths(result, 1);
        }
        return startOfDay(result);
      }
    }
    
    // Handle "January 15", "Jan 30", etc. without year
    const monthDayMatch = dateStr.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?$/i);
    if (monthDayMatch) {
      const monthStr = monthDayMatch[1] || '';
      const day = parseInt(monthDayMatch[2] || '0');
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                         'july', 'august', 'september', 'october', 'november', 'december'];
      const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      
      let monthIndex = monthNames.indexOf(monthStr.toLowerCase());
      if (monthIndex === -1) {
        monthIndex = monthAbbr.indexOf(monthStr.toLowerCase().substring(0, 3));
      }
      
      if (monthIndex >= 0 && day >= 1 && day <= 31) {
        let result = new Date(currentYear, monthIndex, day);
        // If the date has passed this year, assume next year
        if (result < today) {
          result = new Date(currentYear + 1, monthIndex, day);
        }
        return startOfDay(result);
      }
    }
    
    // Handle MM/DD or MM-DD format (without year)
    const monthDaySlashMatch = dateStr.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (monthDaySlashMatch) {
      const month = parseInt(monthDaySlashMatch[1] || '1') - 1; // 0-indexed
      const day = parseInt(monthDaySlashMatch[2] || '1');
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        let result = new Date(currentYear, month, day);
        // If the date has passed this year, assume next year
        if (result < today) {
          result = new Date(currentYear + 1, month, day);
        }
        return startOfDay(result);
      }
    }
    
    // Handle special phrases
    if (dateStr.match(/end\s+of\s+(?:the\s+)?week/i)) {
      const dayOfWeek = today.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
      return addDays(today, daysUntilFriday);
    }
    
    if (dateStr.match(/end\s+of\s+(?:the\s+)?month/i)) {
      return new Date(currentYear, currentMonth + 1, 0); // Last day of current month
    }
    
    if (dateStr.match(/beginning\s+of\s+(?:next\s+)?week/i)) {
      const dayOfWeek = today.getDay();
      const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
      return addDays(today, daysUntilMonday);
    }
    
    if (dateStr.match(/beginning\s+of\s+(?:next\s+)?month/i)) {
      return new Date(currentYear, currentMonth + 1, 1); // First day of next month
    }
    
    // Try standard date parsing as fallback
    try {
      const parsed = new Date(dateStr);
      if (isValid(parsed)) {
        return startOfDay(parsed);
      }
    } catch (e) {
      // Invalid date
    }
    
    return null;
  }

  /**
   * Format date consistently
   */
  static formatDate(date: Date): string {
    return format(date, 'MMMM d, yyyy');
  }

  /**
   * Check if content has the last date marker
   */
  static hasLastDateMarker(content: string): boolean {
    return content.includes('[Last date in response:');
  }
}