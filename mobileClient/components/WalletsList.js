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
// import { Font } from 'expo';

export default class WalletsList extends React.Component {
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
      modalVisible: false,
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
      }
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
          // text={
          //   <Text style={{ fontFamily: "space-mono-regular"}}>
          //     {buttonText}
          //   </Text>
          // }
          buttonStyle={{
            height: 45,
            borderColor: "transparent",
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
          borderColor: "#CED0CE"
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
        .post(`${apiUrl}/handlerof`, {
          rofId,
          accepted
        },
          {
            headers: {
              Authorization: this.state.token,
              "Content-Type": "application/json"
            }
          })
        .then(resp => {

          // if wasnt successful (you dont have enough coin, etc...)
          // handle that
          if (resp.data.success) {
            Alert.alert(
              "Transaction Sent",
              `Transaction ID: ${resp.data.txId}`,
              [{ text: "OK", onPress: this.getROFS }]
            );
          }
          else {
            // handle that user doenst have enough coins etc...
            if (resp.data.error.error === "insufficient funds") {
              Alert.alert(
                "Error",
                `Insufficient funds.`,
                [{ text: "OK", onPress: this.handleCancel }]
              );
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
        })
    }
    else {
      axios
        .post(`${apiUrl}/handlerof`, {
          rofId,
          accepted
        },
          {
            headers: {
              Authorization: this.state.token,
              "Content-Type": "application/json"
            }
          })
        .then(resp => {
          if (resp.data.success) {
            Alert.alert(
              "Request Rejected",
              `Success!`,
              [{ text: "OK", onPress: this.getROFS }]
            );
          }
          else {
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
        })
    }

  }

  render() {
    return (
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%"
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
                <Text h4 style={{ marginLeft: 15, marginVertical: 5, fontFamily: "megrim"}}>
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
                      // onPress={() => this.addWallet(item.coinAbbr)} // click anywhere on listitme to add wallet
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
                        <View style={{ marginLeft: 15}}>
                          <Text style={{ fontFamily: "space-mono-bold" }}>
                            {item.coin}
                          </Text>
                        </View>
                      }
                      subtitle={
                        <View style={{ flexDirection: "row", marginLeft: 15 }}>
                          <Text style={{ fontFamily: "space-mono-regular"}}>Balance: {item.balance} | </Text>
                          <Text style={{ color: "green", fontFamily: "space-mono-regular" }}>
                            ${item.usdBalance}{" "}
                          </Text>
                        </View>
                      }
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
                      onPressRightIcon={() => {
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
                        backgroundColor="blue"
                        title={`To ${item.receiver.username}`}
                        subtitle={`${item.amount} ${item.coinFull}`}
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
                              textStyle={{ color: "tomato" }}
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
                        backgroundColor="violet"
                        title={`From ${item.sender.username}`}
                        subtitle={`${item.amount} ${item.coinFull}`}
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
                              textStyle={{ color: "limegreen" }}
                              text="Accept"
                              buttonStyle={styles.acceptROFBtn}
                              onPress={() => this.handleROF(item._id, true)}
                            />
                            <Button
                              clear
                              textStyle={{ color: "tomato" }}
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
          <Overlay isVisible height="auto">
            <View style={{ flexDirection: "column" }}>
              <Header
                backgroundColor="white"
                outerContainerStyles={{
                  height: "30%",
                  paddingVertical: 5,
                  marginBottom: 5
                }}
                centerComponent={
                  <Text style={{ color: "gray", fontSize: 24 }}>
                    {this.state.selectedWallet.coin}
                  </Text>
                }
                leftComponent={
                  <Image
                    style={{
                      height: 32,
                      width: 32,
                      marginRight: 5,
                      marginLeft: -5
                    }}
                    source={icons[this.state.selectedWallet.coinAbbr]}
                    resizeMode="contain"
                  />
                }
                rightComponent={
                  <Icon
                    color="gray"
                    size={24}
                    type="entypo"
                    name="cross"
                    onPress={this.closeModal}
                  />
                }
              />
              <Text style={{ marginVertical: 15 }}>
                Address: {this.state.selectedWallet.address}
              </Text>
              <Button
                // style={{marginTop: 15}}
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
    borderColor: "tomato",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0,
    marginRight: 10
  },
  acceptROFBtn: {
    borderColor: "limegreen",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0,
    marginRight: 40
  }
});