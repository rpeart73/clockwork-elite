import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the header', () => {
    render(<App />);
    const header = screen.getByText(/Clockwork Elite/i);
    expect(header).toBeInTheDocument();
  });

  it('renders the input panel', () => {
    render(<App />);
    const inputLabel = screen.getByText(/Paste Content or Describe Tasks/i);
    expect(inputLabel).toBeInTheDocument();
  });

  it('has mode toggle buttons', () => {
    render(<App />);
    expect(screen.getByText('Auto-Detect')).toBeInTheDocument();
    expect(screen.getByText('Email Mode')).toBeInTheDocument();
    expect(screen.getByText('Task Mode')).toBeInTheDocument();
  });
});