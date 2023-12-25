import { useEffect, useRef } from "react";

type Props = {
  drawCommands: any;
};

const Whiteboard = ({ drawCommands }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const extractLineCommands = (drawLineCommands: any) => {
    drawLineCommands.forEach((commands: string) => {
      let commandsArray: any = commands
        .split("\\")
        .map((command: any) =>
          command.split("*").map((coord: any) => coord.split(","))
        )
        .map((command: any) =>
          command.map(([x, y]: string[]) => [parseInt(x), parseInt(y)])
        );

      console.log(commandsArray);
      drawToCanvas(commandsArray);
    });
  };

  const extractCircleCommands = (drawCircleCommands: any) => {
    drawCircleCommands.forEach((commands: string) => {
      let commandsArray: any = commands
        .split("\\")
        .map((command: any) =>
          command.split(",").map((value: string) => parseFloat(value))
        );

      console.log(commandsArray);
      drawCirclesToCanvas(commandsArray);
    });
  };

  const extractTextCommands = (drawTextCommands: any) => {
    console.log("text commands:", drawTextCommands);

    drawTextCommands.forEach((commands: string) => {
      let commandsArray = commands.split("\\").map((command: string) =>
        command.split(",").map((value: string) => {
          // Check if the value is wrapped in double quotes and remove them
          return value.startsWith('"') && value.endsWith('"')
            ? value.slice(1, -1)
            : parseFloat(value.trim());
        })
      );

      console.log(commandsArray);
      drawTextToCanvas(commandsArray);
    });
  };

  const eraseCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawToCanvas = (commandsArray: number[][][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    commandsArray.forEach((command) => {
      command.forEach(([startX, startY], index) => {
        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
        } else {
          ctx.lineTo(startX, startY);
          ctx.stroke();
        }
      });
    });
  };

  const drawCirclesToCanvas = (commandsArray: number[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    commandsArray.forEach(([x, y, radius, startAngle, endAngle]) => {
      console.log("end angle", endAngle);
      ctx.beginPath();
      if (endAngle % (2 * Math.PI) !== 0) {
        endAngle += Math.PI;
      }

      ctx.arc(x, y, radius, startAngle, 2 * endAngle);
      ctx.stroke();
    });
  };

  const drawTextToCanvas = (commandsArray: (string | number)[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    commandsArray.forEach(([text, x, y]) => {
      x = typeof x === "number" ? x : 0; // Default to 0 if x is not a number
      y = typeof y === "number" ? y : 0; // Default to 0 if y is not a number

      ctx.beginPath();
      ctx.font = "14px Arial"; // Set your desired font style
      ctx.fillText(String(text), x, y); // Ensure text is a string
    });
  };

  useEffect(() => {
    console.log(drawCommands);
    if (drawCommands.clearCanvas) {
      eraseCanvas();
    }
    if (drawCommands.drawCircles) {
      extractCircleCommands(drawCommands.drawCircles);
    }
    if (drawCommands.drawLines) {
      extractLineCommands(drawCommands.drawLines);
    }
    if (drawCommands.addText) {
      extractTextCommands(drawCommands.addText);
    }
  }, [drawCommands]);

  return (
    <div className="flex flex-col absolute right-20 top-40 bg-white p-[10px] rounded justify-center items-center gap-5">
      <h1 className="bg-secondary-50 w-fit text-black font-bold">CANVAS</h1>
      <canvas
        ref={canvasRef}
        className="bg-white"
        width={500}
        height={500}
      ></canvas>
    </div>
  );
};

export default Whiteboard;
