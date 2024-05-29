import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginWithEmailAndPassword } from '../services/LoginService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    console.log('Email:', email);
    console.log('Password:', password);
    if (!email || !password) {
        setErrorMessage('Please enter email and password');
        return;
      }
      try {
        await loginWithEmailAndPassword(email, password);
        // Navigate to the desired screen after successful login
        console.log('User logged in successfully');
        navigation.navigate('Profile' as never);
      } catch (error) {
        setErrorMessage('Login failed. Please check your email and password.');
      }

  };

  const handleRegister = () => {
    // Handle registration logic here
    console.log('Registration button pressed');
    navigation.navigate('Register' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Image source={require('../assets/bee_image.png')} style={styles.logo} />
        <Text style={styles.title}>Habit Hive</Text>
        <Text style={styles.subtitle}>Don't just sting by, hive your goals high</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#53372D"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#53372D"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.registerText}>
        NEW HERE? CLICK <Text style={styles.registerLink} onPress={handleRegister}>HERE</Text> TO REGISTER
      </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 175,
    height: 175,
    marginBottom: 30,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#53372D',
  },
  subtitle: {
    fontSize: 25,
    marginBottom: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#53372D',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  registerText: {
    marginTop: 20,
    color: 'black',
  },
  registerLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  button: {
    width: '50%',
    height: 50,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#53372D',
  }
});

export default LoginScreen;