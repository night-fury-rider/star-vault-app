import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../theme';

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

const BaseInput = ({ label, required, error, ...rest }: Props) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>
        {label}
        {required && <Text style={{ color: theme.status.error }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.status.error : theme.border,
            color: theme.text.primary,
          },
        ]}
        placeholderTextColor={theme.text.muted}
        {...rest}
      />
      {error && (
        <Text style={[styles.error, { color: theme.status.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BaseInput;
