import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, usePage } from "@inertiajs/react"
import type { PageProps } from "@/types"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import { Calendar, CreditCard, Trophy, Users } from "lucide-react"

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props
    const user = auth.user
    const permissions = auth.permissions

    // Quick stats cards based on user role
    const stats = [
        {
            title: "Total Bookings",
            value: "24",
            description: "Active court bookings",
            icon: Calendar,
            visible: true,
        },
        {
            title: "Tournaments",
            value: "3",
            description: "Upcoming events",
            icon: Trophy,
            visible: true,
        },
        {
            title: "Payments Due",
            value: "$150",
            description: "Pending payments",
            icon: CreditCard,
            visible: permissions?.hasMemberAccess,
        },
        {
            title: "Total Members",
            value: "156",
            description: "Active members",
            icon: Users,
            visible: permissions?.hasStaffAccess,
        },
    ].filter(stat => stat.visible)

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back, {user?.name}!
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening at the Tennis Club today.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${user?.type === 'admin' ? 'bg-red-500/10 text-red-500' :
                            user?.type === 'staff' ? 'bg-blue-500/10 text-blue-500' :
                                user?.type === 'member' ? 'bg-green-500/10 text-green-500' :
                                    'bg-gray-500/10 text-gray-500'
                            }`}>
                            {user?.type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main content area */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your recent bookings and activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 rounded-lg border p-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Court A Booking</p>
                                        <p className="text-xs text-muted-foreground">Tomorrow, 9:00 AM - 10:00 AM</p>
                                    </div>
                                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                                        Confirmed
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 rounded-lg border p-3">
                                    <Trophy className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Spring Tournament</p>
                                        <p className="text-xs text-muted-foreground">Registration open until March 15</p>
                                    </div>
                                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                                        Open
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks for your role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <a
                                href="/bookings/create"
                                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                            >
                                <Calendar className="h-5 w-5" />
                                <span className="text-sm font-medium">Book a Court</span>
                            </a>
                            <a
                                href="/tournaments"
                                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                            >
                                <Trophy className="h-5 w-5" />
                                <span className="text-sm font-medium">View Tournaments</span>
                            </a>
                            <a
                                href="/payments"
                                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                            >
                                <CreditCard className="h-5 w-5" />
                                <span className="text-sm font-medium">My Payments</span>
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
