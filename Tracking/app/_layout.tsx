import { Stack } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';

import {
  useFonts as useMontserratAlternates,
  MontserratAlternates_400Regular,
  MontserratAlternates_700Bold,
} from '@expo-google-fonts/montserrat-alternates';

import {
  useFonts as usePlusJakartaSans,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

export default function RootLayout() {
  const [fontsLoaded1] = useMontserratAlternates({
    MontserratAlternates_400Regular,
    MontserratAlternates_700Bold,
  });

  const [fontsLoaded2] = usePlusJakartaSans({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
  });

  const fontsLoaded = fontsLoaded1 && fontsLoaded2;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
