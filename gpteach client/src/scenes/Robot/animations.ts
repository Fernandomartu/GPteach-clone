import { Emotion } from "@/shared/types";

export const animateMouth = (
  robotMouthTop: any,
  robotMouthBottom: any,
  emotion: Emotion,
  dataArray: any,
  source: any,
  robotLeftEyelidBottom: any,
  robotRightEyelidBottom: any,
  robotLeftEyelidTop: any,
  robotRightEyelidTop: any,
  analyser: any,
  robotRef: any
): Promise<void> => {
  return new Promise((resolve) => {
    let robotRotation = 0;
    const animate = () => {
      source.onended = () => {
        // Perform any cleanup or additional logic when audio is done playing
        resolve(); // Resolve the promise when audio is complete
      };

      analyser.getByteFrequencyData(dataArray);

      if (emotion === Emotion.Happy) {
        if (dataArray[0] > 150) {
          robotLeftEyelidBottom.position.y = 3 * (dataArray[0] / 10000);
          robotRightEyelidBottom.position.y = 3 * (dataArray[0] / 10000);
          robotMouthTop.position.y = -4 * (dataArray[0] / 10000);
        }
        if (dataArray[0] > 200 && robotRotation > -0.05) {
          robotRotation -= 0.003;
          robotRef.rotation.x = robotRotation;
        } else {
          if (robotRotation < 0) {
            robotRotation += 0.003;
            robotRef.rotation.x = robotRotation;
          }
        }
      }

      if (emotion === Emotion.Sad) {
        if (dataArray[0] > 150) {
          robotLeftEyelidTop.position.y = 12 * (dataArray[0] / 10000);
          robotRightEyelidTop.position.y = 12 * (dataArray[0] / 10000);
          robotMouthBottom.position.y = -0.334 + dataArray[0] / 10000;
        } else {
          robotMouthBottom.position.y = -0.334;
        }
        if (dataArray[0] > 200 && robotRotation < 0.05) {
          robotRotation += 0.003;
          robotRef.rotation.x = robotRotation;
        } else {
          if (robotRotation > 0) {
            robotRotation -= 0.003;
            robotRef.rotation.x = robotRotation;
          }
        }
      }

      requestAnimationFrame(animate);
    };

    // Initial call to start the animation loop
    animate();
  });
};

export const resetToNeutral = (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidTop: any,
  robotLeftEyelidBottom: any
) => {
  return new Promise<void>((resolve) => {
    const resetFunction = () => {
      if (robotRightEyelidBottom.position.y > -0.06068) {
        robotRightEyelidBottom.position.y -= 0.004;
      }
      if (robotRightEyelidTop.position.y < 0.3049658238887787) {
        robotRightEyelidTop.position.y += 0.004;
      }
      if (robotLeftEyelidTop.position.y < 0.30875) {
        robotLeftEyelidTop.position.y += 0.004;
      }
      if (robotLeftEyelidBottom.position.y > -0.06068) {
        robotLeftEyelidBottom.position.y -= 0.004;
      }

      if (
        robotRightEyelidBottom.position.y <= -0.06068 &&
        robotRightEyelidTop.position.y >= 0.3049658238887787 &&
        robotLeftEyelidTop.position.y >= 0.30875 &&
        robotLeftEyelidBottom.position.y <= -0.06068
      ) {
        resolve(); // Resolve the promise when conditions are met
        return;
      } else {
        // Continue the animation
        requestAnimationFrame(resetFunction);
      }
    };
    resetFunction();
  });
};

export const returnEyeLidsToBasePosition = (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidBottom: any,
  robotLeftEyelidTop: any
) => {
  robotRightEyelidBottom.position.y = -0.0606844536960125;
  robotRightEyelidTop.position.y = 0.3049658238887787;
  robotLeftEyelidBottom.position.y = -0.0606844536960125;
  robotLeftEyelidTop.position.y = 0.3049658238887787;
};

export const blinkEyesUp = (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidBottom: any,
  robotLeftEyelidTop: any
) => {
  // Flag to control the animation loop

  return new Promise<void>((resolve) => {
    const blink = () => {
      if (robotRightEyelidBottom.position.y < 0.0293) {
        robotRightEyelidBottom.position.y += 0.004;
        robotRightEyelidTop.position.y -= 0.004;

        robotLeftEyelidBottom.position.y += 0.004;
        robotLeftEyelidTop.position.y -= 0.004;

        requestAnimationFrame(blink);
      } else {
        // Set the flag to false to stop the animation loop
        resolve();
      }
    };

    blink();
  });
};

export const blinkEyesDown = (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidBottom: any,
  robotLeftEyelidTop: any
) => {
  return new Promise<void>((resolve) => {
    const blink = () => {
      if (
        robotRightEyelidBottom.position.y > -0.06068 &&
        robotLeftEyelidTop.position.y < 0.3049658238887787
      ) {
        robotRightEyelidBottom.position.y -= 0.004;
        robotRightEyelidTop.position.y += 0.004;

        robotLeftEyelidBottom.position.y -= 0.004;
        robotLeftEyelidTop.position.y += 0.004;

        requestAnimationFrame(blink);
      } else {
        returnEyeLidsToBasePosition(
          robotRightEyelidBottom,
          robotRightEyelidTop,
          robotLeftEyelidBottom,
          robotLeftEyelidTop
        );
        resolve();
      }
    };

    blink();
  });
};

export const animateBlink = async (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidBottom: any,
  robotLeftEyelidTop: any
) => {
  await blinkEyesUp(
    robotRightEyelidBottom,
    robotRightEyelidTop,
    robotLeftEyelidBottom,
    robotLeftEyelidTop
  );

  await new Promise((resolve) => setTimeout(resolve, 50));

  await blinkEyesDown(
    robotRightEyelidBottom,
    robotRightEyelidTop,
    robotLeftEyelidBottom,
    robotLeftEyelidTop
  );

  return;
};

export const animateRotateRobotTalk = (
  startingPos: number,
  endPos: number,
  robotRef: any
) => {
  let isAnimating = false;

  const animateRotateUp = () => {
    if (robotRef.rotation.x > endPos) {
      robotRef.rotateX(-0.003);
      requestAnimationFrame(animateRotateUp);
    } else {
      isAnimating = false;
      animateRotateDown(); // Start the rotate down animation
    }
  };

  const animateRotateDown = () => {
    if (robotRef.rotation.x < startingPos) {
      robotRef.rotateX(0.02);
      requestAnimationFrame(animateRotateDown);
    } else {
      isAnimating = false;
      return;
    }
  };

  const startAnimation = () => {
    if (!isAnimating) {
      isAnimating = true;
      animateRotateUp();
    }
  };

  startAnimation();
};

export const setToSad = (robotMouthTop: any, robotMouthBottom: any) => {
  return new Promise<void>((resolve) => {
    const animate = () => {
      if (robotMouthBottom.position.y < -0.24) {
        robotMouthBottom.position.y += 0.004;
      }
      if (robotMouthTop.position.y < 0.05) {
        robotMouthTop.position.y += 0.004;
      }
      if (
        robotMouthBottom.position.y >= -0.24 &&
        robotMouthTop.position.y >= 0.05
      ) {
        console.log("resolving");
        resolve(); // Resolve the promise when conditions are met
        return;
      } else {
        // Continue the animation
        requestAnimationFrame(animate);
      }
    };
    animate();
  });
};

export const thinkDown = (
  robotRightEyelidBottom: any,
  robotRightEyelidTop: any,
  robotLeftEyelidBottom: any,
  robotLeftEyelidTop: any,
  robotRef: any
) => {
  // Flag to control the animation loop

  return new Promise<void>((resolve) => {
    const blink = () => {
      if (robotRef.rotation.x < 0.2) {
        robotRef.rotation.x += 0.006;
      }

      if (robotLeftEyelidBottom.position.y < -0.0093) {
        robotLeftEyelidBottom.position.y += 0.004;
        robotLeftEyelidTop.position.y -= 0.004;
        robotRightEyelidBottom.position.y += 0.004;
        robotRightEyelidTop.position.y -= 0.004;
      }

      if (
        robotRef.rotation.x >= 0.2 &&
        robotLeftEyelidBottom.position.y >= -0.0093
      ) {
        // Set the flag to false to stop the animation loop
        console.log("exiting loop");
        resolve();
        return;
      }
      requestAnimationFrame(blink);
    };

    blink();
  });
};

export const bounceUp = (robotRef: any) => {
  return new Promise<void>((resolve) => {
    const bounce = () => {
      robotRef.position.y += 0.004;

      if (robotRef.position.y >= 0.2) {
        resolve();
        return;
      }
      requestAnimationFrame(bounce);
    };

    bounce();
  });
};

export const bounceDown = (robotRef: any) => {
  return new Promise<void>((resolve) => {
    const bounce = () => {
      robotRef.position.y -= 0.004;

      if (robotRef.position.y <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(bounce);
    };

    bounce();
  });
};
