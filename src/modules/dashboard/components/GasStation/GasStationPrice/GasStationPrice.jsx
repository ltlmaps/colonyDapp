/* @flow */
import React, { Component, Fragment } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { fromWei } from 'ethjs-unit';
import BN from 'bn.js';
import nanoid from 'nanoid';

import type { TransactionType } from '~types/transaction';
import type { RadioOption } from '~core/Fields/RadioGroup';

import { getMainClasses } from '~utils/css';
import { getEthToUsd } from '~utils/external';
import Alert from '~core/Alert';
import Button from '~core/Button';
import { Form, RadioGroup } from '~core/Fields';
import Icon from '~core/Icon';
import Numeral from '~core/Numeral';
import { SpinnerLoader } from '~core/Preloaders';

import styles from './GasStationPrice.css';

const MSG = defineMessages({
  networkCongestedWarning: {
    id: 'dashboard.GasStationPrice.networkCongestedWarning',
    defaultMessage: `The network is congested and transactions
are expensive. We recommend waiting.`,
  },
  openTransactionSpeedMenuTitle: {
    id: 'dashboard.GasStationPrice.openTransactionSpeedMenuTitle',
    defaultMessage: 'Change Transaction Speed',
  },
  transactionFeeLabel: {
    id: 'dashboard.GasStationPrice.transactionFeeLabel',
    defaultMessage: 'Transaction fee',
  },
  transactionSpeedLabel: {
    id: 'dashboard.GasStationPrice.transactionSpeedLabel',
    defaultMessage: 'Transaction speed',
  },
  transactionSpeedTypeSuggested: {
    id: 'dashboard.GasStation.GasStationPrice.transactionSpeedTypeSuggested',
    defaultMessage: 'Suggested',
  },
  transactionSpeedTypeCheaper: {
    id: 'dashboard.GasStation.GasStationPrice.transactionSpeedTypeCheaper',
    defaultMessage: 'Cheaper',
  },
  transactionSpeedTypeFaster: {
    id: 'dashboard.GasStation.GasStationPrice.transactionSpeedTypeFaster',
    defaultMessage: 'Faster',
  },
  walletPromptText: {
    id: 'dashboard.GasStationPrice.walletPromptText',
    defaultMessage: `Finish the transaction on {walletType, select,
      metamask {Metamask}
      hardware {your hardware wallet}  
    }.`,
  },
});

type Props = {
  isEth: boolean,
  transaction: TransactionType,
};

type State = {
  ethUsd: number | null,
  isSpeedMenuOpen: boolean,
  speedMenuId: string,
};

const transactionSpeedOptions: Array<RadioOption> = [
  { value: 'suggested', label: MSG.transactionSpeedTypeSuggested },
  { value: 'cheaper', label: MSG.transactionSpeedTypeCheaper },
  { value: 'faster', label: MSG.transactionSpeedTypeFaster },
];

class GasStationPrice extends Component<Props, State> {
  static defaultProps = {
    isEth: false,
  };

  static displayName = 'GasStationPrice';

  state = {
    ethUsd: null,
    isSpeedMenuOpen: false,
    /*
     * `speedMenuId` is used for the tx speed menu's id attribute for aria-* purposes.
     */
    speedMenuId: nanoid(),
  };

  componentDidMount() {
    this.mounted = true;
    const {
      isEth,
      transaction: { amount },
    } = this.props;

    // @TODO: get estimated gas cost & use here

    if (isEth) {
      const amountToConvert =
        amount instanceof BN ? amount : parseInt(amount, 10);
      const convertedNum = fromWei(amountToConvert, 'ether');

      getEthToUsd(convertedNum).then(converted => {
        if (this.mounted) {
          this.setState({
            ethUsd: converted,
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  mounted: boolean = false;

  toggleSpeedMenu = () => {
    const { isSpeedMenuOpen } = this.state;
    this.setState({
      isSpeedMenuOpen: !isSpeedMenuOpen,
    });
  };

  render() {
    const {
      isEth,
      transaction: { amount, symbol },
    } = this.props;
    const { ethUsd, isSpeedMenuOpen, speedMenuId } = this.state;

    return (
      <div className={getMainClasses({}, styles, { isSpeedMenuOpen })}>
        <Form
          initialValues={{
            transactionSpeed: transactionSpeedOptions[0].value,
          }}
          /* eslint-disable-next-line no-console */
          onSubmit={console.log}
        >
          {({ values: { transactionSpeed } }) => (
            <Fragment>
              <div
                aria-hidden={!isSpeedMenuOpen}
                className={styles.transactionSpeedContainerToggleable}
                id={speedMenuId}
              >
                <div className={styles.transactionSpeedContainer}>
                  <div className={styles.transactionSpeedLabel}>
                    <FormattedMessage {...MSG.transactionSpeedLabel} />
                  </div>
                  <RadioGroup
                    appearance={{ theme: 'buttonGroup' }}
                    currentlyCheckedValue={transactionSpeed}
                    name="transactionSpeed"
                    options={transactionSpeedOptions}
                  />
                </div>
              </div>
              <div className={styles.transactionFeeContainer}>
                <div className={styles.transactionFeeMenu}>
                  <div className={styles.transactionSpeedMenuButtonContainer}>
                    <button
                      aria-controls={speedMenuId}
                      aria-expanded={isSpeedMenuOpen}
                      className={styles.transactionSpeedMenuButton}
                      onClick={this.toggleSpeedMenu}
                      type="button"
                    >
                      <Icon
                        appearance={{ size: 'medium' }}
                        name="caret-down-small"
                        title={MSG.openTransactionSpeedMenuTitle}
                      />
                    </button>
                  </div>
                  <div className={styles.transactionFeeInfo}>
                    <div className={styles.transactionFeeLabel}>
                      <FormattedMessage {...MSG.transactionFeeLabel} />
                    </div>
                    <div className={styles.transactionDuration}>2h 24min</div>
                  </div>
                </div>
                <div className={styles.transactionFeeActions}>
                  <div className={styles.transactionFeeAmount}>
                    {/* @TODO: get estimated gas cost & use here */}
                    <Numeral
                      value={amount}
                      suffix={` ${symbol}`}
                      unit="ether"
                    />
                    {isEth && (
                      <div className={styles.transactionFeeEthUsd}>
                        {ethUsd ? (
                          <Numeral
                            appearance={{ size: 'small', theme: 'grey' }}
                            prefix="~ "
                            value={ethUsd}
                            suffix=" USD"
                          />
                        ) : (
                          <SpinnerLoader />
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button text={{ id: 'button.confirm' }} type="submit" />
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </Form>
        <div className={styles.walletPromptContainer}>
          <Alert
            text={MSG.walletPromptText}
            textValues={{
              walletType: 'metamask',
            }}
          />
        </div>
      </div>
    );
  }
}

export default GasStationPrice;
