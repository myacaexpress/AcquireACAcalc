
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FinancialInputsCard from '@/components/sections/FinancialInputsCard';
import SummaryDisplay from '@/components/sections/SummaryDisplay';
import ProjectionChart from '@/components/charts/ProjectionChart';
import MonthlyBreakdownTable from '@/components/tables/MonthlyBreakdownTable';
import AskJohnChat from '@/components/sections/AskJohnChat';
import PodcastWidget from '@/components/sections/PodcastWidget';
import AcaPresentationSlides from '@/components/sections/AcaPresentationSlides';

export interface ProjectionMonthData {
  month: string;
  leadsPurchased: number;
  newSales: number;
  ntmSalesCount: number;
  aorSalesCount: number;
  totalActiveSubscriptions: number;
  revenue: number;
  leadCosts: number;
  enrollmentCosts: number;
  totalExpenses: number;
  monthlyProfit: number;
  cumulativeProfit: number;
}

export interface SummaryMetrics {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  breakEvenMonth: string;
  maxProfit: number;
  maxLoss: number;
}

export default function ACACalculatorPage() {
  const [leadPurchaseType, setLeadPurchaseType] = useState('oneTime');
  const [leadsPurchasedInput, setLeadsPurchasedInput] = useState<string | number>(100);
  const [leadCost, setLeadCost] = useState<string | number>(40);
  const [newToMarketplacePercentage, setNewToMarketplacePercentage] = useState<string | number>(35);
  const [aorConversionType, setAorConversionType] = useState('oneTime');
  const [aorConversionsInput, setAorConversionsInput] = useState<string | number>(5);
  const [recurringCommission, setRecurringCommission] = useState<string | number>(20);
  const [newEnrollmentCost, setNewEnrollmentCost] = useState<string | number>(0);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [projectionData, setProjectionData] = useState<ProjectionMonthData[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setter('');
    } else {
      const numericValue = e.target.type === 'number' && (e.target.step === "0.01" || e.target.name?.toLowerCase().includes('cost') || e.target.name?.toLowerCase().includes('percentage'))
        ? parseFloat(value)
        : parseInt(value, 10);
      setter(isNaN(numericValue) ? '' : Math.max(0, numericValue));
    }
  };
  
  const handlePercentageChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (value === '') {
      setter('');
    } else {
      const numericValue = parseFloat(value);
      setter(isNaN(numericValue) ? '' : Math.max(0, Math.min(100, numericValue)));
    }
  };


  useEffect(() => {
    setIsCalculating(true);
    const calculateProjection = () => {
      let cumulativeProfit = 0;
      let totalActiveSubscriptions = 0;
      const data: ProjectionMonthData[] = [];
      
      const isOneTimeLeadPurchase = leadPurchaseType === 'oneTime';
      const isOneTimeAorConversion = aorConversionType === 'oneTime';

      const numLeadsInput = Number(leadsPurchasedInput) || 0;
      const numNtmPercent = (Number(newToMarketplacePercentage) || 0) / 100;
      const numAorInput = Number(aorConversionsInput) || 0;
      const numRecCommission = Number(recurringCommission) || 0;
      const numLeadCost = Number(leadCost) || 0;
      const numEnrollCost = Number(newEnrollmentCost) || 0;

      for (let month = 1; month <= 12; month++) {
        let actualLeadsPurchasedThisMonth = 0;
        if (isOneTimeLeadPurchase) {
          actualLeadsPurchasedThisMonth = (month === 1) ? numLeadsInput : 0;
        } else { 
          actualLeadsPurchasedThisMonth = numLeadsInput;
        }

        let actualAorSalesThisMonth = 0;
        if (isOneTimeAorConversion) {
          actualAorSalesThisMonth = (month === 1) ? numAorInput : 0;
        } else {
          actualAorSalesThisMonth = numAorInput;
        }
        
        const ntmSales = actualLeadsPurchasedThisMonth * numNtmPercent;
        const totalNewSalesThisMonth = Math.floor(ntmSales + actualAorSalesThisMonth);
        
        totalActiveSubscriptions += totalNewSalesThisMonth;

        const monthlyRevenue = totalActiveSubscriptions * numRecCommission;
        const monthlyLeadCosts = actualLeadsPurchasedThisMonth * numLeadCost;
        const monthlyEnrollmentCosts = totalNewSalesThisMonth * numEnrollCost; 
        const totalMonthlyExpenses = monthlyLeadCosts + monthlyEnrollmentCosts; 
        const monthlyNetProfit = monthlyRevenue - totalMonthlyExpenses;
        cumulativeProfit += monthlyNetProfit;

        data.push({
          month: `Month ${month}`,
          leadsPurchased: actualLeadsPurchasedThisMonth,
          newSales: totalNewSalesThisMonth,
          ntmSalesCount: Math.floor(ntmSales),
          aorSalesCount: actualAorSalesThisMonth, 
          totalActiveSubscriptions,
          revenue: monthlyRevenue,
          leadCosts: monthlyLeadCosts,
          enrollmentCosts: monthlyEnrollmentCosts, 
          totalExpenses: totalMonthlyExpenses,
          monthlyProfit: monthlyNetProfit,
          cumulativeProfit: cumulativeProfit,
        });
      }
      setProjectionData(data);
      setIsCalculating(false);
    };
    
    const allInputsValid = [
      leadsPurchasedInput, leadCost, newToMarketplacePercentage,
      aorConversionsInput, recurringCommission, newEnrollmentCost
    ].every(val => val !== '' && Number(val) >= 0);


    if (allInputsValid) {
      calculateProjection();
    } else {
      setProjectionData(Array(12).fill({}).map((_, i) => ({
        month: `Month ${i + 1}`,
        leadsPurchased: 0, newSales: 0, ntmSalesCount: 0, aorSalesCount: 0, totalActiveSubscriptions: 0, revenue: 0,
        leadCosts: 0, enrollmentCosts: 0, totalExpenses: 0, monthlyProfit: 0, cumulativeProfit: 0 
      })));
      setIsCalculating(false);
    }
  }, [
      leadsPurchasedInput, leadCost, newToMarketplacePercentage, 
      aorConversionsInput, recurringCommission, newEnrollmentCost, 
      leadPurchaseType, aorConversionType
    ]);

  const summaryMetrics = useMemo<SummaryMetrics>(() => {
    if (!projectionData || projectionData.length === 0) {
      return { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, breakEvenMonth: 'N/A', maxProfit: 0, maxLoss: 0 };
    }
    const totalRevenue = projectionData.reduce((sum, month) => sum + (month.revenue || 0), 0);
    const totalExpenses = projectionData.reduce((sum, month) => sum + (month.totalExpenses || 0), 0);
    const totalProfit = projectionData[projectionData.length - 1]?.cumulativeProfit || 0;
    
    let breakEvenMonth = 'N/A';
    for (const monthData of projectionData) {
      if (monthData.cumulativeProfit >= 0) {
        breakEvenMonth = monthData.month;
        break;
      }
    }
    if (totalProfit < 0 && breakEvenMonth === 'N/A' && projectionData.some(m => m.cumulativeProfit !== undefined)) {
       breakEvenMonth = "Not within 12 months";
    }

    const profits = projectionData.map(m => m.monthlyProfit || 0);
    const maxProfit = Math.max(...profits, 0); 
    const maxLoss = Math.min(...profits, 0);

    return { totalRevenue, totalExpenses, totalProfit, breakEvenMonth, maxProfit, maxLoss };
  }, [projectionData]);

  return (
    <div className="min-h-screen bg-background">
      {/* ACA Presentation Section */}
      <section className="bg-background p-4 sm:p-6 md:p-8">
        <AcaPresentationSlides />
      </section>

      {/* Calculator Section */}
      <section id="calculator-section" className="bg-background p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-8 text-center py-8">
            <h1 className="text-4xl font-bold text-primary font-headline">ACA Client Acquisition Calculator</h1>
            <p className="text-lg text-muted-foreground mt-2">Estimate your commission & revenue potential over 12 months.</p>
          </header>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <FinancialInputsCard
              leadPurchaseType={leadPurchaseType}
              setLeadPurchaseType={setLeadPurchaseType}
              leadsPurchasedInput={leadsPurchasedInput}
              setLeadsPurchasedInput={handleInputChange(setLeadsPurchasedInput)}
              leadCost={leadCost}
              setLeadCost={handleInputChange(setLeadCost)}
              newToMarketplacePercentage={newToMarketplacePercentage}
              setNewToMarketplacePercentage={handlePercentageChange(setNewToMarketplacePercentage)}
              aorConversionType={aorConversionType}
              setAorConversionType={setAorConversionType}
              aorConversionsInput={aorConversionsInput}
              setAorConversionsInput={handleInputChange(setAorConversionsInput)}
              recurringCommission={recurringCommission}
              setRecurringCommission={handleInputChange(setRecurringCommission)}
              newEnrollmentCost={newEnrollmentCost}
              setNewEnrollmentCost={handleInputChange(setNewEnrollmentCost)}
              showAssumptions={showAssumptions}
              setShowAssumptions={setShowAssumptions}
            />
          </div>

          <div className="lg:col-span-2 space-y-6 flex flex-col">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground border-b pb-3">Yearly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <SummaryDisplay summaryMetrics={summaryMetrics} />
              </CardContent>
            </Card>
            <AskJohnChat className="flex-grow" />
          </div>
        </div>
        
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Profit Over 12 Months</CardTitle>
            <p className="text-sm text-muted-foreground">Visualizes cumulative and monthly net profit over the projected year.</p>
          </CardHeader>
          <CardContent>
            <ProjectionChart data={projectionData} />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBreakdownTable data={projectionData} />
          </CardContent>
        </Card>

        {/* Podcast Widgets Section */}
        <div className="mt-12 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Featured Podcasts</h2>
            <p className="text-muted-foreground">Listen to expert insights on ACA enrollment and sales strategies</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PodcastWidget 
              title="Unlocking ACA Sales and Marketing Success"
              audioSrc="https://firebasestorage.googleapis.com/v0/b/aca-client-acq-calc.firebasestorage.app/o/Unlocking%20ACA%20Sales%20and%20Marketing%20Success.wav?alt=media&token=253b9334-1f84-4f9b-8283-754163abd2c6"
              className="w-full"
            />
            <PodcastWidget 
              title="ACA Enrollment Guidelines and Resources for 2025"
              audioSrc="https://firebasestorage.googleapis.com/v0/b/aca-client-acq-calc.firebasestorage.app/o/ACA%20Enrollment_%20Guidelines%20and%20Resources%20for%202025.wav?alt=media&token=8a8c57ed-b3f7-44fc-8af9-dce520438c00"
              className="w-full"
            />
          </div>
        </div>
        
        <footer className="mt-12 py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ACA Client Acquisition Calculator. All calculations are estimates.</p>
            <p>Assumes selected lead & AOR models, and no customer churn.</p>
            <p className="mt-2">
              Powered by <a href="https://agentemp.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AgentEmp</a> and <a href="https://agentsly.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Agentsly</a>
            </p>
        </footer>
        </div>
      </section>
    </div>
  );
}
