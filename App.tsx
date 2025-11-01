import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated
 
} from "react-native";

const CODE_LENGTH = 4;
const RESEND_WAIT_TIME = 60; // seconds to re-enable resend

const OtpVerificationScreen: React.FC = () => {
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [countdown, setCountdown] = useState<number>(RESEND_WAIT_TIME);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const inputRefs = useRef<[]>([]);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Start timer when countdown > 0
  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle OTP input
  const handleDigitChange = (text: string, idx: number) => {
    const value = text.slice(-1); // just keep last digit
    const updated = [...codeDigits];
    updated[idx] = value;
    setCodeDigits(updated);

    if (value && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    if (updated.join("").length === CODE_LENGTH) {
      Keyboard.dismiss();
    }
  };

  // Verify the entered code (mock)
  const verifyCode = () => {
    const enteredCode = codeDigits.join("");
    if (enteredCode.length !== CODE_LENGTH) {
      alert("Please enter the full 4-digit code first.");
      return;
    }

    setVerifying(true);
    console.log("Entered OTP:", enteredCode);

    // simulate network request
    setTimeout(() => {
      console.log("✅ Code verified successfully");
      setVerifying(false);
      runSuccessAnimation();
    }, 2000);
  };

  // Play success animation
  const runSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // hide success popup after 2.5s
    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
        setCodeDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      });
    }, 1500);
  };

  // Resend OTP
  const resendCode = () => {
    if (!canResend) return;
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    setCountdown(RESEND_WAIT_TIME);
    setCanResend(false);
    console.log("🔁 New OTP sent to user.");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screenWrapper}>
        <Text style={styles.title}>OTP Verification</Text>

        <Text style={styles.description}>
          Enter the verification code we just sent you on
        </Text>

        <Text style={styles.userEmail}>example@gmail.com</Text>

        <View style={styles.codeBoxRow}>
          {codeDigits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputRefs.current[i] = ref)}
              style={styles.codeBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              editable={!verifying && !showSuccess}
              onChangeText={(t) => handleDigitChange(t, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && i > 0 && !codeDigits[i]) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, verifying && { opacity: 0.6 }]}
          onPress={verifyCode}
          disabled={verifying || showSuccess}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.bottomNote}>
          Didn’t receive the code?
          {canResend ? (
            <Text style={styles.resendLink} onPress={resendCode}>
              {" "}Resend
            </Text>
          ) : (
            <Text style={styles.timerLabel}>  Resend in {countdown}s</Text>
          )}
        </Text>

        {/* Success popup */}
       {showSuccess && (
  <View style={styles.successOverlay}>
    <Animated.View
      style={[
        styles.successBox,
        {
          opacity: successAnim,
          transform: [
            {
              scale: successAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* <Text style={styles.successEmoji}>✅</Text> */}
      <Text style={styles.successMessage}>OTP Verified Successfully!</Text>
    </Animated.View>
  </View>
)}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 22,
    color: "#444",
    fontWeight: "500",
    textAlign: "left",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 30,
  },
  codeBoxRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  codeBox: {
    width: 75,
    height: 75,
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 8,
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#5A5A5A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomNote: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  resendLink: {
    fontWeight: "700",
    color: "#5A5A5A",
  },
  timerLabel: {
    fontWeight: "600",
    color: "#777",
  },
successOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.8)", // subtle dim; tweak if you want stronger
},

successBox: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#E0E0E0",
  borderRadius: 12,
  paddingVertical: 20,
  paddingHorizontal: 30,
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 5,
  elevation: 5,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 260,
},
  successEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
