import db from '../localBD';

export interface Habit {
  uid: string;
  tasks: string[];
  completedTasks: number;
}

export class HabitsModel {
   
  // Get tasks by user ID
  static async getTasksByUserId(uid: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT tasks FROM habits WHERE uid = ?',
          [uid],
          (_, { rows }) => {
            if (rows.length > 0) {
              const tasks = JSON.parse(rows.item(0).tasks);
              resolve(tasks);
            } else {
              resolve([]);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Insert a new task for a user
  static async insertTask(uid: string, task: String): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT tasks FROM habits WHERE uid = ?',
          [uid],
          (_, { rows }) => {
            let tasks: String[] = [];
            if (rows.length > 0) {
              tasks = JSON.parse(rows.item(0).tasks);
            }
            tasks.push(task);
            tx.executeSql(
              'INSERT OR REPLACE INTO habits (uid, tasks) VALUES (?, ?)',
              [uid, JSON.stringify(tasks)],
              () => {
                resolve();
              },
              (error) => {
                reject(error);
              }
            );
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Delete a task for a user
 // Delete a task for a user
// Delete a task for a user
static async deleteTask(uid: string, task: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT tasks, completedTasks FROM habits WHERE uid = ?',
          [uid],
          (_, { rows }) => {
            if (rows.length > 0) {
              const tasks = JSON.parse(rows.item(0).tasks);
              let completedTasks = rows.item(0).completedTasks || 0;
              const updatedTasks = tasks.filter((item: string) => item !== task);
  
              // Check if the deleted task was previously marked as completed
              if (tasks.includes(task)) {
                completedTasks--;
              }
  
              tx.executeSql(
                'UPDATE habits SET tasks = ?, completedTasks = ? WHERE uid = ?',
                [JSON.stringify(updatedTasks), completedTasks, uid],
                () => {
                  resolve();
                },
                (error) => {
                  reject(error);
                }
              );
            } else {
              resolve();
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  
    
}
