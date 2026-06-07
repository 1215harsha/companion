import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { FindFriendsScreen } from '../screens/FindFriendsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { COLORS } from '../theme/colors';

export type RootStackParamList = {
  MainTabs: undefined;
  FindFriends: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FindFriends" 
        component={FindFriendsScreen} 
        options={{ title: 'Find Friends' }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }} 
      />
    </Stack.Navigator>
  );
};
