import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getUser } from './auth';

// Helper to generate a unique ID for unauthenticated users
const generateUserId = () => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `user_${timestamp}_${randomString}`;
};

// Get or create user ID from session storage
const getUserId = () => {
    const user = getUser();
    if (user) return user._id;
    
    let sessionUserId = sessionStorage.getItem('sessionUserId');
    if (!sessionUserId) {
        sessionUserId = generateUserId();
        sessionStorage.setItem('sessionUserId', sessionUserId);
    }
    return sessionUserId;
};

export const uploadInterviewVideo = async (videoBlob, questionNumber) => {
    try {
        const userId = getUserId();
        const isAuthenticated = !!getUser();
        
        // Create a unique filename using timestamp and question number
        const timestamp = new Date().getTime();
        const filename = `interviews/${userId}/${timestamp}_question_${questionNumber}.webm`;
        
        console.log('Starting video upload to Firebase:', filename);
        
        // Create a reference to the file location in Firebase Storage
        const storageRef = ref(storage, filename);
        
        // Upload the video blob with metadata
        const metadata = {
            contentType: 'video/webm',
            customMetadata: {
                questionNumber: questionNumber.toString(),
                timestamp: timestamp.toString(),
                isAuthenticated: isAuthenticated.toString(),
                sessionId: userId
            }
        };
        
        // Upload the video blob
        const snapshot = await uploadBytes(storageRef, videoBlob, metadata);
        console.log('Video uploaded successfully:', snapshot.metadata);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Download URL generated:', downloadURL);
        
        return {
            url: downloadURL,
            filename: filename,
            timestamp: timestamp,
            isAuthenticated: isAuthenticated
        };
    } catch (error) {
        console.error('Error uploading video:', error);
        throw new Error(`Failed to upload video: ${error.message}`);
    }
}; 