const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");
const { countTokens } = require("tiktoken");
const db = require("../db");
const openaiTokenCounter = require("openai-gpt-token-counter");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const filterText = (inputText) => {
  return inputText
    .replace(/\[E\].*?\[\/E\]|\[DL\].*?\[\/DL\]|\[DC\].*?\[\/DC\]/g, "")
    .trim();
};

exports.startThread = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("USERID", userId);
    const searchUser = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    const user = searchUser.rows[0];

    if (!user || user.credit <= 0) {
      // Send an error response to the frontend
      return res.status(200).json({ error: "Insufficient credit" });
    }

    console.log("user found", user);
    const model = "text-davinci-003";
    const inputCostPerToken = 0.01 / 1000;
    const outputCostPerToken = 0.03 / 1000;

    const assistant = await openai.beta.assistants.retrieve(
      "asst_nl1QhBKR360CpxQ4QQiXJgib"
    );

    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: "CONVERSATION INITIATED",
    });

    const inputText = "CONVERSATION INITIATED";
    // Replace with your desired OpenAI model

    const inputTokenCount = openaiTokenCounter.text(inputText, model);

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let response;

    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      if (runStatus.status === "completed") {
        const messages = await openai.beta.threads.messages.list(thread.id);
        response = messages.body.data[0].content;

        break;
      } else if (runStatus.status === "failed") {
        // Handle failure case
        console.log("Assistant response failed");
        break;
      }

      // Sleep for a short duration before checking again
      await sleep(1000); // You can adjust the duration based on your needs
    }

    const outputText = response[0].text.value;

    const outputTokenCount = openaiTokenCounter.text(outputText, model);

    const inputCost = (inputTokenCount * inputCostPerToken).toFixed(3) * 2;
    const outputCost = (outputTokenCount * outputCostPerToken).toFixed(3) * 2;

    const totalCost = inputCost + outputCost;

    const updatedCredit = user.credit - totalCost;

    await db.query("UPDATE users SET credit = $1 WHERE user_id = $2", [
      updatedCredit,
      user.user_id,
    ]);

    const updatedUserQueryResult = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user.user_id]
    );

    const updatedUser = updatedUserQueryResult.rows[0];

    const responseAudio = await convertToSpeech(
      response[0].text.value,
      updatedUser
    );

    const finalUserQuery = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user.user_id]
    );

    const finalUserResult = finalUserQuery.rows[0];

    res.setHeader("Content-Type", "application/json");
    res.send({
      audio: responseAudio,
      threadId: thread.id,
      runId: run.id,
      responseText: response[0].text.value,
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const convertToSpeech = async (text, user) => {
  try {
    const speechFile = path.resolve("./speech.mp3");

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    console.log("credit before transcription", user.credit);

    const charCount = text.length;

    const ttsCost = (charCount / 1000) * 0.015;

    const updatedCredit = user.credit - ttsCost;

    await db.query("UPDATE users SET credit = $1 WHERE user_id = $2", [
      updatedCredit,
      user.user_id,
    ]);

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return buffer;
  } catch (error) {
    console.log(error.message);
  }
};

exports.craftResponse = async (userMessage, threadId, runId, userId) => {
  try {
    const searchUser = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userId]
    );

    const user = searchUser.rows[0];

    const model = "text-davinci-003";
    const inputCostPerToken = 0.01 / 1000;
    const outputCostPerToken = 0.03 / 1000;

    const assistant = await openai.beta.assistants.retrieve(
      "asst_nl1QhBKR360CpxQ4QQiXJgib"
    );

    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    const inputTokenCount = openaiTokenCounter.text(userMessage, model);

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant.id,
    });

    let response;
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );

      if (runStatus.status === "completed") {
        const messages = await openai.beta.threads.messages.list(threadId);
        response = messages.body.data[0].content;

        break;
      } else if (runStatus.status === "failed") {
        // Handle failure case
        console.log("Assistant response failed");
        break;
      }

      // Sleep for a short duration before checking again
      await sleep(1000); // You can adjust the duration based on your needs
    }

    const outputText = response[0].text.value;
    const outputTokenCount = openaiTokenCounter.text(outputText, model);
    const inputCost = (inputTokenCount * inputCostPerToken).toFixed(3) * 2;
    const outputCost = (outputTokenCount * outputCostPerToken).toFixed(3) * 2;
    const totalCost = inputCost + outputCost;

    console.log("totalcost:", totalCost);
    console.log("current user credit", user.credit);
    const updatedCredit = user.credit - totalCost;

    await db.query("UPDATE users SET credit = $1 WHERE user_id = $2", [
      updatedCredit,
      user.user_id,
    ]);

    const updatedUserQueryResult = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user.user_id]
    );

    const updatedUser = updatedUserQueryResult.rows[0];

    console.log("updated credit", updatedCredit);

    const filteredText = filterText(response[0].text.value);

    console.log(filteredText);

    const responseAudio = await convertToSpeech(filteredText, updatedUser);

    const finalUserQuery = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user.user_id]
    );

    const finalUserResult = finalUserQuery.rows[0];
    console.log("credit after transcription", finalUserResult.credit);
    return {
      responseAudio: responseAudio,
      responseText: response[0].text.value,
    };
  } catch (error) {
    console.log(error.message);
  }
};
