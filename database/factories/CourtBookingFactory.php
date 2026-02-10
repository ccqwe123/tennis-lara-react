<?php

namespace Database\Factories;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourtBooking>
 */
class CourtBookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $scheduleType = fake()->randomElement(['day', 'night']);
        $gamesCount = fake()->numberBetween(1, 4);
        $rate = $scheduleType === 'day' ? 50 : 80;
        $totalAmount = $gamesCount * $rate;

        return [
            'user_id' => User::factory(),
            'staff_id' => User::factory()->state(['type' => UserType::STAFF]),
            'schedule_type' => $scheduleType,
            'booking_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'games_count' => $gamesCount,
            'with_trainer' => fake()->boolean(20), // 20% chance
            'payment_method' => fake()->randomElement(['cash', 'card', 'bank_transfer']),
            'payment_reference' => fake()->uuid(),
            'payment_status' => fake()->randomElement(['paid', 'pending', 'failed']),
            'total_amount' => $totalAmount,
            'picker_selection' => json_encode([]),
            'priest_count' => 0,
            'discount_applied' => 0,
            'user_type_at_booking' => fake()->randomElement(['member', 'non-member', 'student']),
        ];
    }
}
