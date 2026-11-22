import React, { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider, useApp } from './lib/store';
import { I18nProvider, useI18n } from './lib/i18n';
import { useTheme } from './lib/theme';
import { UIProvider } from './lib/ui';
import { TabBar } from './components/TabBar';
import type {
  AdminTabParamList,
  BarberTabParamList,
  CustomerTabParamList,
  RootStackParamList,
} from './lib/navigation';

import LoginScreen from './screens/LoginScreen';
import DiscoverScreen from './screens/customer/DiscoverScreen';
import BarberDetailScreen from './screens/customer/BarberDetailScreen';
import BookingRequestScreen from './screens/customer/BookingRequestScreen';
import MyBookingsScreen from './screens/customer/MyBookingsScreen';
import CustomerProfileScreen from './screens/customer/CustomerProfileScreen';
import RequestsScreen from './screens/barber/RequestsScreen';
import WalletScreen from './screens/barber/WalletScreen';
import ScheduleScreen from './screens/barber/ScheduleScreen';
import BarberProfileScreen from './screens/barber/BarberProfileScreen';
import DashboardScreen from './screens/admin/DashboardScreen';
import BarbersScreen from './screens/admin/BarbersScreen';
import AdminBarberDetailScreen from './screens/admin/AdminBarberDetailScreen';
import AllBookingsScreen from './screens/admin/AllBookingsScreen';
import RechargesScreen from './screens/admin/RechargesScreen';
import NotificationsScreen from './screens/NotificationsScreen';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('salon-font')) {
    const link = document.createElement('link');
    link.id = 'salon-font';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const CustomerTab = createBottomTabNavigator<CustomerTabParamList>();
const BarberTab = createBottomTabNavigator<BarberTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

const icon = (name: keyof typeof Ionicons.glyphMap, active: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={active} size={size} color={color} />
  );

function CustomerTabs() {
  const { t } = useI18n();
  return (
    <CustomerTab.Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <CustomerTab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: t('tabHome'),
          tabBarIcon: icon('compass-outline', 'compass'),
        }}
      />
      <CustomerTab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: t('tabBookings'),
          tabBarIcon: icon('calendar-outline', 'calendar'),
        }}
      />
      <CustomerTab.Screen
        name="CustomerProfile"
        component={CustomerProfileScreen}
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: icon('person-outline', 'person'),
        }}
      />
    </CustomerTab.Navigator>
  );
}

function BarberTabs() {
  const { t } = useI18n();
  const { state } = useApp();
  const barberId = state.session?.barberId;
  const pending = state.bookings.filter((b) => b.barberId === barberId && b.status === 'pending').length;

  return (
    <BarberTab.Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <BarberTab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarLabel: t('tabRequests'),
          tabBarIcon: icon('mail-outline', 'mail'),
          tabBarBadge: pending > 0 ? pending : undefined,
        }}
      />
      <BarberTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: t('tabWallet'),
          tabBarIcon: icon('wallet-outline', 'wallet'),
        }}
      />
      <BarberTab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: t('tabSchedule'),
          tabBarIcon: icon('time-outline', 'time'),
        }}
      />
      <BarberTab.Screen
        name="BarberProfile"
        component={BarberProfileScreen}
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: icon('person-circle-outline', 'person-circle'),
        }}
      />
    </BarberTab.Navigator>
  );
}

function AdminTabs() {
  const { t } = useI18n();
  const { state } = useApp();
  const pendingRecharges = state.recharges.filter((r) => r.status === 'pending').length;
  const pendingBookings = state.bookings.filter((b) => b.status === 'pending').length;

  return (
    <AdminTab.Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <AdminTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('tabDashboard'),
          tabBarIcon: icon('stats-chart-outline', 'stats-chart'),
        }}
      />
      <AdminTab.Screen
        name="Barbers"
        component={BarbersScreen}
        options={{
          tabBarLabel: t('tabBarbers'),
          tabBarIcon: icon('people-outline', 'people'),
        }}
      />
      <AdminTab.Screen
        name="AllBookings"
        component={AllBookingsScreen}
        options={{
          tabBarLabel: t('tabAllBookings'),
          tabBarIcon: icon('list-outline', 'list'),
          tabBarBadge: pendingBookings > 0 ? pendingBookings : undefined,
        }}
      />
      <AdminTab.Screen
        name="Recharges"
        component={RechargesScreen}
        options={{
          tabBarLabel: t('tabRecharges'),
          tabBarIcon: icon('card-outline', 'card'),
          tabBarBadge: pendingRecharges > 0 ? pendingRecharges : undefined,
        }}
      />
    </AdminTab.Navigator>
  );
}

function RootNavigator() {
  const { state } = useApp();
  const theme = useTheme();
  const role = state.session?.role;

  const navTheme = useMemo(() => {
    const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: theme.mode === 'dark',
      colors: {
        ...base.colors,
        primary: theme.gold,
        background: theme.bg,
        card: theme.bgSoft,
        text: theme.text,
        border: theme.borderSoft,
        notification: theme.danger,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        key={role ?? 'guest'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        {role === 'customer' ? (
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen name="BarberDetail" component={BarberDetailScreen} />
            <Stack.Screen
              name="BookingRequest"
              component={BookingRequestScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : role === 'barber' ? (
          <>
            <Stack.Screen name="BarberTabs" component={BarberTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="BarberDetail" component={AdminBarberDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ThemedApp() {
  const theme = useTheme();
  const { isRTL } = useI18n();

  useEffect(() => {
    // keep the status bar readable in both themes
  }, [theme.mode, isRTL]);

  return (
    <UIProvider>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </UIProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#08080A', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="cut" size={44} color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <I18nProvider>
          <ThemedApp />
        </I18nProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
