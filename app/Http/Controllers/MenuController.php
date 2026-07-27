<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        return Inertia::render('Menu/Index', [
            'categories' => MenuCategory::orderBy('sort_order')->orderBy('name')->get(),
            'items'      => MenuItem::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'kind' => 'required|in:food,drink',
        ]);
        MenuCategory::create($data);
        return back();
    }

    public function updateCategory(Request $request, MenuCategory $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'kind' => 'required|in:food,drink',
        ]);
        $category->update($data);
        return back();
    }

    public function destroyCategory(MenuCategory $category)
    {
        if ($category->items()->exists()) {
            return back()->withErrors(['category' => 'Move or delete all items in this category first.']);
        }
        $category->delete();
        return back();
    }

    public function storeItem(Request $request)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:menu_categories,id',
            'name'         => 'required|string|max:120',
            'price'        => 'required|integer|min:0',
            'prep_station' => 'required|in:kitchen,bar,none',
            'description'  => 'nullable|string|max:255',
            'is_special'   => 'boolean',
        ]);
        MenuItem::create($data);
        return back();
    }

    public function updateItem(Request $request, MenuItem $item)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:menu_categories,id',
            'name'         => 'required|string|max:120',
            'price'        => 'required|integer|min:0',
            'prep_station' => 'required|in:kitchen,bar,none',
            'description'  => 'nullable|string|max:255',
            'is_special'   => 'boolean',
        ]);
        $item->update($data);
        return back();
    }

    public function toggleItem(MenuItem $item)
    {
        $item->update(['is_available' => ! $item->is_available]);
        return back();
    }

    public function destroyItem(MenuItem $item)
    {
        $item->delete();
        return back();
    }
}
