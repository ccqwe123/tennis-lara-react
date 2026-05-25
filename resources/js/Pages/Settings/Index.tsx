import { useState, useRef } from "react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, useForm, router } from "@inertiajs/react"
import { Save, Upload, Trash2, QrCode, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"

interface Setting {
    id: number
    key: string
    value: string
    description: string
}

interface PageProps {
    auth: any
    settings: Setting[]
    gcashQrCode: string | null
}

const SETTING_CATEGORIES = [
    {
        title: "General Fees",
        description: "Core fees used across bookings and memberships.",
        match: (setting: { key: string; description: string }) => {
            const text = `${setting.key} ${setting.description}`.toLowerCase()
            return text.includes("membership") || text.includes("fee_non_member_court") || text.includes("court fee")
        }
    },
    {
        title: "Court Rate Fees",
        description: "Court pricing based on time schedule (day/night).",
        match: (setting: { key: string; description: string }) => {
            const text = `${setting.key} ${setting.description}`.toLowerCase()
            return text.includes("court") || text.includes("day") || text.includes("night")
        }
    },
    {
        title: "Other Settings",
        description: "Additional configurable values.",
        match: () => true
    }
]

export default function SettingsIndex({ auth, settings, gcashQrCode }: PageProps) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        settings: settings.map(s => ({
            key: s.key,
            value: s.value,
            description: s.description
        }))
    })

    const [qrUploading, setQrUploading] = useState(false)
    const [qrDeleting, setQrDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('settings.update'), {
            onSuccess: () => toast.success('Settings saved successfully!')
        })
    }

    const handleChange = (index: number, value: string) => {
        const newSettings = [...data.settings]
        newSettings[index].value = value
        setData('settings', newSettings)
    }

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setQrUploading(true)
        const formData = new FormData()
        formData.append('qr_code', file)

        router.post(route('settings.qr-code.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('QR Code uploaded successfully!')
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            },
            onError: (errors) => {
                toast.error('Failed to upload QR Code')
                console.error(errors)
            },
            onFinish: () => setQrUploading(false)
        })
    }

    const handleQrDelete = () => {
        if (!confirm('Are you sure you want to delete the QR Code?')) return

        setQrDeleting(true)
        router.delete(route('settings.qr-code.delete'), {
            onSuccess: () => toast.success('QR Code deleted successfully!'),
            onError: () => toast.error('Failed to delete QR Code'),
            onFinish: () => setQrDeleting(false)
        })
    }

    const categorizedSettings = (() => {
        const assignedKeys = new Set<string>()

        return SETTING_CATEGORIES.map((category, index) => {
            const items = data.settings.filter(setting => {
                if (assignedKeys.has(setting.key)) return false
                if (!category.match(setting)) return false
                return true
            }).map(setting => {
                assignedKeys.add(setting.key)
                return setting
            })

            return {
                ...category,
                key: `category-${index}`,
                items
            }
        }).filter(category => category.items.length > 0)
    })()

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">System Settings</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'System Settings' },
            ]}
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Pricing Configuration Card */}
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Configuration</CardTitle>
                                <CardDescription>
                                    Manage system-wide fees and rates by category. Changes apply immediately.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {categorizedSettings.map((category) => (
                                    <div key={category.key} className="space-y-4">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">{category.title}</h3>
                                            <p className="text-sm text-gray-500">{category.description}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {category.items.map((setting) => {
                                                const settingIndex = data.settings.findIndex(item => item.key === setting.key)
                                                return (
                                                    <div key={setting.key} className="space-y-2">
                                                        <Label htmlFor={setting.key}>{setting.description}</Label>
                                                        <Input
                                                            id={setting.key}
                                                            value={setting.value}
                                                            onChange={(e) => handleChange(settingIndex, e.target.value)}
                                                            className="font-mono"
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <div className="flex items-center justify-between p-6 border-t bg-slate-50 rounded-b-lg">
                                <p className="text-sm text-gray-500">
                                    Last updated: Just now
                                </p>
                                <div className="flex items-center gap-4">
                                    {recentlySuccessful && (
                                        <span className="text-sm text-emerald-600 font-medium animate-pulse">
                                            Saved successfully!
                                        </span>
                                    )}
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </form>

                    {/* QR Code Management Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                GCash QR Code
                            </CardTitle>
                            <CardDescription>
                                Upload your GCash QR code for payment instructions. This will be displayed to customers during checkout.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* QR Preview */}
                                <div className="flex-shrink-0">
                                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {gcashQrCode ? (
                                            <img
                                                src={gcashQrCode}
                                                alt="GCash QR Code"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                                                <p className="text-sm">No QR Code</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Controls */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <Label htmlFor="qr_upload" className="text-sm font-medium">
                                            Upload New QR Code
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-1 mb-3">
                                            Accepted formats: PNG, JPG, JPEG. Max size: 2MB
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                ref={fileInputRef}
                                                id="qr_upload"
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleQrUpload}
                                                className="flex-1"
                                                disabled={qrUploading}
                                            />
                                        </div>
                                    </div>

                                    {qrUploading && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                            Uploading...
                                        </div>
                                    )}

                                    {gcashQrCode && (
                                        <div className="pt-4 border-t">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleQrDelete}
                                                disabled={qrDeleting}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {qrDeleting ? 'Deleting...' : 'Delete QR Code'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
