"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { logout } = useAuth();

  const onSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out.");
    }
  };

  return (
    <Button 
      onClick={onSignOut} 
      variant="ghost" 
      className={className + " gap-4 w-full justify-start h-11 px-4 hover:bg-destructive/10 hover:text-destructive transition-colors"}
    >
      <LogOut className="size-5" />
      <span className="font-bold text-[15px]">Logout</span>
    </Button>
  );
}
