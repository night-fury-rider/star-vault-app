import Toast from 'react-native-toast-message';

// ─── Centralized toast utility ────────────────────────────────
// All toast calls go through here. To swap the library in future,
// change only this file.

const showSuccess = (
  title: string,
  message?: string,
  visibilityTime = 3000,
): void => {
  Toast.show({
    position: 'bottom',
    type: 'success',
    text1: title,
    text2: message,
    visibilityTime,
  });
};

const showError = (
  title: string,
  message?: string,
  visibilityTime = 4000,
): void => {
  Toast.show({
    position: 'bottom',
    type: 'error',
    text1: title,
    text2: message,
    visibilityTime,
  });
};

const showInfo = (
  title: string,
  message?: string,
  visibilityTime = 3000,
): void => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime,
  });
};

const hide = (): void => {
  Toast.hide();
};

export { hide, showError, showInfo, showSuccess };
