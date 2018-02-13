import React from "react";
import { StyleSheet, Text, View, TextInput, Button, ScrollView, FlatList } from "react-native";
import axios from "axios";
import { localip } from 'react-native-dotenv';
import { List, ListItem, SearchBar } from "react-native-elements";

export default class WalletsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      wallets: [],
      // wallets: [
      //   { name: "bitcoin", bal: 0.04, _id: '123', avatarUrl: 'https://cdn3.iconfinder.com/data/icons/inficons-currency-set/512/btc-512.png' },
      //   { name: "bitcoin test", bal: 2.1, _id: '124', avatarUrl: 'http://bitcoinist.com/wp-content/themes/bitcoinist/img/Bitcoin-price-icon.png' },
      //   { name: "ether", bal: 0.005, _id: '125', avatarUrl: 'https://cdn4.iconfinder.com/data/icons/cryptocoins/227/ETH-512.png' },
      // ],
    };
  }

  // call our api to get the users apis
  // set result to state
  // Example of how to access backend and pass the jwt in headers
  async componentDidMount() {
    const token = await AsyncStorage.getItem("jwt");
    axios
      .get(`http://${localip}:3000/getwallets`, {
        headers: {
          Authorization: token
        }
      })
      .then(response => {
        this.setState({ wallets: response.data });
      })
      .catch(error => {
        console.log(error);
      });
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderHeader = () => {
    return <SearchBar placeholder="Add wallets..." lightTheme round />;
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  render() {
    return (
      <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
        <FlatList
          data={this.state.friends}
          renderItem={({ item }) => (
            <ListItem
              roundAvatar
              title={`${item.name}`}
              subtitle={item.bal}
              avatar={{ uri: item.avatarUrl }}
              containerStyle={{ borderBottomWidth: 0 }}
            />
          )}
          keyExtractor={item => item._id}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
        // onRefresh={this.handleRefresh}
        // refreshing={this.state.refreshing}
        // onEndReached={this.handleLoadMore}
        // onEndReachedThreshold={50}
        />
      </List>
    );
  }
}