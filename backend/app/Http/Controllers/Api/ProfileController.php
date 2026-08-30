<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user('api') ?? auth('api')->user();

        $data = $this->formatUser($user);

        if ($user->role === 'member') {
            $data['member'] = $this->getMemberData($user->id);
        }

        return response()->json(['data' => $data]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user('api') ?? auth('api')->user();
        $data = $request->validated();

        $user->name = $data['name'];

        if ($request->hasFile('photo')) {
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('photos', 'public');
        }

        if (!empty($data['password'])) {
            if (empty($data['current_password']) || !Hash::check($data['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors' => ['current_password' => ['Current password is incorrect.']],
                ], 422);
            }
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if ($user->role === 'member') {
            $member = Member::firstOrNew(['user_id' => $user->id]);
            $member->phone = $data['phone'] ?? null;
            $member->address = $data['address'] ?? null;
            $member->birthdate = $data['birthdate'] ?? null;
            $member->gender = $data['gender'] ?? null;
            $member->save();
        }

        $updated = $this->formatUser($user->fresh());

        if ($user->role === 'member') {
            $updated['member'] = $this->getMemberData($user->id);
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => $updated,
        ]);
    }

    private function getMemberData(int $userId): ?array
    {
        $member = Member::where('user_id', $userId)->first();

        if (!$member) {
            return null;
        }

        return [
            'id' => $member->id,
            'member_code' => $member->member_code,
            'phone' => $member->phone,
            'address' => $member->address,
            'birthdate' => $member->birthdate?->format('Y-m-d'),
            'gender' => $member->gender,
            'status' => $member->status,
        ];
    }

    private function formatUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'photo' => $user->photo,
            'photo_url' => $user->photo_url,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
        ];
    }
}
