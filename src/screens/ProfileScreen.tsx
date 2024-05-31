import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface UserData {
  uid: string;
  name: string;
  email: string;
  goal: string;
  image: string;
}

const ProfileScreen = () => {
   const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const uid = user.uid;
          const userQuery = await firestore().collection('users').where('uid', '==', uid).get();
          if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            setUserData(userDoc.data() as UserData);
          } else {
            setError('User data not found');
          }
        } else {
          setError('User not authenticated');
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleMyPosts = () => {
    navigation.navigate('MyPosts' as never);
  };

  const handleUploadPost = () => {
    navigation.navigate('UploadAPost' as never);
  };

  const handleCommunity = () => {
    navigation.navigate('Community' as never);
  };

  const handleHabits = () => {
    navigation.navigate('Habits' as never);
  };
  const handleProfile = () => {
    navigation.navigate('Profile' as never);
  }

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
      {/* Profile section */}
      <View style={styles.profileSection}>
        {userData.image ? (
          <Image source={{ uri: userData.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Text style={styles.goal}>MY GOAL: {userData.goal}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      </View>

       {/* Bottom navigation */}
       {/* Post actions */}
      <View style={styles.postActionsContainer}>
        {/* <View style={[styles.postActionRow, styles.firstPostActionButton]}> */}
          {/* <View style={styles.separator} /> */}
          <TouchableOpacity style={[styles.postActionButton, styles.firstPostActionButton]} onPress={handleUploadPost}>
            <Icon name="add-circle-outline" size={24} color="#53372D" style={styles.postActionButtonIcon} />
            <Text style={styles.postActionButtonText}>UPLOAD A POST</Text>
            <Icon name="chevron-right" size={25} color="#53372D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postActionButton} onPress={handleMyPosts}>
            <Icon name="list-alt" size={24} color="#53372D" style={styles.postActionButtonIcon} />
            <Text style={styles.postActionButtonText}>MY POSTS</Text>
            <Icon name="chevron-right" size={25} color="#53372D" />
          </TouchableOpacity>
      </View>

      {/* Additional bottom navigation */}
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
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 90,
  },
  avatarPlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 90,
    backgroundColor: '#E0E0E0',
    marginBottom: 30,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#53372D',
    marginTop: 40,
  },
  email: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#53372D',
    marginBottom: 10,
  },
  goal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#53372D',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#53372D',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFC107',
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
  postActionsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  postActionButton: {
    borderColor: '#d3d3d3',
    borderBottomWidth: 1,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  firstPostActionButton: {
    borderTopWidth: 1,
  },
  postActionButtonIcon: {
    marginRight: 10,
  },
  postActionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#53372D',
    flex: 1,
  },
});

export default ProfileScreen;