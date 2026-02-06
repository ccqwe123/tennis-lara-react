import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { ArrowLeft, Users, CreditCard, Trash2, CheckCircle, XCircle, Check } from "lucide-react"
import { toast } from "sonner"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"

interface Registration {
    id: number
    user_id: number
    user_name: string
    user_email: string
    payment_method: 'cash' | 'gcash'
    payment_status: 'paid' | 'pending' | 'unpaid'
    amount_paid: string
    created_at: string
}

interface Tournament {
    id: number
    name: string
    registration_fee: string
}

interface Summary {
    total: number
    paid: number
    unpaid: number
    total_amount: number
}

interface PageProps {
    auth: any
    tournament: Tournament
    registrations: Registration[]
    summary: Summary
}

export default function Participants({ auth, tournament, registrations, summary }: PageProps) {
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

    const handleRemoveClick = (registration: Registration) => {
        setSelectedRegistration(registration)
        setRemoveDialogOpen(true)
    }

    const handleRemoveParticipant = () => {
        if (selectedRegistration) {
            router.delete(`/tournaments/${tournament.id}/participants/${selectedRegistration.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setRemoveDialogOpen(false)
                    setSelectedRegistration(null)
                    toast.success('Participant removed', {
                        description: `${selectedRegistration.user_name} has been removed from the tournament.`,
                    })
                },
                onError: () => {
                    toast.error('Failed to remove participant', {
                        description: 'An error occurred. Please try again.',
                    })
                },
            })
        }
    }

    const handleMarkAsPaid = (registration: Registration) => {
        router.patch(`/tournaments/${tournament.id}/participants/${registration.id}/pay`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Payment status updated', {
                    description: `${registration.user_name} has been marked as paid.`,
                })
            },
            onError: () => {
                toast.error('Failed to update payment status', {
                    description: 'An error occurred. Please try again.',
                })
            },
        })
    }

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Pending
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unpaid
                    </Badge>
                )
        }
    }

    const getPaymentMethodBadge = (method: string) => {
        return (
            <Badge variant="outline" className="capitalize">
                <CreditCard className="h-3 w-3 mr-1" />
                {method}
            </Badge>
        )
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/tournaments/manage')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Tournament Participants
                    </h2>
                </div>
            }
        >
            <Head title={`Participants - ${tournament.name}`} />

            <div className="py-8 min-h-screen">
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Tournament Info */}
                    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-emerald-100">
                                Registration Fee: ₱{parseFloat(tournament.registration_fee).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Participants</p>
                                        <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Paid</p>
                                        <p className="text-2xl font-bold text-emerald-600">{summary.paid}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Unpaid</p>
                                        <p className="text-2xl font-bold text-red-600">{summary.unpaid}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <CreditCard className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Collected</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₱{parseFloat(summary.total_amount?.toString() || '0').toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Participants Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Participants List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Participant</TableHead>
                                            <TableHead className="font-semibold">Email</TableHead>
                                            <TableHead className="font-semibold text-center">Payment Method</TableHead>
                                            <TableHead className="font-semibold text-center">Payment Status</TableHead>
                                            <TableHead className="font-semibold text-right">Amount</TableHead>
                                            <TableHead className="font-semibold text-center">Registered</TableHead>
                                            <TableHead className="font-semibold text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                                    <p className="text-gray-500">No participants registered yet</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            registrations.map((registration) => (
                                                <TableRow key={registration.id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <p className="font-medium text-gray-900">{registration.user_name}</p>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {registration.user_email}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getPaymentMethodBadge(registration.payment_method)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getPaymentStatusBadge(registration.payment_status)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-emerald-600">
                                                        ₱{parseFloat(registration.amount_paid).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600">
                                                        {registration.created_at}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {registration.payment_status !== 'paid' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    onClick={() => handleMarkAsPaid(registration)}
                                                                    title="Mark as Paid"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRemoveClick(registration)}
                                                                title="Remove Participant"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Remove Participant Dialog */}
            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Remove Participant</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove {selectedRegistration?.user_name} from this tournament?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRemoveParticipant}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}

