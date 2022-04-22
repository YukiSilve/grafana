import React from 'react';
import { IconButton, useTheme2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import classnames from 'classnames';

export interface Props {
  className?: string;
  isExpanded: boolean;
  onClick: () => void;
}

export const NavBarToggle = ({ className, isExpanded, onClick }: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  return (
    <IconButton
      aria-label={isExpanded ? 'Close navigation menu' : 'Open navigation menu'}
      name={isExpanded ? 'times' : 'angle-right'}
      className={classnames(className, styles.icon)}
      size="xl"
      onClick={onClick}
    />
  );
};

NavBarToggle.displayName = 'NavBarToggle';

const getStyles = (theme: GrafanaTheme2) => ({
  icon: css({
    zIndex: theme.zIndex.sidemenu,

    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  }),
});