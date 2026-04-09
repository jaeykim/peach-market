import { prisma } from "./db";

export type NotificationType =
  | "BID_RECEIVED"
  | "BID_ACCEPTED"
  | "BID_REJECTED"
  | "COUNTER_RECEIVED"
  | "DEAL_CLOSED"
  | "CHAT_MESSAGE";

export async function notify(
  userId: string,
  type: NotificationType,
  payload: Record<string, unknown>,
) {
  return prisma.notification.create({
    data: { userId, type, payload: JSON.stringify(payload) },
  });
}
