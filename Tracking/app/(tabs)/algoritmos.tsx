import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function AlgoritmosScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerTitle}>Algoritmos</Text>
        <Text style={styles.headerSubtitle}>
          Algoritmos que identificam e descrevem pontos de interesse em imagens.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <ScrollView contentContainerStyle={styles.contentContainer}>

          {/* ORB */}
          <TouchableOpacity onPress={() => navigation.navigate('ORB/index')}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ORB</Text>
              <Text style={styles.cardText}>
                Algoritmo rápido, leve e livre, que detecta e descreve pontos de interesse
                usando descritivos binários, com invariância à rotação.
              </Text>
              <View style={styles.separator} />
            </View>
          </TouchableOpacity>

          {/* SURF */}
          <TouchableOpacity onPress={() => navigation.navigate('algoritmos')}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SURF</Text>
              <Text style={styles.cardText}>
                Algoritmo robusto que detecta e descreve pontos de interesse com invariância
                à rotação e escala, sendo otimizado para alta velocidade em relação ao SIFT.
              </Text>
              <View style={styles.separator} />
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFEC46',
  },
  topSection: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C0E0D',
    fontFamily: 'MontserratAlternates_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#1C0E0D',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C0E0D',
    fontFamily: 'MontserratAlternates_700Bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#1C0E0D',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  separator: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginTop: 16,
  },
});
