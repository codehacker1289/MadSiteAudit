import { useState, useEffect } from 'react';
import { AuditForm } from './components/AuditForm';
import { AuditReportView } from './components/AuditReportView';
import { performAudit, AuditReport } from './services/auditService';
import { saveAudit, getAuditHistory } from './services/dbService';
import { auth, googleProvider, signInWithPopup, signOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { ArrowLeft, History, Info, Github, Search, Globe, LogIn, LogOut, User as UserIcon, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Theme = 'light' | 'dark' | 'system';

export default function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "history">("dashboard");
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u) {
        fetchHistory();
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async () => {
    const historicalAudits = await getAuditHistory(10);
    if (historicalAudits) {
      setHistory(historicalAudits);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setReport(null);
    setView("dashboard");
  };

  const handleAudit = async (url: string) => {
    if (!user) {
      setError("Please sign in to run an audit.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await performAudit(url);
      setReport(result);
      await saveAudit(result);
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to perform audit. Please check the URL and try again.');
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
          <span className="font-bold text-lg tracking-tight">AuditAI</span>
        </div>

        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            <button 
              onClick={() => { setView("dashboard"); setReport(null); }}
              className={`flex items-center w-full px-3 py-2 rounded-md text-xs font-semibold transition-all group ${view === "dashboard" && !report ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setView("history"); setReport(null); }}
              className={`flex items-center w-full px-3 py-2 rounded-md text-xs font-semibold transition-all group ${view === "history" && !report ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Audit History
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-4 border-t border-border">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-1 bg-secondary rounded-lg">
            {(['light', 'system', 'dark'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-1.5 rounded-md transition-all ${theme === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title={`${t.charAt(0).toUpperCase() + t.slice(1)} mode`}
              >
                {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                {t === 'system' && <Monitor className="w-3.5 h-3.5" />}
                {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {user ? (
            <div className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Free Tier</p>
                </div>
              </div>
              <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(history.length / 10) * 100}%` }}></div>
              </div>
              <p className="text-[9px] mt-2 text-muted-foreground font-semibold tracking-tight">{history.length} of 10 used</p>
              
              <button onClick={handleLogout} className="mt- focus:outline-none flex items-center gap-1.5 text-[9px] font-bold text-destructive hover:opacity-80 transition-opacity uppercase tracking-widest pt-2">
                <LogOut className="w-3 h-3" />
                Sign Out
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
            <span>© 2024 AuditAI</span>
            <div className="flex gap-2">
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
        <header className="h-14 bg-card/50 backdrop-blur-md border-b border-border px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
             {report && (
               <button onClick={reset} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-all">
                 <ArrowLeft className="w-4 h-4" />
               </button>
             )}
             <h2 className="text-sm font-bold tracking-tight">
               {report ? report.url : view === "dashboard" ? "Dashboard" : "History"}
             </h2>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-md text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all">
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <AuditReportView report={report} />
              </motion.div>
            ) : view === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <AuditForm 
                  onAudit={handleAudit} 
                  isLoading={isLoading} 
                  isLoggedIn={!!user} 
                  onLogin={handleLogin} 
                />
                
                {error && (
                  <div className="max-w-md mx-auto mt-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center text-xs font-bold">
                    {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 max-w-4xl mx-auto w-full"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight mb-1">Audit History</h3>
                  <p className="text-muted-foreground text-xs font-medium">Recent security and performance reports.</p>
                </div>

                <div className="grid gap-2">
                  {history.length > 0 ? history.map((h, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setReport(h)}
                      className="group p-3 bg-card border border-border rounded-lg flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-all active:scale-[0.995]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs group-hover:text-primary transition-colors">{h.url}</p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wide">
                            {new Date(h.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 leading-none">Score</p>
                          <p className={`text-sm font-black ${h.overallScore >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{h.overallScore}</p>
                        </div>
                        <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
                      <History className="w-8 h-8 text-muted mx-auto mb-3" />
                      <p className="text-muted-foreground text-xs font-bold tracking-tight">No history found</p>
                      {!user && <p className="text-muted-foreground/60 text-[10px] mt-1">Sign in to sync history</p>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

