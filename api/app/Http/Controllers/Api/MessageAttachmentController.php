<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessageAttachment;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MessageAttachmentController extends Controller
{
    public function show(Request $request, MessageAttachment $attachment): Response
    {
        $conversation = $attachment->message?->conversation;
        if (!$conversation) {
            abort(404);
        }

        $role = strtoupper((string) $request->user()->role);
        $canAccess = in_array($role, ['ADMIN', 'EMPLOYEE'], true)
            || (int) $conversation->user_id === (int) $request->user()->id;

        if (!$canAccess) {
            abort(404);
        }

        $content = $attachment->file_content;
        if (is_resource($content)) {
            $content = stream_get_contents($content);
        }

        if (!is_string($content) || $content === '') {
            abort(404);
        }

        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $attachment->original_name);

        return response($content, 200, [
            'Content-Type' => $attachment->mime_type,
            'Content-Length' => (string) strlen($content),
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
