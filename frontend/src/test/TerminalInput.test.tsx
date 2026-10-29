import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalInput } from '../components/terminal/TerminalInput';

describe('TerminalInput', () => {
  it('renders textarea with character count and handles typing', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();

    render(
      <TerminalInput
        value="[02:14:00] INFO test log"
        onChange={handleChange}
        onClear={handleClear}
      />
    );

    const textarea = screen.getByPlaceholderText(/Paste terminal output/i);
    expect(textarea).toBeInTheDocument();
    expect(screen.getByText(/session_trace\.log/i)).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument(); // 24 chars in value

    fireEvent.change(textarea, { target: { value: 'new log' } });
    expect(handleChange).toHaveBeenCalledWith('new log');
  });

  it('calls onClear when clear button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <TerminalInput
        value="something to clear"
        onChange={vi.fn()}
        onClear={handleClear}
      />
    );

    const clearBtn = screen.getByTitle(/Clear terminal buffer/i);
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
