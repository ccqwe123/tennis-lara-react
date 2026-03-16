<?php

namespace App\Services;

use App\Models\Income;

class IncomeService
{
    public static function record(string $sourceType, int $sourceId, string $item, float $amount, string $date = null): Income
    {
        return Income::create([
            'date'        => $date ?? now('Asia/Manila')->toDateString(),
            'source_type' => $sourceType,
            'source_id'   => $sourceId,
            'item'        => $item,
            'amount'      => $amount,
        ]);
    }
}
