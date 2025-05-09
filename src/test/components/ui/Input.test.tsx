import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../../components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies error styles when error is present', () => {
    render(<Input error="Error message" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('forwards additional props', () => {
    render(<Input placeholder="Enter text" maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});