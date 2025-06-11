"use client";
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Copy, CheckCircle } from "lucide-react";

interface AcaPresentationSlidesProps {
  className?: string;
}

export default function AcaPresentationSlides({ className = "" }: AcaPresentationSlidesProps) {
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [objectionModalOpen, setObjectionModalOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [objectionResponse, setObjectionResponse] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isGeneratingObjection, setIsGeneratingObjection] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [partnerProfession, setPartnerProfession] = useState('P&C Agent');
  const [objectionInput, setObjectionInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleScript = (scriptId: string) => {
    setExpandedScript(expandedScript === scriptId ? null : scriptId);
  };

  const generatePartnershipEmail = async () => {
    if (!agentName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setIsGeneratingEmail(true);
    
    try {
      // Fallback email template since API endpoints aren't set up yet
      setGeneratedEmail(`Subject: Partnership Opportunity - ACA Health Insurance Referrals

Dear [${partnerProfession} Name],

I hope this email finds you well. My name is ${agentName}, and I specialize in helping individuals and families navigate the Affordable Care Act (ACA) marketplace to find the right health insurance coverage.

I'm reaching out because I know you work with many clients who are self-employed, between jobs, or running small businesses without group health coverage. These clients often need individual health insurance solutions, but this isn't your area of focus.

I'd like to propose a partnership where I can serve as your go-to resource for ACA health insurance needs. Here's how this benefits you and your clients:

• You can help your clients solve a critical problem without adding a new product line
• Your clients get expert guidance from a licensed ACA specialist
• You maintain your client relationships by providing complete solutions
• I offer referral compensation for successful enrollments

This partnership allows you to focus on what you do best while ensuring your clients get the health coverage they need.

Would you be available for a brief 10-15 minute call this week to discuss how we can work together? I'm confident this partnership will add value for both of us and, most importantly, for your clients.

Best regards,
${agentName}
[Your Phone Number]
[Your Email]

P.S. I handle all the complexity of ACA enrollment, so your clients get professional service without any additional work on your part.`);
    } catch (error) {
      console.error('Error generating email:', error);
      setGeneratedEmail('Error generating email. Please try again.');
    }
    
    setIsGeneratingEmail(false);
    setEmailModalOpen(true);
  };

  const handleObjection = async () => {
    if (!objectionInput.trim()) {
      alert('Please enter a client objection.');
      return;
    }

    setIsGeneratingObjection(true);
    
    try {
      // Fallback response template since API endpoints aren't set up yet
      setObjectionResponse(`**Response Option 1: The Agreement Approach**
I completely understand that concern - you're absolutely right to think about the deductible. That's exactly why smart people like you need to look at the complete picture. Let me ask you this: What would happen to your family's finances if you had a $50,000 medical emergency with no insurance versus a $7,000 deductible with insurance? The deductible isn't the enemy - it's your maximum out-of-pocket protection.

**Response Option 2: The Reality Check**
You know what? That's the same thing I thought before I really understood how this works. Here's what I've learned from helping hundreds of families: The deductible only matters if you use it, but the catastrophic protection matters every single day. Can I show you how we can address that deductible concern with a supplemental accident plan that costs less than your monthly coffee budget?

**Response Option 3: The Perspective Shift**
That's a great question, and it tells me you're thinking like a smart consumer. But let me flip this around - what's the deductible on having no insurance at all? It's 100% of everything. This plan caps your risk at $7,000 maximum. Without it, there is no cap. Which scenario gives you more control over your financial future?`);
    } catch (error) {
      console.error('Error handling objection:', error);
      setObjectionResponse('Error generating response. Please try again.');
    }
    
    setIsGeneratingObjection(false);
    setObjectionModalOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const ScriptBox = ({ scriptId, children }: { scriptId: string; children: React.ReactNode }) => (
    <div className="mt-8 text-center">
      <Button 
        onClick={() => toggleScript(scriptId)}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {expandedScript === scriptId ? 'Collapse Presenter Script' : 'Expand Presenter Script'}
      </Button>
      {expandedScript === scriptId && (
        <div className="mt-6 bg-muted p-6 rounded-lg border-l-4 border-accent text-left">
          <h4 className="font-bold text-lg mb-2 text-foreground">Presenter Script:</h4>
          <div className="text-muted-foreground">{children}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-foreground tracking-tight">The ACA Goldmine</h1>
        <p className="text-2xl text-primary font-semibold mt-2">Your In-Depth Guide to Dominating the Under-65 Health Market</p>
      </header>

      {/* Ready to Calculate Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 py-8 mb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Ready to Calculate Your Potential?</h2>
          <p className="text-lg text-muted-foreground">Use our interactive calculator below to model your ACA business projections</p>
          <div className="mt-4">
            <button 
              onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Jump to Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Slide 1: Title */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 1 of 21: TITLE</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">The ACA Goldmine: A Deep Dive into the Under-65 Health Market</h2>
        <p className="text-center text-xl text-muted-foreground">A Business-Building Opportunity for Insurance Agents</p>
        <ScriptBox scriptId="script1">
          <p>"Welcome. The title of this presentation is 'The ACA Goldmine,' and that is not an exaggeration. The purpose of our time today is to give you a comprehensive blueprint for building a significant book of business in the Affordable Care Act, or ACA, market. We will demonstrate why this is one of the most stable and lucrative markets for an independent agent today. We're not talking about theory; we're talking about a practical, step-by-step system for adding a reliable, high-volume revenue stream to your business. If you're ready to learn how to do that, you are in the correct place."</p>
        </ScriptBox>
      </Card>

      {/* Slide 2: Agenda */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 2 of 21: AGENDA</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">What We Will Cover Today</h2>
        <ul className="list-disc list-inside text-xl space-y-3 mx-auto max-w-2xl text-muted-foreground">
          <li><b>The Market Opportunity:</b> Why ACA, and why now?</li>
          <li><b>The Financials:</b> A detailed look at commissions, bonuses, and scaling your income.</li>
          <li><b>The Prospecting Blueprint:</b> Four pillars for generating unlimited, low-cost leads.</li>
          <li><b>The Art of the Sale:</b> How to double revenue per household with effective packaging.</li>
          <li><b>Your Action Plan:</b> A 30-day guide to your first ACA sale.</li>
        </ul>
        <ScriptBox scriptId="script2">
          <p>"Here is our roadmap. We'll start with the 'why'—analyzing the market to understand the sheer scale of this opportunity. Then, we'll get to the part everyone is interested in: a deep dive into the numbers. We'll show you how you get paid, how bonuses work, and how to scale that income to significant levels. The third section is the most critical for execution: a detailed, actionable plan for lead generation, so you never have to wonder where your next client is coming from. From there, we'll move into sales strategy and how to maximize your revenue. We will conclude with a clear, step-by-step plan you can implement the moment you leave this room."</p>
        </ScriptBox>
      </Card>

      {/* Section Break: THE OPPORTUNITY */}
      <h3 className="text-3xl font-bold text-center text-muted-foreground my-12 tracking-widest">SECTION 1: THE OPPORTUNITY</h3>

      {/* Slide 3: Why ACA, Why Now? */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 3 of 21: THE MARKET</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Why ACA? Why Now?</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">The individual health insurance market is not a niche; it is a permanent and growing fixture of the American economy. Millions of people do not have access to group coverage and rely on the ACA marketplace.</p>
        <ul className="mt-6 text-center text-2xl space-y-2 font-semibold">
          <li className="text-green-600">Record-breaking enrollment year after year.</li>
          <li className="text-green-600">Enhanced subsidies make plans more affordable than ever.</li>
          <li className="text-green-600">A consistent, government-supported marketplace.</li>
        </ul>
        <ScriptBox scriptId="script3">
          <p>"First, let's address the stability and size of this market. The Affordable Care Act is established law. Last year, over 21 million Americans enrolled in a marketplace plan—a record high. This isn't a fluke. The rise of the gig economy, early retirees, and small businesses that don't offer group plans means this market is continuously growing. Furthermore, recent legislation has enhanced the subsidies, meaning more people qualify for plans that cost less than their monthly cell phone bill, and many pay a zero-dollar premium. This creates a massive, consistent, and highly motivated client base that desperately needs our professional guidance to navigate their options."</p>
        </ScriptBox>
      </Card>

      {/* Slide 4: Debunking the Myths */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 4 of 21: DEBUNKING MYTHS</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Common Myths vs. Market Reality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-red-800">Myth: "It's too complicated."</h3>
            <p className="text-red-700 mt-2"><b>Reality:</b> Modern quoting platforms have turned a complex process into a simple, step-by-step workflow. If you can follow a checklist, you can enroll an ACA client in under 20 minutes.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800">Myth: "It doesn't pay well."</h3>
            <p className="text-green-700 mt-2"><b>Reality:</b> The flat-dollar, recurring PMPM model, combined with massive bonuses and ancillary sales, makes this one of the most profitable lines of business an agent can write.</p>
          </div>
        </div>
        <ScriptBox scriptId="script4">
          <p>"Many agents avoid this market due to outdated misconceptions. The first is that it's overly complex. Ten years ago, that may have been true. Today, with modern platforms like HealthSherpa, you can quote, compare, and enroll a client through a guided workflow that handles all the calculations for you. It's formulaic and teachable. The second myth is that it doesn't pay well. This is demonstrably false, born from agents who don't understand the model. Agents who dismiss this market are leaving a six-figure income stream on the table. We will now prove that."</p>
        </ScriptBox>
      </Card>

      {/* Section Break: THE FINANCIALS */}
      <h3 className="text-3xl font-bold text-center text-muted-foreground my-12 tracking-widest">SECTION 2: THE FINANCIALS</h3>

      {/* Slide 5: Core Compensation */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 5 of 21: COMPENSATION</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Core Compensation: Per Member Per Month</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">ACA carrier compensation is typically a flat-dollar amount for each person enrolled, per month. This model provides a predictable and recurring revenue stream.</p>
        <div className="text-center mt-6 bg-primary/10 p-8 rounded-lg">
          <p className="text-2xl text-muted-foreground">A typical PMPM commission is:</p>
          <p className="text-6xl font-black text-primary mt-4">$18 - $25+</p>
          <p className="text-2xl text-muted-foreground mt-2">Per Member, Per Month</p>
        </div>
        <ScriptBox scriptId="script5">
          <p>"Let's get into the mechanics of the compensation. Unlike percentage-based commissions that fluctuate with premiums, most ACA carriers pay on a 'Per Member Per Month' basis. It's a simple, flat-dollar amount that's easy to track and project. You get paid the same for a healthy 25-year-old as you do for a 55-year-old with pre-existing conditions. This predictability is a powerful advantage for financial planning. For our examples today, we will use a conservative, real-world figure of $20 PMPM."</p>
        </ScriptBox>
      </Card>

      {/* Slide 6: Family of Four */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 6 of 21: THE MATH IN ACTION</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Case Study: The "Family of Four"</h2>
        <div className="text-center bg-muted p-8 rounded-lg">
          <p className="text-2xl text-muted-foreground">Commission of <span className="font-bold text-primary text-3xl">$20</span> Per Member Per Month</p>
          <div className="text-5xl font-bold text-muted-foreground my-4">×</div>
          <p className="text-2xl text-muted-foreground"><span className="font-bold text-primary text-3xl">4</span> Family Members</p>
          <div className="text-5xl font-bold text-muted-foreground my-4">=</div>
          <p className="text-4xl font-bold text-green-600">$80 / Month</p>
          <p className="text-5xl font-black text-green-700 mt-6">$960 / Year</p>
          <p className="text-xl text-muted-foreground italic mt-2">This is recurring annual income from a single client household.</p>
        </div>
        <ScriptBox scriptId="script6">
          <p>"Here is the math on your most common client type: a typical family of four. At our conservative $20 PMPM, four members generate $80 per month in commission. Annually, that is $960. Think about that. Nearly one thousand dollars in recurring income from a single household. This isn't a one-time payment; it's as-earned, it's passive after the initial enrollment, and it renews year after year, forming the bedrock of a very profitable book of business. This is your primary unit of measurement for success in this market."</p>
        </ScriptBox>
      </Card>

      {/* Slide 7: Scaling */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 7 of 21: SCALING INCOME</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Scaling Your Income: The Power of Volume</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800">10 Families</h3>
            <p className="text-4xl font-black text-blue-600 mt-2">$9,600 / yr</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800">50 Families</h3>
            <p className="text-4xl font-black text-green-600 mt-2">$48,000 / yr</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-yellow-800">100 Families</h3>
            <p className="text-4xl font-black text-yellow-600 mt-2">$96,000 / yr</p>
          </div>
        </div>
        <p className="text-center text-lg text-muted-foreground mt-6">This illustrates the scalability based only on the core ACA commission.</p>
        <ScriptBox scriptId="script7">
          <p>"A single sale is good, but the business model is built on scalable volume. Ten families generate nearly $10,000 in annual income—a respectable side income. Fifty families generate close to $50,000, which is a full-time salary for many people. And one hundred families produce nearly six figures in recurring revenue. This is before we account for bonuses or any additional ancillary products. These numbers are not lottery wins; they are achievable goals for any agent who dedicates focused effort to this market."</p>
        </ScriptBox>
      </Card>

      {/* Slide 8: Bonuses */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 8 of 21: BONUSES</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">The Year-End Windfall: Carrier Bonuses</h2>
        <div className="text-center bg-green-50 p-8 rounded-lg">
          <p className="text-2xl text-muted-foreground">Carriers offer aggressive bonuses to acquire new members. A common structure is:</p>
          <p className="text-2xl text-muted-foreground mt-4">Enroll <span className="font-bold text-green-600 text-3xl">100</span> Individuals...</p>
          <p className="text-2xl text-muted-foreground mt-2">...and receive a bonus of</p>
          <p className="text-6xl font-black text-green-700 mt-4">$10,000 - $15,000+</p>
          <p className="text-xl text-muted-foreground italic mt-4">This bonus is paid on top of your monthly commissions.</p>
        </div>
        <ScriptBox scriptId="script8">
          <p>"On top of your standard commissions, carriers offer substantial bonuses during the Open Enrollment Period. These are designed to incentivize high production. Enrolling 100 individuals—which is just 25 families of four—can trigger bonuses of $10,000, $15,000, or more, depending on the carrier. Think of this as a business accelerator. You do the work to build your recurring commission base, and the carrier gives you a massive cash injection as a reward. This is how you pay off debt, hire an assistant, or take a real vacation."</p>
        </ScriptBox>
      </Card>

      {/* Section Break: PROSPECTING */}
      <h3 className="text-3xl font-bold text-center text-muted-foreground my-12 tracking-widest">SECTION 3: THE PROSPECTING BLUEPRINT</h3>

      {/* Slide 9: Prospecting Intro */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 9 of 21: PROSPECTING</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">The Prospecting Problem... Solved</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">This section provides a multi-pronged strategy for lead generation. A successful agent does not rely on a single lead source; they build a system.</p>
        <p className="mt-6 text-center text-2xl font-semibold text-primary">We will detail the four pillars of ACA lead generation.</p>
        <ScriptBox scriptId="script9">
          <p>"This is the section that separates theory from practice. You know the money is there, but the persistent question for every agent is, 'How do I find enough clients?' What we are about to provide is not a list of ideas; it's a complete system based on four distinct, actionable pillars. If you build your business on these four pillars, you will create a consistent, year-round flow of new prospects and never have to worry about where your next client will come from."</p>
        </ScriptBox>
      </Card>

      {/* Slide 10: Pillar 1 */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 10 of 21: PILLAR 1</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Pillar 1: Your Warm Market Goldmine</h2>
        <ul className="list-disc list-inside text-xl space-y-3 mx-auto max-w-2xl text-muted-foreground">
          <li><b>Your Current Book:</b> Inform all your existing clients (auto, home, life, Medicare) that you now offer individual health solutions. This is your easiest cross-sell.</li>
          <li><b>Old Leads:</b> Re-engage every lead you didn't close on another product. Their circumstances may have changed, making them a perfect fit for ACA.</li>
          <li><b>Referrals:</b> Systematically ask every satisfied client for referrals to friends, family, and colleagues who may need coverage.</li>
        </ul>
        <ScriptBox scriptId="script10">
          <p>"Your first and most profitable source of leads is the database of people who already know, like, and trust you. You must have a process to contact every client in your current book of business and inform them of this new service. Your homework is to draft that email this week. Next, export a list of every lead you've ever had that didn't close. A 'no' for a life insurance policy last year is often a 'yes' for a health plan today. Finally, you must build a referral process. At the end of every enrollment, ask a simple question: 'Who else do you know that is self-employed or without work coverage that I could help?'"</p>
        </ScriptBox>
      </Card>

      {/* Slide 11: Pillar 2 */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 11 of 21: PILLAR 2</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Pillar 2: The Partnership Engine (P&C)</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">Property & Casualty agents are sitting on hundreds of clients they cannot help with health insurance. You can become their go-to partner.</p>
        <div className="mt-6 p-6 bg-muted rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-foreground">The Approach Script:</h4>
          <p className="text-muted-foreground italic">"Hi [P&C Agent Name], my name is [Your Name]. I specialize in ACA health plans. I know you work with many self-employed individuals and business owners who can't get group coverage. I'd like to be your resource for that. For any client you send my way that I enroll, I'd be happy to set up a referral agreement. It allows you to help your clients without adding a new product line. When is a good time for a quick 10-minute chat?"</p>
        </div>
        <ScriptBox scriptId="script11">
          <p>"This pillar is a source of free, high-quality leads. P&C agents are laser-focused on home, auto, and commercial liability. Health insurance is a distraction they are not licensed for and do not want to handle. You are not asking them for a favor; you are offering a solution. You help them retain their clients by solving a problem, and you create a new revenue stream for yourself. A simple, professional approach offering a referral fee is a proven strategy for generating a steady stream of business. Your goal should be to build a network of 5-10 P&C partners."</p>
        </ScriptBox>
      </Card>

      {/* Slide 12: Pillar 3 with AI Email Generator */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 12 of 21: PILLAR 3</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Pillar 3: AI-Powered Professional Partnerships</h2>
        <ul className="list-disc list-inside text-xl space-y-4 mx-auto max-w-3xl text-muted-foreground">
          <li><b>CPAs & Tax Preparers:</b> Their clients receive the 1095-A tax form and often have questions. Become the expert they can refer clients to.</li>
          <li><b>Doctors & Dentists:</b> Network with office managers. Offer to help their uninsured patients find plans that the practice accepts.</li>
        </ul>
        <div className="mt-8 p-6 bg-primary/10 border-2 border-dashed border-primary/20 rounded-lg">
          <h3 className="text-xl font-bold text-center text-primary">✨ AI Partnership Email Generator</h3>
          <p className="text-center text-primary/80 mt-2">Instantly create a professional outreach email tailored to any profession.</p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Select value={partnerProfession} onValueChange={setPartnerProfession}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P&C Agent">P&C Agent</SelectItem>
                <SelectItem value="CPA / Tax Preparer">CPA / Tax Preparer</SelectItem>
                <SelectItem value="Doctor's Office Manager">Doctor's Office Manager</SelectItem>
                <SelectItem value="Real Estate Agent">Real Estate Agent</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Your Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full sm:w-auto"
            />
            <Button
              onClick={generatePartnershipEmail}
              disabled={isGeneratingEmail}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isGeneratingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">Generate Email</span>
                  ✨
                </>
              )}
            </Button>
          </div>
        </div>
        <ScriptBox scriptId="script12">
          <p>"Beyond P&C agents, your network of professional partners is key. We've even built an AI tool to make this easier. Instead of just giving you a generic script, this tool will write a personalized, professional email for you. You can select the profession, enter your name, and our system uses advanced AI to craft the perfect outreach message. This demonstrates how technology can accelerate your business-building efforts, taking the guesswork out of professional communication."</p>
        </ScriptBox>
      </Card>

      {/* Slide 13: Pillar 4 */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 13 of 21: PILLAR 4</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Pillar 4: Community & Digital Outreach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold text-foreground">Community Marketing</h3>
            <p className="mt-2 text-muted-foreground">Set up a professional table at local flea markets, farmers markets, and community events. This low-cost strategy provides high visibility in your target demographic.</p>
          </div>
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-bold text-foreground">Digital & Government Leads</h3>
            <p className="mt-2 text-muted-foreground"><b>Facebook Ads:</b> Can generate qualified leads for as low as $7-10 with the right strategy or essentially purchase client acquisition opportunities with our media buying partners. Reference calculator below. <br/><b>Help on Demand:</b> A FREE lead program from Healthcare.gov that routes local consumers seeking help directly to your phone.</p>
          </div>
        </div>
        <ScriptBox scriptId="script13">
          <p>"Finally, we have direct outreach. On the ground, this means being visible in your community. A simple table with a banner at a local event can generate dozens of conversations. Digitally, there are two paths. You can learn to generate your own leads via Facebook, which is a great long-term skill. Or, if you want to scale faster, you can work with media buying partners to purchase client acquisition opportunities. This is not just buying a list of names; it's investing in a predictable system.</p>
          <p className="mt-2">For example, look at the math from a typical lead-buying scenario. An agent might invest $4,000 to acquire 100 leads. Out of those, they might convert 40 new clients. At our $20 PMPM commission, that's $800 in new monthly recurring revenue. While the first month shows a net loss because of the investment, the recurring commission means the agent breaks even by month five. By the end of the year, that initial $4,000 investment has turned into $5,600 of pure profit, with the $800 per month still coming in. This is how you treat marketing as an investment, not an expense. And of course, you must sign up for 'Help on Demand' to get free government leads."</p>
        </ScriptBox>
      </Card>

      {/* Section Break: THE SALE */}
      <h3 className="text-3xl font-bold text-center text-muted-foreground my-12 tracking-widest">SECTION 4: THE ART OF THE SALE</h3>

      {/* Slide 14: Upsell Intro */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 14 of 21: SALES STRATEGY</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">The Upsell Multiplier: Solving the Whole Problem</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">Top producers understand that the ACA health plan is the foundation, not the complete solution. True value—and profit—comes from identifying and filling the gaps in coverage.</p>
        <p className="mt-6 text-center text-2xl font-semibold text-primary">Do not sell a policy. Sell a package.</p>
        <ScriptBox scriptId="script14">
          <p>"Once you have a prospect, your sales strategy is critical. This is what separates the average agent from the six-figure earner. Average agents sell a health plan. Top agents sell a comprehensive package that solves the client's entire problem. Selling just the ACA plan is like a builder putting up the frame of a house but leaving without the roof or windows. You've done part of the job, but the client is still exposed. Your job is to identify those exposures and present a complete solution."</p>
        </ScriptBox>
      </Card>

      {/* Slide 15: The Perfect Package */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 15 of 21: THE PERFECT PACKAGE</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Anatomy of the Perfect Package</h2>
        <div className="mt-6 p-6 bg-muted rounded-lg">
          <ul className="text-lg mt-4 space-y-4">
            <li><span className="text-xl font-bold text-green-600">Component 1: The ACA Plan.</span> This is your foundation. It covers major medical, doctor visits, and prescriptions.</li>
            <li><span className="text-xl font-bold text-primary">Component 2: Dental & Vision.</span> ACA plans do not typically cover adult dental or vision. This is an easy and necessary addition for almost every client.</li>
            <li><span className="text-xl font-bold text-primary">Component 3: Accident & Sickness Plans.</span> This addresses the primary weakness of an ACA plan: the high deductible. An accident plan provides a lump-sum cash benefit to cover out-of-pocket costs.</li>
          </ul>
        </div>
        <ScriptBox scriptId="script15">
          <p>"This is the three-part package you should present to every client. First, the core health plan. This is the easy part. Second, a dental and vision plan. The pivot is simple: 'Now that we've secured your health coverage, let's make sure we protect your teeth and eyes, since this plan doesn't cover that for adults.' Third, and most importantly, you must address the deductible with an accident or sickness plan. You say, 'The great news is your plan covers 100% after your deductible. The challenge is that the deductible is $7,000. This accident plan is designed to give you a check to cover that, so a broken leg doesn't break your bank account.' This isn't upselling; it's proper financial advising."</p>
        </ScriptBox>
      </Card>

      {/* Slide 16: Revenue Case Study */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 16 of 21: REVENUE CASE STUDY</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Case Study: Doubling Your Revenue Per Household</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800">ACA Plan Only</h3>
            <p className="text-lg text-muted-foreground">(Family of 4 @ $20 PMPM)</p>
            <p className="text-4xl font-black text-blue-600 mt-4">$960 / yr</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800">Full Package</h3>
            <p className="text-lg text-muted-foreground">(ACA + Dental/Vision + Accident)</p>
            <p className="text-4xl font-black text-green-600 mt-4">$1,560 / yr</p>
            <p className="text-lg font-bold text-green-700 mt-2">(+$600)</p>
          </div>
        </div>
        <ScriptBox scriptId="script16">
          <p>"Here is the financial impact of that superior strategy. The agent who sells only the ACA plan makes their $960 from that family. The agent who sells the complete package might add another $30 a month in commission for dental/vision and $20 a month for an accident plan. That's an extra $50 a month, or $600 a year. Let me be clear: this isn't just a 60% increase in revenue. It's a 60% increase in revenue for the *same amount of prospecting work*. You acquire the client once and you are paid multiple times, all while providing better protection. This is how you work smarter, not just harder."</p>
        </ScriptBox>
      </Card>

      {/* Slide 17: Tools */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 17 of 21: TOOLS OF THE TRADE</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Setting Up Your Business for Success</h2>
        <ul className="list-disc list-inside text-xl space-y-3 mx-auto max-w-2xl text-muted-foreground">
          <li><b>Quoting & Enrollment Platform:</b> Utilize a modern platform (like HealthSherpa or a carrier portal) to easily compare plans and submit applications.</li>
          <li><b>Customer Relationship Manager (CRM):</b> A simple CRM is essential for tracking leads, follow-ups, and client information.</li>
          <li><b>Basic Marketing Materials:</b> Professional business cards, simple one-page flyers explaining your service, and a branded tablecloth for events.</li>
        </ul>
        <ScriptBox scriptId="script17">
          <p>"To execute this high-volume strategy, you need to be efficient. You can't run a six-figure business on sticky notes. First, you need a modern enrollment platform. This is non-negotiable. It makes the technical process simple and fast. Second, you must use a CRM. It doesn't need to be complex, but you need a system to manage your pipeline, track follow-ups, and service your clients. A CRM is not an expense; it's an investment that prevents you from losing thousands of dollars in forgotten follow-ups. Finally, invest in basic, professional marketing materials. They legitimize your business and make a strong first impression."</p>
        </ScriptBox>
      </Card>

      {/* Slide 18: AI Objection Handler */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 18 of 21: AI-POWERED COACHING</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Handling Tough Questions with AI</h2>
        <p className="text-center text-xl text-muted-foreground max-w-3xl mx-auto">Use this tool to get instant, effective responses to common client objections.</p>
        <div className="mt-8 p-6 bg-primary/10 border-2 border-dashed border-primary/20 rounded-lg">
          <Label htmlFor="objectionInput" className="block text-lg font-semibold text-primary">Enter a client objection or question:</Label>
          <Textarea
            id="objectionInput"
            rows={3}
            className="w-full mt-2"
            placeholder="e.g., 'The deductible is too high, I'll just risk it.' or 'Why can't I just keep my old plan?'"
            value={objectionInput}
            onChange={(e) => setObjectionInput(e.target.value)}
          />
          <Button
            onClick={handleObjection}
            disabled={isGeneratingObjection}
            className="mt-4 w-full bg-primary hover:bg-primary/90"
          >
            {isGeneratingObjection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Responses...
              </>
            ) : (
              <>
                ✨ Get Gitomer-Style Responses
              </>
            )}
          </Button>
        </div>
        <ScriptBox scriptId="script18">
          <p>"Every agent faces tough questions. What sets top producers apart is their ability to answer them with confidence. To help you, we've integrated an AI-powered objection handler. Let's try it. Who has a common objection you hear from clients? (Take an example from the audience). I'll type it in here... and now our advanced AI system, trained in the style of sales guru Jeffrey Gitomer, is generating several compliant, scripted ways to handle that exact situation. This is like having a sales coach in your pocket during every client meeting."</p>
        </ScriptBox>
      </Card>

      {/* Section Break: ACTION PLAN */}
      <h3 className="text-3xl font-bold text-center text-muted-foreground my-12 tracking-widest">SECTION 5: YOUR ACTION PLAN</h3>

      {/* Slide 19: 30-Day Launch */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 19 of 21: YOUR LAUNCH PLAN</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Your 30-Day Launch Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Week 1: Foundations</h3>
            <ul className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Complete your free FFM certification.</li>
              <li>Get contracted with our 3 core ACA carriers.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Week 2: Outreach Prep</h3>
            <ul className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Draft your email to your book of business.</li>
              <li>Compile a list of 10 local P&C agents to contact.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Week 3: Initial Contact</h3>
            <ul className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Send your email & start calling clients.</li>
              <li>Contact the 10 P&C agents.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Week 4: First Sale Goal</h3>
            <ul className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Book appointments from your outreach.</li>
              <li>Write your first complete ACA package.</li>
            </ul>
          </div>
        </div>
        <ScriptBox scriptId="script19">
          <p>"Information is useless without action. Here is a simple, 30-day plan to eliminate procrastination. In the first week, you handle the non-negotiable administrative tasks: get certified online for free, and submit contracting with our recommended carriers. In week two, you prepare your assets: write the email to your client list and research 10 local P&C agents to create your target list. In week three, you execute. The emails go out, the calls are made. By week four, the activity from week three should result in appointments, and your only goal is to write your first complete ACA package. This is an achievable, momentum-building timeline."</p>
        </ScriptBox>
      </Card>

      {/* Slide 20: Why Us */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl">
        <div className="text-lg font-bold text-muted-foreground mb-4">SLIDE 20 of 21: PARTNERSHIP</div>
        <h2 className="text-4xl font-extrabold text-foreground text-center mb-8">Why Partner With Us?</h2>
        <ul className="list-disc list-inside text-xl space-y-3 mx-auto max-w-2xl text-muted-foreground">
          <li><b>Top-Tier Contracts:</b> Access to the most competitive carriers and commission schedules.</li>
          <li><b>Proven Training & AI Tools:</b> We provide the scripts, systems, AI-powered tools, and support you need to implement this plan.</li>
          <li><b>Lead Programs:</b> Access to our preferred vendors for digital marketing and other lead sources.</li>
          <li><b>A Community of Producers:</b> Work with a team of agents who are actively succeeding in this market.</li>
        </ul>
        <ScriptBox scriptId="script20">
          <p>"You can certainly take this information and try to implement it on your own. But it's faster, easier, and more profitable with a dedicated partner. We provide access to top-level carrier contracts so you get paid the maximum commission. We provide in-depth training on this exact system, including the AI tools you've seen today. We connect you with our vetted lead vendors and give you access to a community of other agents who are sharing what works right now. We are invested in your ability to build a profitable book of business in this market, because your success is our success."</p>
        </ScriptBox>
      </Card>

      {/* Slide 21: Q&A */}
      <Card className="mb-12 p-8 border-t-8 border-t-primary shadow-xl bg-primary">
        <div className="text-lg font-bold text-primary-foreground/80 mb-4">SLIDE 21 of 21: NEXT STEPS</div>
        <h2 className="text-4xl font-extrabold text-primary-foreground text-center mb-8">Questions & Next Steps</h2>
        <p className="text-center text-xl text-primary-foreground/90">The next step is to schedule a one-on-one strategy call to discuss your business and begin the contracting process.</p>
        <ScriptBox scriptId="script21">
          <p>"That concludes the formal presentation. I will now open it up for any questions you might have about the market, the compensation, or the strategies we've discussed. For those of you who see the opportunity here and are ready to move forward, the next step is to schedule a one-on-one strategy call with our team. On that call, we can answer your specific questions and get you started with the contracting paperwork to get appointed with our core carriers. Thank you for your time and attention."</p>
        </ScriptBox>
      </Card>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Partnership Email</DialogTitle>
          </DialogHeader>
          <Textarea
            value={generatedEmail}
            readOnly
            rows={15}
            className="bg-muted"
          />
          <Button
            onClick={() => copyToClipboard(generatedEmail)}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Objection Modal */}
      <Dialog open={objectionModalOpen} onOpenChange={setObjectionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Objection Responses</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{
              __html: objectionResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>
          <Button
            onClick={() => copyToClipboard(objectionResponse)}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
