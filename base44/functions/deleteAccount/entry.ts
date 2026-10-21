import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Log the deletion for admin tracking
    try {
      const body = await req.json().catch(() => ({}));
      await base44.asServiceRole.entities.DeletionLog.create({
        device_id: body.device_id || '',
        user_email: user.email || '',
        reason: body.reason || ''
      });
    } catch (e) {
      /* ignore logging errors */
    }

    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});