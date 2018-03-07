import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  AsyncStorage,
  SectionList,
  Image,
  Keyboard,
  Alert,
  Clipboard
} from "react-native";
import axios from "axios";
import { apiUrl } from "../config";
import {
  List,
  ListItem,
  SearchBar,
  Button,
  Text,
  Overlay,
  Header,
  Icon
} from "react-native-elements";
import { icons } from "../assets/icons";

export default class WalletsList extends React.Component {
  static coinIcons = {
    btc: { name: "currency-btc", type: "material-community" },
    btc_test: { name: "currency-btc", type: "material-community" },
    eth: { name: "currency-eth", type: "material-community" },
    eth_test: { name: "currency-eth", type: "material-community" }
  };
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      username: "",
      wallets: [],
      addableWallets: [],
      rofs: [],
      refreshing: false,
      loading: false,
      modalVisible: false,
      searchResults: [],
      selectedWallet: null
    };
  }

  // call our api to get the users apis
  // set result to state
  // Example of how to access backend and pass the jwt in headers
  async componentDidMount() {
    Keyboard.dismiss();
    await this.setState({ token: await AsyncStorage.getItem("jwt") });
    await this.setState({ username: await AsyncStorage.getItem("bpUsername") });

    await this.getUserWallets();
    await this.getROFS();
  }

  // whenever a piece of data is updated, re render whole screen
  // a possible one function call that gets all component data from http requests
  // getAllData = () => {
  //   axios.all([getUserWallets(), getROFS()])
  //     .then(axios.spread((acct, perms) => {
  //       // Both requests are now complete
  //     }))
  //     .catch(err => res.json(err))
  // }

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

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
          async () => await this.getAddableWallets()
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

  getROFS = async () => {
    try {
      const result = await axios.get(`${apiUrl}/requestfunds`, {
        headers: { Authorization: this.state.token }
      });
      const rofs = result.data;

      // an rof.coin currently had wrong naming convetion, right now rof.coin = "btc_test"
      // where we want to display "test bitcoin" insteadn

      const coinMap = {
        btc: "bitcoin",
        btc_test: "test bitcoin",
        eth: "ether",
        eth_test: "test ether"
      };
      rofs.forEach(rof => {
        rof.coinFull = coinMap[rof.coin];
      });

      await this.setState({
        rofs,
        loading: false,
        refreshing: false
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleRefresh = async () => {
    await this.setState(
      {
        refreshing: true
      },
      async () => {
        await this.getUserWallets();
        this.getAddableWallets();
        this.getROFS();
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
          backgroundColor: "#45a29e",
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
          backgroundColor: "#45a29e"
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
          textStyle={{ fontFamily: "space-mono-bold", color: "#0b0c10" }}
          buttonStyle={{
            height: 45,
            borderColor: "transparent",
            backgroundColor: "#45a29e",
            borderWidth: 0,
            borderRadius: 5,
            marginBottom: 5,
            marginTop: 5,
            width: 500 // for whatever reason using 100% screw of the lining of the button text
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
          borderColor: "#45a29e"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  handleWalletClick = wallet => {
    this.setState({ selectedWallet: wallet, modalVisible: true });
  };

  closeModal = () => {
    this.setState({ selectedWallet: null, modalVisible: false });
  };

  closeROFModal = () => {
    this.setState({ modalVisible: false });
  };

  handleROF = (rofId, accepted) => {
    if (accepted) {
      axios
        .post(
          `${apiUrl}/handlerof`,
          {
            rofId,
            accepted
          },
          {
            headers: {
              Authorization: this.state.token,
              "Content-Type": "application/json"
            }
          }
        )
        .then(resp => {
          // if wasnt successful (you dont have enough coin, etc...)
          // handle that
          if (resp.data.success) {
            Alert.alert(
              "Transaction Sent",
              `Transaction ID: ${resp.data.txId}`,
              [{ text: "OK", onPress: this.getROFS }]
            );
          } else {
            // handle that user doenst have enough coins etc...
            if (resp.data.error.error === "insufficient funds") {
              Alert.alert("Error", `Insufficient funds.`, [
                { text: "OK", onPress: this.handleCancel }
              ]);
            }
          }
        })
        .catch(err => {
          // alert there was an error with the post request
          Alert.alert(
            "Block Party Error",
            `There was an error on our part :(.  Try again later`,
            [{ text: "OK", onPress: this.handleCancel }]
          );
        });
    } else {
      axios
        .post(
          `${apiUrl}/handlerof`,
          {
            rofId,
            accepted
          },
          {
            headers: {
              Authorization: this.state.token,
              "Content-Type": "application/json"
            }
          }
        )
        .then(resp => {
          if (resp.data.success) {
            Alert.alert("Request Rejected", `Success!`, [
              { text: "OK", onPress: this.getROFS }
            ]);
          } else {
            Alert.alert(
              "Block Party Error",
              `There was an error on our part :(.  Try again later`,
              [{ text: "OK", onPress: this.handleCancel }]
            );
          }
        })
        .catch(err => {
          console.log(err);
          // alert there was an error with the post request backend
          Alert.alert(
            "Block Party Error",
            `There was an error on our part :(.  Try again later`,
            [{ text: "OK", onPress: this.handleCancel }]
          );
        });
    }
  };

  render() {
    return (
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%",
          backgroundColor: "#0b0c10"
        }}
      >
        {this.state.searchResults && this.state.wallets && this.state.rofs ? (
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
                <View style={{ backgroundColor: "#1f2833" }}>
                  <Text
                    style={{
                      marginLeft: 15,
                      marginVertical: 5,
                      fontSize: 26,
                      fontFamily: "space-mono-regular",
                      color: "#66fcf1"
                    }}
                  >
                    {section.key}
                  </Text>
                </View>
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
                      title={
                        <View style={{ marginLeft: 15 }}>
                          <Text style={styles.itemTitle}>{item.coin}</Text>
                        </View>
                      }
                      titleStyle={{ color: "#66fcf1" }}
                      leftIcon={
                        <Icon
                          size={28}
                          color="#45a29e"
                          name={WalletsList.coinIcons[item.coinAbbr].name}
                          type={WalletsList.coinIcons[item.coinAbbr].type}
                          resizeMode="contain"
                        />
                      }
                      containerStyle={{ borderBottomWidth: 0 }}
                      rightIcon={{ name: "add", color: "#45a29e" }}
                      onPress={() => {
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
                      title={
                        <View style={{ marginLeft: 15 }}>
                          <Text style={styles.itemTitle}>{item.coin}</Text>
                        </View>
                      }
                      titleStyle={{ color: "#66fcf1" }}
                      subtitle={
                        <View style={{ flexDirection: "row", marginLeft: 15 }}>
                          <Text
                            style={{
                              fontFamily: "space-mono-regular",
                              color: "#45a29e"
                            }}
                          >
                            Balance: {item.balance} |{" "}
                          </Text>
                          <Text
                            style={{
                              color: "#66fca7",
                              fontFamily: "space-mono-regular"
                            }}
                          >
                            ${item.usdBalance}{" "}
                          </Text>
                        </View>
                      }
                      leftIcon={
                        <Icon
                          size={28}
                          color="#45a29e"
                          name={WalletsList.coinIcons[item.coinAbbr].name}
                          type={WalletsList.coinIcons[item.coinAbbr].type}
                          resizeMode="contain"
                        />
                      }
                      underlayColor="#45a29e"
                      chevronColor="#66fcf1"
                      containerStyle={{ borderBottomWidth: 0 }}
                      onPress={() => {
                        this.handleWalletClick(item);
                      }}
                    />
                  );
                }
              },
              {
                data: this.state.rofs,
                key: "Fund Requests",
                keyExtractor: item => item._id,
                renderItem: ({ item }) => {
                  if (item.sender.username === this.state.username) {
                    return (
                      <ListItem
                        roundAvatar
                        title={`To ${item.receiver.username}`}
                        titleStyle={styles.itemTitle}
                        subtitle={`${item.amount} ${item.coinFull}`}
                        subtitleStyle={{
                          fontFamily: "space-mono-regular",
                          color: "#45a29e"
                        }}
                        containerStyle={{ borderBottomWidth: 0 }}
                        rightIcon={
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center"
                            }}
                          >
                            <Button
                              clear
                              textStyle={{
                                color: "#fc6670",
                                fontFamily: "space-mono-bold"
                              }}
                              buttonStyle={styles.rejectROFBtn}
                              text="Cancel"
                              onPress={() => this.handleROF(item._id, false)} // TODO: alert says "Rejected Success"  should say "Removed Success"
                            />
                          </View>
                        }
                      />
                    );
                  } else {
                    return (
                      <ListItem
                        roundAvatar
                        title={`From ${item.sender.username}`}
                        titleStyle={styles.itemTitle}
                        subtitle={`${item.amount} ${item.coinFull}`}
                        subtitleStyle={{
                          fontFamily: "space-mono-regular",
                          color: "#45a29e"
                        }}
                        containerStyle={{ borderBottomWidth: 0 }}
                        rightIcon={
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center"
                            }}
                          >
                            <Button
                              clear
                              textStyle={{
                                color: "#66fcf1",
                                fontFamily: "space-mono-bold"
                              }}
                              text="Accept"
                              buttonStyle={styles.acceptROFBtn}
                              onPress={() => {
                                console.log("CLICKED");
                                this.handleROF(item._id, true);
                              }}
                            />
                            <Button
                              clear
                              textStyle={{
                                color: "#fc6670",
                                fontFamily: "space-mono-bold"
                              }}
                              buttonStyle={styles.rejectROFBtn}
                              text="Reject"
                              onPress={() => this.handleROF(item._id, false)}
                            />
                          </View>
                        }
                      />
                    );
                  }
                }
              }
            ]}

            // onEndReached={this.handleLoadMore}
            // onEndReachedThreshold={50}
          />
        ) : null}
        {this.state.selectedWallet && (
          <Overlay isVisible height="auto" overlayBackgroundColor="#0b0c10">
            <View style={{ flexDirection: "column" }}>
              <Header
                backgroundColor="#0b0c10"
                outerContainerStyles={{
                  height: "30%",
                  paddingVertical: 5,
                  marginBottom: 5,
                  borderBottomColor: "#45a29e"
                }}
                centerComponent={
                  <Text style={{ color: "#66fcf1", fontSize: 24 }}>
                    {this.state.selectedWallet.coin}
                  </Text>
                }
                leftComponent={
                  <Icon
                    size={28}
                    color="#45a29e"
                    name={
                      WalletsList.coinIcons[this.state.selectedWallet.coinAbbr]
                        .name
                    }
                    type={
                      WalletsList.coinIcons[this.state.selectedWallet.coinAbbr]
                        .type
                    }
                  />
                }
                rightComponent={
                  <Icon
                    color="#fc6670"
                    size={24}
                    type="entypo"
                    name="cross"
                    onPress={this.closeModal}
                  />
                }
              />
              <Text style={{ marginVertical: 15, color: "#45a29e" }}>
                Address: {this.state.selectedWallet.address}
              </Text>
              <Button
                clear
                buttonStyle={{
                  borderColor: "#66fcf1",
                  borderBottomWidth: 2,
                  borderRadius: 0
                }}
                textStyle={{ color: "#66fcf1", fontFamily: "space-mono-bold" }}
                text="Copy Address"
                onPress={async () => {
                  await Clipboard.setString(this.state.selectedWallet.address);
                  alert("Copied Address to Clipboard");
                }}
              />
            </View>
          </Overlay>
        )}
      </List>
    );
  }
}

const styles = StyleSheet.create({
  rejectROFBtn: {
    borderColor: "#fc6670",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0,
    marginRight: 10
  },
  acceptROFBtn: {
    borderColor: "#66fcf1",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0,
    marginRight: 15
  },
  itemTitle: {
    fontFamily: "space-mono-regular",
    fontSize: 18,
    color: "#66fcf1"
  }
});
