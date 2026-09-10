import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme';

interface Props {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  required?: boolean;
}

const MIN_DATE = new Date(1900, 0, 1);
const DEFAULT_OPEN_DATE = new Date(1990, 0, 1);

const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

const dateToDisplay = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const BaseDatePicker = ({ label, value, onChange, required }: Props) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Handle manual text input with auto slash insertion
  const handleManualChange = (text: string) => {
    // Auto insert slashes DD/MM/YYYY
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
        8,
      )}`;
    }
    setManualText(cleaned);
    setManualError(null);

    // Validate when full date entered DD/MM/YYYY
    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);

      if (
        !isValidDate(parsed) ||
        parsed.getDate() !== day ||
        parsed.getMonth() !== month ||
        parsed.getFullYear() !== year
      ) {
        setManualError('Invalid date. Use DD/MM/YYYY');
        return;
      }

      if (parsed < MIN_DATE) {
        setManualError('Date must be after 1900');
        return;
      }

      if (parsed > new Date()) {
        setManualError('Date cannot be in the future');
        return;
      }

      onChange(parsed);
      setManualError(null);
    }
  };

  const toggleMode = () => {
    setManualMode(prev => !prev);
    setManualText('');
    setManualError(null);
    setShow(false);
  };

  return (
    <View style={styles.container}>
      {/* Label + toggle */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>
          {label}
          {required && <Text style={{ color: theme.status.error }}> *</Text>}
        </Text>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={[styles.toggleText, { color: theme.primary }]}>
            {manualMode ? '📅 Use Picker' : '⌨️ Type Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {manualMode ? (
        // ─── Manual Entry Mode ────────────────────────────
        <View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: manualError ? theme.status.error : theme.border,
                color: theme.text.primary,
              },
            ]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.text.muted}
            value={manualText}
            onChangeText={handleManualChange}
            keyboardType="numeric"
            maxLength={10}
          />
          {manualError && (
            <Text style={[styles.errorText, { color: theme.status.error }]}>
              {manualError}
            </Text>
          )}
          {value && !manualError && (
            <Text style={[styles.parsedDate, { color: theme.status.success }]}>
              ✓ {dateToDisplay(value)}
            </Text>
          )}
        </View>
      ) : (
        // ─── Picker Mode ──────────────────────────────────
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setShow(true)}
        >
          <Text
            style={[
              styles.dateText,
              { color: value ? theme.text.primary : theme.text.muted },
            ]}
          >
            📅 {value ? dateToDisplay(value) : 'Select date'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Date Picker */}
      {show && !manualMode && (
        <DateTimePicker
          value={value || DEFAULT_OPEN_DATE}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={MIN_DATE}
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShow(Platform.OS === 'ios');
            if (selectedDate) {
              onChange(selectedDate);
              if (Platform.OS === 'android') {
                setShow(false);
              }
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  parsedDate: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BaseDatePicker;
