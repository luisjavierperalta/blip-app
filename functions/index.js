/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Email/Password Signup
exports.createUser = onCall(async (data, context) => {
  try {
    const { email, password, username, phoneNumber } = data;

    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber,
      displayName: username,
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      username,
      phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      verified: false,
      profileComplete: false
    });

    return {
      success: true,
      uid: userRecord.uid
    };
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Phone Verification
exports.verifyPhoneNumber = onCall(async (data, context) => {
  try {
    const { phoneNumber, verificationCode } = data;
    const uid = context.auth.uid;

    // Verify the phone number
    const userRecord = await admin.auth().getUser(uid);
    
    if (userRecord.phoneNumber === phoneNumber) {
      // Update user verification status in Firestore
      await admin.firestore().collection('users').doc(uid).update({
        verified: true,
        phoneVerified: true
      });

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } else {
      throw new Error('Phone number does not match');
    }
  } catch (error) {
    logger.error('Error verifying phone number:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Update User Profile
exports.updateUserProfile = onCall(async (data, context) => {
  try {
    const { username, phoneNumber } = data;
    const uid = context.auth.uid;

    // Update user profile in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      username,
      phoneNumber,
      profileComplete: true
    });

    // Update user in Auth
    await admin.auth().updateUser(uid, {
      displayName: username,
      phoneNumber
    });

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    logger.error('Error updating profile:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Delete User Account
exports.deleteUserAccount = onCall(async (data, context) => {
  try {
    const uid = context.auth.uid;

    // Delete user from Auth
    await admin.auth().deleteUser(uid);

    // Delete user data from Firestore
    await admin.firestore().collection('users').doc(uid).delete();

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    logger.error('Error deleting account:', error);
    throw new HttpsError('internal', error.message);
  }
});
