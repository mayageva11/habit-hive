import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

const db: SQLiteDatabase = SQLite.openDatabase(
  {
    name: 'habithive.db',
    location: 'default',
  },
  () => {
    console.log('Database opened successfully');
  },
  (error) => {
    console.log('Error opening database:', error);
  }
);

export const createTables = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, uid TEXT, title TEXT,  content TEXT)',
        [],
        () => {
          console.log('Posts table created successfully');
        },
        (error) => {
          console.log('Error creating posts table:', error);
        }
      );
  
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, name TEXT, email TEXT, goal TEXT)',
        [],
        () => {
          console.log('Users table created successfully');
        },
        (error) => {
          console.log('Error creating users table:', error);
        }
      );
  
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS habits (uid TEXT PRIMARY KEY, tasks TEXT, completedTasks TEXT )',
        [],
        () => {
          console.log('Habits table created successfully');
        },
        (error) => {
          console.log('Error creating habits table:', error);
        }
      );
    });
  };

export default db;