import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

import { AuthProvider } from './src/auth';
import { MailboxProvider } from './src/store/MailboxContext';
import type { RootStackParamList } from './src/navigation/types';
import { MailListScreen } from './src/screens/MailListScreen';
import { ThreadScreen } from './src/screens/ThreadScreen';
import { ComposeScreen } from './src/screens/ComposeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { c } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: c.background }} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MailboxProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
              <Stack.Screen name="MailList" component={MailListScreen} />
              <Stack.Screen name="Thread" component={ThreadScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen
                name="Compose"
                component={ComposeScreen}
                options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="dark" />
        </MailboxProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
