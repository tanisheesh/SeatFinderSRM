import { ref, get, set } from 'firebase/database';
import { db } from './firebase';

// Admin emails - move to environment variable later
const ADMIN_EMAILS = ['tp6382@srmist.edu.in'];

export async function initializeUserRole(userId: string, email: string, displayName?: string) {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // Create new user with role
      const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
      await set(userRef, {
        email,
        displayName: displayName || email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
      });
      console.log(`User ${email} initialized with role: ${role}`);
    }
  } catch (error) {
    console.error('Error initializing user role:', error);
  }
}

export async function getUserRole(userId: string): Promise<'admin' | 'user' | null> {
  try {
    const userRef = ref(db, `users/${userId}/role`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}