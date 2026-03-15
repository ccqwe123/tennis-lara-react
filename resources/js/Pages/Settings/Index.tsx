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
                                    Manage system-wide fees and rates. Changes apply immediately.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {data.settings.map((setting, index) => (
                                        <div key={setting.key} className="space-y-2">
                                            <Label htmlFor={setting.key}>{setting.description}</Label>
                                            <Input
                                                id={setting.key}
                                                value={setting.value}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
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
