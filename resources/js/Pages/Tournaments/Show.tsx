import { useState } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, Link, useForm, router } from "@inertiajs/react"
import { format } from "date-fns"
import { Calendar, CheckCircle2, ChevronLeft, Trophy, Pencil, Check, Copy, Download, Banknote, CreditCard, Lock, AlertCircle } from "lucide-react"

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/Components/ui/label"
import { Separator } from "@/Components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert"

interface Registration {
    id: number
    payment_status: string
    payment_method: string
    payment_reference: string
    amount_paid: string
}

interface PageProps {
    auth: any
    tournament: {
        id: number
        name: string
        start_date: string
        end_date: string
        registration_fee: string
        max_participants: number | null
        status: string
        description?: string
    }
    myRegistration: Registration | null
    gcashQrCode: string | null
}

export default function TournamentShow({ auth, tournament, myRegistration, gcashQrCode }: PageProps) {
    const [open, setOpen] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [copied, setCopied] = useState(false)

    const { data, setData, post, processing } = useForm({
        payment_method: 'cash',
    })

    const submitRegistration = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('tournaments.register', tournament.id), {
            onSuccess: () => {
                setOpen(false)
                // Show payment dialog immediately after successful registration if not paid
                if (data.payment_method === 'gcash' || data.payment_method === 'cash') {
                    // Slight delay to allow page reload to update myRegistration prop (though Inertia handles this, 
                    // managing state locally for the immediate dialog might be tricky without the prop update. 
                    // For now, the user can click "Pay Now" after page reload or we can rely on user finding "Pay Now")
                    // Actually, let's just let the user see the "You are registered" state and "Pay Now" button will appear.
                }
            }
        })
    }

    const handleCopyReference = () => {
        if (myRegistration?.payment_reference) {
            navigator.clipboard.writeText(myRegistration.payment_reference)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownloadQR = () => {
        if (!gcashQrCode) return
        const link = document.createElement('a')
        link.href = gcashQrCode
        link.download = `GCash-QR-Tournament-${tournament.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const registrationOpen = tournament.status === 'open'

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tournament Details</h2>}
        >
            <Head title={tournament.name} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Link href={route('tournaments.index')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Tournaments
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="overflow-hidden">
                                <div className="h-48 bg-emerald-900/10 flex items-center justify-center">
                                    <Trophy className="h-24 w-24 text-emerald-600/20" />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-3xl">{tournament.name}</CardTitle>
                                            <CardDescription>
                                                Status: <Badge variant="outline" className="ml-2 uppercase">{tournament.status}</Badge>
                                            </CardDescription>
                                        </div>
                                        {auth.user?.type === 'admin' && (
                                            <Button
                                                variant="outline"
                                                onClick={() => router.visit(`/tournaments/${tournament.id}/edit`)}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit Tournament
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Start Date</h4>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                                                {format(new Date(tournament.start_date), "PPP p")}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">End Date</h4>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                                                {format(new Date(tournament.end_date), "PPP p")}
                                            </div>
                                        </div>
                                    </div>
                                    {tournament.description && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                                            <p className="text-gray-700">{tournament.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar / Actions */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-500">Entry Fee</span>
                                        <span className="font-bold text-xl">₱{parseFloat(tournament.registration_fee).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-500">Max Players</span>
                                        <span>{tournament.max_participants || "Unlimited"}</span>
                                    </div>

                                    {myRegistration ? (
                                        <div className="space-y-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                                <span className="font-semibold text-green-800">You are registered!</span>
                                                <p className="text-xs text-green-600">See you at the court.</p>
                                            </div>

                                            {myRegistration.payment_status !== 'paid' && (
                                                <Button
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                                    onClick={() => setShowPaymentDialog(true)}
                                                >
                                                    Pay Now - ₱{parseFloat(tournament.registration_fee).toFixed(2)}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {registrationOpen ? (
                                                <Dialog open={open} onOpenChange={setOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                            Register Now
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Confirm Registration</DialogTitle>
                                                            <DialogDescription>
                                                                Join <strong>{tournament.name}</strong> for ₱{parseFloat(tournament.registration_fee).toFixed(2)}.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <form onSubmit={submitRegistration} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Payment Method</Label>
                                                                <RadioGroup
                                                                    defaultValue={data.payment_method}
                                                                    onValueChange={(val) => setData('payment_method', val)}
                                                                    className="flex flex-col space-y-1"
                                                                >
                                                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                                                                        <RadioGroupItem value="cash" id="cash" />
                                                                        <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash Payment</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                                                                        <RadioGroupItem value="gcash" id="gcash" />
                                                                        <Label htmlFor="gcash" className="flex-1 cursor-pointer">GCash (e-Wallet)</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>

                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                                                <Button type="submit" disabled={processing}>Confirm Registration</Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <div className="space-y-3">
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle>Registration Closed</AlertTitle>
                                                        <AlertDescription>
                                                            This tournament is currently {tournament.status}.
                                                        </AlertDescription>
                                                    </Alert>
                                                    <Button disabled className="w-full">
                                                        <Lock className="h-4 w-4 mr-2" />
                                                        Join Tournament
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Instructions Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Payment Instructions</DialogTitle>
                        <DialogDescription>
                            Follow these steps to complete your payment
                        </DialogDescription>
                    </DialogHeader>

                    {myRegistration && (
                        <div className="space-y-4 py-4">
                            {/* Reference Number Card */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-emerald-600 font-medium">Your Reference Number</span>
                                        <p className="font-mono font-bold text-2xl text-emerald-700">{myRegistration.payment_reference || 'Pending...'}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyReference}
                                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                                        disabled={!myRegistration.payment_reference}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            </div>

                            {/* Amount to Pay */}
                            <div className="text-center py-2">
                                <span className="text-sm text-gray-500">Amount to Pay</span>
                                <p className="text-3xl font-bold text-gray-900">₱{parseFloat(myRegistration.amount_paid).toFixed(2)}</p>
                            </div>

                            {/* Payment Steps */}
                            {myRegistration.payment_method === "cash" ? (
                                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Banknote className="h-5 w-5 text-emerald-600" />
                                        Cash Payment Steps
                                    </h4>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Show Reference Number to Staff</p>
                                                <p className="text-sm text-gray-500">Present your reference number <span className="font-mono font-bold">{myRegistration.payment_reference}</span> to a staff member at the counter</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Pay the Amount</p>
                                                <p className="text-sm text-gray-500">Pay ₱{parseFloat(myRegistration.amount_paid).toFixed(2)} in cash</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Done!</p>
                                                <p className="text-sm text-gray-500">Your registration will be confirmed once payment is verified</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                        GCash Payment Steps
                                    </h4>
                                    <ol className="space-y-3">
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Open GCash App</p>
                                                <p className="text-sm text-gray-500">Open your GCash mobile app and select "Scan QR"</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                                            <div className="w-full">
                                                <p className="font-medium text-gray-900">Scan or Download QR Code</p>
                                                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4 text-center">
                                                    <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                                        {gcashQrCode ? (
                                                            <img
                                                                src={gcashQrCode}
                                                                alt="GCash QR Code"
                                                                className="w-full h-full object-contain rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="text-gray-400 text-sm text-center">
                                                                QR Code<br />Not Available
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDownloadQR}
                                                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download QR Code
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Pay the Amount</p>
                                                <p className="text-sm text-gray-500">Enter ₱{parseFloat(myRegistration.amount_paid).toFixed(2)} and complete the payment</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">4</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Show Payment Receipt to Staff</p>
                                                <p className="text-sm text-gray-500">Show your GCash payment receipt and reference number <span className="font-mono font-bold">{myRegistration.payment_reference}</span> to staff</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">5</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Done!</p>
                                                <p className="text-sm text-gray-500">Your registration will be confirmed once payment is verified</p>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setShowPaymentDialog(false)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                        >
                            Got it!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    )
}
