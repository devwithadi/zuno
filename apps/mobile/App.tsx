import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/Provider';
import { FeedScreen } from './src/FeedScreen';
import { colors } from './src/theme';

export default function App() {
  return <SafeAreaProvider><AuthProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
      <FeedScreen />
    </SafeAreaView>
  </AuthProvider></SafeAreaProvider>;
}
