<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $settings = [
            ['key' => 'fee_student_day_single', 'value' => '45', 'description' => 'Student Rate - Day - Single'],
            ['key' => 'fee_student_day_double', 'value' => '45', 'description' => 'Student Rate - Day - Double'],
            ['key' => 'fee_student_night_single', 'value' => '45', 'description' => 'Student Rate - Night - Single'],
            ['key' => 'fee_student_night_double', 'value' => '45', 'description' => 'Student Rate - Night - Double'],
            ['key' => 'fee_member_day_single', 'value' => '90', 'description' => 'Member Rate - Day - Single'],
            ['key' => 'fee_member_day_double', 'value' => '70', 'description' => 'Member Rate - Day - Double'],
            ['key' => 'fee_member_night_single', 'value' => '90', 'description' => 'Member Rate - Night - Single'],
            ['key' => 'fee_member_night_double', 'value' => '85', 'description' => 'Member Rate - Night - Double'],
            ['key' => 'fee_non_member_day_single', 'value' => '90', 'description' => 'Non-member Rate - Day - Single'],
            ['key' => 'fee_non_member_day_double', 'value' => '70', 'description' => 'Non-member Rate - Day - Double'],
            ['key' => 'fee_non_member_night_single', 'value' => '90', 'description' => 'Non-member Rate - Night - Single'],
            ['key' => 'fee_non_member_night_double', 'value' => '85', 'description' => 'Non-member Rate - Night - Double'],
            ['key' => 'fee_non_member_court', 'value' => '0', 'description' => 'Court Fee (Non-member, Per Game)'],
            ['key' => 'fee_ball_discount', 'value' => '20', 'description' => 'Ball Discount (Per Game)'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'description' => $setting['description'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'fee_student_day_single',
            'fee_student_day_double',
            'fee_student_night_single',
            'fee_student_night_double',
            'fee_member_day_single',
            'fee_member_day_double',
            'fee_member_night_single',
            'fee_member_night_double',
            'fee_non_member_day_single',
            'fee_non_member_day_double',
            'fee_non_member_night_single',
            'fee_non_member_night_double',
            'fee_non_member_court',
            'fee_ball_discount',
        ])->delete();
    }
};
