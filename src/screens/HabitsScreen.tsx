import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import firebase from 'firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useIsFocused } from '@react-navigation/native';
import { HabitsModel, Habit } from '../Models/HabitsModel';

type HabitsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Habits'>;

type Props = {
  navigation: HabitsScreenNavigationProp;
};

const HabitScreen: React.FC<Props> = ({ navigation }) => {
  const [quote, setQuote] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [newTask, setNewTask] = useState('');
  const [habitTasks, setHabitTasks] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchQuote();
    fetchHabitTasks();
  }, [navigation, isFocused]);

  const fetchQuote = async () => {
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/quotes', {
        params: {
          category: 'success',
        },
        headers: {
          'X-Api-Key': 'w9gnZzvpPAm7JdSIb3lFFA==Jo449zdahYiBrZJy',
        },
      });
      setQuote(response.data[0].quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const fetchHabitTasks = async () => {
    const user = auth().currentUser;
    if (user) {
      const db = firestore();
      const habitRef = db.collection('Habit');
      const snapshot = await habitRef.where('uid', '==', user.uid).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setHabitTasks(doc.data().tasks);
        setTasksCompleted(doc.data().completedTasks);
      }
    }
  };

  const handleAddTask = async () => {
    const user = auth().currentUser;
    if (user) {
      const db = firestore();
      const habitRef = db.collection('Habit');
      const snapshot = await habitRef.where('uid', '==', user.uid).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const updatedTasks = [...doc.data().tasks, newTask];
        const completedTasksCount = doc.data().completedTasks || 0;
        await doc.ref.update({
          tasks: updatedTasks,
          completedTasks: completedTasksCount,
        });
        // Local insert
        const localHabit: Habit = {
          uid: user.uid,
          tasks: updatedTasks,
          completedTasks: completedTasksCount,
        };
        await HabitsModel.insertTask(user.uid, newTask);
      } else {
        await habitRef.add({
          uid: user.uid,
          tasks: [newTask],
          completedTasks: 0,
        });
        // Local insert
        const localHabit: Habit = {
          uid: user.uid,
          tasks: [newTask],
          completedTasks: 0,
        };
        await HabitsModel.insertTask(user.uid, newTask);
      }
      setNewTask('');
      fetchHabitTasks();
    }
  };

  const handleCompleteTask = async (task: string) => {
    const user = auth().currentUser;
    if (user) {
      const db = firestore();
      const habitRef = db.collection('Habit');
      const snapshot = await habitRef.where('uid', '==', user.uid).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const updatedTasks = doc.data().tasks.filter((item: string) => item !== task);
        const completedTasksCount = doc.data().completedTasks || 0;
        await doc.ref.update({
          tasks: updatedTasks,
          completedTasks: completedTasksCount + 1,
        });
        
        fetchHabitTasks();
      } 
    }
  };

const renderHabitTask = ({ item }: { item: any }) => (
    <View style={styles.taskItem}>
        <Text style={styles.taskText}>{item}</Text>
        <TouchableOpacity onPress={() => handleCompleteTask(item)}>
            <Icon name="check-box-outline-blank" size={24} color="#53372D" />
        </TouchableOpacity>
    </View>
);

  const handleLogout = async () => {
    try {
      await auth().signOut();
        navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/bee_image.png')} style={styles.beeImage} />
      <Text style={styles.quote}>{quote}</Text>
      <Text style={styles.tasksCompleted}>Tasks You've Completed: {tasksCompleted}</Text>
      <TextInput
        value={newTask}
        onChangeText={setNewTask}
        placeholder="add task"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>ADD TASK</Text>
      </TouchableOpacity>
      <FlatList
        data={habitTasks}
        renderItem={renderHabitTask}
        keyExtractor={(item, index) => index.toString()}
        style={styles.taskList}
      />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Community')}>
          <Icon name="people-outline" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>community</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
          <Icon name="check-circle-outline" size={24} color="#53372D" />
          <Text style={[styles.navButtonText, styles.activeNavButtonText]}>habits</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#53372D" />
          <Text style={styles.navButtonText}>logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingTop: 50,
  },
  beeImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  quote: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginHorizontal: 20,
    color: '#53372D',
  },
  tasksCompleted: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#53372D',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: '#53372D',
  },
  addButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#53372D',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  taskList: {
    width: '100%',
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginHorizontal: 10,
    borderBottomColor: '#53372D',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#53372D',
  },
  bottomNavigation: {
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
  activeNavButton: {
    borderTopWidth: 2,
    borderTopColor: '#FFCC00',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 5,
    color: '#53372D',
    textTransform: 'uppercase',
  },
  activeNavButtonText: {
    color: '#53372D',
  },
});

export default HabitScreen;