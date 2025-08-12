import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { Notification, NotificationType } from "./types";

const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

export class NotificationService {
  // Create a new notification
  static async createNotification(
    userId: string, // Recipient
    type: NotificationType,
    title: string,
    message: string,
    entityType: 'event' | 'movie' | 'screenplay',
    entityId: string,
    entityTitle: string,
    actionUserId?: string, // User who performed the action
    actionUserName?: string
  ): Promise<void> {
    try {
      const notificationData = {
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
        entityTitle,
        actionUserId,
        actionUserName,
        isRead: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, `artifacts/${appId}/public/data/notifications`),
        notificationData
      );

      console.log(`Notification created for user ${userId}: ${title}`);
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, `artifacts/${appId}/public/data/notifications`, notificationId);
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
  static subscribeToUserNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/notifications`),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const notifications = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to ISO strings
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          readAt: doc.data().readAt?.toDate?.()?.toISOString() || doc.data().readAt,
        } as Notification));
        callback(notifications);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        callback([]);
      }
    );
  }

  // Get unread count for a user
  static subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ): () => void {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/notifications`),
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

    await this.createNotification(
      eventCreatorId,
      'event_followed',
      'New Event Follower',
      `${followerUserName} is now following your event "${eventTitle}"`,
      'event',
      eventId,
      eventTitle,
      followerUserId,
      followerUserName
    );
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

    await this.createNotification(
      eventCreatorId,
      'event_comment',
      'New Event Comment',
      `${commenterUserName} commented on your event "${eventTitle}": ${truncatedComment}`,
      'event',
      eventId,
      eventTitle,
      commenterUserId,
      commenterUserName
    );
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

    await this.createNotification(
      eventCreatorId,
      'audition_tape_submitted',
      'New Audition Tape',
      `${submitterUserName} submitted an audition tape for the role "${roleName}" in "${eventTitle}"`,
      'event',
      eventId,
      eventTitle,
      submitterUserId,
      submitterUserName
    );
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

    await this.createNotification(
      movieCreatorId,
      'movie_rated',
      'New Movie Rating',
      `${raterUserName} gave your movie "${movieTitle}" ${rating} star${rating !== 1 ? 's' : ''}`,
      'movie',
      movieId,
      movieTitle,
      raterUserId,
      raterUserName
    );
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

    await this.createNotification(
      movieCreatorId,
      'movie_reviewed',
      'New Movie Review',
      message,
      'movie',
      movieId,
      movieTitle,
      reviewerUserId,
      reviewerUserName
    );
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

    await this.createNotification(
      screenplayAuthorId,
      'screenplay_commented',
      'New Screenplay Comment',
      `${commenterUserName} commented on your screenplay "${screenplayTitle}": ${truncatedComment}`,
      'screenplay',
      screenplayId,
      screenplayTitle,
      commenterUserId,
      commenterUserName
    );
  }
}
