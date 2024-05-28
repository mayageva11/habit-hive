import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import RegisterScreen from './src/screens/RegisterScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
      <Toast/>
    </NavigationContainer>
  );
}