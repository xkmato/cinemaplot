import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { Notification } from "./types";

export class NotificationService {
  // Create a new notification
  static async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    console.log('🔔 Creating notification:', notificationData);
    const notification = {
      ...notificationData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log('🔔 Notification created with ID:', docRef.id);
    return docRef.id;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      // This would require a batch operation or cloud function for efficiency
      // For now, we'll handle this in the component using the subscription
      console.log(`Marking all notifications as read for user ${userId}`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Subscribe to notifications for a user
  static subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    console.log('🔔 Setting up notification subscription for user:', userId);
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      console.log('🔔 Received notifications from Firebase:', notifications);
      console.log('🔔 Number of notifications:', notifications.length);
      callback(notifications);
    });
  }

  // Get unread count for a user
  static subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        callback(querySnapshot.size);
      },
      (error) => {
        console.error("Error fetching unread count:", error);
        callback(0);
      }
    );
  }

  // Helper methods for creating specific notification types
  static async notifyEventFollowed(
    eventCreatorId: string,
    eventId: string,
    eventTitle: string,
    followerUserId: string,
    followerUserName: string
  ): Promise<void> {
    // Don't notify if user follows their own event
    if (eventCreatorId === followerUserId) return;

    await this.createNotification({
      userId: eventCreatorId,
      type: 'event_followed',
      title: 'New Event Follower',
      message: `${followerUserName} is now following your event "${eventTitle}"`,
      entityType: 'event',
      entityId: eventId,
      entityTitle: eventTitle,
      actionUserId: followerUserId,
      actionUserName: followerUserName,
      isRead: false
    });
  }

  static async notifyEventComment(
    eventCreatorId: string,
    eventId: string,
    eventTitle: string,
    commenterUserId: string,
    commenterUserName: string,
    commentContent: string
  ): Promise<void> {
    // Don't notify if user comments on their own event
    if (eventCreatorId === commenterUserId) return;

    const truncatedComment = commentContent.length > 50 
      ? commentContent.substring(0, 50) + "..."
      : commentContent;

    await this.createNotification({
      userId: eventCreatorId,
      type: 'event_comment',
      title: 'New Event Comment',
      message: `${commenterUserName} commented on your event "${eventTitle}": ${truncatedComment}`,
      entityType: 'event',
      entityId: eventId,
      entityTitle: eventTitle,
      actionUserId: commenterUserId,
      actionUserName: commenterUserName,
      isRead: false
    });
  }

  static async notifyAuditionTapeSubmitted(
    eventCreatorId: string,
    eventId: string,
    eventTitle: string,
    submitterUserId: string,
    submitterUserName: string,
    roleName: string
  ): Promise<void> {
    // Don't notify if creator submits to their own audition
    if (eventCreatorId === submitterUserId) return;

    await this.createNotification({
      userId: eventCreatorId,
      type: 'audition_tape_submitted',
      title: 'New Audition Tape',
      message: `${submitterUserName} submitted an audition tape for the role "${roleName}" in "${eventTitle}"`,
      entityType: 'event',
      entityId: eventId,
      entityTitle: eventTitle,
      actionUserId: submitterUserId,
      actionUserName: submitterUserName,
      isRead: false
    });
  }

  static async notifyMovieRated(
    movieCreatorId: string,
    movieId: string,
    movieTitle: string,
    raterUserId: string,
    raterUserName: string,
    rating: number
  ): Promise<void> {
    // Don't notify if user rates their own movie
    if (movieCreatorId === raterUserId) return;

    await this.createNotification({
      userId: movieCreatorId,
      type: 'movie_rated',
      title: 'New Movie Rating',
      message: `${raterUserName} gave your movie "${movieTitle}" ${rating} star${rating !== 1 ? 's' : ''}`,
      entityType: 'movie',
      entityId: movieId,
      entityTitle: movieTitle,
      actionUserId: raterUserId,
      actionUserName: raterUserName,
      isRead: false
    });
  }

  static async notifyMovieReviewed(
    movieCreatorId: string,
    movieId: string,
    movieTitle: string,
    reviewerUserId: string,
    reviewerUserName: string,
    rating: number,
    hasComment: boolean
  ): Promise<void> {
    // Don't notify if user reviews their own movie
    if (movieCreatorId === reviewerUserId) return;

    const message = hasComment 
      ? `${reviewerUserName} reviewed your movie "${movieTitle}" with ${rating} star${rating !== 1 ? 's' : ''} and left a comment`
      : `${reviewerUserName} reviewed your movie "${movieTitle}" with ${rating} star${rating !== 1 ? 's' : ''}`;

    await this.createNotification({
      userId: movieCreatorId,
      type: 'movie_reviewed',
      title: 'New Movie Review',
      message: message,
      entityType: 'movie',
      entityId: movieId,
      entityTitle: movieTitle,
      actionUserId: reviewerUserId,
      actionUserName: reviewerUserName,
      isRead: false
    });
  }

  static async notifyScreenplayComment(
    screenplayAuthorId: string,
    screenplayId: string,
    screenplayTitle: string,
    commenterUserId: string,
    commenterUserName: string,
    commentContent: string
  ): Promise<void> {
    // Don't notify if user comments on their own screenplay
    if (screenplayAuthorId === commenterUserId) return;

    const truncatedComment = commentContent.length > 50 
      ? commentContent.substring(0, 50) + "..."
      : commentContent;

    await this.createNotification({
      userId: screenplayAuthorId,
      type: 'screenplay_commented',
      title: 'New Screenplay Comment',
      message: `${commenterUserName} commented on your screenplay "${screenplayTitle}": ${truncatedComment}`,
      entityType: 'screenplay',
      entityId: screenplayId,
      entityTitle: screenplayTitle,
      actionUserId: commenterUserId,
      actionUserName: commenterUserName,
      isRead: false
    });
  }
}
