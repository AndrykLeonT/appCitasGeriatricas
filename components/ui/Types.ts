// types.ts

import { TextInputProps } from 'react-native';

export interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  // Ya no necesitas definir placeholder, multiline, etc., 
  // porque TextInputProps ya los trae.
}