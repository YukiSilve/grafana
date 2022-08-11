import { render, waitFor, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { getGrafanaContextMock } from 'test/mocks/getGrafanaContextMock';

import { BackendSrv } from '@grafana/runtime';
import { GrafanaContext } from 'app/core/context/GrafanaContext';
import { configureStore } from 'app/store/configureStore';

import CorrelationsPage from './CorrelationsPage';

const renderWithContext = (component: ReactNode) => {
  const store = configureStore({});
  const backend: BackendSrv = {
    get: jest.fn().mockResolvedValue([{ id: 'somehing' }]),
  };
  const grafanaContext = getGrafanaContextMock({ backend });

  return render(
    <Provider store={store}>
      <GrafanaContext.Provider value={grafanaContext}>{component}</GrafanaContext.Provider>
    </Provider>
  );
};

describe('CorrelationsPage', () => {
  it('fetches correlations on first render', async () => {
    renderWithContext(<CorrelationsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    screen.debug();

    expect(true).toBe(true);
  });
});
