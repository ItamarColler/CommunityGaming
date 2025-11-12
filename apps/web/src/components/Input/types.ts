import { TextFieldProps } from '@mui/material/TextField';

export type InputType = 'text' | 'number' | 'email' | 'password';

export interface InputProps extends Omit<TextFieldProps, 'type'> {
  /**
   * Type of input: 'text', 'number', 'email', or 'password'
   * @default 'text'
   */
  inputType?: InputType;

  /**
   * Optional label for the input field
   */
  label?: string;

  /**
   * For number inputs: limit the number of decimal places
   * @example decimalPlaces={2} allows 10.25 but not 10.255
   */
  decimalPlaces?: number;

  /**
   * Minimum value for number inputs
   */
  min?: number;

  /**
   * Maximum value for number inputs
   */
  max?: number;

  /**
   * Required callback to set value in parent component
   */
  setParentValue: (value: string | number) => void;
}
