<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'avatar',
        'phone',
        'player_level',
    ];

    public function bookings()
    {
        return $this->hasMany(CourtBooking::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(MemberSubscription::class);
    }

    public function registrations()
    {
        return $this->hasMany(TournamentRegistration::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'type' => UserType::class,
    ];

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->type === UserType::ADMIN;
    }

    /**
     * Check if user is a staff member.
     */
    public function isStaff(): bool
    {
        return $this->type === UserType::STAFF;
    }

    /**
     * Check if user is a member.
     */
    public function isMember(): bool
    {
        return $this->type === UserType::MEMBER;
    }

    /**
     * Check if user is a non-member.
     */
    public function isNonMember(): bool
    {
        return $this->type === UserType::NON_MEMBER;
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(UserType $type): bool
    {
        return $this->type === $type;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $types): bool
    {
        return in_array($this->type, $types);
    }

    /**
     * Check if user has admin-level access.
     */
    public function hasAdminAccess(): bool
    {
        return $this->type->isAdminLevel();
    }

    /**
     * Check if user has staff-level access (admin or staff).
     */
    public function hasStaffAccess(): bool
    {
        return $this->type->isStaffLevel();
    }

    /**
     * Check if user has member-level access (admin, staff, or member).
     */
    public function hasMemberAccess(): bool
    {
        return $this->type->isMemberLevel();
    }
}
