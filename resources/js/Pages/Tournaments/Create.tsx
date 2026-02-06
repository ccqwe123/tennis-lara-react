import { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { Trophy, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"

interface PageProps {
    auth: any
    errors?: Record<string, string>
}

export default function CreateTournament({ auth, errors = {} }: PageProps) {
    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        registration_fee: '',
        max_participants: '',
        status: 'open',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, status: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        router.post('/tournaments', formData, {
            onSuccess: () => {
                toast.success('Tournament created', {
                    description: `"${formData.name}" has been created successfully.`,
                })
            },
            onError: () => {
                toast.error('Failed to create tournament', {
                    description: 'Please check the form and try again.',
                })
            },
            onFinish: () => setProcessing(false),
        })
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Tournament</h2>}
        >
            <Head title="Create Tournament" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/tournaments/manage')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Manage
                    </Button>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-emerald-600" />
                                Create New Tournament
                            </CardTitle>
                            <CardDescription>
                                Fill in the details to create a new tournament
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tournament Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tournament Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter tournament name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                {/* Date Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date *</Label>
                                        <Input
                                            id="start_date"
                                            name="start_date"
                                            type="date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.start_date && (
                                            <p className="text-sm text-red-500">{errors.start_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date *</Label>
                                        <Input
                                            id="end_date"
                                            name="end_date"
                                            type="date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.end_date && (
                                            <p className="text-sm text-red-500">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Fee and Participants */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="registration_fee">Registration Fee (₱) *</Label>
                                        <Input
                                            id="registration_fee"
                                            name="registration_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.registration_fee}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.registration_fee && (
                                            <p className="text-sm text-red-500">{errors.registration_fee}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_participants">Max Participants</Label>
                                        <Input
                                            id="max_participants"
                                            name="max_participants"
                                            type="number"
                                            min="1"
                                            value={formData.max_participants}
                                            onChange={handleChange}
                                            placeholder="Leave empty for unlimited"
                                        />
                                        {errors.max_participants && (
                                            <p className="text-sm text-red-500">{errors.max_participants}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={formData.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/tournaments/manage')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                    >
                                        {processing ? 'Creating...' : 'Create Tournament'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
