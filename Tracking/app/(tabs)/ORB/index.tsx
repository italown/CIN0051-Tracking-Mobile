import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Image } from 'react-native';
import RNFS from 'react-native-fs';
import { runOnJS } from 'react-native-reanimated';
import { FAST } from './implementacao';
type Point = {
  x: number;
  y: number;
  [key: string]: any; // se quiser mais propriedades
};

export default function CameraScreen() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [asked, setAsked] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!hasPermission && !asked) {
      (async () => {
        const status = await requestPermission();
        console.log('Permissão:', status);
        setAsked(true);
      })();
    }
  }, [hasPermission, asked]);

  const updatePoints = (keypoints: [number, number][]) => {
    // Converte para objeto Point e limita quantidade (ex: top 100)
    const pts = keypoints.slice(0, 100).map(([x, y]) => ({ x, y }));
    setPoints(pts);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
  }, [])

  if (!device) {
    return (
      <View style={styles.loading}>
        <Text>Procurando dispositivo da câmera...</Text>
      </View>
    );
  }

  const captureAndDetect = async () => {
    try {
      const photo = await cameraRef.current?.takePhoto();
  
      if (!photo?.path) {
        console.warn('Foto não capturada');
        return;
      }
    } catch (e) {
      console.error('Erro ao capturar e processar foto:', e);
    }
  };

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
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        //pixelFormat='rgb'
      />
  
      {/* Overlay dos pontos */}
      <View style={StyleSheet.absoluteFill}>
        {points.map((point, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: point.x - 5,
              top: point.y - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: 'red',
              borderWidth: 1,
              borderColor: 'white',
            }}
          />
        ))}
      </View>
  
      <TouchableOpacity style={styles.captureButton} onPress={captureAndDetect}>
        <Text style={styles.captureText}>Capturar</Text>
      </TouchableOpacity>
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
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  captureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
