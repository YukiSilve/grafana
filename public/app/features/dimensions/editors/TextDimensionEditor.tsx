import React, { FC, useCallback, useState } from 'react';

import {
  FieldNamePickerConfigSettings,
  StandardEditorProps,
  StandardEditorsRegistryItem,
  StringFieldConfigSettings,
} from '@grafana/data';
import { Button, FieldNamePicker, InlineField, InlineFieldRow, RadioButtonGroup } from '@grafana/ui';
import { StringValueEditor } from 'app/core/components/OptionsUI/string';

import { TextDimensionConfig, TextDimensionMode, TextDimensionOptions } from '../types';

const textOptions = [
  { label: 'Fixed', value: TextDimensionMode.Fixed, description: 'Fixed value' },
  { label: 'Field', value: TextDimensionMode.Field, description: 'Display field value' },
  //  { label: 'Template', value: TextDimensionMode.Template, description: 'use template text' },
];

const dummyFieldSettings: StandardEditorsRegistryItem<string, FieldNamePickerConfigSettings> = {
  settings: {},
} as any;

const dummyStringSettings: StandardEditorsRegistryItem<string, StringFieldConfigSettings> = {
  settings: {},
} as any;

export const TextDimensionEditor: FC<StandardEditorProps<TextDimensionConfig, TextDimensionOptions, any>> = (props) => {
  const { value, context, onChange } = props;
  const labelWidth = 9;

  // force re-render on clear fixed text
  const [refresh, setRefresh] = useState(0);

  const onModeChange = useCallback(
    (mode) => {
      onChange({
        ...value,
        mode,
      });
    },
    [onChange, value]
  );

  const onFieldChange = useCallback(
    (field) => {
      onChange({
        ...value,
        field,
      });
    },
    [onChange, value]
  );

  const onFixedChange = useCallback(
    (fixed) => {
      onChange({
        ...value,
        fixed,
      });
    },
    [onChange, value]
  );

  const onClearFixed = () => {
    onFixedChange('');
    setRefresh(refresh + 1);
  };

  const mode = value?.mode ?? TextDimensionMode.Fixed;

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Source" labelWidth={labelWidth} grow={true}>
          <RadioButtonGroup value={mode} options={textOptions} onChange={onModeChange} fullWidth />
        </InlineField>
      </InlineFieldRow>
      {mode !== TextDimensionMode.Fixed && (
        <InlineFieldRow>
          <InlineField label="Field" labelWidth={labelWidth} grow={true}>
            <FieldNamePicker
              context={context}
              value={value.field ?? ''}
              onChange={onFieldChange}
              item={dummyFieldSettings}
            />
          </InlineField>
        </InlineFieldRow>
      )}
      {mode === TextDimensionMode.Fixed && (
        <InlineFieldRow key={refresh}>
          <InlineField label={'Value'} labelWidth={labelWidth} grow={true}>
            <StringValueEditor
              context={context}
              value={value?.fixed}
              onChange={onFixedChange}
              item={dummyStringSettings}
              suffix={
                value?.fixed && <Button icon="times" variant="secondary" fill="text" size="sm" onClick={onClearFixed} />
              }
            />
          </InlineField>
        </InlineFieldRow>
      )}
      {mode === TextDimensionMode.Template && (
        <InlineFieldRow>
          <InlineField label="Template" labelWidth={labelWidth} grow={true}>
            <StringValueEditor // This could be a code editor
              context={context}
              value={value?.fixed}
              onChange={onFixedChange}
              item={dummyStringSettings}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </>
  );
};
