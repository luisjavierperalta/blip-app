import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate search terms from user data
export const generateSearchTerms = (userData: {
  displayName?: string;
  username?: string;
  bio?: string;
  interests?: string[];
  location?: string;
}) => {
  const searchTerms = new Set<string>();

  // Add display name terms
  if (userData.displayName) {
    const nameTerms = userData.displayName.toLowerCase().split(/\s+/);
    nameTerms.forEach(term => {
      searchTerms.add(term);
      // Add partial terms for better search
      for (let i = 3; i <= term.length; i++) {
        searchTerms.add(term.substring(0, i));
      }
    });
  }

  // Add username
  if (userData.username) {
    const username = userData.username.toLowerCase();
    searchTerms.add(username);
    // Add partial username terms
    for (let i = 3; i <= username.length; i++) {
      searchTerms.add(username.substring(0, i));
    }
  }

  // Add bio terms
  if (userData.bio) {
    const bioTerms = userData.bio.toLowerCase().split(/\s+/);
    bioTerms.forEach(term => {
      if (term.length >= 3) {
        searchTerms.add(term);
      }
    });
  }

  // Add interests
  if (userData.interests) {
    userData.interests.forEach(interest => {
      const interestTerm = interest.toLowerCase();
      searchTerms.add(interestTerm);
      // Add partial interest terms
      for (let i = 3; i <= interestTerm.length; i++) {
        searchTerms.add(interestTerm.substring(0, i));
      }
    });
  }

  // Add location
  if (userData.location) {
    const locationTerms = userData.location.toLowerCase().split(/\s+/);
    locationTerms.forEach(term => {
      if (term.length >= 3) {
        searchTerms.add(term);
      }
    });
  }

  return Array.from(searchTerms);
};

// Update user search terms
export const updateUserSearchTerms = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const searchTerms = generateSearchTerms(userData);

    await updateDoc(userRef, {
      searchTerms,
      lastSearchTermsUpdate: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error updating user search terms:', error);
    return false;
  }
};

// Update search terms when user profile is updated
export const onUserProfileUpdate = async (userId: string, updatedData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentData = userDoc.data();
    const mergedData = { ...currentData, ...updatedData };
    const searchTerms = generateSearchTerms(mergedData);

    await updateDoc(userRef, {
      ...updatedData,
      searchTerms,
      lastSearchTermsUpdate: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}; 