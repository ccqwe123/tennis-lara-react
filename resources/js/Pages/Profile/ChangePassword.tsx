import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Lock, Save, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Transition } from '@headlessui/react';
import { toast } from "sonner"

export default function ChangePassword() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false) //current password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false) //new password
    const [showNewPassword, setShowNewPassword] = useState(false) //confirm password

    const { data, setData, put, errors, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                toast.success("Password updated successfully")
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
                toast.error("Password update failed")
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Security Settings</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Security' },
            ]}
        >
            <Head title="Change Password" />

            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-none p-0">
                        <CardHeader className="!p-0 h-full bg-linear-to-r from-blue-50 to-white dark:from-blue-950 dark:to-background rounded-t-lg">
                            <div className="relative w-full h-auto bg-[url('/images/pass-banner.jpg')] bg-fill object-left bg-center">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 h-full">
                                    <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-white">Update Password</CardTitle>
                                        <CardDescription className="text-white font-medium">
                                            Keep your account secure with a strong password
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-8 space-y-8 px-8 pb-8">
                            <form onSubmit={updatePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            type={showPassword ? "text" : "password"}
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            className="pl-10 focus-visible:ring-blue-500 px-10 py-4"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 border-0  bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.current_password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.current_password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10 focus-visible:ring-blue-500 px-10 py-4"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 border-0  bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showNewPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pl-10 focus-visible:ring-blue-500 px-10 py-4"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 border-0  bg-transparent"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end pt-6 border-t gap-4">
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-emerald-600 font-medium">Password updated successfully!</p>
                                    </Transition>
                                    <Button
                                        type="submit"
                                        className="bg-primary hover:bg-primary/80 text-white px-8 py-5 transition-all hover:shadow-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Update Password
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
