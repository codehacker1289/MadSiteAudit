import { useState, useEffect } from 'react';
import { UserProfile, updateUserTier, getTiers, PricingTier, SystemSettings, getSettings } from '../services/userService';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Zap, Rocket, ShieldCheck, CreditCard, LogIn, ChevronRight, QrCode, Settings, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, signInWithPopup, trackEvent } from '../lib/firebase';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { QRCodeCanvas } from 'qrcode.react';
import { updateTier } from '../services/userService';

interface BillingViewProps {
  userProfile: UserProfile | null;
  onRefresh: () => void;
}

export function BillingView({ userProfile, onRefresh }: BillingViewProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [strategicAudits, setStrategicAudits] = useState(50);
  const [paymentModal, setPaymentModal] = useState<{ tier: PricingTier; amount: number; quota: number } | null>(null);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tierData, settingsData] = await Promise.all([
        getTiers(),
        getSettings()
      ]);
      setTiers(tierData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTier = async (e: any) => {
    e.preventDefault();
    if (editingTier) {
      await updateTier(editingTier);
      setEditingTier(null);
      fetchData();
    }
  };

  const handleOpenPayment = (tier: PricingTier) => {
    if (!userProfile) {
      handleLogin();
      return;
    }

    let amount = 0;
    let quota = tier.quota;

    if (tier.id === 'strategic_agent') {
      amount = (strategicAudits / 50) * 500;
      quota = strategicAudits;
    } else {
      amount = parseInt((tier.price || '').replace(/[^0-9]/g, '')) || 0;
    }

    setPaymentModal({ tier, amount, quota: quota || 0 });
    trackEvent('payment_initiated', { tier: tier.name, amount });
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onRefresh();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentModal || !userProfile) return;
    
    setIsProcessing(paymentModal.tier.id);
    try {
      // Simulate verification waiting
      await new Promise(r => setTimeout(r, 2000));
      await updateUserTier(userProfile.uid, paymentModal.tier.id, paymentModal.quota);
      trackEvent('payment_completed', { tier: paymentModal.tier.name, amount: paymentModal.amount });
      setPaymentModal(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs font-bold animate-pulse uppercase tracking-widest">Initialising Financial Portals...</div>;

  const getTierIcon = (id: string) => {
    switch (id) {
      case 'strategic_agent': return ShieldCheck;
      case 'specialist': return Rocket;
      default: return Zap;
    }
  };

  const getTierColor = (id: string) => {
    switch (id) {
      case 'strategic_agent': return 'text-emerald-500';
      case 'specialist': return 'text-blue-500';
      default: return 'text-rose-500';
    }
  };

  const strategicPrice = (strategicAudits / 50) * 500;
  const upiLink = settings && paymentModal 
    ? `upi://pay?pa=${settings.googlePayId}&pn=${encodeURIComponent(settings.merchantName)}&am=${paymentModal.amount}&cu=INR&tn=${encodeURIComponent(`Upgrade to ${paymentModal.tier.name}`)}`
    : '';

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
          Resource Allocation
        </Badge>
        <h2 className="text-4xl font-black tracking-tighter">Scale Your Intelligence</h2>
        <p className="text-muted-foreground text-sm font-medium max-w-xl mx-auto italic">
          Upgrade your operational capacity to gain deeper insights into your digital infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = getTierIcon(tier.id);
          const color = getTierColor(tier.id);
          const isStrategic = tier.id === 'strategic_agent';
          const isSpecialist = tier.id === 'specialist';
          
          return (
            <Card key={tier.id} className={`relative flex flex-col shadow-none border-border group transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${isSpecialist ? 'border-primary ring-1 ring-primary/10' : ''}`}>
              {isSpecialist && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                  <Badge className="bg-primary text-primary-foreground font-black uppercase px-3 py-1 shadow-sm">HIGHEST CLEARANCE</Badge>
                </div>
              )}
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setEditingTier(tier)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground transition-colors z-10"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <CardHeader className="space-y-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-black tracking-tight uppercase leading-none">{tier.name}</CardTitle>
                <CardDescription className="text-xs font-semibold text-muted-foreground mt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">
                    {isStrategic ? `Rs. ${strategicPrice}` : tier.price}
                  </span>
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">/ Month</span>
                </div>
                
                {isStrategic && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary">Scalable Audits</label>
                       <span className="text-xl font-black tabular-nums">{strategicAudits}</span>
                    </div>
                    <Slider 
                      defaultValue={[50]} 
                      min={50} 
                      max={1000} 
                      step={50} 
                      onValueChange={(val) => setStrategicAudits(val[0])}
                    />
                    <p className="text-[9px] text-muted-foreground font-bold text-center uppercase tracking-tighter">Adjust scale using the neural slider</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <Badge variant="secondary" className="px-2 py-0.5 text-[9px] uppercase">
                      {isStrategic ? `${strategicAudits} Audits / mo` : tier.quota === -1 ? 'Unlimited Audits' : `${tier.quota} Audits / mo`}
                    </Badge>
                  </div>
                  <div className="space-y-2.5">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[11px] font-medium leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleOpenPayment(tier)}
                  disabled={(userProfile?.tier === tier.id) || (isProcessing !== null)}
                  className={`w-full font-black uppercase tracking-widest text-[10px] h-10 transition-all ${userProfile?.tier === tier.id ? 'bg-secondary text-muted-foreground' : 'active:scale-95'}`}
                >
                  {isProcessing === tier.id ? (
                    'Securing Portal...'
                  ) : !userProfile ? (
                    'Authorize for Access'
                  ) : userProfile?.tier === tier.id ? (
                    'Current Clearance'
                  ) : (
                    `Request Authorization`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!paymentModal} onOpenChange={() => !isProcessing && setPaymentModal(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-center">Payment Authorization</DialogTitle>
            <DialogDescription className="text-center text-xs font-medium italic">
              Scan implementation QR to initiate recurring payment bridge.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-muted">
              {upiLink && <QRCodeCanvas value={upiLink} size={200} level="H" />}
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Required</p>
              <p className="text-3xl font-black font-mono">Rs. {paymentModal?.amount}</p>
            </div>

            <div className="w-full bg-muted/30 p-4 rounded-xl border border-border space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Merchant ID</span>
                <span className="font-mono text-[9px]">{settings?.googlePayId}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-muted-foreground">Allocation</span>
                <span>{paymentModal?.quota === -1 ? 'Unlimited' : paymentModal?.quota} Audits</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
               className="w-full h-12 font-black uppercase tracking-widest text-xs" 
               onClick={handleConfirmPayment}
               disabled={isProcessing !== null}
            >
              {isProcessing ? 'Verifying Transaction...' : 'I Have Paid'}
            </Button>
            <p className="text-[9px] text-center text-muted-foreground font-medium">
              By confirming, you authorize MadSiteAudit to verify the transaction on the neural network.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingTier} onOpenChange={() => setEditingTier(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Configure Tier: {editingTier?.name}</DialogTitle>
            <DialogDescription className="text-xs font-medium italic">Adjust tier credentials and operational limits.</DialogDescription>
          </DialogHeader>
          {editingTier && (
            <form onSubmit={handleUpdateTier} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Price</label>
                <input 
                  type="text" 
                  value={editingTier.price}
                  onChange={(e) => setEditingTier({...editingTier, price: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-bold h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extraction Quota (-1 for ∞)</label>
                <input 
                  type="number" 
                  value={isNaN(editingTier.quota) ? '' : editingTier.quota}
                  onChange={(e) => setEditingTier({...editingTier, quota: parseInt(e.target.value)})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-bold h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Features (comma separated)</label>
                <textarea 
                  value={editingTier.features.join(', ')}
                  onChange={(e) => setEditingTier({...editingTier, features: e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-xs font-bold min-h-[80px]"
                />
              </div>
              <Button type="submit" className="w-full h-10 font-black uppercase tracking-widest text-[10px]">
                <Save className="w-3.5 h-3.5 mr-2" />
                Commit Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
