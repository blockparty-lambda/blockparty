import React from "react";
import {
  StyleSheet,
  View,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
  Alert,
  Keyboard
} from "react-native";
import axios from "axios";
import { apiUrl } from "../config";
import {
  Header,
  List,
  ListItem,
  SearchBar,
  Button,
  Text,
  Overlay,
  Input,
  Icon,
  Avatar,
  ButtonGroup
} from "react-native-elements";

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      query: "",
      transactionAmount: "",
      reason: "",
      selectedIndex: 0,
      acceptedFriends: [],
      requestedFriends: [],
      pendingFriends: [],
      searchResults: [],
      refreshing: false,
      loading: false,
      sendModalVisible: false,
      requestModalVisible: false,
      sendRequestModalVisible: false,
      selectedFriend: null
    };
  }

  // call our api to get the users apis
  // set result to state
  async componentDidMount() {
    this.setState({ token: await AsyncStorage.getItem("jwt") });
    this.getFriendData();
  }

  getFriendData = async () => {
    this.setState({ loading: true });

    axios
      .get(`${apiUrl}/getfriends`, {
        headers: {
          Authorization: this.state.token
        }
      })
      .then(response => {
        // Ternary insanity
        const {
          acceptedFriends,
          pendingFriends,
          requestedFriends
        } = response.data.friends.reduce(
          (result, friend) =>
            friend.status === "accepted"
              ? (result.acceptedFriends.push(friend), result)
              : friend.status === "pending"
                ? (result.pendingFriends.push(friend), result)
                : friend.status === "requested"
                  ? (result.requestedFriends.push(friend), result)
                  : result,
          { acceptedFriends: [], pendingFriends: [], requestedFriends: [] }
        );

        this.setState({
          acceptedFriends,
          pendingFriends,
          requestedFriends,
          loading: false,
          refreshing: false,
          searchResults: []
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  acceptFriendRequest = async friend => {
    await axios.post(
      `${apiUrl}/addfriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  rejectFriendRequest = async friend => {
    await axios.post(
      `${apiUrl}/removefriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.getFriendData();
      }
    );
  };

  handleSearch = async () => {
    const query = this.state.query;
    try {
      if (query === "") {
        return this.setState({ searchResults: [] });
      }
      const results = await axios.get(`${apiUrl}/partialusers?query=${query}`, {
        headers: { Authorization: this.state.token }
      });

      this.setState({ searchResults: results.data.users });
    } catch (error) {
      console.log(error);
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

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Search friends..."
        onSubmitEditing={this.handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
        value={this.state.query}
        onChangeText={text => {
          this.setState({ query: text }, () => {
            this.handleSearch();
          });
        }}
        onClearText={this.getFriendData}
        clearIcon
        lightTheme
        round
      />
    );
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

  handleFriendClick = friend => {
    this.setState({ selectedFriend: friend, sendRequestModalVisible: true });
  };

  handleToSendClick = () => {
    this.setState({
      sendModalVisible: true,
      sendRequestModalVisible: false
    });
  };

  handleToRequestClick = () => {
    this.setState({
      requestModalVisible: true,
      sendRequestModalVisible: false
    });
  };

  handleCancel = () => {
    this.setState({
      selectedFriend: null,
      requestModalVisible: false,
      sendModalVisible: false,
      sendRequestModalVisible: false,
      transactionAmount: "",
      reason: ""
    });
  };

  updateIndex = idx => {
    this.setState({ selectedIndex: idx });
  };

  handleSend = async () => {
    const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/send`,
      {
        friendId: this.state.selectedFriend._id,
        coin: selectedCoin[this.state.selectedIndex],
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert(
        "Transaction Sent",
        `Transaction ID: ${transaction.data.txId}`,
        [{ text: "OK", onPress: this.handleCancel }]
      );
    } else {
      if (transaction.data.error.error === "insufficient funds") {
        Alert.alert("Transaction Failed", "Insufficient funds", [
          { text: "OK", onPress: this.handleCancel }
        ]);
      }
    }
  };

  handleROF = async () => {
    const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/requestfunds`,
      {
        receiver: this.state.selectedFriend._id,
        coin: selectedCoin[this.state.selectedIndex],
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert("Request Sent", `${transaction.data.message}`, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    } else {
      Alert.alert("Transaction Failed", transaction.data.message, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    }
  };

  render() {
    const buttons = ["Eth", "Btc", "Eth Test", "Btc Test"];
    return (
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%"
        }}
      >
        <SectionList
          keyExtractor={item => item._id}
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
              <Text h4 style={{ marginLeft: 15, marginVertical: 5, fontFamily: "megrim" }}>
                {section.key}
              </Text>
            );
          }}
          sections={[
            {
              data: this.state.searchResults,
              key: "Search Results",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={{ fontFamily: "space-mono-bold", fontSize: 20 }}>
                          {item.username}
                        </Text>
                      </View>
                    }
                    avatar={{ uri: item.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={{
                      type: "entypo",
                      name: "add-user",
                      color: "limegreen"
                    }}
                    onPressRightIcon={() => {
                      this.acceptFriendRequest(item);
                    }}
                  />
                );
              }
            },
            {
              data: this.state.pendingFriends,
              key: "Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={{ fontFamily: "space-mono-bold", fontSize: 20 }}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    subtitle="Friend Request Received"
                    avatar={{ uri: item.friend.avatarUrl }}
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
                          text="Yes"
                          buttonStyle={styles.sendBtn}
                          onPress={() => this.acceptFriendRequest(item)}
                        />
                        <Button
                          clear
                          textStyle={{ color: "tomato" }}
                          buttonStyle={styles.cancelBtn}
                          text="No"
                          onPress={() => this.rejectFriendRequest(item)}
                        />
                      </View>
                    }
                  />
                );
              }
            },
            {
              data: this.state.requestedFriends,
              key: "Sent Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={{ fontFamily: "space-mono-bold", fontSize: 20 }}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    subtitle="Friend Request Sent"
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={
                      <Button
                        clear
                        textStyle={{ color: "tomato" }}
                        buttonStyle={styles.cancelBtn}
                        text="Cancel"
                        onPress={() => this.rejectFriendRequest(item)}
                      />
                    }
                  />
                );
              }
            },
            {
              data: this.state.acceptedFriends,
              key: "Friends",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={{ fontFamily: "space-mono-bold", fontSize: 20 }}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    onPress={() => this.handleFriendClick(item.friend)}
                  />
                );
              }
            }
          ]}
        />

        {/* send or request funds modal */}
        {this.state.sendRequestModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto">
              <View>
                <Header
                  backgroundColor="white"
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24, fontFamily: "space-mono-regular" }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 5
                    }}
                  >
                    <Button
                      text="Send"
                      clear
                      textStyle={{ color: "limegreen", fontFamily: "space-mono-bold" }}
                      buttonStyle={styles.sendBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleToSendClick}
                    />
                    <Button
                      text="Request"
                      clear
                      textStyle={{ color: "dodgerblue", fontFamily: "space-mono-bold" }}
                      buttonStyle={styles.requestBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleToRequestClick}
                    />
                    <Button
                      text="Cancel"
                      clear
                      textStyle={{ color: "tomato", fontFamily: "space-mono-bold" }}
                      buttonStyle={styles.cancelBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

        {/* request money modal */}
        {this.state.requestModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto" width="auto">
              <View>
                <Header
                  backgroundColor="white"
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24, fontFamily: "space-mono-regular" }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <Input
                    placeholder="amount..."
                    value={this.state.transactionAmount}
                    keyboardType="numeric"
                    onChangeText={text =>
                      this.setState({ transactionAmount: text })
                    }
                  />
                  <Input
                    placeholder="What's it for?"
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    selectedButtonStyle={{
                      backgroundColor: "white",
                      borderBottomWidth: 2,
                      borderColor: "dodgerblue"
                    }}
                    textStyle={{ fontFamily: "space-mono-regular", fontSize: 13 }}
                    selectedTextStyle={{
                      color: "dodgerblue",
                      fontFamily: "space-mono-bold",
                      fontSize: 13
                    }}
                    containerStyle={styles.coinBtns}
                  />
                  <View style={styles.confirmBtns}>
                    <Button
                      text="Request"
                      buttonStyle={styles.requestBtn}
                      clear
                      textStyle={{ color: "dodgerblue", fontFamily: "space-mono-bold" }}
                      containerStyle={styles.btnContainer}
                      onPress={() => {
                        Alert.alert("Confirm Request", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleROF }
                        ]);
                      }}
                    />
                    <Button
                      buttonStyle={styles.cancelBtn}
                      text="Cancel"
                      clear
                      textStyle={{ color: "tomato", fontFamily: "space-mono-bold" }}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

        {/* send money modal */}
        {this.state.sendModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto">
              <View>
                <Header
                  backgroundColor="white"
                  centerComponent={
                    <Text style={{ color: "gray", fontSize: 24, fontFamily: "space-mono-regular" }}>
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <Input
                    placeholder="amount..."
                    value={this.state.transactionAmount}
                    keyboardType="numeric"
                    onChangeText={text =>
                      this.setState({ transactionAmount: text })
                    }
                  />
                  <Input
                    placeholder="What's it for?"
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <ButtonGroup
                    onPress={this.updateIndex}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    selectedButtonStyle={{
                      backgroundColor: "white",
                      borderBottomWidth: 2,
                      borderColor: "dodgerblue"
                    }}
                    textStyle={{ fontFamily: "space-mono-regular", fontSize: 13 }}
                    selectedTextStyle={{
                      color: "dodgerblue",
                      fontFamily: "space-mono-bold",
                      fontSize: 13
                    }}
                    containerStyle={styles.coinBtns}
                  />
                  <View style={styles.confirmBtns}>
                    <Button
                      text="Send"
                      buttonStyle={styles.sendBtn}
                      containerStyle={styles.btnContainer}
                      clear
                      textStyle={{ color: "limegreen", fontFamily: "space-mono-bold" }}
                      onPress={() => {
                        Alert.alert("Confirm Transaction", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleSend }
                        ]);
                      }}
                    />
                    <Button
                      buttonStyle={styles.cancelBtn}
                      clear
                      containerStyle={styles.btnContainer}
                      text="Cancel"
                      textStyle={{ color: "tomato", fontFamily: "space-mono-bold" }}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}
      </List>
    );
  }
}

const styles = StyleSheet.create({
  modalColumn: {
    flexDirection: "column",
    marginVertical: 15
  },
  coinBtns: {
    height: 35,
    marginTop: 15
  },
  confirmBtns: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15
  },
  cancelBtn: {
    // backgroundColor: "tomato",
    borderColor: "tomato",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  sendBtn: {
    // backgroundColor: "limegreen"
    borderColor: "limegreen",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  requestBtn: {
    // backgroundColor: "limegreen"
    borderColor: "dodgerblue",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  btnContainer: {
    flex: 1,
    alignSelf: "stretch"
  }
});
