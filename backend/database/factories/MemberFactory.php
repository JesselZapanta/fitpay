<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'member']);

        return [
            'user_id' => $user->id,
            'phone' => fake()->optional()->phoneNumber(),
            'address' => fake()->optional()->address(),
            'birthdate' => fake()->optional()->dateTimeBetween('-60 years', '-18 years'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'status' => fake()->randomElement(['active', 'inactive', 'expired']),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => 'active']);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['status' => 'expired']);
    }
}
