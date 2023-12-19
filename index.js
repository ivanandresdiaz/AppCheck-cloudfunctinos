/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { getAppCheck } = require("firebase-admin/app-check");

admin.initializeApp(); // if you use firebase admin in other
//  backend you will have to attach the service account here
// if the firebase SDK is not avaliable for you language, you can check the next
// https://youtu.be/eMa0hsHqfHU

exports.callableFunctionsv2 = onCall(
  // { enforceAppCheck: true, consumeAppCheckToken: true },
  { cors: true },
  (data, context) => {
    console.log("context", context.app.already_consume);
    return {
      // data,
      // context,
      d: "Hello from callable v2 function",
    };
  }
);
//
exports.callableFunctions = functions
  .runWith({
    enforceAppCheck: true,
    // consumeAppCheckToken: true
  })
  .https.onCall((data, context) => {
    // This is
    return {
      // data,
      // context,
      d: "Hello from callable function",
    };
  });

exports.helloWorld = onRequest(
  {
    cors: true,
    enforceAppCheck: true,
    // consumeAppCheckToken: true
  },
  (request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    return response.status(200).json({ d: "Hello from on REquest" });
  }
);

const appCheckVerification = async (req, res, next) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    res.status(401);
    return next("Unauthorized");
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    // If verifyToken() succeeds, continue with the next middleware
    // otherwise will throw an error
    // function in the stack.
    return next();
  } catch (err) {
    res.status(401);
    return next("Unauthorized");
  }
};

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.get("/", appCheckVerification, (req, res) => {
  return res.status(200).json({ d: "Hello from express" });
});

exports.thirdBackend = onRequest(app);
