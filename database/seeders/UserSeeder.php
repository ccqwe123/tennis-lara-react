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
            ['username' => 'admin'],
            [
                'name' => 'Henry Malibat',
                'password' => Hash::make('password'),
                'type' => UserType::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Create Staff user
        User::updateOrCreate(
            ['username' => 'staff'],
            [
                'name' => 'Kristine Moran',
                'password' => Hash::make('password'),
                'type' => UserType::STAFF,
                'email_verified_at' => now(),
            ]
        );

        // Create Non-member user
        User::updateOrCreate(
            ['username' => 'user'],
            [
                'name' => 'Joanne Lim',
                'password' => Hash::make('password'),
                'type' => UserType::NON_MEMBER,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['username' => 'student'],
            [
                'name' => 'Romeo Cutaran',
                'password' => Hash::make('password'),
                'type' => UserType::STUDENT,
                'email_verified_at' => now(),
            ]
        );

        // Create 50 users with mixed types
        // User::factory()->count(50)->state(function (array $attributes) {
        //     return [
        //         'type' => fake()->randomElement([UserType::MEMBER, UserType::NON_MEMBER, UserType::STUDENT]),
        //     ];
        // })->create();
    }
}
