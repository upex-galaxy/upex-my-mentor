'use server'

import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import type { VerificationPayload, VerificationResult } from '@/types'

export async function updateApplicationStatus(
  payload: VerificationPayload
): Promise<VerificationResult> {
  const { applicationId, action, reason } = payload

  // Validate payload
  if (!applicationId || !action) {
    return { success: false, error: 'Missing required fields' }
  }

  if (action === 'reject' && (!reason || reason.trim().length < 10)) {
    return {
      success: false,
      error: 'Rejection reason is required (minimum 10 characters)'
    }
  }

  try {
    const supabase = await createServer()

    // 1. Verify current user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Please log in' }
    }

    // Get user role from profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return { success: false, error: 'Forbidden: Admin access required' }
    }

    // 2. Check application exists and is pending (not already verified)
    const { data: application, error: fetchError } = await supabase
      .from('profiles')
      .select('id, is_verified, rejection_reason')
      .eq('id', applicationId)
      .eq('role', 'mentor')
      .single()

    if (fetchError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Check if already processed
    if (application.is_verified) {
      return {
        success: false,
        error: 'Application has already been approved'
      }
    }

    if (application.rejection_reason) {
      return {
        success: false,
        error: 'Application has already been rejected'
      }
    }

    // 3. Update based on action
    const updateData = action === 'approve'
      ? { is_verified: true, rejection_reason: null }
      : { is_verified: false, rejection_reason: reason?.trim() }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', applicationId)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: 'Failed to update application status' }
    }

    // 4. Revalidate paths
    revalidatePath('/admin/applications')
    revalidatePath(`/admin/applications/${applicationId}`)

    return {
      success: true,
      updatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Server action error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
