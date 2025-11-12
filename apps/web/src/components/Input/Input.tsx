'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { InputProps } from './types';

/**
 * Generic Input component built on MUI TextField
 * - Supports text, number, email, and password inputs
 * - Optional label
 * - Custom styling props
 * - Number inputs can limit decimal places
 * - Configurable required state
 * - Disables wheel event for number inputs
 */
export const Input = React.forwardRef<HTMLDivElement, InputProps>(
  (
    {
      inputType = 'text',
      label,
      decimalPlaces,
      min,
      max,
      value: externalValue,
      setParentValue,
      onChange,
      onBlur,
      required = true,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(externalValue ?? '');

    // Use external value if controlled, otherwise use internal state
    const currentValue = externalValue !== undefined ? externalValue : internalValue;

    // Disable wheel event for number inputs
    useEffect(() => {
      const inputElement = inputRef.current;

      const handleWheelEvent = (e: WheelEvent) => {
        if (inputType === 'number') {
          e.preventDefault();
        }
      };

      if (inputElement) {
        inputElement.addEventListener('wheel', handleWheelEvent, { passive: false });
      }

      return () => {
        if (inputElement) {
          inputElement.removeEventListener('wheel', handleWheelEvent);
        }
      };
    }, [inputType]);

    /**
     * Format number based on decimal places limit
     */
    const formatNumber = useCallback(
      (val: string): string => {
        if (inputType !== 'number' || decimalPlaces === undefined) {
          return val;
        }

        // Allow empty string, minus sign, and incomplete decimals during typing
        if (val === '' || val === '-' || val.endsWith('.')) {
          return val;
        }

        const numValue = parseFloat(val);

        // Return original if not a valid number
        if (isNaN(numValue)) {
          return val;
        }

        // Check min/max constraints
        if (min !== undefined && numValue < min) {
          return String(min);
        }
        if (max !== undefined && numValue > max) {
          return String(max);
        }

        // Limit decimal places
        if (decimalPlaces === 0) {
          return String(Math.floor(numValue));
        }

        const parts = val.split('.');
        if (parts[1] && parts[1].length > decimalPlaces) {
          return numValue.toFixed(decimalPlaces);
        }

        return val;
      },
      [inputType, decimalPlaces, min, max]
    );

    /**
     * Validate number input during typing
     */
    const validateNumberInput = useCallback(
      (val: string): boolean => {
        if (inputType !== 'number') return true;

        // Allow empty, minus sign, and valid number format
        if (val === '' || val === '-') return true;

        // Allow incomplete decimal (e.g., "10.")
        if (/^-?\d*\.?$/.test(val)) return true;

        // Validate complete number format
        const regex =
          decimalPlaces !== undefined && decimalPlaces > 0
            ? new RegExp(`^-?\\d*\\.?\\d{0,${decimalPlaces}}$`)
            : /^-?\d*\.?\d*$/;

        return regex.test(val);
      },
      [inputType, decimalPlaces]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        // For number inputs, validate before accepting
        if (inputType === 'number') {
          if (!validateNumberInput(newValue)) {
            return; // Reject invalid input
          }
        }

        // Update internal state if uncontrolled
        if (externalValue === undefined) {
          setInternalValue(newValue);
        }

        // Update parent value
        const valueToSet =
          inputType === 'number' && newValue !== '' && newValue !== '-'
            ? parseFloat(newValue) || 0
            : newValue;
        setParentValue(valueToSet);

        // Call external onChange if provided
        if (onChange) {
          onChange(event);
        }
      },
      [inputType, validateNumberInput, externalValue, setParentValue, onChange]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        // Format number on blur to apply decimal limits and constraints
        if (inputType === 'number') {
          const formattedValue = formatNumber(event.target.value);

          if (formattedValue !== event.target.value) {
            // Update internal state if uncontrolled
            if (externalValue === undefined) {
              setInternalValue(formattedValue);
            }

            // Update parent with formatted value
            const valueToSet =
              formattedValue !== '' && formattedValue !== '-'
                ? parseFloat(formattedValue) || 0
                : formattedValue;
            setParentValue(valueToSet);

            // Call onChange to sync formatted value
            if (onChange) {
              const changeEvent = {
                ...event,
                target: {
                  ...event.target,
                  value: formattedValue,
                },
                type: 'change',
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(changeEvent);
            }
          }
        }

        // Call external onBlur if provided
        if (onBlur) {
          onBlur(event);
        }
      },
      [inputType, formatNumber, externalValue, setParentValue, onChange, onBlur]
    );

    // Build htmlInput props for number type
    const htmlInputProps =
      inputType === 'number'
        ? {
            step:
              decimalPlaces !== undefined && decimalPlaces > 0 ? Math.pow(10, -decimalPlaces) : 1,
            min,
            max,
            inputMode: 'decimal' as const,
          }
        : undefined;

    // Map inputType to actual HTML input type
    // Use 'text' for number to have full control over validation
    const htmlType = inputType === 'number' ? 'text' : inputType;

    return (
      <TextField
        ref={ref}
        inputRef={inputRef}
        label={label}
        type={htmlType}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        fullWidth
        slotProps={{
          htmlInput: htmlInputProps,
          ...restProps.slotProps,
        }}
        {...restProps}
      />
    );
  }
);

Input.displayName = 'Input';
