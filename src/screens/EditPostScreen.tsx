import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { PostModel } from '../Models/PostModel';

export interface Post {
  id: string;
  title: string;
  content: string;
  userName: string;
  userImage: string;
  postImage: string;
  uid: string;
  createdAt: Date;
}

type RootStackParamList = {
  EditPost: { post: Post };
};

type EditPostScreenProps = {
  route: RouteProp<RootStackParamList, 'EditPost'>;
  navigation: StackNavigationProp<RootStackParamList, 'EditPost'>;
};

const EditPostScreen: React.FC<EditPostScreenProps> = ({ route, navigation }) => {
  const { post } = route.params;
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(post.postImage);
  const [isLoading, setIsLoading] = useState(false);
  const user =  auth().currentUser;

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
          async () => {
            if (uploadTask.snapshot) {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at', downloadUrl);
              setImage(downloadUrl);
              Toast.show({
                type: 'success',
                text1: 'Image uploaded successfully',
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
      return '';
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Find the post document in Firestore using the post ID
      const postRef = firestore().collection('posts').doc(post.id);

      // Update the post data in Firestore
      await postRef.update({
        title,
        content,
        image: image, 
      });

      const localpost ={
        id: postRef.id,
        uid: user?.uid || '',
        title,
        content,
      }
      PostModel.updatePost(localpost)
      .then(() => {
        console.log('Post updated successfully');
      })
      .catch((error) => {
        console.log('Error updating post:', error);
      });

      // Show a success toast message
      Toast.show({
        type: 'success',
        text1: 'Post updated successfully',
      });

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error updating post:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update post, please try again later.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={handleImageUpload} disabled={isLoading}>
        <Image source={{ uri: image }} style={styles.image} />
        <Text style={styles.changeImageText}>{isLoading ? 'Uploading...' : 'Change Image'}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Content"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isLoading}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  input: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 100,
    alignItems: 'center',
    marginTop: 35,
  },
  saveButtonText: {
    color: '#53372D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditPostScreen;