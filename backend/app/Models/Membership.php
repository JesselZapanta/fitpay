<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'membership_request_id',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membershipRequest(): BelongsTo
    {
        return $this->belongsTo(MembershipRequest::class);
    }

    // Alias for user request: request_id maps to membership_request_id
    public function request(): BelongsTo
    {
        return $this->membershipRequest();
    }

    public function getIsExpiredAttribute(): bool
    {
        if (!$this->end_date) return false;
        return Carbon::parse($this->end_date)->isPast();
    }

    public function getComputedStatusAttribute(): string
    {
        if ($this->is_expired) return 'expired';
        return $this->status;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('end_date', '>=', Carbon::today());
    }

    public function scopeExpired($query)
    {
        return $query->where(function ($q) {
            $q->where('status', 'expired')->orWhere('end_date', '<', Carbon::today());
        });
    }

    public function scopeSearch($query, ?string $search)
    {
        if (blank($search)) return $query;
        $search = trim($search);
        return $query->where(function ($q) use ($search) {
            $q->whereHas('user', function ($u) use ($search) {
                $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('membershipRequest', function ($r) use ($search) {
                $r->where('reference_number', 'like', "%{$search}%")->orWhere('plan_type', 'like', "%{$search}%");
            });
        });
    }
}
