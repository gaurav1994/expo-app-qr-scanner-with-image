import { Camera, CameraType } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { postQrImage, testApi } from './api';
import customPrompt from './customPrompt';


export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [mycamera, setCamera] = useState();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [permissionResponse, requestPermissionFile] = MediaLibrary.usePermissions();
  console.log(permission, permissionResponse);

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

  const reqPerm = () => {
    requestPermission();
    console.log("Premision of file")
    requestPermissionFile()
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={(e)=> {reqPerm(e)}} title="grant permission" />
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
      console.log("Asset in picture", asset);
      const response = await BarCodeScanner.scanFromURLAsync(asset.uri);
      console.log("Scanned from image", response);
      const res = response[0];
      if(response.length > 0) {
        const manipResult = await manipulateAsync(
          asset.uri,
          [{ crop: {
            height: res.bounds.size.height, 
            originX: res.bounds.origin.x, 
            originY: res.bounds.origin.y, 
            width: res.bounds.size.width,
          } }],
          { compress: 1, format: SaveFormat.PNG }
        );
        console.log("Cropped Res", manipResult);
        const cropAsset = await MediaLibrary.createAssetAsync(manipResult.uri);
        console.log("cropAsset", cropAsset);
        const qvcode = await customPrompt();
        postQrImage(qvcode, cropAsset)
      } else {
        alert("Image not scaaned");
      }
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
      style={[StyleSheet.absoluteFill, styles.container]}>
        <View style={styles.layerTop} />
        <View style={styles.layerCenter}>
          <View style={styles.layerLeft} />
          <View style={styles.focused} />
          <View style={styles.layerRight} />
        </View>
        <View style={styles.layerBottom}>
          {scanned &&
          <View style={stylesOld.buttonContainer}>
            <TouchableOpacity style={stylesOld.button} onPress={() => setScanned(false)}>
              <Text style={stylesOld.text}>Tap to scan again</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </Camera>
    </View>
  );
}

const opacity = 'rgba(0, 0, 0, .6)';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  layerTop: {
    flex: 1.5,
    backgroundColor: opacity
  },
  layerCenter: {
    flex: 1,
    flexDirection: 'row'
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity
  },
  focused: {
    flex: 10
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity
  },
  layerBottom: {
    flex: 1.5,
    backgroundColor: opacity
  },
});

const stylesOld = StyleSheet.create({
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
