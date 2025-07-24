import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export default function CameraScreen() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (!hasPermission && !asked) {
      (async () => {
        const status = await requestPermission();
        console.log('Permissão:', status);
        setAsked(true);
      })();
    }
  }, [hasPermission, asked]);

  if (!device) {
    return (
      <View style={styles.loading}>
        <Text>Procurando dispositivo da câmera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.loading}>
        <Text style={styles.permissionText}>
          A câmera não está liberada. Vá nas configurações do app para permitir.
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.settingsText}>Abrir Configurações</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} device={device} isActive={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
