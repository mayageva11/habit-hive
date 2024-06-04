import db from '../localBD';

export interface Post {
    id: string;
    uid: string;
    title: string;
    content: string;
  }

export class PostModel {
  // Insert a new post
  static insertPost(post: Post): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO posts (id, uid, title,  content) VALUES ( ?, ?, ?, ?)',
          [post.id, post.uid, post.title, post.content],
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

  // Update an existing post
  static updatePost(post: Post): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE posts SET uid = ?, title = ?, content = ? WHERE id = ?',
          [post.id, post.uid, post.title, post.content],
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

  // Delete a post by its ID
  static deletePost(postId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM posts WHERE id = ?',
          [postId],
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

  // Get all posts by user ID
  static getPostsByUserId(uid: string): Promise<Post[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM posts WHERE uid = ?',
          [uid],
          (tx, results) => {
            const rows = results.rows;
            const posts: Post[] = [];
            for (let i = 0; i < rows.length; i++) {
              posts.push(rows.item(i));
            }
            resolve(posts);
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Get all posts
  static getAllPosts(): Promise<Post[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM posts',
          [],
          (tx, results) => {
            const rows = results.rows;
            const posts: Post[] = [];
            for (let i = 0; i < rows.length; i++) {
              posts.push(rows.item(i));
            }
            resolve(posts);
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }
}
