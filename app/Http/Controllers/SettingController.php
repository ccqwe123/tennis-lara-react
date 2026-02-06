<?php

namespace App\Http\Controllers;



use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        $gcashQrCode = Setting::where('key', 'gcash_qr_code')->first()?->value;

        return Inertia::render('Settings/Index', [
            'settings' => $settings->filter(fn($s) => $s->key !== 'gcash_qr_code'),
            'gcashQrCode' => $gcashQrCode ? Storage::url($gcashQrCode) : null,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|exists:settings,key',
            'settings.*.value' => 'required',
        ]);

        foreach ($request->settings as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        return back()->with('success', 'Settings updated successfully!');
    }

    public function uploadQrCode(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        // Delete old QR code if exists
        $existingSetting = Setting::where('key', 'gcash_qr_code')->first();
        if ($existingSetting && $existingSetting->value) {
            Storage::disk('public')->delete($existingSetting->value);
        }

        // Store new QR code
        $path = $request->file('qr_code')->store('qr-codes', 'public');

        // Update or create setting
        Setting::updateOrCreate(
            ['key' => 'gcash_qr_code'],
            ['value' => $path, 'description' => 'GCash QR Code Image']
        );

        return back()->with('success', 'QR Code uploaded successfully!');
    }

    public function deleteQrCode()
    {
        $setting = Setting::where('key', 'gcash_qr_code')->first();

        if ($setting && $setting->value) {
            Storage::disk('public')->delete($setting->value);
            $setting->update(['value' => null]);
        }

        return back()->with('success', 'QR Code deleted successfully!');
    }
}
