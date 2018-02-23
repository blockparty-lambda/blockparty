import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  AsyncStorage,
  SectionList,
  Image
} from "react-native";
import axios from "axios";
import { apiUrl } from "../config";
import { List, ListItem, SearchBar, Button, Text } from "react-native-elements";
import { icons } from "../assets/icons";

export default class WalletsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      wallets: [],
      addableWallets: [],
      refreshing: false,
      loading: false,
      searchResults: []
    };
  }

  // call our api to get the users apis
  // set result to state
  // Example of how to access backend and pass the jwt in headers
  async componentDidMount() {
    await this.setState({ token: await AsyncStorage.getItem("jwt") }, () =>
      this.getUserWallets()
    );
  }

  getUserWallets = () => {
    axios
      .get(`${apiUrl}/getwallets`, {
        headers: {
          Authorization: this.state.token
        }
      })
      .then(async response => {
        await this.setState(
          {
            wallets: response.data.wallets,
            loading: false,
            refreshing: false
          },
          () => this.getAddableWallets()
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  getAddableWallets = async () => {
    try {
      const result = await axios.get(`${apiUrl}/addableWallets`, {
        headers: { Authorization: this.state.token }
      });
      const wallets = result.data.wallets;
      await this.setState(
        {
          addableWallets: wallets,
          loading: false,
          refreshing: false
        },
        () => {
          if (this.state.wallets && !this.state.wallets.length)
            this.showAddableWallets();
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  handleRefresh = async () => {
    await this.setState(
      {
        refreshing: true
      },
      () => {
        this.getAddableWallets();
      }
    );
  };

  showAddableWallets = async () => {
    await this.setState({ searchResults: this.state.addableWallets });
  };

  hideAddableWallets = async () => {
    await this.setState({ searchResults: [] });
  };

  addWallet = async coin => {
    try {
      await axios.post(`${apiUrl}/create-wallet/${coin}`, null, {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      });

      await this.getAddableWallets();
      await this.getUserWallets();
      await this.showAddableWallets();
    } catch (error) {
      alert(error.message);
    }
  };

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

  renderSectionSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };

  renderHeader = () => {
    const buttonText = this.state.searchResults.length
      ? "Hide New Wallets"
      : "Add New Wallets";
    return this.state.addableWallets && this.state.addableWallets.length ? (
      <View>
        <Button
          text={buttonText}
          buttonStyle={{
            height: 45,
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 5,
            marginBottom: 5,
            marginTop: 5
          }}
          onPress={async () => {
            if (buttonText === "Add New Wallets") {
              await this.showAddableWallets();
            } else {
              await this.hideAddableWallets();
            }
          }}
        />
      </View>
    ) : null;
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
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%"
        }}
      >
        {this.state.searchResults && this.state.wallets ? (
          <SectionList
            ItemSeparatorComponent={this.renderSeparator}
            SectionSeparatorComponent={this.renderSectionSeparator}
            ListHeaderComponent={this.renderHeader}
            ListFooterComponent={this.renderFooter}
            onRefresh={this.handleRefresh}
            refreshing={this.state.refreshing}
            extraData={this.state}
            renderSectionHeader={({ section }) => {
              if (!section.data.length) return null;
              return (
                <Text h4 style={{ marginLeft: 5 }}>
                  {section.key}
                </Text>
              );
            }}
            sections={[
              {
                data: this.state.searchResults,
                key: "Add a Wallet",
                keyExtractor: item => item.id,
                renderItem: ({ item }) => {
                  return (
                    <ListItem
                      roundAvatar
                      title={`${item.coin}`}
                      leftIcon={
                        <Image
                          style={{
                            height: 42,
                            width: 42,
                            marginRight: 5,
                            marginLeft: -5
                          }}
                          source={icons[item.coinAbbr]}
                          resizeMode="contain"
                        />
                      }
                      containerStyle={{ borderBottomWidth: 0 }}
                      rightTitle="Add Wallet"
                      rightIcon={{ name: "add" }}
                      onPressRightIcon={() => {
                        this.addWallet(item.coinAbbr);
                      }}
                    />
                  );
                }
              },
              {
                data: this.state.wallets,
                key: "Your Wallets",
                keyExtractor: item => item.coinAbbr,
                renderItem: ({ item }) => {
                  return (
                    <ListItem
                      roundAvatar
                      title={`${item.coin}`}
                      subtitle={`Balance: ${
                        item.balance
                      } ${item.coinAbbr.toUpperCase()}`}
                      leftIcon={
                        <Image
                          style={{
                            height: 42,
                            width: 42,
                            marginRight: 5,
                            marginLeft: -5
                          }}
                          source={icons[item.coinAbbr]}
                          resizeMode="contain"
                        />
                      }
                      containerStyle={{ borderBottomWidth: 0 }}
                    />
                  );
                }
              }
            ]}

            // onEndReached={this.handleLoadMore}
            // onEndReachedThreshold={50}
          />
        ) : null}
      </List>
    );
  }
}
