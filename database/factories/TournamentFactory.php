<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tournament>
 */
class TournamentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 months', '+2 months');
        $endDate = (clone $startDate)->modify('+' . fake()->numberBetween(1, 7) . ' days');

        return [
            'name' => fake()->words(3, true), // "Spring Tennis Championship"
            'start_date' => $startDate,
            'end_date' => $endDate,
            'registration_fee' => fake()->randomFloat(2, 50, 500),
            'max_participants' => fake()->numberBetween(16, 64),
            'status' => fake()->randomElement(['upcoming', 'ongoing', 'completed', 'cancelled']),
        ];
    }
}
