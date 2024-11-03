const regexPass =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^.(&*_)-]).{8,32}$/;
const regexEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;
const isValidTagId = /^[a-zA-Z0-9]{8,20}$/; //some NFC tag scanner apps display lowercase letters in the ID, other apps- uppercase. That is why i allow both here. On the BE the tagId will be normalized.
const strInvaidFormat = "Invalid format.";

export const rules = {
  required: (v) => !!v || "Required.",
  isValidPassword: (v) => (v && regexPass.test(v)) || strInvaidFormat,
  isValidEmail: (v) =>
    (regexEmail.test(v) && v.length <= 320) || strInvaidFormat,
  isValidTagId: (v) => isValidTagId.test(v) || strInvaidFormat,
  max(maxNum) {
    return (v) => (v || "").toString().length <= maxNum || "Too long!";
  },
  min(minNum) {
    return (v) => (v || "").toString().length >= minNum || "Too short!";
  },
  equals(strTarget) {
    return (v) => (v || "").toString() === strTarget || "Mismatch!";
  },
};
