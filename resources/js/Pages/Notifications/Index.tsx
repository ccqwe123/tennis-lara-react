import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { format } from "date-fns";
import { Bell, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

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

interface Props {
    auth: any;
    paginatedNotifications: {
        data: Notification[];
        links: any[];
        meta: any;
    };
}

export default function NotificationsIndex({ auth, paginatedNotifications }: Props) {
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
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Notifications</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Notifications' },
            ]}
        >
            <Head title="Notifications" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Bell className="h-6 w-6" />
                                All Notifications
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={markAllAsRead}>
                                <Check className="mr-2 h-4 w-4" />
                                Mark all as read
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {paginatedNotifications.data.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No notifications found.
                                    </div>
                                ) : (
                                    paginatedNotifications.data.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "flex items-start justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
                                                !notification.read_at ? "bg-blue-50/50 border-blue-100" : "bg-white"
                                            )}
                                            onClick={() => markAsRead(notification.id, notification.data.action_url)}
                                        >
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    "mt-1 h-2 w-2 rounded-full shrink-0",
                                                    !notification.read_at ? "bg-blue-600" : "bg-transparent"
                                                )} />
                                                <div className="space-y-1">
                                                    <p className={cn("text-sm font-medium leading-none", !notification.read_at && "font-bold text-primary")}>
                                                        {notification.data.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.data.message}
                                                    </p>
                                                    <div className="flex items-center pt-2 text-xs text-muted-foreground">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {format(new Date(notification.created_at), "PPp")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {paginatedNotifications.meta && paginatedNotifications.meta.last_page > 1 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    {paginatedNotifications.meta.links.map((link: any, i: number) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
