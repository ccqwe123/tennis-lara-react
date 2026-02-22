import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Camera, Save, User as UserIcon, Phone, Mail } from "lucide-react";
import { Transition } from '@headlessui/react';
import { toast } from "sonner"

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    email_verified_at: string | null;
}

interface PageProps {
    auth: {
        user: User;
    };
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Edit({ mustVerifyEmail, status }: PageProps) {
    const user = usePage<PageProps>().props.auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: null as File | null,
        _method: 'patch',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Profile updated successfully.")
            },
            onError: () => {
                toast.error("Failed to update profile.")
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile Settings</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Profile Settings' },
            ]}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-none p-0">
                        <CardHeader className="p-0 !pb-0 h-full bg-linear-to-l from-emerald-50 to-white dark:from-emerald-950 dark:to-background rounded-t-lg border-b">
                            <div className="relative w-full h-64 bg-[url('/images/banner.jpg')] bg-cover bg-center">
                                {/* Gradient fade overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 h-full">

                                    <div className="relative group">
                                        <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                                            <AvatarImage src={previewUrl || ''} />
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full text-white shadow-lg hover:bg-emerald-700 transition-all transform group-hover:scale-110"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>

                                    <div className="text-center md:text-left text-white">
                                        <CardTitle className="text-2xl font-bold">
                                            {user.name}
                                        </CardTitle>
                                        <CardDescription className="text-emerald-200 font-medium">
                                            Personalize your account information
                                        </CardDescription>
                                    </div>

                                </div>
                            </div>

                        </CardHeader>
                        <CardContent className="mt-8 space-y-8 px-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-emerald-600" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="focus-visible:ring-emerald-500 py-5 px-2"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-emerald-600" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="focus-visible:ring-emerald-500 py-5 px-2"
                                            placeholder="you@example.com"
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="focus-visible:ring-emerald-500 py-5 px-2"
                                            placeholder="e.g. +1 234 567 890"
                                        />
                                        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end py-6 border-t gap-4">
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-emerald-600 font-medium">Changes saved successfully!</p>
                                    </Transition>

                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 transition-all hover:shadow-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Profile
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
