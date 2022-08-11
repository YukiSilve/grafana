import { css } from '@emotion/css';
import { negate } from 'lodash';
import React, { ComponentProps, memo, useCallback, useMemo, useState } from 'react';
import { CellProps, SortByFn } from 'react-table';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Button, DeleteButton, HorizontalGroup, LoadingPlaceholder, useStyles2 } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { AccessControlAction } from 'app/types';

import { useNavModel } from '../../core/hooks/useNavModel';

import { AddCorrelationForm } from './Forms/AddCorrelationForm';
import { EditCorrelationForm } from './Forms/EditCorrelationForm';
import { Column, Table } from './components/Table';
import { CorrelationData, useCorrelations } from './useCorrelations';

const sortDatasource: SortByFn<CorrelationData> = (a, b, column) =>
  a.values[column].name.localeCompare(b.values[column].name);

const isSourceReadOnly = ({ source }: Pick<CorrelationData, 'source'>) => source.readOnly;

const loaderWrapper = css`
  display: flex;
  justify-content: center;
`;

export default function CorrelationsPage() {
  const navModel = useNavModel('correlations');
  const [isAdding, setIsAdding] = useState(false);
  const { correlations, create, remove, update, loading, error, reload } = useCorrelations();
  const canWriteCorrelations = contextSrv.hasPermission(AccessControlAction.DataSourcesWrite);

  const handleAdd = useCallback<ComponentProps<typeof AddCorrelationForm>['onSubmit']>(
    async (correlation) => {
      await create(correlation);
      reload();
      setIsAdding(false);
    },
    [create, reload]
  );

  const handleDelete = useCallback<(correlation: Parameters<typeof remove>[0]) => () => Promise<unknown>>(
    (correlation) => async () => {
      await remove(correlation);
      reload();
    },
    [remove, reload]
  );

  const RowActions = useCallback(
    ({
      row: {
        original: {
          source: { uid: sourceUID, readOnly },
          uid,
        },
      },
    }: CellProps<CorrelationData, void>) =>
      !readOnly && <DeleteButton onConfirm={handleDelete({ sourceUID, uid })} closeOnConfirm />,
    [handleDelete]
  );

  const columns = useMemo<Array<Column<CorrelationData>>>(
    () => [
      {
        cell: InfoCell,
        shrink: true,
        visible: (data) => data.some(isSourceReadOnly),
      },
      {
        id: 'source',
        header: 'Source',
        cell: DataSourceCell,
        sortType: sortDatasource,
      },
      {
        id: 'target',
        header: 'Target',
        cell: DataSourceCell,
        sortType: sortDatasource,
      },
      { id: 'label', header: 'Label', sortType: 'alphanumeric' },
      {
        cell: RowActions,
        shrink: true,
        visible: (data) => canWriteCorrelations && data.some(negate(isSourceReadOnly)),
      },
    ],
    [RowActions, canWriteCorrelations]
  );

  const data = useMemo(() => correlations, [correlations]);

  return (
    <>
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <HorizontalGroup justify="space-between">
              <div>
                <h4>Correlations</h4>
                <p>Define how data living in different data sources relates to each other.</p>
              </div>
              {canWriteCorrelations && data?.length !== 0 && (
                <Button icon="plus" onClick={() => setIsAdding(true)} disabled={isAdding}>
                  Add
                </Button>
              )}
            </HorizontalGroup>
          </div>

          {error && <pre>{JSON.stringify(error)}</pre>}

          {!data && loading && (
            <div className={loaderWrapper}>
              <LoadingPlaceholder text="loading..." />
            </div>
          )}

          {data?.length === 0 && !isAdding && !loading && (
            <EmptyListCTA
              title="You haven't defined any correlation yet."
              buttonIcon="sitemap"
              onClick={() => setIsAdding(true)}
              buttonTitle="Add correlation"
            />
          )}

          {isAdding && <AddCorrelationForm onClose={() => setIsAdding(false)} onSubmit={handleAdd} />}

          {data && data.length >= 1 && (
            <Table
              renderExpandedRow={({ target, source, ...correlation }) => (
                <EditCorrelationForm
                  defaultValues={{ sourceUID: source.uid, ...correlation }}
                  onSubmit={update}
                  readOnly={isSourceReadOnly({ source }) || !canWriteCorrelations}
                />
              )}
              columns={columns}
              data={data}
              getRowId={(correlation) => `${correlation.source.uid}-${correlation.uid}`}
            />
          )}
        </Page.Contents>
      </Page>
    </>
  );
}

const getDatasourceCellStyles = (theme: GrafanaTheme2) => ({
  root: css`
    display: flex;
    align-items: center;
  `,
  dsLogo: css`
    margin-right: ${theme.spacing()};
    height: 16px;
    width: 16px;
  `,
});

const DataSourceCell = memo(
  function DataSourceCell({
    cell: { value },
  }: CellProps<CorrelationData, CorrelationData['source'] | CorrelationData['target']>) {
    const styles = useStyles2(getDatasourceCellStyles);

    return (
      <span className={styles.root}>
        <img src={value.meta.info.logos.small} className={styles.dsLogo} />
        {value.name}
      </span>
    );
  },
  ({ cell: { value } }, { cell: { value: prevValue } }) => {
    return value.type === prevValue.type && value.name === prevValue.name;
  }
);

const noWrap = css`
  white-space: nowrap;
`;

const InfoCell = memo(
  function InfoCell({ ...props }: CellProps<CorrelationData, void>) {
    const readOnly = props.row.original.source.readOnly;

    if (readOnly) {
      return <Badge text="Read only" color="purple" className={noWrap} />;
    } else {
      return null;
    }
  },
  (props, prevProps) => props.row.original.source.readOnly === prevProps.row.original.source.readOnly
);
