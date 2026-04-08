import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentCount: number;
  limit: number;
}

export const UpgradeDialog = ({
  open,
  onOpenChange,
  feature,
  currentCount,
  limit,
}: UpgradeDialogProps) => {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <AlertDialogTitle>Upgrade to Unlimited</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              You've reached the free tier limit of <strong>{limit} {feature}</strong>.
              You currently have <strong>{currentCount}</strong>.
            </p>
            <p>
              Upgrade to the Unlimited plan for just <strong>$10/month</strong> to add
              unlimited {feature}, templates, lesson plans, and more!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate('/pricing')}>
            View Plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
