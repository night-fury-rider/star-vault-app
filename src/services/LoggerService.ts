// This file is inteneded to contain local logging related services. Currently it is not having any telemetry logging.
import { ToastAndroid } from 'react-native';

const LoggerService = (() => {
  const log = (message: any, ...otherMessages: any[]) => {
    console.log(
      `%c${message}`,
      'color: blue; font-size: 20px',
      otherMessages.length > 0 ? otherMessages : '',
    );
  };

  const info = (message: any, ...otherMessages: any[]) => {
    console.log(
      `%c${message}`,
      'color: blue; font-size: 20px',
      otherMessages.length > 0 ? otherMessages : '',
    );
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  const warn = (message: any, ...otherMessages: any[]) => {
    console.log(
      `%c${message}`,
      'color: orange; font-size: 20px',
      otherMessages.length > 0 ? otherMessages : '',
    );
  };

  const error = (message: any, ...otherMessages: any[]) => {
    console.log(
      `%c${message}`,
      'color: red; font-size: 20px',
      otherMessages.length > 0 ? otherMessages : '',
    );
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  return {
    log,
    info,
    warn,
    error,
  };
})();

export default LoggerService;
