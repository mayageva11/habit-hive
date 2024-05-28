// imagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';


export const launchImagePicker = async (): Promise<string | null> => {
  try {
    // Request camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Camera roll permissions are required to select a profile image.',
      });
      return null;
    }

    // Open the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Toast.show({
      type: 'error',
      text1: 'An error occurred while selecting the profile image.',
    });
    return null;
  }
};
