import db from '../localBD';

export interface User {
  uid: string;
  name: string;
  email: string;
  goal: string;
}

export class UserModel {
  // Get user by uid
  static getUserByUid(uid: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE uid = ?',
          [uid],
          (_, { rows }) => {
            if (rows.length > 0) {
              const user: User = {
                uid: rows.item(0).uid,
                name: rows.item(0).name,
                email: rows.item(0).email,
                goal: rows.item(0).goal,
              };
              resolve(user);
            } else {
              resolve(null);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Insert user
  static insertUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO users (uid, name, email, goal) VALUES (?, ?, ?, ?)',
          [user.uid, user.name, user.email, user.goal],
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Update user
  static updateUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE users SET name = ?, email = ?, goal = ? WHERE uid = ?',
          [user.name, user.email, user.goal, user.uid],
          () => {
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }
}