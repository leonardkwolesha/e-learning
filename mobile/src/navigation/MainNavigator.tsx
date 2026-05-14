import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { MainTabParamList, LearnStackParamList } from '../types';

import DashboardScreen from '../screens/DashboardScreen';
import CurriculumScreen from '../screens/CurriculumScreen';
import LearnScreen from '../screens/LearnScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import TutorScreen from '../screens/TutorScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const LearnStack = createNativeStackNavigator<LearnStackParamList>();

function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="CurriculumList" component={CurriculumScreen} />
      <LearnStack.Screen name="Curriculum" component={CurriculumScreen} />
      <LearnStack.Screen name="Learn" component={LearnScreen} />
      <LearnStack.Screen name="Assessment" component={AssessmentScreen} />
    </LearnStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 18,
          left: 20,
          right: 20,
          backgroundColor: Colors.bgCard,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: Colors.border,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            HomeTab: { active: 'home', inactive: 'home-outline' },
            LearnTab: { active: 'book', inactive: 'book-outline' },
            TutorTab: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
            AnalyticsTab: { active: 'analytics', inactive: 'analytics-outline' },
            ProfileTab: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name];
          const name = (focused ? icon?.active : icon?.inactive) as keyof typeof Ionicons.glyphMap;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="LearnTab" component={LearnStackNavigator} options={{ tabBarLabel: 'Learn' }} />
      <Tab.Screen name="TutorTab" component={TutorScreen} options={{ tabBarLabel: 'Tutor' }} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} options={{ tabBarLabel: 'Progress' }} />
      <Tab.Screen name="ProfileTab" component={SettingsScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
