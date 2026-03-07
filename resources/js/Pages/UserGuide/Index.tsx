import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from "@/Components/ui/card";
import { ButtonCustom as Button } from "@/Components/ui/button-custom";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    X,
    Save,
    ArrowUp,
    ArrowDown,
    BookOpen,
    Info,
    ImageIcon,
    AlignLeft
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
// No Combobox imports needed

interface GuideStep {
    id?: number;
    content: string | null;
    image_path: string | null;
    image?: File | null;
    order: number;
    [key: string]: any;
}

interface Guide {
    id: number;
    title: string;
    order: number;
    steps: GuideStep[];
    [key: string]: any;
}

interface Props {
    guides: Guide[];
    isAdmin: boolean;
}

export default function Index({ guides, isAdmin }: Props) {
    const [activeSection, setActiveSection] = useState<number | null>(guides.length > 0 ? guides[0].id : null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        steps: [] as GuideStep[],
        removed_steps: [] as number[],
    });

    const handleAddStep = () => {
        const newStep: GuideStep = {
            content: '',
            image_path: null,
            order: data.steps.length,
        };
        setData('steps', [...data.steps, newStep]);
    };

    const handleRemoveStep = (index: number) => {
        const step = data.steps[index];
        if (step.id) {
            setData({
                ...data,
                steps: data.steps.filter((_, i) => i !== index),
                removed_steps: [...data.removed_steps, step.id]
            });
        } else {
            setData('steps', data.steps.filter((_, i) => i !== index));
        }
    };

    const handleStepChange = (index: number, field: keyof GuideStep, value: any) => {
        const newSteps = [...data.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setData('steps', newSteps);
    };

    const handleStepOrder = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === data.steps.length - 1) return;

        const newSteps = [...data.steps];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];

        const finalSteps = newSteps.map((s, i) => ({ ...s, order: i }));
        setData('steps', finalSteps);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user-guide.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
                toast.success('Guide created successfully!');
            },
            onError: () => toast.error('Check form errors.'),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGuide) return;

        router.post(route('user-guide.update', editingGuide.id), {
            ...data,
            _method: 'PATCH',
        }, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingGuide(null);
                reset();
                toast.success('Guide updated successfully!');
            },
            onError: () => toast.error('Check form errors.'),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this guide?')) {
            router.delete(route('user-guide.destroy', id), {
                onSuccess: () => toast.success('Guide deleted successfully!'),
            });
        }
    };

    const openEditDialog = (guide: Guide) => {
        setEditingGuide(guide);
        setData({
            title: guide.title,
            steps: guide.steps.map(s => ({ ...s })),
            removed_steps: [],
        });
        setIsEditDialogOpen(true);
    };

    const openCreateDialog = () => {
        reset();
        setData({
            title: '',
            steps: [{ content: '', image_path: null, order: 0 }],
            removed_steps: [],
        });
        setIsCreateDialogOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">User Guide</h2>}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'User Guide' },
            ]}
        >
            <Head title="User Guide" />

            <div className="py-12 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Sticky Mobile Navigation */}
                    <div className="md:hidden sticky top-[64px] z-30 mb-6 bg-white/80 backdrop-blur-md p-4 -mx-4 sm:-mx-6 border-b border-emerald-100 shadow-sm">
                        <div className="max-w-7xl mx-auto flex items-center gap-4">
                            <div className="relative flex-1">
                                <select
                                    value={activeSection?.toString()}
                                    onChange={(e) => setActiveSection(parseInt(e.target.value))}
                                    className="w-full h-12 pl-12 pr-10 rounded-xl border-emerald-100 bg-white font-bold text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 appearance-none transition-all shadow-sm"
                                >
                                    {guides.length > 0 ? guides.map((guide) => (
                                        <option key={guide.id} value={guide.id}>
                                            {guide.title}
                                        </option>
                                    )) : (
                                        <option disabled>No topics available</option>
                                    )}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                            </div>
                            {isAdmin && (
                                <Button
                                    size="icon"
                                    className="h-12 w-12 shrink-0 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100"
                                    onClick={openCreateDialog}
                                >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">

                        {/* Sidebar Navigation (Desktop Only) */}
                        <div className="hidden md:block w-full md:w-64 space-y-2">
                            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 sticky top-24">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-emerald-600" />
                                        Manual
                                    </h3>
                                    {isAdmin && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                            onClick={openCreateDialog}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>

                                <nav className="space-y-1">
                                    {guides.length > 0 ? guides.map((guide) => (
                                        <button
                                            key={guide.id}
                                            onClick={() => setActiveSection(guide.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group",
                                                activeSection === guide.id
                                                    ? "bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-500 shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            )}
                                        >
                                            <span className="truncate">{guide.title}</span>
                                            {activeSection === guide.id && <ChevronRight className="h-4 w-4" />}
                                        </button>
                                    )) : (
                                        <p className="text-xs text-gray-400 px-2 italic">No topics created.</p>
                                    )}
                                </nav>

                                {isAdmin && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                            onClick={openCreateDialog}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> New Topic
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {guides.length > 0 ? (
                                guides.filter(g => g.id === activeSection).map(guide => (
                                    <div key={guide.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-8">
                                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{guide.title}</h1>
                                            {isAdmin && (
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => openEditDialog(guide)}>
                                                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleDelete(guide.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-16">
                                            {guide.steps.map((step, idx) => (
                                                <div key={step.id || idx} className="space-y-8">
                                                    {step.content && (
                                                        <div className="prose prose-emerald max-w-none">
                                                            <div className="text-xl leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                                                                {step.content}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {step.image_path && (
                                                        <div
                                                            className="relative group rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white p-2 cursor-zoom-in transition-all hover:ring-4 hover:ring-emerald-500/10"
                                                            onClick={() => setPreviewImage(`/storage/${step.image_path}`)}
                                                        >
                                                            <img
                                                                src={`/storage/${step.image_path}`}
                                                                alt={`Illustration ${idx + 1}`}
                                                                className="w-full h-auto rounded-2xl object-cover max-h-[800px] transition-transform duration-700 group-hover:scale-[1.01]"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/20 to-transparent pointer-events-none rounded-b-2xl"></div>
                                                            <div className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Plus className="h-6 w-6 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Footer */}
                                        <div className="mt-24 flex justify-between items-center py-12 border-t border-gray-200">
                                            {guides.findIndex(g => g.id === activeSection) > 0 ? (
                                                <button
                                                    onClick={() => setActiveSection(guides[guides.findIndex(g => g.id === activeSection) - 1].id)}
                                                    className="flex flex-col items-start gap-2 group"
                                                >
                                                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] transition-colors group-hover:text-emerald-500">Previous</span>
                                                    <span className="text-emerald-600 font-bold group-hover:text-emerald-700 flex items-center gap-1 transition-all">
                                                        ← {guides[guides.findIndex(g => g.id === activeSection) - 1].title}
                                                    </span>
                                                </button>
                                            ) : <div />}

                                            {guides.findIndex(g => g.id === activeSection) < guides.length - 1 ? (
                                                <button
                                                    onClick={() => setActiveSection(guides[guides.findIndex(g => g.id === activeSection) + 1].id)}
                                                    className="flex flex-col items-end gap-2 group"
                                                >
                                                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] transition-colors group-hover:text-emerald-500">Next</span>
                                                    <span className="text-emerald-600 font-bold group-hover:text-emerald-700 flex items-center gap-1 transition-all">
                                                        {guides[guides.findIndex(g => g.id === activeSection) + 1].title} →
                                                    </span>
                                                </button>
                                            ) : <div />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="p-6 bg-emerald-50 rounded-2xl mb-8">
                                        <Info className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">User Manual is empty</h2>
                                    <p className="text-gray-500 mt-3 text-center max-w-sm px-6">
                                        Create beautiful blog-style manual topics by interleaving instructions and screenshots.
                                    </p>
                                    {isAdmin && (
                                        <Button
                                            onClick={openCreateDialog}
                                            className="mt-10 bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-2xl shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1"
                                        >
                                            <Plus className="mr-3 h-6 w-6" /> Create Topic
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Dialog */}
            <Dialog
                open={isCreateDialogOpen || isEditDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setIsEditDialogOpen(false);
                    }
                }}
            >
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                    <form onSubmit={isEditDialogOpen ? handleEditSubmit : handleCreateSubmit}>
                        <DialogHeader className="px-2">
                            <DialogTitle className="text-3xl font-black text-emerald-900 tracking-tight">
                                {isEditDialogOpen ? 'Update Manual Topic' : 'New Manual Topic'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-lg">
                                Drag and drop steps to reorder content.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-10 py-6 px-2">
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 ml-1">Topic Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Booking your first session"
                                    className="h-14 mt-1 text-2xl font-bold rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 px-6 transition-all"
                                    required
                                />
                                {errors.title && <p className="text-sm text-red-500 ml-1 font-medium">{errors.title}</p>}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 ml-1">Manual Steps</Label>
                                    <Button type="button" size="sm" variant="ghost" className="text-emerald-700 font-bold hover:bg-emerald-50" onClick={handleAddStep}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Step
                                    </Button>
                                </div>

                                <div className="space-y-10">
                                    {data.steps.map((step, index) => (
                                        <div key={index} className="relative group p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                                            {/* Order Controls */}
                                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg bg-white" onClick={() => handleStepOrder(index, 'up')}>
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg bg-white" onClick={() => handleStepOrder(index, 'down')}>
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Instruction Details</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" className="text-gray-300 hover:text-red-500" onClick={() => handleRemoveStep(index)}>
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>

                                                <div className="grid md:grid-cols-12 gap-8">
                                                    {/* Text Content */}
                                                    <div className="md:col-span-12 space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                                            <AlignLeft className="h-3 w-3" /> Step Content
                                                        </Label>
                                                        <Textarea
                                                            value={step.content || ''}
                                                            onChange={e => handleStepChange(index, 'content', e.target.value)}
                                                            placeholder="Describe the step in detail..."
                                                            rows={5}
                                                            className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg p-6 bg-gray-50/50"
                                                        />
                                                    </div>

                                                    {/* Image Upload */}
                                                    <div className="md:col-span-12 space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                                            <ImageIcon className="h-3 w-3" /> Attached Media (Optional)
                                                        </Label>

                                                        <div className="flex flex-wrap items-start gap-6">
                                                            {(step.image || step.image_path) ? (
                                                                <div className="relative w-full md:w-[480px] aspect-video rounded-2xl overflow-hidden border shadow-inner bg-gray-100">
                                                                    <img
                                                                        src={step.image ? URL.createObjectURL(step.image) : `/storage/${step.image_path}`}
                                                                        alt="Step visual"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-xl"
                                                                        onClick={() => {
                                                                            handleStepChange(index, 'image', null);
                                                                            handleStepChange(index, 'image_path', null);
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <label className="w-full md:w-[480px] aspect-video rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-300 transition-all group/upload">
                                                                    <div className="p-4 bg-gray-50 rounded-2xl mb-2 group-hover/upload:bg-emerald-100/50 transition-colors">
                                                                        <Plus className="h-8 w-8 text-gray-300 group-hover/upload:text-emerald-500" />
                                                                    </div>
                                                                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest group-hover/upload:text-emerald-600">Click to upload screenshot</span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={e => {
                                                                            if (e.target.files?.[0]) {
                                                                                handleStepChange(index, 'image', e.target.files[0]);
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            )}
                                                            <div className="flex-1 space-y-2 py-4">
                                                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Media Guidelines</h4>
                                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                                    Preferred aspect ratio is 16:9. Use clear, high-resolution screenshots without personal data visible.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" className="w-full h-20 rounded-3xl border-dashed border-2 border-emerald-100 text-emerald-700 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-lg font-bold" onClick={handleAddStep}>
                                        <Plus className="mr-3 h-6 w-6" /> Append Final Step
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="bg-white/80 backdrop-blur-md sticky bottom-0 pt-8 pb-4 border-t px-2 mt-8 z-10">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={() => { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); }}>Discard Changes</Button>
                            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-12 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 text-white transition-all hover:-translate-y-1 active:translate-y-0">
                                <Save className="mr-3 h-6 w-6" />
                                {processing ? 'Synchronizing...' : 'Publish Manual Topic'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-10 w-10 text-white bg-black/40 hover:bg-black/60 rounded-full z-50"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <img
                            src={previewImage || ''}
                            alt="Full preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
