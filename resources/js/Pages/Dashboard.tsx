import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, usePage } from "@inertiajs/react"
import type { PageProps } from "@/types"
import AdminDashboard from "./Dashboard/AdminDashboard"
import UserDashboard from "./Dashboard/UserDashboard"

export default function Dashboard(props: any) {
    const { auth } = usePage<PageProps>().props
    const permissions = auth.permissions

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {permissions.hasStaffAccess ? (
                    <AdminDashboard
                        stats={props.stats}
                        chart_data={props.chart_data}
                        todays_players={props.todays_players}
                        filters={props.filters}
                    />
                ) : (
                    <UserDashboard stats={props.stats} />
                )}
            </div>
        </AuthenticatedLayout>
    )
}
