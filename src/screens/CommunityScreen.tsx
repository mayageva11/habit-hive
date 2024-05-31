import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import { Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

interface Post {
  id: string;
  title: string;
  content: string;
  userName: string;
  userImage: string;
  postImage: string;
  createdAt: Date;
}

const CommunityScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postSnapshot = await firestore().collection('posts').get();
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
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.userName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleProfile = () => {
    navigation.navigate('Profile' as never);
  };

  const handleCommunity = () => {
    navigation.navigate('Community' as never);
  };

  const handleHabits = () => {
    navigation.navigate('Habits' as never);
  };

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredPosts}
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
          </Card>
        )}
      />
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
  searchBar: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40, 
    marginHorizontal: 20,
    marginVertical: 16,
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
  title:{
    fontSize: 24,
    fontWeight: 'bold',
  },
  content:{
    fontSize: 20,
    marginTop: 15,
  }
});

export default CommunityScreen;