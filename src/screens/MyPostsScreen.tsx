// MyPostsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, Avatar, IconButton } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useIsFocused } from '@react-navigation/native';
import { PostModel } from '../Models/PostModel';

type MyPostsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyPosts'>;

type Props = {
  navigation: MyPostsScreenNavigationProp;
};

interface Post {
  id: string;
  title: string;
  content: string;
  userName: string;
  userImage: string;
  postImage: string;
  createdAt: Date;
  uid: string;
}

interface post {
  id: string;
  uid: string;
  title: string;
  content: string;
}

const MyPostsScreen: React.FC<Props> = ({ navigation }) => {
  const user = auth().currentUser;
  const [posts, setPosts] = useState<Post[]>([]);
  const [localPosts, setLocalPosts] = useState<post[]>([]);
  const isFocused = useIsFocused();

  const fetchUserPosts = async () => {
    try {
      if (user?.uid) {
        // Fetch posts from Firestore
        const postSnapshot = await firestore()
          .collection('posts')
          .where('uid', '==', user.uid)
          .get();
  
        if (postSnapshot.empty) {
          // If no posts are found in Firestore, fetch posts from the local database
          const localPosts = await PostModel.getPostsByUserId(user.uid);
          setLocalPosts(localPosts);
        } else {
          // If posts are found in Firestore, map the data and set the state
          const postData: Post[] = await Promise.all(
            postSnapshot.docs.map(async (doc) => ({
              id: doc.id,
              title: doc.data().title,
              content: doc.data().content,
              userName: doc.data().userName,
              userImage: doc.data().profileImage,
              postImage: doc.data().image,
              createdAt: doc.data().createdAt.toDate(),
              uid: doc.data().uid,
            }))
          );
  
          setPosts(postData);
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      // If there's an error fetching from Firestore, try fetching from the local database
      if (user?.uid) {
        const localPosts = await PostModel.getPostsByUserId(user.uid);
        setLocalPosts(localPosts);
      }
    }
  };

  useEffect(() => {
  
      fetchUserPosts();
    
  }, [ navigation,isFocused]);

  const handleEditPost = (post: Post) => {
    // Navigate to the edit post screen
    navigation.navigate('EditPost', { post, postId: post.id });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Delete the post from Firestore
      await firestore().collection('posts').doc(postId).delete();
      //delete from the local db
      PostModel.deletePost(postId);
      
      // Refresh the posts
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCommunity = () => {
    // Navigate to the community screen
    navigation.navigate('Community');
  };

  const handleHabits = () => {
    // Navigate to the habits screen
    navigation.navigate('Habits');
  };

  const handleProfile = () => {
    // Navigate to the habits screen
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Optionally, you can navigate to the login screen after successful logout
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.userImage }} style={styles.avatar} />
              <View style={styles.cardTitle}>
                <Title style={styles.userName}>{item.userName}</Title>
                <Title style={styles.title}>{item.title}</Title>
              </View>
            </View>
            <Image source={{ uri: item.postImage }} style={styles.postImage} />
            <Card.Content>
              <Paragraph style={styles.content}>{item.content}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="pencil"
                style={styles.deleteIcon}
                onPress={() => handleEditPost(item)}
              />
              <IconButton
                icon="delete"
                size={24}
                style={[styles.deleteIcon, { backgroundColor: '#FFC107' }]}
                onPress={() => handleDeletePost(item.id)}
              />
            </Card.Actions>
          </Card>
        )}
      />

      {/* Bottom navigation */}
      <View style={styles.bottomNavigationBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
          <Icon name="person-outline" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>PROFILE</Text>
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
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  deleteIcon: {
    color: '#53372D',
    backgroundColor: '#FFC107',
  },
  userName: {
    margin: 5,
    fontWeight: 'bold',
    fontSize: 30,
  },
  postImage: {
    height: 200,
    width: '100%',
    marginVertical: 8,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 20,
    marginTop: 15,
  },
});

export default MyPostsScreen;