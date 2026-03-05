import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head } from "@inertiajs/react"
import { Crown, User as UserIcon, Calendar } from "lucide-react"

import { Button } from "@/Components/ui/button"
import {
    Card,
    CardContent,
} from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { cn } from "@/lib/utils"

interface PageProps {
    auth: any
    fees: { [key: string]: string }
    isStaff: boolean
    // User Data
    mySubscription?: {
        type: string
        start_date: string
        end_date: string
        status: string
    } | null
}

export default function MembershipIndex({ auth, mySubscription }: PageProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Memberships</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Memberships' },
            ]}
        >
            <Head title="Memberships" />

            <div className="py-6 w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                            My Membership
                        </h1>
                        <div className="max-w-3xl mx-auto">
                            {mySubscription ? (
                                <Card className="border-emerald-500 shadow-lg bg-emerald-50/50">
                                    <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Crown className="h-8 w-8 text-emerald-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-2xl font-bold text-gray-900">{mySubscription.type} Plan</h3>
                                                <Badge className="bg-emerald-500 mt-1">Active Member</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="flex items-center gap-2 text-gray-600 justify-end">
                                                <Calendar className="h-4 w-4" />
                                                <span>Expires: <span className="font-semibold text-gray-900">{mySubscription.end_date}</span></span>
                                            </div>
                                            <p className="text-sm text-gray-500">Member since {mySubscription.start_date}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-dashed border-2 shadow-sm">
                                    <CardContent className="p-8 text-center space-y-4">
                                        <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-gray-900">No Active Membership</h3>
                                            <p className="text-gray-500">Please contact the front desk to upgrade your membership.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
