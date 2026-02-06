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
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'type' => UserType::ADMIN,
                'email_verified_at' => now(),
            ]
        );

        // Create Staff user
        User::updateOrCreate(
            ['email' => 'staff@tennis.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('password'),
                'type' => UserType::STAFF,
                'email_verified_at' => now(),
            ]
        );

        // Create Member user
        User::updateOrCreate(
            ['email' => 'member@tennis.com'],
            [
                'name' => 'Member User',
                'password' => Hash::make('password'),
                'type' => UserType::MEMBER,
                'email_verified_at' => now(),
            ]
        );

        // Create Non-member user
        User::updateOrCreate(
            ['email' => 'nonmember@tennis.com'],
            [
                'name' => 'Non-Member User',
                'password' => Hash::make('password'),
                'type' => UserType::NON_MEMBER,
                'email_verified_at' => now(),
            ]
        );
    }
}
