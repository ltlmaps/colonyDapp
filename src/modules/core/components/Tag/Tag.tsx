import React, { HTMLAttributes } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import { useMainClasses } from '~utils/hooks';

import styles from './Tag.css';

interface Appearance {
  theme: 'primary' | 'light' | 'golden';
}

interface Props extends HTMLAttributes<HTMLSpanElement> {
  /** Appearance object */
  appearance?: Appearance;
  /** Text to display in the tag */
  text?: MessageDescriptor | string;
  /** Text values for intl interpolation */
  textValues?: { [key: string]: string };
}

const displayName = 'Tag';

const Tag = ({
  appearance,
  children,
  className,
  text,
  textValues,
  ...rest
}: Props) => {
  const classNames = useMainClasses(appearance, styles, className);
  return (
    <span className={classNames} {...rest}>
      {text ? (
        <>
          {typeof text === 'string' ? (
            text
          ) : (
            <FormattedMessage {...text} values={textValues} />
          )}
        </>
      ) : (
        children
      )}
    </span>
  );
};

Tag.displayName = displayName;

export default Tag;
