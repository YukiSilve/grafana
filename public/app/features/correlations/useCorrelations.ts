import { useEffect } from 'react';
import { useAsyncFn } from 'react-use';

import { DataSourceInstanceSettings } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { useGrafana } from 'app/core/context/GrafanaContext';

import { Correlation } from './types';

export interface CorrelationData extends Omit<Correlation, 'sourceUID' | 'targetUID'> {
  source: DataSourceInstanceSettings;
  target: DataSourceInstanceSettings;
}

const toEnrichedCorrelationData = ({ sourceUID, targetUID, ...correlation }: Correlation): CorrelationData => ({
  ...correlation,
  source: getDataSourceSrv().getInstanceSettings(sourceUID)!,
  target: getDataSourceSrv().getInstanceSettings(targetUID)!,
});

const toEnrichedCorrelationsData = (correlations: Correlation[]) => correlations.map(toEnrichedCorrelationData);

export const useCorrelations = () => {
  const { backend } = useGrafana();

  const getCorrelations = () =>
    backend.get<Correlation[]>('/api/datasources/correlations').then(toEnrichedCorrelationsData);
  // .catch<CorrelationData[]>(() => []);

  const [{ value: correlations, loading, error }, reload] = useAsyncFn(getCorrelations);

  useEffect(() => {
    reload();
    // we only want to fetch data on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = ({ sourceUID, ...correlation }: Omit<Correlation, 'uid'>) => {
    return backend.post(`/api/datasources/uid/${sourceUID}/correlations`, correlation).then((data) => {
      reload();
      return toEnrichedCorrelationData(data);
    });
  };

  const remove = ({ sourceUID, uid }: Pick<Correlation, 'sourceUID' | 'uid'>) => {
    return backend.delete(`/api/datasources/uid/${sourceUID}/correlations/${uid}`).then(reload);
  };

  const update = ({ sourceUID, uid, ...correlation }: Omit<Correlation, 'targetUID'>) => {
    return backend.patch(`/api/datasources/uid/${sourceUID}/correlations/${uid}`, correlation).then((data) => {
      reload();
      return toEnrichedCorrelationData(data);
    });
  };

  return { loading, correlations, create, remove, update, error, reload };
};
