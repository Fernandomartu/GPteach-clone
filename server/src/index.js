const express = require("express");
const app = express();
const { PORT, CLIENT_URL } = require("./constants");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const { Readable } = require("stream");
const axios = require("axios");
const { craftResponse } = require("./controllers/ai");
const db = require("./db");
const { userAuth } = require("./middlewares/auth-middleware");
const { updateUserCredit } = require("./controllers/stripe");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const bufferToStream = (buffer) => {
  return Readable.from(buffer);
};

const upload = multer();

require("./middlewares/passport-middleware");

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSucceeded = event.data.object;

        const email = checkoutSucceeded.customer_email;
        const amountPaid = checkoutSucceeded.amount_total / 100;
        await updateUserCredit(email, amountPaid);

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(passport.initialize());
//import routes
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");

//initialize routes
app.use("/api", authRoutes);
app.use("/api/ai", aiRoutes);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const amountInCents = req.body.amount * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "credit_charge" },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/billing`,
      cancel_url: `${process.env.CLIENT_URL}/billing`,
      customer_email: req.body.customerEmail,
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post(
  "/api/transcribe",
  userAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      const audioFile = req.file;
      const threadId = req.body.threadId;
      const runId = req.body.runId;
      const userId = req.body.userId;
      const recordTime = req.body.recordTime;

      const searchUser = await db.query(
        "SELECT * FROM users WHERE user_id = $1",
        [userId]
      );

      const user = searchUser.rows[0];

      if (!user || user.credit <= 0) {
        // Send an error response to the frontend
        return res.status(200).json({ error: "Insufficient credit" });
      }

      if (!audioFile) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const formData = new FormData();
      const audioStream = bufferToStream(audioFile.buffer);

      formData.append("file", audioStream, {
        filename: "recording.wav",
        contentType: audioFile.mimetype,
      });

      formData.append("model", "whisper-1");
      formData.append("response_format", "json");
      const config = {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      };
      // Call the OpenAI Whisper API to transcribe the audio

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        config
      );

      const COST_PER_MINUTE = 0.006;
      const recordTimeInt = parseInt(recordTime);
      const recordingTimeInMinutes = recordTimeInt / 60;
      const cost = recordingTimeInMinutes * COST_PER_MINUTE;

      const updatedCredit = user.credit - cost;

      console.log("BEOFRE UPDATE", user.credit);
      await db.query("UPDATE users SET credit = $1 WHERE user_id = $2", [
        updatedCredit,
        user.user_id,
      ]);

      const updatedUserQueryResult = await db.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user.user_id]
      );

      const updatedUser = updatedUserQueryResult.rows[0];

      console.log("AFTER UPDATE", updatedUser.credit);

      const transcription = response.data.text;

      const craftedResponse = await craftResponse(
        transcription,
        threadId,
        runId,
        userId
      );

      res.setHeader("Content-Type", "application/json");
      res.send({
        audio: craftedResponse.responseAudio,
        responseText: craftedResponse.responseText,
      });
    } catch (error) {
      res.status(500).json({ error: "Error transcribing audio" });
    }
  }
);

const appStart = () => {
  try {
    app.listen(PORT, () => {
      console.log(`the app is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Error:  ${error.message}`);
  }
};

appStart();
