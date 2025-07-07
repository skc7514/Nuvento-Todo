import SmsAndroid from 'react-native-get-sms-android';

export const getAllSms = async (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify({ box: 'inbox' }),
      fail => reject(new Error(fail)),
      (count, smsList) => resolve(JSON.parse(smsList))
    );
  });
};