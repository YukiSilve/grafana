import { TemplateSrv } from 'app/features/templating/template_srv';

import { createMockQuery } from './__mocks__/cloudMonitoringQuery';
import { createMockInstanceSetttings } from './__mocks__/instanceSettings';
import Datasource from './datasource';

describe('Cloud Monitoring Datasource', () => {
  describe('interpolateVariablesInQueries', () => {
    it('should leave a query unchanged if there are no template variables', () => {
      const mockInstanceSettings = createMockInstanceSetttings();
      const ds = new Datasource(mockInstanceSettings);
      const query = createMockQuery({ hide: false });
      const templateVariablesApplied = ds.interpolateVariablesInQueries([query], {});
      expect(templateVariablesApplied[0]).toEqual(query);
    });

    it('should correctly apply template variables', () => {
      const templateSrv = new TemplateSrv();
      templateSrv.replace = jest.fn().mockReturnValue('project-variable');
      const mockInstanceSettings = createMockInstanceSetttings();
      const ds = new Datasource(mockInstanceSettings, templateSrv);
      const query = createMockQuery({ hide: false, metricQuery: { projectName: '$testVar' } });
      const templatedQuery = ds.interpolateVariablesInQueries([query], {});
      expect(templatedQuery[0]).toHaveProperty('datasource');
      expect(templatedQuery[0].metricQuery.projectName).toEqual('project-variable');
    });
  });
});
