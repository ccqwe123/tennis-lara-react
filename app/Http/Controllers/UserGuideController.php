<?php

namespace App\Http\Controllers;

use App\Models\UserGuide;
use App\Models\UserGuideStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserGuideController extends Controller
{
    public function index()
    {
        return Inertia::render('UserGuide/Index', [
            'guides' => UserGuide::with('steps')->orderBy('order')->get(),
            'isAdmin' => auth()->user()->isAdmin(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'steps' => 'required|array',
            'steps.*.content' => 'nullable|string',
            'steps.*.image' => 'nullable|image|max:2048',
        ]);

        $guide = UserGuide::create([
            'title' => $request->input('title'),
            'order' => UserGuide::max('order') + 1,
        ]);

        foreach ($request->input('steps') as $index => $stepData) {
            $imagePath = null;
            if ($request->hasFile("steps.{$index}.image")) {
                $imagePath = $request->file("steps.{$index}.image")->store('user-guides', 'public');
            }

            UserGuideStep::create([
                'user_guide_id' => $guide->id,
                'content' => $stepData['content'] ?? null,
                'image_path' => $imagePath,
                'order' => $index,
            ]);
        }

        return redirect()->back()->with('success', 'Guide created successfully.');
    }

    public function update(Request $request, UserGuide $userGuide)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'steps' => 'required|array',
            'steps.*.id' => 'nullable|exists:user_guide_steps,id',
            'steps.*.content' => 'nullable|string',
            'steps.*.image' => 'nullable|image|max:2048',
            'removed_steps' => 'array',
        ]);

        $userGuide->update([
            'title' => $request->input('title'),
        ]);

        // Handle removals
        if ($request->filled('removed_steps')) {
            foreach ($request->removed_steps as $stepId) {
                $step = UserGuideStep::find($stepId);
                if ($step && $step->user_guide_id == $userGuide->id) {
                    if ($step->image_path) {
                        Storage::disk('public')->delete($step->image_path);
                    }
                    $step->delete();
                }
            }
        }

        // Handle steps (Insert/Update)
        foreach ($request->input('steps') as $index => $stepData) {
            $imagePath = $stepData['image_path'] ?? null;

            if ($request->hasFile("steps.{$index}.image")) {
                // If there's an old image, delete it
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = $request->file("steps.{$index}.image")->store('user-guides', 'public');
            }

            if (isset($stepData['id'])) {
                $step = UserGuideStep::find($stepData['id']);
                $step->update([
                    'content' => $stepData['content'] ?? null,
                    'image_path' => $imagePath,
                    'order' => $index,
                ]);
            } else {
                UserGuideStep::create([
                    'user_guide_id' => $userGuide->id,
                    'content' => $stepData['content'] ?? null,
                    'image_path' => $imagePath,
                    'order' => $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Guide updated successfully.');
    }

    public function destroy(UserGuide $userGuide)
    {
        foreach ($userGuide->steps as $step) {
            if ($step->image_path) {
                Storage::disk('public')->delete($step->image_path);
            }
        }
        $userGuide->delete();

        return redirect()->back()->with('success', 'Guide deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:user_guides,id',
            'orders.*.order' => 'required|integer',
        ]);

        foreach ($request->orders as $item) {
            UserGuide::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return redirect()->back()->with('success', 'Guides reordered successfully.');
    }
}
