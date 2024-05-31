import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface FormData {
  name: string;
  email: string;
  password: string;
  image: string;
  goal: string;
}
interface UserData {
    uid: string;
    name: string;
    email: string;
    image: string;
    goal: string;
  }

interface RegistrationResponse {
  success: boolean;
  error?: string;
}

class AuthService {
  registerUser = async (
    email: string,
    password: string,
    formData: FormData
  ): Promise<RegistrationResponse> => {
    try {
      // Create a new user with email and password
      await auth().createUserWithEmailAndPassword(email, password);

      try {
        // Get the current user's UID
        const currentUserUID = auth().currentUser?.uid;
  
        if (!currentUserUID) {
          throw new Error('User not authenticated');
        }
        // Construct the UserData object
      const userData: UserData = {
        uid: currentUserUID,
        name: formData.name,
        email: formData.email,
        image: formData.image,
        goal: formData.goal,
      };
  
        // Save user data to the "users" collection in Firestore
        await firestore().collection('users').doc(currentUserUID).set(userData);
      } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
      }
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

}

export default new AuthService();