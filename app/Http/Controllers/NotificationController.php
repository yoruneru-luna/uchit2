<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->limit(30)
            ->get();

        $unreadCount = Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications->map(fn(Notification $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'action_text' => $notification->action_text,
                'action_url' => $notification->action_url,
                'data' => $notification->data,
                'is_read' => (bool) $notification->read_at,
                'date' => $notification->created_at?->diffForHumans(),
            ]),
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAllRead(Request $request)
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'Уведомления прочитаны.',
        ]);
    }

    public function destroy(Request $request, Notification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->delete();

        return response()->json([
            'message' => 'Уведомление удалено.',
        ]);
    }

    public function destroyAll(Request $request)
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Уведомления удалены.',
        ]);
    }
}
