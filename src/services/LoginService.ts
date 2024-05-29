import auth from '@react-native-firebase/auth';

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
    console.log('User logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
