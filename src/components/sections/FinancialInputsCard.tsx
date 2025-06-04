
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/custom/InputField";
import SelectField from "@/components/custom/SelectField";
import { DollarSign, Users, Percent, ShoppingCart, UserCheck, Repeat, ChevronsDown, ChevronsUp } from 'lucide-react';

interface FinancialInputsCardProps {
  leadPurchaseType: string;
  setLeadPurchaseType: (value: string) => void;
  leadsPurchasedInput: string | number;
  setLeadsPurchasedInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leadCost: string | number;
  setLeadCost: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newToMarketplacePercentage: string | number;
  setNewToMarketplacePercentage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aorConversionType: string;
  setAorConversionType: (value: string) => void;
  aorConversionsInput: string | number;
  setAorConversionsInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  recurringCommission: string | number;
  setRecurringCommission: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newEnrollmentCost: string | number;
  setNewEnrollmentCost: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showAssumptions: boolean;
  setShowAssumptions: (value: boolean) => void;
}

const purchaseTypeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'oneTime', label: 'One-Time (Month 1)' }
];

const FinancialInputsCard: React.FC<FinancialInputsCardProps> = ({
  leadPurchaseType, setLeadPurchaseType, leadsPurchasedInput, setLeadsPurchasedInput,
  leadCost, setLeadCost, newToMarketplacePercentage, setNewToMarketplacePercentage,
  aorConversionType, setAorConversionType, aorConversionsInput, setAorConversionsInput,
  recurringCommission, setRecurringCommission, newEnrollmentCost, setNewEnrollmentCost,
  showAssumptions, setShowAssumptions,
}) => {
  const leadsInputLabel = leadPurchaseType === 'monthly' ? "Leads Purchased per Month" : "Total Leads Purchased (One-Time)";
  const aorInputLabel = aorConversionType === 'monthly' ? "AOR Conversions per Month" : "Total AOR Conversions (One-Time)";

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground border-b pb-3">Input Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium text-foreground mt-0 mb-3">Lead Acquisition</h3>
        <SelectField
          label="Lead Purchase Frequency"
          value={leadPurchaseType}
          onChange={setLeadPurchaseType}
          options={purchaseTypeOptions}
          icon={ShoppingCart}
        />
        <InputField
          label={leadsInputLabel}
          value={leadsPurchasedInput}
          onChange={setLeadsPurchasedInput}
          icon={Users}
          min="0"
          step="1"
        />
        <InputField
          label="Lead Cost"
          value={leadCost}
          onChange={setLeadCost}
          icon={DollarSign}
          unit="per lead"
          min="0"
          step="0.01"
        />
        <InputField
          label="New to Marketplace % from Leads"
          value={newToMarketplacePercentage}
          onChange={setNewToMarketplacePercentage}
          icon={Percent}
          unit="(NTM Conversion)"
          helpText="Percentage of purchased leads that convert as NTM."
          min="0"
          max="100"
          step="0.01"
        />

        <h3 className="text-lg font-medium text-foreground mt-6 mb-3">AOR Conversions</h3>
        <SelectField
          label="AOR Conversion Frequency"
          value={aorConversionType}
          onChange={setAorConversionType}
          options={purchaseTypeOptions}
          icon={Repeat}
        />
        <InputField
          label={aorInputLabel}
          value={aorConversionsInput}
          onChange={setAorConversionsInput}
          icon={UserCheck}
          unit="conversions"
          helpText="Number of Agent on Record conversions."
          min="0"
          step="1"
        />

        <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Financials</h3>
        <InputField
          label="Recurring Commission"
          value={recurringCommission}
          onChange={setRecurringCommission}
          icon={DollarSign}
          unit="per sale / month"
          min="0"
          step="0.01"
        />
        <InputField
          label="New Enrollment Cost"
          value={newEnrollmentCost}
          onChange={setNewEnrollmentCost}
          icon={DollarSign}
          unit="per new sale"
          helpText="One-time cost for each new sale (NTM or AOR)."
          min="0"
          step="0.01"
        />
        <Button
          variant="link"
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="mt-4 p-0 text-sm text-primary hover:text-primary/80 flex items-center"
        >
          {showAssumptions ? <ChevronsUp className="mr-1 h-4 w-4" /> : <ChevronsDown className="mr-1 h-4 w-4" />}
          {showAssumptions ? 'Hide' : 'Show'} Calculation Assumptions
        </Button>
        {showAssumptions && (
          <div className="mt-3 p-3 bg-secondary rounded-md text-xs text-secondary-foreground space-y-1">
            <p><strong className="font-semibold">Lead Purchase:</strong> Frequency and quantity as selected.</p>
            <p><strong className="font-semibold">AOR Conversions:</strong> Frequency and quantity as selected; these are independent of leads.</p>
            <p><strong className="font-semibold">New Sales:</strong> Sum of (NTM from Leads) + (AOR Conversions). Rounded down.</p>
            <p><strong className="font-semibold">Active Subscriptions:</strong> Accumulate month over month. No churn is assumed.</p>
            <p><strong className="font-semibold">Revenue:</strong> (Total Active Subscriptions * Recurring Commission).</p>
            <p><strong className="font-semibold">Expenses:</strong> (Leads Purchased * Lead Cost) + (Total New Sales * New Enrollment Cost).</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialInputsCard;
