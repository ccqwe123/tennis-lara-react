import { Head } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Calendar, Trophy, CreditCard } from "lucide-react"

interface UserDashboardProps {
    stats: {
        active_bookings: number
        tournaments_joined: number
        current_plan: string
    }
}

export default function UserDashboard({ stats }: UserDashboardProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_bookings}</div>
                        <p className="text-xs text-muted-foreground">Upcoming court reservations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tournaments_joined}</div>
                        <p className="text-xs text-muted-foreground">Joined and paid events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.current_plan}</div>
                        <p className="text-xs text-muted-foreground">Membership status</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <a
                            href="/bookings/create"
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-colors hover:bg-muted text-center"
                        >
                            <Calendar className="h-8 w-8 text-emerald-600" />
                            <span className="font-medium">Book a Court</span>
                            <span className="text-xs text-muted-foreground">Reserve a court for a match or practice</span>
                        </a>
                        <a
                            href="/tournaments"
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-colors hover:bg-muted text-center"
                        >
                            <Trophy className="h-8 w-8 text-amber-500" />
                            <span className="font-medium">Join Tournament</span>
                            <span className="text-xs text-muted-foreground">Register for upcoming competitive events</span>
                        </a>
                        <a
                            href="/my-bookings"
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-colors hover:bg-muted text-center"
                        >
                            <Calendar className="h-8 w-8 text-blue-500" />
                            <span className="font-medium">My Bookings</span>
                            <span className="text-xs text-muted-foreground">View your comprehensive booking history</span>
                        </a>
                        <a
                            href="/memberships"
                            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 transition-colors hover:bg-muted text-center"
                        >
                            <CreditCard className="h-8 w-8 text-purple-500" />
                            <span className="font-medium">Membership Status</span>
                            <span className="text-xs text-muted-foreground">Check expiry and renewal options</span>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
