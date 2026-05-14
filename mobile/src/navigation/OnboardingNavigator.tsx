import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types';
import SelectEducationScreen from '../screens/SelectEducationScreen';
import SelectLevelScreen from '../screens/SelectLevelScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SelectEducation"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="SelectEducation" component={SelectEducationScreen} />
      <Stack.Screen name="SelectLevel" component={SelectLevelScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
    </Stack.Navigator>
  );
}
