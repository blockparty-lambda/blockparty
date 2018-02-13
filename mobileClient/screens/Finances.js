import React from 'react';
import { StyleSheet } from 'react-native';
import WalletsList from '../components/WalletsList';

export default class FinancesScreen extends React.Component {
  static navigationOptions = {
    title: 'Finances',
  };

  render() {
    return (
      <WalletsList />
    )
  }
}
