/**
 * POC Consolidation Module - Real working logic from original implementation
 * Handles the rule: Same day = 1 POC, different days = multiple POCs
 */

import { ExtractedDate } from './date-extraction';

export interface PointOfContact {
  id: string;
  date: Date;
  dateStr: string;
  type: 'email' | 'meeting' | 'call' | 'pending';
  context: string;
  content: string;
  selected: boolean;
  isLastDate?: boolean;
  exchanges?: number;
  combinedContext?: string[];
}

export class POCConsolidator {
  /**
   * Consolidates POCs based on the rule: same day = 1 POC with multiple exchanges
   */
  static consolidate(
    dates: ExtractedDate[], 
    content: string,
    hasLastDate: boolean
  ): PointOfContact[] {
    // If no last date yet, return pending POC
    if (!hasLastDate) {
      return [{
        id: Date.now().toString(),
        date: new Date(),
        dateStr: 'Waiting for last date...',
        type: 'pending',
        context: 'Please wait for the last date prompt',
        content: content,
        selected: false
      }];
    }

    // Convert dates to POCs
    const pocs: PointOfContact[] = dates.map((date, index) => ({
      id: `${Date.now()}-${index}`,
      date: date.date,
      dateStr: date.formatted,
      type: 'email' as const,
      context: date.context,
      content: content,
      selected: true,
      isLastDate: date.isLastDate || false
    }));

    // Consolidate by date
    const pocsByDate = new Map<string, PointOfContact>();
    
    pocs.forEach(poc => {
      const dateKey = poc.dateStr;
      
      if (!pocsByDate.has(dateKey)) {
        pocsByDate.set(dateKey, {
          ...poc,
          exchanges: 1,
          combinedContext: [poc.context]
        });
      } else {
        // Same date - combine into one POC
        const existing = pocsByDate.get(dateKey)!;
        existing.exchanges = (existing.exchanges || 1) + 1;
        existing.combinedContext = [...(existing.combinedContext || []), poc.context];
        
        // Update type if more specific (this logic was in original)
        if (poc.type !== 'email' && existing.type === 'email') {
          existing.type = poc.type;
        }
      }
    });

    // Convert back to array and format
    const consolidated = Array.from(pocsByDate.values()).map(poc => ({
      ...poc,
      context: poc.exchanges && poc.exchanges > 1 
        ? `${poc.exchanges} exchanges on this day: ${poc.combinedContext?.join('; ')}` 
        : poc.context
    }));

    // Sort by date
    consolidated.sort((a, b) => a.date.getTime() - b.date.getTime());

    return consolidated;
  }

  /**
   * Format POC for display
   */
  static formatPOC(poc: PointOfContact): string {
    if (poc.type === 'pending') {
      return poc.dateStr;
    }

    const label = poc.exchanges && poc.exchanges > 1 
      ? `${poc.type} (${poc.exchanges} exchanges)` 
      : poc.type;
    
    return `${label} - ${poc.dateStr}`;
  }

  /**
   * Get total exchange count across all POCs
   */
  static getTotalExchanges(pocs: PointOfContact[]): number {
    return pocs.reduce((total, poc) => total + (poc.exchanges || 1), 0);
  }
}