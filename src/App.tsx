import { useState, useEffect, useCallback } from 'react';
import { AuditForm } from './components/AuditForm';
import { AuditReportView } from './components/AuditReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { BillingView } from './components/BillingView';
import { performAudit, AuditReport } from './services/auditService';
import { saveAudit, getAuditHistory } from './services/dbService';
import { getOrCreateProfile, incrementAuditsUsed, UserProfile } from './services/userService';
import { auth, googleProvider, signInWithPopup, signOut, trackEvent, remoteConfig } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getValue } from 'firebase/remote-config';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { ArrowLeft, History, Info, Github, Search, Globe, LogIn, LogOut, User as UserIcon, Sun, Moon, Monitor, ShieldAlert, CreditCard, LayoutDashboard, Users, Settings, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { ScrollArea } from '@/src/components/ui/scroll-area';

type Theme = 'light' | 'dark' | 'system';
type View = "dashboard" | "history" | "billing" | "admin-users" | "admin-logs" | "admin-payout" | "admin-dashboard";

export default function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [announcement, setAnnouncement] = useState<string>("");

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'friendswatchgotforfree@gmail.com';

  useEffect(() => {
    if (remoteConfig) {
      const msg = getValue(remoteConfig, "announcement_message").asString();
      setAnnouncement(msg);
    }
  }, []);

  useEffect(() => {
    trackEvent('view_changed', { view });
  }, [view]);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
      let actualTheme = t;
      if (t === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.classList.remove('light', 'dark');
      root.classList.add(actualTheme);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const fetchProfile = useCallback(async (u: User) => {
    try {
      const profile = await getOrCreateProfile(u.uid, u.email || '');
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u) {
        await fetchProfile(u);
        fetchHistory();
      } else {
        setUserProfile(null);
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, [fetchProfile]);

  const fetchHistory = async () => {
    const historicalAudits = await getAuditHistory(50);
    if (historicalAudits) {
      setHistory(historicalAudits);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      trackEvent('login', { method: 'google', user_id: result.user.uid });
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    }
  };

  const handleLogout = async () => {
    trackEvent('logout', { user_id: user?.uid });
    await signOut(auth);
    setReport(null);
    setView("dashboard");
  };

  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const handleAudit = async (url: string) => {
    if (!user || !userProfile) {
      setError("Please sign in to run an audit.");
      return;
    }

    if (userProfile.auditsUsed >= userProfile.auditQuota && !isAdmin) {
      setError("Audit quota exceeded. Please upgrade your tier.");
      setView("billing");
      return;
    }

    if (userProfile.isBanned) {
      setError("Your account has been suspended for security violations.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    trackEvent('audit_started', { url, user_id: user.uid });
    try {
      const result = await performAudit(url, user.displayName || 'Anonymous Operative', user.email || '');
      setReport(result);
      await saveAudit(result);
      await incrementAuditsUsed(user.uid);
      await fetchHistory();
      await fetchProfile(user);
      trackEvent('audit_completed', { url, score: result.overallScore });
    } catch (err: any) {
      console.error('Audit Engine Failure:', err);
      const serverError = err.response?.data?.error;
      const details = err.response?.data?.details;
      
      if (serverError) {
        setError(`Audit Error: ${serverError}`);
        console.error('Server Details:', details);
      } else {
        setError('Failed to perform audit. The Madrocket engine encountered an anomaly.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReport(null);
    setError(null);
    setView("dashboard");
  };

  return (
    <div className="flex min-h-screen h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/10">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border text-foreground flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2.5 cursor-pointer" onClick={reset}>
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
            <Search className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">MadSiteAudit</span>
        </div>

        <nav className="flex-1 px-4 py-2">
          {announcement && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Update Protocol</p>
              <p className="text-[10px] font-bold text-foreground leading-tight italic">{announcement}</p>
            </div>
          )}
          <div className="space-y-1">
            <SidebarLink 
              icon={LayoutDashboard} 
              label="Landing Page" 
              active={view === "dashboard"} 
              onClick={() => { setView("dashboard"); setReport(null); }} 
            />
            <SidebarLink 
              icon={History} 
              label="Audit History" 
              active={view === "history" || !!report} 
              onClick={() => { setView("history"); setReport(null); }} 
            />
            <SidebarLink 
              icon={CreditCard} 
              label="Billing & Tiers" 
              active={view === "billing"} 
              onClick={() => { setView("billing"); setReport(null); }} 
            />
            {isAdmin && (
              <div className="pt-4 space-y-1">
                <p className="px-3 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">Command Center</p>
                <SidebarLink 
                  icon={TrendingUp} 
                  label="Dashboard" 
                  active={view === "admin-dashboard"} 
                  onClick={() => { setView("admin-dashboard"); setReport(null); }} 
                />
                <SidebarLink 
                  icon={Users} 
                  label="Users" 
                  active={view === "admin-users"} 
                  onClick={() => { setView("admin-users"); setReport(null); }} 
                />
                <SidebarLink 
                  icon={History} 
                  label="Audit Logs" 
                  active={view === "admin-logs"} 
                  onClick={() => { setView("admin-logs"); setReport(null); }} 
                />
                <SidebarLink 
                  icon={ShieldAlert} 
                  label="Configure Payout" 
                  active={view === "admin-payout"} 
                  onClick={() => { setView("admin-payout"); setReport(null); }} 
                />
              </div>
            )}
          </div>
        </nav>
      {/* ... */}

        <div className="p-4 space-y-4 border-t border-border">
          {user ? (
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                    {userProfile?.tier?.replace('_', ' ') || 'Free operative'}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: userProfile?.auditQuota === -1 ? '100%' : `${Math.min(((userProfile?.auditsUsed || 0) / (userProfile?.auditQuota || 1)) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[9px] mt-2 text-muted-foreground font-bold tracking-tight uppercase">
                {userProfile?.auditsUsed || 0} / {userProfile?.auditQuota === -1 ? '∞' : userProfile?.auditQuota || 0} Extractions
              </p>
              
              <button 
                onClick={handleLogout} 
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground px-3 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </button>
          )}

          <div className="flex items-center justify-between text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">
            <span>© 2026 Madrocket</span>
            <div className="flex gap-2">
              <button onClick={() => setLegalModal('terms')} className="hover:text-foreground">Terms</button>
              <button onClick={() => setLegalModal('privacy')} className="hover:text-foreground">Privacy</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
        <header className="h-14 bg-card/50 backdrop-blur-md border-b border-border px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
             {(report || view !== "dashboard") && (
               <button onClick={reset} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-all">
                 <ArrowLeft className="w-4 h-4" />
               </button>
             )}
             <h2 className="text-sm font-black tracking-tight uppercase">
               {report ? report.url : view === 'dashboard' ? 'Landing Page' : view.replace('admin-', '').replace('payout', 'Configure Payout').replace('-', ' ')}
             </h2>
          </div>

          <div className="flex items-center gap-3">
             {/* Theme Toggle */}
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg mr-2">
              {(['light', 'system', 'dark'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-1 rounded-md transition-all ${theme === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title={`${t.charAt(0).toUpperCase() + t.slice(1)} mode`}
                >
                  {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                  {t === 'system' && <Monitor className="w-3.5 h-3.5" />}
                  {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all">
              <Github className="w-3.5 h-3.5" />
              Source
            </a>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div key="report" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                <AuditReportView 
                  report={report} 
                  onRepairClick={() => { setView("billing"); setReport(null); }} 
                />
              </motion.div>
            ) : view === "dashboard" ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                <AuditForm 
                  onAudit={handleAudit} 
                  isLoading={isLoading} 
                  isLoggedIn={!!user} 
                  onLogin={handleLogin} 
                />
                
                {error && (
                  <div className="max-w-md mx-auto mt-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center text-xs font-bold uppercase tracking-widest">
                    {error}
                  </div>
                )}
              </motion.div>
            ) : view === "billing" ? (
              <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BillingView userProfile={userProfile} onRefresh={() => user && fetchProfile(user)} />
              </motion.div>
            ) : view.startsWith("admin-") ? (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminDashboard tab={view.replace("admin-", "")} />
              </motion.div>
            ) : (
              <HistoryView history={history} onAuditSelect={setReport} user={user} />
            )}
          </AnimatePresence>
        </div>
      </main>

      <Dialog open={!!legalModal} onOpenChange={() => setLegalModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {legalModal === 'terms' ? 'Operational Terms of Engagement' : 'Data Integrity & Privacy Protocol'}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium italic">
              Effective Date: May 14, 2026. Controlled by Madrocket Neural Systems.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 text-xs leading-relaxed font-medium">
              {legalModal === 'terms' ? (
                <>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">1. Authorization Scope</h4>
                    <p>By initializing MadSiteAudit, you grant Madrocket explicit permission to scan, analyze, and store metadata related to provided URL targets. You acknowledge that all audits are for educational and diagnostic purposes only.</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">2. Resource Quotas</h4>
                    <p>Audit capacities are bound by your clearance tier. Attempting to bypass neural restrictions or flooding the API will result in instant account suspension without refund.</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">3. Financial Commitments</h4>
                    <p>Payments made via the Dynamic UPI Bridge are final. Service activation occurs upon neural verification of the transaction. Subscription fees are recurring unless manually terminated via the command center.</p>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">1. Data Storage Protocol</h4>
                    <p>We utilize military-grade encryption for all stored audit reports. Your Google Identity data is used solely for authentication and profile management within the Madrocket ecosystem.</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">2. Zero-Leak Policy</h4>
                    <p>We do not share your site intelligence with third-party advertising networks. Your data is isolated and protected by the Sentinel-X security layer.</p>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-black uppercase tracking-widest text-primary">3. Neural Processing</h4>
                    <p>Audit results may be anonymously aggregated to train our neural engines for better industry-wide diagnostics, without exposing specific site identities.</p>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function HistoryView({ history, onAuditSelect, user }: any) {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h3 className="text-2xl font-black tracking-tighter mb-1">Extraction Log</h3>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-70">Historical Site Intelligence Archive</p>
      </div>

      <div className="grid gap-3">
        {history.length > 0 ? history.map((h: any, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            onClick={() => onAuditSelect(h)}
            className="group p-4 bg-card border border-border rounded-xl flex items-center justify-between hover:border-primary/30 cursor-pointer transition-all active:scale-[0.995]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{h.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 opacity-60 uppercase font-black">{h.businessDomain || 'UNKNOWN'}</Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1 leading-none">Health Index</p>
                <p className={`text-xl font-black tracking-tighter ${h.overallScore >= 90 ? 'text-emerald-500' : h.overallScore >= 70 ? 'text-blue-500' : 'text-rose-500'}`}>{h.overallScore}</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground rotate-180 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
            <History className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Archive Empty</h4>
            <p className="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto italic">No prior intelligence reports found in the database.</p>
            {!user && <p className="text-primary text-[10px] mt-4 font-black uppercase tracking-widest">Sign in to initialize secure sync</p>}
          </div>
        )}
      </div>
    </div>
  );
}

