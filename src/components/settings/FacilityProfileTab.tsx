/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FacilityProfileTabProps {
  facilityName: string;
  setFacilityName: (v: string) => void;
  taxId: string;
  setTaxId: (v: string) => void;
  npi: string;
  setNpi: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
}

export default function FacilityProfileTab({
  facilityName, setFacilityName,
  taxId, setTaxId,
  npi, setNpi,
  address, setAddress,
}: FacilityProfileTabProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
      <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
        Facility demographics &amp; Corporate parameters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 mb-1.5">EHR Registered Facility Name</label>
          <input type="text" value={facilityName} onChange={e => setFacilityName(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb]" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 mb-1.5">Tax Identification Number (TID)</label>
          <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb] font-mono" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 mb-1.5">National Provider Identifier (NPI-10)</label>
          <input type="text" value={npi} onChange={e => setNpi(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb] font-mono font-bold" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 mb-1.5">Clinical Facility Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-[#fbfbfb]" />
        </div>
      </div>
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-6 rounded-lg shadow-2xs mt-4 hover:shadow cursor-pointer">
        Save Facility Demographics
      </button>
    </div>
  );
}
