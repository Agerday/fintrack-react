export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// "App" prefix: `Notification` is already a browser global (the Web Notifications API)
export type AppNotification = {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    // Where a click on the notification leads, e.g. `/invoices/INV-001`
    href?: string;
    // ISO string: serializable, ready for a future persist middleware or server payload
    createdAt: string;
    read: boolean;
};

// What a producer (WebSocket handler, mutation...) provides; the store fills in the rest
export type NewNotification = Pick<AppNotification, 'type' | 'title' | 'message' | 'href'>;
