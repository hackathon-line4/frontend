import { StyleSheet, View } from 'react-native';

import { Logo, Text } from '@/components';
import { colors, screen, space } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Logo />
      <Text variant="body" color="textSecondary" style={styles.subtitle}>
        Open up src/screens/HomeScreen.tsx to start working!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: screen.gutter,
    backgroundColor: colors.bgIvory,
  },
  subtitle: {
    marginTop: space[2],
    textAlign: 'center',
  },
});
