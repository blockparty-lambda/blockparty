import { AsyncStorage } from "react-native";

export const onSignIn = token => AsyncStorage.setItem("jwt", token);

export const onSignOut = () => AsyncStorage.removeItem("jwt");

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem("jwt")
      .then(res => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};
