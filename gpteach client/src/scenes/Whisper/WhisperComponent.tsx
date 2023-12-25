import { useState, useEffect, useCallback } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";

import { Emotion } from "@/shared/types";
import { useSelector } from "react-redux";

type Props = {
  setEmotion: (value: Emotion) => void;
  setAudioBuffer: (value: AudioBuffer) => void;

  setDrawCommands: (value: any) => void;

  setIsAudioPlayComplete: (value: boolean | null) => void;
  audioPlayComplete: boolean | null;
};

const AudioRecorder = ({
  setEmotion,
  setAudioBuffer,
  setDrawCommands,
  setIsAudioPlayComplete,
  audioPlayComplete,
}: Props) => {
  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime,
  } = useAudioRecorder();

  const userId = useSelector((state: any) => state.user);
  const token = useSelector((state: any) => state.token);

  const [conversationButtonPressed, setConversationButtonPressed] =
    useState<boolean>(false);
  interface DrawObj {
    drawLines: string[];
    drawCircles: any[];
    addText: string[]; // You might want to replace 'any' with the actual type for circles
    clearCanvas: boolean;
  }

  const [conversationStarted, setConversationStarted] =
    useState<boolean>(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const [recordTime, setRecordTime] = useState<number>(0);
  const [showInsufficientCreditMessage, setShowInsufficientCreditMessage] =
    useState<boolean>(false);

  const buttonStyle = `bg-tertiary-50 w-fit p-3 text-white`;

  const startConversation = async (): Promise<void> => {
    try {
      setIsAudioPlayComplete(false);
      setConversationButtonPressed(true);
      console.log(audioPlayComplete);
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL
        }/api/ai/start-thread`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Specify the content type as JSON
          },
          body: JSON.stringify({ userId }), // Convert user object to JSON string
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setEmotion(Emotion.Happy);
      const responseData = await response.json();

      if (responseData.error == "Insufficient credit") {
        setShowInsufficientCreditMessage(true);
        setTimeout(function () {
          setShowInsufficientCreditMessage(false);
        }, 3000);
        return;
      }

      const audioData = responseData.audio;
      const responseMessage = responseData.responseText;
      console.log(responseMessage);
      setThreadId(responseData.threadId);
      setRunId(responseData.runId);

      const arrayBuffer = new Uint8Array(audioData.data).buffer;
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        setAudioBuffer(buffer);

        const emotionRegex = /\[E\](.*?)\[\/E\]/;
        const matches = emotionRegex.exec(responseMessage);
        console.log(matches);
        const emotion =
          matches && matches.length > 1 ? (matches[1] as Emotion) : null;

        if (emotion !== null) {
          setEmotion(emotion);
        }
      });

      setConversationStarted(true);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  useEffect(() => {
    if (!recordingBlob) return;

    setEmotion(Emotion.Think);
    setIsAudioPlayComplete(false);
    const sendRecordingToOpenAI = async () => {
      const formData = new FormData();
      formData.append("file", recordingBlob, "recording.wav");

      if (threadId !== null) {
        formData.append("threadId", threadId);
      }

      if (runId !== null) {
        formData.append("runId", runId);
      }

      formData.append("userId", userId);

      console.log("recording time", recordTime);
      formData.append("recordTime", String(recordTime));

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT_BASE_URL}/api/transcribe`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.error == "Insufficient credit") {
          setShowInsufficientCreditMessage(true);
          setTimeout(function () {
            setShowInsufficientCreditMessage(false);
          }, 3000);
          return;
        }

        const audioData = responseData.audio;
        const responseMessage = responseData.responseText;
        console.log(responseMessage);
        const arrayBuffer = new Uint8Array(audioData.data).buffer;
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          setAudioBuffer(buffer);

          const drawObj: DrawObj = {
            drawLines: [],
            drawCircles: [],
            addText: [],
            clearCanvas: false,
          };

          const clearCanvasPattern = /\[CC\]/g;
          const clearCanvasMatches = clearCanvasPattern.exec(responseMessage);

          if (clearCanvasMatches) {
            drawObj.clearCanvas = true;
          }

          const addTextPattern = /\[CT\]([^[]*?)\[\/CT\]/g;
          const allTextMatches = [];

          // Use RegExp.exec in a loop to find all matches
          let match;
          while ((match = addTextPattern.exec(responseMessage)) !== null) {
            const extractedText = match[1];
            allTextMatches.push(extractedText);
            console.log(allTextMatches);
          }
          if (allTextMatches.length > 0) {
            drawObj.addText = allTextMatches;
          }

          const drawLinePattern = /\[DL\]([^[]*?)\[\/DL\]/g;

          // Initialize an array to store all matches
          const allLineMatches = [];

          // Use RegExp.exec in a loop to find all matches

          while ((match = drawLinePattern.exec(responseMessage)) !== null) {
            const extractedText = match[1];
            allLineMatches.push(extractedText);
            console.log(allLineMatches);
          }
          if (allLineMatches.length > 0) {
            drawObj.drawLines = allLineMatches;
          }
          const drawCirclePattern = /\[DC\]([^[]*?)\[\/DC\]/g;

          const allCircleMatches = [];

          while ((match = drawCirclePattern.exec(responseMessage)) !== null) {
            const extractedText = match[1];
            allCircleMatches.push(extractedText);
            console.log(allCircleMatches);
          }

          if (allCircleMatches.length > 0) {
            drawObj.drawCircles = allCircleMatches;
          }

          setDrawCommands(drawObj);

          const emotionRegex = /\[E\](.*?)\[\/E\]/;
          const matches = emotionRegex.exec(responseMessage);
          const emotion =
            matches && matches.length > 1 ? (matches[1] as Emotion) : null;

          if (emotion !== null) {
            setEmotion(emotion);
          } else {
            setEmotion(Emotion.Neutral);
          }
        });
      } catch (error) {
        console.error("Error during API request:", error);
      }
    };

    sendRecordingToOpenAI();
  }, [recordingBlob, threadId, runId, setEmotion]);

  const sendRecording = async () => {
    setRecordTime(recordingTime);
    stopRecording();
  };

  // useEffect(() => {
  //   if (!audioPlayComplete) return;

  //   startRecording();
  // }, [audioPlayComplete]);

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.code === "Space" &&
        conversationStarted &&
        audioPlayComplete &&
        isRecording
      ) {
        event.preventDefault();
        sendRecording();
      }
    },
    [conversationStarted, audioPlayComplete, isRecording, sendRecording]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.code === "Space" &&
        conversationStarted &&
        audioPlayComplete &&
        !isRecording
      ) {
        event.preventDefault();
        startRecording();
      }
    },
    [conversationStarted, audioPlayComplete, isRecording, startRecording]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex flex-col gap-20 justify-center items-center w-full h-full rounded p-10 mb-10">
      {conversationStarted && audioPlayComplete ? (
        <h1 className="text-2xl">PRESS AND HOLD SPACEBAR TO RESPOND</h1>
      ) : null}

      {!conversationStarted && !conversationButtonPressed && (
        <button className={buttonStyle} onClick={startConversation}>
          Start Conversation
        </button>
      )}
      {showInsufficientCreditMessage && (
        <div className="text-red-500 mt-2">
          Insufficient credit. Please recharge your account.
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
