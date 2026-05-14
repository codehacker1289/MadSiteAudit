import { useState, useEffect } from 'react';
import { UserProfile, getAllUsers, updateAuditQuota, setUserBanStatus, toggleUserRole, deleteUserAccount, PricingTier, getTiers, updateTier, SystemSettings, getSettings, updateSettings } from '../services/userService';
import { getAllAudits } from '../services/dbService';
import { AuditReport } from '../services/auditService';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, ShieldAlert, Zap, IndianRupee, Ban, Trash2, UserPlus, TrendingUp, History, Settings, Globe, CreditCard, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

export function AdminDashboard({ tab = 'operatives' }: { tab?: string }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ googlePayId: '', merchantName: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userData, auditData, tierData, settingsData] = await Promise.all([
        getAllUsers(),
        getAllAudits(),
        getTiers(),
        getSettings()
      ]);
      setUsers(userData);
      setAudits(auditData || []);
      setTiers(tierData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuotaChange = async (uid: string, currentQuota: number) => {
    const newQuota = prompt("Enter new audit quota:", currentQuota.toString());
    if (newQuota && !isNaN(parseInt(newQuota))) {
      await updateAuditQuota(uid, parseInt(newQuota));
      fetchData();
    }
  };

  const handleUpdateTier = async (tier: PricingTier) => {
    const newPrice = prompt(`Enter new price for ${tier.name} (e.g. Rs. 500):`, tier.price);
    const newQuota = prompt(`Enter new base quota for ${tier.name} (-1 for unlimited):`, tier.quota.toString());
    const newFeatures = prompt(`Enter features (comma separated):`, tier.features.join(', '));
    
    if (newPrice !== null && newQuota !== null && newFeatures !== null) {
      await updateTier({
        ...tier,
        price: newPrice,
        quota: parseInt(newQuota),
        features: newFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
      });
      fetchData();
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings(settings);
    alert('Settings secured.');
    fetchData();
  };

  const totalAudits = users.reduce((acc, u) => acc + (u.auditsUsed || 0), 0);
  const paidUsers = users.filter(u => u.tier !== 'free').length;
  const estimatedRevenue = users.reduce((acc, u) => {
    const tier = tiers.find(t => t.id === (u.tier || 'free'));
    if (tier && tier.price !== 'Rs. 0') {
      const priceStr = (tier.price || '').replace(/[^0-9]/g, '');
      return acc + (parseInt(priceStr) || 0);
    }
    return acc;
  }, 0);

  const chartData = [
    { name: 'Mon', audits: 12 },
    { name: 'Tue', audits: 19 },
    { name: 'Wed', audits: 15 },
    { name: 'Thu', audits: 22 },
    { name: 'Fri', audits: 30 },
    { name: 'Sat', audits: 25 },
    { name: 'Sun', audits: 35 },
  ];

  if (isLoading) return <div className="p-8 text-center text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Terminal...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Command Center</h2>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Platform Governance & Oversight</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-8 px-4 font-black">ROOT ACCESS GRANTED</Badge>
      </div>

      <div className="space-y-6">
        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard icon={Users} label="Total Users" value={users.length} color="text-blue-500" />
              <StatsCard icon={Zap} label="Total Extractions" value={totalAudits} color="text-amber-500" />
              <StatsCard icon={IndianRupee} label="Monthly Revenue" value={`Rs. ${estimatedRevenue}`} color="text-emerald-500" />
              <StatsCard icon={ShieldAlert} label="Paid Assets" value={paidUsers} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-none border-border bg-card/50">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Growth Projection
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="audits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAudits)" strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border bg-card/50">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Free', count: users.filter(u => u.tier === 'free').length },
                        { name: 'Specialist', count: users.filter(u => u.tier === 'specialist').length },
                        { name: 'Strategic', count: users.filter(u => u.tier === 'strategic_agent').length },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Bar dataKey="count" fill="currentColor" className="text-primary" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {tab === "users" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest border-b border-border">
                  <tr>
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Clearance</th>
                    <th className="px-6 py-4 text-center">Extraction Log</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{u.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">UID: {u.uid.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Badge className={`${u.tier === 'strategic_agent' ? 'bg-emerald-500/10 text-emerald-600' : u.tier === 'specialist' ? 'bg-blue-500/10 text-blue-600' : 'bg-secondary text-muted-foreground'} uppercase text-[9px] border-none font-black`}>
                             {u.tier}
                           </Badge>
                           {u.role === 'admin' && <Badge className="bg-primary/10 text-primary uppercase text-[9px] border-none font-black">ADMIN</Badge>}
                           {u.isBanned && <Badge variant="destructive" className="uppercase text-[9px] font-black">BANNED</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold">{(u.auditsUsed || 0)} / {(u.auditQuota === -1 ? '∞' : (u.auditQuota || 0))}</p>
                        <div className="w-24 h-1 bg-muted rounded-full mx-auto mt-2 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: u.auditQuota === -1 ? '100%' : `${Math.min(((u.auditsUsed || 0) / (u.auditQuota || 1)) * 100, 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuotaChange(u.uid, u.auditQuota)} title="Update Quota">
                          <UserPlus className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className={`h-7 w-7 ${u.isBanned ? 'bg-destructive/10 text-destructive' : ''}`} onClick={() => { setUserBanStatus(u.uid, !u.isBanned); fetchData(); }} title={u.isBanned ? "Unban" : "Ban"}>
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { toggleUserRole(u.uid, u.role); fetchData(); }} title="Toggle Role">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive hover:text-white" onClick={() => { if(confirm("Permanently remove this user record?")) { deleteUserAccount(u.uid); fetchData(); } }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "logs" && (
           <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                 <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest border-b border-border">
                   <tr>
                     <th className="px-6 py-4">Extraction Target</th>
                     <th className="px-6 py-4">Operative</th>
                     <th className="px-6 py-4">Health Index</th>
                     <th className="px-6 py-4 text-right">Timestamp</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {audits.map((a, i) => (
                     <tr key={i} className="hover:bg-secondary/50 transition-colors">
                       <td className="px-6 py-4 flex items-center gap-2">
                         <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                         <span className="font-bold">{a.url}</span>
                       </td>
                       <td className="px-6 py-4 text-muted-foreground font-mono">
                         {users.find(u => u.uid === a.userId)?.email || 'ANONYMOUS'}
                       </td>
                       <td className="px-6 py-4">
                         <Badge className={`${a.overallScore >= 90 ? 'bg-emerald-500/10 text-emerald-600' : a.overallScore >= 70 ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'} border-none font-black`}>
                           {a.overallScore}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 text-right text-muted-foreground">
                         {new Date(a.timestamp).toLocaleString()}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {tab === "payout" && (
          <Card className="shadow-none border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Payout Infrastructure Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Google Pay / UPI ID</label>
                  <input 
                    type="text" 
                    value={settings.googlePayId}
                    onChange={(e) => setSettings({...settings, googlePayId: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary h-10"
                    placeholder="e.g. admin@upi or paymentid@okaxis"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Merchant Display Name</label>
                  <input 
                    type="text" 
                    value={settings.merchantName}
                    onChange={(e) => setSettings({...settings, merchantName: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary h-10"
                    placeholder="e.g. Madrocket Operations"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-border flex justify-end">
                <Button onClick={handleSaveSettings} className="h-10 px-8 font-black uppercase tracking-widest text-[10px]">
                  <Save className="w-3.5 h-3.5 mr-2" />
                  Secure Payout Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="shadow-none border-border bg-card/50 overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon className="w-16 h-16" />
        </div>
        <Icon className={`w-4 h-4 mb-3 ${color}`} />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
