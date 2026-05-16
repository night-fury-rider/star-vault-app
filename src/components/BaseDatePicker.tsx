import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme';

interface Props {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  required?: boolean;
}

const BaseDatePicker = ({ label, value, onChange, required }: Props) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  const displayDate = value
    ? value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Select date';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>
        {label}
        {required && <Text style={{ color: theme.status.error }}> *</Text>}
      </Text>

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
          📅 {displayDate}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
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
});

export default BaseDatePicker;
