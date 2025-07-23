import React, { useState } from 'react';
import { format } from 'date-fns';
import './StudentTimeline.css';

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'email' | 'meeting' | 'phone' | 'chat' | 'poc' | 'note';
  title: string;
  description?: string;
  duration?: number;
  category?: string;
  isImportant?: boolean;
}

interface StudentTimelineProps {
  studentName: string;
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export const StudentTimeline: React.FC<StudentTimelineProps> = ({
  studentName,
  events,
  onEventClick
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'all'>('month');

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group events by date
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'email': return '✉️';
      case 'meeting': return '🤝';
      case 'phone': return '📞';
      case 'chat': return '💬';
      case 'poc': return '📋';
      case 'note': return '📝';
      default: return '📌';
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'email': return 'email';
      case 'meeting': return 'meeting';
      case 'phone': return 'phone';
      case 'chat': return 'chat';
      case 'poc': return 'poc';
      case 'note': return 'note';
      default: return 'default';
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event.id === selectedEvent ? null : event.id);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="student-timeline">
      <div className="timeline-header">
        <h3>Interaction Timeline - {studentName}</h3>
        <div className="timeline-controls">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as any)}
            className="view-mode-select"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="timeline-summary">
        <div className="summary-item">
          <span className="summary-label">Total Interactions:</span>
          <span className="summary-value">{events.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Last Contact:</span>
          <span className="summary-value">
            {sortedEvents.length > 0 && sortedEvents[0]
              ? format(sortedEvents[0].date, 'MMM d, yyyy')
              : 'No interactions'
            }
          </span>
        </div>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey} className="timeline-day">
            <div className="timeline-date">
              <span className="date-label">
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="event-count">{dayEvents.length} events</span>
            </div>
            
            <div className="timeline-events">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`timeline-event ${getEventColor(event.type)} ${
                    selectedEvent === event.id ? 'selected' : ''
                  } ${event.isImportant ? 'important' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="event-time">
                    {format(event.date, 'h:mm a')}
                  </div>
                  
                  <div className="event-marker">
                    <span className="event-icon">{getEventIcon(event.type)}</span>
                  </div>
                  
                  <div className="event-content">
                    <div className="event-title">
                      {event.title}
                      {event.duration && (
                        <span className="event-duration">({event.duration} min)</span>
                      )}
                    </div>
                    
                    {selectedEvent === event.id && event.description && (
                      <div className="event-description">
                        {event.description}
                      </div>
                    )}
                    
                    {event.category && (
                      <span className="event-category">{event.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="timeline-empty">
          <p>No interactions recorded for this student yet.</p>
        </div>
      )}
    </div>
  );
};