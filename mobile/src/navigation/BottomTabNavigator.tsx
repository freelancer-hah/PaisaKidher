import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Wallet,
  Receipt,
  Users2,
  Coins,
  BarChart3,
  FolderKanban,
} from 'lucide-react-native';
import { Language } from '../types';

const Tab = createBottomTabNavigator();

interface BottomTabNavigatorProps {
  DashboardComponent: React.ComponentType<any>;
  TransactionsComponent: React.ComponentType<any>;
  UdhaarComponent: React.ComponentType<any>;
  ProjectsComponent: React.ComponentType<any>;
  KametiComponent: React.ComponentType<any>;
  AnalyticsComponent: React.ComponentType<any>;
  lang: Language;
}

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  DashboardComponent,
  TransactionsComponent,
  UdhaarComponent,
  ProjectsComponent,
  KametiComponent,
  AnalyticsComponent,
  lang,
}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'ہوم' : 'Home',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Transactions"
        component={TransactionsComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'کھاتہ' : 'Ledger',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Udhaar"
        component={UdhaarComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'ادھار' : 'Udhaar',
          tabBarIcon: ({ color, size }) => <Users2 size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Projects"
        component={ProjectsComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'پروجیکٹس' : 'Projects',
          tabBarIcon: ({ color, size }) => <FolderKanban size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Kameti"
        component={KametiComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'کمیٹی' : 'Kameti',
          tabBarIcon: ({ color, size }) => <Coins size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsComponent}
        options={{
          tabBarLabel: lang === 'ur' ? 'تجزیات' : 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

