import { Camera, CameraType } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';



export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [mycamera, setCamera] = useState();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  // useEffect(async ()=>{
  //   const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
  //   if (perm.status != 'granted') {
  //     return;
  //   }
  // },[]);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function handleBarcode(e) {
    console.log("Barcode value", e);
    setScanned(true);
    if (mycamera) {
      const pic = await mycamera.takePictureAsync()
      console.log("pic", pic);
      const asset = await MediaLibrary.createAssetAsync(pic.uri);
      const manipResult = await manipulateAsync(
        pic.uri,
        [{ crop: {
          height: e.boundingBox.size.height, 
          originX: e.boundingBox.origin.x, 
          originY: e.boundingBox.origin.y, 
          width: e.boundingBox.size.width,
        } }],
        { compress: 1, format: SaveFormat.PNG }
      );
      console.log("Cropped Res", manipResult);
      const cropAsset = await MediaLibrary.createAssetAsync(manipResult.uri);
    }
  }

  return (
    <View style={styles.container}>
      <Camera 
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      onBarCodeScanned={scanned ? undefined : handleBarcode}
      ref={(ref) => { setCamera(ref) }}
      style={styles.camera} type={type}>
        {scanned &&
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.text}>Tap to scan again</Text>
          </TouchableOpacity>
        </View>}
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
