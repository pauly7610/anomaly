import React from 'react';

type Props = {
  drift: boolean | null;
  driftLoading: boolean;
  shap: number[] | null;
  shapLoading: boolean;
};

export const MLInsightsCard: React.FC<Props> = ({ drift, driftLoading, shap, shapLoading }) => (
  <div className="bg-white rounded shadow p-4 min-w-[230px] flex flex-col items-center">
    <h3 className="font-semibold text-lg mb-2">ML Insights</h3>
    <div className="mb-2">
      <span className="font-medium">Drift:</span>{' '}
      {driftLoading ? <span className="text-gray-400">Loading...</span> : drift === null ? <span className="text-gray-400">N/A</span> : drift ? <span className="text-red-500 font-bold">Detected</span> : <span className="text-green-600 font-bold">None</span>}
    </div>
    <div>
      <span className="font-medium">SHAP:</span>{' '}
      {shapLoading ? <span className="text-gray-400">Loading...</span> : shap === null ? <span className="text-gray-400">N/A</span> : <span className="text-xs text-gray-600">[{shap.slice(0, 5).map((v, i) => <span key={i}>{v.toFixed(2)}{i < 4 ? ', ' : ''}</span>)}{shap.length > 5 && '...'}]</span>}
    </div>
  </div>
);
