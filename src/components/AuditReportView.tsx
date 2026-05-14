import React from 'react';
import { AuditReport, AuditPoint } from '@/src/services/auditService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Progress } from '@/src/components/ui/progress';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, Download, ExternalLink, Shield, Zap, Search, Accessibility, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToPDF } from '@/src/services/pdfService';

interface AuditReportViewProps {
  report: AuditReport;
}

export function AuditReportView({ report }: AuditReportViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    await exportToPDF('audit-report-container', report);
    setIsExporting(false);
  };

  const getStatusIcon = (status: AuditPoint['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'fail': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getImpactBadge = (impact: AuditPoint['impact']) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] uppercase font-black px-2 mt-1">High Impact</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-[10px] uppercase font-black px-2 mt-1">Med Impact</Badge>;
      case 'low': return <Badge variant="outline" className="bg-info/10 text-info border-info/20 text-[10px] uppercase font-black px-2 mt-1">Low Impact</Badge>;
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
           <div className="bg-card p-2 rounded-lg border border-border shadow-sm">
             <div className="w-10 h-10 bg-success/10 text-success rounded-md flex items-center justify-center">
               <Shield className="w-5 h-5" />
             </div>
           </div>
           <div>
             <div className="flex items-center gap-2">
               <h2 className="text-xl font-bold tracking-tight text-foreground leading-none">{report.url}</h2>
               <Badge variant="outline" className="text-[9px] uppercase tracking-widest px-2 py-0 h-5 bg-primary/5 text-primary border-primary/20">
                 {report.businessDomain || 'Detecting...'}
               </Badge>
               <a href={report.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-all">
                 <ExternalLink className="w-3.5 h-3.5" />
               </a>
             </div>
             <p className="text-muted-foreground text-[10px] font-medium mt-1">Audit analyzed on {new Date(report.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
           </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleDownload} 
          disabled={isExporting}
          className="bg-primary text-primary-foreground border-none h-10 px-4 rounded-md transition-all font-bold group shadow-sm active:scale-95 text-xs uppercase tracking-wider"
        >
          {isExporting ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" /> : <Download className="w-3.5 h-3.5 mr-2" />}
          Export PDF
        </Button>
      </div>

      <div id="audit-report-container" className="space-y-4">
        {/* Top Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Overall Score Card */}
          <div className="col-span-12 lg:col-span-3 bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-4 text-center">Health Index</p>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (report.overallScore / 100) * 377}
                  className={`${report.overallScore >= 90 ? 'text-emerald-500' : report.overallScore >= 70 ? 'text-blue-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground tracking-tighter leading-none">{report.overallScore}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-5 gap-2">
             {[
               { id: 'vital', label: 'Vital Signs', data: report.categories.vitalSigns, icon: Zap, color: 'text-destructive', bg: 'bg-destructive/10' },
               { id: 'prestige', label: 'Prestige', data: report.categories.prestigeFactor, icon: Search, color: 'text-info', bg: 'bg-info/10' },
               { id: 'comm', label: 'Comm Health', data: report.categories.communicationHealth, icon: Accessibility, color: 'text-warning', bg: 'bg-warning/10' },
               { id: 'ops', label: 'Ops Friction', data: report.categories.operationalFriction, icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
               { id: 'safety', label: 'Compliance', data: report.categories.communityCompliance, icon: Globe, color: 'text-success', bg: 'bg-success/10' }
             ].map((metric) => (
               <div key={metric.id} className="bg-card rounded-xl border border-border p-3 flex flex-col shadow-sm transition-all group">
                 <div className="flex justify-between items-start mb-2">
                    <div className={`p-1.5 rounded-md ${metric.bg} ${metric.color}`}>
                       <metric.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-right">
                       <p className={`text-lg font-black tracking-tight ${metric.color}`}>{metric.data.score}</p>
                    </div>
                 </div>
                 <div className="mt-auto">
                    <h4 className="text-[9px] font-bold text-foreground tracking-tight mb-1.5 uppercase tracking-wider truncate">{metric.label}</h4>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ${metric.color.replace('text-', 'bg-')}`}
                        style={{ width: `${metric.data.score}%` }}
                       ></div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Executive Summary & CTA Section */}
        <div className="grid grid-cols-12 gap-4">
          {/* Ruthless Summary */}
          <div className="col-span-12 lg:col-span-5 bg-destructive text-white rounded-xl p-6 shadow-lg shadow-destructive/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertCircle className="w-24 h-24 rotate-12" />
            </div>
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-widest opacity-90">
              <Search className="w-3.5 h-3.5" />
              Critical Assessment
            </h3>
            <p className="text-sm leading-relaxed font-bold italic">
               "{report.summary}"
            </p>
          </div>

          {/* Persuasive CALL TO ACTION */}
          <div className="col-span-12 lg:col-span-7 bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-info/10 to-transparent"></div>
            <h3 className="text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-info relative z-10">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Strategic Roadmap
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium mb-4 relative z-10">
               {report.persuasiveCallToAction}
            </p>
            <Button className="relative z-10 bg-info hover:bg-info/90 text-white border-none rounded-lg h-9 px-6 text-[10px] font-black uppercase tracking-widest">
              Repair My Digital Presence
            </Button>
          </div>
        </div>

        {/* Findings List - Compact */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Audit Findings</h3>
              </div>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] px-2 py-0">AUTO-GEN</Badge>
            </div>
            <div className="divide-y divide-border">
              {Object.entries(report.categories).flatMap(([_, cat]) => cat.points).map((point, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="px-5 py-2.5 flex items-start hover:bg-secondary/30 transition-colors group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 mr-3 border transition-transform group-hover:scale-105 ${
                    point.status === 'pass' ? 'bg-success/10 text-success border-success/20' : 
                    point.status === 'warning' ? 'bg-warning/10 text-warning border-warning/20' : 
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {point.status === 'pass' ? <CheckCircle2 className="w-2.5 h-2.5" /> : 
                     point.status === 'warning' ? <AlertCircle className="w-2.5 h-2.5" /> : 
                     <div className="font-black text-[8px]">!</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[11px] font-bold text-foreground tracking-tight line-clamp-1">{point.title}</h4>
                      <Badge className={`text-[7px] uppercase font-black px-1 ml-2 h-3.5 border-none ${
                        point.impact === 'high' ? 'bg-destructive/10 text-destructive' :
                        point.impact === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-info/10 text-info'
                      }`}>
                        {point.impact}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                       {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
