import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Chrome, Search, Globe, Shield, Zap, Accessibility, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface AuditFormProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export function AuditForm({ onAudit, isLoading, isLoggedIn, onLogin }: AuditFormProps) {
  const [url, setUrl] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing architecture...');

  React.useEffect(() => {
    if (isLoading) {
      const messages = [
        'Diagnosing Vital Signs...',
        'Gauging Prestige Factor...',
        'Checking Communication Health...',
        'Analyzing Operational Friction...',
        'Verifying Compliance...',
        'Gemini is ruthless...',
        'Generating audit...'
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }
    onAudit(formattedUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-md text-[9px] font-bold uppercase tracking-wider mb-4 border border-border">
          <Zap className="w-3 h-3 fill-current" />
          Powered by Gemini 3 Flash
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-foreground leading-[1.1]">
          Engineered Website <br /> Auditing.
        </h1>
        <p className="text-base text-muted-foreground max-w-lg mx-auto font-medium">
          The ultimate engine for verifying technical health, brand prestige, and operational efficiency.
        </p>
      </motion.div>

      <div className="relative group max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center bg-card p-1.5 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="absolute left-6 text-muted-foreground/50">
            <Globe className="w-5 h-5" />
          </div>
          <Input
            type="text"
            placeholder="domain.com"
            className="h-14 pl-14 pr-40 text-base rounded-lg border-none focus:ring-0 shadow-none font-medium text-foreground placeholder:text-muted-foreground/30 bg-transparent"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="absolute right-1.5 h-11 px-6 rounded-md bg-primary text-primary-foreground font-bold transition-all active:scale-95 disabled:opacity-50"
            disabled={isLoading || !isLoggedIn}
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                onLogin();
              }
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span className="text-[10px] uppercase tracking-wider">{loadingMessage}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isLoggedIn ? <Search className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span className="text-[10px] uppercase tracking-wider">{isLoggedIn ? 'Audit Asset' : 'Sign In'}</span>
              </span>
            )}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-16">
        {[
          { icon: Zap, label: 'Vital Signs', color: 'text-rose-500' },
          { icon: Search, label: 'Prestige', color: 'text-blue-500' },
          { icon: Accessibility, label: 'Comm Health', color: 'text-amber-500' },
          { icon: Shield, label: 'Ops Friction', color: 'text-purple-500' },
          { icon: Globe, label: 'Compliance', color: 'text-emerald-500' },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-card p-3 h-28 flex flex-col justify-between rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-primary/20 transition-all cursor-default group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 ${item.color}`}>
               <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Module</p>
              <h4 className="font-bold text-foreground text-[11px] tracking-tight leading-none">{item.label}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
