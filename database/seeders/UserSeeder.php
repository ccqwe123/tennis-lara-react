<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database with test users for each role.
     */
    public function run(): void
    {
        // Create Admin user
        User::updateOrCreate(
            ['email' => 'admin@tennis.com'],
            [
                'name' => 'Henry Malibat',
                'password' => Hash::make('password'),
                'type' => UserType::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Create Staff user
        User::updateOrCreate(
            ['email' => 'staff@tennis.com'],
            [
                'name' => 'Kristine Moran',
                'password' => Hash::make('password'),
                'type' => UserType::STAFF,
                'email_verified_at' => now(),
            ]
        );

        // Create Member user
        User::updateOrCreate(
            ['email' => 'member@tennis.com'],
            [
                'name' => 'Albert Guibara',
                'password' => Hash::make('password'),
                'type' => UserType::MEMBER,
                'email_verified_at' => now(),
            ]
        );

        // Create Non-member user
        User::updateOrCreate(
            ['email' => 'nonmember@tennis.com'],
            [
                'name' => 'Joanne Lim',
                'password' => Hash::make('password'),
                'type' => UserType::NON_MEMBER,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'student@tennis.com'],
            [
                'name' => 'Romeo Cutaran',
                'password' => Hash::make('password'),
                'type' => UserType::STUDENT,
                'email_verified_at' => now(),
            ]
        );

        // Create 50 users with mixed types
        User::factory()->count(50)->state(function (array $attributes) {
            return [
                'type' => fake()->randomElement([UserType::MEMBER, UserType::NON_MEMBER, UserType::STUDENT]),
            ];
        })->create();
    }
}
