const express = require("express");
const cors = require("cors");
const { SerialPort, ReadlineParser } = require("serialport");

const app = express();
app.use(cors());
app.use(express.json());

const arduinoPort = new SerialPort({
  path: "/dev/tty.usbmodem1301", // Update your port accordingly
  baudRate: 9600,
  autoOpen: false,
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

arduinoPort.open((err) => {
  if (err) {
    console.error("Failed to open serial port:", err.message);
  } else {
    console.log("Serial port connected to Arduino");
  }
});

parser.on("data", (data) => {
  console.log("Received from Arduino:", data.trim());
});

app.post("/trigger", (req, res) => {
  const command = req.body.command;
  console.log("Sending command:", command);

  if (!arduinoPort.isOpen) {
    return res.status(500).json({ message: "Arduino port not open" });
  }

  if (command !== "TRIGGER" && command !== "START") {
    return res.status(400).json({ message: "Invalid command" });
  }

  arduinoPort.write(command + "\n", (err) => {
    if (err) {
      console.error("Error writing to Arduino:", err);
      return res.status(500).json({ message: "Failed to send command" });
    }
    console.log(`Command "${command}" sent successfully`);
    res.json({ message: `Command "${command}" sent` });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});