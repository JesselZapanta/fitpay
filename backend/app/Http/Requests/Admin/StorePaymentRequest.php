<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'membership_id' => ['nullable', 'exists:memberships,id'],
            'plan_type' => ['required_without:membership_id', Rule::in(['daily', 'monthly', 'yearly'])],
            'amount' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'reference_number' => ['required', 'string', 'max:100'],
            'receipt' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User is required.',
            'user_id.exists' => 'Selected user does not exist.',
            'membership_id.exists' => 'Selected membership does not exist.',
            'plan_type.required_without' => 'Plan type is required when not using existing membership.',
            'amount.required' => 'Amount is required.',
            'reference_number.required' => 'Reference number is required.',
        ];
    }
}
