import { useState } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, useForm } from "@inertiajs/react"
import { Check, Crown, User as UserIcon, Calendar } from "lucide-react"

import { Button } from "@/Components/ui/button"
import {
    Card,
    CardContent,
} from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/Components/ui/label"
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

export default function MembershipIndex({ auth, fees, mySubscription }: PageProps) {
    // --- USER STATE ---
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const form = useForm({ type: 'monthly', payment_method: 'cash' })

    // --- SHARED DATA (Plans Info) ---
    const plans = [
        {
            id: 'monthly',
            name: 'Monthly Member',
            price: fees.fee_membership_monthly,
            features: ['Access to member rates', 'Priority booking (7 days)', 'Cancel anytime'],
            color: 'bg-blue-500'
        },
        {
            id: 'annual',
            name: 'Annual Pro',
            price: fees.fee_membership_annual,
            features: ['All Monthly features', '2 Free Guest Passes', 'Save 20% vs Monthly'],
            featured: true,
            color: 'bg-emerald-600'
        },
        {
            id: 'lifetime',
            name: 'Lifetime Elite',
            price: fees.fee_membership_lifetime,
            features: ['Never pay fees again', 'VIP Locker Access', 'Exclusive Events'],
            color: 'bg-purple-600'
        }
    ]

    // --- USER HANDLERS ---
    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId)
        form.setData('type', planId)
        setOpen(true)
    }

    const submitSubscription = (e: React.FormEvent) => {
        e.preventDefault()
        form.post(route('memberships.store'), {
            onSuccess: () => setOpen(false)
        })
    }

    const currentPlanDetails = plans.find(p => p.id === selectedPlan)

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Memberships</h2>}
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
                                            <p className="text-gray-500">Upgrade to enjoy exclusive benefits and discounts.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {!mySubscription && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {plans.map((plan) => (
                                <Card key={plan.id} className={cn(
                                    "flex flex-col relative transition-all hover:scale-105 duration-300",
                                    plan.featured ? "border-emerald-500 shadow-xl scale-105 z-10" : "border-gray-200"
                                )}>
                                    {plan.featured && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs uppercase px-3 py-1">
                                                Recommended
                                            </Badge>
                                        </div>
                                    )}
                                    <CardContent className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{plan.name}</h3>
                                        <div className="flex items-baseline mb-6">
                                            <span className="text-4xl font-bold tracking-tight text-gray-900">₱{plan.price}</span>
                                            <span className="ml-1 text-gray-500">{plan.id === 'lifetime' ? '/once' : `/${plan.id === 'monthly' ? 'mo' : 'yr'}`}</span>
                                        </div>
                                        <ul className="space-y-4 mb-8 flex-1">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <Check className={cn("h-5 w-5", plan.color.replace('bg-', 'text-'))} />
                                                    </div>
                                                    <p className="ml-3 text-sm text-gray-600">{feature}</p>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className={cn("w-full transition-colors", plan.color, "hover:opacity-90")}
                                        >
                                            Choose {plan.name}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirm Subscription</DialogTitle>
                            <DialogDescription>
                                Upgrade to <strong>{currentPlanDetails?.name}</strong> for ₱{currentPlanDetails?.price}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitSubscription} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <RadioGroup
                                    defaultValue={form.data.payment_method}
                                    onValueChange={(val) => form.setData('payment_method', val)}
                                    className="flex flex-col space-y-1"
                                >
                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                                        <RadioGroupItem value="cash" id="cash" />
                                        <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash Payment (at Counter)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                                        <RadioGroupItem value="gcash" id="gcash" />
                                        <Label htmlFor="gcash" className="flex-1 cursor-pointer">GCash (e-Wallet)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={form.processing}>Confirm & Upgrade</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    )
}
