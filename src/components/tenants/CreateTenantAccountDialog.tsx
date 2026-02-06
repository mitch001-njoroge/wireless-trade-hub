import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateTenantAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  tenantEmail?: string;
  onSuccess?: () => void;
}

export function CreateTenantAccountDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  tenantEmail = '',
  onSuccess,
}: CreateTenantAccountDialogProps) {
  const [email, setEmail] = useState(tenantEmail);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    setGeneratedPassword(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please provide email and password',
        variant: 'destructive',
      });
      return;
    }

    setStatus('creating');

    try {
      // Create user account using Supabase Admin API via edge function
      const { data, error } = await supabase.functions.invoke('create-tenant-account', {
        body: {
          email,
          password,
          tenantId,
          tenantName,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedPassword(password);
      setStatus('success');
      toast({
        title: 'Account Created',
        description: `Tenant account created for ${tenantName}`,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating tenant account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tenant account',
        variant: 'destructive',
      });
      setStatus('error');
    }
  };

  const copyCredentials = () => {
    const text = `Email: ${email}\nPassword: ${generatedPassword}`;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Credentials copied to clipboard',
    });
  };

  const handleClose = () => {
    setStatus('idle');
    setEmail(tenantEmail);
    setPassword('');
    setGeneratedPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create Tenant Account
          </DialogTitle>
          <DialogDescription>
            Create login credentials for {tenantName}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-success mb-3" />
              <h3 className="font-semibold text-success">Account Created!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share these credentials with the tenant
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
              <p><span className="text-muted-foreground">Email:</span> {email}</p>
              <p><span className="text-muted-foreground">Password:</span> {generatedPassword}</p>
            </div>

            <Button onClick={copyCredentials} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Credentials
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              The tenant can log in at the same login page and will be redirected to their dashboard.
            </p>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Tenant Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  onClick={generatePassword}
                  className="text-xs"
                >
                  Generate
                </Button>
              </div>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter or generate password"
                minLength={6}
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={status === 'creating'}>
                {status === 'creating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
