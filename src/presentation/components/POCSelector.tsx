import React from 'react';
import { PointOfContact } from '@/modules/poc-consolidation';
import './POCSelector.css';

interface POCSelectorProps {
  detectedPOCs: PointOfContact[];
  selectedDates: string[];
  onSelectionChange: (dates: string[]) => void;
  onAddPOC?: () => void;
  onRemovePOC?: () => void;
}

export const POCSelector: React.FC<POCSelectorProps> = ({
  detectedPOCs,
  selectedDates,
  onSelectionChange,
  onAddPOC,
  onRemovePOC
}) => {
  const handleCheckboxChange = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onSelectionChange(selectedDates.filter(d => d !== dateStr));
    } else {
      onSelectionChange([...selectedDates, dateStr]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDates.length === detectedPOCs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(detectedPOCs.map(poc => poc.dateStr));
    }
  };

  return (
    <div className="poc-selector">
      <div className="poc-selector-header">
        <h3>Detected Points of Contact</h3>
        <div className="poc-controls">
          <div className="poc-count-adjuster">
            <button 
              className="poc-adjust-btn"
              onClick={onRemovePOC}
              disabled={!onRemovePOC || detectedPOCs.length === 0}
              title="Remove POC"
            >
              -
            </button>
            <span className="poc-count">{detectedPOCs.length} POCs</span>
            <button 
              className="poc-adjust-btn"
              onClick={onAddPOC}
              disabled={!onAddPOC}
              title="Add POC"
            >
              +
            </button>
          </div>
          <button 
            className="select-all-btn"
            onClick={handleSelectAll}
          >
            {selectedDates.length === detectedPOCs.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>
      
      <div className="poc-list">
        {detectedPOCs.map((poc, index) => (
          <div key={poc.id} className="poc-item">
            <label className="poc-checkbox-label">
              <input
                type="checkbox"
                className="poc-checkbox"
                checked={selectedDates.includes(poc.dateStr)}
                onChange={() => handleCheckboxChange(poc.dateStr)}
              />
              <span className="poc-number">POC {index + 1}</span>
              <span className="poc-date">{poc.dateStr}</span>
              {poc.exchanges && poc.exchanges > 1 && (
                <span className="poc-exchanges">({poc.exchanges} exchanges)</span>
              )}
              {poc.type === 'pending' && (
                <span className="poc-pending">Pending</span>
              )}
            </label>
          </div>
        ))}
      </div>
      
      {selectedDates.length > 0 && (
        <div className="poc-selection-summary">
          {selectedDates.length} POC{selectedDates.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};