import { httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, functions } from '../config/firebase';

// Send OTP to phone number
export const sendOtpToPhone = async (phoneNumber: string) => {
  try {
    const verifyPhoneNumber = httpsCallable(functions, 'verifyPhoneNumber');
    const result = await verifyPhoneNumber({ phoneNumber });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Verify OTP code
export const verifyOtp = async (phoneNumber: string, verificationCode: string) => {
  try {
    const verifyPhoneNumber = httpsCallable(functions, 'verifyPhoneNumber');
    const result = await verifyPhoneNumber({ phoneNumber, verificationCode });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string, username: string, legalFullName: string, phoneNumber?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await httpsCallable(functions, 'createUser')({
      uid: user.uid,
      email,
      username,
      legalFullName,
      phoneNumber
    });

    return userCredential;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Update user profile
export const updateProfile = async (username: string, phoneNumber: string) => {
  try {
    const updateUserProfile = httpsCallable(functions, 'updateUserProfile');
    const result = await updateUserProfile({ username, phoneNumber });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Delete user account
export const deleteAccount = async () => {
  try {
    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    const result = await deleteUserAccount();
    return result.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 