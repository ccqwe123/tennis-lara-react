<?php

namespace App\Enums;

enum UserType: string
{
    case ADMIN = 'admin';
    case STAFF = 'staff';
    case MEMBER = 'member';
    case NON_MEMBER = 'non-member';
    case STUDENT = 'student';

    /**
     * Get all user types as an array of values.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get human-readable label for the user type.
     */
    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::STAFF => 'Staff',
            self::MEMBER => 'Member',
            self::NON_MEMBER => 'Non-Member',
            self::STUDENT => 'Student',
        };
    }

    /**
     * Check if this type has admin-level access.
     */
    public function isAdminLevel(): bool
    {
        return $this === self::ADMIN;
    }

    /**
     * Check if this type has staff-level access (admin or staff).
     */
    public function isStaffLevel(): bool
    {
        return in_array($this, [self::ADMIN, self::STAFF]);
    }

    /**
     * Check if this type has member-level access (admin, staff, or member).
     */
    public function isMemberLevel(): bool
    {
        return in_array($this, [self::ADMIN, self::STAFF, self::MEMBER]);
    }
}
