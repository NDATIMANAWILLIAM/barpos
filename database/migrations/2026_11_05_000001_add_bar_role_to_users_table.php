<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const OLD_ROLES = ['owner', 'manager', 'cashier', 'waiter', 'kitchen', 'storekeeper'];
    private const NEW_ROLES = ['owner', 'manager', 'cashier', 'waiter', 'kitchen', 'storekeeper', 'bar'];

    public function up(): void
    {
        // Bartenders had no role of their own — bar items were tracked by
        // waiters self-reporting from the POS screen instead of a real
        // bar ticket display. This gives bar staff the same first-class
        // role kitchen staff already have.
        $this->setAllowedRoles(self::NEW_ROLES);
    }

    public function down(): void
    {
        $this->setAllowedRoles(self::OLD_ROLES);
    }

    private function setAllowedRoles(array $roles): void
    {
        if (DB::getDriverName() === 'pgsql') {
            // Laravel's enum() column on Postgres (incl. Supabase) is a
            // plain text column backed by a CHECK constraint, not a native
            // enum type — find whatever constraint currently guards this
            // column instead of assuming a fixed name, then replace it.
            $constraint = DB::selectOne(<<<'SQL'
                select con.conname
                from pg_constraint con
                join pg_class rel on rel.oid = con.conrelid
                join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (con.conkey)
                where rel.relname = 'users' and con.contype = 'c' and att.attname = 'role'
                limit 1
            SQL);

            if ($constraint) {
                DB::statement('alter table users drop constraint "' . $constraint->conname . '"');
            }

            $list = "'" . implode("','", $roles) . "'";
            DB::statement("alter table users add constraint users_role_check check (role::text = any (array[{$list}]::text[]))");
        } else {
            $list = "'" . implode("','", $roles) . "'";
            DB::statement("alter table users modify column role enum({$list}) not null default 'waiter'");
        }
    }
};
