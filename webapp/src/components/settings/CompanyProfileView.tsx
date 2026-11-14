import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Save, CheckCircle2 } from 'lucide-react';

export const CompanyProfileView: React.FC = () => {
  const { company, setCompany } = useErp();

  const [name, setName] = useState(company.name);
  const [tradeName, setTradeName] = useState(company.tradeName);
  const [taxNumber, setTaxNumber] = useState(company.taxNumber);
  const [registrationNumber, setRegistrationNumber] = useState(company.registrationNumber);
  const [currency, setCurrency] = useState(company.currency);
  const [currencySymbol, setCurrencySymbol] = useState(company.currencySymbol);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);
  const [address, setAddress] = useState(company.address);
  const [city, setCity] = useState(company.city);
  const [state, setState] = useState(company.state);
  const [postalCode, setPostalCode] = useState(company.postalCode);
  const [fiscalYearStart, setFiscalYearStart] = useState(company.fiscalYearStart);
  const [fiscalYearEnd, setFiscalYearEnd] = useState(company.fiscalYearEnd);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...company,
      name,
      tradeName,
      taxNumber,
      registrationNumber,
      currency: (currency || 'AED').toUpperCase(),
      currencySymbol: currencySymbol || 'AED',
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      fiscalYearStart,
      fiscalYearEnd,
    };
    setCompany(updated);
    try {
      localStorage.setItem('apex_erp_company', JSON.stringify(updated));
    } catch (e) {}

    // Persist base currency and profile to server database so all van accounts immediately follow it
    try {
      const token = localStorage.getItem('apex_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      await fetch('/api/companies/12', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          currency: (currency || 'AED').toUpperCase(),
          currencySymbol: currencySymbol || 'AED',
          country: updated.country || 'United Arab Emirates',
          address,
          taxNumber,
          phone,
          email,
        }),
      });
    } catch (err) {
      console.warn('Could not sync company profile to backend:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Company Profile</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage legal business entity, tax registrations, default currency, fiscal calendar, and invoice headings.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Company profile updated successfully!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Legal Registered Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-600 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trade / Brand Name</label>
            <input
              type="text"
              value={tradeName}
              onChange={e => setTradeName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">GSTIN / VAT Identification Number</label>
            <input
              type="text"
              value={taxNumber}
              onChange={e => setTaxNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Reg / CIN Number</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={e => setRegistrationNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Currency Code</label>
            <input
              type="text"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={e => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Postal Code / PIN</label>
            <input
              type="text"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fiscal Year Start Date</label>
            <input
              type="date"
              value={fiscalYearStart}
              onChange={e => setFiscalYearStart(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fiscal Year End Date</label>
            <input
              type="date"
              value={fiscalYearEnd}
              onChange={e => setFiscalYearEnd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
