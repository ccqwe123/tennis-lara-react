import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, Link, router } from "@inertiajs/react"
import { format } from "date-fns"
import { Calendar, Trophy, Users } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"

interface Tournament {
    id: number
    name: string
    description: string
    start_date: string
    end_date: string
    registration_fee: string
    max_participants: number | null
    status: 'open' | 'ongoing' | 'completed'
}

interface PageProps {
    auth: any
    tournaments: Tournament[]
}

export default function TournamentIndex({ auth, tournaments }: PageProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournaments</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Tournaments' },
            ]}
        >
            <Head title="Tournaments" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => (
                            <Card key={tournament.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                                        <Badge variant={tournament.status === 'open' ? 'default' : 'secondary'}>
                                            {tournament.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {tournament.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {format(new Date(tournament.start_date), "PPP")}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="mr-2 h-4 w-4" />
                                        {tournament.max_participants ? `${tournament.max_participants} Spots` : "Unlimited"}
                                    </div>
                                    <div className="flex items-center text-sm font-semibold text-emerald-600">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Fee: {parseFloat(tournament.registration_fee).toFixed(2)}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/tournaments/${tournament.id}`} className="w-full">
                                        <Button className="w-full">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}

                        {tournaments.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <Trophy className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                <p>No active tournaments found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
