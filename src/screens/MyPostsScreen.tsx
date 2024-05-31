// MyPostsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, Avatar, IconButton } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Post {
  id: string;
  title: string;
  content: string;
  userName: string;
  userImage: string;
  postImage: string;
  createdAt: Date;
}

const MyPostsScreen: React.FC = () => {
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const postSnapshot = await firestore()
          .collection('posts')
          .where('uid', '==', user?.uid)
          .get();

        const postData: Post[] = await Promise.all(
          postSnapshot.docs.map(async (doc) => ({
            id: doc.id,
            title: doc.data().title,
            content: doc.data().content,
            userName: doc.data().userName,
            userImage: doc.data().profileImage,
            postImage: doc.data().image,
            createdAt: doc.data().createdAt.toDate(),
          }))
        );

        setPosts(postData);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, [user?.uid]);

  const handleEditPost = (post: Post) => {
    // Navigate to the edit post screen
    // navigation.navigate('EditPost', { post });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Delete the post from Firestore
      await firestore().collection('posts').doc(postId).delete();

      // Refresh the posts
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCommunity = () => {
    // Navigate to the community screen
    navigation.navigate('Community' as never);
  };

  const handleHabits = () => {
    // Navigate to the habits screen
    navigation.navigate('Habits' as never);
  };
  const handleProfile = () => {
    // Navigate to the habits screen
    navigation.navigate('Profile' as never);
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Optionally, you can navigate to the login screen after successful logout
      navigation.navigate('Login' as never);
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
              <Title style={styles.userName}>{item.userName}</Title>
            </View>
            <View style={styles.cardTitle}>
              <Title>{item.title}</Title>
            </View>
            <Image source={{ uri: item.postImage }} style={styles.postImage} />
            <Card.Content>
              <Paragraph>{item.content}</Paragraph>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  deleteIcon: {
    color: '#53372D',
    backgroundColor: '#FFC107',
  },
  userName: {
    margin: 10,
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
    width: 55,
    height: 55,
    borderRadius: 27.5, // Half the width/height to make it circular
    marginHorizontal: 20,
    marginVertical: 16,
  },
});

export default MyPostsScreen;