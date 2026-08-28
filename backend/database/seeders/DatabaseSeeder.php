<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@fitpay.test'],
            [
                'name' => 'FitPay Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $memberUser = User::updateOrCreate(
            ['email' => 'member@fitpay.test'],
            [
                'name' => 'Alex Member',
                'password' => Hash::make('password'),
                'role' => 'member',
                'email_verified_at' => now(),
            ]
        );

        Member::firstOrCreate(
            ['user_id' => $memberUser->id],
            [
                'phone' => '09123456789',
                'status' => 'active',
            ]
        );

        Member::factory()->count(24)->create();
    }
}
