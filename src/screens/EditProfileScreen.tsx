import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Divider, Menu, PaperProvider } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { UserModel, User } from '../Models/UserModel';

type MyPostsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyPosts'>;

type Props = {
  navigation: MyPostsScreenNavigationProp;
};

interface UserData {
  uid: string;
  name: string;
  email: string;
  goal: string;
  image: string;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();



  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore().collection('users').where('uid', '==', currentUser?.uid).get();
        if (userDoc) {
          const userData = userDoc.docs[0].data();
          setUser(userData as UserData);
          setImage(userData.image);
          setName(userData.name);
          setEmail(userData.email);
          setGoal(userData.goal);
        }
      }
    };

    fetchUser();
  }, [navigation, isFocused]);

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

  const handleSaveChanges = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: "Passwords don't match!",
      });
      return;
    }

    try {
      await firestore().collection('users').doc(user?.uid).update({
        name,
        email,
        goal,
        image,
      });
      const localuser : User = {
        uid:user?.uid || '',
        name,
        email,
        goal,
      }
      await UserModel.updateUser(localuser);
      
      if(name != user?.name) {
        //edit the user name in the posts of the user by uid
        const posts = await firestore().collection('posts').where('uid', '==', user?.uid).get();
        posts.docs.forEach(async (doc) => {
          await doc.ref.update({
            userName:name,
          });
      });
    }

      if (password) {
        try {
          await auth().currentUser?.updatePassword(password);
          Toast.show({
            type: 'success',
            text1: 'Password updated successfully!',
          });
        } catch (error) {
          console.error('Error updating password:', error);
          Toast.show({
            type: 'error',
            text1: 'An error occurred while updating the password.',
          });
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
      });
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while updating the profile.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null; // or render a loading spinner
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleImageUpload} disabled={isLoading}>
          <Image source={image ? { uri: image } : require('../assets/placeholder.png')} style={styles.image} />
          <Text style={styles.changeImageText}>{isLoading ? 'Uploading...' : 'Change Image'}</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#53372D"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#53372D"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#53372D"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#53372D"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person-outline" size={24} color="#53372D" />
            <Text style={styles.navButtonText}>PROFILE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Community')}>
            <Icon name="people-outline" size={24} color="#53372D" />
            <Text style={styles.navButtonText}>COMMUNITY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="check-circle-outline" size={24} color="#53372D" />
            <Text style={styles.navButtonText}>HABITS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#53372D" />
            <Text style={styles.navButtonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginTop: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownList: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#53372D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    color: '#53372D',
    marginTop: 4,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#53372D',
    fontSize: 16,
    marginTop: 8,
  },
  dropdownMenuContainer: {
    width: '400%',
  },
  changeImageButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  changeImageButtonText: {
    color: '#53372D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  changeImageText: {
    marginTop: 8,
    color: '#FFC107',
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;