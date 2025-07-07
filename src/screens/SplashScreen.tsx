import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const seen = await AsyncStorage.getItem('onboarding_seen');
      navigation.replace(seen ? 'Dashboard' : 'Onboarding');
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.image}
        resizeMode="contain" 
      />
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    </View>
  );
};

export default SplashScreen;

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C4DAB', justifyContent: 'center', alignItems: 'center' },
  image: {
    width: width,
    height: height,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: height * 0.1,
  },
});