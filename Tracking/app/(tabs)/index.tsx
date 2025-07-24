import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Track</Text>
        <Text style={styles.title1}>Point</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/algoritmos')}>
        <Text style={styles.buttonText}>Iniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFEC46',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  titleContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 200,
  },
  title: {
    fontSize: 40,
    color: '#1C0E0D',
    fontFamily: 'MontserratAlternates_700Bold',
  },
  title1: {
    fontSize: 40,
    color: '#F9F9FB',
    fontFamily: 'MontserratAlternates_700Bold',
  },
  button: {
    marginTop: 500,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
    fontFamily: 'MontserratAlternates_700Bold',
  },
});
