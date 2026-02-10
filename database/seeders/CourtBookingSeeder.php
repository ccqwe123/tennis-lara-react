<?php

namespace Database\Seeders;

use App\Models\CourtBooking;
use Illuminate\Database\Seeder;

class CourtBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CourtBooking::factory()->count(100)->create();
    }
}
