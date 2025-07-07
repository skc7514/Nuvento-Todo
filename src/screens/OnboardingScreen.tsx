import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, useTheme, Surface, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const slides = [
  {
    key: '1',
    title: 'Track Expenses Automatically',
    description: 'Track your expenses automatically from your bank SMS.',
    image: require('../assets/illustration1.png'),
  },
  {
    key: '2',
    title: 'Insights & Charts',
    description: 'Get insights with beautiful charts & summaries.',
    image: require('../assets/illustration2.png'),
  },
  {
    key: '3',
    title: 'Manage Finances Smartly',
    description: 'Manage your finances smartly and effortlessly.',
    image: require('../assets/illustration3.png'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      if (seen) {
        navigation.replace('Dashboard');
      }
    };
    checkOnboarding();
  }, [navigation]);

  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to your SMS to read bank messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('SMS permission granted');
          await AsyncStorage.setItem('onboarding_seen', 'true');
          navigation.replace('Dashboard');
        } else {
          console.log('SMS permission denied');
          Alert.alert('Permission Required', 'Without SMS permission, the app cannot read transactions.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      await AsyncStorage.setItem('onboarding_seen', 'true');
      navigation.replace('Dashboard');
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      requestSmsPermission();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>\n      <Surface style={styles.surface} elevation={4}>
        <Text variant="titleLarge" style={styles.title}>{slides[currentSlide].title}</Text>

        <Image source={slides[currentSlide].image} style={styles.image} resizeMode="contain" />

        <Text variant="bodyMedium" style={styles.subtitle}>{slides[currentSlide].description}</Text>

        <ProgressBar progress={(currentSlide + 1) / slides.length} style={styles.progressBar} color={colors.primary} />

        <Button
          mode="contained"
          onPress={nextSlide}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
        >
          {currentSlide === slides.length - 1 ? 'Allow Permission' : 'Next'}
        </Button>
      </Surface>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  surface: { padding: 20, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 20, textAlign: 'center' },
  subtitle: { marginVertical: 10, textAlign: 'center', color: '#666' },
  image: { width: 250, height: 150, marginVertical: 20 },
  button: { marginTop: 30, width: '80%' },
  progressBar: { marginTop: 16, width: '80%' },
});
