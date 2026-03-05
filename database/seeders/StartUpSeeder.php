<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Setting;

class StartUpSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'fee_membership_annual', 'value' => '1000', 'description' => 'Annual Membership Fee'],
            ['key' => 'fee_membership_monthly', 'value' => '100', 'description' => 'Monthly Membership Fee'],
            ['key' => 'fee_membership_lifetime', 'value' => '5000', 'description' => 'Lifetime Membership Fee'],
            ['key' => 'fee_court_day', 'value' => '100', 'description' => 'Court Rate (Day/Game)'],
            ['key' => 'fee_court_night', 'value' => '150', 'description' => 'Court Rate (Night/Game)'],
            ['key' => 'fee_trainer', 'value' => '200', 'description' => 'Trainer Fee (Per Game)'],
            ['key' => 'fee_tournament_base', 'value' => '500', 'description' => 'Base Tournament Fee'],
            ['key' => 'discount_member_rate', 'value' => '0.10', 'description' => 'Member Discount Rate (Decimal)'],
            ['key' => 'fee_picker', 'value' => '80', 'description' => 'Picker/Ball Boy Fee (Per Game)'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
