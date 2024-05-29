// RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Menu, Divider, Provider as PaperProvider, Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import beeLogo from '../assets/bee_image.png';
import placeHolder from '../assets/placeholder.png';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AuthService from '../services/AuthService';
import storage from '@react-native-firebase/storage';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  image: string;
  goal: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [goal, setGoal] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // TODO: Validate form fields
    if (!name || !email || !password || !confirmPassword || !goal) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all fields.',
      });
      return;
    }
  
    // Validate email format using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid email address',
      });
      return;
    }
  
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });
      return;
    }
  
    // Create form data to send to the server
    const formData = {
      name,
      email,
      password,
      image,
      goal,
    };
  
    try {
      // Send the formData to the server
      // Use auth service
      await AuthService.registerUser(email, password, formData);
      // TODO: Save the information locally in SQLite or Realm
  
      console.log('formData:', formData);
      console.log('successful register');
      // If the registration is successful, navigate to the profile page
      navigation.navigate('Profile' as never);
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to register, please try again later.',
      });
    }
  };

  const handleImageUpload = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setIsLoading(true);
      try {
        const selectedImage = result.assets[0];
        const storageRef = storage().ref(`images/${Date.now()}_${selectedImage.fileName}`);
        const uploadTask = storageRef.putFile(selectedImage.uri!);
  
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Error uploading image:', error);
            Toast.show({
              type: 'error',
              text1: 'Failed to upload image, please try again later.',
            });
          },
        () => {
            if (uploadTask.snapshot) {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    console.log('File available at', downloadUrl);
                    setImage(downloadUrl);
                });
            }
        }
        );
      } catch (error) {
        console.error('Error uploading image:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to upload image, please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const getDownloadURL = async (reference: any) => {
    try {
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Error getting download URL:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to get download URL, please try again later.',
      });
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Image source={beeLogo} style={styles.logo} />
        <Text style={styles.title}>Habit Hive</Text>
        <View style={styles.profileImageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <Image source={image ? { uri: image } : placeHolder} style={styles.profileImage} />
          )}
          <TouchableOpacity style={styles.profileImageButton} onPress={handleImageUpload}>
            <Text style={styles.profileImageButtonText}>+ PROFILE IMAGE</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={[styles.input, styles.inputText]}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
            <TouchableOpacity
            style={[styles.input]}
            onPress={() => setMenuVisible(true)}
            >
            <Text style={styles.placeholderText}>
                {goal || 'What would you like to achieve?'}
            </Text>
            </TouchableOpacity>
        }
        >
        <Menu.Item
            title="Health and Wellness"
            onPress={() => {
            setGoal('Health and Wellness');
            setMenuVisible(false);
            }}
        />
        <Divider />
        <Menu.Item
            title="Self Confidence"
            onPress={() => {
            setGoal('Self Confidence');
            setMenuVisible(false);
            }}
        />
        <Divider />
        <Menu.Item
            title="Interpersonal Communications"
            onPress={() => {
            setGoal('Interpersonal Communications');
            setMenuVisible(false);
            }}
        />
        </Menu>
        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.registerButton}
          contentStyle={styles.registerButtonContent}
        >
          <Text style={styles.registerButtonText}>REGISTER</Text>
        </Button>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#53372D',
    marginTop: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImageButton: {
    backgroundColor: '#FFBF00',
    marginTop: 0,
    marginLeft: 6,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  profileImageButtonText: {
    color: '#53372D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#53372D',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  inputText: {
    color: '#53372D',
  },
  registerButton: {
    backgroundColor: '#FFBF00',
    marginTop: 32,
    borderRadius: 8,
  },
  registerButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  registerButtonText: {
    color: '#53372D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 32,
  },
  placeholderText: {
    color: '#53372D',
    fontSize: 16,
    marginTop: 8,
  },
  dropdownMenuContainer: {
    width: '400%',
  },
});

export default RegisterScreen;
