import { ObjectId } from "mongodb"
import { connectToDatabase } from "./mongodb"

// Notification types
export enum NotificationType {
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PRODUCT_REVIEW = "PRODUCT_REVIEW",
  SYSTEM = "SYSTEM",
}

// Notification interface
export interface Notification {
  _id?: string | ObjectId
  userId: string | ObjectId
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: Date
  updatedAt?: Date
}

// Create a notification
export async function createNotification(notification: Omit<Notification, "read" | "createdAt">) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("notifications").insertOne({
      ...notification,
      read: false,
      createdAt: new Date(),
    })

    return { success: true, notificationId: result.insertedId }
  } catch (error) {
    console.error("Failed to create notification:", error)
    return { success: false, error }
  }
}

// Get notifications for a user
export async function getUserNotifications(
  userId: string | ObjectId,
  options: { limit?: number; unreadOnly?: boolean } = {},
) {
  try {
    const { db } = await connectToDatabase()

    const query: any = { userId: userId.toString() }

    if (options.unreadOnly) {
      query.read = false
    }

    const notifications = await db
      .collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 10)
      .toArray()

    return { success: true, notifications }
  } catch (error) {
    console.error("Failed to get user notifications:", error)
    return { success: false, error }
  }
}

// Mark notifications as read
export async function markNotificationsAsRead(notificationIds: string[] | ObjectId[]) {
  try {
    const { db } = await connectToDatabase()

    const result = await db
      .collection("notifications")
      .updateMany(
        { _id: { $in: notificationIds.map((id) => new ObjectId(id)) } },
        { $set: { read: true, updatedAt: new Date() } },
      )

    return { success: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    console.error("Failed to mark notifications as read:", error)
    return { success: false, error }
  }
}

// Get unread notification count for a user
export async function getUnreadNotificationCount(userId: string | ObjectId) {
  try {
    const { db } = await connectToDatabase()

    const count = await db.collection("notifications").countDocuments({
      userId: userId.toString(),
      read: false,
    })

    return { success: true, count }
  } catch (error) {
    console.error("Failed to get unread notification count:", error)
    return { success: false, error }
  }
}

// Create an order notification
export async function createOrderNotification(order: any, userId: string | ObjectId) {
  return createNotification({
    userId,
    type: NotificationType.ORDER_PLACED,
    title: "Order Placed",
    message: `Your order #${order._id} has been placed successfully.`,
    data: { orderId: order._id },
  })
}

// Create a payment notification
export async function createPaymentNotification(payment: any, userId: string | ObjectId) {
  return createNotification({
    userId,
    type: NotificationType.PAYMENT_RECEIVED,
    title: "Payment Received",
    message: `Your payment of $${(payment.amount / 100).toFixed(2)} has been received.`,
    data: { paymentId: payment.id, orderId: payment.orderId },
  })
}

export default {
  createNotification,
  getUserNotifications,
  markNotificationsAsRead,
  getUnreadNotificationCount,
  createOrderNotification,
  createPaymentNotification,
  NotificationType,
}
