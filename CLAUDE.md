# Clockwork Elite Development Guide

## Project Overview
Clockwork Elite is a single-page HTML application for generating case notes and task entries. It uses vanilla JavaScript with no build process required.

## Quick Commands
- Test locally: Open index.html in browser
- Push changes: `git add . && git commit -m "Update" && git push`
- View live: https://rpeart73.github.io/clockwork-elite/

## Code Architecture

### Main Components
- **Input Section**: Universal textarea for emails/content
- **Analysis Panel**: Real-time content analysis and POC detection
- **Smart Form**: Dynamic fields based on content type
- **Output Modal**: Generated entries with save/copy options

### Key Functions
- `analyzeEmail()`: Extracts dates, sender, topics from email
- `generateCaseNotes()`: Creates formatted case notes with POCs
- `generateTasks()`: Distributes tasks across business days
- `calculateBusinessDays()`: Excludes weekends from date ranges

## Styling Guidelines
- Use CSS variables for consistency
- Maintain existing class naming patterns
- Keep animations subtle (0.3s transitions)
- Preserve gradient theme (#667eea → #764ba2)

## Testing Checklist
Before pushing changes:
- [ ] No console errors
- [ ] All buttons functional
- [ ] POC detection working
- [ ] Output displays correctly
- [ ] Language selection applies
- [ ] Total days validation works

## Common Fixes

### Adding New Features
1. Update HTML structure
2. Add event listeners in `setupEventListeners()`
3. Implement logic functions
4. Update UI in `updateUIForContentType()`

### Debugging POCs
- Check `extractDates()` regex patterns
- Verify `uniquePOCs` Map logic
- Test with various date formats

### Performance
- Use `debounce()` for input handlers
- Minimize DOM queries
- Cache frequently used elements

## Git Workflow
```bash
# After making changes
git add index.html
git commit -m "Feature: [description]"
git push

# Site updates automatically via GitHub Pages
```

## Important Notes
- NO external dependencies (keep it simple)
- NO file upload for binary files (removed)
- Email verbatim ALWAYS included in output
- Case notes use detected facts only (no hallucination)
- Total days worked cannot exceed business days

## User Feedback Integration
When users report issues:
1. Reproduce the problem locally
2. Fix in development
3. Test thoroughly
4. Push to production
5. Notify user of resolution