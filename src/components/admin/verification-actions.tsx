'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { updateApplicationStatus } from '@/app/admin/applications/[id]/actions'

interface VerificationActionsProps {
  applicationId: string
  applicationName: string
  isVerified: boolean
  isRejected: boolean
}

export function VerificationActions({
  applicationId,
  applicationName,
  isVerified,
  isRejected,
}: VerificationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isAlreadyProcessed = isVerified || isRejected

  const handleApprove = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateApplicationStatus({
        applicationId,
        action: 'approve',
      })

      if (result.success) {
        toast.success('Mentor has been approved and will now appear in the marketplace')
        router.push('/admin/applications')
      } else {
        setError(result.error || 'Something went wrong')
        toast.error(result.error || 'Failed to approve application')
      }
    })
  }

  const handleReject = () => {
    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason is required (minimum 10 characters)')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateApplicationStatus({
        applicationId,
        action: 'reject',
        reason: rejectionReason.trim(),
      })

      if (result.success) {
        toast.success('Application has been rejected. The mentor will be notified.')
        setShowRejectModal(false)
        router.push('/admin/applications')
      } else {
        setError(result.error || 'Something went wrong')
        toast.error(result.error || 'Failed to reject application')
      }
    })
  }

  const openRejectModal = () => {
    setRejectionReason('')
    setError(null)
    setShowRejectModal(true)
  }

  if (isAlreadyProcessed) {
    return (
      <Card data-testid="verification_actions_processed">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            This application has already been {isVerified ? 'approved' : 'rejected'}.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card data-testid="verification_actions">
        <CardHeader>
          <CardTitle className="text-lg">Review Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            {error && (
              <p className="text-sm text-destructive w-full sm:w-auto sm:flex-1">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                data-testid="approve_button"
                variant="default"
                className="gap-2"
                disabled={isPending}
                onClick={handleApprove}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve Mentor
              </Button>
              <Button
                data-testid="reject_button"
                variant="destructive"
                className="gap-2"
                disabled={isPending}
                onClick={openRejectModal}
              >
                <XCircle className="h-4 w-4" />
                Reject Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent data-testid="reject_modal">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {applicationName}&apos;s application?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                data-testid="rejection_reason_input"
                placeholder="Provide a reason for rejection (e.g., incomplete profile, unverifiable credentials)"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value)
                  if (error) setError(null)
                }}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to the mentor. Minimum 10 characters.
              </p>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              data-testid="cancel_reject_button"
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              data-testid="confirm_reject_button"
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || rejectionReason.trim().length < 10}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
