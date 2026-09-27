const express = require("express");
const path = require("path");

const app = express();

app.use(express.json()); // <-- required for JSON body
app.use(express.urlencoded({ extended: true })); // optional for form data

app.use(express.static(path.join(__dirname, "public")));


// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Current live rate
let currentRate = {
    value: 100,
    updated: new Date()
};


// POST URL: Update live rate
app.post("/rate/update", (req, res) => {

    console.log(req.body); // check incoming data

    const { rate } = req.body || {};

    if (rate === undefined) {
        return res.status(400).json({
            error: "Rate is required"
        });
    }

    currentRate = {
        value: Number(rate),
        updated: new Date()
    };

    res.json({
        message: "Rate updated successfully",
        rate: currentRate.value,
        updated: currentRate.updated
    });
});


// GET URL: Get current rate
app.get("/rate", (req, res) => {
    res.json(currentRate);
});

app.get("/updates", (req, res) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const timer = setInterval(() => {

        const data = {
            day: new Date().toLocaleDateString("en-US", {
                weekday: "long"
            }),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            value: currentRate.value
        };

        console.log("Sending rate:", currentRate.value);

        res.write(`data: ${JSON.stringify(data)}\n\n`);

    }, 1000);


    req.on("close", () => {
        clearInterval(timer);
        res.end();
    });

});

app.listen(9073, "0.0.0.0", () => {
    console.log("Server running on port 9073");
});