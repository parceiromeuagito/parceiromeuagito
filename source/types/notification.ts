export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  link?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  events: {
    newOrder: boolean;
    orderStatus: boolean;
    stockLow: boolean;
    dailyReport: boolean;
  };
}
