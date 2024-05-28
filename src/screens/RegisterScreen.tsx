// RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Menu, Divider, Provider as PaperProvider, Button } from 'react-native-paper';
import beeLogo from '../assets/bee_image.png';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { launchImagePicker } from '../utils/imagePicker';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  image: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validate form fields
    // ...

    // Create form data to send to the server
    const formData: FormData = {
      name,
      email,
      password,
      confirmPassword,
      image,
    };

    try {
      // Send the formData to the server
      console.log('formData:', formData);
      // If the registration is successful, navigate to the profile page
    //   navigation.navigate('Profile');
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to register, please try again later.',
      });
    }
  };

  const handleImagePicker = async () => {
    const selectedImage = await launchImagePicker();
    if (selectedImage) {
      setImage(selectedImage);
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
            <Image source={{ uri: image || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          )}
          <TouchableOpacity style={styles.profileImageButton} onPress={handleImagePicker}>
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
    width: 100,
    height: 100,
    marginTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#53372D',
    marginTop: 16,
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
});

export default RegisterScreen;