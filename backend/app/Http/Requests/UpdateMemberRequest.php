<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('member')?->user_id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'photo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'status' => ['sometimes', 'in:active,inactive,expired'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.mimes' => 'Photo must be JPG, PNG, or WebP.',
            'photo.max' => 'Photo must be under 5MB.',
        ];
    }
}
