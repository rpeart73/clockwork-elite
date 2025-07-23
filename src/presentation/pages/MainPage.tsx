import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { POCSelector } from '@/presentation/components/POCSelector';
import { ManualPOCEditor, ManualPOC } from '@/presentation/components/ManualPOCEditor';
import { POC_CATEGORIES } from '@/modules/poc-documentation-guide';
import './MainPage.css';

const MainPage: React.FC = () => {
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [selectedDateForManual, setSelectedDateForManual] = useState<Date | null>(null);
  const [_manualEditMode, setManualEditMode] = useState<'create' | 'edit'>('create');
  
  const {
    universalInput,
    detectedPOCs,
    generatedOutput,
    workflow,
    currentMode,
    studentName,
    serviceType,
    noteStyle,
    detailLevel,
    language,
    startDate,
    endDate,
    totalDaysWorked,
    distributionPattern,
    setUniversalInput,
    analyzeContent,
    generateOutput,
    setStudentName,
    setServiceType,
    setNoteStyle,
    setDetailLevel,
    setLanguage,
    setStartDate,
    setEndDate,
    setTotalDaysWorked,
    setDistributionPattern,
    copyToClipboard,
    saveAsDraft,
    resetAll,
    selectedPOCDates,
    setSelectedPOCDates,
    addManualPOC
  } = useAppStore();

  const handleGenerate = () => {
    analyzeContent();
    generateOutput();
  };

  // Trigger POC detection when input changes in email mode
  useEffect(() => {
    if (currentMode === 'email' && universalInput.trim()) {
      // Trigger the analysis
      analyzeContent();
    }
  }, [universalInput, currentMode, analyzeContent]);

  return (
    <div className="main-container">
      <header className="app-header">
        <h1>Clockwork Elite v5.0.0</h1>
        <p>Enterprise Task & Case Note Management</p>
      </header>

      <main className="app-main">
        {/* Mode Switcher */}
        <section className="mode-switcher">
          <button 
            className={`mode-btn ${currentMode === 'email' ? 'active' : ''}`}
            onClick={() => useAppStore.getState().setCurrentMode('email')}
          >
            Case Notes
          </button>
          <button 
            className={`mode-btn ${currentMode === 'task' ? 'active' : ''}`}
            onClick={() => useAppStore.getState().setCurrentMode('task')}
          >
            Tasks
          </button>
        </section>

        {/* Input Section */}
        <section className="input-section">
          <h2>Universal Input</h2>
          <textarea
            value={universalInput}
            onChange={(e) => setUniversalInput(e.target.value)}
            placeholder={currentMode === 'email' ? "Paste your email content here..." : "Enter task description..."}
            className="universal-input"
            rows={10}
          />
          
          {/* POC Detection and Selection - Only for Case Notes mode */}
          {currentMode === 'email' && detectedPOCs.length > 0 && (
            <>
              <POCSelector 
                detectedPOCs={detectedPOCs}
                selectedDates={selectedPOCDates}
                onSelectionChange={setSelectedPOCDates}
                onAddPOC={() => {
                  setSelectedDateForManual(new Date());
                  setShowManualEditor(true);
                  setManualEditMode('create');
                }}
                onRemovePOC={() => {
                  if (selectedPOCDates.length > 0) {
                    // Remove the last selected POC
                    const lastSelectedDate = selectedPOCDates[selectedPOCDates.length - 1];
                    setSelectedPOCDates(selectedPOCDates.filter(d => d !== lastSelectedDate));
                  }
                }}
              />
              <div className="manual-poc-actions">
                <button 
                  className="btn-manual-edit"
                  onClick={() => {
                    if (selectedPOCDates.length > 0) {
                      const firstDate = detectedPOCs.find(poc => poc.dateStr === selectedPOCDates[0]);
                      if (firstDate) {
                        setSelectedDateForManual(firstDate.date);
                        setShowManualEditor(true);
                        setManualEditMode('edit');
                      }
                    }
                  }}
                  disabled={selectedPOCDates.length === 0}
                >
                  Manually Edit Selected POC
                </button>
                <button 
                  className="btn-manual-create"
                  onClick={() => {
                    setSelectedDateForManual(new Date());
                    setShowManualEditor(true);
                    setManualEditMode('create');
                  }}
                >
                  Create Manual POC
                </button>
              </div>
            </>
          )}
        </section>

        {/* Smart Form */}
        <section className="smart-form">
          <h2>{currentMode === 'email' ? 'Case Note Settings' : 'Task Distribution Settings'}</h2>
          
          {currentMode === 'email' && (
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
              />
              
              <label>Service Type</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="Email Support">Email Support</option>
                <option value="Live Session">Live Session</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Chat Support">Chat Support</option>
              </select>
              
              <label>POC Category</label>
              <select className="poc-category-select">
                {POC_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="poc-category-info">
                <small>This determines how the case note will be categorized in Clockwork</small>
              </div>
              
              <label>Note Style</label>
              <select value={noteStyle} onChange={(e) => setNoteStyle(e.target.value as any)}>
                <option value="natural">Natural</option>
                <option value="bullets">Bullets</option>
                <option value="concise">Concise</option>
              </select>
              
              <label>Detail Level</label>
              <select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value as any)}>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="enhanced">Enhanced</option>
              </select>
              
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                <option value="canadian">Canadian English</option>
                <option value="british">British English</option>
              </select>
            </div>
          )}
          
          {currentMode === 'task' && (
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              
              <label>Total Days Worked</label>
              <input
                type="number"
                value={totalDaysWorked}
                onChange={(e) => setTotalDaysWorked(parseInt(e.target.value) || 0)}
                min="0"
              />
              
              <label>Distribution Pattern</label>
              <select value={distributionPattern} onChange={(e) => setDistributionPattern(e.target.value as any)}>
                <option value="balanced">Balanced (Evenly Spaced)</option>
                <option value="front-loaded">Front Loaded</option>
                <option value="back-loaded">Back Loaded</option>
                <option value="ascending">Ascending (Light to Heavy)</option>
                <option value="descending">Descending (Heavy to Light)</option>
                <option value="randomized">Randomized</option>
              </select>
              
              <label>Summary Detail Level</label>
              <select className="summary-tier-select">
                <option value="basic">Basic (3 high-level points)</option>
                <option value="standard">Standard (5-7 points)</option>
                <option value="enhanced">Enhanced (8+ detailed points)</option>
              </select>
              
              <label>Work Hours</label>
              <div className="work-hours-inputs">
                <input
                  type="time"
                  defaultValue="08:00"
                  className="time-input"
                  title="Start Time"
                />
                <span>to</span>
                <input
                  type="time"
                  defaultValue="16:00"
                  className="time-input"
                  title="End Time"
                />
              </div>
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <section className="actions">
          <button onClick={handleGenerate} className="btn-primary">
            Generate {currentMode === 'email' ? 'Case Notes' : 'Tasks'}
          </button>
          <button onClick={saveAsDraft} className="btn-secondary">
            Save Draft
          </button>
          <button onClick={resetAll} className="btn-secondary">
            Reset
          </button>
        </section>

        {/* Output Section */}
        {generatedOutput && (
          <section className="output-section">
            <h2>Generated Output</h2>
            <div className="output-container">
              <pre>{generatedOutput}</pre>
              <button onClick={copyToClipboard} className="btn-copy">
                Copy to Clipboard
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Status Bar */}
      <footer className="status-bar">
        <span>{workflow.message}</span>
        {workflow.state !== 'idle' && (
          <progress value={workflow.progress} max={100} />
        )}
      </footer>
      
      {/* Manual POC Editor Modal */}
      {showManualEditor && selectedDateForManual && (
        <div className="modal-overlay">
          <div className="modal-content manual-poc-modal">
            <ManualPOCEditor
              selectedDate={selectedDateForManual}
              emailContent={universalInput}
              studentName={studentName}
              onSave={(poc: ManualPOC) => {
                // Add manual POC to store
                addManualPOC(poc);
                setShowManualEditor(false);
                // Regenerate output with the new manual POC
                generateOutput();
              }}
              onCancel={() => setShowManualEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;