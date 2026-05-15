import React from 'react';
import { AuditReport, AuditPoint } from '@/src/services/auditService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Progress } from '@/src/components/ui/progress';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, Download, ExternalLink, Shield, Zap, Search, Accessibility, Globe, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { exportToPDF } from '@/src/services/pdfService';

interface AuditReportViewProps {
  report: AuditReport;
  onRepairClick?: () => void;
}

export function AuditReportView({ report, onRepairClick }: AuditReportViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await exportToPDF('audit-report-container', report);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
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

  const overallScore = report.overallScore || 0;

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
             <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-tight">
                  AGENT: <span className="text-foreground">{report.generatedBy}</span>
                </p>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-tight">
                   EXTRACTION: <span className="text-foreground">{new Date(report.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </p>
              </div>
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
        {/* Risk Status Runner */}
        <div className={`p-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${
          report.riskLevel === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/20' :
          report.riskLevel === 'elevated' ? 'bg-warning/20 text-warning border border-warning/20' :
          'bg-success/20 text-success border border-success/20'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          Risk Profiling: {report.riskLevel}
          <div className="flex gap-1 ml-4 grayscale opacity-50">
            <div className="w-1 h-1 rounded-full bg-current"></div>
            <div className="w-1 h-1 rounded-full bg-current"></div>
            <div className="w-1 h-1 rounded-full bg-current"></div>
          </div>
        </div>

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
                  strokeDashoffset={377 - (overallScore / 100) * 377}
                  className={`${overallScore >= 90 ? 'text-emerald-500' : overallScore >= 70 ? 'text-blue-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground tracking-tighter leading-none">{overallScore}</span>
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
        
        {/* Industry Benchmarking & Conversion Funnel */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-xl p-5 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
               <Globe className="w-3.5 h-3.5" />
               Industry Benchmarking
             </h3>
             <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-black text-primary">{report.industryBenchmark.score}</div>
                <div className="text-[11px] font-medium leading-relaxed text-muted-foreground italic">
                  {report.industryBenchmark.description}
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1">Competitor Gaps</p>
                {report.industryBenchmark.competitorGaps.map((gap, i) => (
                  <div key={i} className="text-[11px] font-bold flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {gap}
                  </div>
                ))}
             </div>
          </div>

          <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-xl p-5 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-success mb-3 flex items-center gap-2">
               <Zap className="w-3.5 h-3.5" />
               Conversion Funnel Analysis
             </h3>
             <div className="mb-4">
                <Badge variant="outline" className="bg-success/10 text-success text-[10px] border-success/20">
                   STATUS: {report.conversionFunnel.status}
                </Badge>
             </div>
             <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1">Identified ROI Leaks</p>
                {report.conversionFunnel.leaks.map((leak, i) => (
                  <div key={i} className="p-2 border border-destructive/10 rounded-lg bg-destructive/5 text-[11px] font-bold flex items-start gap-2">
                    <XCircle className="w-3 h-3 mt-0.5 text-destructive" />
                    {leak}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 12-Month Remediation Plan */}
        <div className="col-span-12 bg-card border border-border rounded-xl p-6 shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-info mb-6 flex items-center gap-2">
             <TrendingUp className="w-4 h-4" />
             12-Month Strategic Remediation Roadmap
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {report.remediationPlan.map((phase, i) => (
                <div key={i} className="space-y-4 relative">
                   {i < 2 && <div className="hidden md:block absolute top-4 -right-3 text-border"><ExternalLink className="w-4 h-4" /></div>}
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-info text-white text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </div>
                      <h4 className="text-[12px] font-black uppercase tracking-widest text-foreground">{phase.phase}</h4>
                   </div>
                   <div className="space-y-2 pl-8">
                      {phase.tasks.map((task, j) => (
                        <div key={j} className="text-[11px] font-medium text-muted-foreground border-l-2 border-border pl-3 pb-2">
                          {task}
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Executive Summary & Strategic Sections */}
        <div className="grid grid-cols-12 gap-4">
          {/* Profound Commentary */}
          <div className="col-span-12 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Brain className="w-20 h-20" />
               </div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                 <Brain className="w-3.5 h-3.5" />
                 Psychological Impression
               </h3>
               <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                 {report.psychologicalImpact}
               </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-info mb-3 flex items-center gap-2">
                 <TrendingUp className="w-3.5 h-3.5" />
                 Strategic Vision
               </h3>
               <p className="text-sm font-medium leading-relaxed text-foreground/80">
                 {report.strategicVision}
               </p>
            </div>
          </div>

          {/* SWAT Matrix */}
          <div className="col-span-12 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Strengths */}
                <div className="p-4 bg-success/5">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-success mb-3">Strengths</h4>
                   <ul className="space-y-2">
                      {report.swotAnalysis.strengths.map((s, i) => (
                        <li key={i} className="text-[11px] font-bold flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-success mt-1 shrink-0"></div>
                          {s}
                        </li>
                      ))}
                   </ul>
                </div>
                {/* Weaknesses */}
                <div className="p-4 bg-destructive/5">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive mb-3">Weaknesses</h4>
                   <ul className="space-y-2">
                      {report.swotAnalysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-[11px] font-bold flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0"></div>
                          {w}
                        </li>
                      ))}
                   </ul>
                </div>
                {/* Opportunities */}
                <div className="p-4 bg-info/5">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-info mb-3">Opportunities</h4>
                   <ul className="space-y-2">
                      {report.swotAnalysis.opportunities.map((o, i) => (
                        <li key={i} className="text-[11px] font-bold flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-info mt-1 shrink-0"></div>
                          {o}
                        </li>
                      ))}
                   </ul>
                </div>
                {/* Threats */}
                <div className="p-4 bg-warning/5">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-warning mb-3">Threats</h4>
                   <ul className="space-y-2">
                      {report.swotAnalysis.threats.map((t, i) => (
                        <li key={i} className="text-[11px] font-bold flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1 shrink-0"></div>
                          {t}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

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
            <Button 
              onClick={onRepairClick}
              className="relative z-10 bg-info hover:bg-info/90 text-white border-none rounded-lg h-9 px-6 text-[10px] font-black uppercase tracking-widest"
            >
              Repair My Digital Presence
            </Button>
          </div>
        </div>

        {/* Detailed Findings Grid - Elaborate */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Comprehensive Intelligence Log
            </h3>
            <Badge variant="outline" className="text-[8px] opacity-50">SHIELD-V2.0</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(report.categories).flatMap(([_, cat]) => cat.points).map((point, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${
                        point.status === 'pass' ? 'bg-success/10 text-success' : 
                        point.status === 'warning' ? 'bg-warning/10 text-warning' : 
                        'bg-destructive/10 text-destructive'
                      }`}>
                         {getStatusIcon(point.status)}
                      </div>
                      <div>
                         <h4 className="text-sm font-black tracking-tight text-foreground">{point.title}</h4>
                         <p className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1 uppercase tracking-tight">
                            <Globe className="w-2.5 h-2.5" />
                            {point.location}
                         </p>
                      </div>
                   </div>
                   {getImpactBadge(point.impact)}
                </div>

                <div className="space-y-4 flex-1">
                   <div>
                      <p className="text-[11px] font-medium leading-relaxed text-foreground/80 mb-3">
                         {point.description}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-3 border border-border/50 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-1 opacity-5">
                            <Brain className="w-8 h-8" />
                         </div>
                         <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1">Commercial Impact (The Why)</p>
                         <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic">
                            "{point.whyItMatters}"
                         </p>
                      </div>
                   </div>
                   
                   <div className="pt-2 border-t border-border/50">
                      <p className="text-[9px] font-black uppercase tracking-wider text-info mb-2 flex items-center gap-1">
                         <Zap className="w-2.5 h-2.5 fill-current" />
                         Technical Remediation (The How)
                      </p>
                      <p className="text-[11px] font-medium leading-relaxed text-foreground/70">
                         {point.fixStrategy}
                      </p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
