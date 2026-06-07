import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Plus, TrendingUp, Map } from 'lucide-react-native';
import { FeedScreen } from '../screens/FeedScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MapScreen } from '../screens/MapScreen';
import { Header } from './Header';
import { COLORS } from '../theme/colors';
import { CreatePostModal } from '../components/CreatePostModal';

const Tab = createBottomTabNavigator();

// Dummy component for the Create tab
const NullComponent = () => null;

export const MainNavigator = () => {
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 0,
            elevation: 0,
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 1,
            marginTop: 4,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      >
        <Tab.Screen 
          name="Feed" 
          component={FeedScreen} 
          options={{
            tabBarLabel: 'FEED',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{
            tabBarLabel: 'SEARCH',
            tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          }}
        />
        <Tab.Screen 
          name="Create" 
          component={NullComponent} 
          options={{
            tabBarLabel: '',
            tabBarIcon: () => (
              <View style={styles.createButton}>
                <Plus color={COLORS.background} size={32} />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setCreateModalVisible(true);
            },
          }}
        />
        <Tab.Screen 
          name="Progress" 
          component={ProfileScreen} 
          options={{
            tabBarLabel: 'PROGRESS',
            tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} />,
          }}
        />
        <Tab.Screen 
          name="Map" 
          component={MapScreen} 
          options={{
            tabBarLabel: 'MAP',
            tabBarIcon: ({ color }) => <Map color={color} size={24} />,
          }}
        />
      </Tab.Navigator>

      <CreatePostModal 
        visible={isCreateModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
