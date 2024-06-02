// UploadAPostScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker'; 
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import placeHolder from '../assets/post_image.jpg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; 

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const UploadAPostScreen:React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const user =  auth().currentUser;
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await firestore()
          .collection('users')
          .where('uid', '==', user?.uid)
          .get();

        if (!userDoc.empty) {
          setUserName(userDoc.docs[0].data().name);
          setProfileImage(userDoc.docs[0].data().image)
        } else {
          console.error('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserName();
  }, [user?.uid]);

  const handleSubmit = async () => {
    try {
      await firestore().collection('posts').add({
        uid: user?.uid,
        title,
        content,
        image,
        userName,
        profileImage,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      // Navigate to the "Posts" screen after successful post upload
      navigation.navigate('MyPosts');
    } catch (error) {
      console.error('Error saving post:', error);
      // Display an error message to the user
      Alert.alert('Error', 'Failed to upload the post. Please try again later.');
    }
  };

  const handleCommunity = () => {
    // Navigate to the community screen
    navigation.navigate('Community');
  };

  const handleHabits = () => {
    // Navigate to the habits screen
    // navigation.navigate('Habits');
  };
  const handleProfile = () => {
    navigation.navigate('Profile' );
  }

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Optionally, you can navigate to the login screen after successful logout
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleImageUpload = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setIsLoading(true);
      try {
        const selectedImage = result.assets[0];
        const storageRef = storage().ref(`postsimages/${Date.now()}_${selectedImage.fileName}`);
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
    <View style={styles.container}>
      <View style={styles.postImageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
          ) : (
            <Image source={image ? { uri: image } : placeHolder} style={styles.postImage} />
          )}
          <TouchableOpacity style={styles.postImageButton} onPress={handleImageUpload}>
            <Text style={styles.postImageButtonText}>+ IMAGE</Text>
          </TouchableOpacity>
        </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input]}
          placeholder="Post title"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.spacer} />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Post content"
          value={content}
          onChangeText={setContent}
          multiline
        />
      </View>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.addPostButton} onPress={handleSubmit}>
        <Text style={styles.addPostButtonText}>ADD POST</Text>
      </TouchableOpacity>

      {/* Bottom navigation */}
      <View style={styles.bottomNavigationBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
          <Icon name="list-alt" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>MY POSTS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleCommunity}>
          <Icon name="people-outline" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>COMMUNITY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleHabits}>
          <Icon name="check-circle-outline" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>HABITS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#53372D',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#53372D',
    marginHorizontal: 25,
    marginVertical: 5,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  spacer: {
    height: 16,
  },
  addPostButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 130,
    marginVertical: 20,
  },
  addPostButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#53372D',
  },
  bottomNavigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    width: '100%',
    paddingHorizontal: 0,
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
  postImageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 30,
  },
  postImage: {
    width: 300,
    height: 200,
    borderRadius: 30,
    marginBottom:30,
  },
  postImageButton: {
    backgroundColor: '#FFBF00',
    marginTop: 0,
    marginLeft: 6,
    borderRadius: 112,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  postImageButtonText: {
    color: '#53372D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 32,
  },
});

export default UploadAPostScreen;