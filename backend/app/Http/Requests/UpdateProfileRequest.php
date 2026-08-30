<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user('api') ?? auth('api')->user();
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'current_password' => ['nullable', 'string', 'required_with:password'],
            'password' => ['nullable', 'string', 'confirmed', Password::min(8)],
        ];

        if ($user && $user->role === 'member') {
            $rules['phone'] = ['nullable', 'string', 'max:20'];
            $rules['address'] = ['nullable', 'string', 'max:500'];
            $rules['birthdate'] = ['nullable', 'date', 'before:today'];
            $rules['gender'] = ['nullable', 'in:male,female,other'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'photo.image' => 'Photo must be an image.',
            'photo.max' => 'Photo may not be greater than 5MB.',
            'gender.in' => 'Gender must be male, female, or other.',
            'birthdate.before' => 'Birthdate must be in the past.',
        ];
    }
}
