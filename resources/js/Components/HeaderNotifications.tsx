import { Bell, Check } from "lucide-react"
import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { usePage, router } from "@inertiajs/react"
import { cn } from "@/lib/utils"

interface Notification {
    id: string;
    data: {
        title: string;
        message: string;
        action_url?: string;
        type?: string;
    };
    created_at: string;
    read_at: string | null;
}

export function HeaderNotifications() {
    const { notifications, unreadCount } = usePage().props as unknown as {
        notifications: Notification[];
        unreadCount: number;
    };

    const markAsRead = (id: string, url?: string) => {
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (url) {
                    router.visit(url);
                }
            }
        });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
        });
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0">
                    <Bell className="h-12 w-12 text-black" />
                    <span className="sr-only">Toggle notifications</span>
                    {/* Notification Count Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">Notifications</p>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        markAllAsRead();
                                    }}
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            You have {unreadCount} unread messages.
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-h-[70vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer border-b last:border-0 group",
                                    !notification.read_at
                                        ? "bg-blue-50/50 hover:bg-blue-600"
                                        : "opacity-75 hover:opacity-100 hover:bg-gray-600"
                                )}
                                onClick={() => markAsRead(notification.id, notification.data.action_url)}
                            >
                                <div className="flex w-full justify-between items-start gap-2">
                                    <p className={cn("text-sm leading-snug transition-colors",
                                        !notification.read_at
                                            ? "font-semibold text-primary group-hover:text-white"
                                            : "font-medium text-muted-foreground group-hover:text-gray-100"
                                    )}>
                                        {notification.data.title}
                                    </p>
                                    {!notification.read_at && (
                                        <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0 group-hover:bg-white transition-colors" />
                                    )}
                                </div>
                                <p className={cn("text-xs line-clamp-2 transition-colors",
                                    !notification.read_at
                                        ? "text-muted-foreground group-hover:text-blue-100"
                                        : "text-muted-foreground group-hover:text-gray-300"
                                )}>
                                    {notification.data.message}
                                </p>
                                <p className={cn("text-[10px] mt-1 transition-colors",
                                    !notification.read_at
                                        ? "text-muted-foreground/60 group-hover:text-blue-200"
                                        : "text-muted-foreground/60 group-hover:text-gray-400"
                                )}>
                                    {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="p-2 bg-gray-50/50">
                    <Button
                        variant="ghost"
                        className="w-full h-8 text-xs text-primary justify-center hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
                        onClick={() => router.visit(route('notifications.index'))}
                    >
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
