import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UploadAPostScreen from './src/screens/UploadAPostScreen';
import MyPostsScreen from './src/screens/MyPostsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import EditPostScreen, { Post } from './src/screens/EditPostScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HabitsScreen from './src/screens/HabitsScreen';

export type RootStackParamList = {
  Profile: undefined;
  UploadAPost: undefined;
  MyPosts: undefined;
  Community: undefined;
  EditPost: { post: Post; postId: string };
  Login: undefined;
  Register: undefined;
  EditProfile: undefined;
  Habits: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Group>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="UploadAPost" component={UploadAPostScreen} />
            <Stack.Screen name="MyPosts" component={MyPostsScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen
              name="EditPost"
              component={EditPostScreen as React.ComponentType<StackScreenProps<RootStackParamList>>}
              options={{ title: 'Edit Post' }}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    
  );
};

export default App;